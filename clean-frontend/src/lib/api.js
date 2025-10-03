import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('admin_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

// API functions
export const api = {
  // Store & Menu
  getStore: (storeSlug) => apiClient.get(`/menu?store=${storeSlug}`),
  searchMenu: (storeSlug, query) => apiClient.get(`/menu/search?store=${storeSlug}&q=${query}`),

  // Orders
  createOrder: (orderData) => apiClient.post('/orders', orderData),
  getOrder: (orderId) => apiClient.get(`/orders/${orderId}`),
  updateOrderStatus: (orderId, status, estimatedTime) => 
    apiClient.put(`/orders/${orderId}/status`, { status, estimatedTime }),

  // Payments
  createPaymentOrder: (orderId, amount, currency = 'INR') => 
    apiClient.post('/payments/create-order', { orderId, amount, currency }),
  verifyPayment: (paymentData) => apiClient.post('/payments/verify', paymentData),

  // Auth
  login: (email, password) => apiClient.post('/admin/login', { email, password }),
  register: (userData) => apiClient.post('/auth/register', userData),
  getMe: () => apiClient.get('/auth/me'),
  changePassword: (currentPassword, newPassword) => 
    apiClient.post('/auth/change-password', { currentPassword, newPassword }),

  // Admin - Dashboard (Supabase)
  getDashboard: () => apiClient.get('/admin-supabase/dashboard'),
  getAdminDashboard: (timeFilter = 'today') => apiClient.get(`/admin-supabase/dashboard?period=${timeFilter}`),

  // Admin - Orders (Supabase)
  getOrders: (params = {}) => apiClient.get('/admin-supabase/orders', { params }),
  getOrder: (orderId) => apiClient.get(`/admin-supabase/orders/${orderId}`),
  updateOrderStatus: (orderId, status, estimatedTime) => 
    apiClient.put(`/admin-supabase/orders/${orderId}/status`, { status, estimatedTime }),

  // Admin - Customers (Supabase)
  getCustomers: (params = {}) => apiClient.get('/admin-supabase/customers', { params }),

  // Admin - Menu Items (Supabase)
  getMenuItems: (params = {}) => apiClient.get('/admin-supabase/menu-items', { params }),
  addMenuItem: (itemData, storeSlug = 'siddhi') => 
    apiClient.post(`/admin-supabase/menu-items?store=${storeSlug}`, itemData),
  updateMenuItem: (itemId, itemData, storeSlug = 'siddhi') => 
    apiClient.put(`/admin-supabase/menu-items/${itemId}?store=${storeSlug}`, itemData),
  deleteMenuItem: (itemId, storeSlug = 'siddhi') => 
    apiClient.delete(`/admin-supabase/menu-items/${itemId}?store=${storeSlug}`),
  updateItemAvailability: (itemId, isAvailable, storeSlug = 'siddhi') => 
    apiClient.put(`/admin-supabase/menu-items/${itemId}/availability?store=${storeSlug}`, { isAvailable }),

  // Admin - Categories (Supabase)
  getCategories: (params = {}) => apiClient.get('/admin-supabase/categories', { params }),
  addCategory: (categoryData, storeSlug = 'siddhi') => 
    apiClient.post(`/admin-supabase/categories?store=${storeSlug}`, categoryData),
  updateCategory: (categoryId, categoryData, storeSlug = 'siddhi') => 
    apiClient.put(`/admin-supabase/categories/${categoryId}?store=${storeSlug}`, categoryData),
  deleteCategory: (categoryId, storeSlug = 'siddhi') => 
    apiClient.delete(`/admin-supabase/categories/${categoryId}?store=${storeSlug}`),

  // Admin - Coupons (Supabase)
  getCoupons: (params = {}) => apiClient.get('/admin-supabase/coupons', { params }),
  addCoupon: (couponData, storeSlug = 'siddhi') => 
    apiClient.post(`/admin-supabase/coupons?store=${storeSlug}`, couponData),
  updateCoupon: (couponId, couponData, storeSlug = 'siddhi') => 
    apiClient.put(`/admin-supabase/coupons/${couponId}?store=${storeSlug}`, couponData),
  deleteCoupon: (couponId, storeSlug = 'siddhi') => 
    apiClient.delete(`/admin-supabase/coupons/${couponId}?store=${storeSlug}`),

  // Admin - Transactions (Supabase)
  getTransactions: (params = {}) => apiClient.get('/admin-supabase/transactions', { params }),

  // Admin - Reports (Supabase)
  getReports: (params = {}) => apiClient.get('/admin-supabase/reports', { params }),

  // Admin - Realtime
  subscribeRealtime: (storeSlug = 'siddhi') => apiClient.get(`/admin-supabase/realtime/subscribe?store=${storeSlug}`),
  blockCustomer: (customerId, isBlocked) => 
    apiClient.put(`/admin/customers/${customerId}/block`, { isBlocked }),

  // Coupon validation
  validateCoupon: (code, orderAmount) => 
    apiClient.get(`/coupons/validate/${code}`, { params: { orderAmount } }),



}

// Utility functions
export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

export default api
