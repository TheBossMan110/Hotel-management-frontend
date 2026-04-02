import { useState, useEffect } from 'react'
import { useBookingsStore } from '../../stores/bookingsStore'
import { useRoomsStore } from '../../stores/roomsStore'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import Select from '../../components/ui/Select'
import { formatDate, formatCurrency } from '../../lib/utils'

export default function AdminBookings() {
  const { bookings, fetchBookings, updateBookingStatus, createBooking, isLoading } = useBookingsStore()
  const { rooms, fetchRooms } = useRoomsStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showNewBookingModal, setShowNewBookingModal] = useState(false)
  const [newBooking, setNewBooking] = useState({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    roomId: '',
    checkIn: '',
    checkOut: '',
    guests: { adults: 1, children: 0 },
    specialRequests: ''
  })

  useEffect(() => {
    fetchBookings()
    fetchRooms()
  }, [])

  const filteredBookings = bookings.filter(booking => {
    const guestName = `${booking.guest?.firstName || ''} ${booking.guest?.lastName || ''}`.toLowerCase()
    const matchesSearch = 
      guestName.includes(searchTerm.toLowerCase()) ||
      (booking.bookingNumber || booking._id).toLowerCase().includes(searchTerm.toLowerCase()) ||
      (booking.room?.roomNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status) => {
    const variants = {
      confirmed: 'default',
      'checked-in': 'success',
      'checked-out': 'secondary',
      cancelled: 'destructive',
      pending: 'warning'
    }
    return <Badge variant={variants[status] || 'outline'}>{(status || '').replace('-', ' ')}</Badge>
  }

  const handleStatusChange = async (bookingId, newStatus) => {
    const result = await updateBookingStatus(bookingId, newStatus)
    if (result.success) {
      setSelectedBooking(null)
    }
  }

  const handleCreateBooking = async () => {
    const room = rooms.find(r => r._id === newBooking.roomId)
    if (!room) return

    const result = await createBooking({
      ...newBooking,
      roomId: room._id
    })

    if (result.success) {
      setShowNewBookingModal(false)
      setNewBooking({
        guestName: '',
        guestEmail: '',
        guestPhone: '',
        roomId: '',
        checkIn: '',
        checkOut: '',
        guests: { adults: 1, children: 0 },
        specialRequests: ''
      })
    }
  }

  const availableRooms = rooms.filter(r => r.status === 'available')

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold">Booking Management</h1>
          <p className="text-muted-foreground">Manage all hotel reservations</p>
        </div>
        <Button onClick={() => setShowNewBookingModal(true)}>New Booking</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total', count: bookings.length, color: 'text-foreground' },
          { label: 'Confirmed', count: bookings.filter(b => b.status === 'confirmed').length, color: 'text-blue-600' },
          { label: 'Checked In', count: bookings.filter(b => b.status === 'checked-in').length, color: 'text-green-600' },
          { label: 'Checked Out', count: bookings.filter(b => b.status === 'checked-out').length, color: 'text-gray-600' },
          { label: 'Cancelled', count: bookings.filter(b => b.status === 'cancelled').length, color: 'text-red-600' }
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 text-center">
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.count}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by guest name, booking ID, or room..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'confirmed', label: 'Confirmed' },
                { value: 'checked-in', label: 'Checked In' },
                { value: 'checked-out', label: 'Checked Out' },
                { value: 'cancelled', label: 'Cancelled' }
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-accent/30">
                  <th className="text-left py-3 px-4 font-medium">Booking ID</th>
                  <th className="text-left py-3 px-4 font-medium">Guest</th>
                  <th className="text-left py-3 px-4 font-medium">Room</th>
                  <th className="text-left py-3 px-4 font-medium">Check-in</th>
                  <th className="text-left py-3 px-4 font-medium">Check-out</th>
                  <th className="text-left py-3 px-4 font-medium">Amount</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-right py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking._id} className="border-b border-border/50 hover:bg-accent/20">
                    <td className="py-3 px-4">
                      <span className="font-mono text-sm">#{booking.bookingNumber || booking._id.slice(-8).toUpperCase()}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">{booking.guest?.firstName} {booking.guest?.lastName}</p>
                        <p className="text-sm text-muted-foreground">{booking.guest?.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">{booking.room?.type}</p>
                        <p className="text-sm text-muted-foreground">Room {booking.room?.roomNumber}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm">{formatDate(booking.checkIn)}</td>
                    <td className="py-3 px-4 text-sm">{formatDate(booking.checkOut)}</td>
                    <td className="py-3 px-4 font-semibold">{formatCurrency(booking.pricing?.total || booking.totalAmount)}</td>
                    <td className="py-3 px-4">{getStatusBadge(booking.status)}</td>
                    <td className="py-3 px-4 text-right">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedBooking(booking)}>
                        Manage
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {(filteredBookings.length === 0 && !isLoading) && (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No bookings found</p>
            </div>
          )}
          {isLoading && (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">Loading bookings...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Booking Detail Modal */}
      <Modal
        isOpen={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        title="Booking Details"
        size="lg"
      >
        {selectedBooking && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Booking ID</p>
                <p className="font-mono font-bold">#{selectedBooking.bookingNumber || selectedBooking._id.slice(-8).toUpperCase()}</p>
              </div>
              {getStatusBadge(selectedBooking.status)}
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 bg-accent/30 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Guest Name</p>
                <p className="font-medium">{selectedBooking.guest?.firstName} {selectedBooking.guest?.lastName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{selectedBooking.guest?.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{selectedBooking.guest?.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Guests</p>
                <p className="font-medium">{selectedBooking.guests?.adults} Adults, {selectedBooking.guests?.children} Children</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Room</p>
                  <p className="font-medium">{selectedBooking.room?.type}</p>
                  <p className="text-sm">Room {selectedBooking.room?.roomNumber}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="text-xl font-bold text-primary">{formatCurrency(selectedBooking.pricing?.total || selectedBooking.totalAmount)}</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Check-in</p>
                <p className="font-medium">{formatDate(selectedBooking.checkIn)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Check-out</p>
                <p className="font-medium">{formatDate(selectedBooking.checkOut)}</p>
              </div>
            </div>

            {selectedBooking.specialRequests && (
              <div>
                <p className="text-sm text-muted-foreground">Special Requests</p>
                <p className="mt-1">{selectedBooking.specialRequests}</p>
              </div>
            )}

            <div className="border-t border-border pt-4">
              <p className="text-sm font-medium mb-3">Update Status</p>
              <div className="flex flex-wrap gap-2">
                {['confirmed', 'checked-in', 'checked-out', 'cancelled'].map((status) => (
                  <Button
                    key={status}
                    variant={selectedBooking.status === status ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusChange(selectedBooking._id, status)}
                    disabled={selectedBooking.status === status || isLoading}
                  >
                    {status.replace('-', ' ')}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* New Booking Modal */}
      <Modal
        isOpen={showNewBookingModal}
        onClose={() => setShowNewBookingModal(false)}
        title="Create New Booking"
        size="lg"
      >
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Guest Name"
              value={newBooking.guestName}
              onChange={(e) => setNewBooking(prev => ({ ...prev, guestName: e.target.value }))}
              placeholder="John Doe"
            />
            <Input
              label="Email"
              type="email"
              value={newBooking.guestEmail}
              onChange={(e) => setNewBooking(prev => ({ ...prev, guestEmail: e.target.value }))}
              placeholder="john@example.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Phone"
              value={newBooking.guestPhone}
              onChange={(e) => setNewBooking(prev => ({ ...prev, guestPhone: e.target.value }))}
              placeholder="+1 555 000 0000"
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Adults"
                type="number"
                value={newBooking.guests.adults}
                onChange={(e) => setNewBooking(prev => ({ ...prev, guests: { ...prev.guests, adults: parseInt(e.target.value) } }))}
              />
              <Input
                label="Children"
                type="number"
                value={newBooking.guests.children}
                onChange={(e) => setNewBooking(prev => ({ ...prev, guests: { ...prev.guests, children: parseInt(e.target.value) } }))}
              />
            </div>
          </div>

          <Select
            label="Select Room"
            value={newBooking.roomId}
            onChange={(e) => setNewBooking(prev => ({ ...prev, roomId: e.target.value }))}
            options={[
              { value: '', label: 'Select a room...' },
              ...availableRooms.map(r => ({
                value: r._id,
                label: `Room ${r.roomNumber} - ${r.type} (${formatCurrency(r.price?.basePrice || r.price)}/night)`
              }))
            ]}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Check-in Date"
              type="date"
              value={newBooking.checkIn}
              onChange={(e) => setNewBooking(prev => ({ ...prev, checkIn: e.target.value }))}
            />
            <Input
              label="Check-out Date"
              type="date"
              value={newBooking.checkOut}
              onChange={(e) => setNewBooking(prev => ({ ...prev, checkOut: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Special Requests</label>
            <textarea
              value={newBooking.specialRequests}
              onChange={(e) => setNewBooking(prev => ({ ...prev, specialRequests: e.target.value }))}
              placeholder="Any special requests..."
              rows={3}
              className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>

          <div className="flex gap-3 mt-4">
            <Button onClick={handleCreateBooking} className="flex-1" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Booking'}
            </Button>
            <Button variant="outline" onClick={() => setShowNewBookingModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}