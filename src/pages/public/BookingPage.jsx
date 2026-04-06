import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Calendar, Users, CreditCard, Check, ChevronRight } from 'lucide-react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import useRoomsStore from '../../stores/roomsStore'
import useBookingsStore from '../../stores/bookingsStore'
import useAuthStore from '../../stores/authStore'
import { calculateNights, cn } from '../../lib/utils'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const steps = [
  { id: 1, title: 'Room Selection' },
  { id: 2, title: 'Guest Details' },
  { id: 3, title: 'Payment' },
  { id: 4, title: 'Confirmation' }
]

export default function BookingPage() {
  const navigate = useNavigate()
  const { bookingDraft, updateBookingDraft, createBooking, currentBooking } = useBookingsStore()
  const { isAuthenticated, user } = useAuthStore()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [bookingError, setBookingError] = useState('')
  const [confirmedBooking, setConfirmedBooking] = useState(null)
  const [guestDetails, setGuestDetails] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ')[1] || '',
    email: user?.email || '',
    phone: '',
    specialRequests: ''
  })
  const [payment, setPayment] = useState({ cardNumber: '', expiry: '', cvc: '', nameOnCard: '' })
  const [paymentErrors, setPaymentErrors] = useState({})
  const [selectedRoom, setSelectedRoom] = useState(null)
  const location = useLocation()

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const checkIn = params.get('checkIn')
    const checkOut = params.get('checkOut')
    const guests = params.get('guests')
    
    if (checkIn || checkOut || guests) {
      const updates = {}
      if (checkIn) updates.checkIn = checkIn
      if (checkOut) updates.checkOut = checkOut
      if (guests) updates.guests = Number(guests)
      
      // Update store only if there's actually a change (simple check)
      if (updates.checkIn !== bookingDraft.checkIn || 
          updates.checkOut !== bookingDraft.checkOut || 
          updates.guests !== bookingDraft.guests) {
        updateBookingDraft(updates)
      }
    }
  }, [location.search, bookingDraft, updateBookingDraft])

  useEffect(() => {
    if (bookingDraft.roomId) {
      fetch(`${API_URL}/rooms/${bookingDraft.roomId}`)
        .then(r => r.json())
        .then(d => {
           if (d.room) setSelectedRoom(d.room)
        })
        .catch(console.error)
    }
  }, [bookingDraft.roomId])

  const nights = bookingDraft.checkIn && bookingDraft.checkOut 
    ? calculateNights(bookingDraft.checkIn, bookingDraft.checkOut) 
    : 0
  const basePrice = selectedRoom?.price?.basePrice || 0
  const subtotal = selectedRoom ? basePrice * nights : 0
  const serviceFee = nights * 1500
  const taxes = subtotal * 0.1
  const total = subtotal + serviceFee + taxes

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    if (!validatePayment()) return
    setIsLoading(true)
    setBookingError('')
    try {
      const confirmationNumber = 'GH-' + Date.now().toString().slice(-6)
      const bookingData = {
        confirmationNumber,
        roomName: selectedRoom?.name || 'Hotel Room',
        roomNumber: selectedRoom?.number || selectedRoom?.roomNumber,
        checkIn: bookingDraft.checkIn,
        checkOut: bookingDraft.checkOut,
        guests: bookingDraft.guests,
        nights,
        totalAmount: total,
        guestName: `${guestDetails.firstName} ${guestDetails.lastName}`,
        guestEmail: guestDetails.email,
        guestPhone: guestDetails.phone,
        specialRequests: guestDetails.specialRequests,
        bookedAt: new Date().toISOString(),
        status: 'confirmed',
      }

      // Save to localStorage for profile page
      const existing = JSON.parse(localStorage.getItem('guest-bookings') || '[]')
      existing.unshift(bookingData)
      localStorage.setItem('guest-bookings', JSON.stringify(existing))

      // Also try the store (silently — won't break if backend is down)
      try { await createBooking({ ...bookingDraft, ...bookingData, guestId: user?.id }) } catch {}

      setConfirmedBooking(bookingData)
      setCurrentStep(4)
    } catch (error) {
      setBookingError('Booking failed. Please try again or contact support.')
      console.error('Booking failed:', error)
    }
    setIsLoading(false)
  }

  // Card formatting helpers
  const formatCardNumber = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 19)
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ')
  }
  const formatExpiry = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 4)
    if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2)
    return digits
  }

  const validatePayment = () => {
    const errs = {}
    const digits = payment.cardNumber.replace(/\s/g, '')
    if (digits.length < 13 || digits.length > 19) errs.cardNumber = 'Card number must be 13–19 digits'
    else if (/^(\d)\1+$/.test(digits)) errs.cardNumber = 'This does not look like a real card number'

    if (!payment.expiry.match(/^\d{2}\/\d{2}$/)) {
      errs.expiry = 'Enter expiry as MM/YY'
    } else {
      const [mm, yy] = payment.expiry.split('/').map(Number)
      const now = new Date()
      const exp = new Date(2000 + yy, mm - 1)
      if (mm < 1 || mm > 12) errs.expiry = 'Month must be 01–12'
      else if (exp < now) errs.expiry = 'This card has expired'
    }
    if (!payment.cvc.match(/^\d{3,4}$/)) errs.cvc = 'CVC must be 3 or 4 digits'
    if (!payment.nameOnCard.trim() || payment.nameOnCard.trim().length < 2) errs.nameOnCard = 'Enter the name as it appears on your card'
    setPaymentErrors(errs)
    return Object.keys(errs).length === 0
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return bookingDraft.roomId && bookingDraft.checkIn && bookingDraft.checkOut && nights > 0
      case 2:
        return guestDetails.firstName && guestDetails.lastName && guestDetails.email && guestDetails.phone
      case 3:
        return true // validated on submit
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen pt-20 pb-16" style={{ background: '#0A0A0A', color: '#F8F4EF' }}>
      {/* Header */}
      <section className="py-12 px-4" style={{ background: '#111111', borderBottom: '1px solid rgba(201,168,76,0.15)' }}>
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-body tracking-[0.3em] uppercase mb-2" style={{ color: '#C9A84C' }}>Reservation</p>
          <h1 className="font-display font-light" style={{ color: '#F8F4EF', fontSize: 'clamp(32px,5vw,56px)', lineHeight: 1.1 }}>Book Your Stay</h1>
          <p className="font-body text-sm mt-2" style={{ color: 'rgba(248,244,239,0.45)' }}>
            Complete your reservation in just a few simple steps
          </p>
        </div>
      </section>

      {/* Progress Steps */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-body font-semibold text-sm transition-all"
                  style={currentStep > step.id
                    ? { background: '#C9A84C', color: '#0A0A0A' }
                    : currentStep === step.id
                    ? { background: 'rgba(201,168,76,0.15)', border: '1.5px solid #C9A84C', color: '#C9A84C' }
                    : { background: '#1A1A1A', border: '1px solid #2A2A2A', color: 'rgba(248,244,239,0.3)' }
                  }
                >
                  {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
                </div>
                <span className="text-xs mt-2 hidden sm:block font-body"
                  style={{ color: currentStep >= step.id ? '#C9A84C' : 'rgba(248,244,239,0.3)' }}>{step.title}</span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className="h-px w-12 sm:w-24 mx-2 transition-all"
                  style={{ background: currentStep > step.id ? '#C9A84C' : '#2A2A2A' }}
                />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Room Selection */}
            {currentStep === 1 && (
              <div className="rounded-2xl overflow-hidden" style={{ background: '#111111', border: '1px solid #2A2A2A' }}>
                <div className="p-5 border-b" style={{ borderColor: '#2A2A2A' }}>
                  <h3 className="font-display text-xl" style={{ color: '#F8F4EF' }}>Select Your Room &amp; Dates</h3>
                </div>
                <div className="p-5 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[{ l: 'Check-in Date', v: bookingDraft.checkIn, fn: v => updateBookingDraft({ checkIn: v }), min: new Date().toISOString().split('T')[0] },
                      { l: 'Check-out Date', v: bookingDraft.checkOut, fn: v => updateBookingDraft({ checkOut: v }), min: bookingDraft.checkIn || new Date().toISOString().split('T')[0] }].map(d => (
                      <div key={d.l}>
                        <label className="block text-xs font-body tracking-widest uppercase mb-1.5" style={{ color: 'rgba(248,244,239,0.4)' }}>{d.l}</label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#C9A84C' }} />
                          <input type="date" value={d.v || ''} onChange={e => d.fn(e.target.value)} min={d.min}
                            className="luxury-input w-full h-10 pl-10 pr-3 text-sm" />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-xs font-body tracking-widest uppercase mb-1.5" style={{ color: 'rgba(248,244,239,0.4)' }}>Number of Guests</label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#C9A84C' }} />
                      <select value={bookingDraft.guests} onChange={e => updateBookingDraft({ guests: Number(e.target.value) })}
                        className="luxury-input w-full h-10 pl-10 pr-3 text-sm appearance-none">
                        {[1, 2, 3, 4, 5].map(n => (
                          <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="block text-xs font-body tracking-widest uppercase mb-3" style={{ color: 'rgba(248,244,239,0.4)' }}>Selected Room</label>
                    {selectedRoom ? (
                      <div className="p-4 rounded-xl" style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)' }}>
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-display text-base" style={{ color: '#F8F4EF' }}>{selectedRoom.name}</h4>
                            <p className="text-sm font-body mt-0.5" style={{ color: 'rgba(248,244,239,0.4)' }}>
                              {selectedRoom.bedType || selectedRoom.beds} | {selectedRoom.size} sq ft | Up to {(selectedRoom.capacity?.adults || 0) + (selectedRoom.capacity?.children || 0) || selectedRoom.capacity} guests
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="font-display text-lg" style={{ color: '#C9A84C' }}>PKR {Number(basePrice).toLocaleString('en-US')}</div>
                            <div className="text-xs font-body" style={{ color: 'rgba(248,244,239,0.4)' }}>per night</div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm font-body" style={{ color: 'rgba(248,244,239,0.4)' }}>No room selected. Please go back to rooms page.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Guest Details */}
            {currentStep === 2 && (
              <div className="rounded-2xl overflow-hidden" style={{ background: '#111111', border: '1px solid #2A2A2A' }}>
                <div className="p-5 border-b" style={{ borderColor: '#2A2A2A' }}>
                  <h3 className="font-display text-xl" style={{ color: '#F8F4EF' }}>Guest Information</h3>
                </div>
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[{ l: 'First Name', v: guestDetails.firstName, k: 'firstName', ph: 'John' },
                      { l: 'Last Name', v: guestDetails.lastName, k: 'lastName', ph: 'Doe' }].map(f => (
                      <div key={f.k}>
                        <label className="block text-xs font-body tracking-widest uppercase mb-1.5" style={{ color: 'rgba(248,244,239,0.4)' }}>{f.l}</label>
                        <input className="luxury-input w-full h-10 px-3 text-sm" value={f.v}
                          onChange={e => setGuestDetails({ ...guestDetails, [f.k]: e.target.value })} placeholder={f.ph} />
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="block text-xs font-body tracking-widest uppercase mb-1.5" style={{ color: 'rgba(248,244,239,0.4)' }}>Email Address</label>
                    <input type="email" className="luxury-input w-full h-10 px-3 text-sm" value={guestDetails.email}
                      onChange={e => setGuestDetails({ ...guestDetails, email: e.target.value })} placeholder="john@example.com" />
                  </div>
                  <div>
                    <label className="block text-xs font-body tracking-widest uppercase mb-1.5" style={{ color: 'rgba(248,244,239,0.4)' }}>Phone Number</label>
                    <input type="tel" className="luxury-input w-full h-10 px-3 text-sm" value={guestDetails.phone}
                      onChange={e => setGuestDetails({ ...guestDetails, phone: e.target.value })} placeholder="+1 (555) 123-4567" />
                  </div>
                  <div>
                    <label className="block text-xs font-body tracking-widest uppercase mb-1.5" style={{ color: 'rgba(248,244,239,0.4)' }}>Special Requests (Optional)</label>
                    <textarea value={guestDetails.specialRequests}
                      onChange={e => setGuestDetails({ ...guestDetails, specialRequests: e.target.value })}
                      placeholder="Any special requests or requirements..." rows={4}
                      className="luxury-input w-full px-3 py-2.5 text-sm resize-none" />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {currentStep === 3 && (
              <div className="rounded-2xl overflow-hidden" style={{ background: '#111111', border: '1px solid #2A2A2A' }}>
                <div className="p-5 border-b" style={{ borderColor: '#2A2A2A' }}>
                  <h3 className="font-display text-xl" style={{ color: '#F8F4EF' }}>Payment Details</h3>
                  <p className="text-xs font-body mt-1" style={{ color: 'rgba(248,244,239,0.4)' }}>Demo mode — no real charge will occur</p>
                </div>
                <div className="p-5 space-y-4">
                  {bookingError && (
                    <div className="p-3 rounded-xl text-sm font-body flex items-center gap-2" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
                      ⚠ {bookingError}
                    </div>
                  )}
                  {/* Card Number */}
                  <div>
                    <label className="block text-xs font-body tracking-widest uppercase mb-1.5" style={{ color: '#C9A84C' }}>Card Number</label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#C9A84C' }} />
                      <input
                        className="luxury-input w-full h-10 pl-10 pr-3 text-sm tracking-widest"
                        placeholder="4242 4242 4242 4242"
                        value={payment.cardNumber}
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        onChange={e => setPayment({ ...payment, cardNumber: formatCardNumber(e.target.value) })}
                      />
                    </div>
                    {paymentErrors.cardNumber && <p className="text-xs mt-1 font-body" style={{ color: '#f87171' }}>⚠ {paymentErrors.cardNumber}</p>}
                  </div>
                  {/* Expiry + CVC */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-body tracking-widest uppercase mb-1.5" style={{ color: '#C9A84C' }}>Expiry Date</label>
                      <input
                        className="luxury-input w-full h-10 px-3 text-sm"
                        placeholder="MM/YY"
                        value={payment.expiry}
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        onChange={e => setPayment({ ...payment, expiry: formatExpiry(e.target.value) })}
                      />
                      {paymentErrors.expiry && <p className="text-xs mt-1 font-body" style={{ color: '#f87171' }}>⚠ {paymentErrors.expiry}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-body tracking-widest uppercase mb-1.5" style={{ color: '#C9A84C' }}>CVC</label>
                      <input
                        className="luxury-input w-full h-10 px-3 text-sm tracking-widest"
                        placeholder="123"
                        maxLength={4}
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        value={payment.cvc}
                        onChange={e => setPayment({ ...payment, cvc: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                      />
                      {paymentErrors.cvc && <p className="text-xs mt-1 font-body" style={{ color: '#f87171' }}>⚠ {paymentErrors.cvc}</p>}
                    </div>
                  </div>
                  {/* Name on Card */}
                  <div>
                    <label className="block text-xs font-body tracking-widest uppercase mb-1.5" style={{ color: '#C9A84C' }}>Name on Card</label>
                    <input
                      className="luxury-input w-full h-10 px-3 text-sm"
                      placeholder="John Doe"
                      value={payment.nameOnCard}
                      autoComplete="one-time-code"
                      onChange={e => setPayment({ ...payment, nameOnCard: e.target.value })}
                    />
                    {paymentErrors.nameOnCard && <p className="text-xs mt-1 font-body" style={{ color: '#f87171' }}>⚠ {paymentErrors.nameOnCard}</p>}
                  </div>
                  <div className="p-3 rounded-xl flex items-center gap-2 text-xs font-body" style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)', color: 'rgba(248,244,239,0.5)' }}>
                    🔒 Your payment info is encrypted and secure
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Confirmation — uses confirmedBooking (always available after submit) */}
            {currentStep === 4 && (
              <div className="rounded-2xl" style={{ background: '#111111', border: '1px solid rgba(34,197,94,0.25)' }}>
                <div className="py-12 px-5 text-center">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 animate-scaleIn"
                    style={{ background: 'rgba(34,197,94,0.1)', border: '2px solid rgba(34,197,94,0.3)' }}>
                    <Check className="w-10 h-10" style={{ color: '#4ade80' }} />
                  </div>
                  <p className="text-xs font-body tracking-[0.3em] uppercase mb-2" style={{ color: '#4ade80' }}>Reservation Confirmed</p>
                  <h2 className="font-display font-light text-3xl mb-2" style={{ color: '#F8F4EF' }}>Booking Confirmed!</h2>
                  <p className="font-body text-sm mb-8" style={{ color: 'rgba(248,244,239,0.45)' }}>
                    A confirmation email has been sent to {guestDetails.email}
                  </p>

                  <div className="p-6 rounded-2xl text-left max-w-sm mx-auto mb-8"
                    style={{ background: '#1A1A1A', border: '1px solid rgba(201,168,76,0.2)' }}>
                    <p className="text-xs font-body tracking-widest uppercase mb-4" style={{ color: '#C9A84C' }}>Booking Details</p>
                    <div className="text-sm space-y-3 font-body">
                      {[
                        { l: 'Confirmation #', v: confirmedBooking?.confirmationNumber || ('GH-' + Date.now().toString().slice(-6)) },
                        { l: 'Guest', v: `${guestDetails.firstName} ${guestDetails.lastName}` },
                        { l: 'Room', v: confirmedBooking?.roomName || selectedRoom?.name || 'Your room' },
                        { l: 'Check-in', v: confirmedBooking?.checkIn ? new Date(confirmedBooking.checkIn).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—' },
                        { l: 'Check-out', v: confirmedBooking?.checkOut ? new Date(confirmedBooking.checkOut).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—' },
                        { l: `${confirmedBooking?.nights || nights} Night${(confirmedBooking?.nights || nights) > 1 ? 's' : ''}`, v: `${confirmedBooking?.guests || bookingDraft.guests} Guest${(confirmedBooking?.guests || bookingDraft.guests) > 1 ? 's' : ''}` },
                      ].map(({ l, v }) => (
                        <div key={l} className="flex justify-between">
                          <span style={{ color: 'rgba(248,244,239,0.4)' }}>{l}</span>
                          <span style={{ color: '#F8F4EF', fontWeight: 500 }}>{v}</span>
                        </div>
                      ))}
                      <div className="flex justify-between items-center font-display text-lg pt-3" style={{ borderTop: '1px solid rgba(201,168,76,0.2)', color: '#C9A84C' }}>
                        <span>Total Paid</span>
                        <span>PKR {Number(confirmedBooking?.totalAmount || total).toLocaleString('en-US')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    {isAuthenticated ? (
                      <button className="btn-gold px-6 py-3 rounded-xl text-xs font-body tracking-widest uppercase"
                        onClick={() => navigate('/guest/bookings')}>View My Bookings</button>
                    ) : (
                      <button className="btn-gold px-6 py-3 rounded-xl text-xs font-body tracking-widest uppercase"
                        onClick={() => navigate('/register')}>Create Account</button>
                    )}
                    <button className="px-6 py-3 rounded-xl text-xs font-body tracking-widest uppercase transition-all"
                      style={{ border: '1px solid rgba(201,168,76,0.3)', color: '#C9A84C' }}
                      onClick={() => navigate('/')}>Back to Home</button>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            {currentStep < 4 && (
              <div className="flex justify-between mt-6">
                <button className="px-5 py-2.5 rounded-xl text-xs font-body tracking-widest uppercase transition-all"
                  style={{ border: '1px solid rgba(201,168,76,0.3)', color: currentStep === 1 ? 'rgba(201,168,76,0.3)' : '#C9A84C' }}
                  onClick={handleBack} disabled={currentStep === 1}>
                  Back
                </button>
                {currentStep === 3 ? (
                  <button className="btn-gold px-6 py-2.5 rounded-xl text-xs font-body tracking-widest uppercase disabled:opacity-50"
                    onClick={handleSubmit} disabled={isLoading}>
                    {isLoading ? 'Confirming…' : 'Complete Booking'}
                  </button>
                ) : (
                  <button className="btn-gold px-6 py-2.5 rounded-xl text-xs font-body tracking-widest uppercase flex items-center gap-2 disabled:opacity-50"
                    onClick={handleNext} disabled={!canProceed()}>
                    Continue <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Order Summary */}
          {currentStep < 4 && selectedRoom && (
            <div className="lg:col-span-1">
              <div className="sticky top-24 rounded-2xl" style={{ background: '#111111', border: '1px solid rgba(201,168,76,0.2)' }}>
                <div className="p-5 border-b" style={{ borderColor: '#2A2A2A' }}>
                  <p className="text-xs font-body tracking-widest uppercase mb-0.5" style={{ color: '#C9A84C' }}>Summary</p>
                  <h3 className="font-display text-lg" style={{ color: '#F8F4EF' }}>Booking Summary</h3>
                </div>
                <div className="p-5">
                  <div className="mb-4 pb-4" style={{ borderBottom: '1px solid #2A2A2A' }}>
                    <h4 className="font-display text-base" style={{ color: '#F8F4EF' }}>{selectedRoom.name}</h4>
                    <p className="text-xs font-body mt-1" style={{ color: 'rgba(248,244,239,0.4)' }}>Room {selectedRoom.roomNumber || selectedRoom.number}</p>
                  </div>

                  {nights > 0 && (
                    <>
                      <div className="space-y-2 text-sm mb-4">
                        {[{ l: 'Check-in', v: new Date(bookingDraft.checkIn).toLocaleDateString() },
                          { l: 'Check-out', v: new Date(bookingDraft.checkOut).toLocaleDateString() },
                          { l: 'Guests', v: bookingDraft.guests },
                          { l: 'Nights', v: nights }].map(({ l, v }) => (
                          <div key={l} className="flex justify-between">
                            <span style={{ color: 'rgba(248,244,239,0.4)' }}>{l}</span>
                            <span className="font-body" style={{ color: '#F8F4EF' }}>{v}</span>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-2 text-sm pt-4" style={{ borderTop: '1px solid #2A2A2A' }}>
                        <div className="flex justify-between">
                          <span style={{ color: 'rgba(248,244,239,0.4)' }}>PKR {Number(basePrice).toLocaleString('en-US')} x {nights} nights</span>
                          <span className="font-body" style={{ color: '#F8F4EF' }}>PKR {Number(subtotal).toLocaleString('en-US')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span style={{ color: 'rgba(248,244,239,0.4)' }}>Service fee</span>
                          <span className="font-body" style={{ color: '#F8F4EF' }}>PKR {Number(serviceFee).toLocaleString('en-US')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span style={{ color: 'rgba(248,244,239,0.4)' }}>Taxes</span>
                          <span className="font-body" style={{ color: '#F8F4EF' }}>PKR {Number(taxes).toLocaleString('en-US')}</span>
                        </div>
                        <div className="flex justify-between font-display text-lg pt-3" style={{ borderTop: '1px solid rgba(201,168,76,0.2)', color: '#C9A84C' }}>
                          <span>Total</span>
                          <span>PKR {Number(total).toLocaleString('en-US')}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
