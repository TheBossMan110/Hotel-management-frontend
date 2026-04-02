import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Select from '../../components/ui/Select'
import { useServiceStore } from '../../stores/serviceStore'
import { formatDate } from '../../lib/utils'
import { 
  Bell, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react'

const STATUS_VARIANTS = {
  pending: 'warning',
  acknowledged: 'default',
  'in-progress': 'default',
  completed: 'success',
  cancelled: 'destructive'
}

const typeLabels = {
  'room-service': '🍽️ Room Service',
  'wake-up-call': '⏰ Wake-up Call',
  transportation: '🚗 Transportation',
  housekeeping: '🧹 Housekeeping',
  laundry: '👔 Laundry',
  'guest-request': '🛎️ Special Request'
}

const priorityColors = {
  low: 'text-gray-500',
  normal: 'text-blue-500',
  urgent: 'text-red-500'
}

export default function AdminServiceRequests() {
  const { allRequests, fetchAllRequests, updateStatus, isLoading } = useServiceStore()
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchAllRequests()
  }, [])

  const handleStatusChange = async (requestId, newStatus) => {
    const result = await updateStatus(requestId, newStatus)
    if (result.success) {
      fetchAllRequests()
    }
  }

  const filteredRequests = allRequests.filter(req => {
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter
    const matchesType = typeFilter === 'all' || req.type === typeFilter
    const guestName = `${req.guest?.firstName || ''} ${req.guest?.lastName || ''}`.toLowerCase()
    const roomNum = req.room?.roomNumber || ''
    const matchesSearch = !searchTerm || 
      guestName.includes(searchTerm.toLowerCase()) ||
      roomNum.toString().includes(searchTerm) ||
      (req.description || '').toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesType && matchesSearch
  })

  const stats = {
    total: allRequests.length,
    pending: allRequests.filter(r => r.status === 'pending').length,
    inProgress: allRequests.filter(r => r.status === 'in-progress' || r.status === 'acknowledged').length,
    completed: allRequests.filter(r => r.status === 'completed').length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Service Requests</h1>
          <p className="text-muted-foreground">Manage guest service requests and track their status</p>
        </div>
        <Button onClick={() => fetchAllRequests()} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Requests</p>
                <p className="text-xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 rounded-lg">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-xl font-bold text-amber-600">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-xl font-bold text-blue-600">{stats.inProgress}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-xl font-bold text-green-600">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by guest name, room number, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-40"
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'pending', label: 'Pending' },
                { value: 'acknowledged', label: 'Acknowledged' },
                { value: 'in-progress', label: 'In Progress' },
                { value: 'completed', label: 'Completed' }
              ]}
            />
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-44"
              options={[
                { value: 'all', label: 'All Types' },
                { value: 'room-service', label: 'Room Service' },
                { value: 'housekeeping', label: 'Housekeeping' },
                { value: 'transportation', label: 'Transportation' },
                { value: 'laundry', label: 'Laundry' },
                { value: 'guest-request', label: 'Special Request' }
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      <Card>
        <CardHeader>
          <CardTitle>All Requests ({filteredRequests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && allRequests.length === 0 ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No service requests found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRequests.map((request) => (
                <div key={request._id} className="flex items-start gap-4 p-4 border border-border rounded-xl hover:bg-muted/30 transition-colors">
                  {/* Type Icon + Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base">{typeLabels[request.type]?.split(' ')[0] || '🔔'}</span>
                      <p className="font-medium text-sm">{typeLabels[request.type]?.split(' ').slice(1).join(' ') || request.type}</p>
                      <Badge variant={STATUS_VARIANTS[request.status] || 'outline'} className="ml-auto">
                        {request.status?.replace('-', ' ')}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {request.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span>👤 {request.guest?.firstName || ''} {request.guest?.lastName || ''}</span>
                      {request.room?.roomNumber && <span>🚪 Room {request.room.roomNumber}</span>}
                      <span>🕐 {new Date(request.createdAt).toLocaleString()}</span>
                      {request.priority && (
                        <span className={`font-medium ${priorityColors[request.priority] || ''}`}>
                          ● {request.priority}
                        </span>
                      )}
                      {request.handledBy && (
                        <span>✅ {request.handledBy?.firstName || ''} {request.handledBy?.lastName || ''}</span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-1 flex-shrink-0">
                    {request.status === 'pending' && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => handleStatusChange(request._id, 'acknowledged')}>
                          Acknowledge
                        </Button>
                        <Button size="sm" onClick={() => handleStatusChange(request._id, 'in-progress')}>
                          Start
                        </Button>
                      </>
                    )}
                    {(request.status === 'acknowledged' || request.status === 'in-progress') && (
                      <Button size="sm" onClick={() => handleStatusChange(request._id, 'completed')}>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Complete
                      </Button>
                    )}
                    {request.status === 'completed' && (
                      <span className="text-xs text-green-600 font-medium text-center">Done ✓</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
