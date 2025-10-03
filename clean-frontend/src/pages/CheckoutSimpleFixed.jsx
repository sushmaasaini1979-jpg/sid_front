import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore, useStore } from '../store/store'

const CheckoutSimpleFixed = () => {
  const navigate = useNavigate()
  const { items, total, clearCart } = useCartStore()
  const { customer, updateCustomer, storeSlug } = useStore()
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    console.log(`Input changed: ${name} = ${value}`)
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  useEffect(() => {
    // Initialize form data with empty values
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: ''
    })
    
    console.log('Checkout component loaded with items:', items)
  }, [items])

  useEffect(() => {
    updateCustomer(formData)
  }, [formData, updateCustomer])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    console.log('Form data:', formData)
    console.log('Cart items:', items)
    
    if (!items || items.length === 0) {
      alert('Your cart is empty. Please add items from the menu first.')
      return
    }

    // Validate form data
    if (!formData.name || !formData.phone || !formData.email || !formData.address) {
      alert('Please fill in all required fields')
      return
    }

    // Check for "NULL" values
    if (formData.name === 'NULL' || formData.address === 'NULL') {
      alert('Please enter valid information. "NULL" is not a valid value.')
      return
    }

    // Validate name (should not be empty or just spaces)
    if (formData.name.trim().length < 2) {
      alert('Please enter a valid name (at least 2 characters)')
      return
    }

    // Validate phone number format
    if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      alert('Please enter a valid 10-digit phone number starting with 6, 7, 8, or 9')
      return
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      alert('Please enter a valid email address (e.g., user@example.com)')
      return
    }

    // Validate address (should not be empty or just spaces)
    if (formData.address.trim().length < 10) {
      alert('Please enter a complete delivery address (at least 10 characters)')
      return
    }

    setIsLoading(true)

    try {
      // Create order data
      const orderData = {
        storeSlug: 'siddhi', // Default store slug
        customer: {
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          address: formData.address.trim()
        },
        items: (items || []).map(item => ({
          menuItemId: String(item.id),
          quantity: item.quantity,
          notes: item.notes || ''
        })),
        paymentMethod: 'CASH_ON_DELIVERY', // Default payment method
        notes: ''
      }

      console.log('Sending order data:', orderData)

      // Call the API to create order
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      })

      console.log('Response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('API Error:', errorData)
        throw new Error(errorData.error || 'Failed to create order')
      }

      const orderResult = await response.json()
      console.log('Order created successfully:', orderResult)
      
      // Store order ID and total in localStorage for payment completion
      localStorage.setItem('currentOrderId', orderResult.id)
      localStorage.setItem('currentOrderTotal', orderResult.total)
      
      // Show success message
      alert(`Order placed successfully! Order Number: ${orderResult.orderNumber}`)
      
      // Clear cart and navigate to payment complete page
      clearCart()
      navigate('/payment-complete')
    } catch (error) {
      console.error('Order creation error:', error)
      alert(`Failed to place order: ${error.message}`)
      setIsLoading(false)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
          <p className="text-gray-600 mb-4">Add some delicious items to your cart first!</p>
          <button 
            onClick={() => navigate('/menu')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
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
              onClick={() => navigate('/menu')}
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
        {/* Customer Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Customer Information</h2>
              <p className="text-sm text-gray-600">Please fill in your details to complete the order</p>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 9876543210"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., user@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Address *
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                placeholder="e.g., 123 Main Street, City, State"
                required
              />
            </div>
          </form>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
          <div className="space-y-3">
            {(items || []).map((item, index) => (
              <div key={`${item.id}-${index}`} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {item.quantity}x {item.name}
                    {item.size && <span className="text-gray-500"> ({item.size})</span>}
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

          <div className="border-t border-gray-200 mt-4 pt-4">
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>{formatPrice(total || 0)}</span>
            </div>
          </div>
        </div>

        {/* Place Order Button */}
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-lg text-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Placing Order...' : `Place Order - ${formatPrice(total)}`}
        </button>
      </div>
    </div>
  )
}

export default CheckoutSimpleFixed
