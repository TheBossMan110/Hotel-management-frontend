import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { analyticsAPI } from '../../lib/api'
import { useBookingsStore } from '../../stores/bookingsStore'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { formatCurrency, formatDate } from '../../lib/utils'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts'

const ROOM_COLORS = ['#D4A574', '#1E3A5F', '#6B7280', '#10B981', '#F59E0B']

export default function AdminDashboard() {
  const { fetchBookings, bookings } = useBookingsStore()

  const [overview, setOverview] = useState(null)
  const [revenueData, setRevenueData] = useState([])
  const [occupancyData, setOccupancyData] = useState([])
  const [roomTypeData, setRoomTypeData] = useState([])
  const [loadingAnalytics, setLoadingAnalytics] = useState(true)
  const [error, setError] = useState(null)
  const isLoaded = useRef(false)

  useEffect(() => {
    if (!isLoaded.current) {
      loadData()
      isLoaded.current = true
    }
  }, [])

  const loadData = async () => {
    setLoadingAnalytics(true)
    setError(null)
    try {
      const [dashRes, revRes, occRes] = await Promise.all([
        analyticsAPI.getDashboard(),
        analyticsAPI.getRevenue({ period: 'monthly', year: new Date().getFullYear() }),
        analyticsAPI.getOccupancy({ days: 30 })
      ])

      setOverview(dashRes.data.overview)

      // Build monthly revenue chart data
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
      const revMap = {}
      revRes.data.revenue?.forEach(r => { revMap[r._id] = r.revenue })
      setRevenueData(months.map((name, i) => ({ name, revenue: revMap[i + 1] || 0 })))

      // Occupancy trend (last 30 days grouped weekly)
      const daily = occRes.data.dailyOccupancy || []
      setOccupancyData(daily.slice(-8).map(d => ({
        name: d._id,
        bookings: d.bookings
      })))

      // Room-type booking distribution
      const byType = occRes.data.byType || occRes.data.byRoomType || []
      setRoomTypeData(byType.map((r, i) => ({
        name: r._id,
        value: r.count || r.bookings || 0,
        color: ROOM_COLORS[i % ROOM_COLORS.length]
      })))

      // Also fetch recent bookings for the table - ensure store is populated
      await fetchBookings({ page: 1, limit: 5, sort: '-createdAt' })
    } catch (err) {
      console.error('Dashboard load error:', err)
      setError(err.response?.data?.message || 'Failed to load analytics')
    } finally {
      setLoadingAnalytics(false)
    }
  }

  const recentBookings = (bookings || []).slice(0, 5)

  const statCards = overview
    ? [
        {
          title: 'Monthly Revenue',
          value: formatCurrency(overview.monthlyRevenue || 0),
          change: `${overview.totalBookings} total bookings`,
          changeType: 'positive',
          icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
          bgColor: 'bg-green-100', iconColor: 'text-green-600'
        },
        {
          title: 'Occupancy Rate',
          value: `${overview.occupancyRate}%`,
          change: `${overview.occupiedRooms}/${overview.totalRooms} rooms occupied`,
          changeType: overview.occupancyRate >= 70 ? 'positive' : 'neutral',
          icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
          bgColor: 'bg-blue-100', iconColor: 'text-blue-600'
        },
        {
          title: "Today's Check-ins",
          value: overview.checkInsToday,
          change: `${overview.checkOutsToday} check-outs today`,
          changeType: 'neutral',
          icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
          bgColor: 'bg-amber-100', iconColor: 'text-amber-600'
        },
        {
          title: 'Pending Tasks',
          value: overview.pendingTasks,
          change: overview.pendingTasks > 5 ? 'Needs attention' : 'On track',
          changeType: overview.pendingTasks > 5 ? 'negative' : 'positive',
          icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
          bgColor: 'bg-purple-100', iconColor: 'text-purple-600'
        }
      ]
    : []

  if (loadingAnalytics && !overview) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-serif font-bold">Dashboard</h1>
          <Button onClick={loadData}>Retry</Button>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-destructive mb-2 font-medium">Failed to load analytics</p>
            <p className="text-muted-foreground text-sm">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData}>Refresh</Button>
          <Link to="/admin/bookings">
            <Button>New Booking</Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  <p className={`text-xs mt-1 ${
                    stat.changeType === 'positive' ? 'text-green-600' :
                    stat.changeType === 'negative' ? 'text-red-600' :
                    'text-muted-foreground'
                  }`}>
                    {stat.change}
                  </p>
                </div>
                <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                  <svg className={`w-6 h-6 ${stat.iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={stat.icon} />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Revenue — {new Date().getFullYear()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D4A574" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#D4A574" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
                  <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={(v) => `$${v/1000}k`} />
                  <Tooltip
                    contentStyle={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                    formatter={(value) => [formatCurrency(value), 'Revenue']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#D4A574" strokeWidth={2} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Room Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Bookings by Room Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              {roomTypeData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={roomTypeData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                      {roomTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                      formatter={(value, name, props) => [`${value} bookings`, props.payload.name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-sm">No data available</p>
              )}
            </div>
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              {roomTypeData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs capitalize">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Bookings</CardTitle>
              <Link to="/admin/bookings">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {recentBookings.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No bookings yet</p>
              )}
              {recentBookings.map((booking) => (
                <div key={booking._id || booking.id} className="flex items-center justify-between p-3 bg-accent/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {booking.guest?.firstName?.charAt(0) || 'G'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">
                        {booking.guest?.firstName} {booking.guest?.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {booking.room?.type || booking.room?.name || 'Room'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={
                      booking.status === 'confirmed' ? 'default' :
                      booking.status === 'checked-in' ? 'success' :
                      booking.status === 'checked-out' ? 'secondary' : 'destructive'
                    }>
                      {booking.status}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-1">{formatDate(booking.checkIn)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Daily Bookings Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Bookings — Last 30 Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={occupancyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" stroke="#9CA3AF" fontSize={10} tickFormatter={v => v.slice(5)} />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip
                    contentStyle={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                    formatter={(value) => [value, 'Bookings']}
                  />
                  <Bar dataKey="bookings" fill="#1E3A5F" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Manage Rooms', to: '/admin/rooms', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
              { label: 'View Bookings', to: '/admin/bookings', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
              { label: 'Manage Staff', to: '/admin/staff', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
              { label: 'View Reports', to: '/admin/reports', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' }
            ].map((action) => (
              <Link key={action.label} to={action.to}>
                <div className="flex flex-col items-center justify-center p-4 bg-accent/30 rounded-lg hover:bg-accent/50 transition-colors">
                  <svg className="w-8 h-8 text-primary mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={action.icon} />
                  </svg>
                  <span className="text-sm font-medium">{action.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}