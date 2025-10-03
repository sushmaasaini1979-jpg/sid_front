import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from 'react-query'
import { api } from '../lib/api'
import { useStore } from '../store/store'
import socketManager from '../lib/socket'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

const OrderStatus = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { storeSlug } = useStore()
  const [order, setOrder] = useState(null)

  // Fetch order data
  const { data: orderData, isLoading, error, refetch } = useQuery(
    ['order', id],
    () => api.getOrder(id),
    {
      enabled: !!id,
      retry: 1,
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  )

  // Update local order state when data changes
  useEffect(() => {
    if (orderData) {
      setOrder(orderData)
    }
  }, [orderData])

  // Socket connection for real-time updates
  useEffect(() => {
    if (id) {
      // Connect to socket and join order room
      socketManager.connect(storeSlug)
      socketManager.joinOrder(id)

      // Listen for order updates
      const handleOrderUpdate = (data) => {
        if (data.orderId === id) {
          setOrder(prev => ({
            ...prev,
            status: data.status,
            estimatedTime: data.estimatedTime,
            deliveredAt: data.deliveredAt
          }))
          toast.success(`Order status updated to: ${data.status}`)
        }
      }

      const handlePaymentUpdate = (data) => {
        if (data.orderId === id) {
          setOrder(prev => ({
            ...prev,
            paymentStatus: data.status
          }))
        }
      }

      socketManager.onOrderUpdate(handleOrderUpdate)
      socketManager.onPaymentUpdate(handlePaymentUpdate)

      return () => {
        socketManager.off('order.updated', handleOrderUpdate)
        socketManager.off('payment.completed', handlePaymentUpdate)
        socketManager.off('payment.failed', handlePaymentUpdate)
      }
    }
  }, [id, storeSlug])

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'text-yellow-600 bg-yellow-100'
      case 'CONFIRMED': return 'text-blue-600 bg-blue-100'
      case 'PREPARING': return 'text-orange-600 bg-orange-100'
      case 'READY': return 'text-purple-600 bg-purple-100'
      case 'OUT_FOR_DELIVERY': return 'text-indigo-600 bg-indigo-100'
      case 'DELIVERED': return 'text-green-600 bg-green-100'
      case 'CANCELLED': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING': return '⏳'
      case 'CONFIRMED': return '✅'
      case 'PREPARING': return '👨‍🍳'
      case 'READY': return '🍽️'
      case 'OUT_FOR_DELIVERY': return '🚚'
      case 'DELIVERED': return '🎉'
      case 'CANCELLED': return '❌'
      default: return '📋'
    }
  }

  const getEstimatedTime = () => {
    if (order?.deliveredAt) return 'Delivered'
    if (order?.estimatedTime) return `${order.estimatedTime} minutes`
    return 'Calculating...'
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h1>
          <p className="text-gray-600 mb-4">The order you're looking for doesn't exist.</p>
          <button 
            onClick={() => navigate('/')}
            className="btn btn-primary"
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate('/')}
              className="p-2 -ml-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-gray-900">Order Status</h1>
            <div className="w-10"></div>
          </div>
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* Order Header */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Order #{order.orderNumber}</h2>
              <p className="text-sm text-gray-600">Placed on {formatDate(order.createdAt)}</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
              {getStatusIcon(order.status)} {order.status.replace('_', ' ')}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Estimated Time</p>
              <p className="font-medium text-gray-900">{getEstimatedTime()}</p>
            </div>
            <div>
              <p className="text-gray-600">Payment Status</p>
              <p className={`font-medium ${order.paymentStatus === 'COMPLETED' ? 'text-green-600' : 'text-yellow-600'}`}>
                {order.paymentStatus}
              </p>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="card p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
          <div className="space-y-3">
            {order.items.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {item.quantity}x {item.menuItem.name}
                    {item.menuItem.size && <span className="text-gray-500"> ({item.menuItem.size})</span>}
                  </p>
                  {item.notes && (
                    <p className="text-sm text-gray-600">Note: {item.notes}</p>
                  )}
                </div>
                <p className="font-medium text-gray-900">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="card p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-gray-900">{formatPrice(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-{formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Tax</span>
              <span className="text-gray-900">{formatPrice(order.tax)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="card p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-600">Name:</span>
              <span className="ml-2 font-medium text-gray-900">{order.customer.name}</span>
            </div>
            <div>
              <span className="text-gray-600">Phone:</span>
              <span className="ml-2 font-medium text-gray-900">{order.customer.phone}</span>
            </div>
            {order.customer.email && (
              <div>
                <span className="text-gray-600">Email:</span>
                <span className="ml-2 font-medium text-gray-900">{order.customer.email}</span>
              </div>
            )}
            {order.customer.address && (
              <div>
                <span className="text-gray-600">Address:</span>
                <span className="ml-2 font-medium text-gray-900">{order.customer.address}</span>
              </div>
            )}
          </div>
        </div>

        {/* Store Information */}
        <div className="card p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Store Information</h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-600">Store:</span>
              <span className="ml-2 font-medium text-gray-900">{order.store.name}</span>
            </div>
            {order.store.phone && (
              <div>
                <span className="text-gray-600">Phone:</span>
                <span className="ml-2 font-medium text-gray-900">{order.store.phone}</span>
              </div>
            )}
            {order.store.address && (
              <div>
                <span className="text-gray-600">Address:</span>
                <span className="ml-2 font-medium text-gray-900">{order.store.address}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => navigate('/menu')}
            className="w-full btn btn-primary py-3"
          >
            Order Again
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full btn btn-secondary py-3"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}

export default OrderStatus
