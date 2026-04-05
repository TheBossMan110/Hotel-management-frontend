import { cn } from '../../lib/utils'

export function Card({ className, children, style, ...props }) {
  return (
    <div
      className={cn('rounded-2xl transition-all duration-200', className)}
      style={{
        background: '#111111',
        border: '1px solid rgba(201,168,76,0.12)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
        color: '#F8F4EF',
        ...style
      }}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className, children, style, ...props }) {
  return (
    <div
      className={cn('flex flex-col gap-1.5 p-6', className)}
      style={style}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardTitle({ className, children, style, ...props }) {
  return (
    <h3
      className={cn('text-lg font-display font-light leading-none', className)}
      style={{ color: '#F8F4EF', letterSpacing: '0.01em', ...style }}
      {...props}
    >
      {children}
    </h3>
  )
}

export function CardDescription({ className, children, style, ...props }) {
  return (
    <p
      className={cn('text-sm font-body', className)}
      style={{ color: 'rgba(248,244,239,0.45)', fontFamily: 'DM Sans, sans-serif', ...style }}
      {...props}
    >
      {children}
    </p>
  )
}

export function CardContent({ className, children, style, ...props }) {
  return (
    <div className={cn('p-6 pt-0', className)} style={style} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ className, children, style, ...props }) {
  return (
    <div
      className={cn('flex items-center p-6 pt-0', className)}
      style={{ borderTop: '1px solid rgba(201,168,76,0.08)', ...style }}
      {...props}
    >
      {children}
    </div>
  )
}
