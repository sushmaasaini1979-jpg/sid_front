# 🚀 Supabase Setup Guide for SIDDHI Food Ordering System

## Step 1: Create Supabase Project

1. **Go to [supabase.com](https://supabase.com)**
2. **Sign up/Login** and click "New Project"
3. **Fill in project details:**
   - Name: `siddhi-food-ordering`
   - Database Password: `[Choose a strong password]`
   - Region: Choose closest to your location
4. **Wait for project creation** (2-3 minutes)

## Step 2: Get Your Credentials

After project creation, go to **Settings > API** and copy:

- **Project URL**: `https://[your-project-ref].supabase.co`
- **Anon Key**: `[your-anon-key]`
- **Service Role Key**: `[your-service-role-key]`

## Step 3: Get Database Connection String

Go to **Settings > Database** and copy the connection string:
```
postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
```

## Step 4: Create Environment File

Create `.env` file in `siddhi-backend/` directory:

```env
# Supabase Configuration
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
SUPABASE_ANON_KEY="[YOUR-ANON-KEY]"
SUPABASE_SERVICE_ROLE_KEY="[YOUR-SERVICE-ROLE-KEY]"

# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3002

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-here"
```

## Step 5: Install Dependencies

```bash
cd siddhi-backend
npm install @supabase/supabase-js
```

## Step 6: Update Prisma Schema

Replace `prisma/schema.prisma` with `prisma/schema.supabase.prisma`:

```bash
cp prisma/schema.supabase.prisma prisma/schema.prisma
```

## Step 7: Run Database Migration

```bash
npx prisma generate
npx prisma db push
```

## Step 8: Seed Initial Data

```bash
npx prisma db seed
```

## Step 9: Start the Server

```bash
npm run dev
```

## 🎯 What This Gives You:

✅ **Real PostgreSQL Database** - All data permanently stored
✅ **Real-time Subscriptions** - Instant updates to admin dashboard
✅ **Customer Management** - Real customer data with order history
✅ **Sales Analytics** - Live sales data and reports
✅ **Scalable Infrastructure** - Production-ready database
✅ **Built-in Authentication** - Ready for user management
✅ **Automatic Backups** - Data safety guaranteed

## 🔄 Real-time Flow:

1. **Customer places order** → Stored in Supabase
2. **Supabase triggers** → Real-time update to admin
3. **Admin sees changes** → Instantly in dashboard
4. **Customer data** → Automatically stored and tracked
5. **Sales analytics** → Updated in real-time

## 📊 Database Tables Created:

- `stores` - Restaurant/store information
- `customers` - Customer details and history
- `orders` - Order information with status tracking
- `order_items` - Individual items in each order
- `menu_items` - Menu with prices and availability
- `categories` - Menu categories
- `coupons` - Discount codes and offers
- `inventory` - Stock management
- `admins` - Admin user management
- `notifications` - System notifications

## 🚀 Next Steps:

After setup, your system will have:
- Real customer data storage
- Live order tracking
- Real-time admin updates
- Complete sales analytics
- Production-ready infrastructure

Ready to implement? Let me know when you have your Supabase credentials! 🎉
