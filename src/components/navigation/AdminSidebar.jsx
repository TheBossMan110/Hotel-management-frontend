import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  BedDouble,
  CalendarCheck,
  Users,
  UserCog,
  CreditCard,
  BarChart3,
  Settings,
  Home,
  LogOut,
  BellRing,
  ChevronRight
} from 'lucide-react'
import { cn } from '../../lib/utils'
import useAuthStore from '../../stores/authStore'

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: BedDouble, label: 'Rooms', href: '/admin/rooms' },
  { icon: CalendarCheck, label: 'Bookings', href: '/admin/bookings' },
  { icon: Users, label: 'Guests', href: '/admin/guests' },
  { icon: UserCog, label: 'Staff', href: '/admin/staff' },
  { icon: BellRing, label: 'Service Requests', href: '/admin/service-requests' },
  { icon: CreditCard, label: 'Billing', href: '/admin/billing' },
  { icon: BarChart3, label: 'Reports', href: '/admin/reports' },
  { icon: Settings, label: 'Settings', href: '/admin/settings' }
]

export default function AdminSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-72 hidden lg:flex flex-col" style={{
      background: 'linear-gradient(180deg, #0D0D0D 0%, #111111 100%)',
      borderRight: '1px solid rgba(201,168,76,0.15)',
      boxShadow: '4px 0 24px rgba(0,0,0,0.4)'
    }}>
      {/* Logo */}
      <div className="p-5" style={{ borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src="/logo.png"
            alt="LuxuryStay"
            className="h-30 w-auto transition-all duration-300 group-hover:scale-105"
            style={{ filter: 'drop-shadow(0 0 8px rgba(201,168,76,0.4))' }}
          />
        </Link>
        <div className="mt-3 px-1">
          <span className="text-[10px] font-medium tracking-[0.25em] uppercase"
            style={{ color: 'rgba(201,168,76,0.7)', fontFamily: 'DM Sans, sans-serif' }}>
            Admin Portal
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] px-3 mb-3"
          style={{ color: 'rgba(248,244,239,0.25)', fontFamily: 'DM Sans, sans-serif' }}>
          Main Menu
        </p>
        <ul className="space-y-0.5">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden"
                  style={{
                    color: isActive ? '#C9A84C' : 'rgba(248,244,239,0.55)',
                    background: isActive ? 'rgba(201,168,76,0.12)' : 'transparent',
                    border: isActive ? '1px solid rgba(201,168,76,0.2)' : '1px solid transparent',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'rgba(248,244,239,0.04)'
                      e.currentTarget.style.color = 'rgba(248,244,239,0.9)'
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = 'rgba(248,244,239,0.55)'
                    }
                  }}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                      style={{ background: '#C9A84C' }} />
                  )}
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1" style={{ fontFamily: 'DM Sans, sans-serif' }}>{item.label}</span>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User Info + Actions */}
      <div className="p-3" style={{ borderTop: '1px solid rgba(201,168,76,0.1)' }}>
        {/* Admin user info */}
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1"
          style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.1)' }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #C9A84C, #E8C97A)', color: '#0A0A0A', fontFamily: 'DM Sans, sans-serif' }}>
            {(user?.firstName?.[0] || 'A')}{(user?.lastName?.[0] || '')}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: '#F8F4EF', fontFamily: 'DM Sans, sans-serif' }}>{user?.firstName} {user?.lastName}</p>
            <p className="text-xs truncate" style={{ color: 'rgba(248,244,239,0.4)', fontFamily: 'DM Sans, sans-serif' }}>{user?.email}</p>
          </div>
        </div>
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
          style={{ color: 'rgba(248,244,239,0.5)', fontFamily: 'DM Sans, sans-serif' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,244,239,0.04)'; e.currentTarget.style.color = 'rgba(248,244,239,0.8)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(248,244,239,0.5)' }}
        >
          <Home className="w-4 h-4" />
          Back to Website
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-left"
          style={{ color: '#f87171', fontFamily: 'DM Sans, sans-serif' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  )
}

