import React, { useState } from 'react'
import { useQueryClient } from 'react-query'
import AdminLayout from '../../components/admin/AdminLayout'
import { useRealtimeCoupons } from '../../hooks/useRealtimeOrders'
import CouponModal from '../../components/CouponModal'
import CouponDeleteModal from '../../components/CouponDeleteModal'
import { api } from '../../lib/api'
import toast from 'react-hot-toast'

const OffersCouponsWithSidebar = () => {
  const queryClient = useQueryClient()
  const [showCouponModal, setShowCouponModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState(null)
  const [deletingCoupon, setDeletingCoupon] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Real-time coupons subscription
  const { coupons, statistics, isConnected, isLoading } = useRealtimeCoupons('siddhi')

  // Format currency to rupees
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Manual refresh function
  const handleRefresh = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'
      const response = await fetch(`${API_BASE_URL}/admin-supabase/coupons?store=siddhi`)
      const data = await response.json()
      if (data.success && data.data && data.data.coupons) {
        // Force re-render by updating the component
        window.location.reload()
      }
    } catch (error) {
      console.error('Error refreshing coupons:', error)
    }
  }

  // Handle coupon added
  const handleCouponAdded = (coupon, statistics) => {
    console.log('✅ Coupon added:', coupon)
    toast.success(`Coupon "${coupon.name}" created successfully!`)
    queryClient.invalidateQueries(['admin-coupons'])
  }

  // Handle coupon updated
  const handleCouponUpdated = (coupon, statistics) => {
    console.log('✅ Coupon updated:', coupon)
    toast.success(`Coupon "${coupon.name}" updated successfully!`)
    queryClient.invalidateQueries(['admin-coupons'])
  }

  // Handle edit coupon
  const handleEditCoupon = (coupon) => {
    setEditingCoupon(coupon)
    setShowCouponModal(true)
  }

  // Handle delete coupon
  const handleDeleteCoupon = (coupon) => {
    setDeletingCoupon(coupon)
    setShowDeleteModal(true)
  }

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!deletingCoupon) return

    setIsDeleting(true)
    try {
      const response = await api.deleteCoupon(deletingCoupon.id)
      if (response.success) {
        toast.success(`Coupon "${deletingCoupon.name}" deleted successfully!`)
        queryClient.invalidateQueries(['admin-coupons'])
        setShowDeleteModal(false)
        setDeletingCoupon(null)
      } else {
        toast.error(response.error || 'Failed to delete coupon')
      }
    } catch (error) {
      console.error('Delete coupon error:', error)
      toast.error('Failed to delete coupon')
    } finally {
      setIsDeleting(false)
    }
  }

  // Handle modal close
  const handleModalClose = () => {
    setShowCouponModal(false)
    setEditingCoupon(null)
  }

  const getStatusBadge = (isActive) => {
    return isActive 
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800'
  }

  const getUsagePercentage = (usedCount, usageLimit) => {
    if (!usageLimit) return 0
    return Math.round((usedCount / usageLimit) * 100)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <AdminLayout 
        title="Offers & Coupons"
        subtitle="Manage discount offers and promotional coupons"
      >
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-gray-800 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading coupons...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout 
      title="Offers & Coupons"
      subtitle="Manage discount offers and promotional coupons"
    >
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Coupons</p>
              <p className="text-3xl font-bold text-gray-900">{statistics.activeCoupons || 0}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Usage</p>
              <p className="text-3xl font-bold text-gray-900">{statistics.totalUsage || 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Savings</p>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(statistics.totalSavings || 0)}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
              <p className="text-3xl font-bold text-gray-900">{statistics.conversionRate || 0}%</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Coupons List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-semibold text-gray-900">Active Coupons</h3>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-xs text-gray-500">
                {isConnected ? 'Live' : 'Offline'}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
            <button
              onClick={handleRefresh}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
            >
              Refresh
            </button>
            <button 
              onClick={() => setShowCouponModal(true)}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700"
            >
              Create New Coupon
            </button>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {coupons.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No coupons yet</h3>
              <p className="text-gray-500 mb-4">Create your first promotional coupon to get started.</p>
              <button 
                onClick={() => setShowCouponModal(true)}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                Create New Coupon
              </button>
            </div>
          ) : (
            coupons.map((coupon) => (
              <div key={coupon.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <h4 className="text-lg font-medium text-gray-900">{coupon.name}</h4>
                      <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-mono">
                        {coupon.code}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(coupon.isActive)}`}>
                        {coupon.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    {coupon.description && (
                      <p className="text-sm text-gray-600 mb-2">{coupon.description}</p>
                    )}
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      {coupon.minOrderAmount && (
                        <span>Min Order: {formatCurrency(coupon.minOrderAmount)}</span>
                      )}
                      {coupon.maxDiscount && (
                        <span>Max Discount: {formatCurrency(coupon.maxDiscount)}</span>
                      )}
                      <span>Expires: {formatDate(coupon.validUntil)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {coupon.type === 'PERCENTAGE' ? `${coupon.value}%` : formatCurrency(coupon.value)}
                      </p>
                      <p className="text-xs text-gray-500">Discount</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {coupon.usedCount}/{coupon.usageLimit || '∞'}
                      </p>
                      <p className="text-xs text-gray-500">Usage</p>
                    </div>
                    
                    {coupon.usageLimit && (
                      <div className="w-16">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                          <span>Usage</span>
                          <span>{getUsagePercentage(coupon.usedCount, coupon.usageLimit)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${getUsagePercentage(coupon.usedCount, coupon.usageLimit)}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEditCoupon(coupon)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteCoupon(coupon)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Coupon Modal */}
      <CouponModal
        isOpen={showCouponModal}
        onClose={handleModalClose}
        onCouponAdded={handleCouponAdded}
        onCouponUpdated={handleCouponUpdated}
        editingCoupon={editingCoupon}
      />
      
      {/* Delete Confirmation Modal */}
      <CouponDeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setDeletingCoupon(null)
        }}
        onConfirm={handleDeleteConfirm}
        couponName={deletingCoupon?.name || ''}
        usageCount={deletingCoupon?.usedCount || 0}
        isLoading={isDeleting}
      />
    </AdminLayout>
  )
}

export default OffersCouponsWithSidebar
