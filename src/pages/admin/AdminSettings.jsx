import { useState, useEffect } from 'react'
import { settingsAPI } from '../../lib/api'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs'

// ─── Icons ───────────────────────────────────────────────────────────────────

const Icon = ({ d, className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d={d} />
  </svg>
)
const SaveIcon      = () => <Icon d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" className="w-4 h-4 mr-2" />
const SpinnerIcon   = () => <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>
const HotelIcon     = () => <Icon d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
const BookingIcon   = () => <Icon d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
const PricingIcon   = () => <Icon d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33" />
const BellIcon      = () => <Icon d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
const ShieldIcon    = () => <Icon d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
const IntegrationIcon = () => <Icon d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
const UserIcon      = () => <Icon d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
const KeyIcon       = () => <Icon d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />

// ─── Reusable Toggle ─────────────────────────────────────────────────────────
const Toggle = ({ checked, onChange, label, description }) => (
  <div className="flex items-start gap-3">
    <div
      onClick={() => onChange(!checked)}
      className={`relative flex-shrink-0 mt-0.5 w-11 h-6 rounded-full transition-colors cursor-pointer ${
        checked ? 'bg-primary' : 'bg-muted'
      }`}
    >
      <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : ''}`} />
    </div>
    <div>
      <p className="text-sm font-medium leading-none">{label}</p>
      {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
    </div>
  </div>
)

// ─── Section Heading ─────────────────────────────────────────────────────────
const SectionHeading = ({ title, description }) => (
  <div className="mb-4">
    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
    {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
  </div>
)

// ─── Field wrapper ────────────────────────────────────────────────────────────
const Field = ({ label, hint, children, className = '' }) => (
  <div className={`space-y-1 ${className}`}>
    <label className="text-sm font-medium">{label}</label>
    {children}
    {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
  </div>
)

// ─── Save Button ─────────────────────────────────────────────────────────────
const SaveBtn = ({ section, saving, onClick }) => (
  <Button onClick={onClick} disabled={saving}>
    {saving ? <SpinnerIcon /> : <SaveIcon />}
    {saving ? 'Saving…' : 'Save Changes'}
  </Button>
)

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('general')
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState({})
  const [toast, setToast]         = useState(null)

  // ── State slices ────────────────────────────────────────────────────────────
  const [hotelInfo, setHotelInfo] = useState({
    name: '', tagline: '', description: '',
    address: { street: '', city: '', state: '', country: '', zipCode: '' },
    contact: { phone: '', email: '', fax: '', website: '' },
    socialMedia: { facebook: '', instagram: '', twitter: '' },
  })

  const [bookingSettings, setBookingSettings] = useState({
    checkInTime: '15:00', checkOutTime: '11:00',
    minAdvanceBooking: 0, maxAdvanceBooking: 365,
    allowOnlineBooking: true, requireDeposit: false,
    depositPercentage: 20,
    cancellationPolicy: { freeCancellationHours: 24, cancellationFeePercent: 50 },
  })

  const [pricingSettings, setPricingSettings] = useState({
    currency: 'PKR', currencySymbol: '₨',
    taxRate: 16, taxName: 'GST',
    serviceChargeRate: 5, weekendMultiplier: 1.2,
  })

  const [notificationSettings, setNotificationSettings] = useState({
    emailEnabled: true,  smsEnabled: false,
    bookingConfirmation: true, checkInReminder: true,
    checkOutReminder: true, paymentReceipt: true,
    promotionalEmails: true,
    emailNewBooking: true, emailCancellation: true,
    emailCheckIn: true, emailCheckOut: false, emailFeedback: true,
    smsNewBooking: false, smsCancellation: true,
  })

  const [securitySettings, setSecuritySettings] = useState({
    passwordMinLength: 8, sessionTimeout: 60,
    maxLoginAttempts: 5, lockoutDuration: 30,
    requirePasswordChange: false, twoFactorEnabled: false,
  })

  const [integrations, setIntegrations] = useState({
    paymentGateway: { provider: '', enabled: false },
    emailService:   { provider: '', enabled: false },
    smsService:     { provider: '', enabled: false },
  })

  const [adminProfile, setAdminProfile] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    currentPassword: '', newPassword: '', confirmPassword: '',
  })

  // ── Load ────────────────────────────────────────────────────────────────────
  useEffect(() => { loadSettings() }, [])

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const loadSettings = async () => {
    setLoading(true)
    try {
      const { data } = await settingsAPI.get()
      const s = data.settings || {}
      if (s.hotelInfo)     setHotelInfo(prev    => deepMerge(prev, s.hotelInfo))
      if (s.booking)       setBookingSettings(prev => deepMerge(prev, s.booking))
      if (s.pricing)       setPricingSettings(prev  => deepMerge(prev, s.pricing))
      if (s.notifications) setNotificationSettings(prev => deepMerge(prev, s.notifications))
      if (s.security)      setSecuritySettings(prev => deepMerge(prev, s.security))
      if (s.integrations)  setIntegrations(prev     => deepMerge(prev, s.integrations))
    } catch {
      showToast('Failed to load settings — showing defaults.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const deepMerge = (target, source) => {
    if (!source) return target
    const result = { ...target }
    for (const key of Object.keys(source)) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = deepMerge(target[key] || {}, source[key])
      } else if (source[key] !== undefined && source[key] !== null) {
        result[key] = source[key]
      }
    }
    return result
  }

  // ── Save helpers ────────────────────────────────────────────────────────────
  const save = async (section, data, apiCall) => {
    setSaving(p => ({ ...p, [section]: true }))
    try {
      await apiCall(data)
      showToast(`${section.charAt(0).toUpperCase() + section.slice(1)} settings saved successfully.`)
    } catch (err) {
      showToast(err.response?.data?.message || `Failed to save ${section} settings.`, 'error')
    } finally {
      setSaving(p => ({ ...p, [section]: false }))
    }
  }

  const handleChangePassword = async () => {
    if (adminProfile.newPassword !== adminProfile.confirmPassword) {
      showToast('New passwords do not match.', 'error')
      return
    }
    if (adminProfile.newPassword.length < securitySettings.passwordMinLength) {
      showToast(`Password must be at least ${securitySettings.passwordMinLength} characters.`, 'error')
      return
    }
    setSaving(p => ({ ...p, password: true }))
    try {
      await settingsAPI.changePassword?.({
        currentPassword: adminProfile.currentPassword,
        newPassword: adminProfile.newPassword,
      })
      showToast('Password changed successfully.')
      setAdminProfile(p => ({ ...p, currentPassword: '', newPassword: '', confirmPassword: '' }))
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to change password.', 'error')
    } finally {
      setSaving(p => ({ ...p, password: false }))
    }
  }

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Loading settings…</p>
      </div>
    )
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6 pb-10">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-5 py-3 rounded-xl shadow-xl text-white text-sm font-medium transition-all ${
          toast.type === 'error' ? 'bg-destructive' : 'bg-emerald-600'
        }`}>
          {toast.type === 'error'
            ? <Icon d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" className="w-4 h-4 flex-shrink-0" />
            : <Icon d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" className="w-4 h-4 flex-shrink-0" />
          }
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground text-sm mt-1">Configure your hotel management system</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-accent/40 px-3 py-1.5 rounded-full">
          <Icon d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" className="w-3.5 h-3.5" />
          Last saved: just now
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="general">
            <span className="flex items-center gap-2"><HotelIcon />Hotel Info</span>
          </TabsTrigger>
          <TabsTrigger value="booking">
            <span className="flex items-center gap-2"><BookingIcon />Booking</span>
          </TabsTrigger>
          <TabsTrigger value="pricing">
            <span className="flex items-center gap-2"><PricingIcon />Pricing & Tax</span>
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <span className="flex items-center gap-2"><BellIcon />Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security">
            <span className="flex items-center gap-2"><ShieldIcon />Security</span>
          </TabsTrigger>
          <TabsTrigger value="integrations">
            <span className="flex items-center gap-2"><IntegrationIcon />Integrations</span>
          </TabsTrigger>
          <TabsTrigger value="account">
            <span className="flex items-center gap-2"><UserIcon />My Account</span>
          </TabsTrigger>
        </TabsList>

        {/* ═══════════════════ HOTEL INFORMATION ═══════════════════ */}
        <TabsContent value="general" className="mt-6 space-y-5">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Hotel Information</CardTitle>
              <CardDescription>Your hotel's public-facing identity and contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Hotel Name" className="md:col-span-2">
                  <Input
                    value={hotelInfo.name}
                    onChange={e => setHotelInfo(p => ({ ...p, name: e.target.value }))}
                    placeholder="Grand Luxe Hotel"
                  />
                </Field>
                <Field label="Tagline">
                  <Input
                    value={hotelInfo.tagline || ''}
                    onChange={e => setHotelInfo(p => ({ ...p, tagline: e.target.value }))}
                    placeholder="Luxury redefined"
                  />
                </Field>
                <Field label="Contact Email">
                  <Input
                    type="email"
                    value={hotelInfo.contact?.email || ''}
                    onChange={e => setHotelInfo(p => ({ ...p, contact: { ...p.contact, email: e.target.value } }))}
                    placeholder="info@hotel.com"
                  />
                </Field>
                <Field label="Phone Number">
                  <Input
                    value={hotelInfo.contact?.phone || ''}
                    onChange={e => setHotelInfo(p => ({ ...p, contact: { ...p.contact, phone: e.target.value } }))}
                    placeholder="+92 21 111 000 000"
                  />
                </Field>
                <Field label="Fax Number">
                  <Input
                    value={hotelInfo.contact?.fax || ''}
                    onChange={e => setHotelInfo(p => ({ ...p, contact: { ...p.contact, fax: e.target.value } }))}
                    placeholder="+92 21 111 000 001"
                  />
                </Field>
                <Field label="Website" className="md:col-span-2">
                  <Input
                    value={hotelInfo.contact?.website || ''}
                    onChange={e => setHotelInfo(p => ({ ...p, contact: { ...p.contact, website: e.target.value } }))}
                    placeholder="https://www.yourhotel.com"
                  />
                </Field>
                <Field label="Description" className="md:col-span-2">
                  <textarea
                    className="w-full min-h-[80px] px-3 py-2 text-sm rounded-md border border-input bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                    value={hotelInfo.description || ''}
                    onChange={e => setHotelInfo(p => ({ ...p, description: e.target.value }))}
                    placeholder="A brief description of your hotel…"
                  />
                </Field>
              </div>
            </CardContent>
          </Card>

          {/* Address */}
          <Card>
            <CardHeader><CardTitle>Address</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Street Address" className="md:col-span-2">
                  <Input
                    value={hotelInfo.address?.street || ''}
                    onChange={e => setHotelInfo(p => ({ ...p, address: { ...p.address, street: e.target.value } }))}
                    placeholder="123 Hotel Street"
                  />
                </Field>
                <Field label="City">
                  <Input
                    value={hotelInfo.address?.city || ''}
                    onChange={e => setHotelInfo(p => ({ ...p, address: { ...p.address, city: e.target.value } }))}
                    placeholder="Karachi"
                  />
                </Field>
                <Field label="State / Province">
                  <Input
                    value={hotelInfo.address?.state || ''}
                    onChange={e => setHotelInfo(p => ({ ...p, address: { ...p.address, state: e.target.value } }))}
                    placeholder="Sindh"
                  />
                </Field>
                <Field label="Zip / Postal Code">
                  <Input
                    value={hotelInfo.address?.zipCode || ''}
                    onChange={e => setHotelInfo(p => ({ ...p, address: { ...p.address, zipCode: e.target.value } }))}
                    placeholder="75400"
                  />
                </Field>
                <Field label="Country">
                  <Input
                    value={hotelInfo.address?.country || ''}
                    onChange={e => setHotelInfo(p => ({ ...p, address: { ...p.address, country: e.target.value } }))}
                    placeholder="Pakistan"
                  />
                </Field>
              </div>
            </CardContent>
          </Card>

          {/* Social Media */}
          <Card>
            <CardHeader><CardTitle>Social Media</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="Facebook">
                  <Input
                    value={hotelInfo.socialMedia?.facebook || ''}
                    onChange={e => setHotelInfo(p => ({ ...p, socialMedia: { ...p.socialMedia, facebook: e.target.value } }))}
                    placeholder="https://facebook.com/yourhotel"
                  />
                </Field>
                <Field label="Instagram">
                  <Input
                    value={hotelInfo.socialMedia?.instagram || ''}
                    onChange={e => setHotelInfo(p => ({ ...p, socialMedia: { ...p.socialMedia, instagram: e.target.value } }))}
                    placeholder="https://instagram.com/yourhotel"
                  />
                </Field>
                <Field label="Twitter / X">
                  <Input
                    value={hotelInfo.socialMedia?.twitter || ''}
                    onChange={e => setHotelInfo(p => ({ ...p, socialMedia: { ...p.socialMedia, twitter: e.target.value } }))}
                    placeholder="https://twitter.com/yourhotel"
                  />
                </Field>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <SaveBtn section="hotel" saving={saving.hotel} onClick={() => save('hotel', hotelInfo, settingsAPI.updateHotelInfo)} />
          </div>
        </TabsContent>

        {/* ═══════════════════ BOOKING SETTINGS ═══════════════════ */}
        <TabsContent value="booking" className="mt-6 space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Check-in / Check-out</CardTitle>
              <CardDescription>Configure default times and advance booking windows</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Check-in Time">
                  <Input
                    type="time"
                    value={bookingSettings.checkInTime}
                    onChange={e => setBookingSettings(p => ({ ...p, checkInTime: e.target.value }))}
                  />
                </Field>
                <Field label="Check-out Time">
                  <Input
                    type="time"
                    value={bookingSettings.checkOutTime}
                    onChange={e => setBookingSettings(p => ({ ...p, checkOutTime: e.target.value }))}
                  />
                </Field>
                <Field label="Min Advance Booking (days)" hint="Set to 0 to allow same-day bookings">
                  <Input
                    type="number" min="0"
                    value={bookingSettings.minAdvanceBooking}
                    onChange={e => setBookingSettings(p => ({ ...p, minAdvanceBooking: Number(e.target.value) }))}
                  />
                </Field>
                <Field label="Max Advance Booking (days)" hint="How far in advance guests can book">
                  <Input
                    type="number" min="1"
                    value={bookingSettings.maxAdvanceBooking}
                    onChange={e => setBookingSettings(p => ({ ...p, maxAdvanceBooking: Number(e.target.value) }))}
                  />
                </Field>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cancellation Policy</CardTitle>
              <CardDescription>Define free cancellation window and applicable fees</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Free Cancellation Window (hours)" hint="Hours before check-in where cancellation is free">
                  <Input
                    type="number" min="0"
                    value={bookingSettings.cancellationPolicy?.freeCancellationHours ?? 24}
                    onChange={e => setBookingSettings(p => ({
                      ...p,
                      cancellationPolicy: { ...p.cancellationPolicy, freeCancellationHours: Number(e.target.value) }
                    }))}
                  />
                </Field>
                <Field label="Cancellation Fee (%)" hint="Fee charged when cancelled outside free window">
                  <Input
                    type="number" min="0" max="100"
                    value={bookingSettings.cancellationPolicy?.cancellationFeePercent ?? 50}
                    onChange={e => setBookingSettings(p => ({
                      ...p,
                      cancellationPolicy: { ...p.cancellationPolicy, cancellationFeePercent: Number(e.target.value) }
                    }))}
                  />
                </Field>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Deposit & Online Booking</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Toggle
                checked={bookingSettings.allowOnlineBooking}
                onChange={v => setBookingSettings(p => ({ ...p, allowOnlineBooking: v }))}
                label="Allow online bookings"
                description="Guests can book rooms from the public website"
              />
              <Toggle
                checked={bookingSettings.requireDeposit}
                onChange={v => setBookingSettings(p => ({ ...p, requireDeposit: v }))}
                label="Require deposit on booking"
                description="Collect a deposit percentage when a booking is confirmed"
              />
              {bookingSettings.requireDeposit && (
                <Field label="Deposit Percentage (%)" className="pl-14 w-48">
                  <Input
                    type="number" min="1" max="100"
                    value={bookingSettings.depositPercentage}
                    onChange={e => setBookingSettings(p => ({ ...p, depositPercentage: Number(e.target.value) }))}
                  />
                </Field>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <SaveBtn section="booking" saving={saving.booking} onClick={() => save('booking', bookingSettings, settingsAPI.updateBooking)} />
          </div>
        </TabsContent>

        {/* ═══════════════════ PRICING & TAX ═══════════════════ */}
        <TabsContent value="pricing" className="mt-6 space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Currency & Tax</CardTitle>
              <CardDescription>Configure currency and tax rates applied to all bookings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Currency">
                  <Select
                    value={pricingSettings.currency}
                    onChange={e => setPricingSettings(p => ({ ...p, currency: e.target.value }))}
                    options={[
                      { value: 'PKR', label: 'PKR — Pakistani Rupee' },
                      { value: 'USD', label: 'USD — US Dollar' },
                      { value: 'EUR', label: 'EUR — Euro' },
                      { value: 'GBP', label: 'GBP — British Pound' },
                      { value: 'AED', label: 'AED — UAE Dirham' },
                      { value: 'SAR', label: 'SAR — Saudi Riyal' },
                      { value: 'JPY', label: 'JPY — Japanese Yen' },
                    ]}
                  />
                </Field>
                <Field label="Currency Symbol" hint='e.g. $ ₨ €'>
                  <Input
                    value={pricingSettings.currencySymbol}
                    onChange={e => setPricingSettings(p => ({ ...p, currencySymbol: e.target.value }))}
                    className="w-24"
                  />
                </Field>
                <Field label="Tax Name" hint="e.g. GST, VAT, Sales Tax">
                  <Input
                    value={pricingSettings.taxName}
                    onChange={e => setPricingSettings(p => ({ ...p, taxName: e.target.value }))}
                    placeholder="GST"
                  />
                </Field>
                <Field label="Tax Rate (%)" hint="Applied to all room charges">
                  <Input
                    type="number" min="0" max="100" step="0.1"
                    value={pricingSettings.taxRate}
                    onChange={e => setPricingSettings(p => ({ ...p, taxRate: Number(e.target.value) }))}
                  />
                </Field>
                <Field label="Service Charge (%)" hint="Additional service charge on subtotal">
                  <Input
                    type="number" min="0" max="100" step="0.1"
                    value={pricingSettings.serviceChargeRate}
                    onChange={e => setPricingSettings(p => ({ ...p, serviceChargeRate: Number(e.target.value) }))}
                  />
                </Field>
                <Field label="Weekend Price Multiplier" hint="e.g. 1.2 = 20% surcharge on weekends">
                  <Input
                    type="number" min="1" max="5" step="0.05"
                    value={pricingSettings.weekendMultiplier}
                    onChange={e => setPricingSettings(p => ({ ...p, weekendMultiplier: Number(e.target.value) }))}
                  />
                </Field>
              </div>
            </CardContent>
          </Card>

          {/* Preview card */}
          <Card className="bg-accent/20 border-dashed">
            <CardHeader><CardTitle className="text-sm">Price Preview</CardTitle></CardHeader>
            <CardContent>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Room charge (example)</span>
                  <span>{pricingSettings.currencySymbol} 10,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{pricingSettings.taxName} ({pricingSettings.taxRate}%)</span>
                  <span>+ {pricingSettings.currencySymbol} {(10000 * pricingSettings.taxRate / 100).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service charge ({pricingSettings.serviceChargeRate}%)</span>
                  <span>+ {pricingSettings.currencySymbol} {(10000 * pricingSettings.serviceChargeRate / 100).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-semibold border-t border-border pt-1 mt-1">
                  <span>Total</span>
                  <span>{pricingSettings.currencySymbol} {(10000 * (1 + pricingSettings.taxRate / 100 + pricingSettings.serviceChargeRate / 100)).toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <SaveBtn section="pricing" saving={saving.pricing} onClick={() => save('pricing', pricingSettings, settingsAPI.updatePricing)} />
          </div>
        </TabsContent>

        {/* ═══════════════════ NOTIFICATIONS ═══════════════════ */}
        <TabsContent value="notifications" className="mt-6 space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Channel Configuration</CardTitle>
              <CardDescription>Enable or disable notification channels globally</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Toggle
                checked={notificationSettings.emailEnabled}
                onChange={v => setNotificationSettings(p => ({ ...p, emailEnabled: v }))}
                label="Email notifications"
                description="Send email alerts to guests and administrators"
              />
              <Toggle
                checked={notificationSettings.smsEnabled}
                onChange={v => setNotificationSettings(p => ({ ...p, smsEnabled: v }))}
                label="SMS notifications"
                description="Send SMS alerts for critical events (requires SMS integration)"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Email Alerts</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'bookingConfirmation', label: 'Booking confirmation', description: 'Sent to guest when a booking is confirmed' },
                { key: 'checkInReminder',     label: 'Check-in reminder',    description: 'Sent 24 hours before scheduled check-in' },
                { key: 'checkOutReminder',    label: 'Check-out reminder',   description: 'Sent the morning of scheduled check-out' },
                { key: 'paymentReceipt',      label: 'Payment receipt',      description: 'Sent after each payment is processed' },
                { key: 'emailNewBooking',     label: 'New booking (admin)',   description: 'Alert admin when a new booking is created' },
                { key: 'emailCancellation',   label: 'Cancellation (admin)',  description: 'Alert admin when a booking is cancelled' },
                { key: 'emailFeedback',       label: 'Guest feedback',        description: 'Alert admin when a guest submits feedback' },
                { key: 'promotionalEmails',   label: 'Promotional emails',    description: 'Marketing and special-offer emails to guests' },
              ].map(({ key, label, description }) => (
                <Toggle
                  key={key}
                  checked={!!notificationSettings[key]}
                  onChange={v => setNotificationSettings(p => ({ ...p, [key]: v }))}
                  label={label}
                  description={description}
                />
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>SMS Alerts</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'smsNewBooking',   label: 'New booking SMS',   description: 'SMS alert for every new booking' },
                { key: 'smsCancellation', label: 'Cancellation SMS',  description: 'SMS alert when a booking is cancelled' },
              ].map(({ key, label, description }) => (
                <Toggle
                  key={key}
                  checked={!!notificationSettings[key]}
                  onChange={v => setNotificationSettings(p => ({ ...p, [key]: v }))}
                  label={label}
                  description={description}
                />
              ))}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <SaveBtn section="notifications" saving={saving.notifications} onClick={() => save('notifications', notificationSettings, settingsAPI.updateNotifications)} />
          </div>
        </TabsContent>

        {/* ═══════════════════ SECURITY ═══════════════════ */}
        <TabsContent value="security" className="mt-6 space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Password Policy</CardTitle>
              <CardDescription>Enforce password strength and rotation requirements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Minimum Password Length" hint="Recommended: 8 or more characters">
                  <Input
                    type="number" min="6" max="32"
                    value={securitySettings.passwordMinLength}
                    onChange={e => setSecuritySettings(p => ({ ...p, passwordMinLength: Number(e.target.value) }))}
                    className="w-32"
                  />
                </Field>
              </div>
              <div className="mt-4 space-y-4">
                <Toggle
                  checked={!!securitySettings.requirePasswordChange}
                  onChange={v => setSecuritySettings(p => ({ ...p, requirePasswordChange: v }))}
                  label="Require staff to change password on first login"
                  description="Applies to all newly created staff accounts"
                />
                <Toggle
                  checked={!!securitySettings.twoFactorEnabled}
                  onChange={v => setSecuritySettings(p => ({ ...p, twoFactorEnabled: v }))}
                  label="Enable two-factor authentication (2FA)"
                  description="Requires admin and staff to verify with a second device"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Session & Login</CardTitle>
              <CardDescription>Control session timeout and brute-force protection</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="Session Timeout (minutes)" hint="Inactive sessions expire after this period">
                  <Input
                    type="number" min="5"
                    value={securitySettings.sessionTimeout}
                    onChange={e => setSecuritySettings(p => ({ ...p, sessionTimeout: Number(e.target.value) }))}
                    className="w-32"
                  />
                </Field>
                <Field label="Max Login Attempts" hint="Account locked after this many failed attempts">
                  <Input
                    type="number" min="1" max="20"
                    value={securitySettings.maxLoginAttempts}
                    onChange={e => setSecuritySettings(p => ({ ...p, maxLoginAttempts: Number(e.target.value) }))}
                    className="w-32"
                  />
                </Field>
                <Field label="Lockout Duration (minutes)" hint="How long the account stays locked">
                  <Input
                    type="number" min="1"
                    value={securitySettings.lockoutDuration}
                    onChange={e => setSecuritySettings(p => ({ ...p, lockoutDuration: Number(e.target.value) }))}
                    className="w-32"
                  />
                </Field>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <SaveBtn section="security" saving={saving.security} onClick={() => save('security', securitySettings, settingsAPI.updateSecurity)} />
          </div>
        </TabsContent>

        {/* ═══════════════════ INTEGRATIONS ═══════════════════ */}
        <TabsContent value="integrations" className="mt-6 space-y-5">
          {[
            {
              key: 'paymentGateway',
              title: 'Payment Gateway',
              description: 'Process credit card, debit card, and online payments',
              icon: <Icon d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" className="w-5 h-5 text-primary" />,
              providerOptions: [
                { value: '', label: 'Select provider' },
                { value: 'stripe', label: 'Stripe' },
                { value: 'paypal', label: 'PayPal' },
                { value: 'jazz-cash', label: 'JazzCash' },
                { value: 'easypaisa', label: 'Easypaisa' },
                { value: 'meezan', label: 'Meezan Bank' },
              ],
              state: integrations.paymentGateway,
              setter: v => setIntegrations(p => ({ ...p, paymentGateway: v })),
            },
            {
              key: 'emailService',
              title: 'Email Service',
              description: 'Transactional and marketing email delivery',
              icon: <Icon d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" className="w-5 h-5 text-primary" />,
              providerOptions: [
                { value: '', label: 'Select provider' },
                { value: 'sendgrid', label: 'SendGrid' },
                { value: 'mailgun', label: 'Mailgun' },
                { value: 'ses', label: 'Amazon SES' },
                { value: 'smtp', label: 'Custom SMTP' },
              ],
              state: integrations.emailService,
              setter: v => setIntegrations(p => ({ ...p, emailService: v })),
            },
            {
              key: 'smsService',
              title: 'SMS Service',
              description: 'SMS alerts and OTP delivery',
              icon: <Icon d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" className="w-5 h-5 text-primary" />,
              providerOptions: [
                { value: '', label: 'Select provider' },
                { value: 'twilio', label: 'Twilio' },
                { value: 'telenor', label: 'Telenor Velocity' },
                { value: 'jazz', label: 'Jazz SMS' },
                { value: 'zong', label: 'Zong SMS' },
              ],
              state: integrations.smsService,
              setter: v => setIntegrations(p => ({ ...p, smsService: v })),
            },
          ].map(({ key, title, description, icon, providerOptions, state, setter }) => (
            <Card key={key}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-accent/50 rounded-lg">{icon}</div>
                    <div>
                      <CardTitle className="text-base">{title}</CardTitle>
                      <CardDescription>{description}</CardDescription>
                    </div>
                  </div>
                  <Toggle
                    checked={state?.enabled ?? false}
                    onChange={v => setter({ ...state, enabled: v })}
                    label=""
                  />
                </div>
              </CardHeader>
              {state?.enabled && (
                <CardContent className="pt-0">
                  <Field label="Provider">
                    <Select
                      value={state?.provider || ''}
                      onChange={e => setter({ ...state, provider: e.target.value })}
                      options={providerOptions}
                    />
                  </Field>
                  {state?.provider && (
                    <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg text-xs text-amber-700 dark:text-amber-400">
                      Configure API keys for <strong>{state.provider}</strong> in your server environment variables (.env file). Never store API secrets in this panel.
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))}

          <div className="flex justify-end">
            <SaveBtn
              section="integrations"
              saving={saving.integrations}
              onClick={() => save('integrations', integrations, settingsAPI.updateIntegrations || (() => Promise.resolve()))}
            />
          </div>
        </TabsContent>

        {/* ═══════════════════ MY ACCOUNT ═══════════════════ */}
        <TabsContent value="account" className="mt-6 space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your admin account details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="First Name">
                  <Input
                    value={adminProfile.firstName}
                    onChange={e => setAdminProfile(p => ({ ...p, firstName: e.target.value }))}
                    placeholder="Admin"
                  />
                </Field>
                <Field label="Last Name">
                  <Input
                    value={adminProfile.lastName}
                    onChange={e => setAdminProfile(p => ({ ...p, lastName: e.target.value }))}
                    placeholder="User"
                  />
                </Field>
                <Field label="Email Address">
                  <Input
                    type="email"
                    value={adminProfile.email}
                    onChange={e => setAdminProfile(p => ({ ...p, email: e.target.value }))}
                    placeholder="admin@hotel.com"
                  />
                </Field>
                <Field label="Phone Number">
                  <Input
                    value={adminProfile.phone}
                    onChange={e => setAdminProfile(p => ({ ...p, phone: e.target.value }))}
                    placeholder="+92 300 000 0000"
                  />
                </Field>
              </div>
              <div className="flex justify-end mt-4">
                <SaveBtn
                  section="profile"
                  saving={saving.profile}
                  onClick={() => save('profile', adminProfile, settingsAPI.updateProfile || (() => Promise.resolve()))}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyIcon />
                Change Password
              </CardTitle>
              <CardDescription>Update your admin account password</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-w-sm">
                <Field label="Current Password">
                  <Input
                    type="password"
                    value={adminProfile.currentPassword}
                    onChange={e => setAdminProfile(p => ({ ...p, currentPassword: e.target.value }))}
                    placeholder="Enter current password"
                  />
                </Field>
                <Field label="New Password" hint={`Minimum ${securitySettings.passwordMinLength} characters`}>
                  <Input
                    type="password"
                    value={adminProfile.newPassword}
                    onChange={e => setAdminProfile(p => ({ ...p, newPassword: e.target.value }))}
                    placeholder="Enter new password"
                  />
                </Field>
                <Field label="Confirm New Password">
                  <Input
                    type="password"
                    value={adminProfile.confirmPassword}
                    onChange={e => setAdminProfile(p => ({ ...p, confirmPassword: e.target.value }))}
                    placeholder="Repeat new password"
                  />
                </Field>
                {adminProfile.newPassword && adminProfile.confirmPassword &&
                  adminProfile.newPassword !== adminProfile.confirmPassword && (
                  <p className="text-xs text-destructive">Passwords do not match</p>
                )}
              </div>
              <div className="flex justify-end mt-4">
                <Button
                  onClick={handleChangePassword}
                  disabled={
                    saving.password ||
                    !adminProfile.currentPassword ||
                    !adminProfile.newPassword ||
                    adminProfile.newPassword !== adminProfile.confirmPassword
                  }
                >
                  {saving.password ? <SpinnerIcon /> : <KeyIcon />}
                  {saving.password ? 'Updating…' : 'Update Password'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}