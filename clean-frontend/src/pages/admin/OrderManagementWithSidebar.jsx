import React, { useState, useEffect } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { useRealtimeOrders } from '../../hooks/useRealtimeOrders'

const OrderManagementWithSidebar = () => {
  const [statusFilter, setStatusFilter] = useState('all')

  // Format currency to rupees
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Request notification permission on component mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  // Real-time orders subscription (fetches all data from backend API)
  const { orders, isConnected, isLoading } = useRealtimeOrders('siddhi')
  
  // Manual refresh function
  const handleRefresh = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'
      const response = await fetch(`${API_BASE_URL}/admin-supabase/orders?store=siddhi`)
      const data = await response.json()
      if (data.success && data.orders) {
        // Force re-render by updating the component
        window.location.reload()
      }
    } catch (error) {
      console.error('Error refreshing orders:', error)
    }
  }

  // Format time for display
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }
  
  // Calculate statistics from orders
  const statistics = {
    totalOrders: orders.length,
    pendingOrders: orders.filter(order => order.status === 'PENDING').length,
    inKitchenOrders: orders.filter(order => order.status === 'PREPARING').length,
    deliveredOrders: orders.filter(order => order.status === 'DELIVERED').length,
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      'DELIVERED': 'bg-green-100 text-green-800',
      'OUT_FOR_DELIVERY': 'bg-blue-100 text-blue-800',
      'PREPARING': 'bg-yellow-100 text-yellow-800',
      'CONFIRMED': 'bg-blue-100 text-blue-800',
      'PENDING': 'bg-gray-100 text-gray-800',
      'CANCELLED': 'bg-red-100 text-red-800',
      // Legacy support
      'delivered': 'bg-green-100 text-green-800',
      'out_for_delivery': 'bg-blue-100 text-blue-800',
      'in_kitchen': 'bg-yellow-100 text-yellow-800',
      'pending': 'bg-gray-100 text-gray-800',
      'cancelled': 'bg-red-100 text-red-800'
    }
    return statusConfig[status] || 'bg-gray-100 text-gray-800'
  }


  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status === statusFilter)

  if (isLoading) {
    return (
      <AdminLayout 
        title="Order Management"
        subtitle="Track and manage customer orders"
      >
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-gray-800 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading orders...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout 
      title="Order Management"
      subtitle="Track and manage customer orders"
    >
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-3xl font-bold text-gray-900">{statistics.totalOrders || 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Orders</p>
              <p className="text-3xl font-bold text-gray-900">{statistics.pendingOrders || 0}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Kitchen</p>
              <p className="text-3xl font-bold text-gray-900">{statistics.inKitchenOrders || 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Delivered</p>
              <p className="text-3xl font-bold text-gray-900">{statistics.deliveredOrders || 0}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="mb-6">
        <div className="flex space-x-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              statusFilter === 'all'
                ? 'bg-gray-800 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All Orders
          </button>
          <button
            onClick={() => setStatusFilter('PENDING')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              statusFilter === 'PENDING'
                ? 'bg-gray-800 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setStatusFilter('CONFIRMED')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              statusFilter === 'CONFIRMED'
                ? 'bg-gray-800 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Confirmed
          </button>
          <button
            onClick={() => setStatusFilter('PREPARING')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              statusFilter === 'PREPARING'
                ? 'bg-gray-800 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            In Kitchen
          </button>
          <button
            onClick={() => setStatusFilter('OUT_FOR_DELIVERY')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              statusFilter === 'OUT_FOR_DELIVERY'
                ? 'bg-gray-800 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Out for Delivery
          </button>
          <button
            onClick={() => setStatusFilter('DELIVERED')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              statusFilter === 'DELIVERED'
                ? 'bg-gray-800 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Delivered
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-semibold text-gray-900">Recent Orders ({orders.length})</h3>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-xs text-gray-500">
                {isConnected ? 'Live' : 'Offline'}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
            <button
              onClick={handleRefresh}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.customerPhone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.customerName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.orderItems}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(order.total)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(order.status)}`}>
                      {order.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatTime(order.createdAt)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                    <button className="hover:text-blue-800">View Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}

export default OrderManagementWithSidebar
