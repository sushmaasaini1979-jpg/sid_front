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

    // Get orders for the period
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        customer:customers(*),
        order_items:order_items(
          *,
          menu_item:menu_items(*)
        )
      `)
      .eq('store_id', store.id)
      .gte('created_at', startDate.toISOString())
      .lt('created_at', endDate.toISOString());

    if (ordersError) {
      console.error('❌ Orders error:', ordersError);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch orders'
      });
    }

    // Calculate metrics
    const totalOrders = orders?.length || 0;
    const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
    const pendingOrders = orders?.filter(order => order.status === 'pending').length || 0;
    const completedOrders = orders?.filter(order => order.status === 'completed').length || 0;

    // Get customer count
    const { data: customers, error: customersError } = await supabaseAdmin
      .from('customers')
      .select('*')
      .eq('store_id', store.id);

    if (customersError) {
      console.error('❌ Customers error:', customersError);
    }

    const totalCustomers = customers?.length || 0;

    // Get menu items count
    const { data: menuItems, error: menuError } = await supabaseAdmin
      .from('menu_items')
      .select('*')
      .eq('store_id', store.id)
      .eq('is_available', true);

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

    // Build query
    let query = supabaseAdmin
      .from('orders')
      .select(`
        *,
        customer:customers(*),
        order_items:order_items(
          *,
          menu_item:menu_items(*)
        )
      `)
      .eq('store_id', store.id)
      .order('created_at', { ascending: false })
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

    res.json({
      success: true,
      data: {
        orders: orders || [],
        total: orders?.length || 0
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
      .select(`
        *,
        orders:orders(
          id,
          total_amount,
          status,
          created_at
        )
      `)
      .eq('store_id', store.id)
      .order('created_at', { ascending: false })
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

    // Calculate customer metrics
    const customersWithStats = customers?.map(customer => {
      const orders = customer.orders || [];
      const totalSpent = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
      const totalOrders = orders.length;
      const lastOrder = orders.length > 0 ? orders[0] : null;

      return {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        status: customer.status || 'active',
        totalSpent,
        totalOrders,
        lastOrder: lastOrder ? {
          id: lastOrder.id,
          amount: lastOrder.total_amount,
          status: lastOrder.status,
          date: lastOrder.created_at
        } : null,
        createdAt: customer.created_at,
        updatedAt: customer.updated_at
      };
    }) || [];

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
