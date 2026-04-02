import { create } from 'zustand'
import { bookingsAPI } from '../lib/api'
import { generateId } from '../lib/utils'

export const useBookingsStore = create((set, get) => ({
  bookings: [],
  myBookings: [],
  currentBooking: null,
  bookingDraft: {
    roomId: null,
    checkIn: null,
    checkOut: null,
    guests: { adults: 1, children: 0 },
    specialRequests: '',
    addOns: []
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  },
  isLoading: false,
  error: null,

  // Fetch all bookings (admin/staff)
  fetchBookings: async (params = {}) => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await bookingsAPI.getAll(params)
      set({ 
        bookings: data.bookings, 
        pagination: data.pagination,
        isLoading: false 
      })
    } catch (error) {
      set({ error: error.response?.data?.message, isLoading: false })
    }
  },

  // Fetch my bookings (guest)
  fetchMyBookings: async (params = {}) => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await bookingsAPI.getMyBookings({ limit: 100, ...params })
      set({ 
        myBookings: data.bookings, 
        pagination: data.pagination,
        isLoading: false 
      })
    } catch (error) {
      set({ error: error.response?.data?.message, isLoading: false })
    }
  },

  // Fetch single booking
  fetchBooking: async (bookingId) => {
    set({ isLoading: true })
    try {
      const { data } = await bookingsAPI.getById(bookingId)
      set({ currentBooking: data.booking, isLoading: false })
      return data.booking
    } catch (error) {
      set({ error: error.response?.data?.message, isLoading: false })
      return null
    }
  },

  setCurrentBooking: (booking) => set({ currentBooking: booking }),

  updateBookingDraft: (updates) => {
    set(state => ({
      bookingDraft: { ...state.bookingDraft, ...updates }
    }))
  },

  resetBookingDraft: () => {
    set({
      bookingDraft: {
        roomId: null,
        checkIn: null,
        checkOut: null,
        guests: { adults: 1, children: 0 },
        specialRequests: '',
        addOns: []
      }
    })
  },

  // Create booking
  createBooking: async (bookingData) => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await bookingsAPI.create(bookingData)
      set(state => ({
        bookings: [...state.bookings, data.booking],
        currentBooking: data.booking,
        isLoading: false
      }))
      return { success: true, booking: data.booking }
    } catch (error) {
      set({ error: error.response?.data?.message, isLoading: false })
      return { success: false, error: error.response?.data?.message }
    }
  },

  // Update booking status (admin/staff)
  updateBookingStatus: async (bookingId, status) => {
    try {
      const { data } = await bookingsAPI.updateStatus(bookingId, status)
      set(state => ({
        bookings: state.bookings.map(b =>
          b._id === bookingId ? data.booking : b
        )
      }))
      return { success: true, booking: data.booking }
    } catch (error) {
      return { success: false, error: error.response?.data?.message }
    }
  },

  // Cancel booking
  cancelBooking: async (bookingId, reason) => {
    try {
      const { data } = await bookingsAPI.cancel(bookingId, reason)
      set(state => ({
        bookings: state.bookings.map(b =>
          b._id === bookingId ? data.booking : b
        ),
        myBookings: state.myBookings.map(b =>
          b._id === bookingId ? data.booking : b
        )
      }))
      return { success: true, refundAmount: data.refundAmount }
    } catch (error) {
      return { success: false, error: error.response?.data?.message }
    }
  },

  // Check in
  checkIn: async (bookingId) => {
    return get().updateBookingStatus(bookingId, 'checked-in')
  },

  // Check out
  checkOut: async (bookingId) => {
    return get().updateBookingStatus(bookingId, 'checked-out')
  },

  // Add note to booking
  addNote: async (bookingId, content) => {
    try {
      const { data } = await bookingsAPI.addNote(bookingId, content)
      return { success: true, notes: data.notes }
    } catch (error) {
      return { success: false, error: error.response?.data?.message }
    }
  },

  // Update payment
  updatePayment: async (bookingId, paymentData) => {
    try {
      const { data } = await bookingsAPI.updatePayment(bookingId, paymentData)
      set(state => ({
        bookings: state.bookings.map(b =>
          b._id === bookingId ? data.booking : b
        )
      }))
      return { success: true, booking: data.booking }
    } catch (error) {
      return { success: false, error: error.response?.data?.message }
    }
  },

  getBookingsByGuest: (guestId) => {
    return get().bookings.filter(booking => 
      booking.guestId === guestId || booking.guest?._id === guestId
    )
  },

  getBookingsByRoom: (roomId) => {
    return get().bookings.filter(booking => 
      booking.roomId === roomId || booking.room?._id === roomId
    )
  },

  getBookingsByStatus: (status) => {
    return get().bookings.filter(booking => booking.status === status)
  },

  getTodayCheckIns: () => {
    const today = new Date().toISOString().split('T')[0]
    return get().bookings.filter(booking => {
      const checkInDate = new Date(booking.checkIn).toISOString().split('T')[0]
      return checkInDate === today && booking.status === 'confirmed'
    })
  },

  getTodayCheckOuts: () => {
    const today = new Date().toISOString().split('T')[0]
    return get().bookings.filter(booking => {
      const checkOutDate = new Date(booking.checkOut).toISOString().split('T')[0]
      return checkOutDate === today && booking.status === 'checked-in'
    })
  },

  getBookingStats: () => {
    const bookings = get().bookings
    const now = new Date()
    const thisMonth = bookings.filter(b => {
      const date = new Date(b.createdAt)
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
    })

    return {
      total: bookings.length,
      confirmed: bookings.filter(b => b.status === 'confirmed').length,
      checkedIn: bookings.filter(b => b.status === 'checked-in').length,
      completed: bookings.filter(b => b.status === 'checked-out').length,
      cancelled: bookings.filter(b => b.status === 'cancelled').length,
      thisMonth: thisMonth.length,
      revenue: bookings.reduce((sum, b) => sum + (b.pricing?.total || b.totalAmount || 0), 0)
    }
  }
}))

export default useBookingsStore
