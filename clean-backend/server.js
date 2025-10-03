const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
const Redis = require('redis');
require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const { supabase, supabaseAdmin } = require('./lib/supabase');
const realtimeService = require('./lib/realtime');
const { router: authRoutes } = require('./routes/auth');
const menuRoutes = require('./routes/menu');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payments');
const adminRoutes = require('./routes/admin');
const adminSupabaseRoutes = require('./routes/admin-supabase');
const couponRoutes = require('./routes/coupons');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  },
  pingTimeout: 60000,
  pingInterval: 30000,
  upgradeTimeout: 30000,
  allowEIO3: true,
  transports: ['websocket', 'polling']
});

const prisma = new PrismaClient();

// Redis client for pub/sub (optional)
let redisClient = null;

if (process.env.REDIS_URL) {
  try {
    redisClient = Redis.createClient({ 
      url: process.env.REDIS_URL, 
      socket: {
        connectTimeout: 5000, // 5 second timeout
        reconnectStrategy: (retries) => {
          if (retries > 3) {
            console.log('🔴 Redis connection failed after multiple attempts');
            return new Error('Failed to connect to Redis');
          }
          return Math.min(retries * 1000, 3000);
        }
      }
    });
    
    redisClient.connect().then(() => {
      console.log('🟢 Redis connected successfully');
    }).catch(error => {
      console.log('🔴 Redis connection error (optional feature):', error.message);
      redisClient = null; // Set to null so routes know Redis is unavailable
    });
  } catch (error) {
    console.log('🔴 Redis initialization error (optional feature):', error.message);
    redisClient = null;
  }
} else {
  console.log('ℹ️ Redis URL not configured - Redis features will be disabled');
}

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));

// Rate limiting - More generous limits for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs (increased for development)
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin-supabase', adminSupabaseRoutes);
app.use('/api/coupons', couponRoutes);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('✅ Client connected:', socket.id);

  // Join store room for real-time updates
  socket.on('join-store', (storeSlug) => {
    socket.join(`store-${storeSlug}`);
    console.log(`🏪 Client ${socket.id} joined store: ${storeSlug}`);
    
    // Send confirmation
    socket.emit('joined-store', { storeSlug, message: 'Successfully joined store room' });
  });

  // Join admin room for admin-specific updates
  socket.on('join-admin', (storeSlug) => {
    socket.join(`admin-${storeSlug}`);
    console.log(`👨‍💼 Admin client ${socket.id} joined admin room: ${storeSlug}`);
    
    // Send confirmation
    socket.emit('joined-admin', { storeSlug, message: 'Successfully joined admin room' });
  });

  // Join order room for order-specific updates
  socket.on('join-order', (orderId) => {
    socket.join(`order-${orderId}`);
    console.log(`📦 Client ${socket.id} joined order: ${orderId}`);
  });

  // Handle ping/pong for connection health
  socket.on('ping', () => {
    socket.emit('pong');
  });

  socket.on('disconnect', (reason) => {
    console.log('🔌 Client disconnected:', socket.id, 'Reason:', reason);
  });

  socket.on('error', (error) => {
    console.error('❌ Socket error:', error);
  });
});

// Make services available to routes
app.set('io', io);
app.set('prisma', prisma);
app.set('redis', redisClient);
app.set('supabase', supabase);
app.set('supabaseAdmin', supabaseAdmin);
app.set('realtimeService', realtimeService);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  if (redisClient) {
    await redisClient.quit();
  }
  server.close(() => {
    console.log('Process terminated');
  });
});

module.exports = { app, server, io };
