import { cn } from '../lib/utils'

const variants = {
  default: 'bg-surface-tertiary text-neutral-600 dark:bg-surface-dark-tertiary dark:text-neutral-400',
  success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
  warning: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
  danger:  'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
  brand:   'bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-400',
  blue:    'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
}

export default function Badge({ children, variant = 'default', className = '' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-md text-2xs font-medium',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
