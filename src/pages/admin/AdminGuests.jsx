import { useState, useEffect } from 'react'
import { useGuestStore } from '../../stores/guestStore'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Badge from '../../components/ui/Badge'
import Avatar from '../../components/ui/Avatar'
import Modal from '../../components/ui/Modal'
import Select from '../../components/ui/Select'
import { formatDate } from '../../lib/utils'

export default function AdminUsers() {
  const { guests, fetchGuests, updateGuest, isLoading, error } = useGuestStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedUser, setSelectedUser] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editForm, setEditForm] = useState({})

  useEffect(() => {
    fetchGuests()
  }, [])

  const filteredUsers = guests.filter(user => {
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase()
    const matchesSearch = 
      fullName.includes(searchTerm.toLowerCase()) ||
      (user.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === 'all' || user.role === filterRole
    const matchesStatus = filterStatus === 'all' || 
      (user.isActive ? 'active' : 'inactive') === filterStatus
    return matchesSearch && matchesRole && matchesStatus
  })

  const getRoleBadge = (role) => {
    const variants = {
      guest: 'outline',
      vip: 'default',
      admin: 'destructive'
    }
    return <Badge variant={variants[role] || 'outline'}>{(role || 'GUEST').toUpperCase()}</Badge>
  }

  const getStatusBadge = (isActive) => {
    return <Badge variant={isActive ? 'success' : 'secondary'}>{isActive ? 'active' : 'inactive'}</Badge>
  }

  const handleEditUser = (user) => {
    setEditForm({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive
    })
    setSelectedUser(user)
    setShowEditModal(true)
  }

  const handleSaveUser = async () => {
    const result = await updateGuest(selectedUser._id, editForm)
    if (result.success) {
      setShowEditModal(false)
      setSelectedUser(null)
    }
  }

  const stats = {
    total: guests.length,
    active: guests.filter(u => u.isActive).length,
    vip: guests.filter(u => u.role === 'vip').length,
    totalPoints: guests.reduce((acc, u) => acc + (u.loyaltyPoints || 0), 0)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage hotel guests and their accounts</p>
        </div>
        <Button>Export Users</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold">{stats.total}</p>
            <p className="text-sm text-muted-foreground">Total Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-green-600">{stats.active}</p>
            <p className="text-sm text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-amber-600">{stats.vip}</p>
            <p className="text-sm text-muted-foreground">VIP Members</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-primary">{stats.totalPoints.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Total Points</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              options={[
                { value: 'all', label: 'All Roles' },
                { value: 'guest', label: 'Guest' },
                { value: 'vip', label: 'VIP' }
              ]}
            />
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' }
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-accent/30">
                  <th className="text-left py-3 px-4 font-medium">User</th>
                  <th className="text-left py-3 px-4 font-medium">Contact</th>
                  <th className="text-left py-3 px-4 font-medium">Role</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Points</th>
                  <th className="text-left py-3 px-4 font-medium">Bookings</th>
                  <th className="text-left py-3 px-4 font-medium">Joined</th>
                  <th className="text-right py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="border-b border-border/50 hover:bg-accent/20">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar alt={`${user.firstName} ${user.lastName}`} size="sm" />
                        <span className="font-medium">{user.firstName} {user.lastName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-sm">{user.email}</p>
                        <p className="text-sm text-muted-foreground">{user.phone}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">{getRoleBadge(user.role)}</td>
                    <td className="py-3 px-4">{getStatusBadge(user.isActive)}</td>
                    <td className="py-3 px-4 font-medium">{(user.loyaltyPoints || 0).toLocaleString()}</td>
                    <td className="py-3 px-4">{user.totalBookings || 0}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{formatDate(user.createdAt)}</td>
                    <td className="py-3 px-4 text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)}>
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {(filteredUsers.length === 0 && !isLoading) && (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No users found</p>
            </div>
          )}
          {isLoading && (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">Loading guests...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit User Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedUser(null)
        }}
        title="Edit User"
      >
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={editForm.firstName || ''}
              onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
            />
            <Input
              label="Last Name"
              value={editForm.lastName || ''}
              onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
            />
          </div>
          <Input
            label="Email"
            type="email"
            value={editForm.email || ''}
            onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
          />
          <Input
            label="Phone"
            value={editForm.phone || ''}
            onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Role"
              value={editForm.role || 'guest'}
              onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value }))}
              options={[
                { value: 'guest', label: 'Guest' },
                { value: 'vip', label: 'VIP' }
              ]}
            />
            <Select
              label="Status"
              value={editForm.isActive ? 'active' : 'inactive'}
              onChange={(e) => setEditForm(prev => ({ ...prev, isActive: e.target.value === 'active' }))}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' }
              ]}
            />
          </div>
          <div className="flex gap-3 mt-4">
            <Button onClick={handleSaveUser} className="flex-1" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}