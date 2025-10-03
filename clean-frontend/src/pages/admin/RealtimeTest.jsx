import React, { useState, useEffect } from 'react'
import { useRealtimeOrders, useRealtimeCustomers } from '../../hooks/useRealtimeOrders'

const RealtimeTest = () => {
  const [testResults, setTestResults] = useState([])
  
  const { orders, isConnected: ordersConnected, isLoading: ordersLoading } = useRealtimeOrders('siddhi')
  const { customers, isConnected: customersConnected, isLoading: customersLoading } = useRealtimeCustomers('siddhi')

  useEffect(() => {
    const results = []
    
    // Test 1: Backend API Connection
    fetch('http://localhost:3001/api/admin-supabase/orders?store=siddhi')
      .then(res => res.json())
      .then(data => {
        results.push({
          test: 'Backend API Orders',
          status: data.success ? '✅ PASS' : '❌ FAIL',
          details: data.success ? `${data.orders?.length || 0} orders` : data.error
        })
        setTestResults([...results])
      })
      .catch(err => {
        results.push({
          test: 'Backend API Orders',
          status: '❌ FAIL',
          details: err.message
        })
        setTestResults([...results])
      })

    // Test 2: Supabase Direct Connection
    fetch('https://imhkrycglxvjlpseieqv.supabase.co/rest/v1/customers?select=count', {
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltaGtyeWNnbHh2amxwc2VpZXF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMDI1NjcsImV4cCI6MjA3Mzc3ODU2N30.Lc2j8sEFCElNARu3JZet53Z6Yn50X1e3snM5yHlg36E'
      }
    })
      .then(res => res.json())
      .then(data => {
        results.push({
          test: 'Supabase Direct Connection',
          status: '✅ PASS',
          details: `${data[0]?.count || 0} customers`
        })
        setTestResults([...results])
      })
      .catch(err => {
        results.push({
          test: 'Supabase Direct Connection',
          status: '❌ FAIL',
          details: err.message
        })
        setTestResults([...results])
      })

  }, [])

  const createTestOrder = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          storeSlug: 'siddhi',
          customer: {
            name: `@Test Real Time ${Date.now()}`,
            phone: '9999999999',
            email: 'test@realtime.com'
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
        setTestResults(prev => [...prev, {
          test: 'Create Test Order',
          status: '✅ PASS',
          details: `Order ${data.orderNumber} created successfully`
        }])
      } else {
        setTestResults(prev => [...prev, {
          test: 'Create Test Order',
          status: '❌ FAIL',
          details: data.error || 'Unknown error'
        }])
      }
    } catch (error) {
      setTestResults(prev => [...prev, {
        test: 'Create Test Order',
        status: '❌ FAIL',
        details: error.message
      }])
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Real-time System Test</h1>
        
        {/* Connection Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Orders Real-time</h2>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${ordersConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>Connection: {ordersConnected ? 'Connected' : 'Disconnected'}</span>
              </div>
              <div>Loading: {ordersLoading ? 'Yes' : 'No'}</div>
              <div>Orders Count: {orders.length}</div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Customers Real-time</h2>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${customersConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>Connection: {customersConnected ? 'Connected' : 'Disconnected'}</span>
              </div>
              <div>Loading: {customersLoading ? 'Yes' : 'No'}</div>
              <div>Customers Count: {customers.length}</div>
            </div>
          </div>
        </div>

        {/* Test Results */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          <div className="space-y-2">
            {testResults.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="font-medium">{result.test}</span>
                <div className="text-right">
                  <div className="font-bold">{result.status}</div>
                  <div className="text-sm text-gray-600">{result.details}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Test Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
          <button
            onClick={createTestOrder}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Create Test Order
          </button>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow p-6 mt-8">
          <h2 className="text-xl font-semibold mb-4">Recent Orders (Real-time)</h2>
          <div className="space-y-2">
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className="p-3 bg-gray-50 rounded">
                <div className="font-medium">{order.orderNumber}</div>
                <div className="text-sm text-gray-600">{order.customer?.name} - {order.status}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default RealtimeTest
