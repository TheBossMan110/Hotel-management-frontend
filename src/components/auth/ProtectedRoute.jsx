import { Navigate, useLocation } from 'react-router-dom'
import useAuthStore from '../../stores/authStore'
import LoadingSpinner from '../ui/LoadingSpinner'

/**
 * ProtectedRoute - Wrapper component for protected routes
 * @param {React.ReactNode} children - Child components to render
 * @param {string|string[]} allowedRoles - Roles allowed to access this route
 * @param {string} redirectTo - Where to redirect if not authenticated (default: /login)
 */
export default function ProtectedRoute({ 
  children, 
  allowedRoles = null,
  redirectTo = '/login'
}) {
  const location = useLocation()
  const { isAuthenticated, user, isLoading } = useAuthStore()

  // Show loading while checking auth state
  if (isLoading) {
    return <LoadingSpinner fullScreen />
  }

  // Not authenticated - redirect to login with return URL
  if (!isAuthenticated) {
    const returnUrl = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`${redirectTo}?returnUrl=${returnUrl}`} replace />
  }

  // Check role-based access if allowedRoles is specified
  if (allowedRoles) {
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]
    
    if (!roles.includes(user?.role)) {
      // Redirect to appropriate dashboard based on user role
      const dashboardRoutes = {
        admin: '/admin',
        staff: '/staff',
        guest: '/guest'
      }
      const userDashboard = dashboardRoutes[user?.role] || '/'
      return <Navigate to={userDashboard} replace />
    }
  }

  return children
}
