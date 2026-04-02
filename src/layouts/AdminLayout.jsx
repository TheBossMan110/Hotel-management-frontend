import { Outlet, Navigate } from 'react-router-dom'
import AdminSidebar from '../components/navigation/AdminSidebar'
import DashboardHeader from '../components/navigation/DashboardHeader'
import useAuthStore from '../stores/authStore'

export default function AdminLayout() {
  const { isAuthenticated, user } = useAuthStore()

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Redirect if not admin
  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-screen bg-muted/30 text-foreground">
      <AdminSidebar />
      <div className="lg:pl-72">
        <DashboardHeader title="Admin Dashboard" />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
