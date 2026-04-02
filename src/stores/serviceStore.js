import { create } from 'zustand'
import { serviceRequestsAPI } from '../lib/api'

export const useServiceStore = create((set, get) => ({
  services: [],
  myRequests: [],
  allRequests: [],
  isLoading: false,
  error: null,

  fetchCatalog: async (params = {}) => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await serviceRequestsAPI.getCatalog(params)
      set({ services: data.data, isLoading: false })
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch services', isLoading: false })
    }
  },

  fetchMyRequests: async () => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await serviceRequestsAPI.getMyRequests()
      set({ myRequests: data.data, isLoading: false })
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch requests', isLoading: false })
    }
  },

  fetchAllRequests: async (params = {}) => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await serviceRequestsAPI.getAll(params)
      set({ allRequests: data.data, isLoading: false })
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch requests', isLoading: false })
    }
  },

  createRequest: async (requestData) => {
    set({ isLoading: true })
    try {
      const { data } = await serviceRequestsAPI.create(requestData)
      set(state => ({ myRequests: [data.data, ...state.myRequests], isLoading: false }))
      return { success: true, data: data.data }
    } catch (error) {
      set({ isLoading: false })
      return { success: false, error: error.response?.data?.message || 'Failed to submit request' }
    }
  },

  updateStatus: async (id, status) => {
    try {
      const { data } = await serviceRequestsAPI.updateStatus(id, status)
      set(state => ({
        allRequests: state.allRequests.map(r => r._id === id ? data.data : r)
      }))
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.message }
    }
  }
}))

export default useServiceStore
