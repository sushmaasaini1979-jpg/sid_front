# SIDDHI Setup Commands

This document provides exact commands to set up and run the SIDDHI food ordering system locally and deploy to production.

## Local Development Setup

### 1. Prerequisites
```bash
# Check Node.js version (should be 18+)
node --version

# Check npm version
npm --version

# Install global dependencies (if needed)
npm install -g prisma
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd siddhi-backend

# Install dependencies
npm install

# Copy environment file
cp env.example .env

# Edit .env file with your configuration
# DATABASE_URL="postgresql://username:password@localhost:5432/siddhi_db"
# JWT_SECRET="your-super-secret-jwt-key-here"
# RAZORPAY_KEY_ID="rzp_test_your_key_id"
# RAZORPAY_KEY_SECRET="your_razorpay_key_secret"
# etc.

# Generate Prisma client
npm run db:generate

# Push schema to database (creates tables)
npm run db:push

# Seed database with sample data
npm run db:seed

# Start development server
npm run dev
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory (in new terminal)
cd siddhi-frontend

# Install dependencies
npm install

# Copy environment file
cp env.example .env

# Edit .env file with your configuration
# VITE_API_URL=http://localhost:5000/api
# VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id

# Start development server
npm run dev
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/health
- **Admin Login**: http://localhost:3000/admin/login
  - Email: `admin@siddhi.com`
  - Password: `admin123`

## Supabase Setup

### 1. Create Supabase Project

```bash
# Install Supabase CLI (optional)
npm install -g supabase

# Login to Supabase
supabase login

# Create new project (or use web interface)
supabase projects create siddhi-food-ordering
```

### 2. Get Database Connection String

```bash
# Get connection string from Supabase dashboard
# Go to Settings > Database > Connection string
# Copy the connection string and update your .env file
```

### 3. Run Migrations on Supabase

```bash
# Navigate to backend directory
cd siddhi-backend

# Update DATABASE_URL in .env to point to Supabase
# DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# Push schema to Supabase
npm run db:push

# Seed with sample data
npm run db:seed
```

## Razorpay Setup

### 1. Create Razorpay Account

```bash
# Go to https://razorpay.com and create account
# Complete KYC verification
# Get API keys from Dashboard > Settings > API Keys
```

### 2. Test Keys Setup

```bash
# For development, use test keys:
# RAZORPAY_KEY_ID="rzp_test_..."
# RAZORPAY_KEY_SECRET="..."

# Update your .env files with test keys
```

### 3. Webhook Setup (for production)

```bash
# In Razorpay dashboard, go to Settings > Webhooks
# Add webhook URL: https://your-backend-url.com/api/payments/webhook
# Select events: payment.captured, payment.failed, order.paid
# Copy webhook secret to RAZORPAY_WEBHOOK_SECRET
```

## Production Deployment

### 1. Backend Deployment (Render)

```bash
# Create Render account and connect GitHub repository
# Set build command: npm install && npm run db:generate
# Set start command: npm start
# Add environment variables in Render dashboard

# Environment variables for Render:
NODE_ENV=production
DATABASE_URL=your_supabase_connection_string
JWT_SECRET=your_production_jwt_secret
RAZORPAY_KEY_ID=rzp_live_your_live_key_id
RAZORPAY_KEY_SECRET=your_live_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
FRONTEND_URL=https://your-frontend-domain.netlify.app
```

### 2. Frontend Deployment (Netlify)

```bash
# Create Netlify account and connect GitHub repository
# Set base directory: siddhi-frontend
# Set build command: npm run build
# Set publish directory: siddhi-frontend/dist

# Environment variables for Netlify:
VITE_API_URL=https://your-backend-url.onrender.com/api
VITE_RAZORPAY_KEY_ID=rzp_live_your_live_key_id
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Migration (Production)

```bash
# Connect to production database
# Update DATABASE_URL in production environment
# Run migrations:

npm run db:push
npm run db:seed
```

## GitHub Actions Setup

### 1. Repository Secrets

```bash
# Add these secrets in GitHub repository settings:

# Frontend secrets:
NETLIFY_AUTH_TOKEN=your_netlify_token
NETLIFY_SITE_ID=your_netlify_site_id
VITE_API_URL=https://your-backend-url.onrender.com/api
VITE_RAZORPAY_KEY_ID=rzp_live_your_live_key_id

# Backend secrets:
RENDER_SERVICE_ID=your_render_service_id
RENDER_API_KEY=your_render_api_key
```

### 2. Enable GitHub Actions

```bash
# GitHub Actions will automatically run on push to main branch
# Check Actions tab in GitHub repository for deployment status
```

## Testing Commands

### 1. Backend Testing

```bash
# Navigate to backend directory
cd siddhi-backend

# Run tests
npm test

# Run linter
npm run lint

# Fix linting issues
npm run lint:fix
```

### 2. Frontend Testing

```bash
# Navigate to frontend directory
cd siddhi-frontend

# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Build for production
npm run build

# Preview production build
npm run preview
```

## Database Management

### 1. Prisma Commands

```bash
# Generate Prisma client
npm run db:generate

# Push schema changes
npm run db:push

# Create migration
npm run db:migrate

# Reset database (development only)
npx prisma migrate reset

# Open Prisma Studio
npm run db:studio

# Seed database
npm run db:seed
```

### 2. Database Queries

```bash
# Connect to database
npx prisma db pull

# Deploy migrations to production
npx prisma migrate deploy
```

## Monitoring and Maintenance

### 1. Health Checks

```bash
# Check backend health
curl https://your-backend-url.onrender.com/health

# Check frontend
curl https://your-frontend-domain.netlify.app
```

### 2. Logs

```bash
# View Render logs
# Go to Render dashboard > Service > Logs

# View Netlify logs
# Go to Netlify dashboard > Site > Functions > Logs
```

### 3. Backup

```bash
# Supabase provides automatic backups
# Manual backup (if needed):
pg_dump "your_database_url" > backup.sql

# Restore backup:
psql "your_database_url" < backup.sql
```

## Troubleshooting

### 1. Common Issues

```bash
# Backend not starting
# Check environment variables
# Verify database connection
# Check port availability

# Frontend not loading
# Check environment variables
# Verify API URL
# Check build process

# Database connection issues
# Verify connection string
# Check database permissions
# Ensure database is running
```

### 2. Reset Everything

```bash
# Reset backend
cd siddhi-backend
rm -rf node_modules
npm install
npm run db:push
npm run db:seed

# Reset frontend
cd siddhi-frontend
rm -rf node_modules
npm install
npm run build
```

## Quick Start Script

Create a `setup.sh` script for quick setup:

```bash
#!/bin/bash

echo "Setting up SIDDHI Food Ordering System..."

# Backend setup
echo "Setting up backend..."
cd siddhi-backend
npm install
cp env.example .env
echo "Please edit .env file with your configuration"
npm run db:generate
npm run db:push
npm run db:seed

# Frontend setup
echo "Setting up frontend..."
cd ../siddhi-frontend
npm install
cp env.example .env
echo "Please edit .env file with your configuration"

echo "Setup complete! Start servers with:"
echo "Backend: cd siddhi-backend && npm run dev"
echo "Frontend: cd siddhi-frontend && npm run dev"
```

Make it executable:
```bash
chmod +x setup.sh
./setup.sh
```

This comprehensive setup guide should help you get the SIDDHI food ordering system running locally and deployed to production!
