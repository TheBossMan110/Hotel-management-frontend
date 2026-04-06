import { useState } from 'react'
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react'
import { emailAPI } from '../../lib/api'

const ADMIN_EMAIL = 'syedzakihaider2006@gmail.com' // change to real admin email

const contactInfo = [
  { icon: MapPin, title: 'Address', content: '123 Ocean Boulevard\nMiami Beach, FL 33139' },
  { icon: Phone,  title: 'Phone',   content: '+1 (555) 123-4567\n+1 (555) 123-4568' },
  { icon: Mail,   title: 'Email',   content: 'info@grandazure.com\nreservations@grandazure.com' },
  { icon: Clock,  title: 'Hours',   content: '24/7 Front Desk\nConcierge: 7AM – 11PM' },
]

const inquiryTypes = [
  { value: 'general',     label: 'General Inquiry' },
  { value: 'reservation', label: 'Reservation Question' },
  { value: 'event',       label: 'Event Planning' },
  { value: 'feedback',    label: 'Feedback' },
  { value: 'partnership', label: 'Business Partnership' },
]

const faqs = [
  { q: 'What are your check-in and check-out times?',  a: 'Check-in is at 3:00 PM and check-out is at 11:00 AM. Early check-in and late check-out may be available upon request.' },
  { q: 'Do you offer airport transportation?',         a: 'Yes, we offer complimentary airport shuttle service for all guests. Please contact our concierge to arrange your pickup.' },
  { q: 'Is parking available?',                        a: 'We offer complimentary valet parking for all hotel guests. Self-parking is also available in our secured garage.' },
  { q: 'Are pets allowed?',                            a: 'We welcome small pets (under 25 lbs) with a pet deposit. Please inform us in advance so we can prepare a pet-friendly room.' },
]

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', type: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [openFaq, setOpenFaq] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Build admin-readable HTML email body
    const inquiryLabel = inquiryTypes.find(t => t.value === form.type)?.label || form.type || 'General Inquiry'
    const subject = `${inquiryLabel} — ${form.name}`

    const htmlMessage = `
      <p style="color:rgba(201,168,76,0.8);font-size:11px;letter-spacing:3px;text-transform:uppercase;margin:0 0 20px;">New Contact Form Submission</p>

      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
        <tr>
          <td style="padding:10px 16px;background:rgba(201,168,76,0.05);border-left:3px solid #C9A84C;border-radius:0 6px 0 0;">
            <p style="margin:0;font-size:11px;color:rgba(248,244,239,0.45);text-transform:uppercase;letter-spacing:2px;">Inquiry Type</p>
            <p style="margin:4px 0 0;font-size:15px;color:#C9A84C;font-weight:600;">${inquiryLabel}</p>
          </td>
        </tr>
        <tr><td style="height:8px;"></td></tr>
        <tr>
          <td style="padding:10px 16px;background:rgba(201,168,76,0.03);border-left:3px solid rgba(201,168,76,0.3);">
            <p style="margin:0;font-size:11px;color:rgba(248,244,239,0.45);text-transform:uppercase;letter-spacing:2px;">Guest Name</p>
            <p style="margin:4px 0 0;font-size:16px;color:#F8F4EF;font-weight:500;">${form.name}</p>
          </td>
        </tr>
        <tr><td style="height:8px;"></td></tr>
        <tr>
          <td style="padding:10px 16px;background:rgba(201,168,76,0.03);border-left:3px solid rgba(201,168,76,0.3);">
            <p style="margin:0;font-size:11px;color:rgba(248,244,239,0.45);text-transform:uppercase;letter-spacing:2px;">Email Address</p>
            <p style="margin:4px 0 0;"><a href="mailto:${form.email}" style="font-size:15px;color:#C9A84C;text-decoration:none;">${form.email}</a></p>
          </td>
        </tr>
        <tr><td style="height:8px;"></td></tr>
        <tr>
          <td style="padding:10px 16px;background:rgba(201,168,76,0.03);border-left:3px solid rgba(201,168,76,0.3);">
            <p style="margin:0;font-size:11px;color:rgba(248,244,239,0.45);text-transform:uppercase;letter-spacing:2px;">Phone Number</p>
            <p style="margin:4px 0 0;"><a href="tel:${form.phone || ''}" style="font-size:15px;color:#F8F4EF;text-decoration:none;">${form.phone || 'Not provided'}</a></p>
          </td>
        </tr>
      </table>

      <p style="margin:0 0 12px;font-size:11px;color:rgba(248,244,239,0.45);text-transform:uppercase;letter-spacing:2px;">Message</p>
      <div style="background:rgba(201,168,76,0.04);border:1px solid rgba(201,168,76,0.15);border-radius:8px;padding:20px;margin-bottom:24px;">
        <p style="margin:0;font-size:15px;color:#F8F4EF;line-height:1.8;white-space:pre-wrap;">${form.message}</p>
      </div>

      <p style="margin:0;font-size:12px;color:rgba(248,244,239,0.3);">
        📅 Received: ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Karachi' })} PKT
        &nbsp;·&nbsp;
        Reply directly to: <a href="mailto:${form.email}" style="color:#C9A84C;text-decoration:none;">${form.email}</a>
      </p>
    `

    try {
      await emailAPI.send({ to: ADMIN_EMAIL, subject, message: htmlMessage })
      setSubmitted(true)
    } catch (err) {
      console.error('Contact form email failed:', err)
      setSubmitted(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen pt-20" style={{ background: '#0A0A0A', color: '#F8F4EF' }}>

      {/* Hero */}
      <section className="relative py-20 px-6 text-center overflow-hidden" style={{ borderBottom: '1px solid #2A2A2A' }}>
        {/* Background Image */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'url(https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1920&q=80)',
          backgroundSize: 'cover', backgroundPosition: 'center',
        }} />
        {/* Dark overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(10,10,10,0.75), rgba(10,10,10,0.85))' }} />
        {/* Content */}
        <div className="relative z-10">
          <p className="text-xs font-body tracking-[0.3em] uppercase mb-4" style={{ color: '#C9A84C' }}>Get In Touch</p>
          <h1 className="font-display font-light mb-6" style={{ fontSize: 'clamp(40px, 6vw, 80px)', color: '#F8F4EF' }}>Contact Us</h1>
          <p className="font-body text-lg" style={{ color: 'rgba(248,244,239,0.5)' }}>
            We&apos;re here to assist you with any questions or special requests.
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-14 px-6" style={{ background: '#0A0A0A' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {contactInfo.map((info, i) => (
              <div key={i} className="p-6 rounded-2xl gold-border-glow" style={{ background: '#111111' }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                  style={{ background: 'rgba(201,168,76,0.1)' }}>
                  <info.icon className="w-5 h-5" style={{ color: '#C9A84C' }} />
                </div>
                <h3 className="font-display text-lg mb-2" style={{ color: '#F8F4EF' }}>{info.title}</h3>
                <p className="text-sm font-body whitespace-pre-line" style={{ color: 'rgba(248,244,239,0.5)' }}>
                  {info.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form + Map */}
      <section className="py-16 px-6" style={{ background: '#111111' }}>
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Form */}
            <div>
              <p className="text-xs font-body tracking-[0.3em] uppercase mb-3" style={{ color: '#C9A84C' }}>Message Us</p>
              <h2 className="font-display font-light text-3xl mb-8" style={{ color: '#F8F4EF' }}>Send us a Message</h2>

              {submitted ? (
                <div className="p-8 rounded-2xl text-center" style={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }}>
                  <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
                    <Send className="w-6 h-6" style={{ color: '#4ade80' }} />
                  </div>
                  <h3 className="font-display text-2xl mb-2" style={{ color: '#F8F4EF' }}>Message Sent!</h3>
                  <p className="font-body text-sm mb-6" style={{ color: 'rgba(248,244,239,0.5)' }}>
                    Thank you for reaching out. We&apos;ll get back to you within 24 hours.
                  </p>
                  <button onClick={() => setSubmitted(false)}
                    className="px-8 py-3 rounded-full text-xs font-body tracking-widest uppercase transition-all"
                    style={{ border: '1px solid rgba(201,168,76,0.4)', color: '#C9A84C' }}>
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {[
                    { label: 'Full Name', key: 'name', type: 'text', placeholder: 'John Doe' },
                    { label: 'Email Address', key: 'email', type: 'email', placeholder: 'john@example.com' },
                    { label: 'Phone Number', key: 'phone', type: 'tel', placeholder: '+1 (555) 123-4567' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="block text-xs font-body tracking-widest uppercase mb-2" style={{ color: '#C9A84C' }}>{f.label}</label>
                      <input type={f.type} placeholder={f.placeholder} value={form[f.key]}
                        onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                        required={f.key !== 'phone'}
                        className="luxury-input w-full h-11 px-4 text-sm font-body" />
                    </div>
                  ))}

                  <div>
                    <label className="block text-xs font-body tracking-widest uppercase mb-2" style={{ color: '#C9A84C' }}>Inquiry Type</label>
                    <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                      className="luxury-input w-full h-11 px-4 text-sm font-body">
                      <option value="">Select inquiry type</option>
                      {inquiryTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-body tracking-widest uppercase mb-2" style={{ color: '#C9A84C' }}>Message</label>
                    <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                      placeholder="How can we help you?" rows={4} required
                      className="luxury-input w-full px-4 py-3 text-sm font-body resize-none" />
                  </div>

                  <button type="submit" disabled={isSubmitting}
                    className="btn-gold w-full h-12 rounded-xl text-xs tracking-widest uppercase font-body disabled:opacity-50">
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Sending…
                      </span>
                    ) : 'Send Message'}
                  </button>
                </form>
              )}
            </div>

            {/* Map placeholder */}
            <div>
              <p className="text-xs font-body tracking-[0.3em] uppercase mb-3" style={{ color: '#C9A84C' }}>Location</p>
              <h2 className="font-display font-light text-3xl mb-8" style={{ color: '#F8F4EF' }}>Find Us</h2>
              <div className="aspect-square rounded-2xl flex items-center justify-center mb-6"
                style={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }}>
                <div className="text-center">
                  <MapPin className="w-12 h-12 mx-auto mb-4" style={{ color: '#C9A84C' }} />
                  <h3 className="font-display text-xl mb-2" style={{ color: '#F8F4EF' }}>Grand Azure Hotel</h3>
                  <p className="text-sm font-body" style={{ color: 'rgba(248,244,239,0.5)' }}>
                    123 Ocean Boulevard<br />Miami Beach, FL 33139
                  </p>
                </div>
              </div>
              <div className="p-5 rounded-2xl" style={{ background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.15)' }}>
                <h4 className="font-display text-lg mb-3" style={{ color: '#C9A84C' }}>Getting Here</h4>
                <ul className="space-y-2 text-sm font-body" style={{ color: 'rgba(248,244,239,0.55)' }}>
                  <li className="flex items-center gap-2"><span style={{ color: '#C9A84C' }}>✦</span>15 minutes from Miami International Airport</li>
                  <li className="flex items-center gap-2"><span style={{ color: '#C9A84C' }}>✦</span>Complimentary airport shuttle available</li>
                  <li className="flex items-center gap-2"><span style={{ color: '#C9A84C' }}>✦</span>Valet parking service at entrance</li>
                  <li className="flex items-center gap-2"><span style={{ color: '#C9A84C' }}>✦</span>Walking distance to South Beach</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6" style={{ background: '#0A0A0A' }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-body tracking-[0.3em] uppercase mb-3" style={{ color: '#C9A84C' }}>FAQ</p>
            <h2 className="font-display font-light" style={{ fontSize: 'clamp(28px, 4vw, 48px)', color: '#F8F4EF' }}>Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-2xl overflow-hidden transition-all duration-300"
                style={{ background: '#111111', border: '1px solid #2A2A2A' }}>
                <button
                  className="w-full flex items-center justify-between p-5 text-left font-body"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-medium" style={{ color: '#F8F4EF' }}>{faq.q}</span>
                  <span className="ml-4 flex-shrink-0 font-display text-lg transition-transform duration-300"
                    style={{ color: '#C9A84C', transform: openFaq === i ? 'rotate(45deg)' : 'rotate(0deg)' }}>+</span>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5">
                    <p className="text-sm font-body leading-relaxed" style={{ color: 'rgba(248,244,239,0.55)' }}>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
