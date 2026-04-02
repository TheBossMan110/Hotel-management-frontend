import { create } from 'zustand'
import { tasksAPI, usersAPI } from '../lib/api'

export const useStaffStore = create((set, get) => ({
  staff: [],
  tasks: [],
  myTasks: [],
  pagination: { page: 1, limit: 20, total: 0, pages: 0 },
  isLoading: false,
  error: null,

  // ─── Staff Management ──────────────────────────────────────────────────────

  fetchStaff: async (department) => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await usersAPI.getStaff(department)
      set({ staff: data.staff, isLoading: false })
      return data.staff
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch staff', isLoading: false })
      return []
    }
  },

  addStaff: async (staffData) => {
    set({ isLoading: true })
    try {
      const { data } = await usersAPI.createStaff(staffData)
      set(state => ({ staff: [...state.staff, data.user], isLoading: false }))
      return { success: true, user: data.user }
    } catch (error) {
      set({ isLoading: false })
      return { success: false, error: error.response?.data?.message || 'Failed to create staff' }
    }
  },

  updateStaff: async (staffId, updates) => {
    set({ isLoading: true })
    try {
      const { data } = await usersAPI.update(staffId, updates)
      set(state => ({
        staff: state.staff.map(s => s._id === staffId ? data.user : s),
        isLoading: false
      }))
      return { success: true, user: data.user }
    } catch (error) {
      set({ isLoading: false })
      return { success: false, error: error.response?.data?.message || 'Failed to update staff' }
    }
  },

  deactivateStaff: async (staffId) => {
    set({ isLoading: true })
    try {
      const { data } = await usersAPI.deactivate(staffId)
      set(state => ({
        staff: state.staff.map(s => s._id === staffId ? data.user : s),
        isLoading: false
      }))
      return { success: true }
    } catch (error) {
      set({ isLoading: false })
      return { success: false, error: error.response?.data?.message }
    }
  },

  activateStaff: async (staffId) => {
    set({ isLoading: true })
    try {
      const { data } = await usersAPI.activate(staffId)
      set(state => ({
        staff: state.staff.map(s => s._id === staffId ? data.user : s),
        isLoading: false
      }))
      return { success: true }
    } catch (error) {
      set({ isLoading: false })
      return { success: false, error: error.response?.data?.message }
    }
  },

  deleteStaff: async (staffId) => {
    set({ isLoading: true })
    try {
      await usersAPI.delete(staffId)
      set(state => ({
        staff: state.staff.filter(s => s._id !== staffId),
        isLoading: false
      }))
      return { success: true }
    } catch (error) {
      set({ isLoading: false })
      return { success: false, error: error.response?.data?.message }
    }
  },

  getStaffByDepartment: (department) => {
    return get().staff.filter(s => s.department === department)
  },

  // ─── Task Management ───────────────────────────────────────────────────────

  fetchTasks: async (params = {}) => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await tasksAPI.getAll(params)
      set({ tasks: data.tasks, pagination: data.pagination, isLoading: false })
      return data.tasks
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch tasks', isLoading: false })
      return []
    }
  },

  fetchMyTasks: async (params = {}) => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await tasksAPI.getMyTasks(params)
      set({ myTasks: data.tasks, isLoading: false })
      return data.tasks
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch my tasks', isLoading: false })
      return []
    }
  },

  createTask: async (taskData) => {
    set({ isLoading: true })
    try {
      const { data } = await tasksAPI.create(taskData)
      set(state => ({ tasks: [...state.tasks, data.task], isLoading: false }))
      return { success: true, task: data.task }
    } catch (error) {
      set({ isLoading: false })
      return { success: false, error: error.response?.data?.message || 'Failed to create task' }
    }
  },

  // Alias kept for backward compat
  addTask: async (taskData) => get().createTask(taskData),

  updateTask: async (taskId, updates) => {
    set({ isLoading: true })
    try {
      const { data } = await tasksAPI.update(taskId, updates)
      set(state => ({
        tasks: state.tasks.map(t => t._id === taskId ? data.task : t),
        myTasks: state.myTasks.map(t => t._id === taskId ? data.task : t),
        isLoading: false
      }))
      return { success: true, task: data.task }
    } catch (error) {
      set({ isLoading: false })
      return { success: false, error: error.response?.data?.message }
    }
  },

  updateTaskStatus: async (taskId, status) => {
    try {
      const { data } = await tasksAPI.updateStatus(taskId, status)
      set(state => ({
        tasks: state.tasks.map(t => t._id === taskId ? data.task : t),
        myTasks: state.myTasks.map(t => t._id === taskId ? data.task : t)
      }))
      return { success: true, task: data.task }
    } catch (error) {
      return { success: false, error: error.response?.data?.message }
    }
  },

  updateChecklistItem: async (taskId, itemIndex, completed) => {
    try {
      const { data } = await tasksAPI.updateChecklist(taskId, itemIndex, completed)
      set(state => ({
        tasks: state.tasks.map(t => t._id === taskId ? data.task : t),
        myTasks: state.myTasks.map(t => t._id === taskId ? data.task : t)
      }))
      return { success: true, task: data.task }
    } catch (error) {
      return { success: false, error: error.response?.data?.message }
    }
  },

  addTaskNote: async (taskId, content) => {
    try {
      const { data } = await tasksAPI.addNote(taskId, content)
      set(state => ({
        tasks: state.tasks.map(t => t._id === taskId ? { ...t, notes: data.notes } : t),
        myTasks: state.myTasks.map(t => t._id === taskId ? { ...t, notes: data.notes } : t)
      }))
      return { success: true, notes: data.notes }
    } catch (error) {
      return { success: false, error: error.response?.data?.message }
    }
  },

  deleteTask: async (taskId) => {
    try {
      await tasksAPI.delete(taskId)
      set(state => ({
        tasks: state.tasks.filter(t => t._id !== taskId),
        myTasks: state.myTasks.filter(t => t._id !== taskId)
      }))
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.message }
    }
  },

  completeTask: async (taskId) => get().updateTaskStatus(taskId, 'completed'),

  assignTask: async (taskId, staffId) => get().updateTask(taskId, { assignedTo: staffId }),

  // ─── Selectors (ID-safe for both _id and id) ──────────────────────────────

  getStaffTasks: (staffId) => {
    if (!staffId) return []
    return get().myTasks.length > 0
      ? get().myTasks
      : get().tasks.filter(t =>
          t.assignedTo === staffId ||
          (t.assignedTo && (t.assignedTo._id === staffId || t.assignedTo === staffId))
        )
  },

  getTasksByType: (type) => get().tasks.filter(t => t.type === type),

  getPendingTasks: () => get().tasks.filter(t => t.status === 'pending'),

  getTaskStats: () => {
    const tasks = get().tasks
    return {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'pending').length,
      inProgress: tasks.filter(t => t.status === 'in-progress').length,
      completed: tasks.filter(t => t.status === 'completed').length
    }
  },

  getStaffStats: () => {
    const staff = get().staff
    return {
      total: staff.length,
      active: staff.filter(s => s.isActive).length,
      housekeeping: staff.filter(s => s.department === 'housekeeping').length,
      maintenance: staff.filter(s => s.department === 'maintenance').length,
      frontDesk: staff.filter(s => s.department === 'front-desk').length
    }
  }
}))

export default useStaffStore
