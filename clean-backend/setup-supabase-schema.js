const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase admin client
const supabaseUrl = 'https://imhkrycglxvjlpseieqv.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltaGtyeWNnbHh2amxwc2VpZXF2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODIwMjU2NywiZXhwIjoyMDczNzc4NTY3fQ.Y9V4pclXXUN3RZymOPqvGleXSUqE-NCUoDcMZQcqu6o';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupSupabaseSchema() {
  console.log('🔧 Setting up Supabase schema...');

  try {
    // 1. Create tables with proper structure
    const createTablesSQL = `
      -- Enable required extensions
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
      CREATE EXTENSION IF NOT EXISTS "pgcrypto";

      -- Create stores table
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

      -- Create categories table
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

      -- Create menu_items table
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

      -- Create customers table
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

      -- Create orders table
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

      -- Create order_items table
      CREATE TABLE IF NOT EXISTS public.order_items (
        id TEXT PRIMARY KEY,
        order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
        menu_item_id TEXT NOT NULL REFERENCES public.menu_items(id),
        quantity INTEGER NOT NULL,
        price NUMERIC(10,2) NOT NULL,
        notes TEXT
      );

      -- Create admins table
      CREATE TABLE IF NOT EXISTS public.admins (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Create coupons table
      CREATE TABLE IF NOT EXISTS public.coupons (
        id TEXT PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        description TEXT,
        discount_type TEXT NOT NULL,
        discount_value NUMERIC(10,2) NOT NULL,
        min_order_amount NUMERIC(10,2),
        max_discount NUMERIC(10,2),
        usage_limit INTEGER,
        used_count INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        valid_from TIMESTAMPTZ,
        valid_until TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    const { error: createError } = await supabase.rpc('exec_sql', { sql: createTablesSQL });
    if (createError) {
      console.error('Error creating tables:', createError);
      return;
    }
    console.log('✅ Tables created successfully');

    // 2. Enable RLS and create policies
    const rlsPoliciesSQL = `
      -- Enable RLS
      ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

      -- Create read policies for anon users (for admin dashboard)
      CREATE POLICY IF NOT EXISTS "anon_read_stores" ON public.stores FOR SELECT USING (true);
      CREATE POLICY IF NOT EXISTS "anon_read_categories" ON public.categories FOR SELECT USING (true);
      CREATE POLICY IF NOT EXISTS "anon_read_menu_items" ON public.menu_items FOR SELECT USING (true);
      CREATE POLICY IF NOT EXISTS "anon_read_customers" ON public.customers FOR SELECT USING (true);
      CREATE POLICY IF NOT EXISTS "anon_read_orders" ON public.orders FOR SELECT USING (true);
      CREATE POLICY IF NOT EXISTS "anon_read_order_items" ON public.order_items FOR SELECT USING (true);
      CREATE POLICY IF NOT EXISTS "anon_read_coupons" ON public.coupons FOR SELECT USING (true);

      -- Create write policies for service role (backend operations)
      CREATE POLICY IF NOT EXISTS "service_write_stores" ON public.stores FOR ALL USING (true);
      CREATE POLICY IF NOT EXISTS "service_write_categories" ON public.categories FOR ALL USING (true);
      CREATE POLICY IF NOT EXISTS "service_write_menu_items" ON public.menu_items FOR ALL USING (true);
      CREATE POLICY IF NOT EXISTS "service_write_customers" ON public.customers FOR ALL USING (true);
      CREATE POLICY IF NOT EXISTS "service_write_orders" ON public.orders FOR ALL USING (true);
      CREATE POLICY IF NOT EXISTS "service_write_order_items" ON public.order_items FOR ALL USING (true);
      CREATE POLICY IF NOT EXISTS "service_write_admins" ON public.admins FOR ALL USING (true);
      CREATE POLICY IF NOT EXISTS "service_write_coupons" ON public.coupons FOR ALL USING (true);
    `;

    const { error: rlsError } = await supabase.rpc('exec_sql', { sql: rlsPoliciesSQL });
    if (rlsError) {
      console.error('Error setting up RLS policies:', rlsError);
      return;
    }
    console.log('✅ RLS policies created successfully');

    // 3. Seed initial data
    console.log('🌱 Seeding initial data...');

    // Create store
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

    // Create categories
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

    // Create menu items
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

    // Create sample customers
    const customersData = [
      { id: 'cust-1', name: 'John Doe', phone: '+91 9876543210', email: 'john@example.com', address: '123 Main', is_blocked: false },
      { id: 'cust-2', name: 'Jane Smith', phone: '+91 9876543211', email: 'jane@example.com', address: '456 Park', is_blocked: false },
      { id: 'cust-3', name: 'Mike Johnson', phone: '+91 9876543212', email: 'mike@example.com', address: '789 Garden', is_blocked: false },
      { id: 'cust-4', name: 'Alice Johnson', phone: '+91 9876543213', email: 'alice@example.com', address: '123 Test S', is_blocked: false },
      { id: 'cust-5', name: 'Test Customer Real', phone: '+91 9876543214', email: 'testreal@example.com', address: '456 Test A', is_blocked: false }
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

    // Create sample orders
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

    console.log('🎉 Supabase schema setup complete!');
    console.log('📊 You can now access your admin panel at: http://localhost:3000/admin');

  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

setupSupabaseSchema();
