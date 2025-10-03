import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/store'
import AdminSidebar from '../../components/admin/AdminSidebar'
import AdminHeader from '../../components/admin/AdminHeader'

const AdminCustomers = () => {
  const navigate = useNavigate()
  const { isAdminAuthenticated } = useStore()

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAdminAuthenticated()) {
      navigate('/admin/login', { state: { from: { pathname: '/admin/customers' } } })
    }
  }, [isAdminAuthenticated, navigate])

  if (!isAdminAuthenticated()) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar activeTab="customers" />
      
      <div className="lg:pl-64">
        <AdminHeader 
          title="Customer Management" 
          subtitle="Manage your customer database"
        />
        
        <main className="p-6">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Customer Management</h3>
            <p className="text-gray-600 mb-4">This page will contain customer management features.</p>
            <p className="text-sm text-gray-500">Coming soon...</p>
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminCustomers
