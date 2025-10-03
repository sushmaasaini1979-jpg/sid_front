import { useState, useEffect, useCallback } from 'react'
import { useQueryClient } from 'react-query'

const useRealtimeUpdates = (storeSlug) => {
  const [isConnected, setIsConnected] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(null)
  const queryClient = useQueryClient()

  // Force refresh function
  const forceRefresh = useCallback(() => {
    console.log('🔄 Force refreshing all queries...')
    queryClient.invalidateQueries(['menu', storeSlug])
    queryClient.invalidateQueries(['admin-menu-items'])
    queryClient.invalidateQueries(['admin-dashboard'])
    queryClient.invalidateQueries(['admin-orders'])
    setLastUpdate(new Date().toISOString())
  }, [queryClient, storeSlug])

  useEffect(() => {
    if (!storeSlug) return

    console.log('🔌 Setting up simple polling for store:', storeSlug)
    
    // Simple polling approach - much more reliable
    const pollInterval = setInterval(() => {
      console.log('🔄 Polling for updates...')
      forceRefresh()
    }, 2000) // Poll every 2 seconds

    // Cleanup
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval)
      }
    }
  }, [storeSlug, forceRefresh])

  return { isConnected, lastUpdate, forceRefresh }
}

export default useRealtimeUpdates
