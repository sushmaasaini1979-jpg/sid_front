import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Cart store
export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      itemCount: 0,

      addItem: (menuItem, quantity = 1, notes = '') => {
        console.log('Cart store - addItem called with:', menuItem)
        const items = get().items
        const existingItemIndex = items.findIndex(
          item => item.id === menuItem.id && item.notes === notes
        )

        if (existingItemIndex > -1) {
          // Update existing item
          const updatedItems = items.map((item, index) =>
            index === existingItemIndex
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
          set({ items: updatedItems })
          console.log('Updated existing item in cart')
        } else {
          // Add new item
          const newItem = {
            id: menuItem.id,
            name: menuItem.name,
            description: menuItem.description,
            price: menuItem.price,
            size: menuItem.size,
            imageUrl: menuItem.imageUrl,
            isVeg: menuItem.isVeg,
            quantity,
            notes
          }
          set({ items: [...items, newItem] })
          console.log('Added new item to cart:', newItem)
        }

        get().calculateTotal()
        console.log('Cart total calculated:', get().total)
      },

      removeItem: (itemId, notes = '') => {
        const items = get().items.filter(
          item => !(item.id === itemId && item.notes === notes)
        )
        set({ items })
        get().calculateTotal()
      },

      updateQuantity: (itemId, quantity, notes = '') => {
        if (quantity <= 0) {
          get().removeItem(itemId, notes)
          return
        }

        const items = get().items.map(item =>
          item.id === itemId && item.notes === notes
            ? { ...item, quantity }
            : item
        )
        set({ items })
        get().calculateTotal()
      },

      clearCart: () => {
        set({ items: [], total: 0, itemCount: 0 })
      },

      calculateTotal: () => {
        const items = get().items
        const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
        set({ total, itemCount })
      },

      getItemQuantity: (itemId, notes = '') => {
        const item = get().items.find(
          item => item.id === itemId && item.notes === notes
        )
        return item ? item.quantity : 0
      }
    }),
    {
      name: 'siddhi-cart',
      partialize: (state) => ({ items: state.items, total: state.total, itemCount: state.itemCount })
    }
  )
)

// App store
export const useStore = create(
  persist(
    (set, get) => ({
      // Store information
      storeSlug: 'siddhi',
      storeData: null,
      
      // Customer information
      customer: {
        name: '',
        phone: '',
        email: '',
        address: ''
      },

      // Current order
      currentOrder: null,

      // Admin authentication
      adminToken: null,
      adminUser: null,

      // UI state
      isCartOpen: false,
      selectedCategory: 'all',
      searchQuery: '',

      // Actions
      setStoreSlug: (slug) => set({ storeSlug: slug }),
      setStoreData: (data) => set({ storeData: data }),
      
      setCustomer: (customer) => set({ customer }),
      updateCustomer: (updates) => set((state) => ({ 
        customer: { ...state.customer, ...updates } 
      })),

      setCurrentOrder: (order) => set({ currentOrder: order }),
      clearCurrentOrder: () => set({ currentOrder: null }),

      setAdminAuth: (token, user) => {
        console.log('Setting admin auth:', { token, user })
        set({ adminToken: token, adminUser: user })
      },
      clearAdminAuth: () => set({ adminToken: null, adminUser: null }),

      setCartOpen: (isOpen) => set({ isCartOpen: isOpen }),
      setSelectedCategory: (category) => set({ selectedCategory: category }),
      setSearchQuery: (query) => set({ searchQuery: query }),

      // Computed values
      isAdminAuthenticated: () => {
        const { adminToken } = get()
        return !!adminToken
      },

      getCustomerInfo: () => {
        const { customer } = get()
        return {
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
          address: customer.address
        }
      }
    }),
    {
      name: 'siddhi-app',
      partialize: (state) => ({
        storeSlug: state.storeSlug,
        customer: state.customer,
        adminToken: state.adminToken,
        adminUser: state.adminUser,
        selectedCategory: state.selectedCategory,
        searchQuery: state.searchQuery
      })
    }
  )
)

// Order status store
export const useOrderStore = create((set, get) => ({
  orders: [],
  currentOrder: null,
  isLoading: false,
  error: null,

  setOrders: (orders) => set({ orders }),
  addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
  updateOrder: (orderId, updates) => set((state) => ({
    orders: state.orders.map(order =>
      order.id === orderId ? { ...order, ...updates } : order
    )
  })),

  setCurrentOrder: (order) => set({ currentOrder: order }),
  clearCurrentOrder: () => set({ currentOrder: null }),

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null })
}))

// Admin store
export const useAdminStore = create((set, get) => ({
  // Dashboard data
  dashboardData: null,
  
  // Orders
  orders: [],
  ordersPagination: null,
  
  // Customers
  customers: [],
  customersPagination: null,
  
  // Coupons
  coupons: [],
  couponsPagination: null,
  
  
  
  // Loading states
  isLoading: {
    dashboard: false,
    orders: false,
    customers: false,
    coupons: false,
  },

  // Error states
  errors: {
    dashboard: null,
    orders: null,
    customers: null,
    coupons: null,
  },

  // Actions
  setDashboardData: (data) => set({ dashboardData: data }),
  
  setOrders: (orders, pagination) => set({ orders, ordersPagination: pagination }),
  addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
  updateOrder: (orderId, updates) => set((state) => ({
    orders: state.orders.map(order =>
      order.id === orderId ? { ...order, ...updates } : order
    )
  })),

  setCustomers: (customers, pagination) => set({ customers, customersPagination: pagination }),
  updateCustomer: (customerId, updates) => set((state) => ({
    customers: state.customers.map(customer =>
      customer.id === customerId ? { ...customer, ...updates } : customer
    )
  })),

  setCoupons: (coupons, pagination) => set({ coupons, couponsPagination: pagination }),
  addCoupon: (coupon) => set((state) => ({ coupons: [coupon, ...state.coupons] })),
  updateCoupon: (couponId, updates) => set((state) => ({
    coupons: state.coupons.map(coupon =>
      coupon.id === couponId ? { ...coupon, ...updates } : coupon
    )
  })),
  removeCoupon: (couponId) => set((state) => ({
    coupons: state.coupons.filter(coupon => coupon.id !== couponId)
  })),



  setLoading: (key, isLoading) => set((state) => ({
    isLoading: { ...state.isLoading, [key]: isLoading }
  })),

  setError: (key, error) => set((state) => ({
    errors: { ...state.errors, [key]: error }
  })),

  clearError: (key) => set((state) => ({
    errors: { ...state.errors, [key]: null }
  }))
}))
