import { useState, useEffect } from 'react'
import { useBookingsStore } from '../../stores/bookingsStore'
import { feedbackAPI, maintenanceAPI } from '../../lib/api'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs'
import Modal from '../../components/ui/Modal'
import { formatDate, formatCurrency } from '../../lib/utils'
import { Link } from 'react-router-dom'
import { Star, AlertTriangle, MessageSquare, CheckCircle, Loader2 } from 'lucide-react'

export default function GuestBookings() {
  const { myBookings, fetchMyBookings, cancelBooking, isLoading, error } = useBookingsStore()

  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelBookingId, setCancelBookingId] = useState(null)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelling, setCancelling] = useState(false)
  const [cancelError, setCancelError] = useState(null)

  // Feedback state
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [feedbackBooking, setFeedbackBooking] = useState(null)
  const [feedbackForm, setFeedbackForm] = useState({ overall: 0, cleanliness: 0, staff: 0, comfort: 0, location: 0, valueForMoney: 0, comment: '' })
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false)
  const [feedbackSuccess, setFeedbackSuccess] = useState(false)

  // Report state
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportBooking, setReportBooking] = useState(null)
  const [reportForm, setReportForm] = useState({ category: 'plumbing', priority: 'medium', title: '', description: '' })
  const [reportSubmitting, setReportSubmitting] = useState(false)
  const [reportSuccess, setReportSuccess] = useState(false)

  useEffect(() => {
    fetchMyBookings()
  }, [])

  const activeBookings = myBookings.filter(b => ['confirmed', 'checked-in', 'pending'].includes(b.status))
  const pastBookings = myBookings.filter(b => b.status === 'checked-out')
  const cancelledBookings = myBookings.filter(b => b.status === 'cancelled')

  const handleCancelBooking = async () => {
    if (!cancelBookingId) return
    setCancelling(true)
    setCancelError(null)
    const result = await cancelBooking(cancelBookingId, cancelReason)
    setCancelling(false)
    if (result?.success === false) {
      setCancelError(result.error || 'Failed to cancel booking.')
    } else {
      setShowCancelModal(false)
      setCancelBookingId(null)
      setCancelReason('')
      fetchMyBookings()
    }
  }

  // Submit feedback — backend expects bookingId and roomId
  const handleFeedbackSubmit = async () => {
    if (feedbackForm.overall === 0 || !feedbackForm.comment.trim()) return
    setFeedbackSubmitting(true)
    try {
      const bookingId = feedbackBooking._id || feedbackBooking.id
      const roomId = feedbackBooking.room?._id || feedbackBooking.room
      await feedbackAPI.submit({
        bookingId,
        roomId,
        type: 'review',
        ratings: {
          overall: feedbackForm.overall,
          cleanliness: feedbackForm.cleanliness,
          staff: feedbackForm.staff,
          comfort: feedbackForm.comfort,
          location: feedbackForm.location,
          valueForMoney: feedbackForm.valueForMoney
        },
        comment: feedbackForm.comment
      })
      setFeedbackSuccess(true)
      setTimeout(() => {
        setShowFeedbackModal(false)
        setFeedbackSuccess(false)
        setFeedbackForm({ overall: 0, cleanliness: 0, staff: 0, comfort: 0, location: 0, valueForMoney: 0, comment: '' })
      }, 1500)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit feedback')
    } finally {
      setFeedbackSubmitting(false)
    }
  }

  // Submit report — backend expects roomId not room
  const handleReportSubmit = async () => {
    if (!reportForm.title.trim() || !reportForm.description.trim()) return
    setReportSubmitting(true)
    try {
      const roomId = reportBooking.room?._id || reportBooking.room
      await maintenanceAPI.create({
        roomId,
        category: reportForm.category,
        priority: reportForm.priority,
        title: reportForm.title,
        description: reportForm.description
      })
      setReportSuccess(true)
      setTimeout(() => {
        setShowReportModal(false)
        setReportSuccess(false)
        setReportForm({ category: 'plumbing', priority: 'medium', title: '', description: '' })
      }, 1500)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit report')
    } finally {
      setReportSubmitting(false)
    }
  }

  const getStatusBadge = (status) => {
    const styles = {
      'confirmed':   { bg: 'rgba(201,168,76,0.12)',  border: 'rgba(201,168,76,0.3)',  color: '#C9A84C' },
      'checked-in':  { bg: 'rgba(34,197,94,0.1)',    border: 'rgba(34,197,94,0.3)',   color: '#4ade80' },
      'checked-out': { bg: 'rgba(148,163,184,0.1)',  border: 'rgba(148,163,184,0.3)', color: '#94a3b8' },
      'cancelled':   { bg: 'rgba(239,68,68,0.1)',    border: 'rgba(239,68,68,0.3)',   color: '#f87171' },
      'pending':     { bg: 'rgba(251,191,36,0.1)',   border: 'rgba(251,191,36,0.3)',  color: '#fbbf24' },
    }
    const s = styles[status] || { bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)', color: 'rgba(248,244,239,0.6)' }
    return (
      <span className="text-xs px-2 py-1 rounded-full capitalize"
        style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color }}>
        {status.replace(/-/g, ' ')}
      </span>
    )
  }

  const getBookingId = (b) => b._id || b.id || ''
  const getRoomName = (b) => b.room?.name || b.room?.type || 'Room'
  const getRoomNumber = (b) => b.room?.roomNumber || b.roomNumber || '—'
  const getTotal = (b) => b.pricing?.total || b.totalAmount || 0
  const getNights = (b) => b.pricing?.nights || '—'

  // Star rating component
  const StarRating = ({ label, value, onChange }) => (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600 font-medium">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button key={star} type="button" onClick={() => onChange(star)}
            className="transition-transform hover:scale-110">
            <Star className={`w-5 h-5 ${star <= value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
          </button>
        ))}
      </div>
    </div>
  )

  // Compact booking card
  const BookingCard = ({ booking }) => (
    <div className="rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 transition-all"
      style={{ background: '#111111', border: '1px solid #2A2A2A' }}>
      {/* Left info */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.12)' }}>
          <svg className="w-6 h-6" style={{ color: '#C9A84C' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <h3 className="text-sm font-semibold capitalize" style={{ color: '#F8F4EF' }}>{getRoomName(booking)}</h3>
            {getStatusBadge(booking.status)}
          </div>
          <p className="text-xs" style={{ color: 'rgba(248,244,239,0.4)' }}>
            Room {getRoomNumber(booking)} · {getNights(booking)} nights · {formatDate(booking.checkIn)} → {formatDate(booking.checkOut)}
          </p>
        </div>
      </div>

      {/* Right: price + actions */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <p className="text-lg font-semibold" style={{ color: '#C9A84C' }}>{formatCurrency(getTotal(booking))}</p>
        <div className="flex gap-1.5">
          <button className="px-2.5 py-1 rounded-lg text-xs transition-all"
            style={{ border: '1px solid rgba(201,168,76,0.3)', color: '#C9A84C' }}
            onClick={() => setSelectedBooking(booking)}>Details</button>
          <button className="px-2.5 py-1 rounded-lg text-xs transition-all flex items-center gap-1"
            style={{ border: '1px solid rgba(59,130,246,0.3)', color: '#60a5fa' }}
            onClick={() => { setFeedbackBooking(booking); setShowFeedbackModal(true); setFeedbackSuccess(false) }}>
            <MessageSquare className="w-3 h-3" /> Feedback
          </button>
          <button className="px-2.5 py-1 rounded-lg text-xs transition-all flex items-center gap-1"
            style={{ border: '1px solid rgba(249,115,22,0.3)', color: '#fb923c' }}
            onClick={() => { setReportBooking(booking); setShowReportModal(true); setReportSuccess(false) }}>
            <AlertTriangle className="w-3 h-3" /> Report
          </button>
          {booking.status === 'confirmed' && (
            <button className="px-2.5 py-1 rounded-lg text-xs transition-all"
              style={{ border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}
              onClick={() => { setCancelBookingId(getBookingId(booking)); setCancelError(null); setShowCancelModal(true) }}>
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif" style={{ color: '#F8F4EF' }}>My Bookings</h1>
          <p className="text-sm" style={{ color: 'rgba(248,244,239,0.4)' }}>{myBookings.length} total bookings</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => fetchMyBookings()} className="px-4 py-2 rounded-xl text-xs tracking-wide uppercase"
            style={{ border: '1px solid rgba(201,168,76,0.3)', color: '#C9A84C' }}>Refresh</button>
          <Link to="/rooms">
            <button className="btn-gold px-4 py-2 rounded-xl text-xs tracking-wide">Book New</button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#C9A84C', borderTopColor: 'transparent' }} />
        </div>
      ) : error ? (
        <div className="text-center py-12 rounded-xl" style={{ background: '#111111', border: '1px solid #2A2A2A' }}>
          <p style={{ color: '#f87171' }}>{error}</p>
        </div>
      ) : (
        <Tabs defaultValue="active">
          <TabsList>
            <TabsTrigger value="active">Active ({activeBookings.length})</TabsTrigger>
            <TabsTrigger value="past">Past ({pastBookings.length})</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled ({cancelledBookings.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            {activeBookings.length === 0 ? (
              <div className="text-center py-12 rounded-xl" style={{ background: '#111111', border: '1px solid #2A2A2A' }}>
                <p style={{ color: 'rgba(248,244,239,0.4)' }}>No active bookings</p>
                <Link to="/rooms"><button className="btn-gold mt-4 px-6 py-2 rounded-xl text-xs">Browse Rooms</button></Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3">{activeBookings.map(b => <BookingCard key={getBookingId(b)} booking={b} />)}</div>
            )}
          </TabsContent>

          <TabsContent value="past">
            {pastBookings.length === 0 ? (
              <div className="text-center py-12 rounded-xl" style={{ background: '#111111', border: '1px solid #2A2A2A' }}>
                <p style={{ color: 'rgba(248,244,239,0.4)' }}>No past bookings</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">{pastBookings.map(b => <BookingCard key={getBookingId(b)} booking={b} />)}</div>
            )}
          </TabsContent>

          <TabsContent value="cancelled">
            {cancelledBookings.length === 0 ? (
              <div className="text-center py-12 rounded-xl" style={{ background: '#111111', border: '1px solid #2A2A2A' }}>
                <p style={{ color: 'rgba(248,244,239,0.4)' }}>No cancelled bookings</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">{cancelledBookings.map(b => <BookingCard key={getBookingId(b)} booking={b} />)}</div>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* ═══════ BOOKING DETAIL MODAL ═══════ */}
      <Modal isOpen={!!selectedBooking} onClose={() => setSelectedBooking(null)} title="Booking Details" size="md">
        {selectedBooking && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-gray-500">Room</p><p className="font-medium text-gray-900 capitalize">{getRoomName(selectedBooking)} (#{getRoomNumber(selectedBooking)})</p></div>
              <div><p className="text-gray-500">Status</p><p className="font-medium text-gray-900 capitalize">{selectedBooking.status?.replace(/-/g,' ')}</p></div>
              <div><p className="text-gray-500">Check-in</p><p className="font-medium text-gray-900">{formatDate(selectedBooking.checkIn)}</p></div>
              <div><p className="text-gray-500">Check-out</p><p className="font-medium text-gray-900">{formatDate(selectedBooking.checkOut)}</p></div>
              <div><p className="text-gray-500">Nights</p><p className="font-medium text-gray-900">{getNights(selectedBooking)}</p></div>
              <div><p className="text-gray-500">Total</p><p className="font-medium text-gray-900">{formatCurrency(getTotal(selectedBooking))}</p></div>
            </div>
            {selectedBooking.specialRequests && (
              <div><p className="text-sm text-gray-500">Special Requests</p><p className="text-sm text-gray-900">{selectedBooking.specialRequests}</p></div>
            )}
            <button onClick={() => setSelectedBooking(null)} className="w-full py-2 rounded-xl text-sm border border-gray-300 text-gray-700 hover:bg-gray-50">Close</button>
          </div>
        )}
      </Modal>

      {/* ═══════ CANCEL MODAL ═══════ */}
      <Modal isOpen={showCancelModal} onClose={() => setShowCancelModal(false)} title="Cancel Booking" size="sm">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-700">Are you sure you want to cancel this booking?</p>
          <textarea value={cancelReason} onChange={e => setCancelReason(e.target.value)}
            placeholder="Reason for cancellation (optional)" rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400/30 resize-none placeholder-gray-400" />
          {cancelError && <p className="text-sm text-red-600">{cancelError}</p>}
          <div className="flex gap-3">
            <button onClick={() => setShowCancelModal(false)} className="flex-1 py-2 rounded-xl text-sm border border-gray-300 text-gray-700">Keep Booking</button>
            <button onClick={handleCancelBooking} disabled={cancelling}
              className="flex-1 py-2 rounded-xl text-sm bg-red-600 text-white disabled:opacity-50">
              {cancelling ? 'Cancelling...' : 'Confirm Cancel'}
            </button>
          </div>
        </div>
      </Modal>

      {/* ═══════ FEEDBACK MODAL ═══════ */}
      <Modal isOpen={showFeedbackModal} onClose={() => setShowFeedbackModal(false)} title="Submit Feedback" size="md">
        {feedbackSuccess ? (
          <div className="flex flex-col items-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900">Thank You!</h3>
            <p className="text-gray-500">Your feedback has been submitted.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
              <p className="text-sm text-blue-800 font-medium">{feedbackBooking ? getRoomName(feedbackBooking) : ''}</p>
              <p className="text-xs text-blue-600">{feedbackBooking ? `Room ${getRoomNumber(feedbackBooking)}` : ''}</p>
            </div>
            <StarRating label="Overall *" value={feedbackForm.overall} onChange={v => setFeedbackForm(p => ({ ...p, overall: v }))} />
            <StarRating label="Cleanliness" value={feedbackForm.cleanliness} onChange={v => setFeedbackForm(p => ({ ...p, cleanliness: v }))} />
            <StarRating label="Staff" value={feedbackForm.staff} onChange={v => setFeedbackForm(p => ({ ...p, staff: v }))} />
            <StarRating label="Comfort" value={feedbackForm.comfort} onChange={v => setFeedbackForm(p => ({ ...p, comfort: v }))} />
            <StarRating label="Value for Money" value={feedbackForm.valueForMoney} onChange={v => setFeedbackForm(p => ({ ...p, valueForMoney: v }))} />
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Comment *</label>
              <textarea value={feedbackForm.comment} onChange={e => setFeedbackForm(p => ({ ...p, comment: e.target.value }))}
                rows={3} placeholder="Tell us about your experience..."
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400/30 resize-none placeholder-gray-400" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowFeedbackModal(false)} className="flex-1 py-2.5 rounded-xl text-sm border border-gray-300 text-gray-700">Cancel</button>
              <button onClick={handleFeedbackSubmit} disabled={feedbackSubmitting || feedbackForm.overall === 0 || !feedbackForm.comment.trim()}
                className="flex-1 py-2.5 rounded-xl text-sm bg-blue-600 text-white disabled:opacity-50 flex items-center justify-center gap-2">
                {feedbackSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : 'Submit Feedback'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ═══════ REPORT MODAL ═══════ */}
      <Modal isOpen={showReportModal} onClose={() => setShowReportModal(false)} title="Report an Issue" size="md">
        {reportSuccess ? (
          <div className="flex flex-col items-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900">Report Submitted!</h3>
            <p className="text-gray-500">Our team will look into this.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="p-3 rounded-xl bg-orange-50 border border-orange-100">
              <p className="text-sm text-orange-800 font-medium">{reportBooking ? getRoomName(reportBooking) : ''}</p>
              <p className="text-xs text-orange-600">{reportBooking ? `Room ${getRoomNumber(reportBooking)}` : ''}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Category</label>
                <select value={reportForm.category} onChange={e => setReportForm(p => ({ ...p, category: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 bg-white">
                  <option value="plumbing">🔧 Plumbing</option>
                  <option value="electrical">⚡ Electrical</option>
                  <option value="hvac">❄️ HVAC</option>
                  <option value="furniture">🪑 Furniture</option>
                  <option value="cleaning">🧹 Cleaning</option>
                  <option value="other">📋 Other</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Priority</label>
                <select value={reportForm.priority} onChange={e => setReportForm(p => ({ ...p, priority: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 bg-white">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Title *</label>
              <input type="text" value={reportForm.title} onChange={e => setReportForm(p => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Broken AC, Leaking tap..."
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400/30 placeholder-gray-400" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Description *</label>
              <textarea value={reportForm.description} onChange={e => setReportForm(p => ({ ...p, description: e.target.value }))}
                rows={3} placeholder="Describe the issue in detail..."
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400/30 resize-none placeholder-gray-400" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowReportModal(false)} className="flex-1 py-2.5 rounded-xl text-sm border border-gray-300 text-gray-700">Cancel</button>
              <button onClick={handleReportSubmit} disabled={reportSubmitting || !reportForm.title.trim() || !reportForm.description.trim()}
                className="flex-1 py-2.5 rounded-xl text-sm bg-orange-600 text-white disabled:opacity-50 flex items-center justify-center gap-2">
                {reportSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : 'Submit Report'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
