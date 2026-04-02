import { useState, useEffect } from 'react'
import { useRoomsStore } from '../../stores/roomsStore'
import { useStaffStore } from '../../stores/staffStore'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Select from '../../components/ui/Select'
import Modal from '../../components/ui/Modal'

const CHECKLIST_ITEMS = [
  { key: 'bedMade',           label: 'Bed Made & Linens Changed' },
  { key: 'bathroomCleaned',   label: 'Bathroom Cleaned & Sanitized' },
  { key: 'floorVacuumed',     label: 'Floor Vacuumed/Mopped' },
  { key: 'trashEmptied',      label: 'Trash Emptied' },
  { key: 'towelsReplaced',    label: 'Towels Replaced' },
  { key: 'miniBarChecked',    label: 'Mini Bar Checked & Restocked' },
  { key: 'windowsCleaned',    label: 'Windows & Mirrors Cleaned' },
  { key: 'amenitiesRestocked',label: 'Amenities Restocked' }
]

const DEFAULT_CHECKLIST = Object.fromEntries(CHECKLIST_ITEMS.map(i => [i.key, false]))

const CLEANING_STATUS_VARIANTS = {
  clean:        'success',
  dirty:        'destructive',
  'in-progress':'warning',
  inspected:    'default'
}

export default function StaffHousekeeping() {
  const { rooms, fetchRooms, updateRoomStatus, isLoading } = useRoomsStore()
  const { createTask } = useStaffStore()

  const [filterFloor,  setFilterFloor]  = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [showModal,    setShowModal]    = useState(false)
  const [checklist,    setChecklist]    = useState({ ...DEFAULT_CHECKLIST })
  const [saving,       setSaving]       = useState(false)

  useEffect(() => { fetchRooms() }, [])

  const getRoomId = (r) => r._id || r.id

  const floors = [...new Set(rooms.map(r => r.floor).filter(Boolean))].sort((a, b) => a - b)

  const filteredRooms = rooms.filter(room => {
    const matchFloor  = filterFloor  === 'all' || String(room.floor) === filterFloor
    const matchStatus = filterStatus === 'all' || room.cleaningStatus === filterStatus
    return matchFloor && matchStatus
  })

  const stats = {
    total:      rooms.length,
    clean:      rooms.filter(r => r.cleaningStatus === 'clean' || r.cleaningStatus === 'inspected').length,
    dirty:      rooms.filter(r => r.cleaningStatus === 'dirty').length,
    inProgress: rooms.filter(r => r.cleaningStatus === 'in-progress').length
  }

  const handleStartCleaning = async (room) => {
    setSelectedRoom(room)
    setChecklist({ ...DEFAULT_CHECKLIST })
    setShowModal(true)
    // Mark room as in-progress
    await updateRoomStatus(getRoomId(room), room.status, 'in-progress')
  }

  const handleResumeCleaning = (room) => {
    setSelectedRoom(room)
    setChecklist({ ...DEFAULT_CHECKLIST })
    setShowModal(true)
  }

  const handleCompleteCleaning = async () => {
    if (!selectedRoom) return
    setSaving(true)
    try {
      await updateRoomStatus(getRoomId(selectedRoom), selectedRoom.status, 'clean')
      // Create a completed housekeeping task record
      await createTask({
        title:       `Housekeeping — Room ${selectedRoom.roomNumber}`,
        description: 'Room cleaned via housekeeping checklist',
        type:        'housekeeping',
        priority:    'medium',
        roomId:      getRoomId(selectedRoom)
      })
      setShowModal(false)
      setSelectedRoom(null)
      fetchRooms()
    } finally {
      setSaving(false)
    }
  }

  const toggle = (key) => setChecklist(prev => ({ ...prev, [key]: !prev[key] }))

  const completedCount = Object.values(checklist).filter(Boolean).length
  const allDone        = completedCount === CHECKLIST_ITEMS.length
  const progressPct    = Math.round((completedCount / CHECKLIST_ITEMS.length) * 100)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-serif font-bold">Housekeeping</h1>
        <p className="text-muted-foreground">Manage room cleaning schedules</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Rooms',   value: stats.total,      color: '' },
          { label: 'Clean',         value: stats.clean,      color: 'text-green-600' },
          { label: 'Need Cleaning', value: stats.dirty,      color: 'text-red-600' },
          { label: 'In Progress',   value: stats.inProgress, color: 'text-amber-600' }
        ].map(({ label, value, color }) => (
          <Card key={label}>
            <CardContent className="p-4 text-center">
              <p className={`text-3xl font-bold ${color}`}>{value}</p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <Select
              value={filterFloor}
              onChange={e => setFilterFloor(e.target.value)}
              options={[
                { value: 'all', label: 'All Floors' },
                ...floors.map(f => ({ value: String(f), label: `Floor ${f}` }))
              ]}
            />
            <Select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              options={[
                { value: 'all',         label: 'All Status' },
                { value: 'dirty',       label: 'Needs Cleaning' },
                { value: 'in-progress', label: 'In Progress' },
                { value: 'clean',       label: 'Clean' },
                { value: 'inspected',   label: 'Inspected' }
              ]}
            />
            <Button variant="outline" onClick={() => fetchRooms()} className="ml-auto">
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Room Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredRooms.map((room) => {
            const rid = getRoomId(room)
            const isDirty      = room.cleaningStatus === 'dirty'
            const isInProgress = room.cleaningStatus === 'in-progress'
            return (
              <Card
                key={rid}
                className={`transition-all hover:shadow-md ${
                  isDirty      ? 'border-red-200 bg-red-50/50' :
                  isInProgress ? 'border-amber-200 bg-amber-50/50' :
                  room.cleaningStatus === 'clean' || room.cleaningStatus === 'inspected'
                               ? 'border-green-200 bg-green-50/50' : ''
                }`}
              >
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold mb-1">{room.roomNumber}</p>
                  <p className="text-xs text-muted-foreground mb-2">Floor {room.floor}</p>
                  <Badge variant={CLEANING_STATUS_VARIANTS[room.cleaningStatus] || 'outline'}>
                    {room.cleaningStatus || 'unknown'}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-2 capitalize">{room.type}</p>

                  {isDirty && (
                    <Button size="sm" className="w-full mt-3" onClick={() => handleStartCleaning(room)}>
                      Start Cleaning
                    </Button>
                  )}
                  {isInProgress && (
                    <Button size="sm" variant="outline" className="w-full mt-3" onClick={() => handleResumeCleaning(room)}>
                      Continue
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {!isLoading && filteredRooms.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No rooms match your filters</p>
          </CardContent>
        </Card>
      )}

      {/* Cleaning Checklist Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setSelectedRoom(null) }}
        title={`Cleaning Room ${selectedRoom?.roomNumber}`}
        size="lg"
      >
        {selectedRoom && (
          <div className="flex flex-col gap-6">
            {/* Room info */}
            <div className="p-4 bg-accent/30 rounded-lg grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Room Type</p>
                <p className="font-medium capitalize">{selectedRoom.type}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Floor</p>
                <p className="font-medium">{selectedRoom.floor}</p>
              </div>
            </div>

            {/* Checklist */}
            <div>
              <h4 className="font-medium mb-4">Cleaning Checklist</h4>
              <div className="flex flex-col gap-3">
                {CHECKLIST_ITEMS.map(({ key, label }) => (
                  <label
                    key={key}
                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      checklist[key] ? 'bg-green-50 border-green-200' : 'hover:bg-accent/30'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checklist[key]}
                      onChange={() => toggle(key)}
                      className="w-5 h-5 rounded border-border"
                    />
                    <span className={checklist[key] ? 'line-through text-muted-foreground' : ''}>
                      {label}
                    </span>
                    {checklist[key] && (
                      <svg className="w-5 h-5 text-green-600 ml-auto flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Progress ring */}
            <div className="flex items-center justify-between p-4 bg-accent/30 rounded-lg">
              <div>
                <p className="font-medium">Progress</p>
                <p className="text-sm text-muted-foreground">
                  {completedCount} of {CHECKLIST_ITEMS.length} items completed
                </p>
              </div>
              <div className="w-20 h-20 relative">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle cx="40" cy="40" r="32" strokeWidth="6" fill="none" className="stroke-accent" />
                  <circle
                    cx="40" cy="40" r="32" strokeWidth="6" fill="none"
                    className="stroke-green-500 transition-all"
                    strokeDasharray={`${(completedCount / CHECKLIST_ITEMS.length) * 201} 201`}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-base font-bold">
                  {progressPct}%
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleCompleteCleaning} className="flex-1" disabled={!allDone || saving}>
                {saving ? 'Saving…' : 'Complete Cleaning'}
              </Button>
              <Button variant="outline" onClick={() => setShowModal(false)}>Save & Exit</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
