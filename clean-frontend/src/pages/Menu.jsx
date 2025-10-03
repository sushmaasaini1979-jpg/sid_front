import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useStore, useCartStore } from '../store/store'
import { useRealtimeMenu } from '../hooks/useRealtimeMenu'
import useRealtimeUpdates from '../hooks/useRealtimeUpdates'
import LoadingSpinner from '../components/LoadingSpinner'
import MenuItemCard from '../components/MenuItemCard'
import CartDrawer from '../components/CartDrawer'
import SearchBar from '../components/SearchBar'
import CategoryFilter from '../components/CategoryFilter'
import Sidebar from '../components/Sidebar'
import BottomNavigation from '../components/BottomNavigation'

const Menu = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { storeSlug, setStoreSlug, selectedCategory, setSelectedCategory, searchQuery, setSearchQuery, isCartOpen, setCartOpen } = useStore()
  const { addItem } = useCartStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  // Get store slug from URL or use default
  const currentStoreSlug = searchParams.get('store') || storeSlug

  useEffect(() => {
    if (currentStoreSlug) {
      setStoreSlug(currentStoreSlug)
    }
  }, [currentStoreSlug, setStoreSlug])

  // Use the real-time menu hook
  const { menuData, isLoading, error, isUpdating, refetch } = useRealtimeMenu(currentStoreSlug)
  
  // Real-time updates hook for instant updates
  const { isConnected, lastUpdate } = useRealtimeUpdates(currentStoreSlug)

  // Force refetch when page becomes visible (fallback for missed socket events)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('👁️ Page became visible, refetching menu data...')
        refetch()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [refetch])

  const handleCategoryChange = (category) => {
    setSelectedCategory(category)
  }

  const handleSearchChange = (query) => {
    setSearchQuery(query)
  }

  const handleAddToCart = (item) => {
    console.log('Adding to cart:', item)
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      imageUrl: item.imageUrl,
      quantity: 1,
      notes: ''
    })
  }

  const handleGoToCart = () => {
    navigate('/cart')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to load menu</h2>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <button 
            onClick={() => window.location.reload()}
            className="btn btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Process menu data
  let displayItems = []
  let menuArray = []

  if (menuData?.categories) {
    menuArray = menuData.categories
  } else if (menuData?.menu) {
    menuArray = menuData.menu
  } else if (Array.isArray(menuData)) {
    menuArray = menuData
  }

  if (menuArray.length > 0) {
    if (selectedCategory === 'all') {
      displayItems = menuArray.flatMap(category => category.items || [])
    } else {
      const selectedCategoryData = menuArray.find(cat => cat.slug === selectedCategory)
      displayItems = selectedCategoryData?.items || []
    }
  }

  // Apply search filter
  if (searchQuery && searchQuery.trim()) {
    const query = searchQuery.toLowerCase().trim()
    displayItems = displayItems.filter(item => 
      item.name.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query) ||
      item.category?.name?.toLowerCase().includes(query)
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-16">
      {/* Header */}
      <header className="bg-white px-4 py-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* SIDDHI Branding */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">SIDDHI</h1>
              </div>
            </div>
            {isUpdating && (
              <div className="flex items-center space-x-2 text-sm text-blue-600">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span>Updating...</span>
              </div>
            )}
          </div>
          <button 
            onClick={toggleSidebar}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        
        {/* Search Bar */}
        <div className="mt-4">
          <SearchBar 
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search for your favorite dishes..."
          />
        </div>
      </header>
      
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Category Filter */}
      <div className="bg-white px-4 pb-0 border-b-0">
        <div className="flex space-x-4 overflow-x-auto py-2 no-scrollbar" style={{marginBottom: 0}}>
          <button
            onClick={() => handleCategoryChange('all')}
            className={`px-8 py-2 text-sm font-medium whitespace-nowrap transition-all duration-200 ${
              selectedCategory === 'all'
                ? 'bg-black text-white rounded-full shadow-md'
                : 'text-gray-600 hover:text-black hover:bg-gray-100 rounded-full'
            }`}
          >
            All Items
          </button>
          {menuArray.map((category) => (
            <button
              key={category.slug}
              onClick={() => handleCategoryChange(category.slug)}
              className={`px-8 py-2 text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                selectedCategory === category.slug
                  ? 'bg-black text-white rounded-full shadow-md'
                  : 'text-gray-600 hover:text-black hover:bg-gray-100 rounded-full'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      <main className="flex-1 px-4 py-6">
        {selectedCategory !== 'all' && (
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {menuArray.find(cat => cat.slug === selectedCategory)?.name || 'Menu Items'}
            </h2>
          </div>
        )}
        
        <div className="grid gap-4">
          {displayItems.map((item, index) => (
            <MenuItemCard
              key={`${item.id}-${index}`}
              item={item}
              onAddToCart={() => handleAddToCart(item)}
            />
          ))}
        </div>

        {displayItems.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.709M15 6.708A7.962 7.962 0 0012 5c-2.34 0-4.29 1.009-5.824 2.709" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery ? 'Try searching for something else' : 'No items available in this category'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-orange-500 hover:text-orange-600 font-medium"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </main>

      {/* Cart Drawer */}
      {isCartOpen && (
        <CartDrawer 
          isOpen={isCartOpen}
          onClose={() => setCartOpen(false)}
          onCheckout={handleGoToCart}
        />
      )}
      
      {/* Bottom Navigation */}
      <BottomNavigation activeTab="menu" />
    </div>
  )
}

export default Menu