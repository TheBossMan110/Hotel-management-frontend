import { useState, useEffect } from 'react'
import { useRoomsStore } from '../../stores/roomsStore'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import Select from '../../components/ui/Select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs'
import { formatCurrency } from '../../lib/utils'

export default function AdminRooms() {
  const { rooms, fetchRooms, createRoom, updateRoom, deleteRoom, isLoading } = useRoomsStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingRoom, setEditingRoom] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [roomToDelete, setRoomToDelete] = useState(null)

  useEffect(() => {
    fetchRooms()
  }, [])

  const [formData, setFormData] = useState({
    roomNumber: '',
    type: 'Deluxe Room',
    floor: '1',
    price: { basePrice: 0 },
    capacity: { adults: 2, children: 1 },
    status: 'available',
    amenities: []
  })

  const roomTypes = ['Standard Room', 'Deluxe Room', 'Executive Suite', 'Presidential Suite', 'Penthouse']
  const statusOptions = ['available', 'occupied', 'maintenance', 'cleaning']
  const amenityOptions = ['WiFi', 'TV', 'Mini Bar', 'Safe', 'Balcony', 'Sea View', 'Jacuzzi', 'Kitchen']

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = (room.roomNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.type.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || room.status === filterStatus
    const matchesType = filterType === 'all' || room.type === filterType
    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusBadge = (status) => {
    const variants = {
      available: 'success',
      occupied: 'default',
      maintenance: 'warning',
      cleaning: 'secondary'
    }
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>
  }

  const handleAddRoom = async () => {
    const result = await createRoom({
      ...formData,
      price: { basePrice: parseFloat(formData.price.basePrice) }
    })
    if (result.success) {
      setShowAddModal(false)
      resetForm()
    }
  }

  const handleUpdateRoom = async () => {
    const result = await updateRoom(editingRoom._id, {
      ...formData,
      price: { basePrice: parseFloat(formData.price.basePrice) }
    })
    if (result.success) {
      setEditingRoom(null)
      resetForm()
    }
  }

  const handleDeleteRoom = async () => {
    const result = await deleteRoom(roomToDelete._id)
    if (result.success) {
      setShowDeleteModal(false)
      setRoomToDelete(null)
    }
  }

  const resetForm = () => {
    setFormData({
      roomNumber: '',
      type: 'Deluxe Room',
      floor: '1',
      price: { basePrice: 0 },
      capacity: { adults: 2, children: 1 },
      status: 'available',
      amenities: []
    })
  }

  const openEditModal = (room) => {
    setFormData({
      roomNumber: room.roomNumber,
      type: room.type,
      floor: room.floor.toString(),
      price: { basePrice: (room.price?.basePrice || room.price).toString() },
      capacity: { 
        adults: room.capacity?.adults || 2, 
        children: room.capacity?.children || 0 
      },
      status: room.status,
      amenities: room.amenities || []
    })
    setEditingRoom(room)
  }

  const toggleAmenity = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }))
  }

  const stats = {
    total: rooms.length,
    available: rooms.filter(r => r.status === 'available').length,
    occupied: rooms.filter(r => r.status === 'occupied').length,
    maintenance: rooms.filter(r => r.status === 'maintenance').length
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold">Room Management</h1>
          <p className="text-muted-foreground">Manage all hotel rooms and their status</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>Add New Room</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold">{stats.total}</p>
            <p className="text-sm text-muted-foreground">Total Rooms</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-green-600">{stats.available}</p>
            <p className="text-sm text-muted-foreground">Available</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-blue-600">{stats.occupied}</p>
            <p className="text-sm text-muted-foreground">Occupied</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-amber-600">{stats.maintenance}</p>
            <p className="text-sm text-muted-foreground">Maintenance</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search rooms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'available', label: 'Available' },
                { value: 'occupied', label: 'Occupied' },
                { value: 'maintenance', label: 'Maintenance' },
                { value: 'reserved', label: 'Reserved' }
              ]}
            />
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              options={[
                { value: 'all', label: 'All Types' },
                ...roomTypes.map(t => ({ value: t, label: t }))
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRooms.map((room) => (
          <Card key={room._id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-bold">Room {room.roomNumber}</h3>
                  <p className="text-sm text-muted-foreground">{room.type}</p>
                </div>
                {getStatusBadge(room.status)}
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                <div>
                  <span className="text-muted-foreground">Floor:</span>
                  <span className="ml-1 font-medium">{room.floor}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Capacity:</span>
                  <span className="ml-1 font-medium">
                    {room.capacity?.adults || room.capacity || 0} adults, {room.capacity?.children || 0} kids
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Price:</span>
                  <span className="ml-1 font-bold text-primary">{formatCurrency(room.price?.basePrice || room.price)}/night</span>
                </div>
              </div>

              {room.amenities && room.amenities.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {room.amenities.slice(0, 3).map((amenity) => (
                    <Badge key={amenity} variant="outline" className="text-xs">{amenity}</Badge>
                  ))}
                  {room.amenities.length > 3 && (
                    <Badge variant="outline" className="text-xs">+{room.amenities.length - 3}</Badge>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => openEditModal(room)}>
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => {
                    setRoomToDelete(room)
                    setShowDeleteModal(true)
                  }}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(filteredRooms.length === 0 && !isLoading) && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No rooms found matching your criteria</p>
          </CardContent>
        </Card>
      )}

      {isLoading && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Loading rooms...</p>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Room Modal */}
      <Modal
        isOpen={showAddModal || !!editingRoom}
        onClose={() => {
          setShowAddModal(false)
          setEditingRoom(null)
          resetForm()
        }}
        title={editingRoom ? 'Edit Room' : 'Add New Room'}
        size="lg"
      >
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Room Number"
              value={formData.roomNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, roomNumber: e.target.value }))}
              placeholder="e.g., 101"
            />
            <Select
              label="Room Type"
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
              options={roomTypes.map(t => ({ value: t, label: t }))}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Floor"
              type="number"
              value={formData.floor}
              onChange={(e) => setFormData(prev => ({ ...prev, floor: e.target.value }))}
            />
            <Input
              label="Adults"
              type="number"
              value={formData.capacity.adults}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                capacity: { ...prev.capacity, adults: parseInt(e.target.value) } 
              }))}
            />
            <Input
              label="Children"
              type="number"
              value={formData.capacity.children}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                capacity: { ...prev.capacity, children: parseInt(e.target.value) } 
              }))}
            />
            <Input
              label="Price per Night"
              type="number"
              value={formData.price.basePrice}
              onChange={(e) => setFormData(prev => ({ ...prev, price: { basePrice: e.target.value } }))}
              placeholder="299"
            />
          </div>

          <Select
            label="Status"
            value={formData.status}
            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
            options={statusOptions.map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))}
          />

          <div>
            <label className="block text-sm font-medium mb-2">Amenities</label>
            <div className="flex flex-wrap gap-2">
              {amenityOptions.map((amenity) => (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => toggleAmenity(amenity)}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    formData.amenities.includes(amenity)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border hover:border-primary'
                  }`}
                >
                  {amenity}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <Button onClick={editingRoom ? handleUpdateRoom : handleAddRoom} className="flex-1" disabled={isLoading}>
              {isLoading ? (editingRoom ? 'Updating...' : 'Adding...') : (editingRoom ? 'Update Room' : 'Add Room')}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddModal(false)
                setEditingRoom(null)
                resetForm()
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setRoomToDelete(null)
        }}
        title="Delete Room"
      >
        <div className="flex flex-col gap-4">
          <p>Are you sure you want to delete Room {roomToDelete?.roomNumber}? This action cannot be undone.</p>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteRoom} disabled={isLoading}>
              {isLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}