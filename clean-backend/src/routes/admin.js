const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Import auth middleware
const { authenticateToken } = require('./auth');

// Apply authentication to all admin routes
router.use(authenticateToken);

// GET /api/admin/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const prisma = req.app.get('prisma');
    const storeId = req.user.storeId;

    // Get date range (today by default)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Key metrics
    const totalOrders = await prisma.order.count({
      where: {
        storeId,
        createdAt: { gte: today, lt: tomorrow }
      }
    });

    const totalRevenue = await prisma.order.aggregate({
      where: {
        storeId,
        createdAt: { gte: today, lt: tomorrow },
        paymentStatus: 'COMPLETED'
      },
      _sum: { total: true }
    });

    const pendingOrders = await prisma.order.count({
      where: {
        storeId,
        status: { in: ['PENDING', 'CONFIRMED', 'PREPARING'] }
      }
    });

    const deliveredOrders = await prisma.order.count({
      where: {
        storeId,
        status: 'DELIVERED',
        createdAt: { gte: today, lt: tomorrow }
      }
    });

    // Recent orders
    const recentOrders = await prisma.order.findMany({
      where: { storeId },
      include: {
        customer: true,
        orderItems: {
          include: {
            menuItem: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    // Low stock items
    const lowStockItems = await prisma.inventory.findMany({
      where: {
        menuItem: { storeId },
        currentQuantity: { lte: prisma.inventory.fields.reorderThreshold }
      },
      include: {
        menuItem: true
      }
    });

    res.json({
      metrics: {
        totalOrders,
        totalRevenue: parseFloat(totalRevenue._sum.total || 0),
        pendingOrders,
        deliveredOrders
      },
      recentOrders: recentOrders.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customer.name,
        total: parseFloat(order.total),
        status: order.status,
        createdAt: order.createdAt,
        items: order.orderItems.map(item => ({
          name: item.menuItem.name,
          quantity: item.quantity
        }))
      })),
      lowStockItems: lowStockItems.map(item => ({
        id: item.id,
        name: item.menuItem.name,
        currentQuantity: parseFloat(item.currentQuantity),
        unit: item.unit,
        reorderThreshold: parseFloat(item.reorderThreshold)
      }))
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// GET /api/admin/orders
router.get('/orders', async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const prisma = req.app.get('prisma');
    const storeId = req.user.storeId;

    const where = { storeId };
    if (status) {
      where.status = status;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        customer: true,
        orderItems: {
          include: {
            menuItem: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: parseInt(limit)
    });

    const total = await prisma.order.count({ where });

    res.json({
      orders: orders.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        customer: {
          name: order.customer.name,
          phone: order.customer.phone
        },
        items: order.orderItems.map(item => ({
          name: item.menuItem.name,
          quantity: item.quantity
        })),
        total: parseFloat(order.total),
        paymentMethod: order.paymentMethod,
        status: order.status,
        createdAt: order.createdAt
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Orders fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET /api/admin/orders/:id
router.get('/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const prisma = req.app.get('prisma');
    const storeId = req.user.storeId;

    const order = await prisma.order.findFirst({
      where: { id, storeId },
      include: {
        customer: true,
        store: true,
        coupon: true,
        orderItems: {
          include: {
            menuItem: {
              include: {
                category: true
              }
            }
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      subtotal: parseFloat(order.subtotal),
      tax: parseFloat(order.tax),
      discount: parseFloat(order.discount),
      total: parseFloat(order.total),
      notes: order.notes,
      estimatedTime: order.estimatedTime,
      deliveredAt: order.deliveredAt,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      customer: {
        id: order.customer.id,
        name: order.customer.name,
        phone: order.customer.phone,
        email: order.customer.email,
        address: order.customer.address
      },
      store: {
        id: order.store.id,
        name: order.store.name,
        slug: order.store.slug,
        phone: order.store.phone,
        address: order.store.address
      },
      coupon: order.coupon ? {
        code: order.coupon.code,
        name: order.coupon.name,
        type: order.coupon.type,
        value: parseFloat(order.coupon.value)
      } : null,
      items: order.orderItems.map(item => ({
        id: item.id,
        quantity: item.quantity,
        price: parseFloat(item.price),
        notes: item.notes,
        menuItem: {
          id: item.menuItem.id,
          name: item.menuItem.name,
          description: item.menuItem.description,
          size: item.menuItem.size,
          isVeg: item.menuItem.isVeg,
          category: {
            name: item.menuItem.category.name
          }
        }
      }))
    });
  } catch (error) {
    console.error('Order fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// PUT /api/admin/orders/:id/status
router.put('/orders/:id/status', [
  body('status').isIn(['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED']).withMessage('Valid status is required'),
  body('estimatedTime').optional().isInt({ min: 1 }).withMessage('Estimated time must be a positive integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { status, estimatedTime } = req.body;
    const prisma = req.app.get('prisma');
    const io = req.app.get('io');
    const storeId = req.user.storeId;

    const order = await prisma.order.findFirst({
      where: { id, storeId },
      include: { store: true, customer: true }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status,
        estimatedTime,
        deliveredAt: status === 'DELIVERED' ? new Date() : null
      }
    });

    // Emit real-time update
    io.to(`order-${id}`).emit('order.updated', {
      orderId: id,
      status,
      estimatedTime,
      deliveredAt: updatedOrder.deliveredAt
    });

    io.to(`store-${order.store.slug}`).emit('order.status.changed', {
      orderId: id,
      orderNumber: order.orderNumber,
      status,
      customerName: order.customer.name
    });

    res.json({
      id: updatedOrder.id,
      status: updatedOrder.status,
      estimatedTime: updatedOrder.estimatedTime,
      deliveredAt: updatedOrder.deliveredAt,
      message: 'Order status updated successfully'
    });
  } catch (error) {
    console.error('Order status update error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// GET /api/admin/customers
router.get('/customers', async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const prisma = req.app.get('prisma');
    const storeId = req.user.storeId;

    const where = {
      orders: {
        some: { storeId }
      }
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ];
    }

    const customers = await prisma.customer.findMany({
      where,
      include: {
        orders: {
          where: { storeId },
          select: {
            id: true,
            total: true,
            status: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: parseInt(limit)
    });

    const total = await prisma.customer.count({ where });

    res.json({
      customers: customers.map(customer => ({
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        address: customer.address,
        isBlocked: customer.isBlocked,
        totalOrders: customer.orders.length,
        totalSpent: customer.orders.reduce((sum, order) => sum + parseFloat(order.total), 0),
        lastOrderDate: customer.orders[0]?.createdAt || null,
        createdAt: customer.createdAt
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Customers fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// PUT /api/admin/customers/:id/block
router.put('/customers/:id/block', [
  body('isBlocked').isBoolean().withMessage('isBlocked must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { isBlocked } = req.body;
    const prisma = req.app.get('prisma');

    const customer = await prisma.customer.update({
      where: { id },
      data: { isBlocked }
    });

    res.json({
      id: customer.id,
      isBlocked: customer.isBlocked,
      message: `Customer ${isBlocked ? 'blocked' : 'unblocked'} successfully`
    });
  } catch (error) {
    console.error('Customer block error:', error);
    res.status(500).json({ error: 'Failed to update customer status' });
  }
});

module.exports = router;
