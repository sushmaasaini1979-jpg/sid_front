import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from 'react-query'
import toast from 'react-hot-toast'
import { api } from '../lib/api'
import socketManager from '../lib/socket'

export const useRealtimeMenu = (storeSlug) => {
  const [isUpdating, setIsUpdating] = useState(false)
  const [socketConnected, setSocketConnected] = useState(false)
  const queryClient = useQueryClient()

  // Fetch menu data with aggressive polling for real-time updates
  const { data: menuData, isLoading, error, refetch } = useQuery(
    ['menu', storeSlug],
    () => api.getStore(storeSlug),
    {
      enabled: !!storeSlug,
      staleTime: 0, // Always consider data stale
      cacheTime: 30 * 1000, // 30 seconds
      refetchOnWindowFocus: true, // Refetch on window focus
      refetchInterval: 2000, // Poll every 2 seconds
      refetchIntervalInBackground: true, // Continue polling in background
    }
  )

  // Set up real-time socket connection for menu updates
  useEffect(() => {
    if (!storeSlug) return

    console.log('🔌 Setting up real-time menu updates for store:', storeSlug)
    
    const socket = socketManager.connect(storeSlug)

    // Wait for socket connection
    const setupListeners = () => {
      console.log('📡 Socket connected, setting up menu listeners')
      
      // Listen for menu availability changes
      const handleMenuAvailabilityChange = (data) => {
        console.log('🔄 Menu availability changed:', data)
        
        // Show toast notification
        const status = data.isAvailable ? 'Available' : 'Out of Stock'
        toast.success(`${data.itemName} is now ${status}`, {
          duration: 3000,
          icon: data.isAvailable ? '✅' : '❌'
        })
        
        // Show updating indicator
        setIsUpdating(true)
        
        // Invalidate the query cache to force fresh data
        queryClient.invalidateQueries(['menu', storeSlug])
        
        // Force a refetch to ensure immediate update
        refetch().finally(() => {
          // Hide updating indicator after a short delay
          setTimeout(() => setIsUpdating(false), 1000)
        })
      }

      // Listen for menu statistics updates (from admin panel)
      const handleMenuStatisticsUpdate = (data) => {
        console.log('📊 Menu statistics updated:', data)
        
        // Also invalidate menu data when statistics change
        queryClient.invalidateQueries(['menu', storeSlug])
      }

      const handleMenuItemAdded = (data) => {
        console.log('➕ Menu item added:', data)
        
        const status = data.item.isAvailable ? 'Available' : 'Out of Stock'
        toast.success(`New item added: ${data.item.name} (${status})`, {
          duration: 3000,
          icon: '🍽️'
        })

        setIsUpdating(true)
        queryClient.invalidateQueries(['menu', storeSlug])
        refetch().finally(() => {
          setTimeout(() => setIsUpdating(false), 1000)
        })
      }

      const handleMenuItemUpdated = (data) => {
        console.log('✏️ Menu item updated:', data)
        
        const status = data.item.isAvailable ? 'Available' : 'Out of Stock'
        toast.success(`Item updated: ${data.item.name} (${status})`, {
          duration: 3000,
          icon: '✏️'
        })

        setIsUpdating(true)
        queryClient.invalidateQueries(['menu', storeSlug])
        refetch().finally(() => {
          setTimeout(() => setIsUpdating(false), 1000)
        })
      }

      const handleMenuItemDeleted = (data) => {
        console.log('🗑️ Menu item deleted:', data)
        
        toast.success(`Item removed: ${data.itemName}`, {
          duration: 3000,
          icon: '🗑️'
        })

        setIsUpdating(true)
        queryClient.invalidateQueries(['menu', storeSlug])
        refetch().finally(() => {
          setTimeout(() => setIsUpdating(false), 1000)
        })
      }

      socket.on('menu.availability.changed', handleMenuAvailabilityChange)
      socket.on('menu.statistics.updated', handleMenuStatisticsUpdate)
      socket.on('menu.item.added', handleMenuItemAdded)
      socket.on('menu.item.updated', handleMenuItemUpdated)
      socket.on('menu.item.deleted', handleMenuItemDeleted)

      return () => {
        socket.off('menu.availability.changed', handleMenuAvailabilityChange)
        socket.off('menu.statistics.updated', handleMenuStatisticsUpdate)
        socket.off('menu.item.added', handleMenuItemAdded)
        socket.off('menu.item.updated', handleMenuItemUpdated)
        socket.off('menu.item.deleted', handleMenuItemDeleted)
      }
    }

    // Set up listeners immediately
    const cleanup = setupListeners()

    // Also set up listeners when socket connects
    socket.on('connect', () => {
      console.log('✅ Socket connected for menu updates')
      setSocketConnected(true)
      setupListeners()
    })

    socket.on('disconnect', () => {
      console.log('🔌 Socket disconnected for menu updates')
      setSocketConnected(false)
    })

    socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error for menu:', error)
      setSocketConnected(false)
    })

    // Fallback: If socket is not connected, refetch every 10 seconds
    const fallbackInterval = setInterval(() => {
      if (!socketConnected) {
        console.log('🔄 Socket not connected, refetching menu data...')
        refetch()
      }
    }, 10000)

    return () => {
      cleanup()
      clearInterval(fallbackInterval)
    }
  }, [storeSlug, refetch, queryClient])

  return {
    menuData,
    isLoading,
    error,
    isUpdating,
    refetch
  }
}
