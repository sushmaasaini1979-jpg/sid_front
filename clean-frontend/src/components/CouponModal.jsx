import React, { useState } from 'react'
import { useQueryClient } from 'react-query'
import { api } from '../lib/api'
import toast from 'react-hot-toast'

const CouponModal = ({ isOpen, onClose, onCouponAdded, onCouponUpdated, editingCoupon = null }) => {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    type: 'PERCENTAGE',
    value: '',
    minOrderAmount: '',
    maxDiscount: '',
    usageLimit: '',
    validFrom: '',
    validUntil: '',
    isActive: true
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})

  // Update form data when editing coupon changes
  React.useEffect(() => {
    if (editingCoupon) {
      setFormData({
        code: editingCoupon.code || '',
        name: editingCoupon.name || '',
        description: editingCoupon.description || '',
        type: editingCoupon.type || 'PERCENTAGE',
        value: editingCoupon.value?.toString() || '',
        minOrderAmount: editingCoupon.minOrderAmount?.toString() || '',
        maxDiscount: editingCoupon.maxDiscount?.toString() || '',
        usageLimit: editingCoupon.usageLimit?.toString() || '',
        validFrom: editingCoupon.validFrom ? new Date(editingCoupon.validFrom).toISOString().slice(0, 16) : '',
        validUntil: editingCoupon.validUntil ? new Date(editingCoupon.validUntil).toISOString().slice(0, 16) : '',
        isActive: editingCoupon.isActive ?? true
      })
    } else {
      // Set default values for new coupon
      const now = new Date()
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
      const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
      
      setFormData({
        code: '',
        name: '',
        description: '',
        type: 'PERCENTAGE',
        value: '',
        minOrderAmount: '',
        maxDiscount: '',
        usageLimit: '',
        validFrom: now.toISOString().slice(0, 16),
        validUntil: nextMonth.toISOString().slice(0, 16),
        isActive: true
      })
    }
  }, [editingCoupon])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.code.trim()) {
      newErrors.code = 'Coupon code is required'
    } else if (!/^[A-Z0-9_-]+$/.test(formData.code)) {
      newErrors.code = 'Coupon code can only contain uppercase letters, numbers, hyphens, and underscores'
    }
    
    if (!formData.name.trim()) {
      newErrors.name = 'Coupon name is required'
    }
    
    if (!formData.value.trim()) {
      newErrors.value = 'Value is required'
    } else if (isNaN(formData.value) || parseFloat(formData.value) <= 0) {
      newErrors.value = 'Value must be a positive number'
    } else if (formData.type === 'PERCENTAGE' && parseFloat(formData.value) > 100) {
      newErrors.value = 'Percentage cannot be greater than 100'
    }
    
    if (formData.minOrderAmount && (isNaN(formData.minOrderAmount) || parseFloat(formData.minOrderAmount) < 0)) {
      newErrors.minOrderAmount = 'Min order amount must be a positive number'
    }
    
    if (formData.maxDiscount && (isNaN(formData.maxDiscount) || parseFloat(formData.maxDiscount) < 0)) {
      newErrors.maxDiscount = 'Max discount must be a positive number'
    }
    
    if (formData.usageLimit && (isNaN(formData.usageLimit) || parseInt(formData.usageLimit) < 1)) {
      newErrors.usageLimit = 'Usage limit must be a positive integer'
    }
    
    if (!formData.validFrom) {
      newErrors.validFrom = 'Valid from date is required'
    }
    
    if (!formData.validUntil) {
      newErrors.validUntil = 'Valid until date is required'
    } else if (formData.validFrom && new Date(formData.validUntil) <= new Date(formData.validFrom)) {
      newErrors.validUntil = 'Valid until must be after valid from date'
    }
    
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validateForm()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      toast.error('Please correct the form errors.')
      return
    }
    
    setIsLoading(true)
    
    try {
      const couponData = {
        code: formData.code.trim().toUpperCase(),
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        type: formData.type,
        value: parseFloat(formData.value),
        minOrderAmount: formData.minOrderAmount ? parseFloat(formData.minOrderAmount) : null,
        maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
        validFrom: new Date(formData.validFrom).toISOString(),
        validUntil: new Date(formData.validUntil).toISOString(),
        isActive: formData.isActive
      }
      
      console.log('📤 Sending coupon data:', couponData)
      
      let response
      if (editingCoupon) {
        // Update existing coupon
        response = await api.updateCoupon(editingCoupon.id, couponData)
      } else {
        // Add new coupon
        response = await api.addCoupon(couponData)
      }
      
      if (response.success) {
        const action = editingCoupon ? 'updated' : 'added'
        toast.success(`Coupon ${action} successfully!`)
        
        // Invalidate and refetch coupons cache
        queryClient.invalidateQueries(['admin-coupons'])
        
        if (editingCoupon) {
          onCouponUpdated(response.coupon, response.statistics)
        } else {
          onCouponAdded(response.coupon, response.statistics)
        }
        handleClose()
      } else {
        const action = editingCoupon ? 'update' : 'add'
        toast.error(`Failed to ${action} coupon`)
      }
    } catch (error) {
      console.error('Coupon error:', error)
      
      // Show specific error messages
      if (error.response?.data?.details) {
        const validationErrors = error.response.data.details
        const firstError = validationErrors[0]
        toast.error(`${firstError.param}: ${firstError.msg}`)
      } else if (error.response?.data?.error) {
        toast.error(error.response.data.error)
      } else {
        const action = editingCoupon ? 'update' : 'add'
        toast.error(`Failed to ${action} coupon`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      type: 'PERCENTAGE',
      value: '',
      minOrderAmount: '',
      maxDiscount: '',
      usageLimit: '',
      validFrom: '',
      validUntil: '',
      isActive: true
    })
    setErrors({})
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <p className="text-sm text-gray-600 mb-6">
            {editingCoupon ? 'Update the details for this coupon.' : 'Add a new promotional coupon to your system.'}
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Coupon Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    errors.code ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., BLACKFRIDAY25"
                  disabled={isLoading}
                />
                {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code}</p>}
              </div>

              {/* Coupon Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Coupon Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Black Friday Sale"
                  disabled={isLoading}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Brief description of the coupon"
                rows={3}
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Discount Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  disabled={isLoading}
                >
                  <option value="PERCENTAGE">Percentage Off</option>
                  <option value="FIXED_AMOUNT">Fixed Amount Off</option>
                </select>
              </div>

              {/* Discount Value */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Value *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="value"
                    value={formData.value}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      errors.value ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={formData.type === 'PERCENTAGE' ? 'e.g., 25' : 'e.g., 100'}
                    min="0"
                    max={formData.type === 'PERCENTAGE' ? '100' : undefined}
                    step={formData.type === 'PERCENTAGE' ? '1' : '0.01'}
                    disabled={isLoading}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-sm">
                      {formData.type === 'PERCENTAGE' ? '%' : '₹'}
                    </span>
                  </div>
                </div>
                {errors.value && <p className="text-red-500 text-xs mt-1">{errors.value}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Min Order Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min. Purchase
                </label>
                <input
                  type="number"
                  name="minOrderAmount"
                  value={formData.minOrderAmount}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    errors.minOrderAmount ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Optional, e.g., 500"
                  min="0"
                  step="0.01"
                  disabled={isLoading}
                />
                {errors.minOrderAmount && <p className="text-red-500 text-xs mt-1">{errors.minOrderAmount}</p>}
              </div>

              {/* Max Discount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Discount
                </label>
                <input
                  type="number"
                  name="maxDiscount"
                  value={formData.maxDiscount}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    errors.maxDiscount ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Optional, e.g., 200"
                  min="0"
                  step="0.01"
                  disabled={isLoading}
                />
                {errors.maxDiscount && <p className="text-red-500 text-xs mt-1">{errors.maxDiscount}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Usage Limit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Usage Limit
                </label>
                <input
                  type="number"
                  name="usageLimit"
                  value={formData.usageLimit}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    errors.usageLimit ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Optional, e.g., 100"
                  min="1"
                  disabled={isLoading}
                />
                {errors.usageLimit && <p className="text-red-500 text-xs mt-1">{errors.usageLimit}</p>}
              </div>

              {/* Active Status */}
              <div className="flex items-center space-x-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    disabled={isLoading}
                  />
                  <span className="ml-2 text-sm text-gray-700">Active</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Valid From */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valid From *
                </label>
                <input
                  type="datetime-local"
                  name="validFrom"
                  value={formData.validFrom}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    errors.validFrom ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isLoading}
                />
                {errors.validFrom && <p className="text-red-500 text-xs mt-1">{errors.validFrom}</p>}
              </div>

              {/* Valid Until */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valid Until *
                </label>
                <input
                  type="datetime-local"
                  name="validUntil"
                  value={formData.validUntil}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    errors.validUntil ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isLoading}
                />
                {errors.validUntil && <p className="text-red-500 text-xs mt-1">{errors.validUntil}</p>}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading 
                  ? (editingCoupon ? 'Updating...' : 'Creating...') 
                  : (editingCoupon ? 'Update Coupon' : 'Save Coupon')
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CouponModal
