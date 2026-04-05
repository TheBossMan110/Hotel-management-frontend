import { cn } from '../../lib/utils'

// Premium dark-themed button variants
const variantStyles = {
  primary: {
    background: 'linear-gradient(135deg, #C9A84C, #E8C97A)',
    color: '#0A0A0A',
    border: 'none',
    fontWeight: '600',
  },
  secondary: {
    background: 'rgba(201,168,76,0.08)',
    color: '#C9A84C',
    border: '1px solid rgba(201,168,76,0.3)',
  },
  outline: {
    background: 'transparent',
    color: 'rgba(248,244,239,0.7)',
    border: '1px solid rgba(248,244,239,0.15)',
  },
  ghost: {
    background: 'transparent',
    color: 'rgba(248,244,239,0.6)',
    border: 'none',
  },
  destructive: {
    background: 'rgba(239,68,68,0.12)',
    color: '#f87171',
    border: '1px solid rgba(239,68,68,0.25)',
  },
  link: {
    background: 'transparent',
    color: '#C9A84C',
    border: 'none',
    textDecoration: 'underline',
  }
}

const sizes = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-8 text-base',
  icon: 'h-10 w-10 p-0'
}

export function Button({
  children,
  className,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  type = 'button',
  onClick,
  style,
  ...props
}) {
  const vs = variantStyles[variant] || variantStyles.primary
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200',
        'disabled:pointer-events-none disabled:opacity-50',
        'focus:outline-none focus:ring-2 focus:ring-offset-1',
        sizes[size],
        className
      )}
      style={{
        ...vs,
        fontFamily: 'DM Sans, sans-serif',
        letterSpacing: variant === 'primary' ? '0.04em' : undefined,
        ...style
      }}
      disabled={disabled || loading}
      onClick={onClick}
      onMouseEnter={e => {
        if (variant === 'primary') {
          e.currentTarget.style.boxShadow = '0 0 24px rgba(201,168,76,0.4)'
          e.currentTarget.style.transform = 'translateY(-1px)'
        } else if (variant === 'outline' || variant === 'ghost') {
          e.currentTarget.style.background = 'rgba(248,244,239,0.06)'
          e.currentTarget.style.color = 'rgba(248,244,239,0.9)'
        } else if (variant === 'secondary') {
          e.currentTarget.style.background = 'rgba(201,168,76,0.15)'
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.transform = 'none'
        e.currentTarget.style.background = vs.background
        e.currentTarget.style.color = vs.color
      }}
      {...props}
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: 'currentColor', borderTopColor: 'transparent' }} />
      )}
      {children}
    </button>
  )
}

export default Button
