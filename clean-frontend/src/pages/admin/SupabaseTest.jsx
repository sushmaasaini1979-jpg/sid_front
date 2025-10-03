import React, { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

const SupabaseTest = () => {
  const [connectionStatus, setConnectionStatus] = useState('Disconnected')
  const [orders, setOrders] = useState([])
  const [customers, setCustomers] = useState([])
  const [logs, setLogs] = useState([])

  const addLog = (message) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  useEffect(() => {
    addLog('Starting Supabase real-time test...')

    // Test orders subscription
    const ordersChannel = supabase
      .channel('test-orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          addLog(`Orders change: ${payload.eventType} - ${payload.new?.id || payload.old?.id}`)
          // Fetch updated orders
          fetchOrders()
        }
      )
      .subscribe((status) => {
        addLog(`Orders subscription status: ${status}`)
        if (status === 'SUBSCRIBED') {
          setConnectionStatus('Connected')
        }
      })

    // Test customers subscription
    const customersChannel = supabase
      .channel('test-customers')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'customers'
        },
        (payload) => {
          addLog(`Customers change: ${payload.eventType} - ${payload.new?.id || payload.old?.id}`)
          // Fetch updated customers
          fetchCustomers()
        }
      )
      .subscribe((status) => {
        addLog(`Customers subscription status: ${status}`)
      })

    // Initial data fetch
    fetchOrders()
    fetchCustomers()

    return () => {
      supabase.removeChannel(ordersChannel)
      supabase.removeChannel(customersChannel)
    }
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/admin-supabase/orders?store=siddhi')
      const data = await response.json()
      if (data.success) {
        setOrders(data.orders)
        addLog(`Fetched ${data.orders.length} orders`)
      }
    } catch (error) {
      addLog(`Error fetching orders: ${error.message}`)
    }
  }

  const fetchCustomers = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/admin-supabase/customers?store=siddhi')
      const data = await response.json()
      if (data.success) {
        setCustomers(data.customers)
        addLog(`Fetched ${data.customers.length} customers`)
      }
    } catch (error) {
      addLog(`Error fetching customers: ${error.message}`)
    }
  }

  const createTestOrder = async () => {
    try {
      addLog('Creating test order...')
      const response = await fetch('http://localhost:3001/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          storeSlug: 'siddhi',
          customer: {
            name: `@Supabase Test ${Date.now()}`,
            phone: '8888888888',
            email: 'supabase@test.com'
          },
          items: [{
            menuItemId: 'cmfpllfb500008u996w5g5mlm-paneer-tikka',
            quantity: 1
          }],
          paymentMethod: 'CASH_ON_DELIVERY'
        })
      })
      
      const data = await response.json()
      if (data.id) {
        addLog(`✅ Order created: ${data.orderNumber}`)
      } else {
        addLog(`❌ Order creation failed: ${data.error}`)
      }
    } catch (error) {
      addLog(`❌ Order creation error: ${error.message}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Supabase Real-time Test</h1>
        
        {/* Connection Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${connectionStatus === 'Connected' ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="font-medium">{connectionStatus}</span>
          </div>
        </div>

        {/* Data Counts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Orders</h2>
            <div className="text-3xl font-bold text-blue-600">{orders.length}</div>
            <div className="text-sm text-gray-600">Total orders</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Customers</h2>
            <div className="text-3xl font-bold text-green-600">{customers.length}</div>
            <div className="text-sm text-gray-600">Total customers</div>
          </div>
        </div>

        {/* Test Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
          <div className="space-x-4">
            <button
              onClick={createTestOrder}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Create Test Order
            </button>
            <button
              onClick={fetchOrders}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Refresh Orders
            </button>
            <button
              onClick={fetchCustomers}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Refresh Customers
            </button>
          </div>
        </div>

        {/* Logs */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Real-time Logs</h2>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg h-64 overflow-y-auto font-mono text-sm">
            {logs.map((log, index) => (
              <div key={index}>{log}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SupabaseTest
