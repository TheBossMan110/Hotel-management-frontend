import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
// Uses the EXISTING auth store — do NOT rebuild authentication logic
import useAuthStore from '../../stores/authStore'

const HOTEL_IMAGE = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80'

export default function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  // Connect to EXISTING auth store — preserves role-based redirect logic
  const { login, isLoading, error, isAuthenticated, user, clearError } = useAuthStore()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const returnUrl = searchParams.get('returnUrl')

  useEffect(() => {
    if (isAuthenticated && user) redirectAfterLogin(user.role)
  }, [isAuthenticated, user])

  useEffect(() => { clearError() }, [clearError])

  const redirectAfterLogin = (role) => {
    if (returnUrl) { navigate(decodeURIComponent(returnUrl)); return }
    const routes = { admin: '/admin', staff: '/staff', guest: '/' }
    navigate(routes[role] || '/guest')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email.includes('@')) { return }
    const result = await login(form.email, form.password)
    if (result.success) redirectAfterLogin(result.user.role)
  }

  // Map raw API errors to user-friendly messages
  const friendlyError = (err) => {
    if (!err) return null
    const e = err.toLowerCase()
    if (e.includes('invalid') || e.includes('incorrect') || e.includes('wrong') || e.includes('credentials'))
      return 'The email or password you entered is incorrect. Please double-check and try again.'
    if (e.includes('not found') || e.includes('no user'))
      return 'No account found with this email address. Did you mean to sign up?'
    if (e.includes('locked') || e.includes('disabled'))
      return 'Your account has been temporarily locked. Please contact support.'
    if (e.includes('network') || e.includes('fetch'))
      return 'Unable to reach the server. Please check your internet connection.'
    return err
  }

  const fillDemo = (type) => {
    const accounts = {
      admin: { email: 'admin@grandazure.com', password: 'password123' },
      staff: { email: 'staff@grandazure.com', password: 'password123' },
      guest: { email: 'guest@example.com',    password: 'password123' },
    }
    setForm(accounts[type])
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#0A0A0A' }}>
      {/* LEFT — Hotel Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img src={HOTEL_IMAGE} alt="Grand Azure Hotel" className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(10,10,10,0.7) 0%, rgba(10,10,10,0.4) 100%)' }} />
        <div className="absolute inset-0 flex flex-col justify-end p-12">
          <p className="text-xs font-body tracking-[0.3em] uppercase mb-4" style={{ color: '#C9A84C' }}>Grand Azure Hotel</p>
          <h2 className="font-display font-light text-4xl mb-6" style={{ color: '#F8F4EF', lineHeight: '1.2' }}>
            Welcome<br />Back
          </h2>
          <div className="mb-8" style={{ width: 48, height: 1, background: '#C9A84C' }} />
          <p className="font-body text-sm italic leading-relaxed mb-8" style={{ color: 'rgba(248,244,239,0.65)' }}>
            &ldquo;Luxury is not a necessity to me, but beautiful and good things are.&rdquo;
            <br /><span style={{ color: '#C9A84C' }}>— Coco Chanel</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {['Free Cancellation', 'Best Price', '24/7 Support'].map(text => (
              <span key={text} className="text-xs font-body px-3 py-1.5 rounded-full"
                style={{ background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)', color: '#C9A84C' }}>
                {text}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT — Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12" style={{ background: '#0A0A0A' }}>
        <div className="w-full max-w-sm">
          {/* Logo */}
          <Link to="/" className="block text-center mb-10">
            <span className="font-display text-3xl tracking-widest" style={{ color: '#C9A84C', letterSpacing: '0.25em' }}>
              GRANDEUR
            </span>
          </Link>

          <h2 className="font-display font-light text-3xl mb-2 text-center" style={{ color: '#F8F4EF' }}>Sign In</h2>
          <p className="text-xs font-body text-center mb-8" style={{ color: 'rgba(248,244,239,0.45)' }}>
            {returnUrl ? 'Please sign in to continue with your booking' : 'Sign in to your Grand Azure account'}
          </p>

          {/* Alerts */}
          {error && (
            <div className="mb-4 p-3 rounded-xl text-sm font-body flex items-start gap-2" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
              <span className="mt-0.5 flex-shrink-0">⚠</span>
              <span>{friendlyError(error)}</span>
            </div>
          )}
          {returnUrl && (
            <div className="mb-4 p-3 rounded-xl text-sm font-body" style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.25)', color: '#C9A84C' }}>
              You need to be logged in to book a room.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-body tracking-widest uppercase mb-2" style={{ color: '#C9A84C' }}>Email Address</label>
              <input
                type="email" required autoComplete="email"
                placeholder="you@example.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                className="luxury-input w-full h-12 px-4 text-sm font-body"
              />
            </div>
            <div>
              <label className="block text-xs font-body tracking-widest uppercase mb-2" style={{ color: '#C9A84C' }}>Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'} required autoComplete="current-password"
                  placeholder="Enter your password"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  className="luxury-input w-full h-12 px-4 pr-12 text-sm font-body"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded transition-all"
                  style={{ color: '#C9A84C' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#E8C97A' }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#C9A84C' }}
                >
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded" style={{ accentColor: '#C9A84C' }} />
                <span className="text-xs font-body" style={{ color: 'rgba(248,244,239,0.5)' }}>Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-xs font-body hover:opacity-70 transition-opacity" style={{ color: '#C9A84C' }}>
                Forgot password?
              </Link>
            </div>

            <button type="submit" disabled={isLoading}
              className="btn-gold w-full h-12 rounded-xl text-xs tracking-widest uppercase font-body disabled:opacity-50">
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Signing In…
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full" style={{ height: 1, background: '#2A2A2A' }} />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 text-xs font-body" style={{ background: '#0A0A0A', color: 'rgba(248,244,239,0.35)' }}>Demo Accounts</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-8">
            {['admin', 'staff', 'guest'].map(type => (
              <button key={type} type="button" onClick={() => fillDemo(type)}
                className="py-2 rounded-xl text-xs font-body capitalize text-center transition-all duration-200"
                style={{ background: '#111111', border: '1px solid #2A2A2A', color: 'rgba(248,244,239,0.6)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)'; e.currentTarget.style.color = '#C9A84C' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#2A2A2A'; e.currentTarget.style.color = 'rgba(248,244,239,0.6)' }}>
                <span className="block font-medium" style={{ color: '#F8F4EF' }}>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                <span className="text-[10px]">{type}@...</span>
              </button>
            ))}
          </div>

          <p className="text-center text-xs font-body" style={{ color: 'rgba(248,244,239,0.4)' }}>
            {`Don't have an account? `}
            <Link to={returnUrl ? `/register?returnUrl=${returnUrl}` : '/register'}
              className="font-medium hover:opacity-70 transition-opacity" style={{ color: '#C9A84C' }}>
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
