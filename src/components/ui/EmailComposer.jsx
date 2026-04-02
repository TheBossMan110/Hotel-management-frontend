import { useState } from 'react'
import { Mail, X, Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { emailAPI } from '../../lib/api'

export default function EmailComposer({ isOpen, onClose }) {
  const [formData, setFormData] = useState({ to: '', subject: '', message: '' })
  const [status, setStatus] = useState({ type: null, message: '' }) // 'success' | 'error'
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
      setTimeout(() => {
        onClose()
        setStatus({ type: null, message: '' })
      }, 2000)
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.response?.data?.message || 'Failed to send email. Please try again.'
      })
    } finally {
      setIsSending(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#1a1f2e] border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-gradient-to-r from-blue-600/20 to-purple-600/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/20">
              <Mail className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Compose Email</h3>
              <p className="text-xs text-gray-400">Send via Grand Azure Hotel</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Status Message */}
          {status.type && (
            <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm ${
              status.type === 'success'
                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}>
              {status.type === 'success' ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
              {status.message}
            </div>
          )}

          {/* To */}
          <div>
            <label className="block text-sm text-gray-300 mb-1.5 font-medium">To</label>
            <input
              type="email"
              value={formData.to}
              onChange={(e) => setFormData(prev => ({ ...prev, to: e.target.value }))}
              placeholder="recipient@example.com"
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
              required
            />
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm text-gray-300 mb-1.5 font-medium">Subject</label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="Email subject..."
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
              required
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm text-gray-300 mb-1.5 font-medium">Message</label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Write your message here..."
              rows={6}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all resize-none"
              required
            />
          </div>

          {/* Footer Note */}
          <p className="text-xs text-gray-500">
            Email will be sent from <span className="text-gray-400">Grand Azure Pakistan</span> via hotel email system.
          </p>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm text-gray-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSending}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white text-sm font-medium rounded-xl shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Email
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
