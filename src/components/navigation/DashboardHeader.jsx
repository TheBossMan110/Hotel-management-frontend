import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, LogOut, Settings, User, Menu, Mail, Building2, CalendarDays, Users, UserCog } from 'lucide-react'
import { cn } from '../../lib/utils'
import Avatar from '../ui/Avatar'
import NotificationBell from './NotificationBell'
import EmailComposer from '../ui/EmailComposer'
import useAuthStore from '../../stores/authStore'
import api from '../../lib/api'

const typeIcons = {
  room: Building2,
  guest: Users,
  staff: UserCog,
  booking: CalendarDays
}

const typeColors = {
  room: 'bg-blue-100 text-blue-600',
  guest: 'bg-green-100 text-green-600',
  staff: 'bg-purple-100 text-purple-600',
  booking: 'bg-amber-100 text-amber-600'
}

export default function DashboardHeader({ title }) {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showEmailComposer, setShowEmailComposer] = useState(false)
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  // ── Global Search State ──
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const searchRef = useRef(null)
  const debounceRef = useRef(null)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Debounced search
  const performSearch = useCallback(async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([])
      setShowSearchDropdown(false)
      return
    }
    setSearchLoading(true)
    setShowSearchDropdown(true)
    try {
      const { data } = await api.get('/users/search', { params: { q: query } })
      setSearchResults(data.results || [])
    } catch (err) {
      console.error('Search error:', err)
      setSearchResults([])
    } finally {
      setSearchLoading(false)
    }
  }, [])

  const handleSearchChange = (e) => {
    const val = e.target.value
    setSearchQuery(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => performSearch(val), 300)
  }

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleResultClick = (result) => {
    setShowSearchDropdown(false)
    setSearchQuery('')
    setSearchResults([])
    navigate(result.link)
  }

  // Group results by type
  const groupedResults = searchResults.reduce((acc, r) => {
    if (!acc[r.type]) acc[r.type] = []
    acc[r.type].push(r)
    return acc
  }, {})

  const typeLabels = { room: 'Rooms', guest: 'Guests', staff: 'Staff', booking: 'Bookings' }

  return (
    <>
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="flex items-center justify-between h-16 px-6">
          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Title */}
          <h1 className="font-semibold text-lg hidden lg:block">{title}</h1>

          {/* Search Bar with Live Dropdown */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-8" ref={searchRef}>
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search rooms, guests, bookings, staff..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => searchResults.length > 0 && setShowSearchDropdown(true)}
                className={cn(
                  'w-full h-9 pl-10 pr-4 rounded-md border border-input bg-background text-sm',
                  'focus:outline-none focus:ring-2 focus:ring-ring'
                )}
              />

              {/* Search Dropdown */}
              {showSearchDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-xl z-50 max-h-[400px] overflow-y-auto animate-scaleIn">
                  {searchLoading ? (
                    <div className="flex items-center justify-center py-6">
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      No results found for "{searchQuery}"
                    </div>
                  ) : (
                    Object.entries(groupedResults).map(([type, items]) => {
                      const Icon = typeIcons[type] || Search
                      return (
                        <div key={type}>
                          <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/50">
                            {typeLabels[type] || type}
                          </div>
                          {items.map((result) => (
                            <button
                              key={`${result.type}-${result.id}`}
                              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50 transition-colors text-left"
                              onClick={() => handleResultClick(result)}
                            >
                              <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', typeColors[type])}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium truncate">{result.label}</p>
                                <p className="text-xs text-muted-foreground truncate capitalize">{result.sublabel}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )
                    })
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Email Button (Admin only) */}
            {user?.role === 'admin' && (
              <button
                onClick={() => setShowEmailComposer(true)}
                className="relative p-2 text-muted-foreground hover:text-foreground transition-colors rounded-xl hover:bg-white/10"
                title="Compose Email"
              >
                <Mail className="w-5 h-5" />
              </button>
            )}

            {/* Notifications */}
            <NotificationBell />

            {/* User Menu */}
            <div className="relative ml-2">
              <button
                className="flex items-center gap-3 p-1 rounded-full hover:bg-muted transition-colors"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <Avatar name={`${user?.firstName || ''} ${user?.lastName || ''}`.trim()} size="sm" />
                <span className="hidden sm:block text-sm font-medium">{`${user?.firstName || ''} ${user?.lastName || ''}`.trim()}</span>
              </button>

              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-md shadow-lg z-50 animate-scaleIn">
                    <div className="p-3 border-b border-border">
                      <p className="font-medium text-sm">{`${user?.firstName || ''} ${user?.lastName || ''}`.trim()}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                    <div className="p-1">
                      <Link
                        to={`/${user?.role}/profile`}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-sm"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User className="w-4 h-4" />
                        Profile
                      </Link>
                      <Link
                        to={`/${user?.role}/settings`}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-sm"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </Link>
                    </div>
                    <div className="p-1 border-t border-border">
                      <button
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-sm"
                        onClick={handleLogout}
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Email Composer Modal */}
      <EmailComposer isOpen={showEmailComposer} onClose={() => setShowEmailComposer(false)} />
    </>
  )
}
