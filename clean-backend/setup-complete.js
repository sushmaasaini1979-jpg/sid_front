const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase admin client
const supabaseUrl = 'https://imhkrycglxvjlpseieqv.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltaGtyeWNnbHh2amxwc2VpZXF2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODIwMjU2NywiZXhwIjoyMDczNzc4NTY3fQ.Y9V4pclXXUN3RZymOPqvGleXSUqE-NCUoDcMZQcqu6o';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testConnection() {
  console.log('🔗 Testing Supabase connection...');
  
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('stores')
      .select('count')
      .limit(1);
    
    if (error && error.code === 'PGRST204') {
      console.log('❌ Tables do not exist yet. You need to create them first.');
      console.log('\n📋 Please run this SQL in your Supabase SQL Editor:');
      console.log(`
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
      `);
      return false;
    }
    
    if (error) {
      console.error('❌ Connection error:', error);
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.error('❌ Connection failed:', error);
    return false;
  }
}

async function seedData() {
  console.log('🌱 Seeding data...');
  
  try {
    // 1. Create store
    console.log('Creating store...');
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .upsert({
        id: 'store-siddhi-001',
        name: 'SIDDHI',
        slug: 'siddhi',
        description: 'BITE INTO HAPPINESS',
        address: '123 Main Street, City',
        phone: '+91 9876543210',
        email: 'info@siddhi.com',
        is_active: true
      })
      .select()
      .single();

    if (storeError) {
      console.error('Error creating store:', storeError);
      return;
    }
    console.log('✅ Store created');

    // 2. Create categories
    console.log('Creating categories...');
    const categoriesData = [
      { id: 'cat-1', name: 'Starters', slug: 'starters', store_id: store.id, is_active: true, sort_order: 1 },
      { id: 'cat-2', name: 'Fast Food', slug: 'fast-food', store_id: store.id, is_active: true, sort_order: 2 },
      { id: 'cat-3', name: 'Main Course', slug: 'main-course', store_id: store.id, is_active: true, sort_order: 3 },
      { id: 'cat-4', name: 'Desserts', slug: 'desserts', store_id: store.id, is_active: true, sort_order: 4 },
      { id: 'cat-5', name: 'Beverages', slug: 'beverages', store_id: store.id, is_active: true, sort_order: 5 }
    ];

    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .upsert(categoriesData)
      .select();

    if (categoriesError) {
      console.error('Error creating categories:', categoriesError);
      return;
    }
    console.log(`✅ Categories created: ${categories.length}`);

    // 3. Create menu items
    console.log('Creating menu items...');
    const menuItemsData = [
      { id: 'item-1', name: 'Samosa', description: 'Crispy fried pastry with spiced potato filling', price: 15, category_id: 'cat-1', store_id: store.id, is_veg: true, is_available: true, sort_order: 1 },
      { id: 'item-2', name: 'Pakora', description: 'Deep-fried vegetable fritters', price: 20, category_id: 'cat-1', store_id: store.id, is_veg: true, is_available: true, sort_order: 2 },
      { id: 'item-3', name: 'Burger', description: 'Juicy burger with fresh vegetables', price: 80, category_id: 'cat-2', store_id: store.id, is_veg: false, is_available: true, sort_order: 1 },
      { id: 'item-4', name: 'Pizza', description: 'Delicious pizza with cheese and toppings', price: 120, category_id: 'cat-2', store_id: store.id, is_veg: true, is_available: true, sort_order: 2 },
      { id: 'item-5', name: 'Dal Makhani', description: 'Black lentils cooked with butter and cream', price: 150, category_id: 'cat-3', store_id: store.id, is_veg: true, is_available: true, sort_order: 1 },
      { id: 'item-6', name: 'Butter Chicken', description: 'Creamy tomato-based curry with chicken', price: 220, category_id: 'cat-3', store_id: store.id, is_veg: false, is_available: true, sort_order: 2 },
      { id: 'item-7', name: 'Gulab Jamun', description: 'Deep-fried milk-solid balls soaked in sugar syrup', price: 50, category_id: 'cat-4', store_id: store.id, is_veg: true, is_available: true, sort_order: 1 },
      { id: 'item-8', name: 'Ice Cream', description: 'Vanilla ice cream', price: 60, category_id: 'cat-4', store_id: store.id, is_veg: true, is_available: true, sort_order: 2 },
      { id: 'item-9', name: 'Coca-Cola', description: 'Refreshing soft drink', price: 30, category_id: 'cat-5', store_id: store.id, is_veg: true, is_available: true, sort_order: 1 },
      { id: 'item-10', name: 'Fresh Lime Soda', description: 'Sweet and tangy lime soda', price: 40, category_id: 'cat-5', store_id: store.id, is_veg: true, is_available: true, sort_order: 2 }
    ];

    const { data: menuItems, error: menuItemsError } = await supabase
      .from('menu_items')
      .upsert(menuItemsData)
      .select();

    if (menuItemsError) {
      console.error('Error creating menu items:', menuItemsError);
      return;
    }
    console.log(`✅ Menu items created: ${menuItems.length}`);

    // 4. Create sample customers
    console.log('Creating customers...');
    const customersData = [
      { id: 'cust-1', name: 'John Doe', phone: '+91 9876543210', email: 'john@example.com', address: '123 Main', is_blocked: false },
      { id: 'cust-2', name: 'Jane Smith', phone: '+91 9876543211', email: 'jane@example.com', address: '456 Park', is_blocked: false },
      { id: 'cust-3', name: 'Mike Johnson', phone: '+91 9876543212', email: 'mike@example.com', address: '789 Garden', is_blocked: false },
      { id: 'cust-4', name: 'Alice Johnson', phone: '+91 9876543213', email: 'alice@example.com', address: '123 Test S', is_blocked: false },
      { id: 'cust-5', name: 'Test Customer Real', phone: '+91 9876543214', email: 'testreal@example.com', address: '456 Test A', is_blocked: false },
      { id: 'cust-6', name: 'sdsd34', phone: '6398059036', email: 'd@gmail.com', address: 'rt', is_blocked: false },
      { id: 'cust-7', name: 'dfgsd', phone: '6398059046', email: 'gd@gmail.com', address: 'rt', is_blocked: false },
      { id: 'cust-8', name: 'Real Time Test', phone: '9876543215', email: 'realtime@example.com', address: '456 Real T', is_blocked: false },
      { id: 'cust-9', name: 'Auto Update Test', phone: '9876543216', email: 'autoupdate@example.com', address: '789 Auto', is_blocked: false },
      { id: 'cust-10', name: 'abuh', phone: '6398034534', email: 'ach@gmail.com', address: 'd', is_blocked: false },
      { id: 'cust-11', name: 'abc', phone: '9547844989', email: 'adbuid@gail.com', address: 'few', is_blocked: false },
      { id: 'cust-12', name: 'Masab2', phone: '9845346389', email: 'fhje@gmail.com', address: 'vw', is_blocked: false },
      { id: 'cust-13', name: 'Payment Test User', phone: '9876543217', email: 'payment@example.com', address: 'Payment', is_blocked: false }
    ];

    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .upsert(customersData)
      .select();

    if (customersError) {
      console.error('Error creating customers:', customersError);
      return;
    }
    console.log(`✅ Customers created: ${customers.length}`);

    // 5. Create sample orders
    console.log('Creating orders...');
    const ordersData = [
      {
        id: 'order-1',
        order_number: 'ORD-001',
        customer_id: 'cust-1',
        store_id: store.id,
        status: 'DELIVERED',
        payment_method: 'UPI',
        payment_status: 'COMPLETED',
        subtotal: 200,
        tax: 20,
        total: 220,
        estimated_time: 30
      },
      {
        id: 'order-2',
        order_number: 'ORD-002',
        customer_id: 'cust-2',
        store_id: store.id,
        status: 'PREPARING',
        payment_method: 'CASH_ON_DELIVERY',
        payment_status: 'PENDING',
        subtotal: 150,
        tax: 15,
        total: 165,
        estimated_time: 30
      },
      {
        id: 'order-3',
        order_number: 'ORD-003',
        customer_id: 'cust-3',
        store_id: store.id,
        status: 'PENDING',
        payment_method: 'RAZORPAY',
        payment_status: 'COMPLETED',
        subtotal: 300,
        tax: 30,
        total: 330,
        estimated_time: 30
      }
    ];

    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .upsert(ordersData)
      .select();

    if (ordersError) {
      console.error('Error creating orders:', ordersError);
      return;
    }
    console.log(`✅ Orders created: ${orders.length}`);

    // 6. Create order items
    console.log('Creating order items...');
    const orderItemsData = [
      { id: 'oi-1', order_id: 'order-1', menu_item_id: 'item-1', quantity: 2, price: 15 },
      { id: 'oi-2', order_id: 'order-1', menu_item_id: 'item-3', quantity: 1, price: 80 },
      { id: 'oi-3', order_id: 'order-2', menu_item_id: 'item-5', quantity: 1, price: 150 },
      { id: 'oi-4', order_id: 'order-3', menu_item_id: 'item-6', quantity: 1, price: 220 },
      { id: 'oi-5', order_id: 'order-3', menu_item_id: 'item-9', quantity: 2, price: 30 }
    ];

    const { data: orderItems, error: orderItemsError } = await supabase
      .from('order_items')
      .upsert(orderItemsData)
      .select();

    if (orderItemsError) {
      console.error('Error creating order items:', orderItemsError);
      return;
    }
    console.log(`✅ Order items created: ${orderItems.length}`);

    console.log('🎉 Data seeding complete!');
    return true;

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting Supabase setup...');
  
  const connected = await testConnection();
  if (!connected) {
    console.log('\n⚠️  Please create the tables first using the SQL provided above.');
    console.log('Then run this script again to seed the data.');
    return;
  }
  
  const seeded = await seedData();
  if (seeded) {
    console.log('\n🎉 Setup complete!');
    console.log('📊 You can now access your admin panel at: http://localhost:3000/admin');
  }
}

main();
