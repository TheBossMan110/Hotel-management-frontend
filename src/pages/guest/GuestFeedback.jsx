import { useState, useEffect } from 'react'
import { useBookingsStore } from '../../stores/bookingsStore'
import { feedbackAPI } from '../../lib/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { formatDate } from '../../lib/utils'

function StarRating({ value, onChange, size = 'md' }) {
  const [hover, setHover] = useState(0)
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-10 h-10' }

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} type="button" onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)} onMouseLeave={() => setHover(0)}
          className="focus:outline-none transition-transform hover:scale-110"
        >
          <svg
            className={`${sizes[size]} ${star <= (hover || value) ? 'fill-current' : 'fill-none'}`}
            style={{ color: star <= (hover || value) ? '#C9A84C' : 'rgba(248,244,239,0.2)' }}
            viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </button>
      ))}
    </div>
  )
}

const RATING_LABELS = { 0: 'Tap to rate', 1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Very Good', 5: 'Excellent' }

export default function GuestFeedback() {
  const { myBookings, fetchMyBookings } = useBookingsStore()
  const [myFeedback, setMyFeedback] = useState([])
  const [loadingFeedback, setLoadingFeedback] = useState(true)

  const [selectedBooking, setSelectedBooking] = useState(null)
  const [overallRating, setOverallRating] = useState(0)
  const [ratings, setRatings] = useState({ cleanliness: 0, service: 0, comfort: 0, location: 0, valueForMoney: 0 })
  const [comment, setComment] = useState('')
  const [title, setTitle] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [submitted, setSubmitted] = useState(false)

  const completedBookings = myBookings.filter(b => b.status === 'checked-out')

  useEffect(() => {
    fetchMyBookings()
    loadMyFeedback()
  }, [])

  const loadMyFeedback = async () => {
    setLoadingFeedback(true)
    try {
      const { data } = await feedbackAPI.getMyFeedback()
      setMyFeedback(data.feedback || [])
    } catch {
      // non-critical
    } finally {
      setLoadingFeedback(false)
    }
  }

  const alreadyReviewed = (bookingId) =>
    myFeedback.some(f => f.booking === bookingId || f.booking?._id === bookingId)

  const getBookingId = (b) => b._id || b.id

  const handleSubmit = async () => {
    if (overallRating === 0) return
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      await feedbackAPI.submit({
        bookingId: getBookingId(selectedBooking),
        roomId: selectedBooking.room?._id || selectedBooking.room,
        type: 'review',
        ratings: { overall: overallRating, ...ratings },
        title,
        comment,
        isPublic: true
      })
      setSubmitted(true)
      loadMyFeedback()
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Failed to submit feedback. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setSubmitted(false)
    setSelectedBooking(null)
    setOverallRating(0)
    setRatings({ cleanliness: 0, service: 0, comfort: 0, location: 0, valueForMoney: 0 })
    setComment('')
    setTitle('')
    setSubmitError(null)
  }

  const categories = [
    { key: 'cleanliness', label: 'Cleanliness' },
    { key: 'service', label: 'Staff Service' },
    { key: 'comfort', label: 'Comfort' },
    { key: 'location', label: 'Location' },
    { key: 'valueForMoney', label: 'Value for Money' }
  ]

  if (submitted) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-serif font-bold">Feedback</h1>
          <p className="text-muted-foreground">Share your experience with us</p>
        </div>
        <Card>
          <CardContent className="py-16 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Your feedback has been submitted successfully. We appreciate you taking the time to share your experience.
            </p>
            <Button onClick={resetForm}>Submit Another Review</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6" style={{ color: '#F8F4EF' }}>
      <div>
        <p className="text-xs font-body tracking-[0.3em] uppercase mb-1" style={{ color: '#C9A84C' }}>Your Experience</p>
        <h1 className="font-display font-light text-3xl" style={{ color: '#F8F4EF' }}>Feedback</h1>
        <p className="font-body text-sm mt-1" style={{ color: 'rgba(248,244,239,0.45)' }}>Share your experience with us</p>
      </div>

      {!selectedBooking ? (
        <>
          {/* Stays awaiting review */}
          <Card>
            <CardHeader>
              <CardTitle>Select a Stay to Review</CardTitle>
              <CardDescription>Choose from your completed stays</CardDescription>
            </CardHeader>
            <CardContent>
              {completedBookings.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <h3 className="text-lg font-medium mb-2">No Completed Stays</h3>
                  <p className="text-muted-foreground">You can submit feedback after completing your stay</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {completedBookings.map((booking) => {
                    const bid = getBookingId(booking)
                    const reviewed = alreadyReviewed(bid)
                    return (
          <div
                        key={bid}
                        className={`flex items-center justify-between p-4 rounded-xl transition-all cursor-pointer ${
                          reviewed ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        style={reviewed
                          ? { background: '#1A1A1A', border: '1px solid #2A2A2A' }
                          : { background: '#1A1A1A', border: '1px solid #2A2A2A' }
                        }
                        onClick={() => !reviewed && setSelectedBooking(booking)}
                        onMouseEnter={e => { if (!reviewed) { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.3)' } }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#2A2A2A' }}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium capitalize">{booking.room?.type || booking.room?.name || 'Room'}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(booking.checkIn)} — {formatDate(booking.checkOut)}
                            </p>
                          </div>
                        </div>
                        {reviewed
                          ? <Badge variant="success">Reviewed</Badge>
                          : <Badge variant="outline">Write Review</Badge>
                        }
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Past feedback */}
          {myFeedback.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Your Past Reviews</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  {myFeedback.map((fb) => (
                    <div key={fb._id} className="p-4 border border-border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium capitalize">{fb.room?.name || fb.room?.type || 'Room'}</p>
                          <p className="text-sm text-muted-foreground">{formatDate(fb.stayDate)}</p>
                        </div>
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(s => (
                            <svg key={s} className={`w-4 h-4 ${s <= fb.ratings?.overall ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/20'}`} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                      {fb.title && <p className="font-medium text-sm mb-1">{fb.title}</p>}
                      {fb.comment && <p className="text-sm text-muted-foreground">{fb.comment}</p>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Review Your Stay</CardTitle>
                <CardDescription className="capitalize">
                  {selectedBooking.room?.type || 'Room'} — {formatDate(selectedBooking.checkIn)} to {formatDate(selectedBooking.checkOut)}
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedBooking(null)}>Change Stay</Button>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            {/* Review Title */}
            <div>
              <label className="block text-sm font-medium mb-2">Review Title</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Summarize your experience..."
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Overall Rating */}
            <div className="text-center p-6 bg-accent/30 rounded-xl">
              <h3 className="text-lg font-medium mb-3">Overall Experience</h3>
              <div className="flex justify-center">
                <StarRating value={overallRating} onChange={setOverallRating} size="lg" />
              </div>
              <p className="text-sm text-muted-foreground mt-2">{RATING_LABELS[overallRating]}</p>
            </div>

            {/* Category Ratings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <span className="font-medium text-sm">{label}</span>
                  <StarRating value={ratings[key]} onChange={v => setRatings(p => ({ ...p, [key]: v }))} size="sm" />
                </div>
              ))}
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium mb-2">Your Comments</label>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Tell us about your experience..."
                rows={5}
                className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none text-sm"
              />
            </div>

            {submitError && <p className="text-sm text-destructive">{submitError}</p>}

            <div className="flex gap-3">
              <Button
                onClick={handleSubmit}
                disabled={overallRating === 0 || isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? 'Submitting…' : 'Submit Feedback'}
              </Button>
              <Button variant="outline" onClick={() => setSelectedBooking(null)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
