import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/store'
import AdminSidebar from '../../components/admin/AdminSidebar'
import AdminHeader from '../../components/admin/AdminHeader'

const AdminMenu = () => {
  const navigate = useNavigate()
  const { isAdminAuthenticated } = useStore()

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAdminAuthenticated()) {
      navigate('/admin/login', { state: { from: { pathname: '/admin/menu' } } })
    }
  }, [isAdminAuthenticated, navigate])

  if (!isAdminAuthenticated()) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar activeTab="menu" />
      
      <div className="lg:pl-64">
        <AdminHeader 
          title="Menu & Category Management" 
          subtitle="Manage your menu items and categories"
        />
        
        <main className="p-6">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Menu Management</h3>
            <p className="text-gray-600 mb-4">This page will contain menu management features.</p>
            <p className="text-sm text-gray-500">Coming soon...</p>
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminMenu
