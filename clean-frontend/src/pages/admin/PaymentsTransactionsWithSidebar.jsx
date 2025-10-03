import React, { useState } from 'react'
import { useQuery } from 'react-query'
import AdminLayout from '../../components/admin/AdminLayout'
import { api } from '../../lib/api'

const PaymentsTransactionsWithSidebar = () => {
  const [timeFilter, setTimeFilter] = useState('today')

  // Format currency to rupees
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Fetch transactions from API
  const { data: transactionData, isLoading } = useQuery(
    ['admin-transactions', timeFilter],
    async () => {
      const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'
      const response = await fetch(`${API_BASE_URL}/admin-supabase/transactions?store=siddhi&period=${timeFilter}`)
      const data = await response.json()
      return data.success ? data.data : { transactions: [], statistics: {} }
    },
    {
      refetchInterval: 10000, // Refetch every 10 seconds for real-time updates
    }
  )

  const transactions = transactionData?.transactions || []
  const statistics = transactionData?.statistics || {}

  if (isLoading) {
    return (
      <AdminLayout 
        title="Payments & Transactions"
        subtitle="Manage and track all payment transactions"
      >
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-gray-800 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading transactions...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Completed': 'bg-green-100 text-green-800',
      'Pending': 'bg-orange-100 text-orange-800',
      'Failed': 'bg-red-100 text-red-800',
      'Refunded': 'bg-blue-100 text-blue-800'
    }
    
    const icons = {
      'Completed': (
        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      ),
      'Pending': (
        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      ),
      'Failed': (
        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      ),
      'Refunded': (
        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
        </svg>
      )
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[status]}`}>
        {icons[status]}
        {status}
      </span>
    )
  }

  return (
    <AdminLayout 
      title="Payments & Transactions"
      subtitle="Manage and track all payment transactions"
    >
      {/* Time Filter */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div></div>
          <div className="flex space-x-2">
            <button
              onClick={() => setTimeFilter('today')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                timeFilter === 'today'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setTimeFilter('weekly')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                timeFilter === 'weekly'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setTimeFilter('monthly')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                timeFilter === 'monthly'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Monthly
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Total Transactions
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{statistics.totalTransactions || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                Total Revenue
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{formatCurrency(statistics.totalRevenue || 0)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Pending Transactions
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{statistics.pendingTransactions || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Details Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Transaction Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{transaction.orderId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.customer}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.paymentMethod}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(transaction.amount)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(transaction.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}

export default PaymentsTransactionsWithSidebar
