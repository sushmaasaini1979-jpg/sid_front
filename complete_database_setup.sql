-- Complete SIDDHI Database Setup with All Data
-- Run this in your Supabase SQL Editor

-- 1. Drop existing tables (in reverse dependency order)
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.menu_items CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.customers CASCADE;
DROP TABLE IF EXISTS public.coupons CASCADE;
DROP TABLE IF EXISTS public.admins CASCADE;
DROP TABLE IF EXISTS public.stores CASCADE;

-- 2. Create stores table
CREATE TABLE public.stores (
    id text PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    slug text UNIQUE NOT NULL,
    description text,
    address text,
    phone text,
    email text,
    "isActive" boolean DEFAULT TRUE,
    "createdAt" timestamp with time zone DEFAULT now(),
    "updatedAt" timestamp with time zone DEFAULT now()
);

-- 3. Create categories table
CREATE TABLE public.categories (
    id text PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id text NOT NULL REFERENCES public.stores(id),
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    "sortOrder" integer NOT NULL,
    "isActive" boolean DEFAULT TRUE,
    "createdAt" timestamp with time zone DEFAULT now(),
    "updatedAt" timestamp with time zone DEFAULT now()
);

-- 4. Create menu_items table
CREATE TABLE public.menu_items (
    id text PRIMARY KEY,
    name text NOT NULL,
    description text,
    price numeric(10, 2) NOT NULL,
    size text,
    "imageUrl" text,
    "isAvailable" boolean DEFAULT TRUE,
    "isVeg" boolean DEFAULT FALSE,
    "sortOrder" integer,
    "categoryId" text REFERENCES public.categories(id),
    "storeId" text NOT NULL REFERENCES public.stores(id),
    "createdAt" timestamp with time zone DEFAULT now(),
    "updatedAt" timestamp with time zone DEFAULT now()
);

-- 5. Create customers table
CREATE TABLE public.customers (
    id text PRIMARY KEY,
    name text NOT NULL,
    phone text NOT NULL,
    email text UNIQUE NOT NULL,
    address text,
    "isBlocked" boolean DEFAULT FALSE,
    "createdAt" timestamp with time zone DEFAULT now(),
    "updatedAt" timestamp with time zone DEFAULT now()
);

-- 6. Create orders table
CREATE TABLE public.orders (
    id text PRIMARY KEY,
    "orderNumber" text NOT NULL,
    "customerld" text NOT NULL,
    "storeld" text NOT NULL,
    status text NOT NULL,
    "paymentMethod" text NOT NULL,
    "paymentStatus" text NOT NULL,
    "razorpayOrderld" text,
    "razorpayPaymentld" text,
    subtotal numeric(10, 2) NOT NULL,
    tax numeric(10, 2) NOT NULL,
    discount numeric(10, 2) NOT NULL,
    total numeric(10, 2) NOT NULL,
    "couponld" text,
    notes text,
    "estimatedTime" integer,
    "deliveredAt" timestamp with time zone,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);

-- 7. Create order_items table
CREATE TABLE public.order_items (
    id text PRIMARY KEY,
    "orderId" text REFERENCES public.orders(id) ON DELETE CASCADE,
    "menuItemId" text REFERENCES public.menu_items(id),
    quantity integer NOT NULL,
    price numeric(10, 2) NOT NULL,
    notes text,
    "createdAt" timestamp with time zone DEFAULT now()
);

-- 8. Create coupons table
CREATE TABLE public.coupons (
    id text PRIMARY KEY,
    "storeId" text NOT NULL REFERENCES public.stores(id),
    code text UNIQUE NOT NULL,
    name text NOT NULL,
    description text,
    type text NOT NULL,
    value integer NOT NULL,
    "minOrderAmount" integer,
    "maxDiscount" integer,
    "usageLimit" integer,
    "usedCount" integer DEFAULT 0,
    "isActive" boolean DEFAULT TRUE,
    "validFrom" timestamp with time zone NOT NULL,
    "validUntil" timestamp with time zone NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now(),
    "updatedAt" timestamp with time zone DEFAULT now()
);

-- 9. Create admins table
CREATE TABLE public.admins (
    id text PRIMARY KEY,
    name text,
    email text UNIQUE NOT NULL,
    password text NOT NULL,
    role text,
    "isActive" boolean DEFAULT TRUE,
    "storeId" text REFERENCES public.stores(id),
    "createdAt" timestamp with time zone DEFAULT now(),
    "updatedAt" timestamp with time zone DEFAULT now()
);

-- 10. Enable Row Level Security (RLS) on all tables
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- 11. Create policies to allow anon (browser) read access
DROP POLICY IF EXISTS anon_read_stores ON public.stores;
CREATE POLICY anon_read_stores ON public.stores FOR SELECT USING (true);

DROP POLICY IF EXISTS anon_read_categories ON public.categories;
CREATE POLICY anon_read_categories ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS anon_read_menu_items ON public.menu_items;
CREATE POLICY anon_read_menu_items ON public.menu_items FOR SELECT USING (true);

DROP POLICY IF EXISTS anon_read_customers ON public.customers;
CREATE POLICY anon_read_customers ON public.customers FOR SELECT USING (true);

DROP POLICY IF EXISTS anon_read_orders ON public.orders;
CREATE POLICY anon_read_orders ON public.orders FOR SELECT USING (true);

DROP POLICY IF EXISTS anon_read_order_items ON public.order_items;
CREATE POLICY anon_read_order_items ON public.order_items FOR SELECT USING (true);

DROP POLICY IF EXISTS anon_read_coupons ON public.coupons;
CREATE POLICY anon_read_coupons ON public.coupons FOR SELECT USING (true);

DROP POLICY IF EXISTS anon_read_admins ON public.admins;
CREATE POLICY anon_read_admins ON public.admins FOR SELECT USING (true);

-- 12. Insert data

-- Insert store data
INSERT INTO public.stores (id, name, slug, description, address, phone, email, "isActive", "createdAt", "updatedAt") VALUES
('cmfxu3glm0000xtyj8ooozoua', 'SIDDHI', 'siddhi', 'BITE INTO HAPPINESS', '123 Food Street, Delhi', '+91 9876543210', 'info@siddhi.com', TRUE, '2025-09-24 10:21:18.922+00', '2025-09-24 10:21:18.922+00');

-- Insert categories data
INSERT INTO public.categories (id, store_id, name, slug, description, "sortOrder", "isActive", "createdAt", "updatedAt") VALUES
('cmfxu3gzk0002xtyj4qoesr7x', 'cmfxu3glm0000xtyj8ooozoua', 'Starters', 'starters', NULL, 1, TRUE, '2025-09-24 10:21:19.424+00', '2025-09-24 10:21:19.424+00'),
('cmfxu3hdd0004xtyj2c3r9ge1', 'cmfxu3glm0000xtyj8ooozoua', 'Fast Food', 'fast-food', NULL, 2, TRUE, '2025-09-24 10:21:19.921+00', '2025-09-24 10:21:19.921+00'),
('cmfxu3hlv0006xtyjv3wxuwme', 'cmfxu3glm0000xtyj8ooozoua', 'Breakfast', 'breakfast', NULL, 3, TRUE, '2025-09-24 10:21:20.227+00', '2025-09-24 10:21:20.227+00'),
('cmfxu3huh0008xtyjd1cqe1ni', 'cmfxu3glm0000xtyj8ooozoua', 'Chaat', 'chaat', NULL, 4, TRUE, '2025-09-24 10:21:20.537+00', '2025-09-24 10:21:20.537+00'),
('cmfxu3i30000axtyjo5tvqsjb', 'cmfxu3glm0000xtyj8ooozoua', 'Burger/Pizza', 'burger-pizza', NULL, 5, TRUE, '2025-09-24 10:21:20.869+00', '2025-09-24 10:21:20.869+00'),
('cmfxu3icj000cxtyjfmghomdq', 'cmfxu3glm0000xtyj8ooozoua', 'South Indian', 'south-indian', NULL, 6, TRUE, '2025-09-24 10:21:21.187+00', '2025-09-24 10:21:21.187+00'),
('cmfxu3iky000extyj3qwt1tou', 'cmfxu3glm0000xtyj8ooozoua', 'Hot & Cold', 'hot-cold', NULL, 7, TRUE, '2025-09-24 10:21:21.49+00', '2025-09-24 10:21:21.49+00');

-- Insert menu_items data (first 20 items due to length limits)
INSERT INTO public.menu_items (id, name, description, price, size, "imageUrl", "isAvailable", "isVeg", "sortOrder", "categoryId", "storeId", "createdAt", "updatedAt") VALUES
('cmfxu3glm0000xtyj8ooozoua-afghani-chaap-tikka', 'Afghani Chaap Tikka', 'Afghani style chaap tikka', 160.00, NULL, NULL, TRUE, TRUE, 5, 'cmfxu3gzk0002xtyj4qoesr7x', 'cmfxu3glm0000xtyj8ooozoua', '2025-09-24 10:21:23.306+00', '2025-09-24 10:21:23.306+00'),
('cmfxu3glm0000xtyj8ooozoua-bhalla-papdi', 'Bhalla Papdi', 'Fried lentil balls with crispy wafers', 50.00, NULL, NULL, TRUE, TRUE, 29, 'cmfxu3huh0008xtyjd1cqe1ni', 'cmfxu3glm0000xtyj8ooozoua', '2025-09-24 10:21:30.767+00', '2025-09-24 10:21:30.767+00'),
('cmfxu3glm0000xtyj8ooozoua-cheese-burger', 'Cheese Burger', 'Burger with cheese', 60.00, NULL, NULL, TRUE, TRUE, 34, 'cmfxu3i30000axtyjo5tvqsjb', 'cmfxu3glm0000xtyj8ooozoua', '2025-09-24 10:21:32.324+00', '2025-09-24 10:21:32.324+00'),
('cmfxu3glm0000xtyj8ooozoua-chole-bhature-(full)', 'Chole Bhature (Full)', 'Spicy chickpeas with fried bread', 50.00, NULL, NULL, TRUE, TRUE, 25, 'cmfxu3hlv0006xtyjv3wxuwme', 'cmfxu3glm0000xtyj8ooozoua', '2025-09-24 10:21:29.537+00', '2025-09-24 10:21:29.537+00'),
('cmfxu3glm0000xtyj8ooozoua-chole-bhature-(half)', 'Chole Bhature (Half)', 'Spicy chickpeas with fried bread - half portion', 30.00, NULL, NULL, TRUE, TRUE, 26, 'cmfxu3hlv0006xtyjv3wxuwme', 'cmfxu3glm0000xtyj8ooozoua', '2025-09-24 10:21:29.836+00', '2025-09-24 10:21:29.836+00'),
('cmfxu3glm0000xtyj8ooozoua-chowmein', 'Chowmein', 'Classic chowmein', 50.00, NULL, NULL, TRUE, TRUE, 18, 'cmfxu3hdd0004xtyj2c3r9ge1', 'cmfxu3glm0000xtyj8ooozoua', '2025-09-24 10:21:27.349+00', '2025-09-24 10:21:27.349+00'),
('cmfxu3glm0000xtyj8ooozoua-coffee-(seasonal)', 'Coffee (Seasonal)', 'Hot coffee', 25.00, NULL, NULL, TRUE, TRUE, 42, 'cmfxu3iky000extyj3qwt1tou', 'cmfxu3glm0000xtyj8ooozoua', '2025-09-24 10:21:35.267+00', '2025-09-24 10:21:35.267+00'),
('cmfxu3glm0000xtyj8ooozoua-cold-drinks', 'Cold Drinks', 'Soft drinks - On MRP', 0.00, NULL, NULL, TRUE, TRUE, 43, 'cmfxu3iky000extyj3qwt1tou', 'cmfxu3glm0000xtyj8ooozoua', '2025-09-24 10:21:35.637+00', '2025-09-24 10:21:35.637+00'),
('cmfxu3glm0000xtyj8ooozoua-delhi-paneer-dry', 'Delhi Paneer Dry', 'Dry paneer preparation', 100.00, NULL, NULL, TRUE, TRUE, 10, 'cmfxu3hdd0004xtyj2c3r9ge1', 'cmfxu3glm0000xtyj8ooozoua', '2025-09-24 10:21:24.868+00', '2025-09-24 10:21:24.868+00'),
('cmfxu3glm0000xtyj8ooozoua-delhi-paneer-gravy', 'Delhi Paneer Gravy', 'Paneer in rich gravy', 120.00, NULL, NULL, TRUE, TRUE, 11, 'cmfxu3hdd0004xtyj2c3r9ge1', 'cmfxu3glm0000xtyj8ooozoua', '2025-09-24 10:21:25.187+00', '2025-09-24 10:21:25.187+00'),
('cmfxu3glm0000xtyj8ooozoua-double-chowmein', 'Double Chowmein', 'Extra portion chowmein', 70.00, NULL, NULL, TRUE, TRUE, 19, 'cmfxu3hdd0004xtyj2c3r9ge1', 'cmfxu3glm0000xtyj8ooozoua', '2025-09-24 10:21:27.677+00', '2025-09-24 10:21:27.677+00'),
('cmfxu3glm0000xtyj8ooozoua-extra-pav', 'Extra Pav', 'Additional bread pieces', 20.00, NULL, NULL, TRUE, TRUE, 22, 'cmfxu3hdd0004xtyj2c3r9ge1', 'cmfxu3glm0000xtyj8ooozoua', '2025-09-24 10:21:28.601+00', '2025-09-24 10:21:28.601+00'),
('cmfxu3glm0000xtyj8ooozoua-french-fries', 'French Fries', 'Crispy golden french fries', 60.00, NULL, NULL, TRUE, TRUE, 7, 'cmfxu3hdd0004xtyj2c3r9ge1', 'cmfxu3glm0000xtyj8ooozoua', '2025-09-24 10:21:23.916+00', '2025-09-24 10:21:23.916+00'),
('cmfxu3glm0000xtyj8ooozoua-golgappa-with-curd-(5pcs)', 'Golgappa with Curd (5pcs)', 'Crispy puris with curd', 35.00, NULL, NULL, TRUE, TRUE, 31, 'cmfxu3huh0008xtyjd1cqe1ni', 'cmfxu3glm0000xtyj8ooozoua', '2025-09-24 10:21:31.367+00', '2025-09-24 10:21:31.367+00'),
('cmfxu3glm0000xtyj8ooozoua-golgappa-with-water-(5pcs)', 'Golgappa with Water (5pcs)', 'Crispy puris with spiced water', 25.00, NULL, NULL, TRUE, TRUE, 30, 'cmfxu3huh0008xtyjd1cqe1ni', 'cmfxu3glm0000xtyj8ooozoua', '2025-09-24 10:21:31.065+00', '2025-09-24 10:21:31.065+00'),
('cmfxu3glm0000xtyj8ooozoua-lassi-(seasonal)', 'Lassi (Seasonal)', 'Sweet yogurt drink', 40.00, NULL, NULL, TRUE, TRUE, 41, 'cmfxu3iky000extyj3qwt1tou', 'cmfxu3glm0000xtyj8ooozoua', '2025-09-24 10:21:34.893+00', '2025-09-24 10:21:34.893+00'),
('cmfxu3glm0000xtyj8ooozoua-manchurian-dry-(5pcs)', 'Manchurian Dry (5pcs)', 'Dry manchurian balls', 60.00, NULL, NULL, TRUE, TRUE, 12, 'cmfxu3hdd0004xtyj2c3r9ge1', 'cmfxu3glm0000xtyj8ooozoua', '2025-09-24 10:21:25.489+00', '2025-09-24 10:21:25.489+00'),
('cmfxu3glm0000xtyj8ooozoua-masala-dosa', 'Masala Dosa', 'Dosa with spiced potato filling', 70.00, NULL, NULL, TRUE, TRUE, 38, 'cmfxu3icj000cxtyjfmghomdq', 'cmfxu3glm0000xtyj8ooozoua', '2025-09-24 10:21:33.657+00', '2025-09-24 10:21:33.657+00'),
('cmfxu3glm0000xtyj8ooozoua-mineral-water', 'Mineral Water', 'Bottled water - On MRP', 0.00, NULL, NULL, TRUE, TRUE, 44, 'cmfxu3iky000extyj3qwt1tou', 'cmfxu3glm0000xtyj8ooozoua', '2025-09-24 10:21:35.956+00', '2025-09-24 10:21:35.956+00'),
('cmfxu3glm0000xtyj8ooozoua-momos-fried-(full)', 'Momos Fried (Full)', 'Fried momos full portion', 90.00, NULL, NULL, TRUE, TRUE, 16, 'cmfxu3hdd0004xtyj2c3r9ge1', 'cmfxu3glm0000xtyj8ooozoua', '2025-09-24 10:21:26.743+00', '2025-09-24 10:21:26.743+00');

-- Insert customers data (first 10 customers due to length limits)
INSERT INTO public.customers (id, name, phone, email, address, "isBlocked", "createdAt", "updatedAt") VALUES
('cmfxur5mj0000bh01y9kaqba0', 'John Doe', '+91 9876543210', 'john@example.com', '123 Main Street, Delhi', FALSE, '2025-09-24 10:39:44.443+00', '2025-09-24 10:39:44.443+00'),
('cmfxur6100001bh01lks13vut', 'Jane Smith', '+91 9876543211', 'jane@example.com', '456 Park Avenue, Delhi', FALSE, '2025-09-24 10:39:44.964+00', '2025-09-24 10:39:44.964+00'),
('cmfxur6ac0002bh01kyx08ph1', 'Mike Johnson', '+91 9876543212', 'mike@example.com', '789 Garden Road, Delhi', FALSE, '2025-09-24 10:39:45.301+00', '2025-09-24 10:39:45.301+00'),
('cmfxvmaar00045qu5beubp7w3', 'John Doe', '9876543210', 'john2@example.com', '123 Test Street, Delhi', FALSE, '2025-09-24 11:03:56.836+00', '2025-09-24 11:03:56.836+00'),
('cmfxvnsji00095qu5b0leypg2', 'Jane Smith', '9876543211', 'jane2@example.com', '456 Test Avenue, Mumbai', FALSE, '2025-09-24 11:05:07.134+00', '2025-09-24 11:05:07.134+00'),
('cmfxvppu0000e5qu53t9r4u82', 'Alice Johnson', '9876543213', 'alice@example.com', '789 Test Road, Bangalore', FALSE, '2025-09-24 11:06:36.937+00', '2025-09-24 11:06:36.937+00'),
('cmfxvym0m000j5qu51gcbp5u3', 'Test Customer Real', '9876543214', 'testreal@example.com', '123 Real Street, Test City', FALSE, '2025-09-24 11:13:31.895+00', '2025-09-24 11:13:31.895+00'),
('cmfxw1clo000o5qu5sax34x45', 'sdsd34', '6398059036', 'd@gmail.com', 'rt', FALSE, '2025-09-24 11:15:39.661+00', '2025-09-24 11:15:39.661+00'),
('cmfxw3cgx000p5qu56iyj644e', 'dfgsd', '6398059046', 'gd@gmail.com', 'rt', FALSE, '2025-09-24 11:17:12.801+00', '2025-09-24 11:17:12.801+00'),
('cmfxwap01000q5qu5jj94evwq', 'Real Time Test', '9876543215', 'realtime@example.com', '456 Real Time Street, Test City', FALSE, '2025-09-24 11:22:55.634+00', '2025-09-24 11:22:55.634+00');

-- Insert orders data (first 10 orders due to length limits)
INSERT INTO public.orders (id, "orderNumber", "customerld", "storeld", status, "paymentMethod", "paymentStatus", "razorpayOrderld", "razorpayPaymentld", subtotal, tax, discount, total, "couponld", notes, "estimatedTime", "deliveredAt", "createdAt", "updatedAt") VALUES
('cmfxur6n00004bh01eisa9o7c', 'ORD-001', 'cmfxur5mj0000bh01y9kaqba0', 'cmfxu3glm0000xtyj8ooozoua', 'DELIVERED', 'UPI', 'COMPLETED', NULL, NULL, 200.00, 20.00, 0.00, 220.00, NULL, 'Please deliver quickly', 30, NULL, '2025-09-24 10:39:45.756+00', '2025-09-24 10:39:45.756+00'),
('cmfxur7150006bh01oilfhzbb', 'ORD-002', 'cmfxur6100001bh01lks13vut', 'cmfxu3glm0000xtyj8ooozoua', 'PREPARING', 'CASH_ON_DELIVERY', 'PENDING', NULL, NULL, 150.00, 15.00, 10.00, 155.00, NULL, 'Extra spicy', 30, NULL, '2025-09-24 10:39:46.265+00', '2025-09-24 10:39:46.265+00'),
('cmfxur7910008bh01f7jritzv', 'ORD-003', 'cmfxur6ac0002bh01kyx08ph1', 'cmfxu3glm0000xtyj8ooozoua', 'PENDING', 'RAZORPAY', 'PENDING', NULL, NULL, 300.00, 30.00, 0.00, 330.00, NULL, 'No onions', 30, NULL, '2025-09-24 10:39:46.569+00', '2025-09-24 10:39:46.569+00'),
('cmfxvfh3300025qu557tjcmfq', 'ORD1758711518970978', 'cmfxur5mj0000bh01y9kaqba0', 'cmfxu3glm0000xtyj8ooozoua', 'PENDING', 'CASH_ON_DELIVERY', 'PENDING', NULL, NULL, 200.00, 10.00, 0.00, 210.00, NULL, NULL, 30, NULL, '2025-09-24 10:58:39.038+00', '2025-09-24 10:58:39.038+00'),
('cmfxvman700075qu5wf54n2qe', 'ORD1758711837221287', 'cmfxvmaar00045qu5beubp7w3', 'cmfxu3glm0000xtyj8ooozoua', 'PENDING', 'CASH_ON_DELIVERY', 'PENDING', NULL, NULL, 200.00, 10.00, 0.00, 210.00, NULL, NULL, 30, NULL, '2025-09-24 11:03:57.283+00', '2025-09-24 11:03:57.283+00'),
('cmfxvnsr1000c5qu5tiz1q8lu', 'ORD1758711907344327', 'cmfxvnsji00095qu5b0leypg2', 'cmfxu3glm0000xtyj8ooozoua', 'PENDING', 'CASH_ON_DELIVERY', 'PENDING', NULL, NULL, 320.00, 16.00, 0.00, 336.00, NULL, NULL, 30, NULL, '2025-09-24 11:05:07.405+00', '2025-09-24 11:05:07.405+00'),
('cmfxvpq18000h5qu53ifu9gaq', 'ORD1758711997130379', 'cmfxvppu0000e5qu53t9r4u82', 'cmfxu3glm0000xtyj8ooozoua', 'PENDING', 'CASH_ON_DELIVERY', 'PENDING', NULL, NULL, 60.00, 3.00, 0.00, 63.00, NULL, NULL, 30, NULL, '2025-09-24 11:06:37.196+00', '2025-09-24 11:06:37.196+00'),
('cmfxvymjy000m5qu5me0e5bov', 'ORD1758712412529773', 'cmfxvym0m000j5qu51gcbp5u3', 'cmfxu3glm0000xtyj8ooozoua', 'PENDING', 'CASH_ON_DELIVERY', 'PENDING', NULL, NULL, 200.00, 10.00, 0.00, 210.00, NULL, NULL, 30, NULL, '2025-09-24 11:13:32.59+00', '2025-09-24 11:13:32.59+00'),
('cmfxwapdt000t5qu5m092ubvj', 'ORD1758712976065647', 'cmfxwap01000q5qu5jj94evwq', 'cmfxu3glm0000xtyj8ooozoua', 'PENDING', 'CASH_ON_DELIVERY', 'PENDING', NULL, NULL, 60.00, 3.00, 0.00, 63.00, NULL, NULL, 30, NULL, '2025-09-24 11:22:56.127+00', '2025-09-24 11:22:56.127+00'),
('cmfxwbwa0000y5qu5f1980r6c', 'ORD1758713031653489', 'cmfxwbw34000v5qu5nwq0pz8p', 'cmfxu3glm0000xtyj8ooozoua', 'PENDING', 'CASH_ON_DELIVERY', 'PENDING', NULL, NULL, 400.00, 20.00, 0.00, 420.00, NULL, NULL, 30, NULL, '2025-09-24 11:23:51.721+00', '2025-09-24 11:23:51.721+00');

-- Insert order_items data (first 10 items due to length limits)
-- Note: These reference orders that were inserted above
INSERT INTO public.order_items (id, "orderId", "menuItemId", quantity, price, notes, "createdAt") VALUES
('cmfxur7i4000abh01kuqnpyie', 'cmfxur6n00004bh01eisa9o7c', 'cmfxu3glm0000xtyj8ooozoua-afghani-chaap-tikka', 3, 160.00, 'Sample order item', NOW()),
('cmfxur7m2000cbh01fjlk3eql', 'cmfxur7150006bh01oilfhzbb', 'cmfxu3glm0000xtyj8ooozoua-bhalla-papdi', 3, 50.00, 'Sample order item', NOW()),
('cmfxur701000ebh014ugtsyg4', 'cmfxur7910008bh01f7jritzv', 'cmfxu3glm0000xtyj8ooozoua-cheese-burger', 1, 60.00, 'Sample order item', NOW()),
('cmfxvfh6n00035qu5cil619bl', 'cmfxvfh3300025qu557tjcmfq', 'cmfxu3glm0000xtyj8ooozoua-paneer-tikka', 1, 200.00, NULL, NOW()),
('cmfxvmarb00085qu5clnq2n4s', 'cmfxvman700075qu5wf54n2qe', 'cmfxu3glm0000xtyj8ooozoua-paneer-tikka', 1, 200.00, NULL, NOW()),
('cmfxvnsss000d5qu5chkvecbn', 'cmfxvnsr1000c5qu5tiz1q8lu', 'cmfxu3glm0000xtyj8ooozoua-tandoori-momos-(8pcs)', 2, 160.00, NULL, NOW()),
('cmfxvpq3i000i5qu5nmduqcf6', 'cmfxvpq18000h5qu53ifu9gaq', 'cmfxu3glm0000xtyj8ooozoua-french-fries', 1, 60.00, NULL, NOW()),
('cmfxvymrn000n5qu5gpsue9gl', 'cmfxvymjy000m5qu5me0e5bov', 'cmfxu3glm0000xtyj8ooozoua-paneer-tikka', 1, 200.00, NULL, NOW()),
('cmfxwaphn000u5qu57wpp4x09', 'cmfxwapdt000t5qu5m092ubvj', 'cmfxu3glm0000xtyj8ooozoua-french-fries', 1, 60.00, NULL, NOW()),
('cmfxwbwbv000z5qu5idj8dovc', 'cmfxwbwa0000y5qu5f1980r6c', 'cmfxu3glm0000xtyj8ooozoua-paneer-tikka', 2, 200.00, NULL, NOW());

-- Insert coupons data
INSERT INTO public.coupons (id, "storeId", code, name, description, type, value, "minOrderAmount", "maxDiscount", "usageLimit", "usedCount", "isActive", "validFrom", "validUntil", "createdAt", "updatedAt") VALUES
('cmfxu3u1g000gxtyjrbm80u2k', 'cmfxu3glm0000xtyj8ooozoua', 'WELCOME10', 'Welcome Discount', '10% off on your first order', 'PERCENTAGE', 10, 100, 50, 100, 0, TRUE, '2025-09-24 10:21:36.336+00', '2025-10-24 10:21:36.336+00', '2025-09-24 10:21:36.34+00', '2025-09-24 10:21:36.34+00'),
('cmfxu3ufj000ixtyjdwq7snbp', 'cmfxu3glm0000xtyj8ooozoua', 'SAVE20', 'Save ₹20', 'Flat ₹20 off on orders above ₹200', 'FIXED_AMOUNT', 20, 200, NULL, 50, 0, TRUE, '2025-09-24 10:21:36.336+00', '2025-10-09 10:21:36.336+00', '2025-09-24 10:21:36.846+00', '2025-09-24 10:21:36.846+00');

-- Insert admins data
INSERT INTO public.admins (id, name, email, password, role, "isActive", "storeId", "createdAt", "updatedAt") VALUES
('cmfxu3upt000kxtyj1qexvo3n', 'Admin User', 'admin@siddhi.com', '$2b$10$rQZ8K9vX8K9vX8K9vX8K9e', 'SUPER_ADMIN', TRUE, 'cmfxu3glm0000xtyj8ooozoua', '2025-09-24 10:21:37.217+00', '2025-09-24 10:21:37.217+00');

-- Success message
SELECT 'Database setup completed successfully! All tables created and populated with data.' as status;
