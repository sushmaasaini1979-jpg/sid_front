#!/usr/bin/env node

// Simple socket debugging script
const io = require('socket.io-client');

console.log('🔍 Debugging Socket Connection...\n');

const socket = io('http://localhost:5000', {
  transports: ['websocket', 'polling'],
  timeout: 10000
});

socket.on('connect', () => {
  console.log('✅ Socket connected successfully');
  console.log('📡 Socket ID:', socket.id);
  
  // Join store room
  socket.emit('join-store', 'siddhi');
  console.log('✅ Joined store room: siddhi');
  
  // Listen for menu events
  socket.on('menu.availability.changed', (data) => {
    console.log('🎉 Received menu.availability.changed event:', data);
  });
  
  socket.on('menu.statistics.updated', (data) => {
    console.log('📊 Received menu.statistics.updated event:', data);
  });
  
  console.log('\n🎯 Now test the admin panel:');
  console.log('1. Go to http://localhost:3000/admin/menu');
  console.log('2. Toggle any menu item');
  console.log('3. Watch this console for events\n');
});

socket.on('connect_error', (error) => {
  console.log('❌ Socket connection failed:', error.message);
  console.log('💡 Make sure backend is running on port 5000');
});

socket.on('disconnect', (reason) => {
  console.log('🔌 Socket disconnected:', reason);
});

// Keep the script running
process.on('SIGINT', () => {
  console.log('\n👋 Closing socket connection...');
  socket.disconnect();
  process.exit(0);
});

console.log('⏳ Waiting for socket connection...');
console.log('💡 Press Ctrl+C to exit');
