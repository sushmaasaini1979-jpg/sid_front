import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/store'
import AdminSidebar from '../../components/admin/AdminSidebar'

const MenuManagement = () => {
  const navigate = useNavigate()
  const { isAdminAuthenticated } = useStore()
  const [showAddModal, setShowAddModal] = useState(false)
  const [newItem, setNewItem] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    available: true
  })

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAdminAuthenticated()) {
      navigate('/admin/login', { state: { from: { pathname: '/admin/menu' } } })
    }
  }, [isAdminAuthenticated, navigate])

  if (!isAdminAuthenticated()) {
    return null
  }

  const categories = [
    'Starters',
    'Main Course', 
    'Drinks',
    'Desserts',
    'Soups',
    'Salads'
  ]

  const handleAddItem = () => {
    // Handle adding new item logic here
    console.log('Adding item:', newItem)
    setShowAddModal(false)
    setNewItem({ name: '', price: '', description: '', category: '', available: true })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar activeTab="menu" />
      
      <div className="lg:pl-64">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                <div className="text-white text-xs font-bold">S</div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Menu & Category Management</h1>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          {/* Page Title */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Food Categories</h2>
          </div>

          {/* Categories List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {categories.map((category) => (
              <div key={category} className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">{category}</h3>
                <p className="text-sm text-gray-600 mb-3">Manage items in this category</p>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View Items →
                </button>
              </div>
            ))}
          </div>

          {/* Add New Item Button */}
          <div className="flex justify-end mb-6">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Add New Item</span>
            </button>
          </div>
        </main>
      </div>

      {/* Add New Food Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New Food Item</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-6">Enter details for the new food item.</p>

            {/* Image Upload */}
            <div className="mb-6">
              <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-2 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-center text-sm text-gray-600">Click to upload image</p>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                  placeholder="Enter item name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">₹</span>
                  <input
                    type="text"
                    value={newItem.price}
                    onChange={(e) => setNewItem({...newItem, price: e.target.value})}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                    placeholder="Enter price"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newItem.description}
                  onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                  placeholder="Enter item description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Available</label>
                <button
                  onClick={() => setNewItem({...newItem, available: !newItem.available})}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    newItem.available ? 'bg-orange-500' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      newItem.available ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddItem}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MenuManagement
