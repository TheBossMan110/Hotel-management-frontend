import { Award, Users, Globe, Heart } from 'lucide-react'
import HotelLobby3D from '../../components/3d/HotelLobby3D'

const stats = [
  { icon: Award,  value: '40+',  label: 'Years of Excellence' },
  { icon: Users,  value: '50K+', label: 'Happy Guests' },
  { icon: Globe,  value: '100+', label: 'Countries Served' },
  { icon: Heart,  value: '4.9',  label: 'Average Rating' },
]

const team = [
  { name: 'Alexandra Reynolds', role: 'General Manager',         bio: '20+ years in luxury hospitality' },
  { name: 'Marcus Chen',        role: 'Executive Chef',           bio: 'Michelin-starred culinary expertise' },
  { name: 'Isabella Martinez',  role: 'Guest Relations Director', bio: 'Dedicated to exceptional experiences' },
  { name: 'James Thompson',     role: 'Spa Director',             bio: 'Wellness and relaxation specialist' },
]

const values = [
  { num: '01', title: 'Excellence',    body: 'We pursue perfection in every detail, from housekeeping to fine dining, ensuring every guest experience exceeds expectations.' },
  { num: '02', title: 'Hospitality',   body: 'True hospitality comes from the heart. Our team treats every guest as a cherished member of the Grand Azure family.' },
  { num: '03', title: 'Sustainability',body: 'We are committed to environmental stewardship, implementing eco-friendly practices throughout our operations.' },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-20" style={{ background: '#0A0A0A', color: '#F8F4EF' }}>

      {/* Hero */}
      <section className="py-20 px-6 text-center" style={{ background: 'linear-gradient(180deg, #0A0A0A 0%, #111111 100%)' }}>
        <p className="text-xs font-body tracking-[0.3em] uppercase mb-4" style={{ color: '#C9A84C' }}>Our Story</p>
        <h1 className="font-display font-light mb-6" style={{ fontSize: 'clamp(40px, 6vw, 80px)', color: '#F8F4EF', lineHeight: '1.1' }}>
          A Legacy of<br /><span className="italic text-gradient-gold">Hospitality</span>
        </h1>
        <p className="font-body text-lg max-w-2xl mx-auto" style={{ color: 'rgba(248,244,239,0.5)' }}>
          A legacy of luxury, hospitality, and unforgettable experiences since 1985.
        </p>
      </section>

      {/* 3D Lobby Section */}
      <section className="h-[60vh] relative">
        <HotelLobby3D />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #0A0A0A 0%, transparent 40%)' }} />
        <div className="absolute bottom-0 left-0 right-0 p-8 text-center">
          <p className="text-sm font-body" style={{ color: 'rgba(248,244,239,0.4)' }}>
            Experience our stunning lobby in 3D — Drag to explore
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 px-6" style={{ background: '#0A0A0A' }}>
        <div className="max-w-4xl mx-auto">
          <div className="mb-8" style={{ width: 48, height: 1, background: '#C9A84C' }} />
          <h2 className="font-display font-light text-center mb-10" style={{ fontSize: 'clamp(28px, 4vw, 48px)', color: '#F8F4EF' }}>Where Elegance Meets Excellence</h2>
          <div className="space-y-6 font-body text-base leading-relaxed" style={{ color: 'rgba(248,244,239,0.6)' }}>
            <p>Founded in 1985 by the visionary entrepreneur Richard Horizon, Grand Horizon Hotel began as a modest beachfront retreat with a singular mission: to redefine luxury hospitality. What started as a 20-room boutique hotel has evolved into one of the most prestigious destinations in the region.</p>
            <p>Over four decades, we have hosted dignitaries, celebrities, and discerning travelers from around the globe. Our commitment to excellence has remained unwavering, earning us numerous accolades including the Forbes Five-Star rating and the AAA Five Diamond Award for 15 consecutive years.</p>
            <p>Today, Grand Horizon stands as a testament to timeless elegance and modern sophistication. Every detail, from our meticulously designed rooms to our world-class dining experiences, reflects our dedication to creating memories that last a lifetime.</p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6" style={{ background: '#111111' }}>
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="text-center p-6 rounded-2xl gold-border-glow"
                style={{ background: '#1A1A1A' }}
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'rgba(201,168,76,0.1)' }}>
                  <stat.icon className="w-5 h-5" style={{ color: '#C9A84C' }} />
                </div>
                <div className="font-display text-3xl mb-1 text-gradient-gold">{stat.value}</div>
                <div className="text-xs font-body" style={{ color: 'rgba(248,244,239,0.4)' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-6" style={{ background: '#0A0A0A' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-body tracking-[0.3em] uppercase mb-3" style={{ color: '#C9A84C' }}>What We Stand For</p>
            <h2 className="font-display font-light" style={{ fontSize: 'clamp(28px, 4vw, 48px)', color: '#F8F4EF' }}>Our Values</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map((v, i) => (
              <div key={i} className="p-8 rounded-2xl text-center gold-border-glow" style={{ background: '#111111' }}>
                <div className="font-display text-4xl mb-4 text-gradient-gold">{v.num}</div>
                <h3 className="font-display text-xl mb-3" style={{ color: '#F8F4EF' }}>{v.title}</h3>
                <p className="font-body text-sm leading-relaxed" style={{ color: 'rgba(248,244,239,0.5)' }}>{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-20 px-6" style={{ background: '#111111' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-body tracking-[0.3em] uppercase mb-3" style={{ color: '#C9A84C' }}>The People Behind</p>
            <h2 className="font-display font-light" style={{ fontSize: 'clamp(28px, 4vw, 48px)', color: '#F8F4EF' }}>Leadership Team</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, i) => (
              <div key={i} className="text-center p-6 rounded-2xl gold-border-glow" style={{ background: '#1A1A1A' }}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)' }}>
                  <span className="font-display text-xl" style={{ color: '#C9A84C' }}>
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <h3 className="font-display text-lg mb-1" style={{ color: '#F8F4EF' }}>{member.name}</h3>
                <p className="text-xs font-body mb-2" style={{ color: '#C9A84C' }}>{member.role}</p>
                <p className="text-xs font-body" style={{ color: 'rgba(248,244,239,0.4)' }}>{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
