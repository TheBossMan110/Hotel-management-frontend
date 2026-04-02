import { useState, useEffect } from 'react'
import { useStaffStore } from '../../stores/staffStore'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Badge from '../../components/ui/Badge'
import Avatar from '../../components/ui/Avatar'
import Modal from '../../components/ui/Modal'
import Select from '../../components/ui/Select'

export default function AdminStaff() {
  const { staff, fetchStaff, addStaff, updateStaff, deleteStaff, isLoading } = useStaffStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDepartment, setFilterDepartment] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingStaff, setEditingStaff] = useState(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: 'housekeeping',
    position: '',
    status: 'active',
    shift: 'morning',
    password: ''
  })

  useEffect(() => {
    fetchStaff()
  }, [])

  const departments = ['housekeeping', 'front-desk', 'maintenance', 'food-service', 'security', 'management']
  const shifts = ['morning', 'afternoon', 'night']

  const filteredStaff = staff.filter(member => {
    const fullName = `${member.firstName || ''} ${member.lastName || ''}`.toLowerCase()
    const matchesSearch = 
      fullName.includes(searchTerm.toLowerCase()) ||
      (member.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDept = filterDepartment === 'all' || member.department === filterDepartment
    const matchesStatus = filterStatus === 'all' || member.status === filterStatus
    return matchesSearch && matchesDept && matchesStatus
  })

  const getDepartmentBadge = (dept) => {
    const colors = {
      housekeeping: 'bg-blue-100 text-blue-700',
      'front-desk': 'bg-green-100 text-green-700',
      maintenance: 'bg-amber-100 text-amber-700',
      'food-service': 'bg-purple-100 text-purple-700',
      security: 'bg-red-100 text-red-700',
      management: 'bg-gray-100 text-gray-700'
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[dept] || 'bg-gray-100'}`}>
        {(dept || '').replace('-', ' ')}
      </span>
    )
  }

  const handleAddStaff = async () => {
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      alert('Email, Password, First Name and Last Name are required')
      return
    }
    const result = await addStaff(formData)
    if (result.success) {
      setShowAddModal(false)
      resetForm()
    } else {
      alert(result.error || 'Failed to add staff member')
    }
  }

  const handleUpdateStaff = async () => {
    const result = await updateStaff(editingStaff._id, formData)
    if (result.success) {
      setEditingStaff(null)
      resetForm()
    }
  }

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      department: 'housekeeping',
      position: '',
      status: 'active',
      shift: 'morning',
      password: ''
    })
  }

  const openEditModal = (member) => {
    setFormData({
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      phone: member.phone || '',
      department: member.department,
      position: member.position || '',
      status: member.status,
      shift: member.shift || 'morning',
      password: '' // Don't show/require password on edit
    })
    setEditingStaff(member)
  }

  // Compute department distribution dynamically from actual staff data
  const deptCounts = staff.reduce((acc, s) => {
    const dept = s.department || 'other'
    acc[dept] = (acc[dept] || 0) + 1
    return acc
  }, {})
  const dynamicByDept = Object.entries(deptCounts).map(([name, count]) => ({ name, count }))

  const stats = {
    total: staff.length,
    active: staff.filter(s => s.status === 'active').length,
    onDuty: staff.filter(s => s.status === 'on-duty').length,
    byDept: dynamicByDept
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold">Staff Management</h1>
          <p className="text-muted-foreground">Manage hotel staff and schedules</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>Add Staff Member</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold">{stats.total}</p>
            <p className="text-sm text-muted-foreground">Total Staff</p>
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
            <p className="text-3xl font-bold text-blue-600">{stats.onDuty}</p>
            <p className="text-sm text-muted-foreground">On Duty</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-amber-600">{departments.length}</p>
            <p className="text-sm text-muted-foreground">Departments</p>
          </CardContent>
        </Card>
      </div>

      {/* Department Overview — only shown when staff data exists */}
      {stats.byDept.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Department Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-${Math.min(stats.byDept.length, 6)} gap-4`}>
              {stats.byDept.map((dept) => (
                <div key={dept.name} className="text-center p-3 bg-accent/30 rounded-lg">
                  <p className="text-xl font-bold">{dept.count}</p>
                  <p className="text-xs text-muted-foreground capitalize">{dept.name.replace(/-/g, ' ')}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search staff..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              options={[
                { value: 'all', label: 'All Departments' },
                ...departments.map(d => ({ value: d, label: d.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) }))
              ]}
            />
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'active', label: 'Active' },
                { value: 'on-duty', label: 'On Duty' },
                { value: 'off-duty', label: 'Off Duty' },
                { value: 'on-leave', label: 'On Leave' }
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStaff.map((member) => (
          <Card key={member._id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <Avatar alt={`${member.firstName} ${member.lastName}`} size="lg" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold truncate">{member.firstName} {member.lastName}</h3>
                    <Badge variant={member.status === 'active' || member.status === 'on-duty' ? 'success' : 'secondary'}>
                      {member.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {member.email === 'manager@grandazure.pk' ? 'General Manager' : (member.position || 'Staff Member')}
                  </p>
                  <div className="mt-2">
                    {getDepartmentBadge(member.department)}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <p className="truncate">{member.email}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Shift:</span>
                    <p className="capitalize">{member.shift || 'Morning'}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => openEditModal(member)}>
                  Edit
                </Button>
                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteStaff(member._id)}>
                  Remove
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(filteredStaff.length === 0 && !isLoading) && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No staff members found</p>
          </CardContent>
        </Card>
      )}

      {isLoading && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Loading staff members...</p>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Staff Modal */}
      <Modal
        isOpen={showAddModal || !!editingStaff}
        onClose={() => {
          setShowAddModal(false)
          setEditingStaff(null)
          resetForm()
        }}
        title={editingStaff ? 'Edit Staff Member' : 'Add Staff Member'}
      >
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={formData.firstName}
              onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
            />
            <Input
              label="Last Name"
              value={formData.lastName}
              onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
            />
          </div>
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          />
          {!editingStaff && (
            <Input
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              placeholder="Min 8 characters"
            />
          )}
          <Input
            label="Phone"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          />
          <Input
            label="Position"
            value={formData.position}
            onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
            placeholder="e.g., Senior Housekeeper"
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Department"
              value={formData.department}
              onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
              options={departments.map(d => ({
                value: d,
                label: d.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
              }))}
            />
            <Select
              label="Shift"
              value={formData.shift}
              onChange={(e) => setFormData(prev => ({ ...prev, shift: e.target.value }))}
              options={shifts.map(s => ({
                value: s,
                label: s.charAt(0).toUpperCase() + s.slice(1)
              }))}
            />
          </div>
          <Select
            label="Status"
            value={formData.status}
            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'on-duty', label: 'On Duty' },
              { value: 'off-duty', label: 'Off Duty' },
              { value: 'on-leave', label: 'On Leave' }
            ]}
          />
          <div className="flex gap-3 mt-4">
            <Button onClick={editingStaff ? handleUpdateStaff : handleAddStaff} className="flex-1" disabled={isLoading}>
              {isLoading ? (editingStaff ? 'Updating...' : 'Adding...') : (editingStaff ? 'Update' : 'Add')} Staff Member
            </Button>
            <Button variant="outline" onClick={() => {
              setShowAddModal(false)
              setEditingStaff(null)
              resetForm()
            }} disabled={isLoading}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}