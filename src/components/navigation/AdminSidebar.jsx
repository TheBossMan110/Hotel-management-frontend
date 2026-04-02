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
  BellRing
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
    <aside className="fixed left-0 top-0 bottom-0 w-72 bg-secondary text-secondary-foreground hidden lg:flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-secondary-foreground/10">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-serif font-bold text-lg">GH</span>
          </div>
          <div>
            <span className="font-serif text-lg font-semibold block">Grand Horizon</span>
            <span className="text-xs text-secondary-foreground/60">Admin Portal</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-secondary-foreground/70 hover:bg-secondary-foreground/10 hover:text-secondary-foreground'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User Info + Actions */}
      <div className="p-4 border-t border-secondary-foreground/10 space-y-2">
        {/* Admin user info */}
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-secondary-foreground/5">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
            {(user?.firstName?.[0] || 'A')}{(user?.lastName?.[0] || '')}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-secondary-foreground/50 truncate">{user?.email}</p>
          </div>
        </div>
        <Link
          to="/"
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-secondary-foreground/70 hover:bg-secondary-foreground/10 hover:text-secondary-foreground transition-colors"
        >
          <Home className="w-4 h-4" />
          Back to Website
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-400/10 transition-colors text-left"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  )
}

