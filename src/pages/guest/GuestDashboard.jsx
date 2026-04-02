import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { useBookingsStore } from '../../stores/bookingsStore'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { formatDate, formatCurrency } from '../../lib/utils'

export default function GuestDashboard() {
  const { user } = useAuthStore()
  const { myBookings: bookings, fetchMyBookings, isLoading } = useBookingsStore()
  
  useEffect(() => {
    fetchMyBookings()
  }, [fetchMyBookings])

  const activeBooking = bookings.find(b => b.status === 'confirmed' || b.status === 'checked-in')
  const upcomingBookings = bookings.filter(b => b.status === 'confirmed')
  const pastBookings = bookings.filter(b => b.status === 'checked-out')

  const getRoomType = (booking) => booking.room?.type || booking.roomType || 'Room'
  const getRoomNumber = (booking) => booking.room?.roomNumber || booking.roomNumber || '—'
  const getTotal = (booking) => booking.pricing?.total || booking.totalAmount || 0

  const quickActions = [
    { icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', label: 'Book a Room', to: '/rooms' },
    { icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', label: 'My Bookings', to: '/guest/bookings' },
    { icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', label: 'Invoices', to: '/guest/invoices' },
    { icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z', label: 'Feedback', to: '/guest/feedback' },
  ]

  if (isLoading && bookings.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5" style={{ color: '#F8F4EF' }}>
      {/* Welcome Section */}
      <div className="relative overflow-hidden p-6 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.12) 0%, rgba(201,168,76,0.03) 100%)', border: '1px solid rgba(201,168,76,0.2)' }}>
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full" style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.1) 0%, transparent 70%)', transform: 'translate(20%, -20%)' }} />
        <p className="text-xs font-body tracking-[0.3em] uppercase mb-1" style={{ color: '#C9A84C' }}>Welcome Back</p>
        <h1 className="font-display font-light text-3xl" style={{ color: '#F8F4EF' }}>
          {user?.firstName || 'Guest'}
        </h1>
        <p className="font-body text-sm mt-1" style={{ color: 'rgba(248,244,239,0.5)' }}>
          {"Here's an overview of your stays and activities"}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <Link key={action.label} to={action.to}>
            <div
              className="group rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-3 transition-all duration-300 cursor-pointer"
              style={{ background: '#111111', border: '1px solid #2A2A2A' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)'; e.currentTarget.style.boxShadow = '0 0 30px rgba(201,168,76,0.08)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#2A2A2A'; e.currentTarget.style.boxShadow = 'none' }}
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                style={{ background: 'rgba(201,168,76,0.1)' }}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: '#C9A84C' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={action.icon} />
                </svg>
              </div>
              <span className="font-body text-sm" style={{ color: 'rgba(248,244,239,0.8)' }}>{action.label}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Active Booking */}
      {activeBooking && (
        <div className="p-6 rounded-2xl" style={{ background: '#111111', border: '1px solid rgba(201,168,76,0.2)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-xl" style={{ color: '#F8F4EF' }}>Current Stay</h3>
            <span className="text-xs font-body px-3 py-1 rounded-full"
              style={activeBooking.status === 'checked-in'
                ? { background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80' }
                : { background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', color: '#C9A84C' }
              }>
              {activeBooking.status === 'checked-in' ? 'Checked In' : 'Upcoming'}
            </span>
          </div>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <h4 className="font-display text-lg capitalize mb-1" style={{ color: '#F8F4EF' }}>{getRoomType(activeBooking)}</h4>
              <p className="text-sm font-body" style={{ color: 'rgba(248,244,239,0.45)' }}>Room {getRoomNumber(activeBooking)}</p>
              <div className="flex gap-6 mt-3">
                {[{ label: 'Check-in', date: activeBooking.checkIn }, { label: 'Check-out', date: activeBooking.checkOut }].map(d => (
                  <div key={d.label}>
                    <p className="text-xs font-body tracking-widest uppercase" style={{ color: '#C9A84C' }}>{d.label}</p>
                    <p className="font-body font-medium text-sm mt-1" style={{ color: '#F8F4EF' }}>{formatDate(d.date)}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Link to="/guest/services">
                <button className="w-full px-6 py-2 rounded-xl text-xs font-body tracking-widest uppercase transition-all"
                  style={{ border: '1px solid rgba(201,168,76,0.4)', color: '#C9A84C' }}>Request Service</button>
              </Link>
              <Link to="/guest/bookings">
                <button className="w-full px-6 py-2 rounded-xl text-xs font-body tracking-widest uppercase transition-all"
                  style={{ border: '1px solid #2A2A2A', color: 'rgba(248,244,239,0.5)' }}>View Details</button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Stays',    value: bookings.length, accent: '#60a5fa', bg: 'rgba(59,130,246,0.08)', pathD: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
          { label: 'Loyalty Points', value: user?.loyaltyPoints || 0, accent: '#C9A84C', bg: 'rgba(201,168,76,0.08)', pathD: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
          { label: 'Total Spent', value: formatCurrency(pastBookings.reduce((acc, b) => acc + getTotal(b), 0)), accent: '#4ade80', bg: 'rgba(34,197,94,0.08)', pathD: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
        ].map((stat, i) => (
          <div key={i} className="p-5 rounded-2xl flex items-center gap-4" style={{ background: '#111111', border: '1px solid #2A2A2A' }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: stat.bg }}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: stat.accent }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={stat.pathD} />
              </svg>
            </div>
            <div>
              <p className="text-xs font-body" style={{ color: 'rgba(248,244,239,0.4)' }}>{stat.label}</p>
              <p className="font-display text-2xl" style={{ color: stat.accent }}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Upcoming Bookings */}
      <div className="p-5 rounded-2xl" style={{ background: '#111111', border: '1px solid #2A2A2A' }}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-xl" style={{ color: '#F8F4EF' }}>Upcoming Reservations</h3>
          <Link to="/guest/bookings">
            <button className="text-xs font-body tracking-widest uppercase hover:opacity-70 transition-opacity" style={{ color: '#C9A84C' }}>View All</button>
          </Link>
        </div>
        {upcomingBookings.length === 0 ? (
          <div className="text-center py-8">
            <svg className="w-12 h-12 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'rgba(248,244,239,0.15)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="font-body text-sm mb-4" style={{ color: 'rgba(248,244,239,0.4)' }}>No upcoming reservations</p>
            <Link to="/rooms">
              <button className="btn-gold px-6 py-2.5 rounded-full text-xs font-body tracking-widest uppercase">Book Now</button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {upcomingBookings.slice(0, 3).map((booking) => (
              <div key={booking._id || booking.id}
                className="flex items-center justify-between p-4 rounded-xl"
                style={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ background: 'rgba(201,168,76,0.1)' }}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: '#C9A84C' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-body font-medium text-sm capitalize" style={{ color: '#F8F4EF' }}>{getRoomType(booking)}</p>
                    <p className="text-xs font-body" style={{ color: 'rgba(248,244,239,0.4)' }}>
                      {formatDate(booking.checkIn)} — {formatDate(booking.checkOut)}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-body font-medium" style={{ color: '#C9A84C' }}>{formatCurrency(getTotal(booking))}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
