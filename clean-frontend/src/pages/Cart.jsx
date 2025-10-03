import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/store'
import Sidebar from '../components/Sidebar'
import BottomNavigation from '../components/BottomNavigation'

const Cart = () => {
  const navigate = useNavigate()
  const { items, total, itemCount, updateQuantity, removeItem, clearCart } = useCartStore()

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const handleBackToMenu = () => {
    navigate('/menu')
  }

  const handleCheckout = () => {
    navigate('/checkout')
  }

  const handleGoHome = () => {
    navigate('/')
  }

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white px-4 py-6 shadow-sm">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBackToMenu}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Your Cart</h1>
          <button 
            onClick={toggleSidebar}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>
      
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Cart Content */}
      <main className="flex-1 px-4 py-6">
        {items.length === 0 ? (
          // Empty Cart
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6 text-center">Looks like you haven't added any items to your cart yet.</p>
            <button
              onClick={handleBackToMenu}
              className="bg-black text-white px-8 py-3 rounded-full text-base font-medium hover:bg-gray-800 transition-colors"
            >
              Browse Menu
            </button>
          </div>
        ) : (
          // Cart Items
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={`${item.id}-${index}`} className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-center space-x-4">
                  {/* Item Image */}
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center">
                    {item.imageUrl ? (
                      <img 
                        src={item.imageUrl} 
                        alt={item.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Item Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-lg mb-1">
                      {item.name}
                      {item.size && (
                        <span className="text-gray-500 font-normal ml-1">({item.size})</span>
                      )}
                    </h3>
                    {item.notes && (
                      <p className="text-sm text-gray-600 mb-1">
                        Note: {item.notes}
                      </p>
                    )}
                    <p className="text-base font-semibold text-gray-900">
                      {formatPrice(item.price)}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex flex-col items-center space-y-2">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1, item.notes)}
                        className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      
                      <span className="w-8 text-center font-semibold text-lg">
                        {item.quantity}
                      </span>
                      
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1, item.notes)}
                        className="w-8 h-8 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
                      >
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </button>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeItem(item.id, item.notes)}
                      className="text-sm text-red-600 hover:text-red-800 font-medium transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer with Total and Checkout */}
      {items.length > 0 && (
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-semibold text-gray-900">
              Total ({itemCount} {itemCount === 1 ? 'item' : 'items'})
            </span>
            <span className="text-xl font-bold text-gray-900">{formatPrice(total)}</span>
          </div>
          <button
            onClick={handleCheckout}
            className="w-full bg-black text-white py-4 rounded-full text-lg font-semibold hover:bg-gray-800 transition-colors mb-3"
          >
            Proceed to Checkout
          </button>
          <button
            onClick={clearCart}
            className="w-full text-gray-600 py-2 text-sm font-medium hover:text-gray-800 transition-colors"
          >
            Clear Cart
          </button>
        </div>
      )}
      
      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}

export default Cart
