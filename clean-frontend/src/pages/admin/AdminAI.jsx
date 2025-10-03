import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/store'
import AdminSidebar from '../../components/admin/AdminSidebar'
import AdminHeader from '../../components/admin/AdminHeader'

const AdminAI = () => {
  const navigate = useNavigate()
  const { isAdminAuthenticated } = useStore()

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAdminAuthenticated()) {
      navigate('/admin/login', { state: { from: { pathname: '/admin/ai' } } })
    }
  }, [isAdminAuthenticated, navigate])

  if (!isAdminAuthenticated()) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar activeTab="ai" />
      
      <div className="lg:pl-64">
        <AdminHeader 
          title="AI Recommendation Insights" 
          subtitle="AI-powered insights and recommendations"
        />
        
        <main className="p-6">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">AI Recommendations</h3>
            <p className="text-gray-600 mb-4">This page will contain AI-powered insights and recommendations.</p>
            <p className="text-sm text-gray-500">Coming soon...</p>
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminAI
