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
const COLORS = ['#D4A574','#1E3A5F','#6B7280','#10B981','#F59E0B','#EF4444']

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
        // Backend returns { data: { requests, stats } } so we need mData.data?.requests
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
    <Star key={i} className={`w-4 h-4 inline ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
  ))

  const getPriorityColor = (p) => ({ low: 'bg-blue-100 text-blue-700', medium: 'bg-yellow-100 text-yellow-700', high: 'bg-orange-100 text-orange-700', critical: 'bg-red-100 text-red-700' }[p] || 'bg-gray-100 text-gray-700')
  const getStatusColor = (s) => ({ open: 'bg-red-100 text-red-700', assigned: 'bg-blue-100 text-blue-700', 'in-progress': 'bg-yellow-100 text-yellow-700', resolved: 'bg-green-100 text-green-700', closed: 'bg-gray-100 text-gray-700' }[s] || 'bg-gray-100 text-gray-700')

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900">Analytics & Reports</h1>
          <p className="text-gray-500">Comprehensive hotel performance insights</p>
        </div>
        <div className="flex gap-2">
          <Select value={year.toString()} onChange={(e) => setYear(Number(e.target.value))} options={yearOptions} />
          <Button variant="outline" onClick={loadAnalytics}>Refresh</Button>
        </div>
      </div>

      {error && <Card><CardContent className="py-4 text-center text-red-600">{error}</CardContent></Card>}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Revenue {year}</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
              <p className="text-xs text-green-600">{totalBookings} bookings</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V7m0 9v1" /></svg>
            </div>
          </div>
        </CardContent></Card>

        <Card><CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg. Booking Value</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(avgBookingValue)}</p>
              <p className="text-xs text-gray-500">Avg stay: {avgStay} nights</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
            </div>
          </div>
        </CardContent></Card>

        <Card><CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Feedback Received</p>
              <p className="text-2xl font-bold text-gray-900">{feedbackList.length}</p>
              <p className="text-xs text-gray-500">{reportsList.length} maintenance reports</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </CardContent></Card>

        <Card><CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Guest Satisfaction</p>
              <p className="text-2xl font-bold text-gray-900">{feedbackStats?.avgRating ? feedbackStats.avgRating.toFixed(1) : 'N/A'}/5.0</p>
              <p className="text-xs text-gray-500">{feedbackStats?.totalReviews || feedbackList.length} reviews</p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <Star className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </CardContent></Card>
      </div>

      <Tabs defaultValue="feedback">
        <TabsList>
          <TabsTrigger value="feedback">Feedback & Reports</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="occupancy">Occupancy</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
        </TabsList>

        {/* ═══════ FEEDBACK & REPORTS TAB ═══════ */}
        <TabsContent value="feedback">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Guest Feedback */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" /> Guest Feedback
              </h3>
              {feedbackList.length === 0 ? (
                <Card><CardContent className="py-8 text-center text-gray-500">No feedback received yet</CardContent></Card>
              ) : (
                <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-2">
                  {feedbackList.map((fb, i) => (
                    <div key={fb._id || i} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{fb.guest?.firstName || 'Guest'} {fb.guest?.lastName || ''}</p>
                            <p className="text-xs text-gray-500">{fb.booking?.bookingNumber || ''} • {formatDate(fb.createdAt)}</p>
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${fb.status === 'approved' ? 'bg-green-100 text-green-700' : fb.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>{fb.status}</span>
                      </div>
                      <div className="mb-2">{renderStars(fb.ratings?.overall || 0)}</div>
                      <p className="text-sm text-gray-700 mb-2">{fb.comment}</p>
                      <div className="flex flex-wrap gap-3 text-xs text-gray-400">
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" /> Maintenance Reports
              </h3>
              {reportsList.length === 0 ? (
                <Card><CardContent className="py-8 text-center text-gray-500">No reports received yet</CardContent></Card>
              ) : (
                <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-2">
                  {reportsList.map((rpt, i) => (
                    <div key={rpt._id || i} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                            <AlertTriangle className="w-4 h-4 text-orange-600" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{rpt.title}</p>
                            <p className="text-xs text-gray-500">By: {rpt.reportedBy?.firstName || 'Guest'} {rpt.reportedBy?.lastName || ''} • {formatDate(rpt.createdAt)}</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${getPriorityColor(rpt.priority)}`}>{rpt.priority}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${getStatusColor(rpt.status)}`}>{rpt.status}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{rpt.description}</p>
                      <div className="flex flex-wrap gap-3 text-xs text-gray-400">
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
              <CardHeader><CardTitle className="text-gray-900">Monthly Revenue — {year}</CardTitle></CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData}>
                      <defs><linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#D4A574" stopOpacity={0.3} /><stop offset="95%" stopColor="#D4A574" stopOpacity={0} /></linearGradient></defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
                      <YAxis stroke="#6B7280" fontSize={12} tickFormatter={(v) => `${v/1000}k`} />
                      <Tooltip contentStyle={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px', color: '#111' }} formatter={(value) => [formatCurrency(value), 'Revenue']} />
                      <Area type="monotone" dataKey="revenue" stroke="#D4A574" strokeWidth={2} fill="url(#colorRev)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-gray-900">Revenue by Category</CardTitle></CardHeader>
              <CardContent>
                <div className="h-80">
                  {byCategory.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={byCategory} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                          {byCategory.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full"><p className="text-gray-500 text-sm">No data</p></div>
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
              <CardHeader><CardTitle className="text-gray-900">Daily Bookings Trend</CardTitle></CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={occupancyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="date" stroke="#6B7280" fontSize={10} tickFormatter={v => v?.slice(5) || ''} />
                      <YAxis stroke="#6B7280" fontSize={12} />
                      <Tooltip contentStyle={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px', color: '#111' }} />
                      <Line type="monotone" dataKey="bookings" stroke="#1E3A5F" strokeWidth={3} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-gray-900">Room Status</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4 pt-4">
                  {[
                    { label: 'Available', count: rooms.filter(r => r.status === 'available').length, color: 'bg-green-500' },
                    { label: 'Occupied', count: rooms.filter(r => r.status === 'occupied').length, color: 'bg-blue-500' },
                    { label: 'Maintenance', count: rooms.filter(r => r.status === 'maintenance').length, color: 'bg-amber-500' },
                    { label: 'Reserved', count: rooms.filter(r => r.status === 'reserved').length, color: 'bg-purple-500' }
                  ].map((st) => (
                    <div key={st.label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-700">{st.label}</span>
                        <span className="font-medium text-gray-900">{st.count}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className={`h-2 rounded-full ${st.color}`} style={{ width: `${rooms.length > 0 ? (st.count / rooms.length) * 100 : 0}%` }} />
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
              <CardHeader><CardTitle className="text-gray-900">Monthly Booking Count</CardTitle></CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
                      <YAxis stroke="#6B7280" fontSize={12} />
                      <Tooltip contentStyle={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px', color: '#111' }} />
                      <Bar dataKey="bookings" fill="#1E3A5F" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-gray-900">Booking Sources</CardTitle></CardHeader>
              <CardContent>
                <div className="h-80">
                  {sourcesData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={sourcesData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value">
                          {sourcesData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                        </Pie>
                        <Tooltip formatter={(value) => `${value} bookings`} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full"><p className="text-gray-500 text-sm">No data</p></div>
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