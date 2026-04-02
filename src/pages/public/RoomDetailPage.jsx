import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  Star, Users, Maximize, Calendar, ArrowLeft, Check,
  Wifi, Tv, Coffee, Wind, Bath, BedDouble, LogIn,
  MapPin, Building2, ChevronLeft, ChevronRight, Shield,
  Clock, Sparkles, Phone
} from 'lucide-react'
import Button from '../../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import useBookingsStore from '../../stores/bookingsStore'
import useAuthStore from '../../stores/authStore'
import { calculateNights } from '../../lib/utils'
import { mockRooms, getRoomById } from '../../data/mockData'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const AMENITY_ICONS = {
  WiFi: Wifi, TV: Tv, 'Coffee Maker': Coffee, 'Air Conditioning': Wind,
  Jacuzzi: Bath, 'King Bed': BedDouble, Spa: Sparkles,
}

const pkr = (n) => `PKR ${Number(n||0).toLocaleString('en-PK')}`

const getRoomCity = (r) => {
  if (r.city) return r.city;
  const match = ['Karachi', 'Lahore', 'Islamabad', 'Peshawar', 'Quetta'].find(c => r.name?.includes(c) || r.hotelName?.includes(c));
  return match || '';
}

// Resolve images whether from API ({url}) or mock (plain string)
const resolveImages = (room) => {
  const raw = room.images || []
  const imgs = raw.map(img => (typeof img === 'string' ? img : img?.url)).filter(Boolean)
  if (imgs.length > 0) return imgs
  // absolute fallback by type
  const fallbacks = {
    standard:  'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=85',
    deluxe:    'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200&q=85',
    suite:     'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=85',
    penthouse: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&q=85',
  }
  return [fallbacks[room.type] || fallbacks.standard]
}

// ─── Image Gallery ────────────────────────────────────────────────────────────
function ImageGallery({ images, roomName }) {
  const [active, setActive] = useState(0)

  const prev = () => setActive(i => (i - 1 + images.length) % images.length)
  const next = () => setActive(i => (i + 1) % images.length)

  return (
    <div className="mb-6">
      {/* Main image */}
      <div className="relative aspect-[16/10] rounded-2xl overflow-hidden shadow-xl"
        style={{ background: '#111111' }}>
        <img key={active} src={images[active]} alt={`${roomName} – photo ${active + 1}`}
          className="w-full h-full object-cover"
          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200' }}
        />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(to top, rgba(10,10,10,0.4) 0%, transparent 50%)' }} />

        {images.length > 1 && (
          <>
            <button onClick={prev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full backdrop-blur-sm flex items-center justify-center transition-all"
              style={{ background: 'rgba(0,0,0,0.5)', color: '#F8F4EF' }}>
              <ChevronLeft className="w-5 h-5"/>
            </button>
            <button onClick={next}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full backdrop-blur-sm flex items-center justify-center transition-all"
              style={{ background: 'rgba(0,0,0,0.5)', color: '#F8F4EF' }}>
              <ChevronRight className="w-5 h-5"/>
            </button>
          </>
        )}

        {images.length > 1 && (
          <div className="absolute bottom-4 right-4 backdrop-blur-sm text-xs px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(0,0,0,0.6)', color: 'rgba(248,244,239,0.8)' }}>
            {active + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button key={i} onClick={() => setActive(i)}
              className={`flex-shrink-0 w-20 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                i === active ? 'scale-105' : 'opacity-50 hover:opacity-80'
              }`}
              style={{ borderColor: i === active ? '#C9A84C' : 'transparent' }}>
              <img src={src} alt="" className="w-full h-full object-cover"
                onError={e => { e.target.src = 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400' }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Star Row ─────────────────────────────────────────────────────────────────
function Stars({ rating }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(n => (
        <Star key={n}
          className={`w-4 h-4 ${n <= Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`}
        />
      ))}
    </span>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function RoomDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { updateBookingDraft } = useBookingsStore()
  const { isAuthenticated } = useAuthStore()

  const [room, setRoom]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [checkIn, setCheckIn]   = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests]     = useState(1)

  const [allRooms, setAllRooms] = useState(mockRooms)
  const [recommendedRooms, setRecommendedRooms] = useState([])

  // Load all rooms to pick recommendations
  useEffect(() => {
    fetch(`${API_URL}/rooms?limit=1000`)
      .then(r => r.json())
      .then(d => { if (d.rooms?.length > 0) setAllRooms(d.rooms) })
      .catch(() => {})
  }, [])

  // Rotate recommended rooms from the same city
  useEffect(() => {
    if (!room) return
    const city = getRoomCity(room)
    const sameCity = allRooms.filter(r => getRoomCity(r) === city && r._id !== room._id && r.id !== room.id)
    
    if (sameCity.length === 0) return

    const tick = () => {
      const shuffled = [...sameCity].sort(() => 0.5 - Math.random())
      setRecommendedRooms(shuffled.slice(0, 3))
    }
    
    tick()
    const intv = setInterval(tick, 10000)
    return () => clearInterval(intv)
  }, [allRooms, room])

  // API → mock fallback
  useEffect(() => {
    setLoading(true)
    fetch(`${API_URL}/rooms/${id}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then(d => { setRoom(d.room); setLoading(false) })
      .catch(() => {
        // Try mock data — id may be like "pk_h002_dlx"
        const found = getRoomById(id) || mockRooms.find(r => r.id === id || r._id === id)
        setRoom(found || null)
        setLoading(false)
      })
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"/>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4"/>
          <h2 className="font-serif text-2xl font-bold mb-2">Room not found</h2>
          <p className="text-muted-foreground mb-6">This room may no longer be available.</p>
          <Link to="/rooms"><Button variant="outline"><ArrowLeft className="w-4 h-4 mr-2"/>Back to Rooms</Button></Link>
        </div>
      </div>
    )
  }

  const images     = resolveImages(room)
  const nights     = checkIn && checkOut ? calculateNights(checkIn, checkOut) : 0
  const basePrice  = room.price?.basePrice ?? room.price ?? 0
  const totalPrice = nights * basePrice
  const serviceFee = nights * 1500
  const taxes      = totalPrice * 0.1
  const grandTotal = totalPrice + serviceFee + taxes

  const rating     = typeof room.rating === 'object' ? (room.rating?.average ?? 4.5) : (room.rating ?? 4.5)
  const reviewCount = typeof room.rating === 'object' ? (room.rating?.count ?? room.reviews ?? 0) : (room.reviews ?? 0)
  const capacity   = room.capacity?.adults ? room.capacity.adults + (room.capacity.children || 0) : room.capacity

  const handleBookNow = () => {
    updateBookingDraft({ roomId: room._id || room.id, checkIn, checkOut, guests })
    navigate(isAuthenticated ? '/booking' : '/login?returnUrl=%2Fbooking')
  }

  return (
    <div className="min-h-screen pt-20" style={{ background: '#0A0A0A', color: '#F8F4EF' }}>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Back */}
        <Link to="/rooms" className="inline-flex items-center gap-2 text-sm mb-6 hover:opacity-70 transition-opacity"
          style={{ color: 'rgba(248,244,239,0.5)' }}>
          <ArrowLeft className="w-4 h-4"/> Back to Rooms
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── LEFT: details ── */}
          <div className="lg:col-span-2">

            {/* Image gallery */}
            <ImageGallery images={images} roomName={room.name} />

            {/* Title row */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-xs font-body capitalize px-3 py-1 rounded-full"
                    style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)', color: '#C9A84C' }}>
                    {room.type}
                  </span>
                  {getRoomCity(room) && (
                    <span className="flex items-center gap-1 text-sm"
                      style={{ color: 'rgba(248,244,239,0.4)' }}>
                      <MapPin className="w-3.5 h-3.5"/>{getRoomCity(room)}
                      {room.province && `, ${room.province}`}
                    </span>
                  )}
                </div>
                <h1 className="font-display font-light mb-3" style={{ color: '#F8F4EF', fontSize: 'clamp(28px, 4vw, 48px)', lineHeight: 1.1 }}>{room.name}</h1>
                {room.hotelName && room.hotelName !== room.name && (
                  <p className="flex items-center gap-1.5 text-sm mb-3"
                    style={{ color: 'rgba(248,244,239,0.4)' }}>
                    <Building2 className="w-4 h-4"/> {room.hotelName}
                    {room.address && <span>· {room.address}</span>}
                  </p>
                )}
                <div className="flex items-center gap-3 flex-wrap">
                  <Stars rating={rating}/>
                  <span className="font-body font-semibold text-sm" style={{ color: '#F8F4EF' }}>{rating}</span>
                  <span className="text-sm" style={{ color: 'rgba(248,244,239,0.4)' }}>({reviewCount} reviews)</span>
                  <span style={{ color: '#2A2A2A' }}>·</span>
                  <span className="text-sm" style={{ color: 'rgba(248,244,239,0.4)' }}>Room {room.number || room.roomNumber} · Floor {room.floor}</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="font-display text-3xl" style={{ color: '#C9A84C' }}>{pkr(basePrice)}</div>
                <div className="text-sm" style={{ color: 'rgba(248,244,239,0.45)' }}>per night</div>
                <span className="mt-2 inline-block text-xs font-body px-3 py-1 rounded-full"
                  style={room.status === 'available'
                    ? { background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80' }
                    : { background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', color: '#fbbf24' }
                  }>
                  {room.status === 'available' ? '✓ Available' : 'Currently Occupied'}
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="leading-relaxed mb-8 text-base"
              style={{ color: 'rgba(248,244,239,0.55)' }}>
              {room.description?.full || room.description?.short || room.description}
            </p>

            {/* Quick specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              {[
                { icon: Maximize,  label: 'Room Size',   val: `${room.size} sq ft` },
                { icon: Users,     label: 'Max Guests',  val: `${capacity} Guests` },
                { icon: BedDouble, label: 'Bed Type',    val: room.bedType || room.beds },
                { icon: Star,      label: 'Room Type',   val: room.type },
              ].map(s => (
                <div key={s.label}
                  className="p-4 rounded-2xl text-center transition-all duration-300 gold-border-glow"
                  style={{ background: '#111111' }}>
                  <s.icon className="w-6 h-6 mx-auto mb-2" style={{ color: '#C9A84C' }}/>
                  <div className="font-body font-semibold text-sm capitalize" style={{ color: '#F8F4EF' }}>{s.val}</div>
                  <div className="text-xs font-body" style={{ color: 'rgba(248,244,239,0.4)' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Amenities */}
            <div className="mb-6 p-6 rounded-2xl" style={{ background: '#111111', border: '1px solid #2A2A2A' }}>
              <h3 className="font-display text-lg mb-4" style={{ color: '#F8F4EF' }}>What&apos;s Included</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {(room.amenities || []).map(a => {
                  const Icon = AMENITY_ICONS[a] || Check
                  return (
                    <div key={a} className="flex items-center gap-3 p-2 rounded-xl transition-colors"
                      style={{ background: 'transparent' }}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(201,168,76,0.1)' }}>
                        <Icon className="w-4 h-4" style={{ color: '#C9A84C' }}/>
                      </div>
                      <span className="text-sm font-body" style={{ color: 'rgba(248,244,239,0.7)' }}>{a}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Policies */}
            <div className="mb-6 p-6 rounded-2xl" style={{ background: '#111111', border: '1px solid #2A2A2A' }}>
              <h3 className="font-display text-lg mb-4" style={{ color: '#F8F4EF' }}>Room Policies</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { icon: Clock,   title: 'Check-in',           sub: '3:00 PM – 12:00 AM · Early check-in subject to availability' },
                  { icon: Clock,   title: 'Check-out',          sub: '11:00 AM · Late check-out available on request' },
                  { icon: Shield,  title: 'Free Cancellation',  sub: 'Cancel up to 48 hours before check-in at no charge' },
                  { icon: Phone,   title: '24/7 Concierge',     sub: 'Round-the-clock support for any request during your stay' },
                ].map(p => (
                  <div key={p.title} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: 'rgba(201,168,76,0.1)' }}>
                      <p.icon className="w-4 h-4" style={{ color: '#C9A84C' }}/>
                    </div>
                    <div>
                      <div className="font-body font-medium text-sm" style={{ color: '#F8F4EF' }}>{p.title}</div>
                      <div className="text-xs font-body mt-0.5" style={{ color: 'rgba(248,244,239,0.4)' }}>{p.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Rooms */}
            {recommendedRooms.length > 0 && (
              <div className="mt-12 mb-8">
                <h2 className="font-display font-light text-2xl mb-6" style={{ color: '#F8F4EF' }}>More in {getRoomCity(room)}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {recommendedRooms.map(rec => (
                    <Link key={rec.id || rec._id} to={`/rooms/${rec.id || rec._id}`} className="block group h-full">
                      <div className="overflow-hidden rounded-2xl transition-all duration-300 gold-border-glow h-full flex flex-col"
                        style={{ background: '#111111' }}>
                        <div className="aspect-[4/3] relative overflow-hidden flex-shrink-0">
                          <img src={resolveImages(rec)[0]} alt={rec.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800' }}
                          />
                          <div className="absolute top-2 right-2 backdrop-blur-sm px-2 py-1 rounded text-xs font-display shadow"
                            style={{ background: 'rgba(201,168,76,0.9)', color: '#0A0A0A' }}>
                            {pkr(rec.price?.basePrice ?? rec.price ?? 0)}
                          </div>
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                          <span className="text-xs font-body capitalize mb-2 px-2 py-0.5 rounded-full w-fit"
                            style={{ background: 'rgba(201,168,76,0.1)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.2)' }}>
                            {rec.type}
                          </span>
                          <h3 className="font-display text-sm group-hover:opacity-70 transition-opacity leading-tight line-clamp-2"
                            style={{ color: '#F8F4EF' }}>{rec.name}</h3>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT: Booking card ── */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl overflow-hidden" style={{ background: '#111111', border: '1px solid rgba(201,168,76,0.2)' }}>
              <div className="p-5 border-b" style={{ borderColor: '#2A2A2A' }}>
                <p className="text-xs font-body tracking-widest uppercase mb-1" style={{ color: '#C9A84C' }}>Reserve</p>
                <h3 className="font-display text-xl" style={{ color: '#F8F4EF' }}>Your Room</h3>
                <p className="text-xs font-body mt-1" style={{ color: 'rgba(248,244,239,0.35)' }}>No payment charged until checkout</p>
              </div>
              <div className="p-5 space-y-4">
                {/* Price header */}
                <div className="flex items-baseline gap-2 pb-3" style={{ borderBottom: '1px solid #2A2A2A' }}>
                  <span className="font-display text-2xl" style={{ color: '#C9A84C' }}>{pkr(basePrice)}</span>
                  <span className="text-sm" style={{ color: 'rgba(248,244,239,0.4)' }}>/ night</span>
                </div>

                {!isAuthenticated && (
                  <div className="p-3 rounded-xl"
                    style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)' }}>
                    <p className="text-sm font-body flex items-center gap-2" style={{ color: '#C9A84C' }}>
                      <LogIn className="w-4 h-4"/> Sign in required to complete booking
                    </p>
                  </div>
                )}

                {/* Dates */}
                <div className="grid grid-cols-2 gap-2">
                  {[{ l: 'Check-in', v: checkIn, fn: setCheckIn, min: new Date().toISOString().split('T')[0] },
                    { l: 'Check-out', v: checkOut, fn: setCheckOut, min: checkIn || new Date().toISOString().split('T')[0] }].map(d => (
                    <div key={d.l}>
                      <label className="block text-xs font-body tracking-widest uppercase mb-1" style={{ color: 'rgba(248,244,239,0.4)' }}>{d.l}</label>
                      <div className="relative">
                        <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#C9A84C' }}/>
                        <input type="date" value={d.v} onChange={e => d.fn(e.target.value)} min={d.min}
                          className="luxury-input w-full h-9 pl-8 pr-2 text-xs" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Guests */}
                <div>
                  <label className="block text-xs font-body tracking-widest uppercase mb-1" style={{ color: 'rgba(248,244,239,0.4)' }}>Guests</label>
                  <div className="relative">
                    <Users className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#C9A84C' }}/>
                    <select value={guests} onChange={e => setGuests(Number(e.target.value))}
                      className="luxury-input w-full h-9 pl-8 pr-3 text-xs appearance-none">
                      {Array.from({length: capacity||2},(_,i) => (
                        <option key={i+1} value={i+1}>{i+1} Guest{i>0?'s':''}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Price breakdown */}
                {nights > 0 && (
                  <div className="rounded-xl p-3 space-y-2" style={{ background: 'rgba(201,168,76,0.04)', border: '1px solid rgba(201,168,76,0.12)' }}>
                    <div className="flex justify-between text-sm">
                      <span style={{ color: 'rgba(248,244,239,0.5)' }}>{pkr(basePrice)} × {nights} night{nights>1?'s':''}</span>
                      <span className="font-body font-medium" style={{ color: '#F8F4EF' }}>{pkr(totalPrice)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span style={{ color: 'rgba(248,244,239,0.5)' }}>Service fee</span>
                      <span className="font-body font-medium" style={{ color: '#F8F4EF' }}>{pkr(serviceFee)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span style={{ color: 'rgba(248,244,239,0.5)' }}>Taxes (10%)</span>
                      <span className="font-body font-medium" style={{ color: '#F8F4EF' }}>{pkr(taxes)}</span>
                    </div>
                    <div className="flex justify-between font-display text-lg pt-2" style={{ borderTop: '1px solid rgba(201,168,76,0.2)', color: '#C9A84C' }}>
                      <span>Total</span>
                      <span>{pkr(grandTotal)}</span>
                    </div>
                  </div>
                )}

                <button
                  className="btn-gold w-full h-12 rounded-xl text-xs tracking-widest uppercase font-body disabled:opacity-50"
                  disabled={room.status !== 'available' || !checkIn || !checkOut}
                  onClick={handleBookNow}
                >
                  {!isAuthenticated ? 'Sign In to Book'
                    : room.status === 'available'
                      ? nights > 0 ? `Book – ${pkr(grandTotal)}` : 'Check Availability'
                      : 'Not Available'}
                </button>

                <p className="text-xs text-center font-body" style={{ color: 'rgba(248,244,239,0.35)' }}>
                  {isAuthenticated ? "You won't be charged until confirmation." : "You'll be redirected to sign in first."}
                </p>

                {!isAuthenticated && (
                  <div className="text-center text-xs pt-1">
                    <span style={{ color: 'rgba(248,244,239,0.4)' }}>New here? </span>
                    <Link to="/register?returnUrl=%2Fbooking" className="font-medium hover:opacity-70 transition-opacity" style={{ color: '#C9A84C' }}>
                      Create an account
                    </Link>
                  </div>
                )}

                {/* Trust badges */}
                <div className="grid grid-cols-3 gap-2 pt-3" style={{ borderTop: '1px solid #2A2A2A' }}>
                  {[
                    { icon: Shield, text: 'Secure Booking' },
                    { icon: Check,  text: 'Free Cancel' },
                    { icon: Phone,  text: '24/7 Support' },
                  ].map(b => (
                    <div key={b.text} className="flex flex-col items-center gap-1 text-center">
                      <b.icon className="w-4 h-4" style={{ color: '#C9A84C' }}/>
                      <span className="text-[10px] font-body" style={{ color: 'rgba(248,244,239,0.35)' }}>{b.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}