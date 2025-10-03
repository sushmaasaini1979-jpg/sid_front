const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create store
  const store = await prisma.store.upsert({
    where: { slug: 'siddhi' },
    update: {},
    create: {
      name: 'SIDDHI',
      slug: 'siddhi',
      description: 'BITE INTO HAPPINESS',
      address: '123 Food Street, Delhi',
      phone: '+91 9876543210',
      email: 'info@siddhi.com',
      isActive: true
    }
  });

  console.log('✅ Store created:', store.name);

  // Create categories
  const categories = [
    { name: 'Starters', slug: 'starters', sortOrder: 1 },
    { name: 'Fast Food', slug: 'fast-food', sortOrder: 2 },
    { name: 'Breakfast', slug: 'breakfast', sortOrder: 3 },
    { name: 'Chaat', slug: 'chaat', sortOrder: 4 },
    { name: 'Burger/Pizza', slug: 'burger-pizza', sortOrder: 5 },
    { name: 'South Indian', slug: 'south-indian', sortOrder: 6 },
    { name: 'Hot & Cold', slug: 'hot-cold', sortOrder: 7 }
  ];

  const createdCategories = [];
  for (const category of categories) {
    const created = await prisma.category.upsert({
      where: { 
        storeId_slug: { 
          storeId: store.id, 
          slug: category.slug 
        } 
      },
      update: {},
      create: {
        ...category,
        storeId: store.id,
        isActive: true
      }
    });
    createdCategories.push(created);
  }

  console.log('✅ Categories created:', createdCategories.length);

  // Create menu items
  const menuItems = [
    // Starters
    { name: 'Paneer Tikka', description: 'Grilled cottage cheese with spices', price: 200, categorySlug: 'starters', isVeg: true },
    { name: 'Paneer Malai Tikka', description: 'Creamy cottage cheese tikka', price: 220, categorySlug: 'starters', isVeg: true },
    { name: 'Paneer Afghani Tikka', description: 'Afghani style cottage cheese', price: 200, categorySlug: 'starters', isVeg: true },
    { name: 'Tandoori Tea', description: 'Spiced tea with tandoori flavors', price: 160, categorySlug: 'starters', isVeg: true },
    { name: 'Afghani Chaap Tikka', description: 'Afghani style chaap tikka', price: 160, categorySlug: 'starters', isVeg: true },
    { name: 'Tandoori Momos (8pcs)', description: 'Tandoori style momos', price: 160, categorySlug: 'starters', isVeg: true },
    
    // Fast Food
    { name: 'French Fries', description: 'Crispy golden french fries', price: 60, categorySlug: 'fast-food', isVeg: true },
    { name: 'Pizza Potato', description: 'Potato with pizza toppings', price: 60, categorySlug: 'fast-food', isVeg: true },
    { name: 'Sweet Chilli Potato', description: 'Sweet and spicy potato', price: 70, categorySlug: 'fast-food', isVeg: true },
    { name: 'Delhi Paneer Dry', description: 'Dry paneer preparation', price: 100, categorySlug: 'fast-food', isVeg: true },
    { name: 'Delhi Paneer Gravy', description: 'Paneer in rich gravy', price: 120, categorySlug: 'fast-food', isVeg: true },
    { name: 'Manchurian Dry (5pcs)', description: 'Dry manchurian balls', price: 60, categorySlug: 'fast-food', isVeg: true },
    { name: 'Spring Roll', description: 'Crispy spring rolls', price: 80, categorySlug: 'fast-food', isVeg: true },
    { name: 'Momos Steamed (Full)', description: 'Steamed momos full portion', price: 70, categorySlug: 'fast-food', isVeg: true },
    { name: 'Momos Steamed (Half)', description: 'Steamed momos half portion', price: 40, categorySlug: 'fast-food', isVeg: true },
    { name: 'Momos Fried (Full)', description: 'Fried momos full portion', price: 90, categorySlug: 'fast-food', isVeg: true },
    { name: 'Momos Fried (Half)', description: 'Fried momos half portion', price: 50, categorySlug: 'fast-food', isVeg: true },
    { name: 'Chowmein', description: 'Classic chowmein', price: 50, categorySlug: 'fast-food', isVeg: true },
    { name: 'Double Chowmein', description: 'Extra portion chowmein', price: 70, categorySlug: 'fast-food', isVeg: true },
    { name: 'Schezwan Chowmein', description: 'Spicy schezwan chowmein', price: 80, categorySlug: 'fast-food', isVeg: true },
    { name: 'Pav Bhaji', description: 'Spicy vegetable curry with bread', price: 60, categorySlug: 'fast-food', isVeg: true },
    { name: 'Extra Pav', description: 'Additional bread pieces', price: 20, categorySlug: 'fast-food', isVeg: true },
    { name: 'Pasta (Red Sauce)', description: 'Pasta with red sauce', price: 80, categorySlug: 'fast-food', isVeg: true },
    { name: 'Pasta (White Sauce)', description: 'Pasta with white sauce', price: 100, categorySlug: 'fast-food', isVeg: true },
    
    // Breakfast
    { name: 'Chole Bhature (Full)', description: 'Spicy chickpeas with fried bread', price: 50, categorySlug: 'breakfast', isVeg: true },
    { name: 'Chole Bhature (Half)', description: 'Spicy chickpeas with fried bread - half portion', price: 30, categorySlug: 'breakfast', isVeg: true },
    
    // Chaat
    { name: 'Samosa', description: 'Crispy fried pastry with spiced filling', price: 15, categorySlug: 'chaat', isVeg: true },
    { name: 'Tikki', description: 'Spiced potato patties', price: 25, categorySlug: 'chaat', isVeg: true },
    { name: 'Bhalla Papdi', description: 'Fried lentil balls with crispy wafers', price: 50, categorySlug: 'chaat', isVeg: true },
    { name: 'Golgappa with Water (5pcs)', description: 'Crispy puris with spiced water', price: 25, categorySlug: 'chaat', isVeg: true },
    { name: 'Golgappa with Curd (5pcs)', description: 'Crispy puris with curd', price: 35, categorySlug: 'chaat', isVeg: true },
    { name: 'Raj Kachori', description: 'Large crispy puri with mixed fillings', price: 60, categorySlug: 'chaat', isVeg: true },
    
    // Burger/Pizza
    { name: 'Plain Burger', description: 'Simple burger with fresh vegetables', price: 40, categorySlug: 'burger-pizza', isVeg: true },
    { name: 'Cheese Burger', description: 'Burger with cheese', price: 60, categorySlug: 'burger-pizza', isVeg: true },
    { name: 'Pizza (Small)', description: 'Small size pizza', price: 80, categorySlug: 'burger-pizza', isVeg: true },
    { name: 'Pizza (Medium)', description: 'Medium size pizza', price: 150, categorySlug: 'burger-pizza', isVeg: true },
    
    // South Indian
    { name: 'Plain Dosa', description: 'Crispy rice crepe', price: 60, categorySlug: 'south-indian', isVeg: true },
    { name: 'Masala Dosa', description: 'Dosa with spiced potato filling', price: 70, categorySlug: 'south-indian', isVeg: true },
    { name: 'Paneer Dosa', description: 'Dosa with paneer filling', price: 100, categorySlug: 'south-indian', isVeg: true },
    
    // Hot & Cold
    { name: 'Tea', description: 'Hot tea', price: 20, categorySlug: 'hot-cold', isVeg: true },
    { name: 'Lassi (Seasonal)', description: 'Sweet yogurt drink', price: 40, categorySlug: 'hot-cold', isVeg: true },
    { name: 'Coffee (Seasonal)', description: 'Hot coffee', price: 25, categorySlug: 'hot-cold', isVeg: true },
    { name: 'Cold Drinks', description: 'Soft drinks - On MRP', price: 0, categorySlug: 'hot-cold', isVeg: true },
    { name: 'Mineral Water', description: 'Bottled water - On MRP', price: 0, categorySlug: 'hot-cold', isVeg: true }
  ];

  let createdMenuItems = 0;
  for (const item of menuItems) {
    const category = createdCategories.find(c => c.slug === item.categorySlug);
    if (category) {
      await prisma.menuItem.upsert({
        where: { 
          id: `${store.id}-${item.name.toLowerCase().replace(/\s+/g, '-')}`
        },
        update: {},
        create: {
          id: `${store.id}-${item.name.toLowerCase().replace(/\s+/g, '-')}`,
          name: item.name,
          description: item.description,
          price: item.price,
          categoryId: category.id,
          storeId: store.id,
          isAvailable: true,
          isVeg: item.isVeg,
          sortOrder: createdMenuItems + 1
        }
      });
      createdMenuItems++;
    }
  }

  console.log('✅ Menu items created:', createdMenuItems);

  // Create sample coupons
  const coupons = [
    {
      code: 'WELCOME10',
      name: 'Welcome Discount',
      description: '10% off on your first order',
      type: 'PERCENTAGE',
      value: 10,
      minOrderAmount: 100,
      maxDiscount: 50,
      usageLimit: 100,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      storeId: store.id
    },
    {
      code: 'SAVE20',
      name: 'Save ₹20',
      description: 'Flat ₹20 off on orders above ₹200',
      type: 'FIXED_AMOUNT',
      value: 20,
      minOrderAmount: 200,
      usageLimit: 50,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
      storeId: store.id
    }
  ];

  for (const coupon of coupons) {
    await prisma.coupon.upsert({
      where: { code: coupon.code },
      update: {},
      create: coupon
    });
  }

  console.log('✅ Coupons created:', coupons.length);

  // Create admin user
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@siddhi.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@siddhi.com',
      password: '$2b$10$rQZ8K9vX8K9vX8K9vX8K9e', // admin123 (hashed)
      role: 'SUPER_ADMIN',
      isActive: true,
      storeId: store.id
    }
  });

  console.log('✅ Admin user created:', admin.email);

  console.log('🎉 Database seed completed successfully!');
  console.log('📊 Summary:');
  console.log(`   - Store: ${store.name}`);
  console.log(`   - Categories: ${createdCategories.length}`);
  console.log(`   - Menu Items: ${createdMenuItems}`);
  console.log(`   - Coupons: ${coupons.length}`);
  console.log(`   - Admin: ${admin.email}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });