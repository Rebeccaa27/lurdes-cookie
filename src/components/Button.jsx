import { cn } from '../lib/utils'

const V = {
  primary:   'text-white active:scale-[.98] shadow-sm',
  cherry:    'text-white active:scale-[.98] shadow-sm',
  terra:     'text-white active:scale-[.98] shadow-sm',
  warm:      'text-white active:scale-[.98] shadow-sm',
  navy:      'text-white active:scale-[.98] shadow-sm',
  secondary: 'bg-white border border-[#E8E0D5] text-[#2A1B14] hover:bg-[#F3EFE9] active:scale-[.98]',
  ghost:     'hover:bg-[#F3EFE9] active:scale-[.98]',
  danger:    'bg-red-500 text-white hover:bg-red-600 active:scale-[.98]',
  success:   'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[.98]',
}
const S = {
  xs: 'px-2.5 py-1.5 text-xs rounded-lg gap-1',
  sm: 'px-3.5 py-2 text-sm rounded-xl gap-1.5',
  md: 'px-4 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-6 py-3 text-base rounded-xl gap-2',
}

const BG = {
  primary:   { bg: '#C2410C', hover: '#9A3412' },
  cherry:    { bg: '#C2410C', hover: '#9A3412' },
  terra:     { bg: '#C2410C', hover: '#9A3412' },
  warm:      { bg: '#C2410C', hover: '#9A3412' },
  navy:      { bg: '#0F2942', hover: '#163554' },
  secondary: null,
  ghost:     null,
  danger:    null,
  success:   null,
}

export default function Button({
  children, variant = 'primary', size = 'md',
  className = '', loading = false, icon: Icon, iconRight: IR,
  fullWidth = false, ...props
}) {
  const bg = BG[variant]
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-semibold transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C2410C]/40',
        'disabled:opacity-50 disabled:cursor-not-allowed select-none',
        V[variant] ?? V.primary, S[size], fullWidth && 'w-full', className
      )}
      style={bg ? { backgroundColor: bg.bg } : undefined}
      onMouseEnter={e => { if (bg) e.currentTarget.style.backgroundColor = bg.hover }}
      onMouseLeave={e => { if (bg) e.currentTarget.style.backgroundColor = bg.bg }}
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
