import React, { useState } from 'react'
import { useQueryClient } from 'react-query'
import { api } from '../lib/api'
import toast from 'react-hot-toast'

const AddItemModal = ({ isOpen, onClose, onItemAdded, onItemUpdated, categories = [], editingItem = null }) => {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    isVeg: true,
    isAvailable: true,
    imageUrl: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})

  // Update form data when editing item changes
  React.useEffect(() => {
    if (editingItem) {
      setFormData({
        name: editingItem.name || '',
        description: editingItem.description || '',
        price: editingItem.price?.toString() || '',
        categoryId: editingItem.categoryId || '',
        isVeg: editingItem.isVeg ?? true,
        isAvailable: editingItem.isAvailable ?? true,
        imageUrl: editingItem.imageUrl || ''
      })
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        categoryId: '',
        isVeg: true,
        isAvailable: true,
        imageUrl: ''
      })
    }
  }, [editingItem])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }
    
    if (!formData.price || isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Valid price is required'
    }
    
    if (!formData.categoryId) {
      newErrors.categoryId = 'Category is required'
    }
    
    if (formData.imageUrl && !isValidUrl(formData.imageUrl)) {
      newErrors.imageUrl = 'Please enter a valid URL'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidUrl = (string) => {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsLoading(true)
    
    try {
      const itemData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        categoryId: formData.categoryId,
        isVeg: formData.isVeg,
        isAvailable: formData.isAvailable,
        imageUrl: formData.imageUrl.trim() || null
      }
      
      console.log('📤 Sending item data:', itemData)
      
      let response
      if (editingItem) {
        // Update existing item
        response = await api.updateMenuItem(editingItem.id, itemData)
      } else {
        // Add new item
        response = await api.addMenuItem(itemData)
      }
      
      if (response.success) {
        const action = editingItem ? 'updated' : 'added'
        toast.success(`${formData.name} ${action} successfully!`)
        
        // Invalidate and refetch admin menu items cache
        queryClient.invalidateQueries(['admin-menu-items'])
        
        // Also invalidate customer menu cache
        queryClient.invalidateQueries(['menu', 'siddhi'])
        
        if (editingItem) {
          onItemUpdated(response.item, response.statistics)
        } else {
          onItemAdded(response.item, response.statistics)
        }
        handleClose()
      } else {
        const action = editingItem ? 'update' : 'add'
        toast.error(`Failed to ${action} item`)
      }
    } catch (error) {
      console.error('Add item error:', error)
      
      // Show specific error messages
      if (error.response?.data?.details) {
        const validationErrors = error.response.data.details
        const firstError = validationErrors[0]
        toast.error(`${firstError.param}: ${firstError.msg}`)
      } else if (error.response?.data?.error) {
        toast.error(error.response.data.error)
      } else {
        toast.error('Failed to add item')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      categoryId: '',
      isVeg: true,
      isAvailable: true,
      imageUrl: ''
    })
    setErrors({})
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {editingItem ? 'Edit Food Item' : 'Add New Food Item'}
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
            {editingItem ? 'Update the details for this food item.' : 'Enter details for the new food item.'}
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Image Upload */}
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center cursor-pointer hover:bg-pink-200 transition-colors">
                {formData.imageUrl ? (
                  <img 
                    src={formData.imageUrl} 
                    alt="Food preview" 
                    className="w-16 h-16 rounded-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'block'
                    }}
                  />
                ) : null}
                <div className={`text-center ${formData.imageUrl ? 'hidden' : 'block'}`}>
                  <svg className="w-8 h-8 text-pink-400 mx-auto mb-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                  <p className="text-xs text-pink-600">Click to upload image</p>
                </div>
              </div>
            </div>
            
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter item name"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            
            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">₹</span>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.price ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
            </div>
            
            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter item description"
              />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
            </div>
            
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.categoryId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && <p className="text-red-500 text-xs mt-1">{errors.categoryId}</p>}
            </div>
            
            {/* Image URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (Optional)</label>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.imageUrl ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="https://example.com/image.jpg"
              />
              {errors.imageUrl && <p className="text-red-500 text-xs mt-1">{errors.imageUrl}</p>}
            </div>
            
            {/* Toggles */}
            <div className="flex space-x-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isVeg"
                  checked={formData.isVeg}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">Vegetarian</label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isAvailable"
                  checked={formData.isAvailable}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">Available</label>
              </div>
            </div>
            
            {/* Buttons */}
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
                  ? (editingItem ? 'Updating...' : 'Adding...') 
                  : (editingItem ? 'Update Item' : 'Add Item')
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AddItemModal
