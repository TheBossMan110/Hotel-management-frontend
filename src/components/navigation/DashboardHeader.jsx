import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, LogOut, Settings, User, Menu, Mail, Building2, CalendarDays, Users, UserCog, X } from 'lucide-react'
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
      <header className="sticky top-0 z-40 animate-fadeIn" style={{
        background: 'rgba(10,10,10,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(201,168,76,0.12)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.3)'
      }}>
        <div className="flex items-center justify-between h-16 px-6">
          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden p-2 -ml-2 rounded-xl transition-all"
            style={{ color: 'rgba(248,244,239,0.6)' }}
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,168,76,0.08)'; e.currentTarget.style.color = '#C9A84C' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(248,244,239,0.6)' }}
          >
            {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Title */}
          <h1 className="font-display font-light text-lg hidden lg:block" style={{ color: '#F8F4EF', letterSpacing: '0.02em' }}>{title}</h1>

          {/* Search Bar with Live Dropdown */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-8" ref={searchRef}>
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#C9A84C' }} />
              <input
                type="text"
                placeholder="Search rooms, guests, bookings..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={e => {
                  if (searchResults.length > 0) setShowSearchDropdown(true)
                  e.currentTarget.style.borderColor = '#C9A84C'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.1)'
                }}
                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.2)'; e.currentTarget.style.boxShadow = 'none' }}
                className="w-full h-9 pl-10 pr-4 text-sm transition-all"
                style={{
                  background: '#1A1A1A',
                  border: '1px solid rgba(201,168,76,0.2)',
                  borderRadius: '0.75rem',
                  color: '#F8F4EF',
                  outline: 'none',
                  fontFamily: 'DM Sans, sans-serif'
                }}
              />

              {/* Search Dropdown */}
              {showSearchDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1.5 rounded-2xl shadow-2xl z-50 max-h-[400px] overflow-y-auto animate-slideDown"
                  style={{ background: '#111111', border: '1px solid rgba(201,168,76,0.2)' }}>
                  {searchLoading ? (
                    <div className="flex items-center justify-center py-6 gap-2">
                      <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#C9A84C', borderTopColor: 'transparent' }} />
                      <span className="text-sm" style={{ color: 'rgba(248,244,239,0.5)', fontFamily: 'DM Sans, sans-serif' }}>Searching...</span>
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="py-6 text-center text-sm" style={{ color: 'rgba(248,244,239,0.4)', fontFamily: 'DM Sans, sans-serif' }}>
                      No results for "{searchQuery}"
                    </div>
                  ) : (
                    Object.entries(groupedResults).map(([type, items]) => {
                      const Icon = typeIcons[type] || Search
                      return (
                        <div key={type}>
                          <div className="px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em]"
                            style={{ color: '#C9A84C', borderBottom: '1px solid rgba(201,168,76,0.08)', fontFamily: 'DM Sans, sans-serif' }}>
                            {typeLabels[type] || type}
                          </div>
                          {items.map((result) => (
                            <button
                              key={`${result.type}-${result.id}`}
                              className="w-full flex items-center gap-3 px-4 py-2.5 transition-all text-left"
                              style={{ color: 'rgba(248,244,239,0.7)' }}
                              onClick={() => handleResultClick(result)}
                              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,168,76,0.06)' }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                            >
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{ background: 'rgba(201,168,76,0.1)' }}>
                                <Icon className="w-4 h-4" style={{ color: '#C9A84C' }} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium truncate" style={{ color: '#F8F4EF', fontFamily: 'DM Sans, sans-serif' }}>{result.label}</p>
                                <p className="text-xs truncate capitalize" style={{ color: 'rgba(248,244,239,0.4)', fontFamily: 'DM Sans, sans-serif' }}>{result.sublabel}</p>
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
                className="relative p-2 rounded-xl transition-all"
                title="Compose Email"
                style={{ color: 'rgba(248,244,239,0.6)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,168,76,0.08)'; e.currentTarget.style.color = '#C9A84C' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(248,244,239,0.6)' }}
              >
                <Mail className="w-5 h-5" />
              </button>
            )}

            {/* Notifications */}
            <NotificationBell />

            {/* User Menu */}
            <div className="relative ml-2">
              <button
                className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl transition-all"
                style={{ border: '1px solid rgba(201,168,76,0.2)' }}
                onClick={() => setShowUserMenu(!showUserMenu)}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,168,76,0.08)'; e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)' }}
                onMouseLeave={e => { if (!showUserMenu) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(201,168,76,0.2)' } }}
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #C9A84C, #E8C97A)', color: '#0A0A0A', fontFamily: 'DM Sans, sans-serif' }}>
                  {(user?.firstName?.[0] || '')}{(user?.lastName?.[0] || '')}
                </div>
                <span className="hidden sm:block text-sm font-medium" style={{ color: '#F8F4EF', fontFamily: 'DM Sans, sans-serif' }}>
                  {`${user?.firstName || ''} ${user?.lastName || ''}`.trim()}
                </span>
              </button>

              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl shadow-2xl z-50 animate-slideDown overflow-hidden"
                    style={{ background: '#111111', border: '1px solid rgba(201,168,76,0.2)' }}>
                    <div className="p-4" style={{ borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
                      <p className="font-medium text-sm" style={{ color: '#F8F4EF', fontFamily: 'DM Sans, sans-serif' }}>
                        {`${user?.firstName || ''} ${user?.lastName || ''}`.trim()}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'rgba(248,244,239,0.4)', fontFamily: 'DM Sans, sans-serif' }}>{user?.email}</p>
                      <span className="inline-block mt-1.5 text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(201,168,76,0.12)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.25)', fontFamily: 'DM Sans, sans-serif' }}>
                        {user?.role}
                      </span>
                    </div>
                    <div className="py-1">
                      <Link
                        to={`/${user?.role}/profile`}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm transition-all"
                        style={{ color: 'rgba(248,244,239,0.7)', fontFamily: 'DM Sans, sans-serif' }}
                        onClick={() => setShowUserMenu(false)}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,168,76,0.06)'; e.currentTarget.style.color = '#C9A84C' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(248,244,239,0.7)' }}
                      >
                        <User className="w-4 h-4" />
                        Profile
                      </Link>
                      <Link
                        to={`/${user?.role}/settings`}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm transition-all"
                        style={{ color: 'rgba(248,244,239,0.7)', fontFamily: 'DM Sans, sans-serif' }}
                        onClick={() => setShowUserMenu(false)}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,168,76,0.06)'; e.currentTarget.style.color = '#C9A84C' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(248,244,239,0.7)' }}
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </Link>
                    </div>
                    <div style={{ borderTop: '1px solid rgba(201,168,76,0.1)' }}>
                      <button
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm transition-all text-left"
                        style={{ color: '#f87171', fontFamily: 'DM Sans, sans-serif' }}
                        onClick={handleLogout}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
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
