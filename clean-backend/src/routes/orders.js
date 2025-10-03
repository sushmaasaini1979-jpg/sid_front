const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { supabaseAdmin } = require('../lib/supabase');
const router = express.Router();

// GET /api/orders/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get order with customer and store info
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        customers:customerId(*),
        stores:storeId(*),
        coupons:couponId(*)
      `)
      .eq('id', id)
      .single();

    if (orderError || !order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Get order items
    const { data: orderItems, error: itemsError } = await supabaseAdmin
      .from('order_items')
      .select(`
        *,
        menu_items:menuItemId(*)
      `)
      .eq('orderId', id);

    if (itemsError) {
      console.error('Order items error:', itemsError);
      return res.status(500).json({ error: 'Failed to fetch order items' });
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
        id: order.customers.id,
        name: order.customers.name,
        phone: order.customers.phone,
        email: order.customers.email,
        address: order.customers.address
      },
      store: {
        id: order.stores.id,
        name: order.stores.name,
        slug: order.stores.slug,
        phone: order.stores.phone,
        address: order.stores.address
      },
      coupon: order.coupons ? {
        code: order.coupons.code,
        name: order.coupons.name,
        type: order.coupons.type,
        value: parseFloat(order.coupons.value)
      } : null,
      items: orderItems.map(item => ({
        id: item.id,
        quantity: item.quantity,
        price: parseFloat(item.price),
        notes: item.notes,
        menuItem: {
          id: item.menu_items.id,
          name: item.menu_items.name,
          description: item.menu_items.description,
          size: item.menu_items.size,
          isVeg: item.menu_items.isVeg
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
    const { io } = require('../server');

    console.log('📦 Creating order with data:', { storeSlug, customer, items, paymentMethod });

    // Get store
    const { data: store, error: storeError } = await supabaseAdmin
      .from('stores')
      .select('*')
      .eq('slug', storeSlug)
      .single();

    if (storeError || !store) {
      console.error('❌ Store not found:', storeError);
      return res.status(404).json({ error: 'Store not found' });
    }

    // Get or create customer
    let { data: customerRecord, error: customerError } = await supabaseAdmin
      .from('customers')
      .select('*')
      .eq('phone', customer.phone)
      .single();

    if (customerError && customerError.code !== 'PGRST116') {
      console.error('❌ Customer lookup error:', customerError);
      return res.status(500).json({ error: 'Failed to check customer' });
    }

    if (!customerRecord) {
      // Create new customer
      const { data: newCustomer, error: createCustomerError } = await supabaseAdmin
        .from('customers')
        .insert({
          id: uuidv4(),
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
          address: customer.address,
          isBlocked: false
        })
        .select()
        .single();

      if (createCustomerError) {
        console.error('❌ Customer creation error:', createCustomerError);
        return res.status(500).json({ error: 'Failed to create customer' });
      }

      customerRecord = newCustomer;
      console.log('✅ New customer created:', customerRecord.id);
    } else {
      console.log('✅ Existing customer found:', customerRecord.id);
    }

    // Validate menu items and calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const { data: menuItem, error: menuError } = await supabaseAdmin
        .from('menu_items')
        .select('*')
        .eq('id', item.menuItemId)
        .single();

      if (menuError || !menuItem) {
        console.error('❌ Menu item not found:', menuError);
        return res.status(400).json({ error: `Menu item ${item.menuItemId} not found` });
      }

      if (!menuItem.isAvailable) {
        return res.status(400).json({ error: `Menu item ${menuItem.name} is not available` });
      }

      const itemTotal = parseFloat(menuItem.price) * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        price: menuItem.price,
        notes: item.notes || ''
      });
    }

    // Apply coupon if provided
    let discount = 0;
    let coupon = null;
    if (couponCode) {
      const { data: couponData, error: couponError } = await supabaseAdmin
        .from('coupons')
        .select('*')
        .eq('code', couponCode)
        .eq('storeId', store.id)
        .eq('isActive', true)
        .single();

      if (!couponError && couponData) {
        coupon = couponData;
        
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

    // Create order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        id: uuidv4(),
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
        notes: notes || '',
        estimatedTime: 30, // Default 30 minutes
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .select()
      .single();

    if (orderError) {
      console.error('❌ Order creation error:', orderError);
      return res.status(500).json({ error: 'Failed to create order' });
    }

    // Create order items
    const orderItemsData = orderItems.map(item => ({
      id: uuidv4(),
      orderId: order.id,
      menuItemId: item.menuItemId,
      quantity: item.quantity,
      price: item.price,
      notes: item.notes
    }));

    const { error: orderItemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItemsData);

    if (orderItemsError) {
      console.error('❌ Order items creation error:', orderItemsError);
      return res.status(500).json({ error: 'Failed to create order items' });
    }

    // Update coupon usage if applicable
    if (coupon) {
      const { error: couponUpdateError } = await supabaseAdmin
        .from('coupons')
        .update({ usedCount: coupon.usedCount + 1 })
        .eq('id', coupon.id);

      if (couponUpdateError) {
        console.error('❌ Coupon update error:', couponUpdateError);
      }
    }

    console.log('✅ Order created successfully:', order.id);

    // Emit real-time update
    if (io) {
      io.to(`store-${storeSlug}`).emit('order.created', {
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        total: parseFloat(order.total),
        customerName: customerRecord.name,
        createdAt: order.createdAt
      });
    }

    res.status(201).json({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      total: parseFloat(order.total),
      estimatedTime: order.estimatedTime,
      message: 'Order created successfully'
    });
  } catch (error) {
    console.error('❌ Order creation error:', error);
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
    const { io } = require('../server');

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        stores:storeId(*),
        customers:customerId(*)
      `)
      .eq('id', id)
      .single();

    if (orderError || !order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const { data: updatedOrder, error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        paymentStatus,
        status: paymentStatus === 'COMPLETED' ? 'CONFIRMED' : order.status
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Payment status update error:', updateError);
      return res.status(500).json({ error: 'Failed to update payment status' });
    }

    // Emit real-time update
    if (io) {
      io.to(`order-${id}`).emit('payment.updated', {
        orderId: id,
        paymentStatus,
        status: updatedOrder.status
      });

      io.to(`store-${order.stores.slug}`).emit('order.payment.updated', {
        orderId: id,
        orderNumber: order.orderNumber,
        paymentStatus,
        customerName: order.customers.name
      });
    }

    res.json({
      id: updatedOrder.id,
      paymentStatus: updatedOrder.paymentStatus,
      status: updatedOrder.status,
      message: 'Payment status updated successfully'
    });
  } catch (error) {
    console.error('❌ Payment status update error:', error);
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
    const { io } = require('../server');

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        stores:storeId(*),
        customers:customerId(*)
      `)
      .eq('id', id)
      .single();

    if (orderError || !order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const { data: updatedOrder, error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        status,
        estimatedTime,
        deliveredAt: status === 'DELIVERED' ? new Date().toISOString() : null
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Order status update error:', updateError);
      return res.status(500).json({ error: 'Failed to update order status' });
    }

    // Emit real-time update
    if (io) {
      io.to(`order-${id}`).emit('order.updated', {
        orderId: id,
        status,
        estimatedTime,
        deliveredAt: updatedOrder.deliveredAt
      });

      io.to(`store-${order.stores.slug}`).emit('order.status.changed', {
        orderId: id,
        orderNumber: order.orderNumber,
        status,
        customerName: order.customers.name
      });
    }

    res.json({
      id: updatedOrder.id,
      status: updatedOrder.status,
      estimatedTime: updatedOrder.estimatedTime,
      deliveredAt: updatedOrder.deliveredAt,
      message: 'Order status updated successfully'
    });
  } catch (error) {
    console.error('❌ Order status update error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

module.exports = router;
