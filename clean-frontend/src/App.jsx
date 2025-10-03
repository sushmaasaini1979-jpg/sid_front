import { Routes, Route } from 'react-router-dom'
import { useQuery } from 'react-query'
import { api } from './lib/api'
import { useStore } from './store/store'

// Pages
import Landing from './pages/Landing'
import Menu from './pages/Menu'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import CheckoutSimple from './pages/CheckoutSimple'
import CheckoutSimpleFixed from './pages/CheckoutSimpleFixed'
import PaymentComplete from './pages/PaymentComplete'
import OrderStatus from './pages/OrderStatus'
import AdminLoginSimple from './pages/admin/AdminLoginSimple'
import AdminDashboardSimple from './pages/admin/AdminDashboardSimple'
import AdminDashboardWithSidebar from './pages/admin/AdminDashboardWithSidebar'
import OrderManagementWithSidebar from './pages/admin/OrderManagementWithSidebar'
import MenuManagementWithSidebar from './pages/admin/MenuManagementWithSidebar'
import CustomerManagementWithSidebar from './pages/admin/CustomerManagementWithSidebar'
import PaymentsTransactionsWithSidebar from './pages/admin/PaymentsTransactionsWithSidebar'
import OffersCouponsWithSidebar from './pages/admin/OffersCouponsWithSidebar'
import ReportsAnalyticsWithSidebar from './pages/admin/ReportsAnalyticsWithSidebar'
import AIRecommendationsWithSidebar from './pages/admin/AIRecommendationsWithSidebar'
import RealtimeTest from './pages/admin/RealtimeTest'
import SupabaseTest from './pages/admin/SupabaseTest'
 
// Components
import LoadingSpinner from './components/LoadingSpinner'
import ErrorBoundary from './components/ErrorBoundary'

function App() {
  const { storeSlug } = useStore()
  console.log('App component - storeSlug:', storeSlug)

  // Fetch store data if storeSlug is available
  const { data: storeData, isLoading, error } = useQuery(
    ['store', storeSlug],
    () => {
      console.log('Fetching store data for slug:', storeSlug)
      return api.getStore(storeSlug)
    },
    {
      enabled: !!storeSlug,
      retry: 1,
      onSuccess: (data) => {
        console.log('Store data fetched successfully:', data)
      },
      onError: (error) => {
        console.error('Store fetch failed:', error)
      }
    }
  )

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    console.error('Store fetch error:', error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Store Not Found</h1>
          <p className="text-gray-600 mb-4">The store you're looking for doesn't exist.</p>
          <p className="text-sm text-gray-500 mb-4">Store Slug: {storeSlug}</p>
          <p className="text-sm text-gray-500 mb-4">Error: {error?.message || 'Unknown error'}</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="btn btn-primary"
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<CheckoutSimpleFixed />} />
          <Route path="/payment-complete" element={<PaymentComplete />} />
          <Route path="/order/:id" element={<OrderStatus />} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLoginSimple />} />
          <Route path="/admin" element={<AdminDashboardWithSidebar />} />
          <Route path="/admin/dashboard" element={<AdminDashboardWithSidebar />} />
          <Route path="/admin/orders" element={<OrderManagementWithSidebar />} />
          <Route path="/admin/menu" element={<MenuManagementWithSidebar />} />
          <Route path="/admin/customers" element={<CustomerManagementWithSidebar />} />
          <Route path="/admin/payments" element={<PaymentsTransactionsWithSidebar />} />
          <Route path="/admin/offers" element={<OffersCouponsWithSidebar />} />
          <Route path="/admin/reports" element={<ReportsAnalyticsWithSidebar />} />
          <Route path="/admin/ai-recommendations" element={<AIRecommendationsWithSidebar />} />
          <Route path="/admin/realtime-test" element={<RealtimeTest />} />
          <Route path="/admin/supabase-test" element={<SupabaseTest />} />
        </Routes>
      </div>
    </ErrorBoundary>
  )
}

export default App
