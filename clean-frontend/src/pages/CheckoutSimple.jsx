import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/store'

const CheckoutSimple = () => {
  const navigate = useNavigate()
  const { items, total } = useCartStore()

  const handleGoBack = () => {
    navigate('/cart')
  }

  const handlePlaceOrder = () => {
    alert('Order placed successfully!')
    navigate('/')
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
          <p className="text-gray-600 mb-4">Add some delicious items to your cart first!</p>
          <button 
            onClick={() => navigate('/menu')}
            className="bg-black text-white px-6 py-2 rounded-lg"
          >
            Browse Menu
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
              onClick={handleGoBack}
              className="p-2 -ml-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-gray-900">Checkout</h1>
            <div className="w-10"></div>
          </div>
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* Simple Order Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={`${item.id}-${index}`} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {item.quantity}x {item.name}
                  </p>
                </div>
                <p className="font-medium text-gray-900">
                  ₹{item.price * item.quantity}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 mt-4 pt-4">
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>₹{total}</span>
            </div>
          </div>
        </div>

        {/* Place Order Button */}
        <button
          onClick={handlePlaceOrder}
          className="w-full bg-black text-white py-4 rounded-lg text-lg font-semibold hover:bg-gray-800 transition-colors"
        >
          Place Order - ₹{total}
        </button>
      </div>
    </div>
  )
}

export default CheckoutSimple
