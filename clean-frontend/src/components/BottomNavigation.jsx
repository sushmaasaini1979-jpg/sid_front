import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useCartStore, useStore } from '../store/store'

const BottomNavigation = ({ activeTab }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { itemCount } = useCartStore()

  const isActive = (tab) => {
    if (activeTab) return activeTab === tab
    return location.pathname === tab || location.pathname.startsWith(`/${tab}`)
  }

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      path: '/'
    },
    {
      id: 'menu',
      label: 'Menu',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      ),
      path: '/menu'
    },
    {
      id: 'cart',
      label: 'Cart',
      icon: (
        <div className="relative">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
          </svg>
          {itemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {itemCount > 99 ? '99+' : itemCount}
            </span>
          )}
        </div>
      ),
      path: '/cart'
    },
  ]

  const { setCartOpen } = useStore()

  const handleNavigation = (item) => {
    if (item.id === 'cart') {
      // Open cart drawer instead of navigating
      setCartOpen(true)
    } else {
      navigate(item.path)
    }
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10 bg-white border-t border-gray-200 px-4 py-2">
      <div className="flex justify-around">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavigation(item)}
            className={`flex flex-col items-center py-2 ${
              isActive(item.id)
                ? 'text-gray-900'
                : 'text-gray-600'
            }`}
          >
            <div className={`w-6 h-6 mb-1 ${isActive(item.id) ? 'text-gray-900' : 'text-gray-600'}`}>
              {item.icon}
            </div>
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}

export default BottomNavigation
