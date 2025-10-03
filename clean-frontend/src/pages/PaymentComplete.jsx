import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore, useStore } from '../store/store'

const PaymentComplete = () => {
  const navigate = useNavigate()
  const { items, total, clearCart } = useCartStore()
  const { customer } = useStore()
  
  const [countdown, setCountdown] = useState(15)
  const [isPaymentCompleted, setIsPaymentCompleted] = useState(false)
  const [orderTotal, setOrderTotal] = useState(0)

  useEffect(() => {
    // Load order total from localStorage
    const storedTotal = localStorage.getItem('currentOrderTotal')
    if (storedTotal) {
      setOrderTotal(parseInt(storedTotal))
    }
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          handlePaymentCompleted()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handlePaymentCompleted = async () => {
    setIsPaymentCompleted(true)
    
    try {
      // Get the order ID from localStorage
      const orderId = localStorage.getItem('currentOrderId')
      
      if (orderId) {
        // Update payment status to completed
        const response = await fetch(`http://localhost:3001/api/orders/${orderId}/payment`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentStatus: 'COMPLETED'
          })
        })

        if (!response.ok) {
          console.error('Failed to update payment status')
        }
        
        // Clear the stored order ID and total
        localStorage.removeItem('currentOrderId')
        localStorage.removeItem('currentOrderTotal')
      }
      
      setTimeout(() => {
        clearCart()
        navigate('/')
      }, 2000)
    } catch (error) {
      console.error('Payment completion error:', error)
      // Still proceed with navigation even if API call fails
      setTimeout(() => {
        clearCart()
        navigate('/')
      }, 2000)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-6">
      {/* Background Blur Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-20 z-40"></div>
      
      {/* Payment Modal */}
      <div className="bg-white rounded-3xl shadow-2xl border-0 p-8 w-full max-w-sm mx-auto relative z-50">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Complete Payment</h1>
          <p className="text-gray-500">Scan the QR code with PhonePe to pay</p>
        </div>

        {/* QR Code Section */}
        <div className="text-center mb-6">
          <div className="bg-white p-4 rounded-2xl border border-gray-200 inline-block">
            <img 
              src="/qr-code.png" 
              alt="PhonePe QR Code" 
              className="w-44 h-44 object-contain"
              onError={(e) => {
                // Fallback to placeholder if image not found
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <div className="w-44 h-44 bg-gray-50 rounded-xl flex items-center justify-center border border-dashed border-gray-300" style={{display: 'none'}}>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold text-xl">पे</span>
                </div>
                <p className="text-xs text-gray-500 font-medium">PhonePe QR Code</p>
              </div>
            </div>
          </div>
        </div>

        {/* Amount to Pay */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Amount to Pay:</span>
            <span className="text-2xl font-bold text-gray-900">{formatPrice(orderTotal)}</span>
          </div>
        </div>

        {/* Auto-close Timer */}
        <div className="flex items-center justify-center mb-6">
          <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center mr-2">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="text-sm text-gray-600">Auto-close in {countdown}s</span>
        </div>

        {/* Payment Instructions */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">How to pay:</h3>
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-700">
              <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mr-3">1</span>
              Open PhonePe app
            </div>
            <div className="flex items-center text-sm text-gray-700">
              <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mr-3">2</span>
              Scan this QR code
            </div>
            <div className="flex items-center text-sm text-gray-700">
              <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mr-3">3</span>
              Complete payment
            </div>
            <div className="flex items-center text-sm text-gray-700">
              <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mr-3">4</span>
              Your order will be confirmed
            </div>
          </div>
        </div>

        {/* Payment Completed Button */}
        <button
          onClick={handlePaymentCompleted}
          disabled={isPaymentCompleted}
          className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
            isPaymentCompleted 
              ? 'bg-green-500 text-white' 
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          <div className="flex items-center justify-center">
            {isPaymentCompleted ? (
              <>
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Payment Completed!
              </>
            ) : (
              <>
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Payment Completed
              </>
            )}
          </div>
        </button>

        {/* Cancel Button */}
        <button
          onClick={() => navigate('/checkout')}
          className="w-full mt-3 py-2 text-gray-500 hover:text-gray-700 font-medium transition-colors"
        >
          Cancel Payment
        </button>
      </div>

      {/* Order Summary Overlay (Background) */}
      <div className="fixed top-4 left-4 bg-white rounded-lg shadow-md p-4 max-w-xs opacity-80 z-30">
        <h3 className="font-semibold text-gray-900 mb-2 text-base">Order Summary</h3>
        <div className="space-y-1 text-sm">
          {items.map((item, index) => (
            <div key={`${item.id}-${index}`} className="flex justify-between">
              <span className="text-gray-600">{item.quantity}x {item.name}</span>
              <span className="text-gray-900 font-medium">{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-200 mt-2 pt-2">
          <div className="flex justify-between font-semibold">
            <span className="text-gray-700">Total</span>
            <span className="text-gray-900">{formatPrice(orderTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentComplete
