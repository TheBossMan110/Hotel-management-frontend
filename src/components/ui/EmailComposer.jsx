import { useState } from 'react'
import { Mail, X, Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { emailAPI } from '../../lib/api'

export default function EmailComposer({ isOpen, onClose }) {
  const [formData, setFormData] = useState({ to: '', subject: '', message: '' })
  const [status, setStatus] = useState({ type: null, message: '' })
  const [isSending, setIsSending] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.to || !formData.subject || !formData.message) {
      setStatus({ type: 'error', message: 'Please fill in all fields.' })
      return
    }
    setIsSending(true)
    setStatus({ type: null, message: '' })
    try {
      await emailAPI.send(formData)
      setStatus({ type: 'success', message: `Email sent to ${formData.to} successfully!` })
      setFormData({ to: '', subject: '', message: '' })
      setTimeout(() => { onClose(); setStatus({ type: null, message: '' }) }, 2000)
    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.message || 'Failed to send email. Please try again.' })
    } finally {
      setIsSending(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-lg mx-4 rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: '#111111', border: '1px solid rgba(201,168,76,0.25)', boxShadow: '0 0 60px rgba(201,168,76,0.08)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid rgba(201,168,76,0.15)', background: 'linear-gradient(135deg, rgba(201,168,76,0.08), transparent)' }}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl" style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.2)' }}>
              <Mail className="w-5 h-5" style={{ color: '#C9A84C' }} />
            </div>
            <div>
              <h3 className="font-display font-light text-lg" style={{ color: '#F8F4EF' }}>Compose Email</h3>
              <p className="text-xs font-body" style={{ color: 'rgba(248,244,239,0.4)' }}>Send via Grand Azure Hotel</p>
            </div>
          </div>
          <button onClick={onClose}
            className="p-2 rounded-xl transition-all"
            style={{ color: 'rgba(248,244,239,0.5)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,168,76,0.08)'; e.currentTarget.style.color = '#C9A84C' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(248,244,239,0.5)' }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          {/* Status */}
          {status.type && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-body"
              style={status.type === 'success'
                ? { background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#4ade80' }
                : { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
              {status.type === 'success'
                ? <CheckCircle className="w-4 h-4 flex-shrink-0" />
                : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
              {status.message}
            </div>
          )}

          {/* To */}
          <div>
            <label className="block text-xs font-body tracking-widest uppercase mb-2" style={{ color: '#C9A84C' }}>To</label>
            <input type="email" value={formData.to} required
              onChange={e => setFormData(p => ({ ...p, to: e.target.value }))}
              placeholder="recipient@example.com"
              className="w-full h-11 px-4 text-sm font-body rounded-xl outline-none transition-all"
              style={{ background: '#1A1A1A', border: '1px solid rgba(201,168,76,0.2)', color: '#F8F4EF' }}
              onFocus={e => { e.currentTarget.style.borderColor = '#C9A84C'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.08)' }}
              onBlur={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.2)'; e.currentTarget.style.boxShadow = 'none' }}
            />
          </div>

          {/* Subject */}
          <div>
            <label className="block text-xs font-body tracking-widest uppercase mb-2" style={{ color: '#C9A84C' }}>Subject</label>
            <input type="text" value={formData.subject} required
              onChange={e => setFormData(p => ({ ...p, subject: e.target.value }))}
              placeholder="Email subject..."
              className="w-full h-11 px-4 text-sm font-body rounded-xl outline-none transition-all"
              style={{ background: '#1A1A1A', border: '1px solid rgba(201,168,76,0.2)', color: '#F8F4EF' }}
              onFocus={e => { e.currentTarget.style.borderColor = '#C9A84C'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.08)' }}
              onBlur={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.2)'; e.currentTarget.style.boxShadow = 'none' }}
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-xs font-body tracking-widest uppercase mb-2" style={{ color: '#C9A84C' }}>Message</label>
            <textarea value={formData.message} required rows={6}
              onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
              placeholder="Write your message here..."
              className="w-full px-4 py-3 text-sm font-body rounded-xl outline-none transition-all resize-none"
              style={{ background: '#1A1A1A', border: '1px solid rgba(201,168,76,0.2)', color: '#F8F4EF' }}
              onFocus={e => { e.currentTarget.style.borderColor = '#C9A84C'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.08)' }}
              onBlur={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.2)'; e.currentTarget.style.boxShadow = 'none' }}
            />
          </div>

          <p className="text-xs font-body" style={{ color: 'rgba(248,244,239,0.3)' }}>
            🔒 Sent via Grand Azure Pakistan secure hotel email system.
          </p>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="px-5 py-2.5 text-sm font-body rounded-xl transition-all"
              style={{ color: 'rgba(248,244,239,0.5)', border: '1px solid rgba(248,244,239,0.08)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,244,239,0.04)'; e.currentTarget.style.color = '#F8F4EF' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(248,244,239,0.5)' }}>
              Cancel
            </button>
            <button type="submit" disabled={isSending}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-body font-medium rounded-xl transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #C9A84C, #E8C97A)', color: '#0A0A0A' }}
              onMouseEnter={e => { if (!isSending) e.currentTarget.style.opacity = '0.9' }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}>
              {isSending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
              ) : (
                <><Send className="w-4 h-4" /> Send Email</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
