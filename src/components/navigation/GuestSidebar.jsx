import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  CalendarCheck,
  Receipt,
  User,
  MessageSquare,
  Home,
  ConciergeBell,
  ChevronRight
} from 'lucide-react'

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard',    href: '/guest' },
  { icon: CalendarCheck,   label: 'My Bookings',  href: '/guest/bookings' },
  { icon: ConciergeBell,   label: 'Services',     href: '/guest/services' },
  { icon: Receipt,         label: 'Invoices',     href: '/guest/invoices' },
  { icon: User,            label: 'Profile',      href: '/guest/profile' },
  { icon: MessageSquare,   label: 'Feedback',     href: '/guest/feedback' }
]

export default function GuestSidebar() {
  const location = useLocation()

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-72 hidden lg:flex flex-col" style={{
      background: 'linear-gradient(180deg, #0D0D0D 0%, #111111 100%)',
      borderRight: '1px solid rgba(201,168,76,0.15)',
      boxShadow: '4px 0 24px rgba(0,0,0,0.4)'
    }}>
      {/* Logo */}
      <div className="p-5" style={{ borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
        <Link to="/" className="flex items-center group">
          <img
            src="/logo.png"
            alt="LuxuryStay"
            className="h-20 w-auto transition-all duration-300 group-hover:scale-105"
            style={{ filter: 'drop-shadow(0 0 8px rgba(201,168,76,0.4))' }}
          />
        </Link>
        <div className="mt-3 px-1">
          <span className="text-[10px] font-medium tracking-[0.25em] uppercase"
            style={{ color: 'rgba(201,168,76,0.7)', fontFamily: 'DM Sans, sans-serif' }}>
            Guest Portal
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] px-3 mb-3"
          style={{ color: 'rgba(248,244,239,0.25)', fontFamily: 'DM Sans, sans-serif' }}>
          Navigation
        </p>
        <ul className="space-y-0.5">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative"
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

      {/* Back to Site */}
      <div className="p-3" style={{ borderTop: '1px solid rgba(201,168,76,0.1)' }}>
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
      </div>
    </aside>
  )
}
