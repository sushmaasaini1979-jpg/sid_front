import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useStore } from '../store/store'
import Sidebar from '../components/Sidebar'

const Landing = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setStoreSlug } = useStore()

  useEffect(() => {
    // Check if store parameter is provided
    const store = searchParams.get('store')
    if (store) {
      setStoreSlug(store)
    }
  }, [searchParams, setStoreSlug])

  const handleViewMenu = () => {
    navigate('/menu')
  }

  const handleOrderStatus = () => {
    // This would typically open a modal or navigate to order status page
    const orderId = prompt('Enter your order ID:')
    if (orderId) {
      navigate(`/order/${orderId}`)
    }
  }

  const handleAdminLogin = () => {
    navigate('/admin/login')
  }

  const handleGoToCart = () => {
    navigate('/cart')
  }

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen font-['Inter',_system-ui,_-apple-system,_BlinkMacSystemFont,_sans-serif] bg-gray-50">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-10 h-[72px] bg-gray-900">
        <div className="flex items-center justify-between h-full px-5">
          <h1 className="uppercase font-bold tracking-wide text-white">SIDDHI</h1>
          <button 
            onClick={toggleSidebar}
            className="p-2 rounded-full hover:bg-gray-800"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>
      
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Container */}
      <div className="max-w-[420px] mx-auto px-5 pt-[96px] min-h-screen flex flex-col">
        {/* Hero Section */}
        <main className="flex-1 flex flex-col items-center text-center">
          {/* Logo - Circular logo exactly as in image */}
          <div className="w-[180px] h-[180px] mx-auto bg-gray-900 rounded-full flex items-center justify-center mb-6">
            <div className="text-center text-white">
              <div className="text-2xl font-bold tracking-wide">SIDDHI</div>
              <div className="text-xs tracking-wide mt-1">BITE INTO HAPPINESS</div>
            </div>
          </div>

          {/* Heading */}
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to SIDDHI</h2>

          {/* Tagline */}
          <p className="text-lg text-gray-600 mb-8">Experience the fresh taste of happiness</p>

          {/* Action Buttons */}
          <div className="space-y-8 w-full max-w-md mx-auto mb-24">
            {/* Primary Button - Black curved button */}
            <div className="flex justify-center">
              <button
                onClick={handleViewMenu}
                className="w-[230px] bg-gray-900 text-white py-4 px-6 text-lg font-semibold rounded-full shadow-md hover:bg-gray-800 transition-all"
              >
                View Menu
              </button>
            </div>

            {/* Secondary Buttons - Light gray curved buttons */}
            <div className="grid grid-cols-2 gap-5">
              <button
                onClick={handleOrderStatus}
                className="bg-gray-200 text-gray-800 py-4 px-2 rounded-full font-medium hover:bg-gray-300 transition-all"
              >
                Order Status
              </button>
              <button
                onClick={handleAdminLogin}
                className="bg-gray-200 text-gray-800 py-4 px-2 rounded-full font-medium hover:bg-gray-300 transition-all"
              >
                Admin Login
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Landing