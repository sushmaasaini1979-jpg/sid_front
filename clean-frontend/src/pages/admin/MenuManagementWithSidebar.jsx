import React, { useState, useEffect } from 'react'
import { useQuery } from 'react-query'
import AdminLayout from '../../components/admin/AdminLayout'
import AvailabilityToggle from '../../components/AvailabilityToggle'
import ConnectionStatus from '../../components/ConnectionStatus'
import AddItemModal from '../../components/AddItemModal'
import DeleteConfirmModal from '../../components/DeleteConfirmModal'
import CategoryModal from '../../components/CategoryModal'
import CategoryDeleteModal from '../../components/CategoryDeleteModal'
import socketManager from '../../lib/socket'
import { api } from '../../lib/api'
import toast from 'react-hot-toast'
import useRealtimeUpdates from '../../hooks/useRealtimeUpdates'

const MenuManagementWithSidebar = () => {
  const [activeTab, setActiveTab] = useState('items')
  const [statistics, setStatistics] = useState({})
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDeleteModal, setDeleteModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [deletingItem, setDeletingItem] = useState(null)
  
  // Real-time updates hook
  const { isConnected, lastUpdate } = useRealtimeUpdates('siddhi')
  const [isDeleting, setIsDeleting] = useState(false)
  
  // Category states
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [showCategoryDeleteModal, setShowCategoryDeleteModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [deletingCategory, setDeletingCategory] = useState(null)
  const [isDeletingCategory, setIsDeletingCategory] = useState(false)

  // Format currency to rupees
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Fetch menu items and categories from API
  const { data: menuData, isLoading, refetch } = useQuery(
    'admin-menu-items',
    async () => {
      const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'
      const [menuResponse, categoriesResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/admin-supabase/menu-items?store=siddhi`),
        fetch(`${API_BASE_URL}/admin-supabase/categories?store=siddhi`)
      ])
      
      const menuData = await menuResponse.json()
      const categoriesData = await categoriesResponse.json()
      
      return {
        menuItems: menuData.success ? menuData.data.menuItems : [],
        categories: categoriesData.success ? categoriesData.data.categories : []
      }
    },
    {
      refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
      staleTime: 0, // Always consider data stale to ensure fresh data
      cacheTime: 30000, // Keep in cache for 30 seconds
    }
  )

  const menuItems = menuData?.menuItems || []
  const categories = menuData?.categories || []
  const initialStatistics = menuData?.statistics || {}

  // Calculate statistics from fetched data
  React.useEffect(() => {
    if (menuItems.length > 0 || categories.length > 0) {
      const totalItems = menuItems.length
      const totalCategories = categories.length
      const availableItems = menuItems.filter(item => item.isAvailable).length
      const outOfStock = menuItems.filter(item => !item.isAvailable).length

      const calculatedStatistics = {
        totalItems,
        totalCategories,
        availableItems,
        outOfStock
      }

      console.log('📊 Calculated menu statistics:', calculatedStatistics)
      setStatistics(calculatedStatistics)
    }
  }, [menuItems, categories])

  // Handle availability toggle
  const handleAvailabilityToggle = (newAvailability, updatedStatistics) => {
    setStatistics(updatedStatistics)
    // Refetch data to ensure consistency
    refetch()
  }

  // Handle new item added
  const handleItemAdded = (newItem, updatedStatistics) => {
    console.log('🆕 New item added:', newItem)
    setStatistics(updatedStatistics)
    // Force immediate refetch to show the new item
    refetch({ queryKey: ['admin-menu-items'], stale: false, cacheTime: 0 })
  }

  // Handle item updated
  const handleItemUpdated = (updatedItem, updatedStatistics) => {
    console.log('✏️ Item updated:', updatedItem)
    setStatistics(updatedStatistics)
    setEditingItem(null)
    // Force immediate refetch to show the updated item
    refetch({ queryKey: ['admin-menu-items'], stale: false, cacheTime: 0 })
  }

  // Handle edit button click
  const handleEditItem = (item) => {
    console.log('✏️ Editing item:', item)
    setEditingItem(item)
    setShowAddModal(true)
  }

  // Handle delete button click
  const handleDeleteItem = (item) => {
    console.log('🗑️ Deleting item:', item)
    setDeletingItem(item)
    setShowDeleteModal(true)
  }

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!deletingItem) return

    setIsDeleting(true)
    try {
      const response = await api.deleteMenuItem(deletingItem.id)
      
      if (response.success) {
        toast.success(`${deletingItem.name} deleted successfully!`)
        setStatistics(response.statistics)
        setShowDeleteModal(false)
        setDeletingItem(null)
        // Force immediate refetch to remove the deleted item
        refetch({ queryKey: ['admin-menu-items'], stale: false, cacheTime: 0 })
      } else {
        toast.error('Failed to delete item')
      }
    } catch (error) {
      console.error('Delete item error:', error)
      toast.error(error.response?.data?.error || 'Failed to delete item')
    } finally {
      setIsDeleting(false)
    }
  }

  // Handle modal close
  const handleModalClose = () => {
    setShowAddModal(false)
    setEditingItem(null)
  }

  // Category handlers
  const handleCategoryAdded = (newCategory, updatedStatistics) => {
    console.log('🆕 New category added:', newCategory)
    setStatistics(prev => ({ ...prev, ...updatedStatistics }))
    // Force immediate refetch to show the new category
    refetch({ queryKey: ['admin-categories'], stale: false, cacheTime: 0 })
  }

  const handleCategoryUpdated = (updatedCategory, updatedStatistics) => {
    console.log('✏️ Category updated:', updatedCategory)
    setStatistics(prev => ({ ...prev, ...updatedStatistics }))
    setEditingCategory(null)
    // Force immediate refetch to show the updated category
    refetch({ queryKey: ['admin-categories'], stale: false, cacheTime: 0 })
  }

  const handleEditCategory = (category) => {
    console.log('✏️ Editing category:', category)
    setEditingCategory(category)
    setShowCategoryModal(true)
  }

  const handleDeleteCategory = (category) => {
    console.log('🗑️ Deleting category:', category)
    setDeletingCategory(category)
    setShowCategoryDeleteModal(true)
  }

  const handleCategoryDeleteConfirm = async () => {
    if (!deletingCategory) return

    setIsDeletingCategory(true)
    try {
      const response = await api.deleteCategory(deletingCategory.id)
      
      if (response.success) {
        toast.success(`Category "${deletingCategory.name}" deleted successfully!`)
        setStatistics(prev => ({ ...prev, ...response.statistics }))
        setShowCategoryDeleteModal(false)
        setDeletingCategory(null)
        // Force immediate refetch to remove the deleted category
        refetch({ queryKey: ['admin-categories'], stale: false, cacheTime: 0 })
      } else {
        toast.error('Failed to delete category')
      }
    } catch (error) {
      console.error('Delete category error:', error)
      toast.error(error.response?.data?.error || 'Failed to delete category')
    } finally {
      setIsDeletingCategory(false)
    }
  }

  const handleCategoryModalClose = () => {
    setShowCategoryModal(false)
    setEditingCategory(null)
  }

  // Set up real-time socket connection for admin updates
  useEffect(() => {
    const socket = socketManager.connect('siddhi')
    
    // Join admin room for admin-specific updates
    socket.emit('join-admin', 'siddhi')

    // Listen for menu statistics updates
    const handleMenuStatisticsUpdate = (data) => {
      console.log('Menu statistics updated:', data)
      setStatistics(data.statistics)
    }

    // Listen for new menu items added
    const handleMenuItemAdded = (data) => {
      console.log('🆕 New menu item added via socket:', data)
      setStatistics(data.statistics)
      // Force immediate refetch to show the new item
      refetch({ queryKey: ['admin-menu-items'], stale: false, cacheTime: 0 })
    }

    socket.on('menu.statistics.updated', handleMenuStatisticsUpdate)
    socket.on('menu.item.added', handleMenuItemAdded)

    return () => {
      socket.off('menu.statistics.updated', handleMenuStatisticsUpdate)
      socket.off('menu.item.added', handleMenuItemAdded)
    }
  }, [])

  if (isLoading) {
    return (
      <AdminLayout 
        title="Menu & Category Management"
        subtitle="Manage your restaurant menu items and categories"
      >
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-gray-800 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading menu items...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <>
      <ConnectionStatus />
      <AdminLayout 
        title="Menu & Category Management"
        subtitle="Manage your restaurant menu items and categories"
      >
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Items</p>
              <p className="text-3xl font-bold text-gray-900">{statistics.totalItems || 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Categories</p>
              <p className="text-3xl font-bold text-gray-900">{statistics.totalCategories || 0}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Available Items</p>
              <p className="text-3xl font-bold text-gray-900">{statistics.availableItems || 0}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Out of Stock</p>
              <p className="text-3xl font-bold text-gray-900">{statistics.outOfStock || 0}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('items')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'items'
                  ? 'border-gray-800 text-gray-800'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Menu Items
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'categories'
                  ? 'border-gray-800 text-gray-800'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Categories
            </button>
          </nav>
        </div>
      </div>

      {/* Menu Items Tab */}
      {activeTab === 'items' && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Menu Items</h3>
            <div className="flex space-x-2">
              <button 
                onClick={() => refetch()}
                className="bg-blue-100 text-blue-600 px-3 py-2 rounded-lg text-sm hover:bg-blue-200"
              >
                🔄 Refresh
              </button>
              <button 
                onClick={() => setShowAddModal(true)}
                className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700"
              >
                Add New Item
              </button>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {menuItems.map((item) => (
              <div key={item.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-600">{item.description}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-gray-500">Category: {item.categoryName || 'Unknown'}</span>
                        <span className="text-sm text-gray-500">Price: {formatCurrency(item.price)}</span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          item.isVeg ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {item.isVeg ? 'Veg' : 'Non-Veg'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <AvailabilityToggle
                      itemId={item.id}
                      isAvailable={item.isAvailable}
                      onToggle={handleAvailabilityToggle}
                      storeSlug="siddhi"
                    />
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEditItem(item)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteItem(item)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Categories</h3>
            <button 
              onClick={() => setShowCategoryModal(true)}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700"
            >
              Add New Category
            </button>
          </div>
          <div className="divide-y divide-gray-200">
            {categories.map((category) => (
              <div key={category.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">{category.name}</h4>
                    <p className="text-sm text-gray-600">{category.itemCount} items</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      category.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {category.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEditCategory(category)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteCategory(category)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </AdminLayout>
    
    {/* Add/Edit Item Modal */}
    <AddItemModal
      isOpen={showAddModal}
      onClose={handleModalClose}
      onItemAdded={handleItemAdded}
      onItemUpdated={handleItemUpdated}
      categories={categories}
      editingItem={editingItem}
    />
    
    {/* Delete Confirmation Modal */}
    <DeleteConfirmModal
      isOpen={showDeleteModal}
      onClose={() => {
        setShowDeleteModal(false)
        setDeletingItem(null)
      }}
      onConfirm={handleDeleteConfirm}
      itemName={deletingItem?.name || ''}
      isLoading={isDeleting}
    />
    
    {/* Category Modal */}
    <CategoryModal
      isOpen={showCategoryModal}
      onClose={handleCategoryModalClose}
      onCategoryAdded={handleCategoryAdded}
      onCategoryUpdated={handleCategoryUpdated}
      editingCategory={editingCategory}
    />
    
    {/* Category Delete Confirmation Modal */}
    <CategoryDeleteModal
      isOpen={showCategoryDeleteModal}
      onClose={() => {
        setShowCategoryDeleteModal(false)
        setDeletingCategory(null)
      }}
      onConfirm={handleCategoryDeleteConfirm}
      categoryName={deletingCategory?.name || ''}
      itemCount={deletingCategory?.itemCount || 0}
      isLoading={isDeletingCategory}
    />
    </>
  )
}

export default MenuManagementWithSidebar
