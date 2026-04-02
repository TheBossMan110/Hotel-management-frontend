import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const { data } = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        // Store new access token
        localStorage.setItem('accessToken', data.accessToken);

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear auth state
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  refreshToken: () => api.post('/auth/refresh'),
  updatePassword: (currentPassword, newPassword) => 
    api.put('/auth/password', { currentPassword, newPassword }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  updateProfile: async (updates) => {
    const { data: meData } = await api.get('/auth/me');
    const userId = meData.user._id || meData.user.id;
    return api.put(`/users/${userId}`, updates);
  }
};

// Rooms API
export const roomsAPI = {
  getAll: (params) => api.get('/rooms', { params }),
  getById: (id) => api.get(`/rooms/${id}`),
  getTypes: () => api.get('/rooms/types'),
  checkAvailability: (id, checkIn, checkOut) => 
    api.get(`/rooms/${id}/availability`, { params: { checkIn, checkOut } }),
  create: (data) => api.post('/rooms', data),
  update: (id, data) => api.put(`/rooms/${id}`, data),
  updateStatus: (id, status, cleaningStatus) => 
    api.patch(`/rooms/${id}/status`, { status, cleaningStatus }),
  delete: (id) => api.delete(`/rooms/${id}`)
};

// Bookings API
export const bookingsAPI = {
  getAll: (params) => api.get('/bookings', { params }),
  getMyBookings: (params) => api.get('/bookings/my-bookings', { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  create: (data) => api.post('/bookings', data),
  updateStatus: (id, status) => api.patch(`/bookings/${id}/status`, { status }),
  cancel: (id, reason) => api.post(`/bookings/${id}/cancel`, { reason }),
  addNote: (id, content) => api.post(`/bookings/${id}/notes`, { content }),
  updatePayment: (id, data) => api.patch(`/bookings/${id}/payment`, data)
};

// Users API
export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getStaff: (department) => api.get('/users/staff', { params: { department } }),
  getGuests: (params) => api.get('/users/guests', { params }),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  createStaff: (data) => api.post('/users/staff', data),
  deactivate: (id) => api.patch(`/users/${id}/deactivate`),
  activate: (id) => api.patch(`/users/${id}/activate`),
  delete: (id) => api.delete(`/users/${id}`)
};

// Invoices API
export const invoicesAPI = {
  getAll: (params) => api.get('/invoices', { params }),
  getMyInvoices: (params) => api.get('/invoices/my-invoices', { params }),
  getById: (id) => api.get(`/invoices/${id}`),
  create: (data) => api.post('/invoices', data),
  addItem: (id, item) => api.post(`/invoices/${id}/items`, item),
  recordPayment: (id, amount, method) => 
    api.post(`/invoices/${id}/payment`, { amount, method }),
  send: (id) => api.post(`/invoices/${id}/send`),
  downloadPDF: (id) => api.get(`/invoices/${id}/pdf`, { responseType: 'blob' })
};

// Feedback API
export const feedbackAPI = {
  getAll: (params) => api.get('/feedback', { params }),
  getPublic: (params) => api.get('/feedback/public', { params }),
  getMyFeedback: () => api.get('/feedback/my-feedback'),
  submit: (data) => api.post('/feedback', data),
  updateStatus: (id, status) => api.patch(`/feedback/${id}/status`, { status }),
  respond: (id, content) => api.post(`/feedback/${id}/respond`, { content }),
  markHelpful: (id) => api.post(`/feedback/${id}/helpful`)
};

// Tasks API
export const tasksAPI = {
  getAll: (params) => api.get('/tasks', { params }),
  getMyTasks: (params) => api.get('/tasks/my-tasks', { params }),
  getStats: () => api.get('/tasks/stats'),
  getById: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  updateStatus: (id, status) => api.patch(`/tasks/${id}/status`, { status }),
  updateChecklist: (id, itemIndex, completed) => 
    api.patch(`/tasks/${id}/checklist/${itemIndex}`, { completed }),
  addNote: (id, content) => api.post(`/tasks/${id}/notes`, { content }),
  delete: (id) => api.delete(`/tasks/${id}`)
};

// Analytics API
export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getRevenue: (params) => api.get('/analytics/revenue', { params }),
  getOccupancy: (params) => api.get('/analytics/occupancy', { params }),
  getBookingSources: () => api.get('/analytics/booking-sources'),
  getGuestAnalytics: () => api.get('/analytics/guests')
};

// Settings API
export const settingsAPI = {
  get: () => api.get('/settings'),
  getPublic: () => api.get('/settings/public'),
  updateHotelInfo: (data) => api.put('/settings/hotel-info', data),
  updateBooking: (data) => api.put('/settings/booking', data),
  updatePricing: (data) => api.put('/settings/pricing', data),
  updateNotifications: (data) => api.put('/settings/notifications', data),
  updateSecurity: (data) => api.put('/settings/security', data),
  updateIntegrations: (data) => api.put('/settings/integrations', data),
  updateProfile: (data) => api.put('/settings/profile', data),
  changePassword: (data) => api.post('/settings/password', data),
  toggleMaintenance: (enabled, message) => 
    api.post('/settings/maintenance', { enabled, message })
};

// ─── NEW APIs ─────────────────────────────────────────────────────────────────

// Maintenance API
export const maintenanceAPI = {
  getAll: (params) => api.get('/maintenance', { params }),
  getMyRequests: (status) => api.get('/maintenance/my-requests', { params: { status } }),
  getById: (id) => api.get(`/maintenance/${id}`),
  create: (data) => api.post('/maintenance', data),
  update: (id, data) => api.put(`/maintenance/${id}`, data),
  addNote: (id, content) => api.post(`/maintenance/${id}/notes`, { content })
};

// Service Requests API
export const serviceRequestsAPI = {
  getCatalog: (params) => api.get('/services/catalog', { params }),
  createService: (data) => api.post('/services/catalog', data),
  updateService: (id, data) => api.put(`/services/catalog/${id}`, data),
  deleteService: (id) => api.delete(`/services/catalog/${id}`),
  getAll: (params) => api.get('/services/requests', { params }),
  getMyRequests: () => api.get('/services/my-requests'),
  create: (data) => api.post('/services/requests', data),
  updateStatus: (id, status) => api.put(`/services/requests/${id}/status`, { status })
};

// Notifications API
export const notificationsAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  broadcast: (data) => api.post('/notifications/broadcast', data),
  delete: (id) => api.delete(`/notifications/${id}`)
};

// Email API
export const emailAPI = {
  send: (data) => api.post('/email/send', data)
};

// Chatbot API
export const chatbotAPI = {
  sendMessage: (message, sessionId) => api.post('/chatbot/message', { message, sessionId }),
  getHistory: (sessionId) => api.get(`/chatbot/history/${sessionId}`)
};

export default api;
