import { create } from 'zustand'
import { io } from 'socket.io-client'
import api, { notificationsAPI } from '../lib/api'
import useAuthStore from './authStore'

let socket = null

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  pagination: { page: 1, limit: 20, total: 0, pages: 0 },
  isLoading: false,
  error: null,

  initSocket: () => {
    const token = localStorage.getItem('accessToken')
    if (!token) return

    if (socket) {
      socket.disconnect()
    }

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
    const socketUrl = API_URL.replace('/api', '')

    socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'] // Prefer websocket
    })

    socket.on('connect', () => {
      console.log('Real-time notifications connected')
    })

    socket.on('notification', () => {
      // Whenever a real-time push arrives, fetch fresh count and latest updates
      get().fetchUnreadCount()
      get().fetchNotifications({ limit: 15 })
    })

    socket.on('new-booking', () => {
      // Admin/Staff specific event
      get().fetchUnreadCount()
      get().fetchNotifications({ limit: 15 })
    })
  },

  disconnectSocket: () => {
    if (socket) {
      socket.disconnect()
      socket = null
    }
  },

  fetchNotifications: async (params = {}) => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await notificationsAPI.getAll(params)
      set({
        notifications: data.data,
        unreadCount: data.unreadCount,
        pagination: data.pagination,
        isLoading: false
      })
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch notifications', isLoading: false })
    }
  },

  fetchUnreadCount: async () => {
    try {
      const { data } = await notificationsAPI.getUnreadCount()
      set({ unreadCount: data.data.count })
    } catch (error) {
      console.error('Fetch unread count error:', error)
    }
  },

  markRead: async (id) => {
    try {
      await notificationsAPI.markRead(id)
      set(state => ({
        notifications: state.notifications.map(n =>
          n._id === id ? { ...n, isRead: true, readAt: new Date() } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      }))
    } catch (error) {
      console.error('Mark read error:', error)
    }
  },

  markAllRead: async () => {
    try {
      await notificationsAPI.markAllRead()
      set(state => ({
        notifications: state.notifications.map(n => ({ ...n, isRead: true, readAt: new Date() })),
        unreadCount: 0
      }))
    } catch (error) {
      console.error('Mark all read error:', error)
    }
  },

  deleteNotification: async (id) => {
    try {
      await notificationsAPI.delete(id)
      set(state => ({
        notifications: state.notifications.filter(n => n._id !== id),
        unreadCount: state.notifications.find(n => n._id === id && !n.isRead)
          ? state.unreadCount - 1 : state.unreadCount
      }))
    } catch (error) {
      console.error('Delete notification error:', error)
    }
  },

  broadcast: async (data) => {
    try {
      const { data: result } = await notificationsAPI.broadcast(data)
      return { success: true, recipientCount: result.data.recipientCount }
    } catch (error) {
      return { success: false, error: error.response?.data?.message }
    }
  }
}))

export default useNotificationStore
