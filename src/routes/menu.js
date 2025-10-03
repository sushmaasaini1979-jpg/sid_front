const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// GET /api/menu?store=slug
router.get('/', async (req, res) => {
  try {
    const { store } = req.query;
    const prisma = req.app.get('prisma');

    if (!store) {
      return res.status(400).json({ error: 'Store parameter is required' });
    }

    // Get store with categories and menu items
    const storeData = await prisma.store.findUnique({
      where: { slug: store, isActive: true },
      include: {
        categories: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          include: {
            menuItems: {
              orderBy: { sortOrder: 'asc' },
              include: {
                inventory: true
              }
            }
          }
        }
      }
    });

    if (!storeData) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // Transform data for frontend
    const menu = storeData.categories.map(category => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      items: category.menuItems.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: parseFloat(item.price),
        size: item.size,
        imageUrl: item.imageUrl,
        isVeg: item.isVeg,
        isAvailable: item.isAvailable,
        inventory: item.inventory ? {
          currentQuantity: parseFloat(item.inventory.currentQuantity),
          unit: item.inventory.unit,
          isLowStock: parseFloat(item.inventory.currentQuantity) <= parseFloat(item.inventory.reorderThreshold)
        } : null
      }))
    }));

    res.json({
      store: {
        id: storeData.id,
        name: storeData.name,
        slug: storeData.slug,
        description: storeData.description,
        address: storeData.address,
        phone: storeData.phone,
        email: storeData.email
      },
      menu
    });
  } catch (error) {
    console.error('Menu fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch menu' });
  }
});

// GET /api/menu/search?store=slug&q=query
router.get('/search', async (req, res) => {
  try {
    const { store, q } = req.query;
    const prisma = req.app.get('prisma');

    if (!store || !q) {
      return res.status(400).json({ error: 'Store and query parameters are required' });
    }

    const storeData = await prisma.store.findUnique({
      where: { slug: store, isActive: true }
    });

    if (!storeData) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // Search menu items
    const items = await prisma.menuItem.findMany({
      where: {
        storeId: storeData.id,
        isAvailable: true,
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } }
        ]
      },
      include: {
        category: true,
        inventory: true
      },
      orderBy: { name: 'asc' }
    });

    const searchResults = items.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: parseFloat(item.price),
      size: item.size,
      imageUrl: item.imageUrl,
      isVeg: item.isVeg,
      category: {
        id: item.category.id,
        name: item.category.name,
        slug: item.category.slug
      },
      inventory: item.inventory ? {
        currentQuantity: parseFloat(item.inventory.currentQuantity),
        unit: item.inventory.unit,
        isLowStock: parseFloat(item.inventory.currentQuantity) <= parseFloat(item.inventory.reorderThreshold)
      } : null
    }));

    res.json({ results: searchResults });
  } catch (error) {
    console.error('Menu search error:', error);
    res.status(500).json({ error: 'Failed to search menu' });
  }
});

module.exports = router;
