const express = require('express');
const { body, validationResult } = require('express-validator');
const { supabaseAdmin } = require('../lib/supabase');
const router = express.Router();

// GET /api/admin/dashboard - Real-time dashboard data
router.get('/dashboard', async (req, res) => {
  try {
    const storeSlug = req.query.store || 'siddhi'; // Default to siddhi store
    const period = req.query.period || 'today'; // Default to today

    // Get store
    const { data: store, error: storeError } = await supabaseAdmin
      .from('stores')
      .select('*')
      .eq('slug', storeSlug)
      .single();

    if (storeError || !store) {
      return res.status(404).json({
        success: false,
        error: 'Store not found'
      });
    }

    // Calculate date range based on period
    const now = new Date();
    let startDate, endDate;

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        break;
      case 'weekly':
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        startDate = startOfWeek;
        endDate = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    }

    // Get orders for the period (simplified query)
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('storeId', store.id);

    if (ordersError) {
      console.error('❌ Orders error:', ordersError);
      return res.status(500).json({
      success: false,
        error: 'Failed to fetch orders'
      });
    }

    // Calculate metrics
    const totalOrders = orders?.length || 0;
    const totalRevenue = orders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
    const pendingOrders = orders?.filter(order => order.status === 'PENDING').length || 0;
    const completedOrders = orders?.filter(order => order.status === 'DELIVERED').length || 0;

    // Get customer count
    const { data: customers, error: customersError } = await supabaseAdmin
      .from('customers')
      .select('*');

    if (customersError) {
      console.error('❌ Customers error:', customersError);
    }

    const totalCustomers = customers?.length || 0;

    // Get menu items count
    const { data: menuItems, error: menuError } = await supabaseAdmin
      .from('menu_items')
      .select('*')
      .eq('storeId', store.id)
      .eq('isAvailable', true);

    if (menuError) {
      console.error('❌ Menu error:', menuError);
    }

    const totalMenuItems = menuItems?.length || 0;

    res.json({
      success: true,
      data: {
        store: {
          id: store.id,
          name: store.name,
          slug: store.slug
        },
        metrics: {
        totalOrders,
          totalRevenue,
        pendingOrders,
          completedOrders,
          totalCustomers,
          totalMenuItems
        },
        period,
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// GET /api/admin/orders - Real-time orders data
router.get('/orders', async (req, res) => {
  try {
    const storeSlug = req.query.store || 'siddhi';
    const status = req.query.status;
    const limit = parseInt(req.query.limit) || 50;

    // Get store
    const { data: store, error: storeError } = await supabaseAdmin
      .from('stores')
      .select('*')
      .eq('slug', storeSlug)
      .single();

    if (storeError || !store) {
      return res.status(404).json({
        success: false,
        error: 'Store not found'
      });
    }

    // Build query with customer and order items data
    let query = supabaseAdmin
      .from('orders')
      .select(`
        *,
        customers:customerId(
          name,
          phone,
          email
        ),
        order_items:order_items(
          quantity,
          menu_items:menuItemId(
            name
          )
        )
      `)
      .eq('storeId', store.id)
      .order('createdAt', { ascending: false })
      .limit(limit);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: orders, error: ordersError } = await query;

    if (ordersError) {
      console.error('❌ Orders error:', ordersError);
      return res.status(500).json({
      success: false,
        error: 'Failed to fetch orders'
      });
    }

    // Transform orders to include customer and item details
    const ordersWithDetails = orders?.map(order => ({
      ...order,
      customerName: order.customers?.name || 'Unknown Customer',
      customerPhone: order.customers?.phone || 'N/A',
      customerEmail: order.customers?.email || 'N/A',
      orderItems: order.order_items?.map(item => 
        `${item.quantity}x ${item.menu_items?.name || 'Unknown Item'}`
      ).join(', ') || 'No items'
    })) || [];

    res.json({
      success: true,
      data: {
        orders: ordersWithDetails,
        total: ordersWithDetails.length
      }
    });

  } catch (error) {
    console.error('❌ Orders error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// GET /api/admin/customers - Real-time customers data
router.get('/customers', async (req, res) => {
  try {
    const storeSlug = req.query.store || 'siddhi';
    const status = req.query.status;
    const limit = parseInt(req.query.limit) || 100;

    // Get store
    const { data: store, error: storeError } = await supabaseAdmin
      .from('stores')
      .select('*')
      .eq('slug', storeSlug)
      .single();

    if (storeError || !store) {
      return res.status(404).json({
        success: false,
        error: 'Store not found'
      });
    }

    // Build query
    let query = supabaseAdmin
      .from('customers')
      .select('*')
      .order('createdAt', { ascending: false })
      .limit(limit);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: customers, error: customersError } = await query;

    if (customersError) {
      console.error('❌ Customers error:', customersError);
      return res.status(500).json({
      success: false,
        error: 'Failed to fetch customers'
      });
    }

    // Calculate customer metrics with real order data
    const customersWithStats = await Promise.all(customers?.map(async (customer) => {
      // Get customer's orders
      const { data: customerOrders, error: ordersError } = await supabaseAdmin
        .from('orders')
        .select(`
          id,
          total,
          status,
          createdAt,
          order_items:order_items(
            quantity,
            menu_items:menuItemId(
              name
            )
          )
        `)
        .eq('customerId', customer.id)
        .eq('storeId', store.id);

      if (ordersError) {
        console.error('❌ Customer orders error:', ordersError);
      }

      // Calculate total spent and order count
      const totalSpent = customerOrders?.reduce((sum, order) => sum + parseFloat(order.total || 0), 0) || 0;
      const totalOrders = customerOrders?.length || 0;
      
      // Get last order details
      const lastOrder = customerOrders?.length > 0 ? customerOrders[0] : null;
      const lastOrderItems = lastOrder?.order_items?.map(item => item.menu_items?.name).filter(Boolean).join(', ') || '';

      return {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        status: customer.isBlocked ? 'Blocked' : 'Active',
        totalSpent: totalSpent,
        totalOrders: totalOrders,
        lastOrderItems: lastOrderItems,
        joinDate: new Date(customer.createdAt).toLocaleDateString(),
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt
      };
    }) || []);

    res.json({
      success: true,
      data: {
        customers: customersWithStats,
        total: customersWithStats.length
      }
    });

  } catch (error) {
    console.error('❌ Customers error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;

// TEMP: Dev utility to upsert store row for local setup
router.post('/dev-upsert-store', async (req, res) => {
  try {
    const { supabaseAdmin } = require('../lib/supabase');
    const slug = (req.body && req.body.slug) || 'siddhi';
    const name = (req.body && req.body.name) || 'SIDDHI';

    const { data, error } = await supabaseAdmin
      .from('stores')
      .upsert([{ slug, name }], { onConflict: 'slug' })
      .select('*')
      .single();

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    return res.json({ success: true, store: data });
  } catch (e) {
    return res.status(500).json({ success: false, error: 'Failed to upsert store' });
  }
});

// GET /api/admin/transactions - Real-time transactions data
router.get('/transactions', async (req, res) => {
  try {
    const storeSlug = req.query.store || 'siddhi';
    const period = req.query.period || 'today';

    // Get store
    const { data: store, error: storeError } = await supabaseAdmin
      .from('stores')
      .select('*')
      .eq('slug', storeSlug)
      .single();

    if (storeError || !store) {
      return res.status(404).json({
        success: false,
        error: 'Store not found'
      });
    }

    // Calculate date range based on period
    const now = new Date();
    let startDate, endDate;
    
    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        break;
      case 'weekly':
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        startDate = startOfWeek;
        endDate = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    }

    // Get orders as transactions with customer data
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        customers:customerId(
        name,
          phone,
          email
        )
      `)
      .eq('storeId', store.id)
      .order('createdAt', { ascending: false });

    if (ordersError) {
      console.error('❌ Transactions error:', ordersError);
      return res.status(500).json({
          success: false,
        error: 'Failed to fetch transactions'
      });
    }

    // Calculate statistics
    const totalTransactions = orders?.length || 0;
    const totalRevenue = orders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
    const pendingTransactions = orders?.filter(order => order.status === 'PENDING').length || 0;

    // Format transactions
    const transactions = orders?.map(order => ({
      id: order.id,
      orderId: order.id,
      customerId: order.customerId,
      customer: order.customers?.name || 'Unknown Customer',
      customerPhone: order.customers?.phone || 'N/A',
      customerEmail: order.customers?.email || 'N/A',
      amount: order.total,
      status: order.status === 'DELIVERED' ? 'Completed' : 
              order.status === 'PENDING' ? 'Pending' : 'Processing',
      paymentMethod: order.paymentMethod || 'UPI',
      date: new Date(order.createdAt).toLocaleDateString('en-IN'),
      createdAt: order.createdAt
    })) || [];

    res.json({
      success: true,
      data: {
        transactions,
      statistics: {
        totalTransactions,
        totalRevenue,
        pendingTransactions
        },
        period,
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Transactions error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// GET /api/admin/menu-items - Real-time menu items data
router.get('/menu-items', async (req, res) => {
  try {
    const storeSlug = req.query.store || 'siddhi';

    // Get store
    const { data: store, error: storeError } = await supabaseAdmin
      .from('stores')
      .select('*')
      .eq('slug', storeSlug)
      .single();

    if (storeError || !store) {
      return res.status(404).json({
        success: false,
        error: 'Store not found'
      });
    }

    // Get menu items with category names
    const { data: menuItems, error: menuError } = await supabaseAdmin
      .from('menu_items')
      .select(`
        *,
        categories:categoryId (
          name
        )
      `)
      .eq('storeId', store.id)
      .order('id', { ascending: false });

    if (menuError) {
      console.error('❌ Menu items error:', menuError);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch menu items'
      });
    }

    // Process menu items to include category name
    const processedMenuItems = menuItems?.map(item => ({
      ...item,
      categoryName: item.categories?.name || 'Unknown'
    })) || [];

    res.json({
      success: true,
      data: {
        menuItems: processedMenuItems,
        total: processedMenuItems.length
      }
    });

  } catch (error) {
    console.error('❌ Menu items error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// POST /api/admin-supabase/menu-items - Create a new menu item
router.post('/menu-items', async (req, res) => {
  try {
    const storeSlug = req.query.store || 'siddhi';
    const {
      name,
      description = '',
      price,
      categoryId,
      categoryName,
      imageUrl = '',
      isVeg = false,
      isAvailable = true,
      size = null,
      sortOrder = 0
    } = req.body || {};

    if (!name || price === undefined || price === null) {
      return res.status(400).json({ success: false, error: 'Name and price are required' });
    }

    // Get store
    const { data: store, error: storeError } = await supabaseAdmin
      .from('stores')
      .select('*')
      .eq('slug', storeSlug)
      .single();

    if (storeError || !store) {
      return res.status(404).json({ success: false, error: 'Store not found' });
    }

    // Resolve category
    let resolvedCategoryId = categoryId || null;
    if (!resolvedCategoryId && categoryName) {
      const { data: cat, error: catErr } = await supabaseAdmin
        .from('categories')
        .select('*')
        .eq('storeId', store.id)
        .ilike('name', categoryName)
        .single();
      if (cat && !catErr) {
        resolvedCategoryId = cat.id;
      }
    }

    if (!resolvedCategoryId) {
      // Optional: create category on the fly if a name was provided
      if (categoryName) {
        const { data: newCat, error: newCatErr } = await supabaseAdmin
          .from('categories')
          .insert({
            id: require('crypto').randomUUID(),
            storeId: store.id,
            name: categoryName,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          })
          .select('*')
          .single();
        if (newCatErr) {
          return res.status(400).json({ success: false, error: 'Invalid category' });
        }
        resolvedCategoryId = newCat.id;
      }
    }

    // Create menu item
    const newId = require('crypto').randomUUID();
    const { data: item, error: insertError } = await supabaseAdmin
      .from('menu_items')
      .insert({
        id: newId,
        storeId: store.id,
        categoryId: resolvedCategoryId,
        name,
        description,
        price,
        imageUrl,
        isVeg,
        isAvailable,
        size,
        sortOrder,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .select('*')
      .single();

    if (insertError) {
      console.error('❌ Menu item creation error:', insertError);
      return res.status(500).json({ success: false, error: 'Failed to create menu item' });
    }

    // Get category name for response
    let categoryNameResolved = null;
    if (resolvedCategoryId) {
      const { data: catRow } = await supabaseAdmin
        .from('categories')
        .select('name')
        .eq('id', resolvedCategoryId)
        .single();
      categoryNameResolved = catRow?.name || null;
    }

    // Emit realtime event via socket.io if available
    try {
      const { io } = require('../server');
      if (io) {
        io.to(`store-${storeSlug}`).emit('menu.item.created', {
          id: item.id,
          name: item.name,
          price: parseFloat(item.price),
          isVeg: item.isVeg,
          isAvailable: item.isAvailable,
          categoryId: item.categoryId,
          categoryName: categoryNameResolved
        });
      }
    } catch (_) {}

    // Return created item and basic stats
    const { data: allItems } = await supabaseAdmin
      .from('menu_items')
      .select('id, isAvailable')
      .eq('storeId', store.id);

    const statistics = {
      totalItems: allItems?.length || 0,
      availableItems: (allItems || []).filter(i => i.isAvailable).length,
      outOfStock: (allItems || []).filter(i => !i.isAvailable).length
    };

    return res.status(201).json({
      success: true,
      data: {
        item: {
          ...item,
          categoryName: categoryNameResolved
        },
        statistics
      }
    });
  } catch (error) {
    console.error('❌ Create menu item error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// PUT /api/admin/menu-items/:id/availability - Update item availability
router.put('/menu-items/:id/availability', async (req, res) => {
  try {
    const { id } = req.params;
    const { isAvailable } = req.body;
    const storeSlug = req.query.store || 'siddhi';

    if (typeof isAvailable !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'isAvailable must be a boolean'
      });
    }

    // Get store
    const { data: store, error: storeError } = await supabaseAdmin
      .from('stores')
      .select('*')
      .eq('slug', storeSlug)
      .single();

    if (storeError || !store) {
      return res.status(404).json({
        success: false,
        error: 'Store not found'
      });
    }

    // Update menu item availability
    const { data: updatedItem, error: updateError } = await supabaseAdmin
      .from('menu_items')
      .update({ isAvailable })
      .eq('id', id)
      .eq('storeId', store.id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Update availability error:', updateError);
      return res.status(500).json({
        success: false,
        error: 'Failed to update item availability'
      });
    }

    if (!updatedItem) {
      return res.status(404).json({
          success: false,
        error: 'Menu item not found'
      });
    }

    // Get updated statistics
    const { data: allItems, error: itemsError } = await supabaseAdmin
      .from('menu_items')
      .select('isAvailable')
      .eq('storeId', store.id);

    if (itemsError) {
      console.error('❌ Statistics error:', itemsError);
    }

    const statistics = {
      totalItems: allItems?.length || 0,
      availableItems: allItems?.filter(item => item.isAvailable).length || 0,
      outOfStock: allItems?.filter(item => !item.isAvailable).length || 0
    };

    // Simple approach - just log the update
    console.log(`📡 Menu availability changed: ${updatedItem.name} is now ${updatedItem.isAvailable ? 'available' : 'out of stock'}`);

    res.json({
      success: true,
      data: {
        item: updatedItem,
        statistics
      }
    });

  } catch (error) {
    console.error('❌ Update availability error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// GET /api/admin/categories - Real-time categories data
router.get('/categories', async (req, res) => {
  try {
    const storeSlug = req.query.store || 'siddhi';

    // Get store
    const { data: store, error: storeError } = await supabaseAdmin
      .from('stores')
      .select('*')
      .eq('slug', storeSlug)
      .single();

    if (storeError || !store) {
      return res.status(404).json({
        success: false,
        error: 'Store not found'
      });
    }

    // Get categories
    const { data: categories, error: categoriesError } = await supabaseAdmin
      .from('categories')
      .select('*')
      .eq('storeId', store.id)
      .order('id', { ascending: false });

    if (categoriesError) {
      console.error('❌ Categories error:', categoriesError);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch categories'
      });
    }

    res.json({
      success: true,
      data: {
        categories: categories || [],
        total: categories?.length || 0
      }
    });

  } catch (error) {
    console.error('❌ Categories error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// GET /api/admin/debug-orders - Debug orders table
router.get('/debug-orders', async (req, res) => {
  try {
    console.log('🔍 Debug: Checking orders table...')
    
    // Test simple query
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .limit(5);

    console.log('🔍 Orders query result:', { orders, ordersError });

    if (ordersError) {
      return res.status(500).json({
        success: false,
        error: 'Orders query failed',
        details: ordersError
      });
    }

    res.json({
      success: true,
      data: {
        orders: orders || [],
        count: orders?.length || 0
      }
    });

  } catch (error) {
    console.error('❌ Debug orders error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

// GET /api/admin/debug-orders-filtered - Debug orders with store filter
router.get('/debug-orders-filtered', async (req, res) => {
  try {
    const storeSlug = req.query.store || 'siddhi';

    // Get store
    const { data: store, error: storeError } = await supabaseAdmin
      .from('stores')
      .select('*')
      .eq('slug', storeSlug)
      .single();

    if (storeError || !store) {
      return res.status(404).json({
        success: false,
        error: 'Store not found',
        details: storeError
      });
    }

    console.log('🔍 Store found:', store.id);
    
    // Test filtered query
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('storeId', store.id)
      .limit(5);

    console.log('🔍 Filtered orders query result:', { orders, ordersError });

    if (ordersError) {
      return res.status(500).json({
          success: false,
        error: 'Orders query failed',
        details: ordersError
      });
    }

    res.json({
      success: true,
      data: {
        orders: orders || [],
        count: orders?.length || 0,
        storeId: store.id
      }
    });

  } catch (error) {
    console.error('❌ Debug filtered orders error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

// GET /api/admin/debug-categories - Debug categories table
router.get('/debug-categories', async (req, res) => {
  try {
    console.log('🔍 Debug: Checking categories table...')
    
    // Test simple query
    const { data: categories, error: categoriesError } = await supabaseAdmin
      .from('categories')
      .select('*')
      .limit(5);

    console.log('🔍 Categories query result:', { categories, categoriesError });

    if (categoriesError) {
      return res.status(500).json({
        success: false,
        error: 'Categories query failed',
        details: categoriesError
      });
    }

    res.json({
      success: true,
      data: { 
        categories: categories || [],
        count: categories?.length || 0
      }
    });

  } catch (error) {
    console.error('❌ Debug categories error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

// GET /api/admin/coupons - Coupons list (simple)
router.get('/coupons', async (req, res) => {
  try {
    const storeSlug = req.query.store || 'siddhi';

    const { data: store, error: storeError } = await supabaseAdmin
      .from('stores')
      .select('*')
      .eq('slug', storeSlug)
      .single();

    if (storeError || !store) {
      return res.status(404).json({ success: false, error: 'Store not found' });
    }

    // If there is a coupons table
    const { data: coupons, error } = await supabaseAdmin
      .from('coupons')
      .select('*')
      .eq('storeId', store.id)
      .order('id', { ascending: false });

    if (error) {
      console.error('❌ Coupons error:', error);
      return res.status(500).json({ success: false, error: 'Failed to fetch coupons' });
    }

    // Calculate statistics
    const activeCoupons = coupons?.filter(coupon => coupon.isActive).length || 0;
    const totalUsage = coupons?.reduce((sum, coupon) => sum + (coupon.usedCount || 0), 0) || 0;
    const totalSavings = coupons?.reduce((sum, coupon) => {
      if (coupon.type === 'FIXED_AMOUNT') {
        return sum + (coupon.value * (coupon.usedCount || 0));
      } else {
        // For percentage, we'd need order data to calculate actual savings
        return sum + (coupon.value * (coupon.usedCount || 0) * 0.1); // Rough estimate
      }
    }, 0) || 0;
    const conversionRate = coupons?.length > 0 ? Math.round((totalUsage / coupons.length) * 100) : 0;

    res.json({
      success: true,
      data: { 
        coupons: coupons || [], 
        total: coupons?.length || 0,
      statistics: {
        activeCoupons,
        totalUsage,
        totalSavings,
          conversionRate
        }
      } 
    });
        } catch (e) {
    console.error('❌ Coupons error:', e);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// POST /api/admin/coupons - Create new coupon
router.post('/coupons', [
  body('code').notEmpty().withMessage('Coupon code is required'),
  body('name').notEmpty().withMessage('Coupon name is required'),
  body('type').isIn(['PERCENTAGE', 'FIXED_AMOUNT']).withMessage('Valid coupon type is required'),
  body('value').isFloat({ min: 0 }).withMessage('Valid value is required'),
  body('minOrderAmount').optional().isFloat({ min: 0 }).withMessage('Minimum order amount must be positive'),
  body('maxDiscount').optional().isFloat({ min: 0 }).withMessage('Maximum discount must be positive'),
  body('usageLimit').optional().isInt({ min: 1 }).withMessage('Usage limit must be positive'),
  body('validFrom').isISO8601().withMessage('Valid from date is required'),
  body('validUntil').isISO8601().withMessage('Valid until date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      code,
      name,
      description,
      type,
      value,
      minOrderAmount,
      maxDiscount,
      usageLimit,
      validFrom,
      validUntil,
      isActive = true
    } = req.body;

    const storeSlug = req.query.store || 'siddhi';

    // Get store
    const { data: store, error: storeError } = await supabaseAdmin
      .from('stores')
      .select('*')
      .eq('slug', storeSlug)
      .single();

    if (storeError || !store) {
      return res.status(404).json({ success: false, error: 'Store not found' });
    }

    // Check if coupon code already exists
    const { data: existingCoupon, error: checkError } = await supabaseAdmin
      .from('coupons')
      .select('*')
      .eq('code', code)
      .eq('storeId', store.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Coupon check error:', checkError);
      return res.status(500).json({ success: false, error: 'Failed to check coupon' });
    }

    if (existingCoupon) {
      return res.status(400).json({ success: false, error: 'Coupon code already exists' });
    }

    // Create coupon
    const { data: coupon, error: createError } = await supabaseAdmin
      .from('coupons')
      .insert({
        id: require('crypto').randomUUID(),
        code,
        name,
        description,
        type,
        value,
        minOrderAmount,
        maxDiscount,
        usageLimit,
        isActive,
        validFrom: new Date(validFrom).toISOString(),
        validUntil: new Date(validUntil).toISOString(),
        storeId: store.id,
        usedCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .select()
      .single();

    if (createError) {
      console.error('❌ Coupon creation error:', createError);
      return res.status(500).json({ success: false, error: 'Failed to create coupon' });
    }

    res.status(201).json({
      success: true,
      data: {
        id: coupon.id,
        code: coupon.code,
        name: coupon.name,
        description: coupon.description,
        type: coupon.type,
        value: parseFloat(coupon.value),
        minOrderAmount: coupon.minOrderAmount ? parseFloat(coupon.minOrderAmount) : null,
        maxDiscount: coupon.maxDiscount ? parseFloat(coupon.maxDiscount) : null,
        usageLimit: coupon.usageLimit,
        usedCount: coupon.usedCount,
        isActive: coupon.isActive,
        validFrom: coupon.validFrom,
        validUntil: coupon.validUntil,
        createdAt: coupon.createdAt
      }
    });
  } catch (error) {
    console.error('❌ Coupon creation error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// PUT /api/admin/coupons/:id - Update coupon
router.put('/coupons/:id', [
  body('name').optional().notEmpty().withMessage('Coupon name cannot be empty'),
  body('type').optional().isIn(['PERCENTAGE', 'FIXED_AMOUNT']).withMessage('Valid coupon type is required'),
  body('value').optional().isFloat({ min: 0 }).withMessage('Valid value is required'),
  body('minOrderAmount').optional().isFloat({ min: 0 }).withMessage('Minimum order amount must be positive'),
  body('maxDiscount').optional().isFloat({ min: 0 }).withMessage('Maximum discount must be positive'),
  body('usageLimit').optional().isInt({ min: 1 }).withMessage('Usage limit must be positive'),
  body('validFrom').optional().isISO8601().withMessage('Valid from date is required'),
  body('validUntil').optional().isISO8601().withMessage('Valid until date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updateData = req.body;
    const storeSlug = req.query.store || 'siddhi';

    // Get store
    const { data: store, error: storeError } = await supabaseAdmin
      .from('stores')
      .select('*')
      .eq('slug', storeSlug)
      .single();

    if (storeError || !store) {
      return res.status(404).json({ success: false, error: 'Store not found' });
    }

    // Check if coupon exists
    const { data: existingCoupon, error: checkError } = await supabaseAdmin
      .from('coupons')
      .select('*')
      .eq('id', id)
      .eq('storeId', store.id)
      .single();

    if (checkError || !existingCoupon) {
      return res.status(404).json({ success: false, error: 'Coupon not found' });
    }

    // If code is being updated, check for duplicates
    if (updateData.code && updateData.code !== existingCoupon.code) {
      const { data: duplicateCoupon, error: duplicateError } = await supabaseAdmin
        .from('coupons')
        .select('*')
        .eq('code', updateData.code)
        .eq('storeId', store.id)
        .single();

      if (duplicateError && duplicateError.code !== 'PGRST116') {
        console.error('❌ Duplicate check error:', duplicateError);
        return res.status(500).json({ success: false, error: 'Failed to check duplicate' });
      }

      if (duplicateCoupon) {
        return res.status(400).json({ success: false, error: 'Coupon code already exists' });
      }
    }

    // Convert date strings to ISO strings
    if (updateData.validFrom) {
      updateData.validFrom = new Date(updateData.validFrom).toISOString();
    }
    if (updateData.validUntil) {
      updateData.validUntil = new Date(updateData.validUntil).toISOString();
    }

    updateData.updatedAt = new Date().toISOString();

    // Update coupon
    const { data: coupon, error: updateError } = await supabaseAdmin
      .from('coupons')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Coupon update error:', updateError);
      return res.status(500).json({ success: false, error: 'Failed to update coupon' });
    }

    res.json({
      success: true,
      data: {
        id: coupon.id,
        code: coupon.code,
        name: coupon.name,
        description: coupon.description,
        type: coupon.type,
        value: parseFloat(coupon.value),
        minOrderAmount: coupon.minOrderAmount ? parseFloat(coupon.minOrderAmount) : null,
        maxDiscount: coupon.maxDiscount ? parseFloat(coupon.maxDiscount) : null,
        usageLimit: coupon.usageLimit,
        usedCount: coupon.usedCount,
        isActive: coupon.isActive,
        validFrom: coupon.validFrom,
        validUntil: coupon.validUntil,
        updatedAt: coupon.updatedAt
      }
    });
  } catch (error) {
    console.error('❌ Coupon update error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// DELETE /api/admin/coupons/:id - Delete coupon
router.delete('/coupons/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const storeSlug = req.query.store || 'siddhi';

    // Get store
    const { data: store, error: storeError } = await supabaseAdmin
      .from('stores')
      .select('*')
      .eq('slug', storeSlug)
      .single();

    if (storeError || !store) {
      return res.status(404).json({ success: false, error: 'Store not found' });
    }

    // Check if coupon exists
    const { data: coupon, error: checkError } = await supabaseAdmin
      .from('coupons')
      .select('*')
      .eq('id', id)
      .eq('storeId', store.id)
      .single();

    if (checkError || !coupon) {
      return res.status(404).json({ success: false, error: 'Coupon not found' });
    }

    // Delete coupon
    const { error: deleteError } = await supabaseAdmin
      .from('coupons')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('❌ Coupon deletion error:', deleteError);
      return res.status(500).json({ success: false, error: 'Failed to delete coupon' });
    }

    res.json({ success: true, message: 'Coupon deleted successfully' });
  } catch (error) {
    console.error('❌ Coupon deletion error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router;
