import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount) {
  const num = Number(amount) || 0
  return 'Rs ' + num.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

export function formatDate(date, options = {}) {
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  }
  return new Date(date).toLocaleDateString('en-US', defaultOptions)
}

export function formatShortDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

export function calculateNights(checkIn, checkOut) {
  const start = new Date(checkIn)
  const end = new Date(checkOut)
  const diffTime = Math.abs(end - start)
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export function generateId() {
  return Math.random().toString(36).substring(2, 9)
}

export function getInitials(name) {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export function getStatusColor(status) {
  const colors = {
    available: 'bg-green-100 text-green-800',
    occupied: 'bg-blue-100 text-blue-800',
    maintenance: 'bg-yellow-100 text-yellow-800',
    cleaning: 'bg-purple-100 text-purple-800',
    reserved: 'bg-orange-100 text-orange-800',
    confirmed: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    cancelled: 'bg-red-100 text-red-800',
    completed: 'bg-gray-100 text-gray-800',
    'checked-in': 'bg-blue-100 text-blue-800',
    'checked-out': 'bg-gray-100 text-gray-800'
  }
  return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800'
}
