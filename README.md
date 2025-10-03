# SIDDHI Backend API

A comprehensive food ordering system backend built with Node.js, Express, Prisma, and Socket.IO.

## Features

- 🍽️ **Menu Management** - Complete menu with categories and items
- 📱 **Order Processing** - Real-time order management with status tracking
- 💳 **Payment Integration** - Razorpay payment gateway integration
- 🎫 **Coupon System** - Discount codes and promotional offers
- 📊 **Inventory Management** - Stock tracking and low-stock alerts
- 🔔 **Notifications** - SMS/WhatsApp notifications (Twilio integration)
- 📈 **Analytics** - Sales reports and performance metrics
- 🔐 **Admin Authentication** - JWT-based admin authentication
- ⚡ **Real-time Updates** - Socket.IO for live order status updates
- 📱 **QR Code Generation** - Generate QR codes for menu access

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Prisma
- **Real-time**: Socket.IO
- **Authentication**: JWT
- **Payments**: Razorpay
- **Notifications**: Twilio (SMS/WhatsApp)
- **Cache**: Redis (optional)

## Prerequisites

- Node.js 18 or higher
- PostgreSQL database (Supabase recommended)
- Redis (optional, for caching)
- Razorpay account
- Twilio account (for notifications)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd siddhi-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/siddhi_db"
   JWT_SECRET="your-super-secret-jwt-key-here"
   RAZORPAY_KEY_ID="rzp_test_your_key_id"
   RAZORPAY_KEY_SECRET="your_razorpay_key_secret"
   # ... other variables
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   
   # Seed the database
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:5000`

## API Endpoints

### Public Endpoints

- `GET /api/menu?store=slug` - Get menu for a store
- `GET /api/menu/search?store=slug&q=query` - Search menu items
- `POST /api/orders` - Create a new order
- `GET /api/orders/:id` - Get order details
- `POST /api/payments/create-order` - Create Razorpay order
- `POST /api/payments/verify` - Verify payment
- `POST /api/payments/webhook` - Razorpay webhook

### Admin Endpoints (Authentication Required)

- `POST /api/auth/login` - Admin login
- `POST /api/auth/register` - Admin registration
- `GET /api/auth/me` - Get current admin info
- `GET /api/admin/dashboard` - Dashboard metrics
- `GET /api/admin/orders` - List orders
- `PUT /api/admin/orders/:id/status` - Update order status
- `GET /api/admin/customers` - List customers
- `GET /api/coupons` - List coupons
- `POST /api/coupons` - Create coupon
- `GET /api/inventory` - List inventory
- `POST /api/inventory/:id/restock` - Restock inventory
- `GET /api/notifications` - List notifications
- `POST /api/notifications/send` - Send notification
- `GET /api/qr/generate` - Generate QR code

## Database Schema

The application uses the following main entities:

- **Store** - Restaurant/store information
- **Category** - Menu categories (Starters, Fast Food, etc.)
- **MenuItem** - Individual menu items with pricing
- **Inventory** - Stock levels for menu items
- **Customer** - Customer information
- **Order** - Order details and status
- **OrderItem** - Individual items in an order
- **Coupon** - Discount codes and promotions
- **Admin** - Admin users for store management
- **Notification** - Notification history

## Real-time Features

The application uses Socket.IO for real-time updates:

- **Order Updates** - Live order status changes
- **Payment Confirmations** - Real-time payment status
- **Inventory Alerts** - Low stock notifications
- **Admin Notifications** - New orders and updates

### Socket Events

- `order.created` - New order placed
- `order.updated` - Order status changed
- `payment.completed` - Payment successful
- `payment.failed` - Payment failed
- `inventory.low` - Low stock alert

## Payment Integration

### Razorpay Setup

1. Create a Razorpay account
2. Get your API keys from the dashboard
3. Set up webhook endpoints
4. Configure test/live keys in environment variables

### Webhook Events

The application handles these Razorpay webhook events:
- `payment.captured`
- `payment.failed`
- `order.paid`

## Notification System

### Twilio Integration

1. Create a Twilio account
2. Get your Account SID and Auth Token
3. Configure phone numbers for SMS/WhatsApp
4. Set up environment variables

### Notification Types

- **Order Updates** - Status change notifications
- **Payment Confirmations** - Payment success/failure
- **Promotional** - Marketing messages
- **System** - System notifications

## Deployment

### Environment Variables for Production

```env
NODE_ENV="production"
DATABASE_URL="your-production-database-url"
JWT_SECRET="your-production-jwt-secret"
RAZORPAY_KEY_ID="rzp_live_your_live_key_id"
RAZORPAY_KEY_SECRET="your_live_razorpay_secret"
FRONTEND_URL="https://your-frontend-domain.com"
```

### Render Deployment

1. Connect your GitHub repository to Render
2. Set environment variables in Render dashboard
3. Configure build command: `npm install && npm run db:generate && npm run db:push`
4. Set start command: `npm start`

### Health Check

The application provides a health check endpoint:
```
GET /health
```

## Development

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Prisma Studio
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors

### Database Management

```bash
# Reset database (development only)
npx prisma migrate reset

# Create new migration
npx prisma migrate dev --name migration_name

# Deploy migrations to production
npx prisma migrate deploy
```

## Security

- JWT authentication for admin routes
- Rate limiting on API endpoints
- CORS configuration
- Input validation with express-validator
- Helmet for security headers
- Payment webhook signature verification

## Monitoring

- Health check endpoint for monitoring
- Error logging and handling
- Request/response logging
- Database query logging (development)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions, please contact the development team or create an issue in the repository.
