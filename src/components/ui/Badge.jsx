import { cn } from '../../lib/utils'

const variants = {
  default: { background: 'rgba(201,168,76,0.15)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.3)' },
  secondary: { background: 'rgba(248,244,239,0.06)', color: 'rgba(248,244,239,0.7)', border: '1px solid rgba(248,244,239,0.12)' },
  outline: { background: 'transparent', color: 'rgba(248,244,239,0.6)', border: '1px solid rgba(248,244,239,0.15)' },
  success: { background: 'rgba(34,197,94,0.12)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.25)' },
  warning: { background: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.25)' },
  danger: { background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' },
  destructive: { background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' },
  info: { background: 'rgba(59,130,246,0.12)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.25)' }
}

export function Badge({ className, variant = 'default', children, style, ...props }) {
  const vs = variants[variant] || variants.default
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-lg px-2.5 py-0.5 text-xs font-medium',
        className
      )}
      style={{
        ...vs,
        fontFamily: 'DM Sans, sans-serif',
        letterSpacing: '0.03em',
        ...style
      }}
      {...props}
    >
      {children}
    </span>
  )
}

export default Badge
