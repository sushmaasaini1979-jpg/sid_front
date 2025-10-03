import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/store'
import AdminSidebar from '../../components/admin/AdminSidebar'

const OffersCoupons = () => {
  const navigate = useNavigate()
  const { isAdminAuthenticated } = useStore()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discountType: 'Percentage Off',
    discountValue: '',
    minPurchase: '',
    active: true
  })

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAdminAuthenticated()) {
      navigate('/admin/login', { state: { from: { pathname: '/admin/offers' } } })
    }
  }, [isAdminAuthenticated, navigate])

  if (!isAdminAuthenticated()) {
    return null
  }

  const handleCreateCoupon = () => {
    console.log('Creating coupon:', newCoupon)
    setShowCreateModal(false)
    setNewCoupon({ code: '', discountType: 'Percentage Off', discountValue: '', minPurchase: '', active: true })
  }

  const handleDeleteCoupon = () => {
    console.log('Deleting coupon')
    setShowDeleteModal(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar activeTab="offers" />
      
      <div className="lg:pl-64">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                <div className="text-white text-xs font-bold">S</div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Offers & Coupons</h1>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          {/* Page Title */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Offers & Coupons</h2>
          </div>

          {/* Add New Coupon Button */}
          <div className="flex justify-end mb-6">
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Create New Coupon</span>
            </button>
          </div>

          {/* Coupons List Placeholder */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-gray-500 text-center py-8">Coupons list will be displayed here</p>
          </div>
        </main>
      </div>

      {/* Create New Coupon Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Create New Coupon</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-6">Add a new promotional coupon to your system.</p>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code</label>
                <input
                  type="text"
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({...newCoupon, code: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                  placeholder="e.g., BLACKFRIDAY25"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
                <select
                  value={newCoupon.discountType}
                  onChange={(e) => setNewCoupon({...newCoupon, discountType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                >
                  <option value="Percentage Off">Percentage Off</option>
                  <option value="Fixed Amount">Fixed Amount</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Value</label>
                <input
                  type="text"
                  value={newCoupon.discountValue}
                  onChange={(e) => setNewCoupon({...newCoupon, discountValue: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                  placeholder="e.g., 25 or 100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min. Purchase</label>
                <input
                  type="text"
                  value={newCoupon.minPurchase}
                  onChange={(e) => setNewCoupon({...newCoupon, minPurchase: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                  placeholder="Optional, e.g., 500"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Active</label>
                <button
                  onClick={() => setNewCoupon({...newCoupon, active: !newCoupon.active})}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    newCoupon.active ? 'bg-orange-500' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      newCoupon.active ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCoupon}
                className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Save Coupon
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Deletion Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Deletion</h3>
            <p className="text-sm text-gray-600 mb-6">Are you sure you want to delete this coupon? This action cannot be undone.</p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCoupon}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OffersCoupons
