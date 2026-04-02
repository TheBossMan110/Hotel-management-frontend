import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail, Instagram, Facebook, Twitter } from 'lucide-react'

export default function Footer() {
  return (
    <footer style={{ background: '#0A0A0A', borderTop: '1px solid rgba(201,168,76,0.15)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.35)' }}>
                <span className="font-display font-light text-lg" style={{ color: '#C9A84C' }}>GH</span>
              </div>
              <span className="font-display font-light text-xl" style={{ color: '#F8F4EF', letterSpacing: '0.04em' }}>Grand Horizon</span>
            </Link>
            <p className="text-sm font-body leading-relaxed" style={{ color: 'rgba(248,244,239,0.45)' }}>
              Experience luxury redefined at Grand Horizon Hotel. Where every stay becomes an unforgettable memory.
            </p>
            <div className="flex gap-4 mt-6">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <a key={i} href="#"
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200"
                  style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', color: '#C9A84C' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,168,76,0.18)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(201,168,76,0.08)' }}>
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-body font-semibold text-xs tracking-widest uppercase mb-5" style={{ color: '#C9A84C' }}>Quick Links</h4>
            <ul className="space-y-3">
              {[['Rooms & Suites', '/rooms'], ['About Us', '/about'], ['Contact', '/contact'], ['Gallery', '#'], ['Events', '#']].map(([label, href]) => (
                <li key={label}>
                  <Link to={href} className="text-sm font-body transition-colors duration-200"
                    style={{ color: 'rgba(248,244,239,0.5)' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#C9A84C' }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(248,244,239,0.5)' }}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-body font-semibold text-xs tracking-widest uppercase mb-5" style={{ color: '#C9A84C' }}>Services</h4>
            <ul className="space-y-3">
              {['Room Service', 'Concierge', 'Airport Transfer', 'Valet Parking', 'Business Center'].map(item => (
                <li key={item}>
                  <a href="#" className="text-sm font-body transition-colors duration-200"
                    style={{ color: 'rgba(248,244,239,0.5)' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#C9A84C' }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(248,244,239,0.5)' }}>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-body font-semibold text-xs tracking-widest uppercase mb-5" style={{ color: '#C9A84C' }}>Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm font-body" style={{ color: 'rgba(248,244,239,0.5)' }}>
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#C9A84C' }} />
                <span>Main Boulevard, Gulberg III, Lahore, Pakistan</span>
              </li>
              <li className="flex items-center gap-3 text-sm font-body" style={{ color: 'rgba(248,244,239,0.5)' }}>
                <Phone className="w-4 h-4 flex-shrink-0" style={{ color: '#C9A84C' }} />
                <span>+92 (42) 111-222-333</span>
              </li>
              <li className="flex items-center gap-3 text-sm font-body" style={{ color: 'rgba(248,244,239,0.5)' }}>
                <Mail className="w-4 h-4 flex-shrink-0" style={{ color: '#C9A84C' }} />
                <span>info@grandazure.pk</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4"
          style={{ borderTop: '1px solid rgba(201,168,76,0.12)' }}>
          <p className="text-xs font-body" style={{ color: 'rgba(248,244,239,0.3)' }}>
            © 2026 Grand Azure Hotel. All rights reserved.
          </p>
          <div className="flex gap-6">
            {['Privacy Policy', 'Terms of Service'].map(label => (
              <a key={label} href="#" className="text-xs font-body transition-colors duration-200"
                style={{ color: 'rgba(248,244,239,0.3)' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#C9A84C' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(248,244,239,0.3)' }}>
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
