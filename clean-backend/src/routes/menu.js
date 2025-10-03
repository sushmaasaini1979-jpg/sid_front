const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// GET /api/menu?store=slug
router.get('/', async (req, res) => {
  try {
    const { store } = req.query;
    const { supabaseAdmin } = require('../lib/supabase');

    if (!store) {
      return res.status(400).json({ error: 'Store parameter is required' });
    }

    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    // Get store
    const { data: storeData, error: storeError } = await supabaseAdmin
      .from('stores')
      .select('*')
      .eq('slug', store)
      .single();

    if (storeError || !storeData) {
      console.error('❌ Store not found:', storeError);
      return res.status(404).json({ error: 'Store not found' });
    }

    // Get categories with menu items
    const { data: categories, error: categoriesError } = await supabaseAdmin
      .from('categories')
      .select(`
        *,
        menu_items:menu_items(*)
      `)
      .eq('storeId', storeData.id)
      .order('sortOrder', { ascending: true });

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError);
      return res.status(500).json({ error: 'Failed to fetch menu data' });
    }

    // Transform data for frontend
    const menu = categories.map(category => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      items: category.menu_items.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: parseFloat(item.price),
        size: item.size,
        imageUrl: item.imageUrl,
        isVeg: item.isVeg,
        isAvailable: item.isAvailable,
        inventory: null
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
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/menu/search?store=slug&q=query
router.get('/search', async (req, res) => {
  try {
    const { store, q } = req.query;
    const { supabaseAdmin } = require('../lib/supabase');

    if (!store || !q) {
      return res.status(400).json({ error: 'Store and query parameters are required' });
    }

    const { data: storeData, error: storeError } = await supabaseAdmin
      .from('stores')
      .select('*')
      .eq('slug', store)
      .eq('isActive', true)
      .single();

    if (!storeData) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // Search menu items
    if (storeError || !storeData) return res.json({ results: [] });

    const { data: items, error: itemsError } = await supabaseAdmin
      .from('menu_items')
      .select('*, category:categories(*)')
      .eq('store_id', storeData.id)
      .eq('is_available', true)
      .ilike('name', `%${q}%`)
      .order('name', { ascending: true });

    if (itemsError) return res.json({ results: [] });

    const searchResults = items.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: parseFloat(item.price),
      size: item.size,
      imageUrl: item.image_url,
      isVeg: item.is_veg,
      category: item.category ? {
        id: item.category.id,
        name: item.category.name,
        slug: item.category.slug
      } : null,
      inventory: null
    }));

    res.json({ results: searchResults });
  } catch (error) {
    console.error('Menu search error:', error);
    res.status(500).json({ error: 'Failed to search menu' });
  }
});

module.exports = router;
