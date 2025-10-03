import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

const supabase = createClient(supabaseUrl, supabaseKey)

export const useRealtimeOrders = (storeSlug = 'siddhi') => {
  const [orders, setOrders] = useState([])
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let subscription = null

    // Fetch initial orders from backend API
    const fetchOrders = async () => {
      try {
        console.log('🔄 Fetching orders from backend API...')
        const response = await fetch(`${API_BASE_URL}/admin-supabase/orders?store=${storeSlug}`)
        const data = await response.json()

        if (data.success && data.data) {
          console.log('✅ Fetched', data.data.orders.length, 'orders from backend API')
          setOrders(data.data.orders || [])
          setIsConnected(true)
        } else {
          console.error('Error fetching orders from API:', data.error)
          setIsConnected(false)
        }
      } catch (err) {
        console.error('Error in fetchOrders:', err)
        setIsConnected(false)
      } finally {
        setIsLoading(false)
      }
    }

    // Set up real-time subscription
    const setupRealtimeSubscription = () => {
      console.log('🔄 Setting up real-time subscription for orders...')
      
      subscription = supabase
        .channel('orders-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'orders'
          },
          (payload) => {
            console.log('🔄 Real-time order update:', payload)
            // Refetch orders when any order changes
            fetchOrders()
          }
        )
        .subscribe((status) => {
          console.log('📡 Subscription status:', status)
          setIsConnected(status === 'SUBSCRIBED')
        })
    }

    // Initial fetch
    fetchOrders()
    
    // Set up polling for real-time updates
    const pollInterval = setInterval(() => {
      console.log('🔄 Polling for order updates...')
      fetchOrders()
    }, 3000) // Poll every 3 seconds
    
    // Set up real-time subscription
    setupRealtimeSubscription()

    // Cleanup
    return () => {
      if (subscription) {
        console.log('🧹 Cleaning up orders subscription')
        supabase.removeChannel(subscription)
      }
      if (pollInterval) {
        console.log('🧹 Cleaning up polling interval')
        clearInterval(pollInterval)
      }
    }
  }, [storeSlug])

  return { orders, isConnected, isLoading }
}

export const useRealtimeCustomers = (storeSlug = 'siddhi') => {
  const [customers, setCustomers] = useState([])
  const [statistics, setStatistics] = useState({})
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let subscription = null

    // Fetch customers from backend API
    const fetchCustomers = async () => {
      try {
        console.log('🔄 Fetching customers from backend API...')
        const response = await fetch(`${API_BASE_URL}/admin-supabase/customers?store=${storeSlug}`)
        const data = await response.json()

        if (data.success && data.data) {
          console.log('✅ Fetched', data.data.customers.length, 'customers from backend API')
          
          const customersData = data.data.customers || []
          
          // Calculate statistics
          const totalCustomers = customersData.length
          const activeCustomers = customersData.filter(c => c.totalOrders > 0).length
          const newThisMonth = customersData.filter(c => {
            const createdDate = new Date(c.createdAt)
            const now = new Date()
            return createdDate.getMonth() === now.getMonth() && createdDate.getFullYear() === now.getFullYear()
          }).length
          const blockedCustomers = customersData.filter(c => c.status === 'blocked').length

          setStatistics({
            totalCustomers,
            activeCustomers,
            newThisMonth,
            blockedCustomers,
            growthPercentage: newThisMonth > 0 ? 100 : 0
          })
          
          setCustomers(customersData)
          setIsConnected(true)
        } else {
          console.error('Error fetching customers from API:', data.error)
          setIsConnected(false)
        }
      } catch (err) {
        console.error('Error in fetchCustomers:', err)
        setIsConnected(false)
      } finally {
        setIsLoading(false)
      }
    }

    // Set up real-time subscription
    const setupRealtimeSubscription = () => {
      console.log('🔄 Setting up real-time subscription for customers...')
      
      subscription = supabase
        .channel('customers-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'customers'
          },
          (payload) => {
            console.log('🔄 Real-time customer update:', payload)
            // Refetch customers when any customer changes
            fetchCustomers()
          }
        )
        .subscribe((status) => {
          console.log('📡 Customer subscription status:', status)
          setIsConnected(status === 'SUBSCRIBED')
        })
    }

    // Initial fetch
    fetchCustomers()
    
    // Set up real-time subscription
    setupRealtimeSubscription()

    // Cleanup
    return () => {
      if (subscription) {
        console.log('🧹 Cleaning up customers subscription')
        supabase.removeChannel(subscription)
      }
    }
  }, [storeSlug])

  return { customers, statistics, isConnected, isLoading }
}

export const useRealtimeCoupons = (storeSlug = 'siddhi') => {
  const [coupons, setCoupons] = useState([])
  const [statistics, setStatistics] = useState({})
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let intervalId = null

    // Fetch coupons from backend API
    const fetchCoupons = async () => {
      try {
        console.log('🔄 Fetching coupons from backend API...', `${API_BASE_URL}/admin-supabase/coupons?store=${storeSlug}`)
        const response = await fetch(`${API_BASE_URL}/admin-supabase/coupons?store=${storeSlug}`)
        const data = await response.json()
        
        console.log('📊 Raw API response:', data)
        
        if (data.success && data.data && data.data.coupons) {
          console.log('✅ Fetched', data.data.coupons.length, 'coupons from backend API')
          console.log('📋 Coupons data:', data.data.coupons)
          setCoupons(data.data.coupons)
          if (data.data.statistics) {
            console.log('📈 Statistics:', data.data.statistics)
            setStatistics(data.data.statistics)
          }
          setIsConnected(true)
        } else {
          console.error('❌ Error fetching coupons from API:', data.error || 'No coupons data')
          console.error('❌ Response structure:', { success: data.success, hasData: !!data.data, hasCoupons: !!(data.data && data.data.coupons) })
          setIsConnected(false)
        }
      } catch (err) {
        console.error('❌ Error in fetchCoupons:', err)
        setIsConnected(false)
      } finally {
        setIsLoading(false)
      }
    }

    // Initial fetch
    fetchCoupons()

    // Set up polling for real-time updates (every 5 seconds)
    intervalId = setInterval(fetchCoupons, 5000)

    // Cleanup
    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [storeSlug])

  return { coupons, statistics, isConnected, isLoading }
}

export const useRealtimeDashboard = (storeSlug = 'siddhi', timeFilter = 'today') => {
  const [dashboardData, setDashboardData] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let subscription = null

    // Calculate date range based on timeFilter
    const getDateRange = () => {
      const now = new Date()
      let startDate, endDate

      switch (timeFilter) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
          break
        case 'weekly':
          const startOfWeek = new Date(now)
          startOfWeek.setDate(now.getDate() - now.getDay())
          startOfWeek.setHours(0, 0, 0, 0)
          startDate = startOfWeek
          endDate = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000)
          break
        case 'monthly':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)
          break
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
      }

      return { startDate, endDate }
    }

    // Fetch dashboard data from backend API
    const fetchDashboard = async () => {
      try {
        console.log('🔄 Fetching dashboard data from backend API...', { storeSlug, timeFilter })
        
        // Fetch dashboard metrics and recent orders in parallel
        const [dashboardResponse, ordersResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/admin-supabase/dashboard?store=${storeSlug}&period=${timeFilter}`),
          fetch(`${API_BASE_URL}/admin-supabase/orders?store=${storeSlug}&limit=5`)
        ])
        
        const dashboardData = await dashboardResponse.json()
        const ordersData = await ordersResponse.json()
        
        if (dashboardData.success && dashboardData.data) {
          const { metrics } = dashboardData.data
          
          // Format recent orders
          const recentOrders = ordersData.success && ordersData.data ? 
            ordersData.data.orders.slice(0, 5).map(order => ({
              id: order.id,
              orderNumber: order.orderNumber || `ORD${order.id}`,
              customerName: order.customerName || 'Unknown Customer',
              customerPhone: order.customerPhone || '',
              items: order.orderItems || 'No items',
              total: order.total || 0,
              formattedTotal: new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                minimumFractionDigits: 0,
              }).format(order.total || 0),
              status: order.status,
              createdAt: order.createdAt,
              paymentMethod: order.paymentMethod || 'UPI'
            })) : []
          
          // Format dashboard data to match expected structure
          const dashboardDataFormatted = {
            totalOrders: metrics.totalOrders || 0,
            totalRevenue: metrics.totalRevenue || 0,
            pendingOrders: metrics.pendingOrders || 0,
            inKitchenOrders: metrics.inKitchenOrders || 0,
            outForDeliveryOrders: metrics.outForDeliveryOrders || 0,
            deliveredOrders: metrics.completedOrders || 0,
            cancelledOrders: metrics.cancelledOrders || 0,
            recentOrders,
            period: timeFilter,
            dateRange: {
              startDate: new Date().toISOString(),
              endDate: new Date().toISOString()
            }
          }

          console.log('✅ Fetched dashboard data from backend API:', dashboardDataFormatted)
          setDashboardData(dashboardDataFormatted)
          setIsConnected(true)
        } else {
          console.error('Error fetching dashboard from API:', dashboardData.error)
          setIsConnected(false)
        }
      } catch (err) {
        console.error('Error in fetchDashboard:', err)
        setIsConnected(false)
      } finally {
        setIsLoading(false)
      }
    }

    // Set up real-time subscription
    const setupRealtimeSubscription = () => {
      console.log('🔄 Setting up real-time subscription for dashboard...')
      
      subscription = supabase
        .channel('dashboard-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'orders'
          },
          (payload) => {
            console.log('🔄 Real-time dashboard update:', payload)
            // Refetch dashboard when any order changes
            fetchDashboard()
          }
        )
        .subscribe((status) => {
          console.log('📡 Dashboard subscription status:', status)
          setIsConnected(status === 'SUBSCRIBED')
        })
    }

    // Initial fetch
    fetchDashboard()
    
    // Set up polling for real-time updates
    const pollInterval = setInterval(() => {
      console.log('🔄 Polling for dashboard updates...')
      fetchDashboard()
    }, 5000) // Poll every 5 seconds
    
    // Set up real-time subscription
    setupRealtimeSubscription()

    // Cleanup
    return () => {
      if (subscription) {
        console.log('🧹 Cleaning up dashboard subscription')
        supabase.removeChannel(subscription)
      }
      if (pollInterval) {
        console.log('🧹 Cleaning up dashboard polling interval')
        clearInterval(pollInterval)
      }
    }
  }, [storeSlug, timeFilter])

  return { dashboardData, isConnected, isLoading }
}
