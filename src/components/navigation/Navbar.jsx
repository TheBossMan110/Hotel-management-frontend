import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, User, LogIn, LogOut, CalendarDays, FileText, ChevronDown } from 'lucide-react'
import useAuthStore from '../../stores/authStore'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/rooms', label: 'Rooms' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' }
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useAuthStore()
  const dropdownRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Close mobile menu on route change
  useEffect(() => { setIsOpen(false); setProfileOpen(false) }, [location.pathname])

  const handleLogout = async () => {
    await logout()
    setProfileOpen(false)
    navigate('/')
  }

  const getInitials = () => {
    if (!user) return 'U'
    const first = user.firstName || user.name?.split(' ')[0] || ''
    const last = user.lastName || user.name?.split(' ')[1] || ''
    return (first[0] || '') + (last[0] || '') || 'U'
  }

  const isActive = (href) => location.pathname === href

  // Profile menu items based on role
  const getProfileLinks = () => {
    if (!user) return []
    if (user.role === 'admin') return [
      { href: '/admin', label: 'Admin Panel', icon: User },
    ]
    if (user.role === 'staff') return [
      { href: '/staff', label: 'Staff Panel', icon: User },
    ]
    // Guest
    return [
      { href: '/guest', label: 'My Profile', icon: User },
      { href: '/guest/bookings', label: 'My Bookings', icon: CalendarDays },
      { href: '/guest/services', label: 'Services', icon: FileText },
      { href: '/guest/invoices', label: 'Invoices', icon: FileText },
    ]
  }

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(10,10,10,0.95)' : 'rgba(10,10,10,0.7)',
        backdropFilter: 'blur(20px)',
        borderBottom: scrolled ? '1px solid rgba(201,168,76,0.2)' : '1px solid rgba(255,255,255,0.04)',
      }}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 group-hover:scale-105"
              style={{ background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.4)' }}
            >
              <span className="font-display font-light text-lg" style={{ color: '#C9A84C' }}>GH</span>
            </div>
            <div className="hidden sm:block">
              <span className="font-display font-light text-xl" style={{ color: '#F8F4EF', letterSpacing: '0.04em' }}>
                Grand Horizon
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="relative text-sm font-body tracking-wide transition-colors duration-200"
                style={{ color: isActive(link.href) ? '#C9A84C' : 'rgba(248,244,239,0.55)' }}
              >
                {link.label}
                {isActive(link.href) && (
                  <span className="absolute -bottom-1 left-0 right-0 h-px" style={{ background: '#C9A84C' }} />
                )}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                {/* Profile Avatar Button */}
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-xl transition-all duration-200"
                  style={{ border: '1px solid rgba(201,168,76,0.25)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,168,76,0.08)' }}
                  onMouseLeave={e => { if (!profileOpen) e.currentTarget.style.background = 'transparent' }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-body font-semibold"
                    style={{ background: 'linear-gradient(135deg, #C9A84C, #E8C97A)', color: '#0A0A0A' }}
                  >
                    {getInitials()}
                  </div>
                  <span className="text-xs font-body max-w-[80px] truncate" style={{ color: '#F8F4EF' }}>
                    {user?.firstName || user?.name?.split(' ')[0] || 'Profile'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 transition-transform" style={{ color: '#C9A84C', transform: profileOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
                </button>

                {/* Dropdown Menu */}
                {profileOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 w-56 rounded-xl overflow-hidden shadow-2xl animate-slideDown"
                    style={{ background: '#111111', border: '1px solid rgba(201,168,76,0.2)' }}
                  >
                    {/* User info header */}
                    <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
                      <p className="text-sm font-body font-medium" style={{ color: '#F8F4EF' }}>
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs font-body truncate" style={{ color: 'rgba(248,244,239,0.4)' }}>
                        {user?.email}
                      </p>
                      <span className="inline-block mt-1 text-[10px] font-body uppercase tracking-widest px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(201,168,76,0.12)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.25)' }}>
                        {user?.role}
                      </span>
                    </div>

                    {/* Links */}
                    <div className="py-1">
                      {getProfileLinks().map(link => (
                        <Link
                          key={link.href}
                          to={link.href}
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-body transition-all"
                          style={{ color: 'rgba(248,244,239,0.7)' }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,168,76,0.06)'; e.currentTarget.style.color = '#C9A84C' }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(248,244,239,0.7)' }}
                        >
                          <link.icon className="w-4 h-4" />
                          {link.label}
                        </Link>
                      ))}
                    </div>

                    {/* Logout */}
                    <div style={{ borderTop: '1px solid rgba(201,168,76,0.1)' }}>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-body transition-all text-left"
                        style={{ color: '#f87171' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.06)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login">
                  <button
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-body tracking-widest uppercase transition-all duration-200"
                    style={{ color: 'rgba(248,244,239,0.55)' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#F8F4EF' }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(248,244,239,0.55)' }}
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    Sign In
                  </button>
                </Link>
                <Link to="/booking">
                  <button className="btn-gold px-5 py-2 rounded-xl text-xs font-body tracking-widest uppercase">
                    Book Now
                  </button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 transition-colors"
            style={{ color: 'rgba(248,244,239,0.7)' }}
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden py-4 animate-slideDown" style={{ borderTop: '1px solid rgba(201,168,76,0.15)' }}>
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-base font-body py-2 transition-colors"
                  style={{ color: isActive(link.href) ? '#C9A84C' : 'rgba(248,244,239,0.55)' }}
                >
                  {link.label}
                </Link>
              ))}

              <div className="pt-3 flex flex-col gap-2" style={{ borderTop: '1px solid rgba(201,168,76,0.15)' }}>
                {isAuthenticated ? (
                  <>
                    {/* Mobile user info */}
                    <div className="flex items-center gap-3 py-2">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-body font-semibold"
                        style={{ background: 'linear-gradient(135deg, #C9A84C, #E8C97A)', color: '#0A0A0A' }}>
                        {getInitials()}
                      </div>
                      <div>
                        <p className="text-sm font-body font-medium" style={{ color: '#F8F4EF' }}>{user?.firstName} {user?.lastName}</p>
                        <p className="text-xs font-body" style={{ color: 'rgba(248,244,239,0.4)' }}>{user?.role}</p>
                      </div>
                    </div>
                    {getProfileLinks().map(link => (
                      <Link key={link.href} to={link.href}
                        className="flex items-center gap-2 py-2 text-sm font-body" style={{ color: 'rgba(248,244,239,0.6)' }}>
                        <link.icon className="w-4 h-4" style={{ color: '#C9A84C' }} />{link.label}
                      </Link>
                    ))}
                    <button onClick={handleLogout}
                      className="flex items-center gap-2 py-2 text-sm font-body text-left" style={{ color: '#f87171' }}>
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login">
                      <button className="w-full py-2.5 rounded-xl text-xs font-body tracking-widest uppercase"
                        style={{ border: '1px solid rgba(201,168,76,0.35)', color: '#C9A84C' }}>Sign In</button>
                    </Link>
                    <Link to="/booking">
                      <button className="btn-gold w-full py-2.5 rounded-xl text-xs font-body tracking-widest uppercase">Book Now</button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
