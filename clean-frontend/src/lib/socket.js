import { io } from 'socket.io-client'
import toast from 'react-hot-toast'

class SocketManager {
  constructor() {
    this.socket = null
    this.isConnected = false
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 1000
  }

  connect(storeSlug) {
    if (this.socket && this.isConnected) {
      return this.socket
    }

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001'
    
    this.socket = io(API_URL, {
      transports: ['websocket', 'polling'],
      timeout: 30000,
      forceNew: false,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity, // Keep trying forever
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
      maxReconnectionAttempts: Infinity,
      pingTimeout: 60000,
      pingInterval: 30000,
      upgrade: true,
      rememberUpgrade: true,
    })

    this.setupEventListeners(storeSlug)
    
    return this.socket
  }

  setupEventListeners(storeSlug) {
    if (!this.socket) return

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket.id)
      this.isConnected = true
      this.reconnectAttempts = 0
      
      // Join store room
      if (storeSlug) {
        this.socket.emit('join-store', storeSlug)
      }
      
      // Set up ping/pong for connection health
      this.startPingPong()
    })

    // Listen for room join confirmations
    this.socket.on('joined-store', (data) => {
      console.log('🏪 Joined store room:', data)
    })

    this.socket.on('joined-admin', (data) => {
      console.log('👨‍💼 Joined admin room:', data)
    })

    // Handle pong responses
    this.socket.on('pong', () => {
      console.log('🏓 Pong received - connection healthy')
    })

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason)
      this.isConnected = false
      
      // Always try to reconnect silently, regardless of reason
      console.log('Connection lost, attempting to reconnect silently...')
      this.handleReconnect()
    })

    this.socket.on('connect_error', (error) => {
      console.log('Socket connection error:', error.message)
      this.isConnected = false
      
      // Always try to reconnect silently
      console.log('Connection error, retrying silently...')
      this.handleReconnect()
    })

    // Order events
    this.socket.on('order.created', (data) => {
      console.log('New order created:', data)
      toast.success(`New order #${data.orderNumber} received!`)
    })

    this.socket.on('order.updated', (data) => {
      console.log('Order updated:', data)
      // This will be handled by individual components
    })

    this.socket.on('order.status.changed', (data) => {
      console.log('Order status changed:', data)
      toast.info(`Order #${data.orderNumber} status: ${data.status}`)
    })

    // Payment events
    this.socket.on('payment.completed', (data) => {
      console.log('Payment completed:', data)
      toast.success('Payment successful!')
    })

    this.socket.on('payment.failed', (data) => {
      console.log('Payment failed:', data)
      toast.error('Payment failed. Please try again.')
    })

    this.socket.on('payment.received', (data) => {
      console.log('Payment received:', data)
      toast.success(`Payment received for order #${data.orderNumber}`)
    })

    // Inventory events
    this.socket.on('inventory.low', (data) => {
      console.log('Low inventory alert:', data)
      toast.warning(`Low stock: ${data.menuItemName} (${data.currentQuantity} ${data.unit} left)`)
    })

    this.socket.on('inventory.restocked', (data) => {
      console.log('Inventory restocked:', data)
      toast.success(`${data.menuItemName} restocked: ${data.newQuantity} ${data.unit}`)
    })

    // Menu availability events
    this.socket.on('menu.availability.changed', (data) => {
      console.log('Menu availability changed:', data)
      // This will be handled by individual components
    })

    this.socket.on('menu.statistics.updated', (data) => {
      console.log('Menu statistics updated:', data)
      // This will be handled by admin components
    })

    this.socket.on('menu.item.added', (data) => {
      console.log('Menu item added:', data)
      // This will be handled by customer components
    })

    this.socket.on('menu.item.updated', (data) => {
      console.log('Menu item updated:', data)
      // This will be handled by customer components
    })

    this.socket.on('menu.item.deleted', (data) => {
      console.log('Menu item deleted:', data)
      // This will be handled by customer components
    })

    this.socket.on('category.added', (data) => {
      console.log('Category added:', data)
      // This will be handled by admin components
    })

    this.socket.on('category.updated', (data) => {
      console.log('Category updated:', data)
      // This will be handled by admin components
    })

    this.socket.on('category.deleted', (data) => {
      console.log('Category deleted:', data)
      // This will be handled by admin components
    })
  }

  handleReconnect() {
    // Always try to reconnect, but with exponential backoff
    this.reconnectAttempts++
    const delay = Math.min(this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1), 10000) // Max 10 seconds
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`)
    
    setTimeout(() => {
      if (this.socket && !this.isConnected) {
        this.socket.connect()
      }
    }, delay)
  }

  joinOrder(orderId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-order', orderId)
    }
  }

  leaveOrder(orderId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave-order', orderId)
    }
  }

  disconnect() {
    if (this.socket) {
      this.stopPingPong()
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
    }
  }

  // Event subscription helpers
  onOrderUpdate(callback) {
    if (this.socket) {
      this.socket.on('order.updated', callback)
    }
  }

  onPaymentUpdate(callback) {
    if (this.socket) {
      this.socket.on('payment.completed', callback)
      this.socket.on('payment.failed', callback)
    }
  }

  onInventoryAlert(callback) {
    if (this.socket) {
      this.socket.on('inventory.low', callback)
    }
  }

  // Remove event listeners
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback)
    }
  }

  // Start ping/pong for connection health
  startPingPong() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval)
    }
    
    this.pingInterval = setInterval(() => {
      if (this.socket && this.isConnected) {
        this.socket.emit('ping')
      }
    }, 30000) // Ping every 30 seconds
  }

  // Stop ping/pong
  stopPingPong() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval)
      this.pingInterval = null
    }
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      socketId: this.socket?.id,
      reconnectAttempts: this.reconnectAttempts
    }
  }
}

// Create singleton instance
const socketManager = new SocketManager()

export default socketManager
