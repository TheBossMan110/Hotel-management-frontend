import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authAPI } from '../lib/api'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Initialize auth state from localStorage
      initAuth: async () => {
        const token = localStorage.getItem('accessToken')
        if (token) {
          try {
            set({ isLoading: true })
            const { data } = await authAPI.getMe()
            set({ user: data.user, isAuthenticated: true, isLoading: false })
          } catch (error) {
            localStorage.removeItem('accessToken')
            set({ user: null, isAuthenticated: false, isLoading: false })
          }
        }
      },

      login: async (email, password) => {
        set({ isLoading: true, error: null })
        
        try {
          const { data } = await authAPI.login(email, password)
          
          // Store token
          localStorage.setItem('accessToken', data.accessToken)
          
          set({ 
            user: data.user, 
            isAuthenticated: true, 
            isLoading: false 
          })
          
          return { success: true, user: data.user }
        } catch (error) {
          const message = error.response?.data?.message || 'Login failed'
          set({ error: message, isLoading: false })
          return { success: false, error: message }
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null })
        
        try {
          const { data } = await authAPI.register(userData)
          
          // Store token
          localStorage.setItem('accessToken', data.accessToken)
          
          set({ 
            user: data.user, 
            isAuthenticated: true, 
            isLoading: false 
          })
          
          return { success: true, user: data.user }
        } catch (error) {
          const message = error.response?.data?.message || 'Registration failed'
          set({ error: message, isLoading: false })
          return { success: false, error: message }
        }
      },

      logout: async () => {
        try {
          await authAPI.logout()
        } catch (error) {
          // Continue with logout even if API fails
          console.error('Logout API error:', error)
        }
        
        localStorage.removeItem('accessToken')
        set({ user: null, isAuthenticated: false, error: null })
      },

      updateProfile: async (updates) => {
        set({ isLoading: true })
        
        try {
          const { data } = await authAPI.updateProfile(updates)
          set({ user: data.user, isLoading: false })
          return { success: true }
        } catch (error) {
          set({ isLoading: false })
          return { success: false, error: error.response?.data?.message }
        }
      },

      updatePassword: async (currentPassword, newPassword) => {
        set({ isLoading: true, error: null })
        
        try {
          await authAPI.updatePassword(currentPassword, newPassword)
          set({ isLoading: false })
          return { success: true }
        } catch (error) {
          const message = error.response?.data?.message || 'Password update failed'
          set({ error: message, isLoading: false })
          return { success: false, error: message }
        }
      },

      clearError: () => set({ error: null }),

      // Helper to check roles
      hasRole: (roles) => {
        const user = get().user
        if (!user) return false
        if (typeof roles === 'string') return user.role === roles
        return roles.includes(user.role)
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      })
    }
  )
)

export default useAuthStore
