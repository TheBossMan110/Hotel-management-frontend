import { create } from 'zustand'
import { usersAPI } from '../lib/api'

export const useGuestStore = create((set, get) => ({
  guests: [],
  pagination: { page: 1, limit: 20, total: 0, pages: 0 },
  isLoading: false,
  error: null,

  fetchGuests: async (params = {}) => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await usersAPI.getGuests(params)
      set({ 
        guests: data.guests, 
        pagination: data.pagination, 
        isLoading: false 
      })
      return data.guests
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch guests', 
        isLoading: false 
      })
      return []
    }
  },

  updateGuest: async (guestId, updates) => {
    set({ isLoading: true })
    try {
      const { data } = await usersAPI.update(guestId, updates)
      set(state => ({
        guests: state.guests.map(g => g._id === guestId ? data.user || data.guest : g),
        isLoading: false
      }))
      return { success: true, user: data.user || data.guest }
    } catch (error) {
      set({ isLoading: false })
      return { success: false, error: error.response?.data?.message || 'Failed to update guest' }
    }
  },

  deleteGuest: async (guestId) => {
    set({ isLoading: true })
    try {
      await usersAPI.delete(guestId)
      set(state => ({
        guests: state.guests.filter(g => g._id !== guestId),
        isLoading: false
      }))
      return { success: true }
    } catch (error) {
      set({ isLoading: false })
      return { success: false, error: error.response?.data?.message || 'Failed to delete guest' }
    }
  }
}))

export default useGuestStore
