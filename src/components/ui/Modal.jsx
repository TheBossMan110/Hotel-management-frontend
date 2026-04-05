import { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
  size = 'md'
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[90vw]'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 animate-fadeIn"
        style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
        onClick={onClose}
      />
      
      {/* Modal */}
      <div
        className={cn(
          'relative z-50 w-full mx-4 animate-scaleIn overflow-hidden',
          sizes[size],
          className
        )}
        style={{
          background: '#111111',
          border: '1px solid rgba(201,168,76,0.2)',
          borderRadius: '1.25rem',
          boxShadow: '0 25px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(201,168,76,0.08)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
          <div>
            <h2 className="text-lg font-display font-light" style={{ color: '#F8F4EF' }}>{title}</h2>
            {description && (
              <p className="mt-1 text-sm font-body" style={{ color: 'rgba(248,244,239,0.45)' }}>{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl transition-all flex-shrink-0"
            style={{ color: 'rgba(248,244,239,0.4)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,168,76,0.08)'; e.currentTarget.style.color = '#C9A84C' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(248,244,239,0.4)' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto" style={{ color: '#F8F4EF' }}>
          {children}
        </div>
      </div>
    </div>
  )
}

export default Modal
