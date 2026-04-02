import { Outlet, Navigate } from 'react-router-dom'
import StaffSidebar from '../components/navigation/StaffSidebar'
import DashboardHeader from '../components/navigation/DashboardHeader'
import useAuthStore from '../stores/authStore'

export default function StaffLayout() {
  const { isAuthenticated, user } = useAuthStore()

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Staff layout is for staff role
  if (user?.role !== 'staff') {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-screen bg-muted/30 text-foreground">
      <StaffSidebar />
      <div className="lg:pl-72">
        <DashboardHeader title="Staff Portal" />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
