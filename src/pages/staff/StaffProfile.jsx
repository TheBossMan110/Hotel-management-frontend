import { useState, useEffect } from 'react'
import useAuthStore from '../../stores/authStore'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { User, Mail, Phone, Briefcase, Save, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react'

export default function StaffProfile() {
  const { user, updateProfile, changePassword, isLoading } = useAuthStore()

  const isManager = user?.email === 'manager@grandazure.pk'

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  })

  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' })
  const [showPw, setShowPw] = useState({})
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [pwSuccess, setPwSuccess] = useState(false)
  const [pwError, setPwError] = useState('')

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

  const handleSave = async () => {
    const result = await updateProfile({ firstName: formData.firstName, lastName: formData.lastName, phone: formData.phone })
    if (result?.success !== false) {
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    }
  }

  const handlePasswordChange = async () => {
    setPwError('')
    if (!pwForm.current || !pwForm.newPw) { setPwError('Please fill all fields.'); return }
    if (pwForm.newPw.length < 6) { setPwError('New password must be at least 6 chars.'); return }
    if (pwForm.newPw !== pwForm.confirm) { setPwError('Passwords do not match.'); return }
    const result = await changePassword(pwForm.current, pwForm.newPw)
    if (result?.success !== false) {
      setPwSuccess(true)
      setPwForm({ current: '', newPw: '', confirm: '' })
      setTimeout(() => setPwSuccess(false), 3000)
    } else {
      setPwError(result?.error || 'Failed to change password')
    }
  }

  const initials = `${user?.firstName?.[0] || 'S'}${user?.lastName?.[0] || ''}`

  const inputStyle = {
    background: '#1A1A1A',
    border: '1px solid rgba(201,168,76,0.2)',
    borderRadius: '0.75rem',
    color: '#F8F4EF',
    padding: '0.625rem 1rem',
    fontSize: '0.875rem',
    width: '100%',
    outline: 'none',
    fontFamily: 'DM Sans, sans-serif',
    transition: 'border-color 0.2s ease',
  }

  const labelStyle = {
    display: 'block',
    fontSize: '0.7rem',
    fontWeight: '600',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'rgba(201,168,76,0.8)',
    marginBottom: '0.375rem',
    fontFamily: 'DM Sans, sans-serif',
  }

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-light" style={{ color: '#F8F4EF' }}>My Profile</h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(248,244,239,0.45)', fontFamily: 'DM Sans, sans-serif' }}>View and update your account details</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar Card */}
        <Card>
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold mb-4"
              style={{ background: 'linear-gradient(135deg, #C9A84C, #E8C97A)', color: '#0A0A0A' }}>
              {initials}
            </div>
            <h2 className="text-xl font-display font-light" style={{ color: '#F8F4EF' }}>
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-sm mt-1" style={{ color: 'rgba(248,244,239,0.45)', fontFamily: 'DM Sans, sans-serif' }}>{user?.email}</p>
            <span className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full text-xs font-medium"
              style={{ background: 'rgba(201,168,76,0.12)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.25)' }}>
              <Briefcase className="w-3 h-3" />
              {isManager ? 'General Manager' : (user?.department?.replace(/-/g, ' ') || 'Staff Member')}
            </span>

            <div className="w-full mt-6 pt-5" style={{ borderTop: '1px solid rgba(201,168,76,0.1)' }}>
              <div className="flex flex-col gap-3 text-sm text-left" style={{ color: 'rgba(248,244,239,0.6)', fontFamily: 'DM Sans, sans-serif' }}>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 flex-shrink-0" style={{ color: '#C9A84C' }} />
                  <span className="truncate">{user?.email}</span>
                </div>
                {user?.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 flex-shrink-0" style={{ color: '#C9A84C' }} />
                    <span>{user.phone}</span>
                  </div>
                )}
                {user?.shift && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 flex-shrink-0" style={{ color: '#C9A84C' }} />
                    <span className="capitalize">Shift: {user.shift}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Form */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label style={labelStyle}>First Name</label>
                  <input
                    style={inputStyle}
                    value={formData.firstName}
                    onChange={e => setFormData(p => ({ ...p, firstName: e.target.value }))}
                    onFocus={e => { e.target.style.borderColor = '#C9A84C'; e.target.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.1)' }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(201,168,76,0.2)'; e.target.style.boxShadow = 'none' }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Last Name</label>
                  <input
                    style={inputStyle}
                    value={formData.lastName}
                    onChange={e => setFormData(p => ({ ...p, lastName: e.target.value }))}
                    onFocus={e => { e.target.style.borderColor = '#C9A84C'; e.target.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.1)' }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(201,168,76,0.2)'; e.target.style.boxShadow = 'none' }}
                  />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Email Address</label>
                <input style={{ ...inputStyle, opacity: 0.6, cursor: 'not-allowed' }} value={formData.email} readOnly />
              </div>
              <div>
                <label style={labelStyle}>Phone Number</label>
                <input
                  style={inputStyle}
                  value={formData.phone}
                  onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                  placeholder="+1 (555) 000-0000"
                  onFocus={e => { e.target.style.borderColor = '#C9A84C'; e.target.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.1)' }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(201,168,76,0.2)'; e.target.style.boxShadow = 'none' }}
                />
              </div>

              {saveSuccess && (
                <div className="flex items-center gap-2 p-3 rounded-xl text-sm" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#4ade80' }}>
                  <CheckCircle className="w-4 h-4" /> Profile updated successfully!
                </div>
              )}

              <div className="flex justify-end">
                <Button onClick={handleSave} loading={isLoading}>
                  <Save className="w-4 h-4 mr-2" /> Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {['current', 'newPw', 'confirm'].map((field) => (
                <div key={field}>
                  <label style={labelStyle}>
                    {field === 'current' ? 'Current Password' : field === 'newPw' ? 'New Password' : 'Confirm New Password'}
                  </label>
                  <div className="relative">
                    <input
                      type={showPw[field] ? 'text' : 'password'}
                      style={{ ...inputStyle, paddingRight: '2.75rem' }}
                      value={pwForm[field]}
                      onChange={e => setPwForm(p => ({ ...p, [field]: e.target.value }))}
                      onFocus={e => { e.target.style.borderColor = '#C9A84C'; e.target.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.1)' }}
                      onBlur={e => { e.target.style.borderColor = 'rgba(201,168,76,0.2)'; e.target.style.boxShadow = 'none' }}
                    />
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: '#C9A84C' }}
                      onClick={() => setShowPw(p => ({ ...p, [field]: !p[field] }))}>
                      {showPw[field] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ))}

              {pwError && (
                <div className="p-3 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
                  ⚠ {pwError}
                </div>
              )}
              {pwSuccess && (
                <div className="flex items-center gap-2 p-3 rounded-xl text-sm" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#4ade80' }}>
                  <CheckCircle className="w-4 h-4" /> Password changed successfully!
                </div>
              )}

              <div className="flex justify-end">
                <Button variant="secondary" onClick={handlePasswordChange} loading={isLoading}>
                  <Lock className="w-4 h-4 mr-2" /> Update Password
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
