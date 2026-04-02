import { Routes, Route } from 'react-router-dom'
import { Suspense, lazy, useEffect } from 'react'
import PublicLayout from './layouts/PublicLayout'
import AdminLayout from './layouts/AdminLayout'
import GuestLayout from './layouts/GuestLayout'
import StaffLayout from './layouts/StaffLayout'
import ProtectedRoute from './components/auth/ProtectedRoute'
import LoadingSpinner from './components/ui/LoadingSpinner'
import ChatBot from './components/ChatBot'
import useAuthStore from './stores/authStore'

// Public Pages
const LandingPage = lazy(() => import('./pages/public/LandingPage'))
const RoomsPage = lazy(() => import('./pages/public/RoomsPage'))
const RoomDetailPage = lazy(() => import('./pages/public/RoomDetailPage'))
const BookingPage = lazy(() => import('./pages/public/BookingPage'))
const AboutPage = lazy(() => import('./pages/public/AboutPage'))
const ContactPage = lazy(() => import('./pages/public/ContactPage'))

// Auth Pages
const LoginPage = lazy(() => import('./pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'))

// Guest Portal
const GuestDashboard = lazy(() => import('./pages/guest/GuestDashboard'))
const GuestBookings = lazy(() => import('./pages/guest/GuestBookings'))
const GuestInvoices = lazy(() => import('./pages/guest/GuestInvoices'))
const GuestProfile = lazy(() => import('./pages/guest/GuestProfile'))
const GuestFeedback = lazy(() => import('./pages/guest/GuestFeedback'))
const GuestServices = lazy(() => import('./pages/guest/Guestservices'))

// Admin Portal
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminRooms = lazy(() => import('./pages/admin/AdminRooms'))
const AdminBookings = lazy(() => import('./pages/admin/AdminBookings'))
const AdminGuests = lazy(() => import('./pages/admin/AdminGuests'))
const AdminStaff = lazy(() => import('./pages/admin/AdminStaff'))
const AdminBilling = lazy(() => import('./pages/admin/AdminBilling'))
const AdminReports = lazy(() => import('./pages/admin/AdminReports'))
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'))
const AdminServiceRequests = lazy(() => import('./pages/admin/AdminServiceRequests'))

// Staff Portal
const StaffDashboard = lazy(() => import('./pages/staff/StaffDashboard'))
const StaffHousekeeping = lazy(() => import('./pages/staff/StaffHousekeeping'))
const StaffMaintenance = lazy(() => import('./pages/staff/StaffMaintenance'))
const StaffTasks = lazy(() => import('./pages/staff/StaffTasks'))

export default function App() {
  const { initAuth } = useAuthStore()

  // Initialize auth state on app load
  useEffect(() => {
    initAuth()
  }, [initAuth])

  return (
    <>
      <Suspense fallback={<LoadingSpinner fullScreen />}>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/rooms" element={<RoomsPage />} />
            <Route path="/rooms/:id" element={<RoomDetailPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            
            {/* Booking requires authentication */}
            <Route 
              path="/booking" 
              element={
                <ProtectedRoute allowedRoles={['guest', 'admin']}>
                  <BookingPage />
                </ProtectedRoute>
              } 
            />
          </Route>

          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Guest Portal - Protected for guests and admins */}
          <Route 
            path="/guest" 
            element={
              <ProtectedRoute allowedRoles={['guest', 'admin']}>
                <GuestLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<GuestProfile />} />
            <Route path="bookings" element={<GuestBookings />} />
            <Route path="invoices" element={<GuestInvoices />} />
            <Route path="dashboard" element={<GuestDashboard />} />
            <Route path="feedback" element={<GuestFeedback />} />
            <Route path="services" element={<GuestServices />} />
          </Route>

          {/* Admin Portal - Protected for admins only */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles="admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="rooms" element={<AdminRooms />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="guests" element={<AdminGuests />} />
            <Route path="staff" element={<AdminStaff />} />
            <Route path="billing" element={<AdminBilling />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="service-requests" element={<AdminServiceRequests />} />
          </Route>

          {/* Staff Portal - Protected for staff and admins */}
          <Route 
            path="/staff" 
            element={
              <ProtectedRoute allowedRoles={['staff', 'admin']}>
                <StaffLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<StaffDashboard />} />
            <Route path="housekeeping" element={<StaffHousekeeping />} />
            <Route path="maintenance" element={<StaffMaintenance />} />
            <Route path="tasks" element={<StaffTasks />} />
          </Route>
        </Routes>
      </Suspense>

      {/* Global AI Chatbot - floating bottom-right */}
      <ChatBot />
    </>
  )
}
