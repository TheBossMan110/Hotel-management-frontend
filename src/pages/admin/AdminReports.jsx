import { useState, useEffect } from 'react'
import { useRoomsStore } from '../../stores/roomsStore'
import { analyticsAPI, feedbackAPI, maintenanceAPI } from '../../lib/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Select from '../../components/ui/Select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs'
import { formatCurrency, formatDate } from '../../lib/utils'
import { Star, AlertTriangle, MessageSquare, User } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, Legend
} from 'recharts'

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const COLORS = ['#C9A84C','#E8C97A','#A67C32','#10B981','#F59E0B','#EF4444']

export default function AdminReports() {
  const { rooms } = useRoomsStore()
  const [year, setYear] = useState(new Date().getFullYear())

  const [revenueData, setRevenueData] = useState([])
  const [byCategory, setByCategory] = useState([])
  const [occupancyData, setOccupancyData] = useState([])
  const [sourcesData, setSourcesData] = useState([])
  const [feedbackStats, setFeedbackStats] = useState(null)
  const [avgStay, setAvgStay] = useState(0)

  const [feedbackList, setFeedbackList] = useState([])
  const [reportsList, setReportsList] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => { loadAnalytics() }, [year])

  const loadAnalytics = async () => {
    setLoading(true)
    setError(null)
    try {
      const results = await Promise.allSettled([
        analyticsAPI.getRevenue({ period: 'monthly', year }),
        analyticsAPI.getOccupancy({ days: 365 }),
        analyticsAPI.getBookingSources(),
        feedbackAPI.getAll({ limit: 50 }),
        maintenanceAPI.getAll({ limit: 50 }),
        useRoomsStore.getState().fetchRooms()
      ])

      const [revRes, occRes, srcRes, fbRes, maintRes] = results

      if (revRes.status === 'fulfilled') {
        const revMap = {}
        ;(revRes.value.data.revenue || []).forEach(r => { revMap[r._id] = r })
        setRevenueData(MONTH_NAMES.map((name, i) => ({
          month: name, revenue: revMap[i + 1]?.revenue || 0, bookings: revMap[i + 1]?.count || 0
        })))
        setByCategory((revRes.value.data.byCategory || []).map((c, i) => ({
          name: c._id || 'Other', value: c.total, color: COLORS[i % COLORS.length]
        })))
      }

      if (occRes.status === 'fulfilled') {
        const daily = occRes.value.data.dailyOccupancy || []
        setOccupancyData(daily.slice(-30).map(d => ({ date: d._id, bookings: d.bookings })))
        setAvgStay(occRes.value.data.avgStayDuration || 0)
      }

      if (srcRes.status === 'fulfilled') {
        setSourcesData((srcRes.value.data.sources || []).map((s, i) => ({
          name: s._id || 'Unknown', value: s.count, revenue: s.revenue, color: COLORS[i % COLORS.length]
        })))
      }

      if (fbRes.status === 'fulfilled') {
        const fbData = fbRes.value.data
        setFeedbackList(fbData.feedback || fbData.data || [])
        if (fbData.stats) setFeedbackStats(fbData.stats)
      }

      if (maintRes.status === 'fulfilled') {
        const mData = maintRes.value.data
        setReportsList(mData.data?.requests || mData.requests || mData.data || [])
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  const totalRevenue = revenueData.reduce((s, r) => s + r.revenue, 0)
  const totalBookings = revenueData.reduce((s, r) => s + r.bookings, 0)
  const avgBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0

  const yearOptions = [2022, 2023, 2024, 2025, 2026].map(y => ({ value: y.toString(), label: y.toString() }))

  const renderStars = (rating) => Array.from({ length: 5 }, (_, i) => (
    <Star key={i} className={`w-4 h-4 inline ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}`} />
  ))

  const getPriorityColor = (p) => ({
    low: { background: 'rgba(201,168,76,0.12)', color: '#C9A84C' },
    medium: { background: 'rgba(251,191,36,0.12)', color: '#fbbf24' },
    high: { background: 'rgba(251,146,60,0.12)', color: '#fb923c' },
    critical: { background: 'rgba(239,68,68,0.12)', color: '#f87171' }
  }[p] || { background: 'rgba(255,255,255,0.06)', color: 'rgba(248,244,239,0.5)' })

  const getStatusColor = (s) => ({
    open: { background: 'rgba(239,68,68,0.12)', color: '#f87171' },
    assigned: { background: 'rgba(201,168,76,0.12)', color: '#C9A84C' },
    'in-progress': { background: 'rgba(251,191,36,0.12)', color: '#fbbf24' },
    resolved: { background: 'rgba(34,197,94,0.12)', color: '#4ade80' },
    closed: { background: 'rgba(255,255,255,0.06)', color: 'rgba(248,244,239,0.4)' }
  }[s] || { background: 'rgba(255,255,255,0.06)', color: 'rgba(248,244,239,0.4)' })

  const chartTooltipStyle = { background: '#111111', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '8px', color: '#F8F4EF' }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#C9A84C', borderTopColor: 'transparent' }} />
    </div>
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-light" style={{ color: '#F8F4EF' }}>Analytics &amp; Reports</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(248,244,239,0.45)', fontFamily: 'DM Sans, sans-serif' }}>Comprehensive hotel performance insights</p>
        </div>
        <div className="flex gap-2">
          <Select value={year.toString()} onChange={(e) => setYear(Number(e.target.value))} options={yearOptions} />
          <Button variant="secondary" onClick={loadAnalytics}>Refresh</Button>
        </div>
      </div>

      {error && <Card><CardContent className="py-4 text-center" style={{ color: '#f87171' }}>{error}</CardContent></Card>}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: 'rgba(248,244,239,0.45)' }}>Total Revenue {year}</p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#F8F4EF' }}>{formatCurrency(totalRevenue)}</p>
              <p className="text-xs mt-1" style={{ color: '#4ade80' }}>{totalBookings} bookings</p>
            </div>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.12)' }}>
              <svg className="w-6 h-6" style={{ color: '#4ade80' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V7m0 9v1" /></svg>
            </div>
          </div>
        </CardContent></Card>

        <Card><CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: 'rgba(248,244,239,0.45)' }}>Avg. Booking Value</p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#F8F4EF' }}>{formatCurrency(avgBookingValue)}</p>
              <p className="text-xs mt-1" style={{ color: 'rgba(248,244,239,0.4)' }}>Avg stay: {avgStay} nights</p>
            </div>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(201,168,76,0.12)' }}>
              <svg className="w-6 h-6" style={{ color: '#C9A84C' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
            </div>
          </div>
        </CardContent></Card>

        <Card><CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: 'rgba(248,244,239,0.45)' }}>Feedback Received</p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#F8F4EF' }}>{feedbackList.length}</p>
              <p className="text-xs mt-1" style={{ color: 'rgba(248,244,239,0.4)' }}>{reportsList.length} maintenance reports</p>
            </div>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.12)' }}>
              <MessageSquare className="w-6 h-6" style={{ color: '#a78bfa' }} />
            </div>
          </div>
        </CardContent></Card>

        <Card><CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: 'rgba(248,244,239,0.45)' }}>Guest Satisfaction</p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#F8F4EF' }}>{feedbackStats?.avgRating ? feedbackStats.avgRating.toFixed(1) : 'N/A'}/5.0</p>
              <p className="text-xs mt-1" style={{ color: 'rgba(248,244,239,0.4)' }}>{feedbackStats?.totalReviews || feedbackList.length} reviews</p>
            </div>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(201,168,76,0.12)' }}>
              <Star className="w-6 h-6" style={{ color: '#C9A84C' }} />
            </div>
          </div>
        </CardContent></Card>
      </div>

      <Tabs defaultValue="feedback">
        <TabsList>
          <TabsTrigger value="feedback">Feedback &amp; Reports</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="occupancy">Occupancy</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
        </TabsList>

        {/* FEEDBACK & REPORTS TAB */}
        <TabsContent value="feedback">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Guest Feedback */}
            <div>
              <h3 className="text-base font-medium mb-4 flex items-center gap-2" style={{ color: '#F8F4EF' }}>
                <MessageSquare className="w-5 h-5" style={{ color: '#C9A84C' }} /> Guest Feedback
              </h3>
              {feedbackList.length === 0 ? (
                <Card><CardContent className="py-8 text-center" style={{ color: 'rgba(248,244,239,0.4)' }}>No feedback received yet</CardContent></Card>
              ) : (
                <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-2">
                  {feedbackList.map((fb, i) => (
                    <div key={fb._id || i} className="p-4 rounded-xl hover:border-amber-500/30 transition-all"
                      style={{ background: '#1A1A1A', border: '1px solid rgba(201,168,76,0.12)' }}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(201,168,76,0.12)' }}>
                            <User className="w-4 h-4" style={{ color: '#C9A84C' }} />
                          </div>
                          <div>
                            <p className="text-sm font-medium" style={{ color: '#F8F4EF' }}>{fb.guest?.firstName || 'Guest'} {fb.guest?.lastName || ''}</p>
                            <p className="text-xs" style={{ color: 'rgba(248,244,239,0.35)' }}>{fb.booking?.bookingNumber || ''} • {formatDate(fb.createdAt)}</p>
                          </div>
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded-full capitalize"
                          style={fb.status === 'approved' ? { background: 'rgba(34,197,94,0.12)', color: '#4ade80' } : fb.status === 'pending' ? { background: 'rgba(251,191,36,0.12)', color: '#fbbf24' } : { background: 'rgba(255,255,255,0.06)', color: 'rgba(248,244,239,0.4)' }}>
                          {fb.status}
                        </span>
                      </div>
                      <div className="mb-2">{renderStars(fb.ratings?.overall || 0)}</div>
                      <p className="text-sm mb-2" style={{ color: 'rgba(248,244,239,0.75)' }}>{fb.comment}</p>
                      <div className="flex flex-wrap gap-3 text-xs" style={{ color: 'rgba(248,244,239,0.35)' }}>
                        {fb.ratings?.cleanliness > 0 && <span>Cleanliness: {fb.ratings.cleanliness}/5</span>}
                        {fb.ratings?.staff > 0 && <span>Staff: {fb.ratings.staff}/5</span>}
                        {fb.ratings?.comfort > 0 && <span>Comfort: {fb.ratings.comfort}/5</span>}
                        {fb.ratings?.valueForMoney > 0 && <span>Value: {fb.ratings.valueForMoney}/5</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Maintenance Reports */}
            <div>
              <h3 className="text-base font-medium mb-4 flex items-center gap-2" style={{ color: '#F8F4EF' }}>
                <AlertTriangle className="w-5 h-5" style={{ color: '#fb923c' }} /> Maintenance Reports
              </h3>
              {reportsList.length === 0 ? (
                <Card><CardContent className="py-8 text-center" style={{ color: 'rgba(248,244,239,0.4)' }}>No reports received yet</CardContent></Card>
              ) : (
                <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-2">
                  {reportsList.map((rpt, i) => (
                    <div key={rpt._id || i} className="p-4 rounded-xl transition-all"
                      style={{ background: '#1A1A1A', border: '1px solid rgba(201,168,76,0.12)' }}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(251,146,60,0.12)' }}>
                            <AlertTriangle className="w-4 h-4" style={{ color: '#fb923c' }} />
                          </div>
                          <div>
                            <p className="text-sm font-medium" style={{ color: '#F8F4EF' }}>{rpt.title}</p>
                            <p className="text-xs" style={{ color: 'rgba(248,244,239,0.35)' }}>By: {rpt.reportedBy?.firstName || 'Guest'} {rpt.reportedBy?.lastName || ''} • {formatDate(rpt.createdAt)}</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <span className="text-xs px-2 py-0.5 rounded-full capitalize" style={getPriorityColor(rpt.priority)}>{rpt.priority}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full capitalize" style={getStatusColor(rpt.status)}>{rpt.status}</span>
                        </div>
                      </div>
                      <p className="text-sm mb-2" style={{ color: 'rgba(248,244,239,0.7)' }}>{rpt.description}</p>
                      <div className="flex flex-wrap gap-3 text-xs" style={{ color: 'rgba(248,244,239,0.35)' }}>
                        <span>🏷️ {rpt.category}</span>
                        <span>🏨 Room: {rpt.room?.roomNumber || 'N/A'}</span>
                        {rpt.assignedTo && <span>👷 {rpt.assignedTo.firstName || 'Staff'}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader><CardTitle>Monthly Revenue — {year}</CardTitle></CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData}>
                      <defs><linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#C9A84C" stopOpacity={0.3} /><stop offset="95%" stopColor="#C9A84C" stopOpacity={0} /></linearGradient></defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="month" stroke="rgba(248,244,239,0.3)" fontSize={12} />
                      <YAxis stroke="rgba(248,244,239,0.3)" fontSize={12} tickFormatter={(v) => `Rs ${v/1000}k`} />
                      <Tooltip contentStyle={chartTooltipStyle} formatter={(value) => [formatCurrency(value), 'Revenue']} />
                      <Area type="monotone" dataKey="revenue" stroke="#C9A84C" strokeWidth={2} fill="url(#colorRev)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Revenue by Category</CardTitle></CardHeader>
              <CardContent>
                <div className="h-80">
                  {byCategory.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={byCategory} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                          {byCategory.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                        </Pie>
                        <Tooltip contentStyle={chartTooltipStyle} formatter={(value) => formatCurrency(value)} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full"><p style={{ color: 'rgba(248,244,239,0.4)' }} className="text-sm">No data</p></div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Occupancy Tab */}
        <TabsContent value="occupancy">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle>Daily Bookings Trend</CardTitle></CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={occupancyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="date" stroke="rgba(248,244,239,0.3)" fontSize={10} tickFormatter={v => v?.slice(5) || ''} />
                      <YAxis stroke="rgba(248,244,239,0.3)" fontSize={12} />
                      <Tooltip contentStyle={chartTooltipStyle} />
                      <Line type="monotone" dataKey="bookings" stroke="#C9A84C" strokeWidth={3} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Room Status</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4 pt-4">
                  {[
                    { label: 'Available', count: rooms.filter(r => r.status === 'available').length, color: '#4ade80', bg: 'rgba(34,197,94,0.4)' },
                    { label: 'Occupied', count: rooms.filter(r => r.status === 'occupied').length, color: '#C9A84C', bg: 'rgba(201,168,76,0.4)' },
                    { label: 'Maintenance', count: rooms.filter(r => r.status === 'maintenance').length, color: '#fbbf24', bg: 'rgba(251,191,36,0.4)' },
                    { label: 'Reserved', count: rooms.filter(r => r.status === 'reserved').length, color: '#a78bfa', bg: 'rgba(139,92,246,0.4)' }
                  ].map((st) => (
                    <div key={st.label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm" style={{ color: 'rgba(248,244,239,0.7)' }}>{st.label}</span>
                        <span className="font-medium" style={{ color: '#F8F4EF' }}>{st.count}</span>
                      </div>
                      <div className="w-full rounded-full h-2" style={{ background: 'rgba(255,255,255,0.08)' }}>
                        <div className="h-2 rounded-full transition-all" style={{ width: `${rooms.length > 0 ? (st.count / rooms.length) * 100 : 0}%`, background: st.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Bookings Tab */}
        <TabsContent value="bookings">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle>Monthly Booking Count</CardTitle></CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="month" stroke="rgba(248,244,239,0.3)" fontSize={12} />
                      <YAxis stroke="rgba(248,244,239,0.3)" fontSize={12} />
                      <Tooltip contentStyle={chartTooltipStyle} />
                      <Bar dataKey="bookings" fill="#C9A84C" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Booking Sources</CardTitle></CardHeader>
              <CardContent>
                <div className="h-80">
                  {sourcesData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={sourcesData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value">
                          {sourcesData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                        </Pie>
                        <Tooltip contentStyle={chartTooltipStyle} formatter={(value) => `${value} bookings`} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full"><p style={{ color: 'rgba(248,244,239,0.4)' }} className="text-sm">No data</p></div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}