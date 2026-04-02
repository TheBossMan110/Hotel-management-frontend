import { useState, useEffect } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { useStaffStore } from '../../stores/staffStore'
import { tasksAPI, usersAPI, maintenanceAPI } from '../../lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Select from '../../components/ui/Select'
import Modal from '../../components/ui/Modal'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs'
import { formatDate } from '../../lib/utils'
import { Plus, CheckCircle, Loader2, AlertTriangle } from 'lucide-react'

const TYPE_COLORS = {
  housekeeping:  'bg-blue-100 text-blue-700',
  maintenance:   'bg-amber-100 text-amber-700',
  'room-service':'bg-green-100 text-green-700',
  'guest-request':'bg-purple-100 text-purple-700',
  laundry:       'bg-pink-100 text-pink-700'
}

export default function StaffTasks() {
  const { user } = useAuthStore()
  const { tasks, fetchTasks, myTasks, fetchMyTasks, updateTaskStatus, updateChecklistItem, addTaskNote, createTask, fetchStaff, staff, isLoading } = useStaffStore()

  // Manager detection - Suleman Raza (management department) or admin
  const isManager = user?.email === 'manager@grandazure.pk' || user?.role === 'admin'

  const [filterPriority, setFilterPriority] = useState('all')
  const [filterType,     setFilterType]     = useState('all')
  const [selectedTask,   setSelectedTask]   = useState(null)
  const [note,           setNote]           = useState('')
  const [addingNote,     setAddingNote]     = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(null)

  // Assign task modal
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [assignForm, setAssignForm] = useState({
    title: '', description: '', type: 'housekeeping', priority: 'medium', assignedTo: '', dueDate: ''
  })
  const [assigning, setAssigning] = useState(false)
  const [assignSuccess, setAssignSuccess] = useState(false)

  // Reports for manager
  const [reports, setReports] = useState([])
  const [loadingReports, setLoadingReports] = useState(false)

  useEffect(() => {
    if (isManager) {
      fetchTasks()
      fetchStaff()
      loadReports()
    } else {
      fetchMyTasks()
    }
  }, [])

  const loadReports = async () => {
    setLoadingReports(true)
    try {
      const { data } = await maintenanceAPI.getAll({ limit: 20 })
      setReports(data.data?.requests || data.requests || data.data || [])
    } catch (err) {
      console.error('Failed to load reports:', err)
    } finally {
      setLoadingReports(false)
    }
  }

  const getTaskId = (t) => t._id || t.id

  const displayTasks = isManager ? tasks : myTasks
  const filtered = displayTasks.filter(t => {
    const okPriority = filterPriority === 'all' || t.priority === filterPriority
    const okType     = filterType     === 'all' || t.type === filterType
    return okPriority && okType
  })

  const pending    = filtered.filter(t => t.status === 'pending')
  const inProgress = filtered.filter(t => t.status === 'in-progress')
  const completed  = filtered.filter(t => t.status === 'completed')

  const handleStatusChange = async (taskId, status) => {
    setUpdatingStatus(taskId)
    await updateTaskStatus(taskId, status)
    if (selectedTask && getTaskId(selectedTask) === taskId) {
      setSelectedTask(prev => ({ ...prev, status }))
    }
    setUpdatingStatus(null)
    isManager ? fetchTasks() : fetchMyTasks()
  }

  const handleToggleChecklist = async (taskId, index, completed) => {
    await updateChecklistItem(taskId, index, completed)
    if (selectedTask && getTaskId(selectedTask) === taskId) {
      setSelectedTask(prev => ({
        ...prev,
        checklist: prev.checklist.map((item, i) => i === index ? { ...item, completed } : item)
      }))
    }
  }

  const handleAddNote = async () => {
    if (!selectedTask || !note.trim()) return
    setAddingNote(true)
    const result = await addTaskNote(getTaskId(selectedTask), note.trim())
    if (result.success) {
      setNote('')
      setSelectedTask(prev => ({ ...prev, notes: result.notes }))
    }
    setAddingNote(false)
  }

  // Manager: assign task to staff
  const handleAssignTask = async () => {
    if (!assignForm.title.trim() || !assignForm.assignedTo) return
    setAssigning(true)
    try {
      const result = await createTask({
        title: assignForm.title,
        description: assignForm.description,
        type: assignForm.type,
        priority: assignForm.priority,
        assignedTo: assignForm.assignedTo,
        dueDate: assignForm.dueDate || undefined
      })
      if (result.success) {
        setAssignSuccess(true)
        setTimeout(() => {
          setShowAssignModal(false)
          setAssignSuccess(false)
          setAssignForm({ title: '', description: '', type: 'housekeeping', priority: 'medium', assignedTo: '', dueDate: '' })
          fetchTasks()
        }, 1500)
      } else {
        alert(result.error || 'Failed to assign task')
      }
    } catch (err) {
      alert('Failed to assign task')
    } finally {
      setAssigning(false)
    }
  }

  const getPriorityBadge = (p) => {
    const v = { high: 'destructive', medium: 'warning', low: 'secondary' }
    return <Badge variant={v[p] || 'outline'}>{p}</Badge>
  }

  const getTypePill = (type) => (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${TYPE_COLORS[type] || 'bg-gray-100 text-gray-700'}`}>
      {(type || '').replace(/-/g, ' ')}
    </span>
  )

  const staffList = staff.filter(s => s.email !== 'manager@grandazure.pk')

  const TaskCard = ({ task }) => {
    const tid = getTaskId(task)
    const roomNum = task.room?.roomNumber || task.roomNumber || null
    const isUpdating = updatingStatus === tid

    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-gray-200 rounded-xl gap-3 hover:shadow-sm transition-shadow">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
            task.status === 'in-progress' ? 'bg-blue-100' :
            task.status === 'completed'   ? 'bg-green-100' : 'bg-amber-100'
          }`}>
            <svg className={`w-5 h-5 ${
              task.status === 'in-progress' ? 'text-blue-600' :
              task.status === 'completed'   ? 'text-green-600' : 'text-amber-600'
            }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <p className="font-medium text-gray-900 truncate">{task.title}</p>
              {getPriorityBadge(task.priority)}
            </div>
            <div className="flex flex-wrap gap-2 text-sm text-gray-500">
              {roomNum && <span>Room {roomNum}</span>}
              {getTypePill(task.type)}
              {task.dueDate && <span>Due: {formatDate(task.dueDate)}</span>}
              {task.assignedTo && <span className="text-blue-600">→ {task.assignedTo.firstName || 'Staff'}</span>}
            </div>
          </div>
        </div>

        <div className="flex gap-2 flex-shrink-0">
          <button onClick={() => setSelectedTask(task)}
            className="px-3 py-1.5 rounded-lg text-sm border border-gray-300 text-gray-700 hover:bg-gray-50">View</button>
          {task.status === 'pending' && (
            <button disabled={isUpdating} onClick={() => handleStatusChange(tid, 'in-progress')}
              className="px-3 py-1.5 rounded-lg text-sm bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
              {isUpdating ? '…' : 'Start'}
            </button>
          )}
          {task.status === 'in-progress' && (
            <button disabled={isUpdating} onClick={() => handleStatusChange(tid, 'completed')}
              className="px-3 py-1.5 rounded-lg text-sm bg-green-600 text-white hover:bg-green-700 disabled:opacity-50">
              {isUpdating ? '…' : 'Done'}
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900">
            {isManager ? 'Task Management' : 'My Tasks'}
          </h1>
          <p className="text-gray-500">
            {isManager ? 'Manage and assign tasks to staff' : 'View and manage your assigned tasks'}
          </p>
        </div>
        <div className="flex gap-2">
          {isManager && (
            <button onClick={() => { setShowAssignModal(true); setAssignSuccess(false) }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm bg-blue-600 text-white hover:bg-blue-700 font-medium">
              <Plus className="w-4 h-4" /> Assign Task
            </button>
          )}
          <button onClick={() => fetchMyTasks()}
            className="px-4 py-2 rounded-xl text-sm border border-gray-300 text-gray-700 hover:bg-gray-50">Refresh</button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pending',     count: pending.length,    color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'In Progress', count: inProgress.length, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Completed',   count: completed.length,  color: 'text-green-600', bg: 'bg-green-50' }
        ].map(({ label, count, color, bg }) => (
          <div key={label} className={`${bg} border rounded-xl p-4 text-center`}>
            <p className={`text-3xl font-bold ${color}`}>{count}</p>
            <p className="text-sm text-gray-600">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm">
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select value={filterType} onChange={e => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm">
            <option value="all">All Types</option>
            <option value="housekeeping">Housekeeping</option>
            <option value="maintenance">Maintenance</option>
            <option value="room-service">Room Service</option>
            <option value="guest-request">Guest Request</option>
            <option value="laundry">Laundry</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
            <TabsTrigger value="inprogress">In Progress ({inProgress.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
            {isManager && <TabsTrigger value="reports">Reports ({reports.length})</TabsTrigger>}
          </TabsList>

          <TabsContent value="pending">
            {pending.length === 0 ? (
              <div className="bg-white border rounded-xl p-12 text-center"><p className="text-gray-500">No pending tasks</p></div>
            ) : (
              <div className="flex flex-col gap-3">{pending.map(t => <TaskCard key={getTaskId(t)} task={t} />)}</div>
            )}
          </TabsContent>

          <TabsContent value="inprogress">
            {inProgress.length === 0 ? (
              <div className="bg-white border rounded-xl p-12 text-center"><p className="text-gray-500">No tasks in progress</p></div>
            ) : (
              <div className="flex flex-col gap-3">{inProgress.map(t => <TaskCard key={getTaskId(t)} task={t} />)}</div>
            )}
          </TabsContent>

          <TabsContent value="completed">
            {completed.length === 0 ? (
              <div className="bg-white border rounded-xl p-12 text-center"><p className="text-gray-500">No completed tasks yet</p></div>
            ) : (
              <div className="flex flex-col gap-3">{completed.map(t => <TaskCard key={getTaskId(t)} task={t} />)}</div>
            )}
          </TabsContent>

          {/* Manager-only Reports tab */}
          {isManager && (
            <TabsContent value="reports">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" /> Guest Reports (assign to staff)
              </h3>
              {reports.length === 0 ? (
                <div className="bg-white border rounded-xl p-12 text-center"><p className="text-gray-500">No reports</p></div>
              ) : (
                <div className="flex flex-col gap-3">
                  {reports.map((rpt, i) => (
                    <div key={rpt._id || i} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{rpt.title}</p>
                          <p className="text-sm text-gray-600 mt-1">{rpt.description}</p>
                          <div className="flex gap-3 mt-2 text-xs text-gray-400">
                            <span>🏷️ {rpt.category}</span>
                            <span>🏨 Room: {rpt.room?.roomNumber || 'N/A'}</span>
                            <span className={`px-2 py-0.5 rounded-full ${rpt.priority === 'high' || rpt.priority === 'critical' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{rpt.priority}</span>
                            <span className={`px-2 py-0.5 rounded-full ${rpt.status === 'open' ? 'bg-red-100 text-red-700' : rpt.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{rpt.status}</span>
                          </div>
                        </div>
                        <button onClick={() => {
                          setAssignForm({
                            title: `Fix: ${rpt.title}`,
                            description: `${rpt.description}\n\nCategory: ${rpt.category}\nRoom: ${rpt.room?.roomNumber || 'N/A'}\nPriority: ${rpt.priority}`,
                            type: 'maintenance',
                            priority: rpt.priority === 'critical' ? 'high' : rpt.priority,
                            assignedTo: '',
                            dueDate: ''
                          })
                          setShowAssignModal(true)
                          setAssignSuccess(false)
                        }} className="px-3 py-1.5 rounded-lg text-xs bg-blue-600 text-white hover:bg-blue-700 font-medium whitespace-nowrap">
                          Assign to Staff
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>
      )}

      {/* Task Detail Modal */}
      <Modal isOpen={!!selectedTask} onClose={() => setSelectedTask(null)} title="Task Details" size="lg">
        {selectedTask && (
          <div className="flex flex-col gap-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg text-gray-900">{selectedTask.title}</h3>
                <div className="flex flex-wrap gap-2 mt-1">
                  {getPriorityBadge(selectedTask.priority)}
                  {getTypePill(selectedTask.type)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                    selectedTask.status === 'completed' ? 'bg-green-100 text-green-700' :
                    selectedTask.status === 'in-progress' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>{selectedTask.status?.replace('-', ' ')}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl text-sm">
              {selectedTask.room?.roomNumber && (
                <div><p className="text-gray-500">Room</p><p className="font-medium text-gray-900">{selectedTask.room.roomNumber}</p></div>
              )}
              {selectedTask.dueDate && (
                <div><p className="text-gray-500">Due Date</p><p className="font-medium text-gray-900">{formatDate(selectedTask.dueDate)}</p></div>
              )}
              <div><p className="text-gray-500">Created</p><p className="font-medium text-gray-900">{formatDate(selectedTask.createdAt)}</p></div>
              {selectedTask.assignedTo && (
                <div><p className="text-gray-500">Assigned To</p><p className="font-medium text-gray-900">{selectedTask.assignedTo.firstName || ''} {selectedTask.assignedTo.lastName || ''}</p></div>
              )}
            </div>

            {selectedTask.description && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Description</p>
                <p className="text-sm text-gray-600 whitespace-pre-line">{selectedTask.description}</p>
              </div>
            )}

            {selectedTask.checklist && selectedTask.checklist.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Checklist ({selectedTask.checklist.filter(i => i.completed).length}/{selectedTask.checklist.length})
                </p>
                <div className="flex flex-col gap-2">
                  {selectedTask.checklist.map((item, idx) => (
                    <label key={idx} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${item.completed ? 'bg-green-50 border-green-200' : 'hover:bg-gray-50'}`}>
                      <input type="checkbox" checked={item.completed} onChange={e => handleToggleChecklist(getTaskId(selectedTask), idx, e.target.checked)} className="w-4 h-4 rounded accent-green-600" />
                      <span className={`text-gray-900 ${item.completed ? 'line-through text-gray-400' : ''}`}>{item.item}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">Notes</p>
              {selectedTask.notes && selectedTask.notes.length > 0 && (
                <div className="flex flex-col gap-2 mb-3">
                  {selectedTask.notes.map((n, i) => (
                    <div key={i} className="p-3 bg-gray-50 rounded-lg text-sm">
                      <p className="font-medium text-xs text-gray-400 mb-1">{n.author?.firstName} {n.author?.lastName} · {formatDate(n.createdAt)}</p>
                      <p className="text-gray-700">{n.content}</p>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} placeholder="Add a note…"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30 resize-none placeholder-gray-400" />
                <button onClick={handleAddNote} disabled={!note.trim() || addingNote}
                  className="px-4 py-2 rounded-lg text-sm bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">{addingNote ? '…' : 'Add'}</button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 border-t border-gray-200 pt-4">
              {selectedTask.status === 'pending' && (
                <button className="flex-1 px-4 py-2 rounded-xl text-sm bg-blue-600 text-white hover:bg-blue-700"
                  disabled={updatingStatus === getTaskId(selectedTask)}
                  onClick={() => handleStatusChange(getTaskId(selectedTask), 'in-progress')}>Start Task</button>
              )}
              {selectedTask.status === 'in-progress' && (
                <button className="flex-1 px-4 py-2 rounded-xl text-sm bg-green-600 text-white hover:bg-green-700"
                  disabled={updatingStatus === getTaskId(selectedTask)}
                  onClick={() => handleStatusChange(getTaskId(selectedTask), 'completed')}>Mark Complete</button>
              )}
              <button className="px-4 py-2 rounded-xl text-sm border border-gray-300 text-gray-700 hover:bg-gray-50"
                onClick={() => setSelectedTask(null)}>Close</button>
            </div>
          </div>
        )}
      </Modal>

      {/* ═══════ ASSIGN TASK MODAL (Manager only) ═══════ */}
      <Modal isOpen={showAssignModal} onClose={() => setShowAssignModal(false)} title="Assign Task to Staff" size="md">
        {assignSuccess ? (
          <div className="flex flex-col items-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Task Assigned!</h3>
            <p className="text-gray-500">The staff member has been notified.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Task Title *</label>
              <input type="text" value={assignForm.title} onChange={e => setAssignForm(p => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Clean Room 502, Fix AC..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/40 placeholder-gray-400" />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Description</label>
              <textarea value={assignForm.description} onChange={e => setAssignForm(p => ({ ...p, description: e.target.value }))}
                rows={3} placeholder="Task details..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/40 resize-none placeholder-gray-400" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Type</label>
                <select value={assignForm.type} onChange={e => setAssignForm(p => ({ ...p, type: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white text-gray-900 text-sm">
                  <option value="housekeeping">🧹 Housekeeping</option>
                  <option value="maintenance">🔧 Maintenance</option>
                  <option value="room-service">🍽️ Room Service</option>
                  <option value="guest-request">👤 Guest Request</option>
                  <option value="laundry">👔 Laundry</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Priority</label>
                <select value={assignForm.priority} onChange={e => setAssignForm(p => ({ ...p, priority: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white text-gray-900 text-sm">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Assign To *</label>
              <select value={assignForm.assignedTo} onChange={e => setAssignForm(p => ({ ...p, assignedTo: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white text-gray-900 text-sm">
                <option value="">Select staff member...</option>
                {staffList.map(s => (
                  <option key={s._id} value={s._id}>{s.firstName} {s.lastName} — {s.email}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Due Date</label>
              <input type="date" value={assignForm.dueDate} onChange={e => setAssignForm(p => ({ ...p, dueDate: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white text-gray-900 text-sm" />
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button onClick={() => setShowAssignModal(false)}
                className="px-5 py-2.5 rounded-xl text-sm border border-gray-300 text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={handleAssignTask}
                disabled={assigning || !assignForm.title.trim() || !assignForm.assignedTo}
                className="px-5 py-2.5 rounded-xl text-sm bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium">
                {assigning ? <><Loader2 className="w-4 h-4 animate-spin" /> Assigning...</> : 'Assign Task'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
