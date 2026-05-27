import { cn } from '../../lib/utils'

const V = {
  default: 'bg-ink-100 text-ink-600',
  terra:   'bg-terra-100 text-terra',
  success: 'bg-emerald-50 text-emerald-700',
  warning: 'bg-amber-50 text-amber-700',
  danger:  'bg-red-50 text-red-600',
  navy:    'bg-navy-100 text-navy',
  warm:    'bg-warm-100 text-warm-700',
}

export default function Badge({ children, variant = 'default', className = '' }) {
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium',
      V[variant], className
    )}>
      {children}
    </span>
  )
}