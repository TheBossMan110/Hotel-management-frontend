import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, Check, X } from 'lucide-react'
// Uses the EXISTING auth store — do NOT rebuild authentication logic
import useAuthStore from '../../stores/authStore'

const HOTEL_IMAGE = 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80'

// ── Password strength rules ──
const PASSWORD_RULES = [
  { key: 'length', label: 'At least 8 characters', test: (pw) => pw.length >= 8 },
  { key: 'upper', label: 'At least 1 uppercase letter (A-Z)', test: (pw) => /[A-Z]/.test(pw) },
  { key: 'lower', label: 'At least 1 lowercase letter (a-z)', test: (pw) => /[a-z]/.test(pw) },
  { key: 'number', label: 'At least 1 number (0-9)', test: (pw) => /[0-9]/.test(pw) },
  { key: 'special', label: 'At least 1 special character (!@#$%^&*)', test: (pw) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw) },
]

export default function RegisterPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  // Connect to EXISTING auth store
  const { register, isLoading, error, isAuthenticated, user, clearError } = useAuthStore()
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: ''
  })
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [validationError, setValidationError] = useState('')
  const [passwordTouched, setPasswordTouched] = useState(false)
  const returnUrl = searchParams.get('returnUrl')

  // BUG 3 FIX: Redirect to home page (/) after registration, not /guest or /profile
  useEffect(() => {
    if (isAuthenticated && user) navigate(returnUrl ? decodeURIComponent(returnUrl) : '/')
  }, [isAuthenticated, user])

  useEffect(() => { clearError() }, [clearError])

  // Compute password rule results
  const passwordResults = PASSWORD_RULES.map(rule => ({
    ...rule,
    passed: rule.test(form.password)
  }))
  const allPasswordRulesPassed = passwordResults.every(r => r.passed)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setValidationError('')
    if (!form.email.includes('@') || !form.email.includes('.')) {
      setValidationError('Please enter a valid email address (e.g. name@example.com)'); return
    }
    // BUG 1 FIX: Block submission if any password rule fails
    if (!allPasswordRulesPassed) {
      setPasswordTouched(true)
      setValidationError('Please fix the password requirements listed below'); return
    }
    if (form.password !== form.confirmPassword) {
      setValidationError('Passwords do not match. Please re-enter your password carefully'); return
    }
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setValidationError('Please enter your first and last name'); return
    }
    const result = await register({
      firstName: form.firstName, lastName: form.lastName,
      email: form.email, phone: form.phone, password: form.password,
    })
    // BUG 3 FIX: Redirect to home page after successful registration
    if (result.success) navigate(returnUrl ? decodeURIComponent(returnUrl) : '/')
  }

  // BUG 2 FIX: Show specific error message for duplicate email
  const getDisplayError = () => {
    if (validationError) return validationError
    if (!error) return null
    // Check for duplicate email error from backend
    const e = error.toLowerCase()
    if (e.includes('email already') || e.includes('already exists') || e.includes('already registered')) {
      return null // Will show special duplicate email UI below
    }
    return error
  }

  const isDuplicateEmailError = error && (
    error.toLowerCase().includes('email already') ||
    error.toLowerCase().includes('already exists') ||
    error.toLowerCase().includes('already registered')
  )

  return (
    <div className="min-h-screen flex" style={{ background: '#0A0A0A' }}>
      {/* LEFT — Hotel Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img src={HOTEL_IMAGE} alt="Grand Azure Hotel" className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(10,10,10,0.7) 0%, rgba(10,10,10,0.4) 100%)' }} />
        <div className="absolute inset-0 flex flex-col justify-end p-12">
          <p className="text-xs font-body tracking-[0.3em] uppercase mb-4" style={{ color: '#C9A84C' }}>Grand Azure Hotel</p>
          <h2 className="font-display font-light text-4xl mb-6" style={{ color: '#F8F4EF', lineHeight: '1.2' }}>
            Join Us<br />Today
          </h2>
          <div className="mb-8" style={{ width: 48, height: 1, background: '#C9A84C' }} />
          <p className="font-body text-sm italic leading-relaxed mb-8" style={{ color: 'rgba(248,244,239,0.65)' }}>
            &ldquo;Luxury is not a necessity to me, but beautiful and good things are.&rdquo;
            <br /><span style={{ color: '#C9A84C' }}>— Coco Chanel</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {['Member Rewards', 'Exclusive Rates', 'Priority Service'].map(text => (
              <span key={text} className="text-xs font-body px-3 py-1.5 rounded-full"
                style={{ background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)', color: '#C9A84C' }}>
                {text}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT — Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 overflow-y-auto" style={{ background: '#0A0A0A' }}>
        <div className="w-full max-w-sm">
          <Link to="/" className="block text-center ">
            <img src="/logo.png" alt="LuxuryStay Hospitality" className="h-25 w-auto mx-auto"
              style={{ filter: 'drop-shadow(0 0 10px rgba(201,168,76,0.3))' }} />
          </Link>

          <h2 className="font-display font-light text-3xl text-center" style={{ color: '#F8F4EF' }}>Create Account</h2>
          <p className="text-xs font-body text-center mb-8" style={{ color: 'rgba(248,244,239,0.45)' }}>
            {returnUrl ? 'Create an account to complete your booking' : 'Join Grand Azure for exclusive benefits'}
          </p>

          {/* General errors */}
          {getDisplayError() && (
            <div className="mb-4 p-3 rounded-xl text-sm font-body" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
              {getDisplayError()}
            </div>
          )}

          {/* BUG 2 FIX: Specific duplicate email error with link to login */}
          {isDuplicateEmailError && (
            <div className="mb-4 p-3 rounded-xl text-sm font-body" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
              <p className="mb-1">An account with this email already exists.</p>
              <Link to={returnUrl ? `/login?returnUrl=${returnUrl}` : '/login'}
                className="font-medium underline hover:opacity-80 transition-opacity" style={{ color: '#C9A84C' }}>
                Please log in instead →
              </Link>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'First Name', key: 'firstName', placeholder: 'John', autoComplete: 'given-name' },
                { label: 'Last Name', key: 'lastName', placeholder: 'Doe', autoComplete: 'family-name' },
              ].map(({ label, key, placeholder, autoComplete }) => (
                <div key={key}>
                  <label className="block text-xs font-body tracking-widest uppercase mb-2" style={{ color: '#C9A84C' }}>{label}</label>
                  <input type="text" required autoComplete={autoComplete} placeholder={placeholder}
                    value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                    className="luxury-input w-full h-11 px-4 text-sm font-body" />
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-body tracking-widest uppercase mb-2" style={{ color: '#C9A84C' }}>Email Address</label>
              <input type="email" required autoComplete="email" placeholder="you@example.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                className="luxury-input w-full h-11 px-4 text-sm font-body" />
            </div>

            <div>
              <label className="block text-xs font-body tracking-widest uppercase mb-2" style={{ color: '#C9A84C' }}>Phone Number</label>
              <input type="tel" autoComplete="tel" placeholder="+92 300 0000000"
                value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                className="luxury-input w-full h-11 px-4 text-sm font-body" />
            </div>

            {/* Password field with inline validation */}
            <div>
              <label className="block text-xs font-body tracking-widest uppercase mb-2" style={{ color: '#C9A84C' }}>Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} required autoComplete="new-password" placeholder="Strong password"
                  value={form.password}
                  onChange={e => { setForm({ ...form, password: e.target.value }); setPasswordTouched(true) }}
                  onBlur={() => setPasswordTouched(true)}
                  className="luxury-input w-full h-11 px-4 pr-12 text-sm font-body" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded transition-all"
                  style={{ color: '#C9A84C' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#E8C97A' }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#C9A84C' }}>
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* BUG 1 FIX: Real-time password strength checklist — shows on input change AND blur */}
              {(passwordTouched || form.password.length > 0) && (
                <div className="mt-2 space-y-1">
                  {passwordResults.map(rule => (
                    <div key={rule.key} className="flex items-center gap-2">
                      {rule.passed
                        ? <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#4ade80' }} />
                        : <X className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#f87171' }} />
                      }
                      <span className="text-[11px] font-body" style={{ color: rule.passed ? '#4ade80' : '#f87171' }}>
                        {rule.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-body tracking-widest uppercase mb-2" style={{ color: '#C9A84C' }}>Confirm Password</label>
              <div className="relative">
                <input type={showConfirm ? 'text' : 'password'} required autoComplete="new-password" placeholder="Confirm your password"
                  value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                  className="luxury-input w-full h-11 px-4 pr-12 text-sm font-body" />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded transition-all"
                  style={{ color: '#C9A84C' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#E8C97A' }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#C9A84C' }}>
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {form.confirmPassword && form.password !== form.confirmPassword && (
                <p className="text-[11px] mt-1 font-body" style={{ color: '#f87171' }}>Passwords do not match</p>
              )}
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" required className="mt-0.5" style={{ accentColor: '#C9A84C' }} />
              <span className="text-xs font-body leading-relaxed" style={{ color: 'rgba(248,244,239,0.5)' }}>
                I agree to the{' '}
                <Link to="/terms" className="hover:opacity-70 transition-opacity" style={{ color: '#C9A84C' }}>Terms of Service</Link>
                {' '}and{' '}
                <Link to="/privacy" className="hover:opacity-70 transition-opacity" style={{ color: '#C9A84C' }}>Privacy Policy</Link>
              </span>
            </label>

            <button type="submit" disabled={isLoading}
              className="btn-gold w-full h-12 rounded-xl text-xs tracking-widest uppercase font-body disabled:opacity-50">
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Creating Account…
                </span>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-xs font-body mt-6" style={{ color: 'rgba(248,244,239,0.4)' }}>
            Already have an account?{' '}
            <Link to={returnUrl ? `/login?returnUrl=${returnUrl}` : '/login'}
              className="font-medium hover:opacity-70 transition-opacity" style={{ color: '#C9A84C' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
