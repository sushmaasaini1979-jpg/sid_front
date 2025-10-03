# Supabase Setup Guide

## Step 1: Get Your Supabase Credentials

### 1.1 Database Connection String
1. Go to your Supabase project: https://supabase.com/dashboard/project/imhkrycglxvjlpseieqv
2. Navigate to **Settings** → **Database**
3. Find your **Database Password** (if you don't remember it, you can reset it)
4. Your connection string should be:
   ```
   postgresql://postgres:[YOUR_PASSWORD]@db.imhkrycglxvjlpseieqv.supabase.co:5432/postgres
   ```

### 1.2 API Keys
1. Go to **Settings** → **API**
2. Copy your **Project URL**: `https://imhkrycglxvjlpseieqv.supabase.co`
3. Copy your **anon public** key
4. Copy your **service_role** key (keep this secret!)

## Step 2: Update Backend Environment

Replace the content of `siddhi-backend/.env` with:

```bash
# Database - Supabase PostgreSQL
DATABASE_URL="postgresql://postgres:[YOUR_PASSWORD]@db.imhkrycglxvjlpseieqv.supabase.co:5432/postgres"

# Supabase Configuration
SUPABASE_URL="https://imhkrycglxvjlpseieqv.supabase.co"
SUPABASE_ANON_KEY="[YOUR_ANON_KEY]"
SUPABASE_SERVICE_ROLE_KEY="[YOUR_SERVICE_ROLE_KEY]"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key-here"

# Server Configuration
PORT=3001
NODE_ENV="development"
FRONTEND_URL="http://localhost:3002"

# Razorpay Configuration
RAZORPAY_KEY_ID="rzp_test_your_key_id"
RAZORPAY_KEY_SECRET="your_razorpay_key_secret"
RAZORPAY_WEBHOOK_SECRET="your_webhook_secret"

# Redis Configuration (optional)
REDIS_URL="redis://localhost:6379"

# Twilio Configuration (for SMS/WhatsApp notifications)
TWILIO_ACCOUNT_SID="your_twilio_account_sid"
TWILIO_AUTH_TOKEN="your_twilio_auth_token"
TWILIO_PHONE_NUMBER="+1234567890"

# WhatsApp Business API (optional)
WHATSAPP_ACCESS_TOKEN="your_whatsapp_access_token"
WHATSAPP_PHONE_NUMBER_ID="your_whatsapp_phone_number_id"

# Email Configuration (optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your_email@gmail.com"
SMTP_PASS="your_app_password"

# File Upload (optional - for menu item images)
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=5242880

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
ALLOWED_ORIGINS="http://localhost:3002,https://your-frontend-domain.com"
```

## Step 3: Update Frontend Environment

Update `siddhi-frontend/.env` with:

```bash
# API Configuration
VITE_API_URL=http://localhost:3001/api

# Razorpay Configuration
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id

# Supabase Configuration
VITE_SUPABASE_URL=https://imhkrycglxvjlpseieqv.supabase.co
VITE_SUPABASE_ANON_KEY=[YOUR_ANON_KEY]

# App Configuration
VITE_APP_NAME=SIDDHI
VITE_APP_DESCRIPTION=BITE INTO HAPPINESS
```

## Step 4: Setup Database Schema

1. Generate Prisma client:
   ```bash
   cd siddhi-backend
   npx prisma generate
   ```

2. Push schema to Supabase:
   ```bash
   npx prisma db push
   ```

3. Seed the database:
   ```bash
   node prisma/seed.js
   ```

## Step 5: Restart Servers

1. Stop current servers (Ctrl+C)
2. Restart backend:
   ```bash
   cd siddhi-backend
   npm run dev
   ```
3. Restart frontend:
   ```bash
   cd siddhi-frontend
   npm run dev
   ```

## Step 6: Verify Setup

1. Check backend logs - should show "🔗 Using Supabase for real-time features"
2. Visit http://localhost:3002/checkout
3. Fill in customer information and place an order
4. Check your Supabase dashboard → Table Editor → customers table
5. You should see the customer data stored in Supabase!

## Troubleshooting

### If you get connection errors:
1. Verify your database password is correct
2. Check that your IP is allowed in Supabase (Settings → Database → Network Restrictions)
3. Ensure your API keys are correct

### If schema push fails:
1. Check if tables already exist in Supabase
2. You may need to drop existing tables first (be careful!)
3. Or modify the schema to match existing structure

## Next Steps

Once configured, your customer data will be stored in Supabase instead of the local SQLite database, and you'll have access to:
- Real-time database updates
- Built-in authentication (if needed later)
- Database backups and monitoring
- Scalable PostgreSQL database
