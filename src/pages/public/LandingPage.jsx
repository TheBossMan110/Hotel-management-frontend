import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Calendar, Users, Star, Wifi, Coffee, Car, Waves, Sparkles, ChevronRight, LogIn, Maximize, ChevronDown } from 'lucide-react'
import useAuthStore from '../../stores/authStore'
import { formatCurrency } from '../../lib/utils'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const stats = [
  { number: '500', suffix: '+', label: 'Luxury Rooms' },
  { number: '50', suffix: 'K+', label: 'Happy Guests' },
  { number: '15', suffix: '', label: 'Global Awards' },
  { number: '24', suffix: '/7', label: 'Concierge' },
]

const features = [
  { icon: Wifi,     title: 'High-Speed WiFi',    description: 'Complimentary fiber-optic internet throughout the property' },
  { icon: Coffee,   title: '24/7 Room Service',  description: 'Gourmet dining delivered to your door at any hour' },
  { icon: Car,      title: 'Valet Parking',       description: 'Complimentary luxury valet service at your arrival' },
  { icon: Waves,    title: 'Infinity Pool',        description: 'Relax in our breathtaking rooftop infinity pool' },
  { icon: Sparkles, title: 'Spa & Wellness',       description: 'Rejuvenate at our world-class holistic spa center' },
  { icon: Star,     title: 'Concierge',            description: '24-hour personal concierge for all your desires' },
]

const testimonials = [
  { name: 'Ayesha Malik',    role: 'Corporate Executive', rating: 5, content: 'An absolute gem. The fusion of traditional hospitality with world-class luxury at Grand Azure is truly remarkable and unmatched.' },
  { name: 'Dr. Faisal Khan', role: 'Family Guest',        rating: 5, content: 'Our stay was exceptional. The staff was incredibly attentive and the suite offered a breathtaking view. Unforgettable experience.' },
  { name: 'Zainab Ahmed',    role: 'Travel Vlogger',      rating: 5, content: 'I have stayed at premium hotels globally, but the cultural richness and sheer comfort at Grand Azure are truly in a class of their own.' },
]

// Animated counter component
function AnimatedCounter({ target, suffix = '' }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const observed = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !observed.current) {
        observed.current = true
        const num = parseInt(target)
        const duration = 2000
        const steps = 60
        const increment = num / steps
        let current = 0
        const timer = setInterval(() => {
          current += increment
          if (current >= num) { setCount(num); clearInterval(timer) }
          else setCount(Math.floor(current))
        }, duration / steps)
      }
    }, { threshold: 0.5 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target])

  return <span ref={ref}>{count}{suffix}</span>
}

export default function LandingPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const [allRooms, setAllRooms]       = useState([])
  const [featuredRooms, setFeaturedRooms] = useState([])
  const [checkIn, setCheckIn]   = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests]     = useState('1 Guest')

  useEffect(() => {
    fetch(`${API_URL}/rooms?limit=20&sort=-rating.average`)
      .then(r => r.json())
      .then(d => {
        const rooms = d.rooms || []
        setAllRooms(rooms)
        const shuffled = [...rooms].sort(() => 0.5 - Math.random())
        setFeaturedRooms(shuffled.slice(0, 6))
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (allRooms.length <= 6) return
    const interval = setInterval(() => {
      setFeaturedRooms([...allRooms].sort(() => 0.5 - Math.random()).slice(0, 6))
    }, 10000)
    return () => clearInterval(interval)
  }, [allRooms])

  const handleBookingClick = () => {
    navigate(isAuthenticated ? '/booking' : '/login?returnUrl=%2Fbooking')
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (checkIn)  params.append('checkIn', checkIn)
    if (checkOut) params.append('checkOut', checkOut)
    if (guests)   params.append('guests', guests.split(' ')[0])
    navigate(`/rooms?${params.toString()}`)
  }

  return (
    <div className="min-h-screen" style={{ background: '#0A0A0A', color: '#F8F4EF' }}>

      {/* ── HERO ── */}
      <section className="relative h-screen">
        {/* Fast static background image instead of heavy 3D */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1800&q=75&auto=format"
            alt="Grand Azure Hotel"
            className="w-full h-full object-cover"
            style={{ transform: 'scale(1.05)', transition: 'transform 8s ease-out' }}
            onLoad={e => { e.target.style.transform = 'scale(1)' }}
          />
        </div>
        {/* Cinematic overlays */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(10,10,10,0.5) 0%, rgba(10,10,10,0.2) 40%, rgba(10,10,10,0.7) 80%, #0A0A0A 100%)' }} />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(10,10,10,0.4) 100%)' }} />

        {/* Hero Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
          <div className="animate-slideUp stagger-1">
            <p className="text-xs font-body tracking-[0.3em] uppercase mb-6" style={{ color: '#C9A84C' }}>
              ✦ Welcome to Grandeur ✦
            </p>
          </div>
          <div className="animate-slideUp stagger-2">
            <h1
              className="font-display font-light text-balance mb-6"
              style={{ fontSize: 'clamp(52px, 9vw, 100px)', lineHeight: '1.05', letterSpacing: '-0.02em', color: '#F8F4EF' }}
            >
              Where Luxury<br />
              <span className="text-gradient-gold italic">Meets Comfort</span>
            </h1>
          </div>
          <div className="animate-slideUp stagger-3">
            <p className="font-body text-lg md:text-xl max-w-2xl mb-10" style={{ color: 'rgba(248,244,239,0.7)', lineHeight: '1.7' }}>
              Experience world-class Pakistani hospitality at Grand Azure — an unforgettable sanctuary of elegance in the heart of the city.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 animate-slideUp stagger-4">
            <button
              onClick={() => navigate('/rooms')}
              className="btn-gold px-10 py-4 rounded-full text-sm font-body tracking-widest uppercase"
            >
              Explore Rooms
            </button>
            <button
              onClick={handleBookingClick}
              className="border border-white/30 text-white px-10 py-4 rounded-full text-sm font-body tracking-widest uppercase hover:border-white/70 transition-all duration-300"
            >
              {isAuthenticated ? 'Book Your Stay' : <><LogIn className="inline w-4 h-4 mr-2" />Sign In to Book</>}
            </button>
          </div>
          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce-arrow" style={{ color: '#C9A84C' }}>
            <span className="text-xs font-body tracking-widest uppercase opacity-60">Scroll</span>
            <ChevronDown className="w-5 h-5" />
          </div>
        </div>
      </section>

      {/* ── SEARCH BAR (outside hero so it's never clipped) ── */}
      <div className="relative z-30 w-full max-w-5xl mx-auto px-4 -mt-12">
        <div className="rounded-2xl p-6 shadow-2xl" style={{ background: 'rgba(17,17,17,0.95)', border: '1px solid rgba(201,168,76,0.25)', backdropFilter: 'blur(20px)' }}>
          <form className="grid grid-cols-1 md:grid-cols-4 gap-4" onSubmit={handleSearchSubmit}>
            <div>
              <label className="block text-xs font-body tracking-widest uppercase mb-2" style={{ color: '#C9A84C' }}>Check In</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#C9A84C' }} />
                <input
                  type="date" required value={checkIn} onChange={e => setCheckIn(e.target.value)}
                  className="luxury-input w-full h-11 pl-10 pr-3 text-sm font-body"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-body tracking-widest uppercase mb-2" style={{ color: '#C9A84C' }}>Check Out</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#C9A84C' }} />
                <input
                  type="date" required value={checkOut} onChange={e => setCheckOut(e.target.value)}
                  className="luxury-input w-full h-11 pl-10 pr-3 text-sm font-body"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-body tracking-widest uppercase mb-2" style={{ color: '#C9A84C' }}>Guests</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#C9A84C' }} />
                <select
                  value={guests} onChange={e => setGuests(e.target.value)}
                  className="luxury-input w-full h-11 pl-10 pr-3 text-sm font-body appearance-none"
                >
                  <option>1 Guest</option>
                  <option>2 Guests</option>
                  <option>3 Guests</option>
                  <option>4+ Guests</option>
                </select>
              </div>
            </div>
            <div className="flex items-end">
              <button type="submit" className="btn-gold w-full h-11 rounded-xl text-xs font-body tracking-widest uppercase">
                Search
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ── STATS ── */}
      <section className="py-20 px-6 mt-8" style={{ background: '#0A0A0A' }}>
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, i) => (
              <div key={i} className="flex flex-col items-center gap-2 animate-slideUp" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="font-display font-light text-gradient-gold" style={{ fontSize: 'clamp(40px, 6vw, 72px)' }}>
                  <AnimatedCounter target={stat.number} suffix={stat.suffix} />
                </div>
                <p className="text-xs font-body tracking-widest uppercase" style={{ color: 'rgba(248,244,239,0.5)' }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
        {/* gold divider */}
        <div className="max-w-xs mx-auto mt-12 h-px" style={{ background: 'linear-gradient(90deg, transparent, #C9A84C, transparent)' }} />
      </section>

      {/* ── FEATURED ROOMS ── */}
      <section className="py-20 px-6" style={{ background: '#111111' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14">
            <div>
              <p className="text-xs font-body tracking-[0.3em] uppercase mb-3" style={{ color: '#C9A84C' }}>Accommodations</p>
              <h2 className="font-display font-light" style={{ fontSize: 'clamp(36px, 5vw, 64px)', color: '#F8F4EF' }}>
                Our Finest Rooms
              </h2>
            </div>
            <Link to="/rooms" className="mt-6 md:mt-0 flex items-center gap-2 text-sm font-body tracking-widest uppercase transition-colors hover:opacity-70" style={{ color: '#C9A84C' }}>
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredRooms.length === 0
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-2xl overflow-hidden" style={{ background: '#1A1A1A' }}>
                    <div className="aspect-[4/3] animate-pulse" style={{ background: '#222' }} />
                    <div className="p-5 space-y-3">
                      <div className="h-4 rounded animate-pulse" style={{ background: '#222', width: '60%' }} />
                      <div className="h-3 rounded animate-pulse" style={{ background: '#222', width: '80%' }} />
                    </div>
                  </div>
                ))
              : featuredRooms.map((room) => (
                  <Link key={room.id || room._id} to={`/rooms/${room.id || room._id}`}
                    className="group block rounded-2xl overflow-hidden gold-border-glow transition-all duration-500"
                    style={{ background: '#1A1A1A' }}
                  >
                    <div className="aspect-[4/3] relative overflow-hidden">
                      <img
                        src={room.images?.[0]?.url || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800'}
                        alt={room.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      {/* price badge */}
                      <div
                        className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full text-xs font-body font-semibold tracking-wide"
                        style={{ background: 'rgba(201,168,76,0.95)', color: '#0A0A0A' }}
                      >
                        PKR {Number(room.price?.basePrice).toLocaleString('en-PK')} / night
                      </div>
                      {/* hover overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-16">
                        <span className="text-xs font-body tracking-widest uppercase px-6 py-2 rounded-full border border-white/50" style={{ color: '#F8F4EF' }}>
                          View Details
                        </span>
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-1 mb-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-current" style={{ color: '#C9A84C' }} />
                        ))}
                        <span className="text-xs font-body ml-1" style={{ color: 'rgba(248,244,239,0.5)' }}>
                          ({room.rating?.count || 24})
                        </span>
                      </div>
                      <h3 className="font-display text-xl mb-2 group-hover:text-gradient-gold transition-all" style={{ color: '#F8F4EF' }}>
                        {room.name}
                      </h3>
                      <p className="text-sm font-body line-clamp-2 mb-4" style={{ color: 'rgba(248,244,239,0.5)' }}>
                        {room.description?.short || 'Experience unparalleled luxury in our premium accommodation.'}
                      </p>
                      <div className="flex items-center gap-4 text-xs font-body" style={{ color: 'rgba(248,244,239,0.4)' }}>
                        <span className="flex items-center gap-1"><Maximize className="w-3 h-3" /> {room.size} sq ft</span>
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {(room.capacity?.adults || 2) + (room.capacity?.children || 0)} guests</span>
                      </div>
                    </div>
                  </Link>
                ))
            }
          </div>
        </div>
      </section>

      {/* ── EXPERIENCE BENTO ── */}
      <section className="py-20 px-6" style={{ background: '#0A0A0A' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-body tracking-[0.3em] uppercase mb-3" style={{ color: '#C9A84C' }}>Experiences</p>
            <h2 className="font-display font-light" style={{ fontSize: 'clamp(36px, 5vw, 64px)', color: '#F8F4EF' }}>World-Class Amenities</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="group p-6 rounded-2xl gold-border-glow transition-all duration-300 cursor-default animate-slideUp"
                style={{ background: '#111111', animationDelay: `${i * 0.08}s` }}
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110"
                  style={{ background: 'rgba(201,168,76,0.1)' }}>
                  <feature.icon className="w-5 h-5" style={{ color: '#C9A84C' }} />
                </div>
                <h3 className="font-display text-xl mb-2" style={{ color: '#F8F4EF' }}>{feature.title}</h3>
                <p className="text-sm font-body leading-relaxed" style={{ color: 'rgba(248,244,239,0.5)' }}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-20 px-6" style={{ background: '#111111' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-body tracking-[0.3em] uppercase mb-3" style={{ color: '#C9A84C' }}>Testimonials</p>
            <h2 className="font-display font-light" style={{ fontSize: 'clamp(36px, 5vw, 64px)', color: '#F8F4EF' }}>Guest Experiences</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="glass p-8 rounded-2xl hover:border-yellow-500/20 transition-all duration-300 animate-slideUp"
                style={{ animationDelay: `${i * 0.12}s` }}>
                <div className="flex items-center gap-1 mb-5">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-current" style={{ color: '#C9A84C' }} />
                  ))}
                </div>
                <p className="font-body text-sm leading-relaxed italic mb-6" style={{ color: 'rgba(248,244,239,0.7)' }}>
                  &ldquo;{t.content}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-display font-semibold"
                    style={{ background: 'rgba(201,168,76,0.15)', color: '#C9A84C' }}>
                    {t.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-body font-medium" style={{ color: '#F8F4EF' }}>{t.name}</p>
                    <p className="text-xs font-body" style={{ color: 'rgba(248,244,239,0.4)' }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-28 px-6 overflow-hidden grain-texture" style={{ background: '#0A0A0A' }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, rgba(201,168,76,0.08) 0%, transparent 70%)' }} />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <p className="text-xs font-body tracking-[0.3em] uppercase mb-4" style={{ color: '#C9A84C' }}>Limited Availability</p>
          <h2 className="font-display font-light mb-6" style={{ fontSize: 'clamp(36px, 5vw, 64px)', color: '#F8F4EF' }}>
            Ready for an<br /><span className="italic text-gradient-gold">Unforgettable Stay?</span>
          </h2>
          <p className="font-body text-lg mb-10" style={{ color: 'rgba(248,244,239,0.6)' }}>
            Book your stay today and discover why Grand Azure is the preferred choice for discerning travelers seeking authentic luxury.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={handleBookingClick} className="btn-gold px-10 py-4 rounded-full text-sm font-body tracking-widest uppercase">
              {isAuthenticated ? 'Book Now' : 'Sign In to Book'}
            </button>
            <Link to="/contact">
              <button className="border border-white/20 px-10 py-4 rounded-full text-sm font-body tracking-widest uppercase hover:border-white/50 transition-all duration-300" style={{ color: '#F8F4EF' }}>
                Contact Us
              </button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
