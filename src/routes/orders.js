const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

// GET /api/orders/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const prisma = req.app.get('prisma');

    const order = await prisma.order.findUnique({
      where: { id },
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

// POST /api/orders
router.post('/', [
  body('storeSlug').notEmpty().withMessage('Store slug is required'),
  body('customer').isObject().withMessage('Customer information is required'),
  body('customer.name').notEmpty().withMessage('Customer name is required'),
  body('customer.phone').isLength({ min: 10, max: 20 }).withMessage('Valid phone number is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.menuItemId').notEmpty().withMessage('Menu item ID is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Valid quantity is required'),
  body('paymentMethod').isIn(['CASH_ON_DELIVERY', 'UPI', 'CARD', 'WALLET', 'RAZORPAY']).withMessage('Valid payment method is required'),
  body('couponCode').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { storeSlug, customer, items, paymentMethod, couponCode, notes } = req.body;
    const prisma = req.app.get('prisma');
    const io = req.app.get('io');

    // Get store
    const store = await prisma.store.findUnique({
      where: { slug: storeSlug, isActive: true }
    });

    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // Get or create customer
    let customerRecord = await prisma.customer.findUnique({
      where: { phone: customer.phone }
    });

    if (!customerRecord) {
      customerRecord = await prisma.customer.create({
        data: {
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
          address: customer.address
        }
      });
    }

    // Validate menu items and calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const menuItem = await prisma.menuItem.findUnique({
        where: { id: item.menuItemId },
        include: { inventory: true }
      });

      if (!menuItem || !menuItem.isAvailable) {
        return res.status(400).json({ error: `Menu item ${item.menuItemId} not found or unavailable` });
      }

      // Check inventory
      if (menuItem.inventory && parseFloat(menuItem.inventory.currentQuantity) < item.quantity) {
        return res.status(400).json({ 
          error: `Insufficient inventory for ${menuItem.name}. Available: ${menuItem.inventory.currentQuantity} ${menuItem.inventory.unit}` 
        });
      }

      const itemTotal = parseFloat(menuItem.price) * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        price: menuItem.price,
        notes: item.notes
      });
    }

    // Apply coupon if provided
    let discount = 0;
    let coupon = null;
    if (couponCode) {
      coupon = await prisma.coupon.findFirst({
        where: {
          code: couponCode,
          storeId: store.id,
          isActive: true,
          validFrom: { lte: new Date() },
          validUntil: { gte: new Date() }
        }
      });

      if (coupon) {
        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
          return res.status(400).json({ error: 'Coupon usage limit exceeded' });
        }

        if (coupon.minOrderAmount && subtotal < parseFloat(coupon.minOrderAmount)) {
          return res.status(400).json({ 
            error: `Minimum order amount of ₹${coupon.minOrderAmount} required for this coupon` 
          });
        }

        if (coupon.type === 'PERCENTAGE') {
          discount = (subtotal * parseFloat(coupon.value)) / 100;
          if (coupon.maxDiscount) {
            discount = Math.min(discount, parseFloat(coupon.maxDiscount));
          }
        } else {
          discount = parseFloat(coupon.value);
        }
      }
    }

    const tax = subtotal * 0.05; // 5% tax
    const total = subtotal + tax - discount;

    // Generate order number
    const orderNumber = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Create order in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create order
      const order = await tx.order.create({
        data: {
          orderNumber,
          customerId: customerRecord.id,
          storeId: store.id,
          status: 'PENDING',
          paymentMethod,
          paymentStatus: paymentMethod === 'CASH_ON_DELIVERY' ? 'PENDING' : 'PENDING',
          subtotal,
          tax,
          discount,
          total,
          couponId: coupon?.id,
          notes,
          estimatedTime: 30 // Default 30 minutes
        }
      });

      // Create order items
      await tx.orderItem.createMany({
        data: orderItems.map(item => ({
          orderId: order.id,
          ...item
        }))
      });

      // Update inventory
      for (const item of items) {
        const menuItem = await tx.menuItem.findUnique({
          where: { id: item.menuItemId },
          include: { inventory: true }
        });

        if (menuItem.inventory) {
          await tx.inventory.update({
            where: { menuItemId: item.menuItemId },
            data: {
              currentQuantity: {
                decrement: item.quantity
              }
            }
          });
        }
      }

      // Update coupon usage
      if (coupon) {
        await tx.coupon.update({
          where: { id: coupon.id },
          data: { usedCount: { increment: 1 } }
        });
      }

      return order;
    });

    // Emit real-time update
    io.to(`store-${storeSlug}`).emit('order.created', {
      orderId: result.id,
      orderNumber: result.orderNumber,
      status: result.status,
      total: parseFloat(result.total),
      customerName: customerRecord.name,
      createdAt: result.createdAt
    });

    res.status(201).json({
      id: result.id,
      orderNumber: result.orderNumber,
      status: result.status,
      total: parseFloat(result.total),
      estimatedTime: result.estimatedTime,
      message: 'Order created successfully'
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// PUT /api/orders/:id/payment
router.put('/:id/payment', [
  body('paymentStatus').isIn(['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED']).withMessage('Valid payment status is required')
], async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;
    const prisma = req.app.get('prisma');
    const io = req.app.get('io');

    const order = await prisma.order.findUnique({
      where: { id },
      include: { store: true, customer: true }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        paymentStatus,
        status: paymentStatus === 'COMPLETED' ? 'CONFIRMED' : order.status
      }
    });

    // Emit real-time update
    io.to(`order-${id}`).emit('payment.updated', {
      orderId: id,
      paymentStatus,
      status: updatedOrder.status
    });

    io.to(`store-${order.store.slug}`).emit('order.payment.updated', {
      orderId: id,
      orderNumber: order.orderNumber,
      paymentStatus,
      customerName: order.customer.name
    });

    res.json({
      id: updatedOrder.id,
      paymentStatus: updatedOrder.paymentStatus,
      status: updatedOrder.status,
      message: 'Payment status updated successfully'
    });
  } catch (error) {
    console.error('Payment status update error:', error);
    res.status(500).json({ error: 'Failed to update payment status' });
  }
});

// PUT /api/orders/:id/status
router.put('/:id/status', [
  body('status').isIn(['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED']).withMessage('Valid status is required')
], async (req, res) => {
  try {
    const { id } = req.params;
    const { status, estimatedTime } = req.body;
    const prisma = req.app.get('prisma');
    const io = req.app.get('io');

    const order = await prisma.order.findUnique({
      where: { id },
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

module.exports = router;
