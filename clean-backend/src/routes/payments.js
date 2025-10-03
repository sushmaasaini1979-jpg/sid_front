const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const router = express.Router();

// Initialize Razorpay (only if keys are provided)
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

// POST /api/payments/create-order
router.post('/create-order', async (req, res) => {
  try {
    const { orderId, amount, currency = 'INR' } = req.body;
    const prisma = req.app.get('prisma');

    if (!orderId || !amount) {
      return res.status(400).json({ error: 'Order ID and amount are required' });
    }

    if (!razorpay) {
      return res.status(503).json({ 
        error: 'Payment service not configured',
        message: 'Razorpay API keys not provided'
      });
    }

    // Verify order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { customer: true, store: true }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.paymentStatus === 'COMPLETED') {
      return res.status(400).json({ error: 'Order already paid' });
    }

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency,
      receipt: order.orderNumber,
      notes: {
        orderId: order.id,
        customerName: order.customer.name,
        customerPhone: order.customer.phone
      }
    });

    // Update order with Razorpay order ID
    await prisma.order.update({
      where: { id: orderId },
      data: { razorpayOrderId: razorpayOrder.id }
    });

    res.json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    res.status(500).json({ error: 'Failed to create payment order' });
  }
});

// POST /api/payments/verify
router.post('/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const prisma = req.app.get('prisma');

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing payment verification data' });
    }

    if (!razorpay) {
      return res.status(503).json({ 
        error: 'Payment service not configured',
        message: 'Razorpay API keys not provided'
      });
    }

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    // Find order by Razorpay order ID
    const order = await prisma.order.findFirst({
      where: { razorpayOrderId: razorpay_order_id },
      include: { store: true, customer: true }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Update order payment status
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: 'COMPLETED',
        razorpayPaymentId: razorpay_payment_id
      }
    });

    // Emit payment confirmation
    const io = req.app.get('io');
    io.to(`order-${order.id}`).emit('payment.completed', {
      orderId: order.id,
      paymentId: razorpay_payment_id,
      status: 'COMPLETED'
    });

    io.to(`store-${order.store.slug}`).emit('payment.received', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: parseFloat(order.total),
      customerName: order.customer.name
    });

    res.json({
      success: true,
      orderId: order.id,
      paymentId: razorpay_payment_id,
      message: 'Payment verified successfully'
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

// POST /api/payments/webhook
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const body = req.body;

    if (!signature) {
      return res.status(400).json({ error: 'Missing signature' });
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== signature) {
      console.error('Invalid webhook signature');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = JSON.parse(body);
    const prisma = req.app.get('prisma');
    const io = req.app.get('io');

    console.log('Razorpay webhook event:', event.event);

    switch (event.event) {
      case 'payment.captured':
        await handlePaymentCaptured(event.payload.payment.entity, prisma, io);
        break;
      case 'payment.failed':
        await handlePaymentFailed(event.payload.payment.entity, prisma, io);
        break;
      case 'order.paid':
        await handleOrderPaid(event.payload.order.entity, prisma, io);
        break;
      default:
        console.log('Unhandled webhook event:', event.event);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

async function handlePaymentCaptured(payment, prisma, io) {
  try {
    const order = await prisma.order.findFirst({
      where: { razorpayOrderId: payment.order_id },
      include: { store: true, customer: true }
    });

    if (order && order.paymentStatus !== 'COMPLETED') {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'COMPLETED',
          razorpayPaymentId: payment.id
        }
      });

      // Emit real-time update
      io.to(`order-${order.id}`).emit('payment.completed', {
        orderId: order.id,
        paymentId: payment.id,
        status: 'COMPLETED'
      });

      io.to(`store-${order.store.slug}`).emit('payment.received', {
        orderId: order.id,
        orderNumber: order.orderNumber,
        amount: parseFloat(order.total),
        customerName: order.customer.name
      });
    }
  } catch (error) {
    console.error('Error handling payment captured:', error);
  }
}

async function handlePaymentFailed(payment, prisma, io) {
  try {
    const order = await prisma.order.findFirst({
      where: { razorpayOrderId: payment.order_id },
      include: { store: true, customer: true }
    });

    if (order) {
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: 'FAILED' }
      });

      // Emit real-time update
      io.to(`order-${order.id}`).emit('payment.failed', {
        orderId: order.id,
        paymentId: payment.id,
        status: 'FAILED'
      });
    }
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}

async function handleOrderPaid(order, prisma, io) {
  try {
    const dbOrder = await prisma.order.findFirst({
      where: { razorpayOrderId: order.id },
      include: { store: true, customer: true }
    });

    if (dbOrder && dbOrder.paymentStatus !== 'COMPLETED') {
      await prisma.order.update({
        where: { id: dbOrder.id },
        data: { paymentStatus: 'COMPLETED' }
      });

      // Emit real-time update
      io.to(`order-${dbOrder.id}`).emit('payment.completed', {
        orderId: dbOrder.id,
        status: 'COMPLETED'
      });
    }
  } catch (error) {
    console.error('Error handling order paid:', error);
  }
}

module.exports = router;
