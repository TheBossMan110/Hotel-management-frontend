import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  CalendarCheck,
  Receipt,
  User,
  MessageSquare,
  Home,
  ConciergeBell
} from 'lucide-react'
import { cn } from '../../lib/utils'

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
    <aside className="fixed left-0 top-0 bottom-0 w-72 bg-secondary text-secondary-foreground hidden lg:flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-secondary-foreground/10">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-serif font-bold text-lg">GH</span>
          </div>
          <div>
            <span className="font-serif text-lg font-semibold block">Grand Horizon</span>
            <span className="text-xs text-secondary-foreground/60">Guest Portal</span>
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

      {/* Back to Site */}
      <div className="p-4 border-t border-secondary-foreground/10">
        <Link
          to="/"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-secondary-foreground/70 hover:bg-secondary-foreground/10 hover:text-secondary-foreground transition-colors"
        >
          <Home className="w-5 h-5" />
          Back to Website
        </Link>
      </div>
    </aside>
  )
}
