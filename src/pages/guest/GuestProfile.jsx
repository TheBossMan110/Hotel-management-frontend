import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Phone, MapPin, Key, CalendarDays, CreditCard, Star, Edit3, Save, X, Eye, EyeOff, LogOut, ChevronRight } from 'lucide-react'
import useAuthStore from '../../stores/authStore'

export default function GuestProfile() {
  const { user, updateProfile, updatePassword, logout } = useAuthStore()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [toast, setToast] = useState(null) // { type: 'success'|'error', msg }
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  })

  // Resync formData whenever user changes (after login, register, or profile update)
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName || prev.firstName,
        lastName: user.lastName || prev.lastName,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }))
    }
  }, [user])

  // Password form
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' })
  const [showPw, setShowPw] = useState({})
  const [pwSaving, setPwSaving] = useState(false)

  // Get bookings from localStorage
  const [bookings, setBookings] = useState([])
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('guest-bookings') || '[]')
      setBookings(stored)
    } catch { setBookings([]) }
  }, [])

  const showToast = (type, msg) => {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 4000)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const result = await updateProfile(formData)
      if (result.success) {
        showToast('success', 'Profile updated successfully!')
        setIsEditing(false)
      } else {
        showToast('error', result.error || 'Failed to update profile')
      }
    } catch {
      showToast('error', 'Something went wrong')
    }
    setIsSaving(false)
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (pwForm.newPw.length < 8) return showToast('error', 'Password must be at least 8 characters')
    if (pwForm.newPw !== pwForm.confirm) return showToast('error', 'Passwords do not match')
    setPwSaving(true)
    try {
      const result = await updatePassword(pwForm.current, pwForm.newPw)
      if (result.success) {
        showToast('success', 'Password updated!')
        setPwForm({ current: '', newPw: '', confirm: '' })
      } else { showToast('error', result.error || 'Failed to update password') }
    } catch { showToast('error', 'Something went wrong') }
    setPwSaving(false)
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const initials = (user?.firstName?.[0] || '') + (user?.lastName?.[0] || '') || 'U'
  const joinDate = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : 'New'

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'bookings', label: 'Bookings' },
    { id: 'settings', label: 'Settings' },
    { id: 'security', label: 'Security' },
  ]

  const totalSpent = bookings.reduce((s, b) => s + (b.totalAmount || 0), 0)

  return (
    <div className="min-h-screen" style={{ background: '#0A0A0A', color: '#F8F4EF' }}>
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 animate-slideDown">
          <div className="px-5 py-3 rounded-xl text-sm font-body shadow-2xl flex items-center gap-2"
            style={{
              background: toast.type === 'success' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
              border: `1px solid ${toast.type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
              color: toast.type === 'success' ? '#4ade80' : '#f87171'
            }}>
            {toast.type === 'success' ? '✓' : '⚠'} {toast.msg}
          </div>
        </div>
      )}

      {/* Hero Header */}
      <div className="pt-24 pb-8 px-6" style={{ background: 'linear-gradient(180deg, #111111 0%, #0A0A0A 100%)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full flex items-center justify-center flex-shrink-0 shadow-xl"
              style={{ background: 'linear-gradient(135deg, #C9A84C, #E8C97A)', boxShadow: '0 0 40px rgba(201,168,76,0.2)' }}>
              <span className="font-display text-3xl font-light" style={{ color: '#0A0A0A' }}>{initials}</span>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="font-display font-light text-3xl" style={{ color: '#F8F4EF' }}>
                {user?.firstName} {user?.lastName}
              </h1>
              <p className="font-body text-sm mt-1" style={{ color: 'rgba(248,244,239,0.45)' }}>{user?.email}</p>
              <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
                <span className="text-[10px] font-body uppercase tracking-widest px-3 py-1 rounded-full"
                  style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)', color: '#C9A84C' }}>
                  Guest
                </span>
                <span className="text-[10px] font-body uppercase tracking-widest px-3 py-1 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(248,244,239,0.5)' }}>
                  Member since {joinDate}
                </span>
              </div>
            </div>
            <button onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-body tracking-widest uppercase transition-all"
              style={{ border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-16 z-20" style={{ background: '#0A0A0A', borderBottom: '1px solid #1A1A1A' }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex gap-1 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="px-5 py-3 text-sm font-body whitespace-nowrap transition-all relative"
                style={{ color: activeTab === tab.id ? '#C9A84C' : 'rgba(248,244,239,0.4)' }}>
                {tab.label}
                {activeTab === tab.id && <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full" style={{ background: '#C9A84C' }} />}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Total Bookings', value: bookings.length, icon: CalendarDays },
                { label: 'Total Spent', value: `PKR ${totalSpent.toLocaleString('en-PK')}`, icon: CreditCard },
                { label: 'Loyalty Points', value: user?.loyaltyPoints || 0, icon: Star },
              ].map(stat => (
                <div key={stat.label} className="p-5 rounded-2xl transition-all"
                  style={{ background: '#111111', border: '1px solid #1A1A1A' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(201,168,76,0.1)' }}>
                      <stat.icon className="w-4 h-4" style={{ color: '#C9A84C' }} />
                    </div>
                    <span className="text-xs font-body uppercase tracking-widest" style={{ color: 'rgba(248,244,239,0.4)' }}>{stat.label}</span>
                  </div>
                  <p className="font-display text-2xl" style={{ color: '#F8F4EF' }}>{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link to="/rooms" className="group p-5 rounded-2xl flex items-center gap-4 transition-all"
                style={{ background: '#111111', border: '1px solid #1A1A1A' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.3)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#1A1A1A' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(201,168,76,0.08)' }}>
                  <CalendarDays className="w-5 h-5" style={{ color: '#C9A84C' }} />
                </div>
                <div className="flex-1">
                  <p className="font-body text-sm font-medium" style={{ color: '#F8F4EF' }}>Book a Room</p>
                  <p className="text-xs font-body" style={{ color: 'rgba(248,244,239,0.4)' }}>Browse available rooms</p>
                </div>
                <ChevronRight className="w-4 h-4" style={{ color: '#C9A84C' }} />
              </Link>
              <Link to="/guest/bookings" className="group p-5 rounded-2xl flex items-center gap-4 transition-all"
                style={{ background: '#111111', border: '1px solid #1A1A1A' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.3)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#1A1A1A' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(201,168,76,0.08)' }}>
                  <CreditCard className="w-5 h-5" style={{ color: '#C9A84C' }} />
                </div>
                <div className="flex-1">
                  <p className="font-body text-sm font-medium" style={{ color: '#F8F4EF' }}>View Bookings</p>
                  <p className="text-xs font-body" style={{ color: 'rgba(248,244,239,0.4)' }}>Check status & invoices</p>
                </div>
                <ChevronRight className="w-4 h-4" style={{ color: '#C9A84C' }} />
              </Link>
            </div>

            {/* Recent Bookings */}
            <div className="rounded-2xl overflow-hidden" style={{ background: '#111111', border: '1px solid #1A1A1A' }}>
              <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #1A1A1A' }}>
                <h3 className="font-display text-lg" style={{ color: '#F8F4EF' }}>Recent Bookings</h3>
                <Link to="/guest/bookings" className="text-xs font-body" style={{ color: '#C9A84C' }}>View All →</Link>
              </div>
              {bookings.length > 0 ? (
                <div className="divide-y" style={{ borderColor: '#1A1A1A' }}>
                  {bookings.slice(0, 3).map((b, i) => (
                    <div key={i} className="px-5 py-4 flex items-center justify-between">
                      <div>
                        <p className="font-body text-sm font-medium" style={{ color: '#F8F4EF' }}>{b.roomName || 'Hotel Room'}</p>
                        <p className="text-xs font-body mt-0.5" style={{ color: 'rgba(248,244,239,0.4)' }}>
                          {b.confirmationNumber || `GH-${i + 1}`} • {b.nights || 1} night{(b.nights || 1) > 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-display text-sm" style={{ color: '#C9A84C' }}>PKR {(b.totalAmount || 0).toLocaleString('en-PK')}</p>
                        <span className="text-[10px] font-body uppercase px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(34,197,94,0.1)', color: '#4ade80' }}>Confirmed</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-5 py-12 text-center">
                  <CalendarDays className="w-10 h-10 mx-auto mb-3" style={{ color: 'rgba(248,244,239,0.15)' }} />
                  <p className="text-sm font-body" style={{ color: 'rgba(248,244,239,0.4)' }}>No bookings yet</p>
                  <Link to="/rooms" className="inline-block mt-3 text-xs font-body px-4 py-2 rounded-lg" style={{ background: 'rgba(201,168,76,0.1)', color: '#C9A84C' }}>
                    Browse Rooms
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── BOOKINGS TAB ── */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            <h2 className="font-display text-xl" style={{ color: '#F8F4EF' }}>All Bookings</h2>
            {bookings.length > 0 ? bookings.map((b, i) => (
              <div key={i} className="p-5 rounded-2xl" style={{ background: '#111111', border: '1px solid #1A1A1A' }}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(201,168,76,0.1)', color: '#C9A84C' }}>
                        {b.confirmationNumber || `GH-${i + 1}`}
                      </span>
                      <span className="text-[10px] font-body uppercase px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(34,197,94,0.1)', color: '#4ade80' }}>Confirmed</span>
                    </div>
                    <h4 className="font-display text-lg" style={{ color: '#F8F4EF' }}>{b.roomName || 'Hotel Room'}</h4>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-xl" style={{ color: '#C9A84C' }}>PKR {(b.totalAmount || 0).toLocaleString('en-PK')}</p>
                    <p className="text-xs font-body" style={{ color: 'rgba(248,244,239,0.4)' }}>{b.nights || 1} night{(b.nights || 1) > 1 ? 's' : ''}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4" style={{ borderTop: '1px solid #1A1A1A' }}>
                  {[
                    { l: 'Check-in', v: b.checkIn ? new Date(b.checkIn).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '—' },
                    { l: 'Check-out', v: b.checkOut ? new Date(b.checkOut).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '—' },
                    { l: 'Guests', v: b.guests || 1 },
                    { l: 'Booked', v: b.bookedAt ? new Date(b.bookedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'Today' },
                  ].map(d => (
                    <div key={d.l}>
                      <p className="text-[10px] font-body uppercase tracking-widest" style={{ color: 'rgba(248,244,239,0.3)' }}>{d.l}</p>
                      <p className="text-sm font-body mt-0.5" style={{ color: '#F8F4EF' }}>{d.v}</p>
                    </div>
                  ))}
                </div>
              </div>
            )) : (
              <div className="py-16 text-center rounded-2xl" style={{ background: '#111111', border: '1px solid #1A1A1A' }}>
                <CalendarDays className="w-12 h-12 mx-auto mb-4" style={{ color: 'rgba(248,244,239,0.1)' }} />
                <p className="font-body text-sm" style={{ color: 'rgba(248,244,239,0.4)' }}>No bookings yet. Start your luxury experience!</p>
                <Link to="/rooms" className="btn-gold inline-block mt-4 px-6 py-2.5 rounded-xl text-xs font-body tracking-widest uppercase">
                  Browse Rooms
                </Link>
              </div>
            )}
          </div>
        )}

        {/* ── SETTINGS TAB ── */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl" style={{ color: '#F8F4EF' }}>Personal Information</h2>
              {!isEditing ? (
                <button onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-body tracking-widest uppercase transition-all"
                  style={{ border: '1px solid rgba(201,168,76,0.4)', color: '#C9A84C' }}>
                  <Edit3 className="w-3.5 h-3.5" /> Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={handleSave} disabled={isSaving}
                    className="btn-gold flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-body tracking-widest uppercase disabled:opacity-50">
                    <Save className="w-3.5 h-3.5" /> {isSaving ? 'Saving...' : 'Save'}
                  </button>
                  <button onClick={() => { setIsEditing(false); setFormData({ firstName: user?.firstName || '', lastName: user?.lastName || '', email: user?.email || '', phone: user?.phone || '' }) }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-body tracking-widest uppercase"
                    style={{ border: '1px solid #2A2A2A', color: 'rgba(248,244,239,0.5)' }}>
                    <X className="w-3.5 h-3.5" /> Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="rounded-2xl p-6" style={{ background: '#111111', border: '1px solid #1A1A1A' }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[
                  { label: 'First Name', key: 'firstName', icon: User, type: 'text' },
                  { label: 'Last Name', key: 'lastName', icon: User, type: 'text' },
                  { label: 'Email Address', key: 'email', icon: Mail, type: 'email' },
                  { label: 'Phone Number', key: 'phone', icon: Phone, type: 'tel' },
                ].map(field => (
                  <div key={field.key}>
                    <label className="block text-xs font-body tracking-widest uppercase mb-2" style={{ color: '#C9A84C' }}>
                      {field.label}
                    </label>
                    <div className="relative">
                      <field.icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: isEditing ? '#C9A84C' : 'rgba(248,244,239,0.2)' }} />
                      <input
                        type={field.type}
                        value={formData[field.key]}
                        onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                        disabled={!isEditing || field.key === 'email'}
                        className="luxury-input w-full h-11 pl-10 pr-3 text-sm font-body disabled:opacity-50"
                        style={!isEditing ? { cursor: 'default' } : {}}
                      />
                    </div>
                    {field.key === 'email' && <p className="text-[10px] font-body mt-1" style={{ color: 'rgba(248,244,239,0.25)' }}>Email cannot be changed</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── SECURITY TAB ── */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <h2 className="font-display text-xl" style={{ color: '#F8F4EF' }}>Change Password</h2>
            <form onSubmit={handlePasswordChange} className="rounded-2xl p-6 max-w-lg" style={{ background: '#111111', border: '1px solid #1A1A1A' }}>
              <div className="space-y-4">
                {[
                  { label: 'Current Password', key: 'current' },
                  { label: 'New Password', key: 'newPw' },
                  { label: 'Confirm New Password', key: 'confirm' },
                ].map(field => (
                  <div key={field.key}>
                    <label className="block text-xs font-body tracking-widest uppercase mb-2" style={{ color: '#C9A84C' }}>{field.label}</label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#C9A84C' }} />
                      <input
                        type={showPw[field.key] ? 'text' : 'password'}
                        value={pwForm[field.key]}
                        onChange={e => setPwForm({ ...pwForm, [field.key]: e.target.value })}
                        required
                        className="luxury-input w-full h-11 pl-10 pr-12 text-sm font-body"
                      />
                      <button type="button" onClick={() => setShowPw({ ...showPw, [field.key]: !showPw[field.key] })}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1" style={{ color: '#C9A84C' }}>
                        {showPw[field.key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button type="submit" disabled={pwSaving}
                className="btn-gold w-full mt-6 py-3 rounded-xl text-xs font-body tracking-widest uppercase disabled:opacity-50">
                {pwSaving ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
