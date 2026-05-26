import { cn } from '../lib/utils'

const variants = {
  primary:  'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800',
  secondary:'bg-surface border border-surface-border text-neutral-700 hover:bg-surface-tertiary dark:bg-surface-dark-secondary dark:border-surface-dark-border dark:text-neutral-300 dark:hover:bg-surface-dark-tertiary',
  ghost:    'text-neutral-600 hover:bg-surface-tertiary dark:text-neutral-400 dark:hover:bg-surface-dark-secondary',
  danger:   'bg-red-500 text-white hover:bg-red-600 active:bg-red-700',
  success:  'bg-emerald-600 text-white hover:bg-emerald-700',
}

const sizes = {
  xs: 'px-2.5 py-1.5 text-xs rounded-lg gap-1',
  sm: 'px-3 py-2 text-sm rounded-xl gap-1.5',
  md: 'px-4 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-5 py-3 text-base rounded-xl gap-2',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  icon: Icon,
  iconRight: IconRight,
  fullWidth = false,
  ...props
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/50',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : Icon ? (
        <Icon size={size === 'xs' ? 12 : size === 'sm' ? 14 : 16} strokeWidth={1.75} />
      ) : null}
      {children}
      {!loading && IconRight && (
        <IconRight size={size === 'xs' ? 12 : size === 'sm' ? 14 : 16} strokeWidth={1.75} />
      )}
    </button>
  )
}
