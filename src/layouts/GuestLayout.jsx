import { Outlet, Navigate } from 'react-router-dom'
import Navbar from '../components/navigation/Navbar'
import Footer from '../components/navigation/Footer'
import useAuthStore from '../stores/authStore'

export default function GuestLayout() {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (user?.role !== 'guest' && user?.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-screen" style={{ background: '#0A0A0A' }}>
      <Navbar />
      <main style={{ paddingTop: '6rem', paddingBottom: '4rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  )
}

