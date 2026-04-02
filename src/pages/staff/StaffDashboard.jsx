import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { useStaffStore } from '../../stores/staffStore'
import { useRoomsStore } from '../../stores/roomsStore'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'

export default function StaffDashboard() {
  const { user } = useAuthStore()
  const { myTasks, fetchMyTasks, updateTaskStatus, isLoading } = useStaffStore()
  const { rooms, fetchRooms } = useRoomsStore()

  useEffect(() => {
    fetchMyTasks()
    fetchRooms()
  }, [])

  const pendingTasks    = myTasks.filter(t => t.status === 'pending')
  const inProgressTasks = myTasks.filter(t => t.status === 'in-progress')
  const completedToday  = myTasks.filter(t => {
    const today = new Date().toDateString()
    return t.status === 'completed' && new Date(t.completedAt).toDateString() === today
  })

  const roomsNeedingService = rooms.filter(r =>
    r.status === 'maintenance' || r.cleaningStatus === 'dirty' || r.cleaningStatus === 'in-progress'
  )

  const getTaskId = (t) => t._id || t.id

  const handleStartTask    = (id) => updateTaskStatus(id, 'in-progress')
  const handleCompleteTask = (id) => updateTaskStatus(id, 'completed')

  const getPriorityBadge = (priority) => {
    const v = { high: 'destructive', medium: 'warning', low: 'secondary' }
    return <Badge variant={v[priority] || 'outline'}>{priority}</Badge>
  }

  const getTypePill = (type) => {
    const c = {
      housekeeping:  'bg-blue-100 text-blue-700',
      maintenance:   'bg-amber-100 text-amber-700',
      'room-service':'bg-green-100 text-green-700',
      'guest-request':'bg-purple-100 text-purple-700',
      laundry:       'bg-pink-100 text-pink-700'
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${c[type] || 'bg-gray-100 text-gray-700'}`}>
        {(type || '').replace(/-/g, ' ')}
      </span>
    )
  }

  const greeting = new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl p-6">
        <h1 className="text-2xl font-serif font-bold text-foreground">
          Good {greeting}, {user?.firstName || 'Staff'}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isLoading
            ? 'Loading your tasks…'
            : `${pendingTasks.length} pending · ${inProgressTasks.length} in progress`}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Pending',         value: pendingTasks.length,        color: 'text-amber-600' },
          { label: 'In Progress',     value: inProgressTasks.length,     color: 'text-blue-600' },
          { label: 'Completed Today', value: completedToday.length,      color: 'text-green-600' },
          { label: 'Rooms Need Attn', value: roomsNeedingService.length, color: 'text-red-600' }
        ].map(({ label, value, color }) => (
          <Card key={label}>
            <CardContent className="p-4 text-center">
              <p className={`text-3xl font-bold ${color}`}>{value}</p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: 'My Tasks',     to: '/staff/tasks',        icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
          { label: 'Housekeeping', to: '/staff/housekeeping', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
          { label: 'Maintenance',  to: '/staff/maintenance',  icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z' }
        ].map((action) => (
          <Link key={action.label} to={action.to}>
            <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={action.icon} />
                  </svg>
                </div>
                <span className="font-medium text-sm">{action.label}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Priority Tasks */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Priority Tasks</CardTitle>
            <Link to="/staff/tasks"><Button variant="ghost" size="sm">View All</Button></Link>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : pendingTasks.length === 0 && inProgressTasks.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium mb-2">All Caught Up!</h3>
              <p className="text-muted-foreground">No pending tasks at the moment</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {[...inProgressTasks, ...pendingTasks].slice(0, 6).map((task) => {
                const tid = getTaskId(task)
                const roomNum = task.room?.roomNumber || task.roomNumber || '—'
                return (
                  <div key={tid} className="flex items-center justify-between p-4 bg-accent/30 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${task.status === 'in-progress' ? 'bg-blue-100' : 'bg-amber-100'}`}>
                        <svg className={`w-5 h-5 ${task.status === 'in-progress' ? 'text-blue-600' : 'text-amber-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{task.title}</p>
                          {getPriorityBadge(task.priority)}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {roomNum !== '—' && <span>Room {roomNum}</span>}
                          {roomNum !== '—' && <span>•</span>}
                          {getTypePill(task.type)}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {task.status === 'pending' && (
                        <Button size="sm" variant="outline" onClick={() => handleStartTask(tid)}>Start</Button>
                      )}
                      {task.status === 'in-progress' && (
                        <Button size="sm" onClick={() => handleCompleteTask(tid)}>Complete</Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rooms Needing Service */}
      <Card>
        <CardHeader><CardTitle>Rooms Requiring Attention</CardTitle></CardHeader>
        <CardContent>
          {roomsNeedingService.length === 0 ? (
            <p className="text-center py-4 text-muted-foreground">All rooms are in good condition</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {roomsNeedingService.slice(0, 12).map((room) => (
                <div key={room._id || room.id} className="p-3 border border-border rounded-lg text-center">
                  <p className="font-bold text-lg">{room.roomNumber}</p>
                  <p className="text-xs text-muted-foreground capitalize">{room.type}</p>
                  <Badge
                    variant={room.status === 'maintenance' ? 'warning' : 'secondary'}
                    className="mt-2"
                  >
                    {room.status === 'maintenance' ? 'Maintenance' : `Cleaning: ${room.cleaningStatus}`}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
