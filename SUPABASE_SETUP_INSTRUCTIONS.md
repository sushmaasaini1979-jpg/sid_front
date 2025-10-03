# Supabase Setup Instructions

## Current Status
✅ Backend and frontend servers are running
✅ API endpoints are working with fallback data
❌ Supabase database tables need to be created
❌ API keys need to be verified

## Step 1: Create Database Tables

Go to your Supabase dashboard → SQL Editor and run this SQL:

```sql
-- Create tables
CREATE TABLE IF NOT EXISTS public.stores (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  store_id TEXT NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(store_id, slug)
);

CREATE TABLE IF NOT EXISTS public.menu_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  size TEXT,
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  is_veg BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  category_id TEXT NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  store_id TEXT NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  email TEXT,
  address TEXT,
  is_blocked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  customer_id TEXT NOT NULL REFERENCES public.customers(id),
  store_id TEXT NOT NULL REFERENCES public.stores(id),
  status TEXT DEFAULT 'PENDING',
  payment_method TEXT,
  payment_status TEXT DEFAULT 'PENDING',
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  subtotal NUMERIC(10,2) NOT NULL,
  tax NUMERIC(10,2) DEFAULT 0,
  discount NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(10,2) NOT NULL,
  coupon_id TEXT,
  notes TEXT,
  estimated_time INTEGER,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  menu_item_id TEXT NOT NULL REFERENCES public.menu_items(id),
  quantity INTEGER NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  notes TEXT
);

-- Enable RLS
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Create read policies for anon users
CREATE POLICY IF NOT EXISTS "anon_read_stores" ON public.stores FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "anon_read_categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "anon_read_menu_items" ON public.menu_items FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "anon_read_customers" ON public.customers FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "anon_read_orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "anon_read_order_items" ON public.order_items FOR SELECT USING (true);

-- Create write policies for service role
CREATE POLICY IF NOT EXISTS "service_write_stores" ON public.stores FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "service_write_categories" ON public.categories FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "service_write_menu_items" ON public.menu_items FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "service_write_customers" ON public.customers FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "service_write_orders" ON public.orders FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "service_write_order_items" ON public.order_items FOR ALL USING (true);
```

## Step 2: Seed Data

After creating the tables, run this script to populate them:

```bash
cd clean-backend
node setup-complete.js
```

## Step 3: Verify API Keys

Check your Supabase dashboard → Settings → API to verify the API keys are correct.

## Current Working Status

✅ **Backend Server**: Running on http://localhost:5001
✅ **Frontend Server**: Running on http://localhost:3000
✅ **Customer API**: Working with fallback data
✅ **Admin Panel**: Accessible at http://localhost:3000/admin

## Test Endpoints

- Health Check: http://localhost:5001/health
- Customers: http://localhost:5001/api/admin-supabase/customers?store=siddhi
- Dashboard: http://localhost:5001/api/admin-supabase/dashboard?store=siddhi

## Next Steps

1. Create the database tables using the SQL above
2. Run the seed script to populate data
3. Verify the admin panel shows real data from Supabase
4. Test real-time updates

The system is currently working with fallback data, so you can see the admin panel functionality even before setting up the database.
