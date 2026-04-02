import { useState, useEffect, useRef, useCallback } from 'react'
import { Bell, Check, CheckCheck, Trash2, X } from 'lucide-react'
import useNotificationStore from '../../stores/notificationStore'
import useAuthStore from '../../stores/authStore'

const typeIcons = {
  booking: '📅',
  'check-in': '🏨',
  'check-out': '👋',
  payment: '💳',
  maintenance: '🔧',
  housekeeping: '🧹',
  'service-request': '🛎️',
  alert: '⚠️',
  system: '⚙️',
  promotion: '🎉'
}

const priorityColors = {
  low: 'border-l-gray-300',
  normal: 'border-l-blue-400',
  high: 'border-l-orange-400',
  urgent: 'border-l-red-500'
}

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const [bellRing, setBellRing] = useState(false)
  const [newFlash, setNewFlash] = useState(false)
  const dropdownRef = useRef(null)
  const prevCountRef = useRef(0)
  const { isAuthenticated } = useAuthStore()
  const {
    notifications, unreadCount, isLoading,
    fetchNotifications, fetchUnreadCount,
    markRead, markAllRead, deleteNotification,
    initSocket, disconnectSocket
  } = useNotificationStore()

  // Initialize Real-time WebSockets & Fallback Polling
  useEffect(() => {
    if (!isAuthenticated) return

    fetchUnreadCount()
    fetchNotifications({ limit: 15 })

    // Setup Socket.io
    initSocket()

    // Slower fallback poll (60s instead of 15s since we have WebSockets)
    const interval = setInterval(() => {
      fetchUnreadCount()
      fetchNotifications({ limit: 15 })
    }, 60000)

    return () => {
      clearInterval(interval)
      disconnectSocket()
    }
  }, [isAuthenticated])

  // Animate bell when unread count increases
  useEffect(() => {
    if (unreadCount > prevCountRef.current && prevCountRef.current !== 0) {
      setBellRing(true)
      setNewFlash(true)
      setTimeout(() => setBellRing(false), 1000)
      setTimeout(() => setNewFlash(false), 3000)
    }
    prevCountRef.current = unreadCount
  }, [unreadCount])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  if (!isAuthenticated) return null

  const handleOpen = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      fetchNotifications({ limit: 15 })
    }
  }

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000)
    if (seconds < 60) return 'just now'
    const mins = Math.floor(seconds / 60)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    const days = Math.floor(hrs / 24)
    return `${days}d ago`
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={handleOpen}
        className={`relative p-2 rounded-xl transition-all duration-200 hover:bg-white/10 focus:outline-none ${bellRing ? 'notification-bell-ring' : ''}`}
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold px-1 notification-badge-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* New notification flash */}
      {newFlash && !isOpen && (
        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-400 notification-new-flash" />
      )}

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-[380px] max-h-[520px] bg-[#1a1f2e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 notification-dropdown-enter">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-white/5">
            <div className="flex items-center gap-2">
              <h3 className="text-white font-semibold text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-red-500/20 text-red-400 text-xs px-2 py-0.5 rounded-full font-medium">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllRead()}
                  className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1 rounded-lg hover:bg-white/5 transition-colors"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="overflow-y-auto max-h-[420px] custom-scrollbar">
            {isLoading && notifications.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <Bell className="w-12 h-12 text-gray-600 mb-3" />
                <p className="text-gray-400 text-sm">No notifications yet</p>
                <p className="text-gray-500 text-xs mt-1">We'll notify you about important updates</p>
              </div>
            ) : (
              notifications.map((notif, index) => (
                <div
                  key={notif._id}
                  className={`group flex items-start gap-3 px-5 py-3.5 border-b border-white/5 transition-all duration-200 cursor-pointer border-l-[3px] ${priorityColors[notif.priority] || 'border-l-transparent'} ${
                    notif.isRead
                      ? 'bg-transparent hover:bg-white/[0.03]'
                      : 'bg-blue-500/5 hover:bg-blue-500/10'
                  }`}
                  style={{ animationDelay: `${index * 40}ms` }}
                  onClick={() => !notif.isRead && markRead(notif._id)}
                >
                  {/* Icon */}
                  <span className="text-lg mt-0.5 flex-shrink-0 notification-item-enter" style={{ animationDelay: `${index * 40}ms` }}>
                    {typeIcons[notif.type] || '🔔'}
                  </span>

                  {/* Content */}
                  <div className="flex-1 min-w-0 notification-item-enter" style={{ animationDelay: `${index * 40 + 20}ms` }}>
                    <p className={`text-sm leading-snug ${notif.isRead ? 'text-gray-400' : 'text-white font-medium'}`}>
                      {notif.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-gray-600 mt-1 block">
                      {timeAgo(notif.createdAt)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {!notif.isRead && (
                      <div className="w-2 h-2 rounded-full bg-blue-400 notification-unread-dot" title="Unread" />
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteNotification(notif._id) }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-400 rounded transition-all"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
