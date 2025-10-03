import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/store'
import AdminSidebar from '../../components/admin/AdminSidebar'

const ReportsAnalytics = () => {
  const navigate = useNavigate()
  const { isAdminAuthenticated } = useStore()

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAdminAuthenticated()) {
      navigate('/admin/login', { state: { from: { pathname: '/admin/reports' } } })
    }
  }, [isAdminAuthenticated, navigate])

  if (!isAdminAuthenticated()) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar activeTab="reports" />
      
      <div className="lg:pl-64">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                <div className="text-white text-xs font-bold">S</div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Reports & Analytics</h1>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          {/* Page Header with Filters and Export */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
            <div className="flex items-center space-x-4">
              <div className="flex space-x-2">
                <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium">Daily</button>
                <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium">Weekly</button>
                <button className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium">Monthly</button>
                <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Custom Range</span>
                </button>
              </div>
              <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-gray-900">$45,231.89</p>
                <p className="text-lg font-semibold text-gray-900 mt-2">Total Revenue</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-gray-900">2,350</p>
                <p className="text-lg font-semibold text-gray-900 mt-2">Total Orders</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-gray-900">$19.25</p>
                <p className="text-lg font-semibold text-gray-900 mt-2">Average Order Value</p>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Sales Overview Chart */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Overview</h3>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <p className="text-gray-500">Chart placeholder - Sales trend line</p>
              </div>
            </div>

            {/* Popular Dishes Chart */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Dishes</h3>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <p className="text-gray-500">Chart placeholder - Horizontal bar chart</p>
              </div>
            </div>
          </div>

          {/* Order Type Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Type Distribution</h3>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <p className="text-gray-500">Chart placeholder - Donut chart</p>
              </div>
            </div>

            {/* Least Ordered Items */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Least Ordered Items</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Aloo Gobhi</p>
                    <p className="text-sm text-gray-600">Vegetable Curries</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">35 Orders</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Palak Paneer</p>
                    <p className="text-sm text-gray-600">Vegetable Curries</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">42 Orders</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Chana Masala</p>
                    <p className="text-sm text-gray-600">Vegetable Curries</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">48 Orders</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Rogan Josh</p>
                    <p className="text-sm text-gray-600">Non-Veg Curries</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">51 Orders</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default ReportsAnalytics
