import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useMutation } from 'react-query'
import { useStore, useCartStore } from '../store/store'
import { api } from '../lib/api'
import LoadingSpinner from '../components/LoadingSpinner'
import BottomNavigation from '../components/BottomNavigation'
import toast from 'react-hot-toast'

const Checkout = () => {
  const navigate = useNavigate()
  const { items, total, clearCart } = useCartStore()
  const { customer, updateCustomer, storeSlug } = useStore()
  
  const [paymentMethod, setPaymentMethod] = useState('CASH_ON_DELIVERY')
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [discount, setDiscount] = useState(0)
  const [finalTotal, setFinalTotal] = useState(total)

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    defaultValues: customer
  })

  // Watch form values
  const watchedValues = watch()

  // Update customer info in store when form changes
  useEffect(() => {
    updateCustomer(watchedValues)
  }, [watchedValues, updateCustomer])

  // Calculate final total
  useEffect(() => {
    const tax = (total - discount) * 0.05 // 5% tax
    setFinalTotal(total - discount + tax)
  }, [total, discount])

  // Validate coupon mutation
  const validateCouponMutation = useMutation(
    (code) => api.validateCoupon(code, total),
    {
      onSuccess: (data) => {
        setAppliedCoupon(data.coupon)
        setDiscount(data.coupon.discount)
        toast.success('Coupon applied successfully!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Invalid coupon code')
      }
    }
  )

  // Create order mutation
  const createOrderMutation = useMutation(
    (orderData) => api.createOrder(orderData),
    {
      onSuccess: (data) => {
        toast.success('Order placed successfully!')
        clearCart()
        navigate(`/order/${data.id}`)
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to place order')
      }
    }
  )

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code')
      return
    }
    validateCouponMutation.mutate(couponCode)
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setDiscount(0)
    setCouponCode('')
    toast.success('Coupon removed')
  }

  const onSubmit = (data) => {
    if (items.length === 0) {
      toast.error('Your cart is empty')
      return
    }

    const orderData = {
      storeSlug,
      customer: {
        name: data.name,
        phone: data.phone,
        email: data.email || '',
        address: data.address || ''
      },
      items: items.map(item => ({
        menuItemId: item.id,
        quantity: item.quantity,
        notes: item.notes
      })),
      paymentMethod,
      couponCode: appliedCoupon?.code || null,
      notes: data.notes || ''
    }

    createOrderMutation.mutate(orderData)
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
            className="btn btn-primary"
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
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                {...register('name', { required: 'Name is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your full name"
              />
              {errors.name && (
                <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                {...register('phone', { 
                  required: 'Phone number is required',
                  pattern: {
                    value: /^[6-9]\d{9}$/,
                    message: 'Please enter a valid 10-digit phone number'
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your phone number"
              />
              {errors.phone && (
                <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                {...register('email', { required: 'Email is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email address"
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Address *
              </label>
              <textarea
                {...register('address', { required: 'Address is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                placeholder="Enter your delivery address"
              />
              {errors.address && (
                <p className="text-red-600 text-sm mt-1">{errors.address.message}</p>
              )}
            </div>
          </form>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
          <div className="space-y-3">
            {items.map((item, index) => (
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
              <span>{formatPrice(finalTotal)}</span>
            </div>
          </div>
        </div>

        {/* Place Order Button */}
        <button
          onClick={handleSubmit(onSubmit)}
          disabled={createOrderMutation.isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-lg text-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {createOrderMutation.isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <LoadingSpinner size="sm" />
              <span>Placing Order...</span>
            </div>
          ) : (
            `Place Order - ${formatPrice(finalTotal)}`
          )}
        </button>
      </div>
      
      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}

export default Checkout
