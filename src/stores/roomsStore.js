import { create } from 'zustand'
import { roomsAPI } from '../lib/api'

export const useRoomsStore = create((set, get) => ({
  rooms: [],
  selectedRoom: null,
  filters: {
    type: '',
    status: '',
    priceRange: [0, 1000000],
    amenities: [],
    checkIn: null,
    checkOut: null
  },
  pagination: {
    page: 1,
    limit: 100,
    total: 0,
    pages: 0
  },
  isLoading: false,
  error: null,

  // Fetch rooms from API
  fetchRooms: async (params = {}) => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await roomsAPI.getAll({
        ...get().filters,
        ...params,
        page: params.page || get().pagination.page,
        limit: params.limit || get().pagination.limit
      })
      set({ 
        rooms: data.rooms, 
        pagination: data.pagination,
        isLoading: false 
      })
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch rooms', isLoading: false })
    }
  },

  // Fetch single room
  fetchRoom: async (roomId) => {
    set({ isLoading: true })
    try {
      const { data } = await roomsAPI.getById(roomId)
      set({ selectedRoom: data.room, isLoading: false })
      return data.room
    } catch (error) {
      set({ error: error.response?.data?.message, isLoading: false })
      return null
    }
  },

  selectRoom: (roomId) => {
    const room = get().rooms.find(r => r.id === roomId || r._id === roomId)
    set({ selectedRoom: room })
  },

  clearSelectedRoom: () => set({ selectedRoom: null }),

  setFilters: (newFilters) => {
    set({ filters: { ...get().filters, ...newFilters } })
  },

  resetFilters: () => {
    set({
      filters: {
        type: '',
        status: '',
        priceRange: [0, 1000000],
        amenities: [],
        checkIn: null,
        checkOut: null
      }
    })
  },

  getFilteredRooms: () => {
    const { rooms, filters } = get()
    
    return rooms.filter(room => {
      const price = room.price?.basePrice || room.price
      if (filters.type && room.type !== filters.type) return false
      if (filters.status && room.status !== filters.status) return false
      if (price < filters.priceRange[0] || price > filters.priceRange[1]) return false
      if (filters.amenities.length > 0) {
        const hasAllAmenities = filters.amenities.every(a => room.amenities?.includes(a))
        if (!hasAllAmenities) return false
      }
      return true
    })
  },

  // Check room availability
  checkAvailability: async (roomId, checkIn, checkOut) => {
    try {
      const { data } = await roomsAPI.checkAvailability(roomId, checkIn, checkOut)
      return data
    } catch (error) {
      return { available: false, error: error.response?.data?.message }
    }
  },

  // Create room (admin)
  createRoom: async (roomData) => {
    set({ isLoading: true })
    try {
      const { data } = await roomsAPI.create(roomData)
      set(state => ({
        rooms: [...state.rooms, data.room],
        isLoading: false
      }))
      return { success: true, room: data.room }
    } catch (error) {
      set({ isLoading: false })
      return { success: false, error: error.response?.data?.message }
    }
  },

  // Update room
  updateRoom: async (roomId, updates) => {
    set({ isLoading: true })
    try {
      const { data } = await roomsAPI.update(roomId, updates)
      set(state => ({
        rooms: state.rooms.map(room =>
          room._id === roomId ? data.room : room
        ),
        isLoading: false
      }))
      return { success: true, room: data.room }
    } catch (error) {
      set({ isLoading: false })
      return { success: false, error: error.response?.data?.message }
    }
  },

  // Update room status
  updateRoomStatus: async (roomId, status, cleaningStatus) => {
    try {
      const { data } = await roomsAPI.updateStatus(roomId, status, cleaningStatus)
      set(state => ({
        rooms: state.rooms.map(room =>
          room._id === roomId ? data.room : room
        )
      }))
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.message }
    }
  },

  // Delete room
  deleteRoom: async (roomId) => {
    set({ isLoading: true })
    try {
      await roomsAPI.delete(roomId)
      set(state => ({
        rooms: state.rooms.filter(room => room._id !== roomId),
        isLoading: false
      }))
      return { success: true }
    } catch (error) {
      set({ isLoading: false })
      return { success: false, error: error.response?.data?.message }
    }
  },

  getRoomsByStatus: (status) => {
    return get().rooms.filter(room => room.status === status)
  },

  getRoomStats: () => {
    const rooms = get().rooms
    return {
      total: rooms.length,
      available: rooms.filter(r => r.status === 'available').length,
      occupied: rooms.filter(r => r.status === 'occupied').length,
      maintenance: rooms.filter(r => r.status === 'maintenance').length,
      cleaning: rooms.filter(r => r.status === 'cleaning').length
    }
  }
}))

export default useRoomsStore
