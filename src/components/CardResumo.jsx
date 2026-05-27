import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

const COLORS = {
  default: 'text-ink-700',
  terra:   'text-terra',
  success: 'text-emerald-600',
  danger:  'text-red-500',
  warning: 'text-amber-600',
  navy:    'text-navy',
}

export default function CardResumo({ label, value, subtext, icon: Icon, color = 'default', delay = 0, loading = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: [.4,0,.2,1] }}
      className="bg-white rounded-2xl shadow-card border border-cream-200 p-5 flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-ink-300 tracking-wide uppercase">{label}</span>
        {Icon && (
          <div className="w-8 h-8 rounded-xl bg-cream-100 flex items-center justify-center">
            <Icon size={15} strokeWidth={1.75} className="text-ink-300" />
          </div>
        )}
      </div>
      {loading
        ? <div className="skeleton h-7 w-28" />
        : <div className={cn('text-2xl font-semibold tracking-tight', COLORS[color])}>{value}</div>
      }
      {subtext && <p className="text-xs text-ink-300">{subtext}</p>}
    </motion.div>
  )
}