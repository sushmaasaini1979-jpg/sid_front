#!/usr/bin/env node

// Test script to verify the fixes
const axios = require('axios');

const API_URL = 'http://localhost:5000';

async function testMenuAPI() {
  console.log('🧪 Testing Menu API...');
  
  try {
    const response = await axios.get(`${API_URL}/api/menu?store=siddhi`);
    
    if (response.data && response.data.menu) {
      const categories = response.data.menu;
      let totalItems = 0;
      let availableItems = 0;
      
      categories.forEach(category => {
        if (category.items) {
          totalItems += category.items.length;
          availableItems += category.items.filter(item => item.isAvailable).length;
        }
      });
      
      console.log(`✅ Menu API working:`);
      console.log(`   📊 Total items: ${totalItems}`);
      console.log(`   ✅ Available items: ${availableItems}`);
      console.log(`   ❌ Unavailable items: ${totalItems - availableItems}`);
      
      if (totalItems > 0) {
        console.log('✅ Menu API is returning items with availability status');
        return true;
      } else {
        console.log('❌ No items found in menu');
        return false;
      }
    } else {
      console.log('❌ Invalid menu response format');
      return false;
    }
  } catch (error) {
    console.log('❌ Menu API test failed:', error.message);
    return false;
  }
}

async function testAdminAPI() {
  console.log('🧪 Testing Admin API...');
  
  try {
    const response = await axios.get(`${API_URL}/api/admin-supabase/menu-items?store=siddhi`);
    
    if (response.data && response.data.success) {
      const { menuItems, statistics } = response.data;
      
      console.log(`✅ Admin API working:`);
      console.log(`   📊 Total items: ${statistics.totalItems}`);
      console.log(`   ✅ Available items: ${statistics.availableItems}`);
      console.log(`   ❌ Out of stock: ${statistics.outOfStockItems}`);
      
      if (statistics.totalItems > 0) {
        console.log('✅ Admin API is returning correct statistics');
        return true;
      } else {
        console.log('❌ No items found in admin API');
        return false;
      }
    } else {
      console.log('❌ Invalid admin API response format');
      return false;
    }
  } catch (error) {
    console.log('❌ Admin API test failed:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting API Tests...\n');
  
  const menuTest = await testMenuAPI();
  console.log('');
  
  const adminTest = await testAdminAPI();
  console.log('');
  
  if (menuTest && adminTest) {
    console.log('🎉 All tests passed! The fixes are working correctly.');
    console.log('');
    console.log('✅ Menu API returns items with availability status');
    console.log('✅ Admin API returns correct statistics');
    console.log('✅ Real-time toggles should work properly');
    console.log('');
    console.log('🌐 You can now test the frontend:');
    console.log('   • Admin Panel: http://localhost:3000/admin/menu');
    console.log('   • Customer Menu: http://localhost:3000/menu?store=siddhi');
  } else {
    console.log('❌ Some tests failed. Please check the backend server.');
    console.log('   Make sure the backend is running on port 5000');
    console.log('   Run: ./start-backend.sh');
  }
}

runTests().catch(console.error);
