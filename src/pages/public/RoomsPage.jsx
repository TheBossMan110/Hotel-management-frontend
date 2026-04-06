import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Search, Star, Users, Maximize, Filter, X, MapPin,
  BedDouble, Building2, Calendar, LayoutGrid, List,
  CheckCircle2, Clock, Wrench, ChevronRight, Wifi, Tv, Wind,
  Coffee, Bath
} from 'lucide-react'
import Button from '../../components/ui/Button'
import { Card, CardContent } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import { cn } from '../../lib/utils'
import { roomTypes, amenities as allAmenities, mockRooms, pakistanCities } from '../../data/mockData'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const STATUS_CONFIG = {
  available:   { label: 'Available',   icon: CheckCircle2, color: 'text-green-500',  pill: 'bg-green-500/90 text-white' },
  occupied:    { label: 'Occupied',    icon: Users,         color: 'text-yellow-500', pill: 'bg-yellow-500/90 text-white' },
  maintenance: { label: 'Maintenance', icon: Wrench,        color: 'text-red-500',    pill: 'bg-red-500/90 text-white' },
  cleaning:    { label: 'Cleaning',    icon: Clock,         color: 'text-blue-500',   pill: 'bg-blue-500/90 text-white' },
  reserved:    { label: 'Reserved',    icon: Calendar,      color: 'text-orange-500', pill: 'bg-orange-500/90 text-white' },
}
const AMENITY_ICONS = { WiFi: Wifi, TV: Tv, 'Air Conditioning': Wind, 'Coffee Maker': Coffee, Jacuzzi: Bath }

const pkr      = (n) => `PKR ${Number(n || 0).toLocaleString('en-US')}`
const getPrice = (r) => r.price?.basePrice ?? r.price ?? 0
const getRating    = (r) => typeof r.rating === 'object' ? (r.rating?.average ?? 4.5) : (r.rating ?? 4.5)
const getReviews   = (r) => typeof r.rating === 'object' ? (r.rating?.count ?? r.reviews ?? 0) : (r.reviews ?? 0)
const normalise    = (s) => (s||'').toLowerCase().replace(/\s+/g,'')
const roomHasAmenity = (r, a) => (r.amenities||[]).some(x => normalise(x)===normalise(a))

const getRoomCity = (r) => {
  if (r.city) return r.city;
  const match = pakistanCities.find(c => r.name?.includes(c.name) || r.hotelName?.includes(c.name));
  return match ? match.name : '';
}

const getRoomImg = (r) => {
  const raw = r.images?.[0]
  if (!raw) return 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800'
  return typeof raw === 'string' ? raw : (raw.url ?? 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800')
}

// ─── Grid Card ────────────────────────────────────────────────────────────────
function RoomGridCard({ room }) {
  const cfg = STATUS_CONFIG[room.status] || STATUS_CONFIG.available
  const Icon = cfg.icon
  const price = getPrice(room)

  return (
    <Link to={`/rooms/${room.id || room._id}`}>
      <div
        className="group rounded-2xl overflow-hidden h-full flex flex-col transition-all duration-500 cursor-pointer"
        style={{ background: '#111111', border: '1px solid #2A2A2A' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.5)'; e.currentTarget.style.boxShadow = '0 0 40px rgba(201,168,76,0.12)' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = '#2A2A2A'; e.currentTarget.style.boxShadow = 'none' }}
      >
        <div className="relative aspect-[4/3] overflow-hidden" style={{ background: '#1A1A1A' }}>
          <img
            src={getRoomImg(room)}
            alt={room.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800' }}
          />
          {/* status pill */}
          <div className={cn('absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm', cfg.pill)}>
            <Icon className="w-3 h-3" />{cfg.label}
          </div>
          {/* gold price badge */}
          <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full text-xs font-body font-semibold"
            style={{ background: 'rgba(201,168,76,0.95)', color: '#0A0A0A' }}>
            {pkr(price)}<span className="ml-1 opacity-70">/night</span>
          </div>
          {/* city */}
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded text-xs"
            style={{ background: 'rgba(10,10,10,0.75)', color: 'rgba(248,244,239,0.7)', backdropFilter: 'blur(8px)' }}>
            <MapPin className="w-3 h-3" />{getRoomCity(room)}
          </div>
          {/* hover overlay */}
          <div className="absolute inset-0 flex items-end justify-center pb-14 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }}>
            <span className="text-xs font-body tracking-widest uppercase px-6 py-2 rounded-full"
              style={{ border: '1px solid rgba(255,255,255,0.4)', color: '#F8F4EF' }}>View Details</span>
          </div>
        </div>

        <div className="p-5 flex flex-col flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-body capitalize px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(201,168,76,0.12)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.25)' }}>
              {room.type}
            </span>
          </div>
          <h3 className="font-display text-xl mb-2 group-hover:text-gradient-gold transition-all line-clamp-2" style={{ color: '#F8F4EF' }}>
            {room.name}
          </h3>

          <div className="flex items-center gap-3 text-xs font-body mb-3" style={{ color: 'rgba(248,244,239,0.45)' }}>
            <span className="flex items-center gap-1"><Maximize className="w-3 h-3" />{room.size} sqft</span>
            <span className="flex items-center gap-1"><Users className="w-3 h-3" />
              {room.capacity?.adults ? room.capacity.adults+(room.capacity.children||0) : room.capacity} guests
            </span>
            <span className="flex items-center gap-1"><BedDouble className="w-3 h-3" />{room.bedType||room.beds}</span>
          </div>

          <div className="flex items-center gap-1 mb-3">
            <Star className="w-3.5 h-3.5 fill-current" style={{ color: '#C9A84C' }} />
            <span className="text-sm font-body font-medium" style={{ color: '#F8F4EF' }}>{getRating(room)}</span>
            <span className="text-xs font-body" style={{ color: 'rgba(248,244,239,0.4)' }}>({getReviews(room)})</span>
          </div>

          <div className="flex flex-wrap gap-1 mt-auto">
            {(room.amenities||[]).slice(0,3).map(a => (
              <span key={a} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-body"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(248,244,239,0.6)' }}>
                {AMENITY_ICONS[a] && (() => { const I=AMENITY_ICONS[a]; return <I className="w-3 h-3" style={{ color: '#C9A84C' }}/> })()}
                {a}
              </span>
            ))}
            {(room.amenities||[]).length > 3 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-body"
                style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(248,244,239,0.4)' }}>
                +{room.amenities.length-3}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

// ─── List Row ─────────────────────────────────────────────────────────────────
function RoomListRow({ room }) {
  const cfg = STATUS_CONFIG[room.status] || STATUS_CONFIG.available
  const Icon = cfg.icon
  const price = getPrice(room)

  return (
    <Link to={`/rooms/${room.id || room._id}`}>
      <div
        className="group flex gap-4 p-4 rounded-2xl transition-all duration-300 cursor-pointer"
        style={{ background: '#111111', border: '1px solid #2A2A2A' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)'; e.currentTarget.style.boxShadow = '0 0 30px rgba(201,168,76,0.08)' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = '#2A2A2A'; e.currentTarget.style.boxShadow = 'none' }}
      >
        <div className="w-28 h-20 rounded-xl overflow-hidden flex-shrink-0" style={{ background: '#1A1A1A' }}>
          <img
            src={getRoomImg(room)}
            alt={room.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800' }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-body capitalize px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(201,168,76,0.12)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.25)' }}>
                  {room.type}
                </span>
                <span className="text-xs font-body flex items-center gap-1" style={{ color: 'rgba(248,244,239,0.4)' }}>
                  <MapPin className="w-3 h-3" />{getRoomCity(room)} · Room {room.number}
                </span>
              </div>
              <h3 className="font-display text-lg" style={{ color: '#F8F4EF' }}>{room.name}</h3>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="font-display text-xl" style={{ color: '#C9A84C' }}>{pkr(price)}</div>
              <div className="text-xs font-body" style={{ color: 'rgba(248,244,239,0.4)' }}>per night</div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs font-body mb-2" style={{ color: 'rgba(248,244,239,0.45)' }}>
            <span className="flex items-center gap-1"><Maximize className="w-3 h-3"/>{room.size} sqft</span>
            <span className="flex items-center gap-1"><Users className="w-3 h-3"/>
              {room.capacity?.adults ? room.capacity.adults+(room.capacity.children||0) : room.capacity} guests
            </span>
            <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-current" style={{ color: '#C9A84C' }}/>{getRating(room)}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className={cn('flex items-center gap-1 text-xs font-body font-medium', cfg.color)}>
              <Icon className="w-3.5 h-3.5"/>{cfg.label}
            </div>
            <div className="flex gap-1">
              {(room.amenities||[]).slice(0,4).map(a => (
                <span key={a} className="px-2 py-0.5 rounded-full text-xs font-body"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(248,244,239,0.6)' }}>{a}</span>
              ))}
              {(room.amenities||[]).length>4 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-body" style={{ color: 'rgba(248,244,239,0.4)' }}>+{room.amenities.length-4}</span>
              )}
            </div>
            <ChevronRight className="w-4 h-4 ml-auto transition-colors" style={{ color: 'rgba(248,244,239,0.3)' }}/>
          </div>
        </div>
      </div>
    </Link>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function RoomsPage() {
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const reqGuests = Number(searchParams.get('guests')) || 0

  const [rooms, setRooms]             = useState(mockRooms)  // start with mock so counts show immediately
  const [loading, setLoading]         = useState(false)  // mockRooms loaded immediately
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode]       = useState('grid')
  const [statusFilter, setStatus]     = useState('')
  const [sortBy, setSortBy]           = useState('default')

  const [filters, setFiltersObj] = useState({
    type: '', city: '', priceRange: [0, 1000000], amenities: [],
  })
  const setFilters  = (nf) => setFiltersObj(p => ({ ...p, ...nf }))
  const resetFilters = () => {
    setFiltersObj({ type:'', city:'', priceRange:[0,1000000], amenities:[] })
    setStatus('')
    setSearchQuery('')
  }

  // Try to upgrade from mock → real API data silently in background
  useEffect(() => {
    const ctrl = new AbortController()
    fetch(`${API_URL}/rooms?limit=1000`, { signal: ctrl.signal })
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then(d => {
        const apiRooms = d.rooms || []
        if (apiRooms.length > 0) setRooms(apiRooms)  // upgrade to live data only if API has rooms
        // else keep mockRooms that's already shown
      })
      .catch(() => {}) // silently keep mockRooms on any error
    return () => ctrl.abort()
  }, [])

  // ── filtering ──────────────────────────────────────────────────────────────
  const filteredRooms = rooms
    .filter(r => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        const hay = [r.name, r.type, r.description||'', String(r.number), r.city||'', r.hotelName||''].join(' ').toLowerCase()
        if (!hay.includes(q)) return false
      }
      if (filters.type   && r.type   !== filters.type)   return false
      if (filters.city   && getRoomCity(r).trim() !== filters.city.trim()) return false
      if (statusFilter   && r.status !== statusFilter)   return false
      const p = getPrice(r)
      if (p < filters.priceRange[0] || p > filters.priceRange[1]) return false
      if (filters.amenities.length > 0 && !filters.amenities.every(a => roomHasAmenity(r, a))) return false
      
      // Filter by required guests from URL
      if (reqGuests > 0) {
        const capacity = r.capacity?.adults ? r.capacity.adults + (r.capacity.children || 0) : (r.capacity || 0);
        if (capacity < reqGuests) return false;
      }
      return true
    })
    .sort((a, b) => {
      if (sortBy==='price-asc')  return getPrice(a)-getPrice(b)
      if (sortBy==='price-desc') return getPrice(b)-getPrice(a)
      if (sortBy==='rating')     return getRating(b)-getRating(a)
      return 0
    })

  const toggleAmenity = a => {
    const cur = filters.amenities
    setFilters({ amenities: cur.includes(a) ? cur.filter(x=>x!==a) : [...cur,a] })
  }

  const stats = {
    total:     rooms.length,
    available: rooms.filter(r=>r.status==='available').length,
    occupied:  rooms.filter(r=>r.status==='occupied').length,
    cleaning:  rooms.filter(r=>r.status==='cleaning').length,
  }

  const hasActive = filters.type || filters.city || statusFilter ||
    filters.amenities.length > 0 || filters.priceRange[0] > 0 || filters.priceRange[1] < 1000000

  // City tabs — counts come from the already-loaded `rooms` array (mockRooms after fallback)
  // We pre-compute counts so they update reactively whenever rooms loads.
  const cityTabs = [
    { label: 'All Cities', value: '', count: null },
    ...pakistanCities.map(c => ({
      label: c.name,
      value: c.name,
      count: rooms.filter(r => getRoomCity(r).trim() === c.name.trim()).length,
    })),
  ]

  return (
    <div className="min-h-screen pt-20" style={{ background: '#0A0A0A', color: '#F8F4EF' }}>

      {/* ── Hero ── */}
      <section className="py-16 px-4" style={{ background: 'linear-gradient(135deg, #0A0A0A 0%, #111111 100%)', borderBottom: '1px solid #2A2A2A' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-xs font-body tracking-[0.3em] uppercase mb-3" style={{ color: '#C9A84C' }}>Accommodations</p>
              <h1 className="font-display font-light mb-3" style={{ fontSize: 'clamp(36px, 5vw, 64px)', color: '#F8F4EF' }}>Rooms &amp; Suites</h1>
              <p className="font-body max-w-xl" style={{ color: 'rgba(248,244,239,0.55)' }}>
                Browse rooms across Pakistan's finest hotels — filter by type, city, amenities, and budget.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {[
                { label:'Total Rooms', value:stats.total,     bg:'rgba(255,255,255,0.05)', color:'#F8F4EF' },
                { label:'Available',   value:stats.available, bg:'rgba(34,197,94,0.1)',    color:'#4ade80' },
                { label:'Occupied',    value:stats.occupied,  bg:'rgba(234,179,8,0.1)',    color:'#facc15' },
                { label:'Cleaning',    value:stats.cleaning,  bg:'rgba(59,130,246,0.1)',   color:'#60a5fa' },
              ].map(s => (
                <div key={s.label} className="px-4 py-3 rounded-2xl text-center font-body"
                  style={{ background: s.bg, border: `1px solid ${s.color}30` }}>
                  <span className="font-display text-2xl block" style={{ color: s.color }}>{s.value}</span>
                  <span className="text-xs" style={{ color: 'rgba(248,244,239,0.5)' }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── City Tabs ── */}
      <section style={{ background: '#0A0A0A', borderBottom: '1px solid #2A2A2A' }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto py-3" style={{ scrollbarWidth: 'none' }}>
            {cityTabs.map(tab => (
              <button
                key={tab.value}
                onClick={() => setFilters({ city: tab.value })}
                className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-body whitespace-nowrap transition-all duration-200"
                style={filters.city === tab.value
                  ? { background: '#C9A84C', color: '#0A0A0A', fontWeight: 600 }
                  : { background: 'transparent', color: 'rgba(248,244,239,0.5)', border: '1px solid #2A2A2A' }
                }
              >
                {tab.value && <MapPin className="w-3.5 h-3.5" />}
                {tab.label}
                {tab.count !== null && (
                  <span className="ml-1 text-xs px-1.5 py-0.5 rounded-full font-medium"
                    style={{ background: 'rgba(255,255,255,0.1)' }}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Search + Controls ── */}
      <section className="py-3 px-4 sticky top-16 lg:top-20 z-30" style={{ background: '#0A0A0A', borderBottom: '1px solid #2A2A2A' }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-3">

          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#C9A84C' }} />
            <input
              placeholder="Search by hotel, room type, or amenity…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="luxury-input w-full h-10 pl-9 pr-3 text-sm font-body"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select value={filters.type} onChange={e=>setFilters({type:e.target.value})}
              className="luxury-input h-10 px-3 text-sm font-body appearance-none rounded-lg">
              <option value="">All Types</option>
              {roomTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>

            <select value={statusFilter} onChange={e=>setStatus(e.target.value)}
              className="luxury-input h-10 px-3 text-sm font-body appearance-none rounded-lg">
              <option value="">All Status</option>
              {Object.entries(STATUS_CONFIG).map(([k,v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>

            <select value={sortBy} onChange={e=>setSortBy(e.target.value)}
              className="luxury-input h-10 px-3 text-sm font-body appearance-none rounded-lg">
              <option value="default">Sort: Default</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
              <option value="rating">Highest Rated</option>
            </select>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="h-10 px-3 rounded-lg text-sm flex items-center gap-1.5 transition-all font-body"
              style={showFilters
                ? { background: '#C9A84C', color: '#0A0A0A', border: '1px solid #C9A84C' }
                : { background: '#111111', color: 'rgba(248,244,239,0.7)', border: '1px solid #2A2A2A' }
              }
            >
              <Filter className="w-4 h-4" />
              Filters
              {filters.amenities.length > 0 && (
                <span className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center"
                  style={{ background: '#0A0A0A', color: '#C9A84C' }}>
                  {filters.amenities.length}
                </span>
              )}
            </button>

            <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid #2A2A2A' }}>
              {['grid','list'].map(m => (
                <button key={m} onClick={()=>setViewMode(m)}
                  className="h-10 w-10 flex items-center justify-center transition-all"
                  style={viewMode===m
                    ? { background: '#C9A84C', color: '#0A0A0A' }
                    : { background: '#111111', color: 'rgba(248,244,239,0.4)' }
                  }>
                  {m==='grid' ? <LayoutGrid className="w-4 h-4"/> : <List className="w-4 h-4"/>}
                </button>
              ))}
            </div>

            {hasActive && (
              <button onClick={resetFilters}
                className="h-10 px-3 rounded-lg border border-destructive text-destructive text-sm flex items-center gap-1 hover:bg-destructive/10 transition-colors">
                <X className="w-3.5 h-3.5"/> Clear
              </button>
            )}
          </div>
        </div>

        {/* Expanded filter panel */}
        {showFilters && (
          <div className="max-w-7xl mx-auto mt-3 p-4 rounded-2xl" style={{ background: '#111111', border: '1px solid #2A2A2A' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-body tracking-widest uppercase mb-2" style={{ color: '#C9A84C' }}>PKR Price Range / night</label>
                <div className="flex items-center gap-2">
                  <input type="number" placeholder="Min"
                    value={filters.priceRange[0]||''}
                    onChange={e=>setFilters({priceRange:[Number(e.target.value),filters.priceRange[1]]})}
                    className="luxury-input h-9 w-28 px-3 text-sm font-body"/>
                  <span style={{ color: 'rgba(248,244,239,0.4)' }}>–</span>
                  <input type="number" placeholder="Max"
                    value={filters.priceRange[1]<1000000?filters.priceRange[1]:''}
                    onChange={e=>setFilters({priceRange:[filters.priceRange[0],Number(e.target.value)||1000000]})}
                    className="luxury-input h-9 w-28 px-3 text-sm font-body"/>
                  <span className="text-xs font-body" style={{ color: 'rgba(248,244,239,0.4)' }}>PKR</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-body tracking-widest uppercase mb-2" style={{ color: '#C9A84C' }}>
                  Amenities
                  {filters.amenities.length>0 && (
                    <span className="ml-2 lowercase normal-case font-body text-xs" style={{ color: 'rgba(248,244,239,0.5)' }}>({filters.amenities.length} selected)</span>
                  )}
                </label>
                <div className="flex flex-wrap gap-2">
                  {allAmenities.map(a => (
                    <button key={a} onClick={()=>toggleAmenity(a)}
                      className="px-3 py-1 rounded-full text-xs font-body transition-all duration-200"
                      style={filters.amenities.includes(a)
                        ? { background: '#C9A84C', color: '#0A0A0A', border: '1px solid #C9A84C' }
                        : { background: 'transparent', color: 'rgba(248,244,239,0.6)', border: '1px solid #2A2A2A' }
                      }>
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ── Results ── */}
      <section className="py-10 px-4" style={{ background: '#0A0A0A' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm font-body" style={{ color: 'rgba(248,244,239,0.5)' }}>
              <span className="font-body font-semibold" style={{ color: '#F8F4EF' }}>{filteredRooms.length}</span> room{filteredRooms.length!==1?'s':''} found
              {filters.city && <span className="ml-1">in <strong style={{ color: '#C9A84C' }}>{filters.city}</strong></span>}
              {filters.type && <span className="ml-1">· <strong className="capitalize" style={{ color: '#C9A84C' }}>{filters.type}</strong></span>}
              {filters.amenities.length>0 && <span className="ml-1">· {filters.amenities.join(', ')}</span>}
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#C9A84C', borderTopColor: 'transparent' }}/>
            </div>
          ) : filteredRooms.length > 0 ? (
            viewMode==='grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRooms.map(r => <RoomGridCard key={r.id||r._id} room={r}/>)}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {filteredRooms.map(r => <RoomListRow key={r.id||r._id} room={r}/>)}
              </div>
            )
          ) : (
            <div className="text-center py-20">
              <Building2 className="w-14 h-14 mx-auto mb-4" style={{ color: 'rgba(248,244,239,0.2)' }}/>
              <h3 className="font-display text-2xl mb-2" style={{ color: '#F8F4EF' }}>No rooms match your filters</h3>
              <p className="font-body mb-6" style={{ color: 'rgba(248,244,239,0.4)' }}>Try adjusting or clearing your filters.</p>
              <button onClick={resetFilters} className="btn-gold px-8 py-3 rounded-full text-xs font-body tracking-widest uppercase">
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}