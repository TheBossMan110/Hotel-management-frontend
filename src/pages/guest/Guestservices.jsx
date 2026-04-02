import { useState, useEffect } from 'react'
import { useBookingsStore } from '../../stores/bookingsStore'
import { useServiceStore } from '../../stores/serviceStore'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import { formatDate } from '../../lib/utils'

const SERVICE_TYPES = [
  {
    id: 'room-service',
    label: 'Room Service',
    description: 'Order food and beverages to your room',
    icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z',
    color: 'bg-orange-100 text-orange-600',
    items: ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Beverages', 'Mini Bar Restock']
  },
  {
    id: 'wake-up-call',
    label: 'Wake-up Call',
    description: 'Schedule a wake-up call at your desired time',
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    color: 'bg-blue-100 text-blue-600',
    items: null
  },
  {
    id: 'transportation',
    label: 'Transportation',
    description: 'Arrange taxi, airport transfer or car rental',
    icon: 'M8 17l4 4 4-4m-4-5v9M20.88 18.09A5 5 0 0018 9h-1.26A8 8 0 103 16.29',
    color: 'bg-green-100 text-green-600',
    items: ['Airport Pickup', 'Airport Drop-off', 'City Tour', 'Car Rental', 'Taxi']
  },
  {
    id: 'housekeeping',
    label: 'Extra Cleaning',
    description: 'Request additional housekeeping services',
    icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z',
    color: 'bg-purple-100 text-purple-600',
    items: ['Room Cleaning', 'Towel Change', 'Bed Change', 'Bathroom Clean', 'Turn-down Service']
  },
  {
    id: 'laundry',
    label: 'Laundry',
    description: 'Laundry, dry cleaning and pressing',
    icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01',
    color: 'bg-pink-100 text-pink-600',
    items: ['Wash & Fold', 'Dry Cleaning', 'Pressing/Ironing', 'Express (3hr)']
  },
  {
    id: 'guest-request',
    label: 'Special Request',
    description: 'Any other request or special need',
    icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    color: 'bg-amber-100 text-amber-600',
    items: null
  }
]

const STATUS_VARIANTS = {
  pending: 'warning',
  acknowledged: 'default',
  'in-progress': 'default',
  completed: 'success',
  cancelled: 'destructive'
}

export default function GuestServices() {
  const { myBookings, fetchMyBookings } = useBookingsStore()
  const { myRequests, fetchMyRequests, createRequest, isLoading: serviceLoading } = useServiceStore()

  const [showModal, setShowModal] = useState(false)
  const [selectedService, setSelectedService] = useState(null)
  const [form, setForm] = useState({ item: '', description: '', time: '', priority: 'normal' })
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [submitted, setSubmitted] = useState(false)

  const activeBooking = myBookings.find(b => b.status === 'checked-in')

  useEffect(() => {
    fetchMyBookings()
    fetchMyRequests()
  }, [])

  const openModal = (service) => {
    setSelectedService(service)
    setForm({ item: service.items ? service.items[0] : '', description: '', time: '', priority: 'normal' })
    setSubmitError(null)
    setSubmitted(false)
    setShowModal(true)
  }

  const handleSubmit = async () => {
    if (!activeBooking && selectedService.id !== 'transportation') {
      setSubmitError('You need an active (checked-in) booking to request services.')
      return
    }

    setSubmitting(true)
    setSubmitError(null)

    const bookingId = activeBooking?._id || activeBooking?.id

    const description = [
      form.item && `Item: ${form.item}`,
      form.description,
      form.time && `Requested time: ${form.time}`
    ].filter(Boolean).join('\n')

    const result = await createRequest({
      bookingId,
      type: selectedService.id === 'wake-up-call' ? 'guest-request' : selectedService.id,
      description: `${selectedService.label}${form.item ? ` — ${form.item}` : ''}\n${description}`,
      items: form.item ? [{ name: form.item, quantity: 1 }] : [],
      scheduledTime: form.time || undefined,
      priority: form.priority
    })

    setSubmitting(false)

    if (result.success) {
      setSubmitted(true)
      fetchMyRequests()
    } else {
      setSubmitError(result.error || 'Failed to submit request. Please try again.')
    }
  }

  return (
    <div className="flex flex-col gap-6" style={{ color: '#F8F4EF' }}>
      <div>
        <p className="text-xs font-body tracking-[0.3em] uppercase mb-1" style={{ color: '#C9A84C' }}>Requests</p>
        <h1 className="font-display font-light text-3xl" style={{ color: '#F8F4EF' }}>Guest Services</h1>
        <p className="font-body text-sm mt-1" style={{ color: 'rgba(248,244,239,0.45)' }}>Request services and amenities during your stay</p>
      </div>

      {/* Active stay banner */}
      {activeBooking ? (
        <div className="flex items-center gap-3 p-4 rounded-xl"
          style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(34,197,94,0.1)' }}>
            <svg className="w-5 h-5" style={{ color: '#4ade80' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="font-body font-medium" style={{ color: '#F8F4EF' }}>Active Stay</p>
            <p className="text-sm font-body" style={{ color: 'rgba(248,244,239,0.5)' }}>
              Room {activeBooking.room?.roomNumber || '—'} · Check-out {formatDate(activeBooking.checkOut)}
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl text-sm font-body"
          style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.2)', color: 'rgba(234,179,8,0.9)' }}>
          You don't have an active check-in. Service requests for in-room services require a checked-in booking.
        </div>
      )}

      {/* Service Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {SERVICE_TYPES.map(service => (
          <div
            key={service.id}
            className="group rounded-2xl p-5 cursor-pointer transition-all duration-300"
            style={{ background: '#111111', border: '1px solid #2A2A2A' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)'; e.currentTarget.style.boxShadow = '0 0 30px rgba(201,168,76,0.08)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#2A2A2A'; e.currentTarget.style.boxShadow = 'none' }}
            onClick={() => openModal(service)}
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110"
                style={{ background: 'rgba(201,168,76,0.1)' }}>
                <svg className="w-6 h-6" style={{ color: '#C9A84C' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={service.icon} />
                </svg>
              </div>
              <div>
                <h3 className="font-display text-lg mb-1" style={{ color: '#F8F4EF' }}>{service.label}</h3>
                <p className="text-sm font-body" style={{ color: 'rgba(248,244,239,0.45)' }}>{service.description}</p>
              </div>
            </div>
            <button className="w-full py-2 rounded-xl text-xs font-body tracking-widest uppercase transition-all"
              style={{ border: '1px solid rgba(201,168,76,0.3)', color: '#C9A84C' }}>
              Request
            </button>
          </div>
        ))}
      </div>

      {/* My Requests */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>My Service Requests</CardTitle>
            <Button variant="ghost" size="sm" onClick={fetchMyRequests}>Refresh</Button>
          </div>
        </CardHeader>
        <CardContent>
          {serviceLoading && myRequests.length === 0 ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : myRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p>No requests yet</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {myRequests.map(req => (
                <div key={req._id || req.id} className="flex items-center justify-between p-3 bg-accent/30 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{req.description?.split('\n')[0] || req.type}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {req.room?.roomNumber ? `Room ${req.room.roomNumber} · ` : ''}{new Date(req.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant={STATUS_VARIANTS[req.status] || 'outline'}>
                    {req.status?.replace('-', ' ')}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Request Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={selectedService ? `Request ${selectedService.label}` : ''}
      >
        {selectedService && (
          <div className="flex flex-col gap-4">
            {submitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg mb-2">Request Submitted!</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Our staff will attend to your request shortly.
                </p>
                <Button onClick={() => setShowModal(false)}>Close</Button>
              </div>
            ) : (
              <>
                {/* Item selector */}
                {selectedService.items && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Option</label>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedService.items.map(item => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setForm(p => ({ ...p, item }))}
                          className={`px-3 py-2 text-sm rounded-lg border transition-colors ${form.item === item ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-accent'}`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Time for wake-up call */}
                {selectedService.id === 'wake-up-call' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Wake-up Time</label>
                    <input
                      type="time"
                      value={form.time}
                      onChange={e => setForm(p => ({ ...p, time: e.target.value }))}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                )}

                {/* Time for transportation */}
                {selectedService.id === 'transportation' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Pickup Date & Time</label>
                    <input
                      type="datetime-local"
                      value={form.time}
                      onChange={e => setForm(p => ({ ...p, time: e.target.value }))}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                )}

                {/* Priority */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <div className="flex gap-2">
                    {[
                      { value: 'low', label: 'Low', color: 'bg-green-100 text-green-700 border-green-200' },
                      { value: 'normal', label: 'Normal', color: 'bg-blue-100 text-blue-700 border-blue-200' },
                      { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-700 border-red-200' }
                    ].map(p => (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, priority: p.value }))}
                        className={`flex-1 py-2 text-sm rounded-lg border font-medium transition-colors ${form.priority === p.value ? p.color : 'border-border hover:bg-accent'}`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Additional Details (optional)</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    placeholder="Any specific instructions or notes..."
                    rows={3}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  />
                </div>

                {submitError && <p className="text-sm text-destructive">{submitError}</p>}

                <div className="flex gap-3">
                  <Button onClick={handleSubmit} disabled={submitting} className="flex-1">
                    {submitting ? 'Submitting…' : 'Submit Request'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
