import { create } from 'zustand'
import { maintenanceAPI } from '../lib/api'

export const useMaintenanceStore = create((set, get) => ({
  requests: [],
  myRequests: [],
  stats: {},
  pagination: { page: 1, limit: 20, total: 0, pages: 0 },
  isLoading: false,
  error: null,

  fetchRequests: async (params = {}) => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await maintenanceAPI.getAll(params)
      set({
        requests: data.data.requests,
        stats: data.data.stats,
        pagination: data.pagination,
        isLoading: false
      })
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch requests', isLoading: false })
    }
  },

  fetchMyRequests: async (status) => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await maintenanceAPI.getMyRequests(status)
      set({ myRequests: data.data, isLoading: false })
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch requests', isLoading: false })
    }
  },

  createRequest: async (requestData) => {
    set({ isLoading: true })
    try {
      const { data } = await maintenanceAPI.create(requestData)
      set(state => ({ requests: [...state.requests, data.data], isLoading: false }))
      return { success: true, data: data.data }
    } catch (error) {
      set({ isLoading: false })
      return { success: false, error: error.response?.data?.message || 'Failed to create request' }
    }
  },

  updateRequest: async (id, updates) => {
    try {
      const { data } = await maintenanceAPI.update(id, updates)
      set(state => ({
        requests: state.requests.map(r => r._id === id ? data.data : r),
        myRequests: state.myRequests.map(r => r._id === id ? data.data : r)
      }))
      return { success: true, data: data.data }
    } catch (error) {
      return { success: false, error: error.response?.data?.message }
    }
  }
}))

export default useMaintenanceStore
