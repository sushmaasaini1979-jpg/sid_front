import React, { useState } from 'react'
import { useQueryClient } from 'react-query'
import { api } from '../lib/api'
import toast from 'react-hot-toast'

const CategoryModal = ({ isOpen, onClose, onCategoryAdded, onCategoryUpdated, editingCategory = null }) => {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    slug: '',
    sortOrder: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})

  // Update form data when editing category changes
  React.useEffect(() => {
    if (editingCategory) {
      setFormData({
        name: editingCategory.name || '',
        description: editingCategory.description || '',
        slug: editingCategory.slug || '',
        sortOrder: editingCategory.sortOrder?.toString() || ''
      })
    } else {
      setFormData({
        name: '',
        description: '',
        slug: '',
        sortOrder: ''
      })
    }
  }, [editingCategory])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }

    // Auto-generate slug from name
    if (name === 'name') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .trim()
      setFormData(prev => ({
        ...prev,
        slug: slug
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required'
    }
    
    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required'
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens'
    }
    
    if (formData.sortOrder && (isNaN(formData.sortOrder) || parseInt(formData.sortOrder) < 0)) {
      newErrors.sortOrder = 'Sort order must be a positive number'
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
      const categoryData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        slug: formData.slug.trim(),
        sortOrder: formData.sortOrder ? parseInt(formData.sortOrder) : undefined
      }
      
      console.log('📤 Sending category data:', categoryData)
      
      let response
      if (editingCategory) {
        // Update existing category
        response = await api.updateCategory(editingCategory.id, categoryData)
      } else {
        // Add new category
        response = await api.addCategory(categoryData)
      }
      
      if (response.success) {
        const action = editingCategory ? 'updated' : 'added'
        toast.success(`Category ${action} successfully!`)
        
        // Invalidate and refetch categories cache
        queryClient.invalidateQueries(['admin-categories'])
        
        if (editingCategory) {
          onCategoryUpdated(response.category, response.statistics)
        } else {
          onCategoryAdded(response.category, response.statistics)
        }
        handleClose()
      } else {
        const action = editingCategory ? 'update' : 'add'
        toast.error(`Failed to ${action} category`)
      }
    } catch (error) {
      console.error('Category error:', error)
      
      // Show specific error messages
      if (error.response?.data?.details) {
        const validationErrors = error.response.data.details
        const firstError = validationErrors[0]
        toast.error(`${firstError.param}: ${firstError.msg}`)
      } else if (error.response?.data?.error) {
        toast.error(error.response.data.error)
      } else {
        const action = editingCategory ? 'update' : 'add'
        toast.error(`Failed to ${action} category`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      slug: '',
      sortOrder: ''
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
              {editingCategory ? 'Edit Category' : 'Add New Category'}
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
            {editingCategory ? 'Update the details for this category.' : 'Enter details for the new category.'}
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Category Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Main Course"
                disabled={isLoading}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
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
                placeholder="Brief description of the category"
                rows={3}
                disabled={isLoading}
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slug *
              </label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  errors.slug ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., main-course"
                disabled={isLoading}
              />
              {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug}</p>}
              <p className="text-xs text-gray-500 mt-1">
                URL-friendly identifier (auto-generated from name)
              </p>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort Order
              </label>
              <input
                type="number"
                name="sortOrder"
                value={formData.sortOrder}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  errors.sortOrder ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., 1"
                min="0"
                disabled={isLoading}
              />
              {errors.sortOrder && <p className="text-red-500 text-xs mt-1">{errors.sortOrder}</p>}
              <p className="text-xs text-gray-500 mt-1">
                Lower numbers appear first (optional)
              </p>
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
                  ? (editingCategory ? 'Updating...' : 'Adding...') 
                  : (editingCategory ? 'Update Category' : 'Add Category')
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CategoryModal
