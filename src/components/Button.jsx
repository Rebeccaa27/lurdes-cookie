import { cn } from '../lib/utils'

const V = {
  primary:   'bg-terra text-white hover:bg-terra-600 active:bg-terra-600 shadow-sm',
  terra:     'bg-terra text-white hover:bg-terra-600 active:bg-terra-600 shadow-sm',
  navy:      'bg-navy text-white hover:bg-navy-500 active:bg-navy-600 shadow-sm',
  secondary: 'bg-white border border-cream-300 text-ink-600 hover:bg-cream-100 hover:border-cream-400',
  ghost:     'text-ink-400 hover:bg-cream-200 hover:text-ink-700',
  danger:    'bg-red-500 text-white hover:bg-red-600',
  success:   'bg-emerald-600 text-white hover:bg-emerald-700',
  warm:      'bg-warm-500 text-white hover:bg-warm-700',
}
const S = {
  xs: 'px-2.5 py-1.5 text-xs rounded-lg gap-1',
  sm: 'px-3.5 py-2 text-sm rounded-xl gap-1.5',
  md: 'px-4 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-6 py-3 text-base rounded-xl gap-2',
}

export default function Button({
  children, variant = 'primary', size = 'md',
  className = '', loading = false, icon: Icon, iconRight: IR,
  fullWidth = false, ...props
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terra/40',
        'disabled:opacity-50 disabled:cursor-not-allowed select-none',
        V[variant], S[size], fullWidth && 'w-full', className
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading
        ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full" style={{animation:'spin .7s linear infinite'}} />
        : Icon && <Icon size={size==='xs'?12:size==='sm'?14:16} strokeWidth={1.75} />
      }
      {children}
      {!loading && IR && <IR size={size==='xs'?12:size==='sm'?14:16} strokeWidth={1.75} />}
    </button>
  )
}
