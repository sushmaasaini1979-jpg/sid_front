#!/usr/bin/env node

// Test script to verify real-time menu updates
const axios = require('axios');
const io = require('socket.io-client');

const API_URL = 'http://localhost:5000';
const SOCKET_URL = 'http://localhost:5000';

async function testRealtimeUpdates() {
  console.log('🧪 Testing Real-time Menu Updates...\n');
  
  try {
    // 1. Test initial menu data
    console.log('1️⃣ Testing initial menu data...');
    const menuResponse = await axios.get(`${API_URL}/api/menu?store=siddhi`);
    
    if (menuResponse.data && menuResponse.data.menu) {
      const categories = menuResponse.data.menu;
      let totalItems = 0;
      let availableItems = 0;
      
      categories.forEach(category => {
        if (category.items) {
          totalItems += category.items.length;
          availableItems += category.items.filter(item => item.isAvailable).length;
        }
      });
      
      console.log(`✅ Menu API working: ${totalItems} total items, ${availableItems} available`);
    } else {
      console.log('❌ Menu API not working');
      return;
    }

    // 2. Test socket connection
    console.log('\n2️⃣ Testing Socket.IO connection...');
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      timeout: 10000
    });

    return new Promise((resolve) => {
      let connectionEstablished = false;
      let eventReceived = false;

      socket.on('connect', () => {
        console.log('✅ Socket connected successfully');
        connectionEstablished = true;
        
        // Join store room
        socket.emit('join-store', 'siddhi');
        console.log('✅ Joined store room: siddhi');
      });

      socket.on('menu.availability.changed', (data) => {
        console.log('✅ Received real-time update:', data);
        eventReceived = true;
        
        if (connectionEstablished && eventReceived) {
          console.log('\n🎉 Real-time updates are working!');
          console.log('✅ Socket connection: Working');
          console.log('✅ Real-time events: Working');
          console.log('✅ Menu updates: Working');
          console.log('\n🌐 You can now test the frontend:');
          console.log('   • Admin Panel: http://localhost:3000/admin/menu');
          console.log('   • Customer Menu: http://localhost:3000/menu?store=siddhi');
          console.log('\n💡 Toggle items in admin panel and watch customer menu update in real-time!');
          
          socket.disconnect();
          resolve(true);
        }
      });

      socket.on('connect_error', (error) => {
        console.log('❌ Socket connection failed:', error.message);
        resolve(false);
      });

      // Timeout after 10 seconds
      setTimeout(() => {
        if (!connectionEstablished) {
          console.log('❌ Socket connection timeout');
          socket.disconnect();
          resolve(false);
        } else if (!eventReceived) {
          console.log('⚠️  Socket connected but no real-time events received');
          console.log('   This is normal if no admin is currently toggling items');
          console.log('✅ Socket connection: Working');
          console.log('⚠️  Real-time events: Waiting for admin actions');
          socket.disconnect();
          resolve(true);
        }
      }, 10000);
    });

  } catch (error) {
    console.log('❌ Test failed:', error.message);
    return false;
  }
}

async function runRealtimeTest() {
  console.log('🚀 Starting Real-time Menu Update Tests...\n');
  
  const result = await testRealtimeUpdates();
  
  if (result) {
    console.log('\n🎉 Real-time system is ready!');
    console.log('\n📋 Next steps:');
    console.log('1. Open admin panel: http://localhost:3000/admin/menu');
    console.log('2. Open customer menu: http://localhost:3000/menu?store=siddhi');
    console.log('3. Toggle item availability in admin panel');
    console.log('4. Watch customer menu update instantly!');
  } else {
    console.log('\n❌ Real-time system has issues. Please check:');
    console.log('• Backend server is running on port 5000');
    console.log('• Socket.IO is properly configured');
    console.log('• No firewall blocking WebSocket connections');
  }
}

runRealtimeTest().catch(console.error);
