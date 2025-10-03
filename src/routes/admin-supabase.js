const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// GET /api/admin/dashboard - Real-time dashboard data
router.get('/dashboard', async (req, res) => {
  try {
    const prisma = req.app.get('prisma');
    const storeSlug = req.query.store || 'siddhi'; // Default to siddhi store
    const period = req.query.period || 'today'; // Default to today

    // Get store
    const store = await prisma.store.findUnique({
      where: { slug: storeSlug }
    });

    if (!store) {
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

    console.log(`📊 Dashboard data for ${period}:`, { startDate, endDate });

    // Get orders for the store within the date range
    const orders = await prisma.order.findMany({
      where: { 
        storeId: store.id,
        createdAt: {
          gte: startDate,
          lt: endDate
        }
      },
      include: {
        customer: true,
        orderItems: {
          include: {
            menuItem: true
          }
        }
      }
    });

    // Calculate metrics
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const pendingOrders = orders.filter(order => order.status === 'PENDING').length;
    const inKitchenOrders = orders.filter(order => order.status === 'PREPARING').length;
    const outForDeliveryOrders = orders.filter(order => order.status === 'OUT_FOR_DELIVERY').length;
    const deliveredOrders = orders.filter(order => order.status === 'DELIVERED').length;
    const cancelledOrders = orders.filter(order => order.status === 'CANCELLED').length;

    // Get recent orders (last 5)
    const recentOrders = orders
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customer.name,
        customerPhone: order.customer.phone,
        items: order.orderItems.map(item => 
          `${item.quantity}x ${item.menuItem.name}`
        ).join(', '),
        total: order.total,
        formattedTotal: new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          minimumFractionDigits: 0,
        }).format(order.total),
        status: order.status,
        createdAt: order.createdAt,
        paymentMethod: order.paymentMethod
      }));

    const dashboardData = {
      totalOrders,
      totalRevenue,
      pendingOrders,
      inKitchenOrders,
      outForDeliveryOrders,
      deliveredOrders,
      cancelledOrders,
      recentOrders,
      period,
      dateRange: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      }
    };

    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('❌ Dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard data'
    });
  }
});

// GET /api/admin/orders - Real-time orders data
router.get('/orders', async (req, res) => {
  try {
    const prisma = req.app.get('prisma');
    const storeSlug = req.query.store || 'siddhi';

    // Get store
    const store = await prisma.store.findUnique({
      where: { slug: storeSlug }
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        error: 'Store not found'
      });
    }

    // Fetch orders with customer and menu item details
    const orders = await prisma.order.findMany({
      where: { storeId: store.id },
      include: {
        customer: true,
        orderItems: {
          include: {
            menuItem: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate order statistics
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(order => order.status === 'PENDING').length;
    const inKitchenOrders = orders.filter(order => order.status === 'PREPARING').length;
    const deliveredOrders = orders.filter(order => order.status === 'DELIVERED').length;

    // Format orders for response
    const formattedOrders = orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customer: {
        name: order.customer.name,
        phone: order.customer.phone,
        email: order.customer.email
      },
      items: order.orderItems.map(item => ({
        id: item.id,
        name: item.menuItem?.name || 'Unknown Item',
        quantity: item.quantity,
        price: item.price,
        total: item.total
      })),
      itemsSummary: order.orderItems.map(item => `${item.quantity}x ${item.menuItem?.name || 'Item'}`).join(', '),
      total: order.total,
      formattedTotal: new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
      }).format(order.total),
      status: order.status,
      createdAt: order.createdAt,
      paymentMethod: order.paymentMethod
    }));

    res.json({
      success: true,
      orders: formattedOrders,
      statistics: {
        totalOrders,
        pendingOrders,
        inKitchenOrders,
        deliveredOrders
      }
    });

  } catch (error) {
    console.error('❌ Orders error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orders data'
    });
  }
});

// GET /api/admin/customers - Real-time customers data
router.get('/customers', async (req, res) => {
  try {
    const prisma = req.app.get('prisma');
    const storeSlug = req.query.store || 'siddhi';

    // Get store
    const store = await prisma.store.findUnique({
      where: { slug: storeSlug }
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        error: 'Store not found'
      });
    }

    // Fetch ALL customers (not just those with orders)
    const customers = await prisma.customer.findMany({
      include: {
        orders: {
          where: { storeId: store.id },
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate statistics
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // New customers this month
    const newThisMonth = customers.filter(customer => 
      new Date(customer.createdAt) >= startOfMonth
    ).length;

    // New customers last month
    const newLastMonth = customers.filter(customer => {
      const customerDate = new Date(customer.createdAt);
      return customerDate >= startOfLastMonth && customerDate <= endOfLastMonth;
    }).length;

    // Calculate growth percentage
    const growthPercentage = newLastMonth > 0 
      ? Math.round(((newThisMonth - newLastMonth) / newLastMonth) * 100)
      : newThisMonth > 0 ? 100 : 0;

    // Active customers (customers with orders)
    const activeCustomers = customers.filter(customer => customer.orders.length > 0).length;

    // Blocked customers
    const blockedCustomers = customers.filter(customer => customer.isBlocked).length;

    // Format customers for response
    const formattedCustomers = customers.map(customer => ({
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
      totalOrders: customer.orders.length,
      totalSpent: customer.orders.reduce((sum, order) => sum + order.total, 0),
      lastOrderDate: customer.orders.length > 0 
        ? customer.orders[0].createdAt 
        : null,
      status: customer.isBlocked ? 'Blocked' : (customer.orders.length > 0 ? 'Active' : 'Inactive'),
      joinDate: customer.createdAt
    }));

    // Calculate statistics
    const statistics = {
      totalCustomers: customers.length,
      activeCustomers: activeCustomers,
      newThisMonth: newThisMonth,
      blockedCustomers: blockedCustomers,
      growthPercentage: growthPercentage,
      newLastMonth: newLastMonth
    };

    res.json({
      success: true,
      customers: formattedCustomers,
      statistics: statistics
    });

  } catch (error) {
    console.error('❌ Customers error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch customers data'
    });
  }
});

// POST /api/admin/orders/:id/status - Update order status
router.put('/orders/:id/status', [
  body('status').isIn(['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'])
    .withMessage('Valid status is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { status, estimatedTime } = req.body;
    const supabaseAdmin = req.app.get('supabaseAdmin');
    const io = req.app.get('io');

    // Update order status in Supabase
    const { data: updatedOrder, error } = await supabaseAdmin
      .from('orders')
      .update({
        status,
        estimated_time: estimatedTime,
        delivered_at: status === 'DELIVERED' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        customer:customers(name, phone),
        store:stores(slug)
      `)
      .single();

    if (error) throw error;

    // Emit real-time update via Socket.IO
    io.to(`order-${id}`).emit('order.updated', {
      orderId: id,
      status,
      estimatedTime,
      deliveredAt: updatedOrder.delivered_at
    });

    io.to(`store-${updatedOrder.store.slug}`).emit('order.status.changed', {
      orderId: id,
      orderNumber: updatedOrder.order_number,
      status,
      customerName: updatedOrder.customer.name
    });

    res.json({
      success: true,
      order: {
        id: updatedOrder.id,
        status: updatedOrder.status,
        estimatedTime: updatedOrder.estimated_time,
        deliveredAt: updatedOrder.delivered_at
      }
    });
  } catch (error) {
    console.error('❌ Order status update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update order status'
    });
  }
});

// GET /api/admin/realtime/subscribe - Subscribe to real-time updates
router.get('/realtime/subscribe', (req, res) => {
  try {
    const realtimeService = req.app.get('realtimeService');
    const storeSlug = req.query.store || 'siddhi';

    // Set up real-time subscriptions
    const orderSubscription = realtimeService.subscribeToOrders(storeSlug, (payload) => {
      const io = req.app.get('io');
      io.to(`store-${storeSlug}`).emit('order.update', payload);
    });

    const customerSubscription = realtimeService.subscribeToCustomers((payload) => {
      const io = req.app.get('io');
      io.emit('customer.update', payload);
    });

    res.json({
      success: true,
      message: 'Subscribed to real-time updates',
      subscriptions: {
        orders: `orders:${storeSlug}`,
        customers: 'customers'
      }
    });
  } catch (error) {
    console.error('❌ Realtime subscription error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to subscribe to real-time updates'
    });
  }
});

// GET /api/admin/menu-items - Get menu items with statistics
router.get('/menu-items', async (req, res) => {
  try {
    const prisma = req.app.get('prisma');
    const storeSlug = req.query.store || 'siddhi';

    // Get store
    const store = await prisma.store.findUnique({
      where: { slug: storeSlug }
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        error: 'Store not found'
      });
    }

    // Fetch menu items with categories
    const menuItems = await prisma.menuItem.findMany({
      where: { storeId: store.id },
      include: {
        category: true
      },
      orderBy: { sortOrder: 'asc' }
    });

    // Fetch categories
    const categories = await prisma.category.findMany({
      where: { storeId: store.id },
      include: {
        _count: {
          select: { menuItems: true }
        }
      },
      orderBy: { sortOrder: 'asc' }
    });

    // Calculate statistics
    const totalItems = menuItems.length;
    const totalCategories = categories.length;
    const availableItems = menuItems.filter(item => item.isAvailable).length;
    const outOfStockItems = menuItems.filter(item => !item.isAvailable).length;

    // Format menu items for response
    const formattedMenuItems = menuItems.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      isVeg: item.isVeg,
      isAvailable: item.isAvailable,
      category: item.category.name,
      categoryId: item.category.id,
      sortOrder: item.sortOrder
    }));

    // Format categories for response
    const formattedCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      itemCount: category._count.menuItems,
      isActive: category.isActive,
      sortOrder: category.sortOrder
    }));

    res.json({
      success: true,
      menuItems: formattedMenuItems,
      categories: formattedCategories,
      statistics: {
        totalItems,
        totalCategories,
        availableItems,
        outOfStockItems
      }
    });

  } catch (error) {
    console.error('❌ Menu items error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch menu items'
    });
  }
});

// POST /api/admin/menu-items - Add new menu item
router.post('/menu-items', [
  body('name').notEmpty().withMessage('Name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a valid number'),
  body('categoryId').notEmpty().withMessage('Category is required'),
  body('isVeg').isBoolean().withMessage('isVeg must be a boolean'),
  body('isAvailable').isBoolean().withMessage('isAvailable must be a boolean'),
  body('imageUrl').optional().isURL().withMessage('Image URL must be valid')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { name, description, price, categoryId, isVeg, isAvailable, imageUrl } = req.body;
    console.log('📥 Received item data:', { name, description, price, categoryId, isVeg, isAvailable, imageUrl });
    console.log('📥 Price type:', typeof price, 'Value:', price);
    
    const prisma = req.app.get('prisma');
    const io = req.app.get('io');
    const storeSlug = req.query.store || 'siddhi';

    // Get store
    const store = await prisma.store.findUnique({
      where: { slug: storeSlug }
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        error: 'Store not found'
      });
    }

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { 
        id: categoryId,
        storeId: store.id
      }
    });

    if (!category) {
      return res.status(400).json({
        success: false,
        error: 'Category not found'
      });
    }

    // Get the next sort order for this category
    const lastItem = await prisma.menuItem.findFirst({
      where: { 
        categoryId: categoryId,
        storeId: store.id
      },
      orderBy: { sortOrder: 'desc' }
    });

    const nextSortOrder = (lastItem?.sortOrder || 0) + 1;

    // Create new menu item
    const newMenuItem = await prisma.menuItem.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        categoryId,
        storeId: store.id,
        isVeg,
        isAvailable,
        imageUrl: imageUrl || null,
        sortOrder: nextSortOrder
      },
      include: {
        category: true
      }
    });

    // Get updated statistics
    const menuItems = await prisma.menuItem.findMany({
      where: { storeId: store.id }
    });

    const statistics = {
      totalItems: menuItems.length,
      availableItems: menuItems.filter(item => item.isAvailable).length,
      outOfStockItems: menuItems.filter(item => !item.isAvailable).length
    };

    // Emit real-time updates
    io.to(`store-${storeSlug}`).emit('menu.item.added', {
      item: {
        id: newMenuItem.id,
        name: newMenuItem.name,
        description: newMenuItem.description,
        price: newMenuItem.price,
        isVeg: newMenuItem.isVeg,
        isAvailable: newMenuItem.isAvailable,
        category: newMenuItem.category.name,
        imageUrl: newMenuItem.imageUrl
      },
      statistics: statistics,
      timestamp: new Date().toISOString()
    });

    io.to(`admin-${storeSlug}`).emit('menu.statistics.updated', {
      statistics: statistics,
      newItem: {
        id: newMenuItem.id,
        name: newMenuItem.name,
        isAvailable: newMenuItem.isAvailable
      }
    });

    res.status(201).json({
      success: true,
      item: {
        id: newMenuItem.id,
        name: newMenuItem.name,
        description: newMenuItem.description,
        price: newMenuItem.price,
        isVeg: newMenuItem.isVeg,
        isAvailable: newMenuItem.isAvailable,
        category: newMenuItem.category.name,
        categoryId: newMenuItem.categoryId,
        imageUrl: newMenuItem.imageUrl,
        sortOrder: newMenuItem.sortOrder
      },
      statistics: statistics
    });

  } catch (error) {
    console.error('❌ Add menu item error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add menu item'
    });
  }
});

// DELETE /api/admin/menu-items/:id - Delete menu item
router.delete('/menu-items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const prisma = req.app.get('prisma');
    const io = req.app.get('io');
    const storeSlug = req.query.store || 'siddhi';

    // Get store
    const store = await prisma.store.findUnique({
      where: { slug: storeSlug }
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        error: 'Store not found'
      });
    }

    // Find the item to delete
    const itemToDelete = await prisma.menuItem.findUnique({
      where: {
        id: id,
        storeId: store.id
      },
      include: {
        category: true
      }
    });

    if (!itemToDelete) {
      return res.status(404).json({
        success: false,
        error: 'Menu item not found'
      });
    }

    // Delete the item
    await prisma.menuItem.delete({
      where: { id: id }
    });

    // Get updated statistics
    const menuItems = await prisma.menuItem.findMany({
      where: { storeId: store.id }
    });

    const statistics = {
      totalItems: menuItems.length,
      availableItems: menuItems.filter(item => item.isAvailable).length,
      outOfStockItems: menuItems.filter(item => !item.isAvailable).length
    };

    // Emit real-time updates
    io.to(`store-${storeSlug}`).emit('menu.item.deleted', {
      itemId: id,
      itemName: itemToDelete.name,
      statistics: statistics,
      timestamp: new Date().toISOString()
    });

    io.to(`admin-${storeSlug}`).emit('menu.statistics.updated', {
      statistics: statistics,
      deletedItem: {
        id: itemToDelete.id,
        name: itemToDelete.name
      }
    });

    res.json({
      success: true,
      message: `${itemToDelete.name} deleted successfully`,
      statistics: statistics
    });

  } catch (error) {
    console.error('❌ Delete menu item error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete menu item'
    });
  }
});

// PUT /api/admin/menu-items/:id - Update menu item
router.put('/menu-items/:id', [
  body('name').notEmpty().withMessage('Name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a valid number'),
  body('categoryId').notEmpty().withMessage('Category is required'),
  body('isVeg').isBoolean().withMessage('isVeg must be a boolean'),
  body('isAvailable').isBoolean().withMessage('isAvailable must be a boolean'),
  body('imageUrl').optional().isURL().withMessage('Image URL must be valid')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const { name, description, price, categoryId, isVeg, isAvailable, imageUrl } = req.body;
    console.log('📥 Updating item data:', { id, name, description, price, categoryId, isVeg, isAvailable, imageUrl });
    
    const prisma = req.app.get('prisma');
    const io = req.app.get('io');
    const storeSlug = req.query.store || 'siddhi';

    // Get store
    const store = await prisma.store.findUnique({
      where: { slug: storeSlug }
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        error: 'Store not found'
      });
    }

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { 
        id: categoryId,
        storeId: store.id
      }
    });

    if (!category) {
      return res.status(400).json({
        success: false,
        error: 'Category not found'
      });
    }

    // Update the menu item
    const updatedItem = await prisma.menuItem.update({
      where: {
        id: id,
        storeId: store.id
      },
      data: {
        name,
        description,
        price: parseFloat(price),
        categoryId,
        isVeg,
        isAvailable,
        imageUrl: imageUrl || null,
        updatedAt: new Date()
      },
      include: {
        category: true
      }
    });

    // Get updated statistics
    const menuItems = await prisma.menuItem.findMany({
      where: { storeId: store.id }
    });

    const statistics = {
      totalItems: menuItems.length,
      availableItems: menuItems.filter(item => item.isAvailable).length,
      outOfStockItems: menuItems.filter(item => !item.isAvailable).length
    };

    // Emit real-time updates
    io.to(`store-${storeSlug}`).emit('menu.item.updated', {
      item: {
        id: updatedItem.id,
        name: updatedItem.name,
        description: updatedItem.description,
        price: updatedItem.price,
        isVeg: updatedItem.isVeg,
        isAvailable: updatedItem.isAvailable,
        category: updatedItem.category.name,
        imageUrl: updatedItem.imageUrl
      },
      statistics: statistics,
      timestamp: new Date().toISOString()
    });

    io.to(`admin-${storeSlug}`).emit('menu.statistics.updated', {
      statistics: statistics,
      updatedItem: {
        id: updatedItem.id,
        name: updatedItem.name,
        isAvailable: updatedItem.isAvailable
      }
    });

    res.json({
      success: true,
      item: {
        id: updatedItem.id,
        name: updatedItem.name,
        description: updatedItem.description,
        price: updatedItem.price,
        isVeg: updatedItem.isVeg,
        isAvailable: updatedItem.isAvailable,
        category: updatedItem.category.name,
        categoryId: updatedItem.categoryId,
        imageUrl: updatedItem.imageUrl,
        sortOrder: updatedItem.sortOrder
      },
      statistics: statistics
    });

  } catch (error) {
    console.error('❌ Update menu item error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update menu item'
    });
  }
});

// POST /api/admin/categories - Add new category
router.post('/categories', [
  body('name').notEmpty().withMessage('Name is required'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('slug').notEmpty().withMessage('Slug is required'),
  body('sortOrder').optional().isInt({ min: 0 }).withMessage('Sort order must be a positive number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Category validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { name, description, slug, sortOrder } = req.body;
    console.log('📥 Creating category:', { name, description, slug, sortOrder });
    
    const prisma = req.app.get('prisma');
    const io = req.app.get('io');
    const storeSlug = req.query.store || 'siddhi';

    // Get store
    const store = await prisma.store.findUnique({
      where: { slug: storeSlug }
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        error: 'Store not found'
      });
    }

    // Check if category with same slug already exists
    const existingCategory = await prisma.category.findUnique({
      where: {
        storeId_slug: {
          storeId: store.id,
          slug: slug
        }
      }
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        error: 'Category with this slug already exists'
      });
    }

    // Get the next sort order
    const lastCategory = await prisma.category.findFirst({
      where: { storeId: store.id },
      orderBy: { sortOrder: 'desc' }
    });

    const nextSortOrder = sortOrder || (lastCategory?.sortOrder || 0) + 1;

    // Create new category
    const newCategory = await prisma.category.create({
      data: {
        name,
        description: description || null,
        slug,
        sortOrder: nextSortOrder,
        storeId: store.id,
        isActive: true
      }
    });

    // Get updated statistics
    const categories = await prisma.category.findMany({
      where: { storeId: store.id },
      include: {
        _count: {
          select: { menuItems: true }
        }
      }
    });

    const statistics = {
      totalCategories: categories.length,
      activeCategories: categories.filter(cat => cat.isActive).length
    };

    // Emit real-time updates
    io.to(`store-${storeSlug}`).emit('category.added', {
      category: {
        id: newCategory.id,
        name: newCategory.name,
        slug: newCategory.slug,
        description: newCategory.description,
        isActive: newCategory.isActive,
        sortOrder: newCategory.sortOrder
      },
      statistics: statistics,
      timestamp: new Date().toISOString()
    });

    io.to(`admin-${storeSlug}`).emit('menu.statistics.updated', {
      statistics: {
        totalCategories: statistics.totalCategories
      }
    });

    res.status(201).json({
      success: true,
      category: {
        id: newCategory.id,
        name: newCategory.name,
        slug: newCategory.slug,
        description: newCategory.description,
        isActive: newCategory.isActive,
        sortOrder: newCategory.sortOrder,
        itemCount: 0
      },
      statistics: statistics
    });

  } catch (error) {
    console.error('❌ Add category error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add category'
    });
  }
});

// PUT /api/admin/categories/:id - Update category
router.put('/categories/:id', [
  body('name').notEmpty().withMessage('Name is required'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('slug').notEmpty().withMessage('Slug is required'),
  body('sortOrder').optional().isInt({ min: 0 }).withMessage('Sort order must be a positive number'),
  body('isActive').isBoolean().withMessage('isActive must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Category validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const { name, description, slug, sortOrder, isActive } = req.body;
    console.log('📥 Updating category:', { id, name, description, slug, sortOrder, isActive });
    
    const prisma = req.app.get('prisma');
    const io = req.app.get('io');
    const storeSlug = req.query.store || 'siddhi';

    // Get store
    const store = await prisma.store.findUnique({
      where: { slug: storeSlug }
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        error: 'Store not found'
      });
    }

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: {
        id: id,
        storeId: store.id
      }
    });

    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    // Check if slug is being changed and if new slug already exists
    if (slug !== existingCategory.slug) {
      const slugExists = await prisma.category.findUnique({
        where: {
          storeId_slug: {
            storeId: store.id,
            slug: slug
          }
        }
      });

      if (slugExists) {
        return res.status(400).json({
          success: false,
          error: 'Category with this slug already exists'
        });
      }
    }

    // Update the category
    const updatedCategory = await prisma.category.update({
      where: {
        id: id,
        storeId: store.id
      },
      data: {
        name,
        description: description || null,
        slug,
        sortOrder: sortOrder || existingCategory.sortOrder,
        isActive,
        updatedAt: new Date()
      },
      include: {
        _count: {
          select: { menuItems: true }
        }
      }
    });

    // Get updated statistics
    const categories = await prisma.category.findMany({
      where: { storeId: store.id },
      include: {
        _count: {
          select: { menuItems: true }
        }
      }
    });

    const statistics = {
      totalCategories: categories.length,
      activeCategories: categories.filter(cat => cat.isActive).length
    };

    // Emit real-time updates
    io.to(`store-${storeSlug}`).emit('category.updated', {
      category: {
        id: updatedCategory.id,
        name: updatedCategory.name,
        slug: updatedCategory.slug,
        description: updatedCategory.description,
        isActive: updatedCategory.isActive,
        sortOrder: updatedCategory.sortOrder
      },
      statistics: statistics,
      timestamp: new Date().toISOString()
    });

    io.to(`admin-${storeSlug}`).emit('menu.statistics.updated', {
      statistics: {
        totalCategories: statistics.totalCategories
      }
    });

    res.json({
      success: true,
      category: {
        id: updatedCategory.id,
        name: updatedCategory.name,
        slug: updatedCategory.slug,
        description: updatedCategory.description,
        isActive: updatedCategory.isActive,
        sortOrder: updatedCategory.sortOrder,
        itemCount: updatedCategory._count.menuItems
      },
      statistics: statistics
    });

  } catch (error) {
    console.error('❌ Update category error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update category'
    });
  }
});

// DELETE /api/admin/categories/:id - Delete category
router.delete('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const prisma = req.app.get('prisma');
    const io = req.app.get('io');
    const storeSlug = req.query.store || 'siddhi';

    // Get store
    const store = await prisma.store.findUnique({
      where: { slug: storeSlug }
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        error: 'Store not found'
      });
    }

    // Find the category to delete
    const categoryToDelete = await prisma.category.findUnique({
      where: {
        id: id,
        storeId: store.id
      },
      include: {
        _count: {
          select: { menuItems: true }
        }
      }
    });

    if (!categoryToDelete) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    // Check if category has menu items
    if (categoryToDelete._count.menuItems > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete category "${categoryToDelete.name}" because it contains ${categoryToDelete._count.menuItems} menu items. Please move or delete the items first.`
      });
    }

    // Delete the category
    await prisma.category.delete({
      where: { id: id }
    });

    // Get updated statistics
    const categories = await prisma.category.findMany({
      where: { storeId: store.id }
    });

    const statistics = {
      totalCategories: categories.length,
      activeCategories: categories.filter(cat => cat.isActive).length
    };

    // Emit real-time updates
    io.to(`store-${storeSlug}`).emit('category.deleted', {
      categoryId: id,
      categoryName: categoryToDelete.name,
      statistics: statistics,
      timestamp: new Date().toISOString()
    });

    io.to(`admin-${storeSlug}`).emit('menu.statistics.updated', {
      statistics: {
        totalCategories: statistics.totalCategories
      }
    });

    res.json({
      success: true,
      message: `Category "${categoryToDelete.name}" deleted successfully`,
      statistics: statistics
    });

  } catch (error) {
    console.error('❌ Delete category error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete category'
    });
  }
});

// GET /api/admin/coupons - Get coupons with statistics
router.get('/coupons', async (req, res) => {
  try {
    const prisma = req.app.get('prisma');
    const storeSlug = req.query.store || 'siddhi';

    // Get store
    const store = await prisma.store.findUnique({
      where: { slug: storeSlug }
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        error: 'Store not found'
      });
    }

    // Get all coupons for the store
    const coupons = await prisma.coupon.findMany({
      where: { storeId: store.id },
      include: {
        orders: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate statistics
    const activeCoupons = coupons.filter(coupon => coupon.isActive).length;
    const totalUsage = coupons.reduce((sum, coupon) => sum + coupon.usedCount, 0);
    const totalSavings = coupons.reduce((sum, coupon) => {
      return sum + coupon.orders.reduce((orderSum, order) => {
        return orderSum + (order.discount || 0);
      }, 0);
    }, 0);

    // Calculate conversion rate (orders with coupons / total orders)
    const totalOrders = await prisma.order.count({
      where: { storeId: store.id }
    });
    const ordersWithCoupons = await prisma.order.count({
      where: { 
        storeId: store.id,
        couponId: { not: null }
      }
    });
    const conversionRate = totalOrders > 0 ? Math.round((ordersWithCoupons / totalOrders) * 100) : 0;

    // Format coupons for response
    const formattedCoupons = coupons.map(coupon => ({
      id: coupon.id,
      code: coupon.code,
      name: coupon.name,
      description: coupon.description,
      type: coupon.type,
      value: coupon.value,
      minOrderAmount: coupon.minOrderAmount,
      maxDiscount: coupon.maxDiscount,
      usageLimit: coupon.usageLimit,
      usedCount: coupon.usedCount,
      isActive: coupon.isActive,
      validFrom: coupon.validFrom,
      validUntil: coupon.validUntil,
      createdAt: coupon.createdAt,
      totalSavings: coupon.orders.reduce((sum, order) => sum + (order.discount || 0), 0)
    }));

    const statistics = {
      activeCoupons,
      totalUsage,
      totalSavings,
      conversionRate
    };

    res.json({
      success: true,
      coupons: formattedCoupons,
      statistics: statistics
    });

  } catch (error) {
    console.error('❌ Coupons error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch coupons data'
    });
  }
});

// POST /api/admin/coupons - Create new coupon
router.post('/coupons', [
  body('code').notEmpty().withMessage('Coupon code is required'),
  body('name').notEmpty().withMessage('Coupon name is required'),
  body('type').isIn(['PERCENTAGE', 'FIXED_AMOUNT']).withMessage('Type must be PERCENTAGE or FIXED_AMOUNT'),
  body('value').isFloat({ min: 0 }).withMessage('Value must be a positive number'),
  body('minOrderAmount').optional().isFloat({ min: 0 }).withMessage('Min order amount must be a positive number'),
  body('maxDiscount').optional().isFloat({ min: 0 }).withMessage('Max discount must be a positive number'),
  body('usageLimit').optional().isInt({ min: 1 }).withMessage('Usage limit must be a positive integer'),
  body('validFrom').isISO8601().withMessage('Valid from must be a valid date'),
  body('validUntil').isISO8601().withMessage('Valid until must be a valid date'),
  body('description').optional().isString().withMessage('Description must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Coupon validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { code, name, description, type, value, minOrderAmount, maxDiscount, usageLimit, validFrom, validUntil } = req.body;
    console.log('📥 Creating coupon:', { code, name, type, value });
    
    const prisma = req.app.get('prisma');
    const io = req.app.get('io');
    const storeSlug = req.query.store || 'siddhi';

    // Get store
    const store = await prisma.store.findUnique({
      where: { slug: storeSlug }
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        error: 'Store not found'
      });
    }

    // Check if coupon code already exists
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code: code }
    });

    if (existingCoupon) {
      return res.status(400).json({
        success: false,
        error: 'Coupon code already exists'
      });
    }

    // Create new coupon
    const newCoupon = await prisma.coupon.create({
      data: {
        code,
        name,
        description: description || null,
        type,
        value: parseFloat(value),
        minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : null,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
        validFrom: new Date(validFrom),
        validUntil: new Date(validUntil),
        storeId: store.id,
        isActive: true
      }
    });

    // Get updated statistics
    const coupons = await prisma.coupon.findMany({
      where: { storeId: store.id },
      include: { orders: true }
    });

    const activeCoupons = coupons.filter(coupon => coupon.isActive).length;
    const totalUsage = coupons.reduce((sum, coupon) => sum + coupon.usedCount, 0);
    const totalSavings = coupons.reduce((sum, coupon) => {
      return sum + coupon.orders.reduce((orderSum, order) => {
        return orderSum + (order.discount || 0);
      }, 0);
    }, 0);

    const statistics = {
      activeCoupons,
      totalUsage,
      totalSavings,
      conversionRate: 0 // Will be calculated separately
    };

    // Emit real-time updates
    io.to(`admin-${storeSlug}`).emit('coupon.added', {
      coupon: {
        id: newCoupon.id,
        code: newCoupon.code,
        name: newCoupon.name,
        type: newCoupon.type,
        value: newCoupon.value,
        isActive: newCoupon.isActive
      },
      statistics: statistics,
      timestamp: new Date().toISOString()
    });

    res.status(201).json({
      success: true,
      coupon: {
        id: newCoupon.id,
        code: newCoupon.code,
        name: newCoupon.name,
        description: newCoupon.description,
        type: newCoupon.type,
        value: newCoupon.value,
        minOrderAmount: newCoupon.minOrderAmount,
        maxDiscount: newCoupon.maxDiscount,
        usageLimit: newCoupon.usageLimit,
        usedCount: newCoupon.usedCount,
        isActive: newCoupon.isActive,
        validFrom: newCoupon.validFrom,
        validUntil: newCoupon.validUntil,
        createdAt: newCoupon.createdAt
      },
      statistics: statistics
    });

  } catch (error) {
    console.error('❌ Create coupon error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create coupon'
    });
  }
});

// PUT /api/admin/coupons/:id - Update coupon
router.put('/coupons/:id', [
  body('code').notEmpty().withMessage('Coupon code is required'),
  body('name').notEmpty().withMessage('Coupon name is required'),
  body('type').isIn(['PERCENTAGE', 'FIXED_AMOUNT']).withMessage('Type must be PERCENTAGE or FIXED_AMOUNT'),
  body('value').isFloat({ min: 0 }).withMessage('Value must be a positive number'),
  body('minOrderAmount').optional().isFloat({ min: 0 }).withMessage('Min order amount must be a positive number'),
  body('maxDiscount').optional().isFloat({ min: 0 }).withMessage('Max discount must be a positive number'),
  body('usageLimit').optional().isInt({ min: 1 }).withMessage('Usage limit must be a positive integer'),
  body('validFrom').isISO8601().withMessage('Valid from must be a valid date'),
  body('validUntil').isISO8601().withMessage('Valid until must be a valid date'),
  body('isActive').isBoolean().withMessage('isActive must be a boolean'),
  body('description').optional().isString().withMessage('Description must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Coupon validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const { code, name, description, type, value, minOrderAmount, maxDiscount, usageLimit, validFrom, validUntil, isActive } = req.body;
    console.log('📥 Updating coupon:', { id, code, name, type, value });
    
    const prisma = req.app.get('prisma');
    const io = req.app.get('io');
    const storeSlug = req.query.store || 'siddhi';

    // Get store
    const store = await prisma.store.findUnique({
      where: { slug: storeSlug }
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        error: 'Store not found'
      });
    }

    // Check if coupon exists
    const existingCoupon = await prisma.coupon.findUnique({
      where: {
        id: id,
        storeId: store.id
      }
    });

    if (!existingCoupon) {
      return res.status(404).json({
        success: false,
        error: 'Coupon not found'
      });
    }

    // Check if code is being changed and if new code already exists
    if (code !== existingCoupon.code) {
      const codeExists = await prisma.coupon.findUnique({
        where: { code: code }
      });

      if (codeExists) {
        return res.status(400).json({
          success: false,
          error: 'Coupon code already exists'
        });
      }
    }

    // Update the coupon
    const updatedCoupon = await prisma.coupon.update({
      where: {
        id: id,
        storeId: store.id
      },
      data: {
        code,
        name,
        description: description || null,
        type,
        value: parseFloat(value),
        minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : null,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
        validFrom: new Date(validFrom),
        validUntil: new Date(validUntil),
        isActive,
        updatedAt: new Date()
      }
    });

    // Get updated statistics
    const coupons = await prisma.coupon.findMany({
      where: { storeId: store.id },
      include: { orders: true }
    });

    const activeCoupons = coupons.filter(coupon => coupon.isActive).length;
    const totalUsage = coupons.reduce((sum, coupon) => sum + coupon.usedCount, 0);
    const totalSavings = coupons.reduce((sum, coupon) => {
      return sum + coupon.orders.reduce((orderSum, order) => {
        return orderSum + (order.discount || 0);
      }, 0);
    }, 0);

    const statistics = {
      activeCoupons,
      totalUsage,
      totalSavings,
      conversionRate: 0 // Will be calculated separately
    };

    // Emit real-time updates
    io.to(`admin-${storeSlug}`).emit('coupon.updated', {
      coupon: {
        id: updatedCoupon.id,
        code: updatedCoupon.code,
        name: updatedCoupon.name,
        type: updatedCoupon.type,
        value: updatedCoupon.value,
        isActive: updatedCoupon.isActive
      },
      statistics: statistics,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      coupon: {
        id: updatedCoupon.id,
        code: updatedCoupon.code,
        name: updatedCoupon.name,
        description: updatedCoupon.description,
        type: updatedCoupon.type,
        value: updatedCoupon.value,
        minOrderAmount: updatedCoupon.minOrderAmount,
        maxDiscount: updatedCoupon.maxDiscount,
        usageLimit: updatedCoupon.usageLimit,
        usedCount: updatedCoupon.usedCount,
        isActive: updatedCoupon.isActive,
        validFrom: updatedCoupon.validFrom,
        validUntil: updatedCoupon.validUntil,
        createdAt: updatedCoupon.createdAt
      },
      statistics: statistics
    });

  } catch (error) {
    console.error('❌ Update coupon error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update coupon'
    });
  }
});

// DELETE /api/admin/coupons/:id - Delete coupon
router.delete('/coupons/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const prisma = req.app.get('prisma');
    const io = req.app.get('io');
    const storeSlug = req.query.store || 'siddhi';

    // Get store
    const store = await prisma.store.findUnique({
      where: { slug: storeSlug }
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        error: 'Store not found'
      });
    }

    // Find the coupon to delete
    const couponToDelete = await prisma.coupon.findUnique({
      where: {
        id: id,
        storeId: store.id
      },
      include: {
        orders: true
      }
    });

    if (!couponToDelete) {
      return res.status(404).json({
        success: false,
        error: 'Coupon not found'
      });
    }

    // Check if coupon has been used
    if (couponToDelete.usedCount > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete coupon "${couponToDelete.name}" because it has been used ${couponToDelete.usedCount} times. Please deactivate it instead.`
      });
    }

    // Delete the coupon
    await prisma.coupon.delete({
      where: { id: id }
    });

    // Get updated statistics
    const coupons = await prisma.coupon.findMany({
      where: { storeId: store.id },
      include: { orders: true }
    });

    const activeCoupons = coupons.filter(coupon => coupon.isActive).length;
    const totalUsage = coupons.reduce((sum, coupon) => sum + coupon.usedCount, 0);
    const totalSavings = coupons.reduce((sum, coupon) => {
      return sum + coupon.orders.reduce((orderSum, order) => {
        return orderSum + (order.discount || 0);
      }, 0);
    }, 0);

    const statistics = {
      activeCoupons,
      totalUsage,
      totalSavings,
      conversionRate: 0 // Will be calculated separately
    };

    // Emit real-time updates
    io.to(`admin-${storeSlug}`).emit('coupon.deleted', {
      couponId: id,
      couponName: couponToDelete.name,
      statistics: statistics,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      message: `Coupon "${couponToDelete.name}" deleted successfully`,
      statistics: statistics
    });

  } catch (error) {
    console.error('❌ Delete coupon error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete coupon'
    });
  }
});

// GET /api/admin/transactions - Get payment transactions with statistics
router.get('/transactions', async (req, res) => {
  try {
    const prisma = req.app.get('prisma');
    const storeSlug = req.query.store || 'siddhi';
    const timeFilter = req.query.period || 'today';

    // Get store
    const store = await prisma.store.findUnique({
      where: { slug: storeSlug }
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        error: 'Store not found'
      });
    }

    // Calculate date range based on filter
    const now = new Date();
    let startDate;
    
    switch (timeFilter) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }

    // Fetch orders with customer details for transactions
    const orders = await prisma.order.findMany({
      where: { 
        storeId: store.id,
        createdAt: {
          gte: startDate
        }
      },
      include: {
        customer: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate statistics
    const totalTransactions = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const pendingTransactions = orders.filter(order => order.status === 'PENDING').length;

    // Format transactions for response
    const formattedTransactions = orders.map(order => ({
      id: order.orderNumber,
      date: new Date(order.createdAt).toLocaleString('en-IN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      customer: order.customer.name,
      method: order.paymentMethod,
      amount: order.total,
      status: order.status === 'PENDING' ? 'Pending' : 
              order.status === 'DELIVERED' ? 'Completed' : 
              order.status === 'CANCELLED' ? 'Failed' : 'Completed'
    }));

    res.json({
      success: true,
      transactions: formattedTransactions,
      statistics: {
        totalTransactions,
        totalRevenue,
        pendingTransactions
      }
    });

  } catch (error) {
    console.error('❌ Transactions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transactions'
    });
  }
});

// GET /api/admin/coupons - Get coupons with statistics
router.get('/coupons', async (req, res) => {
  try {
    const prisma = req.app.get('prisma');
    const storeSlug = req.query.store || 'siddhi';

    // Get store
    const store = await prisma.store.findUnique({
      where: { slug: storeSlug }
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        error: 'Store not found'
      });
    }

    // Fetch coupons
    const coupons = await prisma.coupon.findMany({
      where: { storeId: store.id },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate statistics
    const activeCoupons = coupons.filter(coupon => coupon.isActive && new Date(coupon.expiryDate) > new Date()).length;
    const totalUsage = coupons.reduce((sum, coupon) => sum + coupon.usedCount, 0);
    const totalSavings = coupons.reduce((sum, coupon) => sum + (coupon.usedCount * (coupon.type === 'PERCENTAGE' ? 50 : coupon.value)), 0);

    // Format coupons for response
    const formattedCoupons = coupons.map(coupon => ({
      id: coupon.code,
      name: coupon.name,
      description: coupon.description,
      type: coupon.type.toLowerCase(),
      value: coupon.value,
      minOrder: coupon.minOrderAmount,
      maxDiscount: coupon.maxDiscountAmount,
      status: coupon.isActive ? 'Active' : 'Inactive',
      usage: coupon.usedCount,
      limit: coupon.usageLimit,
      expiry: coupon.expiryDate
    }));

    res.json({
      success: true,
      coupons: formattedCoupons,
      statistics: {
        activeCoupons,
        totalUsage,
        totalSavings,
        conversionRate: 15.2 // This would need to be calculated based on actual data
      }
    });

  } catch (error) {
    console.error('❌ Coupons error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch coupons'
    });
  }
});

// PUT /api/admin/menu-items/:id/availability - Update menu item availability
router.put('/menu-items/:id/availability', [
  body('isAvailable').isBoolean().withMessage('isAvailable must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const { id } = req.params;
    const { isAvailable } = req.body;
    const prisma = req.app.get('prisma');
    const io = req.app.get('io');
    const storeSlug = req.query.store || 'siddhi';

    // Get store
    const store = await prisma.store.findUnique({
      where: { slug: storeSlug }
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        error: 'Store not found'
      });
    }

    // Update menu item availability
    const updatedItem = await prisma.menuItem.update({
      where: { 
        id: id,
        storeId: store.id 
      },
      data: { 
        isAvailable: isAvailable,
        updatedAt: new Date()
      },
      include: {
        category: true
      }
    });

    // Get updated statistics
    const menuItems = await prisma.menuItem.findMany({
      where: { storeId: store.id }
    });

    const statistics = {
      totalItems: menuItems.length,
      availableItems: menuItems.filter(item => item.isAvailable).length,
      outOfStockItems: menuItems.filter(item => !item.isAvailable).length
    };

    // Emit real-time updates
    io.to(`store-${storeSlug}`).emit('menu.availability.changed', {
      itemId: id,
      itemName: updatedItem.name,
      isAvailable: isAvailable,
      statistics: statistics,
      timestamp: new Date().toISOString()
    });

    // Emit to admin dashboard for statistics update
    io.to(`admin-${storeSlug}`).emit('menu.statistics.updated', {
      statistics: statistics,
      changedItem: {
        id: updatedItem.id,
        name: updatedItem.name,
        isAvailable: updatedItem.isAvailable
      }
    });

    res.json({
      success: true,
      item: {
        id: updatedItem.id,
        name: updatedItem.name,
        isAvailable: updatedItem.isAvailable,
        category: updatedItem.category.name
      },
      statistics: statistics
    });

  } catch (error) {
    console.error('❌ Menu availability update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update menu item availability'
    });
  }
});

// GET /api/admin/reports - Get analytics and reports data
router.get('/reports', async (req, res) => {
  try {
    const prisma = req.app.get('prisma');
    const storeSlug = req.query.store || 'siddhi';
    const timeFilter = req.query.period || 'today';

    // Get store
    const store = await prisma.store.findUnique({
      where: { slug: storeSlug }
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        error: 'Store not found'
      });
    }

    // Calculate date range based on filter
    const now = new Date();
    let startDate;
    
    switch (timeFilter) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }

    // Fetch orders for analytics
    const orders = await prisma.order.findMany({
      where: { 
        storeId: store.id,
        createdAt: {
          gte: startDate
        }
      },
      include: {
        customer: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate analytics
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const customerSatisfaction = 4.7; // This would need to be calculated from actual reviews/ratings

    // Calculate top performing items
    const menuItems = await prisma.menuItem.findMany({
      where: { storeId: store.id }
    });

    const topItems = menuItems.map(item => {
      // Count orders containing this item
      const itemOrders = orders.filter(order => {
        try {
          const items = JSON.parse(order.items);
          return items.some(orderItem => orderItem.id === item.id);
        } catch (e) {
          return false;
        }
      });

      const orderCount = itemOrders.length;
      const revenue = itemOrders.reduce((sum, order) => {
        try {
          const items = JSON.parse(order.items);
          const itemInOrder = items.find(orderItem => orderItem.id === item.id);
          return sum + (itemInOrder ? itemInOrder.price * itemInOrder.quantity : 0);
        } catch (e) {
          return sum;
        }
      }, 0);

      return {
        id: item.id,
        name: item.name,
        orderCount,
        revenue
      };
    }).filter(item => item.orderCount > 0).sort((a, b) => b.orderCount - a.orderCount).slice(0, 5);

    res.json({
      success: true,
      analytics: {
        totalRevenue,
        totalOrders,
        averageOrderValue,
        customerSatisfaction,
        topItems
      }
    });

  } catch (error) {
    console.error('❌ Reports error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch reports'
    });
  }
});

module.exports = router;
