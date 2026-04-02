import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, CheckCircle } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsLoading(false)
    setIsSubmitted(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: '#0A0A0A' }}>
      {/* Background gold glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, rgba(201,168,76,0.05) 0%, transparent 60%)' }} />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="block text-center mb-10">
          <span className="font-display text-3xl tracking-widest" style={{ color: '#C9A84C', letterSpacing: '0.25em' }}>
            GRANDEUR
          </span>
        </Link>

        <div className="p-8 rounded-2xl" style={{ background: '#111111', border: '1px solid #2A2A2A' }}>
          {isSubmitted ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
                <CheckCircle className="w-8 h-8" style={{ color: '#4ade80' }} />
              </div>
              <h2 className="font-display font-light text-3xl mb-3" style={{ color: '#F8F4EF' }}>Check Your Email</h2>
              <p className="text-sm font-body mb-6" style={{ color: 'rgba(248,244,239,0.5)' }}>
                We&apos;ve sent a password reset link to <strong style={{ color: '#F8F4EF' }}>{email}</strong>
              </p>
              <p className="text-xs font-body mb-8" style={{ color: 'rgba(248,244,239,0.35)' }}>
                Didn&apos;t receive the email? Check your spam folder or try again.
              </p>
              <div className="space-y-3">
                <button onClick={() => setIsSubmitted(false)}
                  className="w-full h-12 rounded-xl text-xs font-body tracking-widest uppercase transition-all duration-200"
                  style={{ background: 'transparent', border: '1px solid rgba(201,168,76,0.4)', color: '#C9A84C' }}>
                  Try Again
                </button>
                <Link to="/login" className="block">
                  <button className="w-full h-12 rounded-xl text-xs font-body tracking-widest uppercase transition-all duration-200"
                    style={{ background: 'transparent', border: '1px solid #2A2A2A', color: 'rgba(248,244,239,0.5)' }}>
                    Back to Login
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)' }}>
                <Mail className="w-7 h-7" style={{ color: '#C9A84C' }} />
              </div>
              <h2 className="font-display font-light text-3xl mb-2 text-center" style={{ color: '#F8F4EF' }}>Forgot Password?</h2>
              <p className="text-sm font-body text-center mb-8" style={{ color: 'rgba(248,244,239,0.45)' }}>
                Enter your email and we&apos;ll send you a reset link
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-body tracking-widest uppercase mb-2" style={{ color: '#C9A84C' }}>Email Address</label>
                  <input
                    type="email" required placeholder="you@example.com"
                    value={email} onChange={e => setEmail(e.target.value)}
                    className="luxury-input w-full h-12 px-4 text-sm font-body"
                  />
                </div>

                <button type="submit" disabled={isLoading}
                  className="btn-gold w-full h-12 rounded-xl text-xs tracking-widest uppercase font-body disabled:opacity-50">
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Sending…
                    </span>
                  ) : 'Send Reset Link'}
                </button>

                <Link to="/login" className="block">
                  <button type="button" className="w-full h-11 rounded-xl text-xs font-body tracking-widest uppercase transition-all duration-200"
                    style={{ background: 'transparent', border: '1px solid #2A2A2A', color: 'rgba(248,244,239,0.5)' }}>
                    Back to Login
                  </button>
                </Link>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
