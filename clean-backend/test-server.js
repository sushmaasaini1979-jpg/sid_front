const express = require('express');
const app = express();

// Parse JSON bodies
app.use(express.json());

// In-memory storage for orders
let orders = [];
let orderCounter = 1;

// Enable CORS for all routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Order creation endpoint
app.post('/api/orders', (req, res) => {
  const { storeSlug, customer, items, paymentMethod, couponCode, notes } = req.body;
  
  // Generate order ID
  const orderId = `ORD${String(orderCounter).padStart(5, '0')}`;
  orderCounter++;
  
  // Calculate total with real menu prices
  let subtotal = 0;
  const orderItems = items.map(item => {
    // Get actual price from menu data (mock prices for now)
    const menuPrices = {
      'paneer-tikka': 200,
      'paneer-malai-tikka': 220,
      'paneer-afghani-tikka': 200,
      'tandoori-tea': 160,
      'afghani-chaap-tikka': 160,
      'tandoori-momos': 160,
      'pizza': 250,
      'burger': 180,
      'pasta': 220,
      'dosa': 80,
      'samosa': 15,
      'tea': 20,
      'coffee': 25,
      'lassi': 40
    };
    
    const itemPrice = menuPrices[item.menuItemId] || 100;
    const itemTotal = item.quantity * itemPrice;
    subtotal += itemTotal;
    
    return {
      ...item,
      name: item.name || `Item ${item.menuItemId}`,
      price: itemPrice,
      total: itemTotal
    };
  });
  
  const tax = subtotal * 0.05; // 5% tax
  const discount = 0; // No discount for now
  const total = subtotal + tax - discount;
  
  // Create order object
  const order = {
    id: orderId,
    storeSlug,
    customer,
    items: orderItems,
    paymentMethod,
    couponCode,
    notes,
    subtotal,
    tax,
    discount,
    total,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    // Add formatted data for admin display
    formattedTotal: new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(total),
    itemsSummary: orderItems.map(item => `${item.quantity}x ${item.name}`).join(', ')
  };
  
  // Store order
  orders.push(order);
  
  // Return order data
  res.json({
    success: true,
    order: {
      id: order.id,
      customer: order.customer,
      items: order.items,
      total: order.total,
      status: order.status,
      createdAt: order.createdAt
    }
  });
});

// Validate coupon endpoint
app.get('/api/coupons/validate/:code', (req, res) => {
  const { code } = req.params;
  const { orderAmount } = req.query;
  
  // Mock coupon validation
  const mockCoupons = [
    {
      code: 'WELCOME10',
      name: 'Welcome Discount',
      discount: Math.min(50, orderAmount * 0.1), // 10% off, max ₹50
      type: 'percentage',
      minOrderAmount: 100,
      isActive: true
    },
    {
      code: 'SAVE20',
      name: 'Save ₹20',
      discount: 20,
      type: 'fixed',
      minOrderAmount: 200,
      isActive: true
    }
  ];
  
  const coupon = mockCoupons.find(c => c.code.toUpperCase() === code.toUpperCase());
  
  if (!coupon || !coupon.isActive) {
    return res.status(400).json({
      success: false,
      error: 'Invalid or expired coupon code'
    });
  }
  
  if (orderAmount < coupon.minOrderAmount) {
    return res.status(400).json({
      success: false,
      error: `Minimum order amount of ₹${coupon.minOrderAmount} required`
    });
  }
  
  const discountAmount = coupon.type === 'percentage' 
    ? Math.min(coupon.discount, orderAmount * (coupon.discount / 100))
    : coupon.discount;
  
  res.json({
    success: true,
    coupon: {
      ...coupon,
      discount: discountAmount
    }
  });
});

// Get orders endpoint
app.get('/api/admin/orders', (req, res) => {
  res.json({
    success: true,
    orders: orders
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(order => ({
        id: order.id,
        customer: order.customer,
        items: order.items,
        total: order.total,
        formattedTotal: order.formattedTotal || new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          minimumFractionDigits: 0,
        }).format(order.total),
        itemsSummary: order.itemsSummary || order.items.map(item => `${item.quantity}x ${item.name || 'Item'}`).join(', '),
        status: order.status,
        createdAt: order.createdAt,
        paymentMethod: order.paymentMethod
      }))
  });
});

// Admin login endpoint
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  
  // Simple admin authentication
  if (email === 'admin@siddhi.com' && password === 'admin123') {
    res.json({
      success: true,
      token: 'mock-admin-token',
      user: {
        id: 'admin-1',
        email: 'admin@siddhi.com',
        name: 'Admin User',
        role: 'admin'
      }
    });
  } else {
    res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }
});

app.get('/api/menu', (req, res) => {
  res.json({
    store: {
      id: 'test-store',
      name: 'SIDDHI',
      slug: 'siddhi',
      description: 'BITE INTO HAPPINESS'
    },
    menu: [
      {
        id: 'starters',
        name: 'Starters',
        slug: 'starters',
        items: [
          {
            id: 'paneer-tikka',
            name: 'Paneer Tikka',
            description: 'Grilled cottage cheese with spices',
            price: 200,
            isVeg: true
          },
          {
            id: 'paneer-malai-tikka',
            name: 'Paneer Malai Tikka',
            description: 'Creamy cottage cheese tikka',
            price: 220,
            isVeg: true
          },
          {
            id: 'paneer-afghani-tikka',
            name: 'Paneer Afghani Tikka',
            description: 'Afghani style cottage cheese',
            price: 200,
            isVeg: true
          },
          {
            id: 'tandoori-tea',
            name: 'Tandoori Tea',
            description: 'Spiced tea with tandoori flavors',
            price: 160,
            isVeg: true
          },
          {
            id: 'afghani-chaap-tikka',
            name: 'Afghani Chaap Tikka',
            description: 'Afghani style chaap tikka',
            price: 160,
            isVeg: true
          },
          {
            id: 'tandoori-momos',
            name: 'Tandoori Momos (8pcs)',
            description: 'Tandoori style momos',
            price: 160,
            isVeg: true
          },
          {
            id: 'tandoori-platter',
            name: 'Tandoori Platter',
            description: 'Mixed tandoori items',
            price: 280,
            isVeg: true
          },
          {
            id: 'malai-chaap',
            name: 'Malai Chaap',
            description: 'Creamy soya chaap',
            price: 180,
            isVeg: true
          },
          {
            id: 'mushroom-tikka',
            name: 'Mushroom Tikka',
            description: 'Grilled mushroom tikka',
            price: 200,
            isVeg: true
          }
        ]
      },
      {
        id: 'fast-food',
        name: 'Fast Food',
        slug: 'fast-food',
        items: [
          {
            id: 'french-fries',
            name: 'French Fries',
            description: 'Crispy golden french fries',
            price: 60,
            isVeg: true
          },
          {
            id: 'pizza-potato',
            name: 'Pizza Potato',
            description: 'Potato with pizza toppings',
            price: 60,
            isVeg: true
          },
          {
            id: 'sweet-chilli-potato',
            name: 'Sweet Chilli Potato',
            description: 'Sweet and spicy potato',
            price: 70,
            isVeg: true
          },
          {
            id: 'delhi-paneer-dry',
            name: 'Delhi Paneer Dry',
            description: 'Dry paneer preparation',
            price: 100,
            isVeg: true
          },
          {
            id: 'delhi-paneer-gravy',
            name: 'Delhi Paneer Gravy',
            description: 'Paneer in rich gravy',
            price: 120,
            isVeg: true
          },
          {
            id: 'manchurian-dry',
            name: 'Manchurian Dry (5pcs)',
            description: 'Dry manchurian balls',
            price: 60,
            isVeg: true
          },
          {
            id: 'spring-roll',
            name: 'Spring Roll',
            description: 'Crispy spring rolls',
            price: 80,
            isVeg: true
          },
          {
            id: 'momos-steamed-full',
            name: 'Momos Steamed (Full)',
            description: 'Steamed momos full portion',
            price: 70,
            isVeg: true
          },
          {
            id: 'momos-steamed-half',
            name: 'Momos Steamed (Half)',
            description: 'Steamed momos half portion',
            price: 40,
            isVeg: true
          },
          {
            id: 'momos-fried-full',
            name: 'Momos Fried (Full)',
            description: 'Fried momos full portion',
            price: 90,
            isVeg: true
          },
          {
            id: 'momos-fried-half',
            name: 'Momos Fried (Half)',
            description: 'Fried momos half portion',
            price: 50,
            isVeg: true
          },
          {
            id: 'chowmein',
            name: 'Chowmein',
            description: 'Classic chowmein',
            price: 50,
            isVeg: true
          },
          {
            id: 'double-chowmein',
            name: 'Double Chowmein',
            description: 'Extra portion chowmein',
            price: 70,
            isVeg: true
          },
          {
            id: 'schezwan-chowmein',
            name: 'Schezwan Chowmein',
            description: 'Spicy schezwan chowmein',
            price: 80,
            isVeg: true
          },
          {
            id: 'pav-bhaji',
            name: 'Pav Bhaji',
            description: 'Spicy vegetable curry with bread',
            price: 60,
            isVeg: true
          },
          {
            id: 'extra-pav',
            name: 'Extra Pav',
            description: 'Additional bread pieces',
            price: 20,
            isVeg: true
          },
          {
            id: 'pasta-red-sauce',
            name: 'Pasta (Red Sauce)',
            description: 'Pasta with red sauce',
            price: 80,
            isVeg: true
          },
          {
            id: 'pasta-white-sauce',
            name: 'Pasta (White Sauce)',
            description: 'Pasta with white sauce',
            price: 100,
            isVeg: true
          }
        ]
      },
      {
        id: 'breakfast',
        name: 'Breakfast',
        slug: 'breakfast',
        items: [
          {
            id: 'chole-bhature-full',
            name: 'Chole Bhature (Full)',
            description: 'Spicy chickpeas with fried bread',
            price: 50,
            isVeg: true
          },
          {
            id: 'chole-bhature-half',
            name: 'Chole Bhature (Half)',
            description: 'Spicy chickpeas with fried bread - half portion',
            price: 30,
            isVeg: true
          }
        ]
      },
      {
        id: 'chaat',
        name: 'Chaat',
        slug: 'chaat',
        items: [
          {
            id: 'samosa',
            name: 'Samosa',
            description: 'Crispy fried pastry with spiced filling',
            price: 15,
            isVeg: true
          },
          {
            id: 'tikki',
            name: 'Tikki',
            description: 'Spiced potato patties',
            price: 25,
            isVeg: true
          },
          {
            id: 'bhalla-papdi',
            name: 'Bhalla Papdi',
            description: 'Fried lentil balls with crispy wafers',
            price: 50,
            isVeg: true
          },
          {
            id: 'golgappa-water',
            name: 'Golgappa with Water (5pcs)',
            description: 'Crispy puris with spiced water',
            price: 25,
            isVeg: true
          },
          {
            id: 'golgappa-curd',
            name: 'Golgappa with Curd (5pcs)',
            description: 'Crispy puris with curd',
            price: 35,
            isVeg: true
          },
          {
            id: 'raj-kachori',
            name: 'Raj Kachori',
            description: 'Large crispy puri with mixed fillings',
            price: 60,
            isVeg: true
          }
        ]
      },
      {
        id: 'burger-pizza',
        name: 'Burger/Pizza',
        slug: 'burger-pizza',
        items: [
          {
            id: 'plain-burger',
            name: 'Plain Burger',
            description: 'Simple burger with fresh vegetables',
            price: 40,
            isVeg: true
          },
          {
            id: 'cheese-burger',
            name: 'Cheese Burger',
            description: 'Burger with cheese',
            price: 60,
            isVeg: true
          },
          {
            id: 'pizza-small',
            name: 'Pizza (Small)',
            description: 'Small size pizza',
            price: 80,
            isVeg: true
          },
          {
            id: 'pizza-medium',
            name: 'Pizza (Medium)',
            description: 'Medium size pizza',
            price: 150,
            isVeg: true
          }
        ]
      },
      {
        id: 'south-indian',
        name: 'South Indian',
        slug: 'south-indian',
        items: [
          {
            id: 'plain-dosa',
            name: 'Plain Dosa',
            description: 'Crispy rice crepe',
            price: 60,
            isVeg: true
          },
          {
            id: 'masala-dosa',
            name: 'Masala Dosa',
            description: 'Dosa with spiced potato filling',
            price: 70,
            isVeg: true
          },
          {
            id: 'paneer-dosa',
            name: 'Paneer Dosa',
            description: 'Dosa with paneer filling',
            price: 100,
            isVeg: true
          }
        ]
      },
      {
        id: 'hot-cold',
        name: 'Hot & Cold',
        slug: 'hot-cold',
        items: [
          {
            id: 'tea',
            name: 'Tea',
            description: 'Hot tea',
            price: 20,
            isVeg: true
          },
          {
            id: 'lassi',
            name: 'Lassi (Seasonal)',
            description: 'Sweet yogurt drink',
            price: 40,
            isVeg: true
          },
          {
            id: 'coffee',
            name: 'Coffee (Seasonal)',
            description: 'Hot coffee',
            price: 25,
            isVeg: true
          },
          {
            id: 'cold-drinks',
            name: 'Cold Drinks',
            description: 'Soft drinks - On MRP',
            price: 0,
            isVeg: true
          },
          {
            id: 'mineral-water',
            name: 'Mineral Water',
            description: 'Bottled water - On MRP',
            price: 0,
            isVeg: true
          }
        ]
      }
    ]
  });
});

// Admin Dashboard endpoint
app.get('/api/admin/dashboard', (req, res) => {
  const { period = 'today' } = req.query;
  
  // Calculate stats from real orders
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const pendingOrders = orders.filter(order => order.status === 'pending').length;
  const deliveredOrders = orders.filter(order => order.status === 'delivered').length;
  
  // Get recent orders (last 5)
  const recentOrders = orders
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)
    .map(order => ({
      id: order.id,
      customerName: order.customer.name,
      customerPhone: order.customer.phone,
      items: order.itemsSummary || order.items.map(item => `${item.quantity}x ${item.name || 'Item'}`).join(', '),
      total: order.total,
      formattedTotal: order.formattedTotal || new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
      }).format(order.total),
      status: order.status,
      timestamp: order.createdAt,
      paymentMethod: order.paymentMethod
    }));
  
  // Mock dashboard data with real order stats
  const dashboardData = {
    totalOrders,
    totalRevenue,
    pendingOrders,
    deliveredOrders,
    recentOrders,
    lowStockItems: [
      { name: 'Paneer', currentStock: 15, minStock: 20 },
      { name: 'Tomatoes', currentStock: 20, minStock: 30 },
      { name: 'Onions', currentStock: 8, minStock: 15 },
      { name: 'Flour', currentStock: 25, minStock: 40 }
    ]
  };

  res.json(dashboardData);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`);
  console.log(`📱 Health check: http://localhost:${PORT}/health`);
  console.log(`🍽️ Menu API: http://localhost:${PORT}/api/menu?store=siddhi`);
});

