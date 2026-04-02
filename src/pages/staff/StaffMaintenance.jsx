import { useState, useEffect } from 'react'
import { useStaffStore } from '../../stores/staffStore'
import { useRoomsStore } from '../../stores/roomsStore'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Modal from '../../components/ui/Modal'
import { formatDate } from '../../lib/utils'

const CATEGORIES = [
  { value: 'general',    label: 'General' },
  { value: 'plumbing',   label: 'Plumbing' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'hvac',       label: 'HVAC' },
  { value: 'furniture',  label: 'Furniture' },
  { value: 'appliance',  label: 'Appliance' },
  { value: 'safety',     label: 'Safety' }
]

const STATUS_VARIANTS = {
  pending:      'warning',
  'in-progress':'default',
  completed:    'success',
  cancelled:    'destructive'
}

export default function StaffMaintenance() {
  const { tasks, fetchTasks, createTask, updateTaskStatus, isLoading } = useStaffStore()
  const { rooms, fetchRooms, updateRoomStatus } = useRoomsStore()

  const [showNewForm,      setShowNewForm]      = useState(false)
  const [selectedRequest,  setSelectedRequest]  = useState(null)
  const [savingNew,        setSavingNew]        = useState(false)
  const [error,            setError]            = useState(null)

  const [newRequest, setNewRequest] = useState({
    roomId:      '',
    title:       '',
    description: '',
    priority:    'medium',
    category:    'general'
  })

  useEffect(() => {
    fetchTasks({ type: 'maintenance' })
    fetchRooms()
  }, [])

  const maintenanceTasks = tasks.filter(t => t.type === 'maintenance')
  const pendingTasks     = maintenanceTasks.filter(t => t.status === 'pending')
  const inProgressTasks  = maintenanceTasks.filter(t => t.status === 'in-progress')
  const completedTasks   = maintenanceTasks.filter(t => t.status === 'completed')

  const getTaskId = (t) => t._id || t.id

  const handleCreateRequest = async () => {
    if (!newRequest.title || !newRequest.roomId) {
      setError('Please fill in the title and select a room.')
      return
    }
    setSavingNew(true)
    setError(null)
    const result = await createTask({
      title:       newRequest.title,
      description: `Category: ${newRequest.category}\n${newRequest.description}`,
      type:        'maintenance',
      priority:    newRequest.priority,
      roomId:      newRequest.roomId
    })

    if (result.success) {
      // Mark room as under maintenance
      const room = rooms.find(r => (r._id || r.id) === newRequest.roomId)
      if (room) await updateRoomStatus(newRequest.roomId, 'maintenance', room.cleaningStatus)

      setShowNewForm(false)
      setNewRequest({ roomId: '', title: '', description: '', priority: 'medium', category: 'general' })
      fetchTasks({ type: 'maintenance' })
    } else {
      setError(result.error || 'Failed to create request.')
    }
    setSavingNew(false)
  }

  const handleStatusChange = async (taskId, newStatus) => {
    await updateTaskStatus(taskId, newStatus)
    if (newStatus === 'completed') {
      const task = tasks.find(t => getTaskId(t) === taskId)
      if (task?.room) {
        await updateRoomStatus(task.room._id || task.room, 'available', 'dirty')
      }
    }
    fetchTasks({ type: 'maintenance' })
  }

  const getPriorityBadge = (p) => {
    const v = { high: 'destructive', medium: 'warning', low: 'secondary' }
    return <Badge variant={v[p] || 'outline'}>{p}</Badge>
  }

  const TaskCard = ({ task, showActions = true }) => {
    const tid     = getTaskId(task)
    const roomNum = task.room?.roomNumber || task.roomNumber || '—'
    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-accent/30 rounded-lg gap-4">
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
            task.status === 'in-progress' ? 'bg-blue-100' :
            task.status === 'completed'   ? 'bg-green-100' : 'bg-amber-100'
          }`}>
            <svg className={`w-5 h-5 ${
              task.status === 'in-progress' ? 'text-blue-600' :
              task.status === 'completed'   ? 'text-green-600' : 'text-amber-600'
            }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="font-medium">{task.title}</p>
              {getPriorityBadge(task.priority)}
            </div>
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              {roomNum !== '—' && <span>Room {roomNum}</span>}
              <span>•</span>
              <span>{formatDate(task.createdAt)}</span>
              {task.assignedTo && (
                <><span>•</span><span>Assigned: {task.assignedTo.firstName} {task.assignedTo.lastName}</span></>
              )}
            </div>
            {task.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
            )}
          </div>
        </div>
        {showActions && (
          <div className="flex gap-2 flex-shrink-0">
            <Button size="sm" variant="outline" onClick={() => setSelectedRequest(task)}>
              Details
            </Button>
            {task.status === 'pending' && (
              <Button size="sm" onClick={() => handleStatusChange(tid, 'in-progress')}>
                Start
              </Button>
            )}
            {task.status === 'in-progress' && (
              <Button size="sm" onClick={() => handleStatusChange(tid, 'completed')}>
                Resolve
              </Button>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold">Maintenance</h1>
          <p className="text-muted-foreground">Track and resolve maintenance requests</p>
        </div>
        <Button onClick={() => { setShowNewForm(true); setError(null) }}>
          + New Request
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-amber-600">{pendingTasks.length}</p>
            <p className="text-sm text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-blue-600">{inProgressTasks.length}</p>
            <p className="text-sm text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-green-600">{completedTasks.length}</p>
            <p className="text-sm text-muted-foreground">Resolved</p>
          </CardContent>
        </Card>
      </div>

      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Pending */}
      {pendingTasks.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2">
            Pending <Badge variant="warning">{pendingTasks.length}</Badge>
          </CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-3">
            {pendingTasks.map(t => <TaskCard key={getTaskId(t)} task={t} />)}
          </CardContent>
        </Card>
      )}

      {/* In Progress */}
      {inProgressTasks.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2">
            In Progress <Badge variant="default">{inProgressTasks.length}</Badge>
          </CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-3">
            {inProgressTasks.map(t => <TaskCard key={getTaskId(t)} task={t} />)}
          </CardContent>
        </Card>
      )}

      {/* Completed */}
      {completedTasks.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2">
            Resolved <Badge variant="success">{completedTasks.length}</Badge>
          </CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-3">
            {completedTasks.slice(0, 10).map(t => <TaskCard key={getTaskId(t)} task={t} showActions={false} />)}
          </CardContent>
        </Card>
      )}

      {!isLoading && maintenanceTasks.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <svg className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="font-medium">No maintenance requests</p>
            <p className="text-muted-foreground text-sm">All systems operational</p>
          </CardContent>
        </Card>
      )}

      {/* New Request Modal */}
      <Modal isOpen={showNewForm} onClose={() => setShowNewForm(false)} title="New Maintenance Request">
        <div className="flex flex-col gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Room</label>
            <Select
              value={newRequest.roomId}
              onChange={e => setNewRequest(p => ({ ...p, roomId: e.target.value }))}
              options={[
                { value: '', label: 'Select a room…' },
                ...rooms.map(r => ({ value: r._id || r.id, label: `Room ${r.roomNumber} — ${r.type}` }))
              ]}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Issue Title</label>
            <Input
              value={newRequest.title}
              onChange={e => setNewRequest(p => ({ ...p, title: e.target.value }))}
              placeholder="e.g. Leaking faucet in bathroom"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Category</label>
              <Select
                value={newRequest.category}
                onChange={e => setNewRequest(p => ({ ...p, category: e.target.value }))}
                options={CATEGORIES}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Priority</label>
              <Select
                value={newRequest.priority}
                onChange={e => setNewRequest(p => ({ ...p, priority: e.target.value }))}
                options={[
                  { value: 'low',    label: 'Low' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'high',   label: 'High (Urgent)' }
                ]}
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={newRequest.description}
              onChange={e => setNewRequest(p => ({ ...p, description: e.target.value }))}
              rows={4}
              placeholder="Describe the issue in detail..."
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-3">
            <Button onClick={handleCreateRequest} className="flex-1" disabled={savingNew}>
              {savingNew ? 'Submitting…' : 'Submit Request'}
            </Button>
            <Button variant="outline" onClick={() => setShowNewForm(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Details Modal */}
      <Modal isOpen={!!selectedRequest} onClose={() => setSelectedRequest(null)} title="Request Details">
        {selectedRequest && (
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-lg">{selectedRequest.title}</h3>
              {getPriorityBadge(selectedRequest.priority)}
            </div>
            <div className="grid grid-cols-2 gap-4 p-4 bg-accent/30 rounded-lg text-sm">
              <div>
                <p className="text-muted-foreground">Room</p>
                <p className="font-medium">Room {selectedRequest.room?.roomNumber || '—'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <Badge variant={STATUS_VARIANTS[selectedRequest.status] || 'outline'}>
                  {selectedRequest.status?.replace('-', ' ')}
                </Badge>
              </div>
              <div>
                <p className="text-muted-foreground">Reported</p>
                <p className="font-medium">{formatDate(selectedRequest.createdAt)}</p>
              </div>
              {selectedRequest.assignedTo && (
                <div>
                  <p className="text-muted-foreground">Assigned To</p>
                  <p className="font-medium">{selectedRequest.assignedTo.firstName} {selectedRequest.assignedTo.lastName}</p>
                </div>
              )}
            </div>
            {selectedRequest.description && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Description</p>
                <p className="text-sm whitespace-pre-line">{selectedRequest.description}</p>
              </div>
            )}
            <Button variant="outline" onClick={() => setSelectedRequest(null)}>Close</Button>
          </div>
        )}
      </Modal>
    </div>
  )
}
