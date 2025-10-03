const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Import auth middleware
const { authenticateToken } = require('./auth');

// Apply authentication to all coupon routes
router.use(authenticateToken);

// GET /api/coupons
router.get('/', async (req, res) => {
  try {
    const { isActive, page = 1, limit = 10 } = req.query;
    const prisma = req.app.get('prisma');
    const storeId = req.user.storeId;

    const where = { storeId };
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const coupons = await prisma.coupon.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: parseInt(limit)
    });

    const total = await prisma.coupon.count({ where });

    res.json({
      coupons: coupons.map(coupon => ({
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
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Coupons fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch coupons' });
  }
});

// GET /api/coupons/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const prisma = req.app.get('prisma');
    const storeId = req.user.storeId;

    const coupon = await prisma.coupon.findFirst({
      where: { id, storeId }
    });

    if (!coupon) {
      return res.status(404).json({ error: 'Coupon not found' });
    }

    res.json({
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
      createdAt: coupon.createdAt,
      updatedAt: coupon.updatedAt
    });
  } catch (error) {
    console.error('Coupon fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch coupon' });
  }
});

// POST /api/coupons
router.post('/', [
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

    const prisma = req.app.get('prisma');
    const storeId = req.user.storeId;

    // Check if coupon code already exists
    const existingCoupon = await prisma.coupon.findFirst({
      where: { code, storeId }
    });

    if (existingCoupon) {
      return res.status(400).json({ error: 'Coupon code already exists' });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code,
        name,
        description,
        type,
        value,
        minOrderAmount,
        maxDiscount,
        usageLimit,
        isActive,
        validFrom: new Date(validFrom),
        validUntil: new Date(validUntil),
        storeId
      }
    });

    res.status(201).json({
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
    });
  } catch (error) {
    console.error('Coupon creation error:', error);
    res.status(500).json({ error: 'Failed to create coupon' });
  }
});

// PUT /api/coupons/:id
router.put('/:id', [
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
    const prisma = req.app.get('prisma');
    const storeId = req.user.storeId;

    // Check if coupon exists
    const existingCoupon = await prisma.coupon.findFirst({
      where: { id, storeId }
    });

    if (!existingCoupon) {
      return res.status(404).json({ error: 'Coupon not found' });
    }

    // If code is being updated, check for duplicates
    if (updateData.code && updateData.code !== existingCoupon.code) {
      const duplicateCoupon = await prisma.coupon.findFirst({
        where: { code: updateData.code, storeId }
      });

      if (duplicateCoupon) {
        return res.status(400).json({ error: 'Coupon code already exists' });
      }
    }

    // Convert date strings to Date objects
    if (updateData.validFrom) {
      updateData.validFrom = new Date(updateData.validFrom);
    }
    if (updateData.validUntil) {
      updateData.validUntil = new Date(updateData.validUntil);
    }

    const coupon = await prisma.coupon.update({
      where: { id },
      data: updateData
    });

    res.json({
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
    });
  } catch (error) {
    console.error('Coupon update error:', error);
    res.status(500).json({ error: 'Failed to update coupon' });
  }
});

// DELETE /api/coupons/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const prisma = req.app.get('prisma');
    const storeId = req.user.storeId;

    const coupon = await prisma.coupon.findFirst({
      where: { id, storeId }
    });

    if (!coupon) {
      return res.status(404).json({ error: 'Coupon not found' });
    }

    await prisma.coupon.delete({
      where: { id }
    });

    res.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    console.error('Coupon deletion error:', error);
    res.status(500).json({ error: 'Failed to delete coupon' });
  }
});

// GET /api/coupons/validate/:code
router.get('/validate/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const { orderAmount } = req.query;
    const prisma = req.app.get('prisma');
    const storeId = req.user.storeId;

    const coupon = await prisma.coupon.findFirst({
      where: {
        code,
        storeId,
        isActive: true,
        validFrom: { lte: new Date() },
        validUntil: { gte: new Date() }
      }
    });

    if (!coupon) {
      return res.status(404).json({ error: 'Invalid or expired coupon' });
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ error: 'Coupon usage limit exceeded' });
    }

    // Check minimum order amount
    if (coupon.minOrderAmount && orderAmount && parseFloat(orderAmount) < parseFloat(coupon.minOrderAmount)) {
      return res.status(400).json({ 
        error: `Minimum order amount of ₹${coupon.minOrderAmount} required for this coupon` 
      });
    }

    // Calculate discount
    let discount = 0;
    if (orderAmount) {
      if (coupon.type === 'PERCENTAGE') {
        discount = (parseFloat(orderAmount) * parseFloat(coupon.value)) / 100;
        if (coupon.maxDiscount) {
          discount = Math.min(discount, parseFloat(coupon.maxDiscount));
        }
      } else {
        discount = parseFloat(coupon.value);
      }
    }

    res.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        name: coupon.name,
        type: coupon.type,
        value: parseFloat(coupon.value),
        discount: discount,
        maxDiscount: coupon.maxDiscount ? parseFloat(coupon.maxDiscount) : null
      }
    });
  } catch (error) {
    console.error('Coupon validation error:', error);
    res.status(500).json({ error: 'Failed to validate coupon' });
  }
});

module.exports = router;
