import { motion } from 'framer-motion'
import { cn } from '../lib/utils'

const colorMap = {
  default: 'text-neutral-900 dark:text-neutral-100',
  brand:   'text-brand-600 dark:text-brand-400',
  success: 'text-emerald-600 dark:text-emerald-400',
  danger:  'text-red-500 dark:text-red-400',
  warning: 'text-amber-600 dark:text-amber-400',
}

export default function CardResumo({
  label,
  value,
  subtext,
  icon: Icon,
  color = 'default',
  delay = 0,
  loading = false,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        'bg-surface dark:bg-surface-dark-secondary',
        'border border-surface-border dark:border-surface-dark-border',
        'rounded-2xl p-5 shadow-soft dark:shadow-soft-dark',
        'flex flex-col gap-3'
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-neutral-400 dark:text-neutral-500 tracking-wide">
          {label}
        </span>
        {Icon && (
          <div className="w-8 h-8 rounded-xl bg-surface-tertiary dark:bg-surface-dark-tertiary flex items-center justify-center">
            <Icon size={15} strokeWidth={1.75} className="text-neutral-400 dark:text-neutral-500" />
          </div>
        )}
      </div>

      {loading ? (
        <div className="skeleton h-7 w-28 rounded-lg" />
      ) : (
        <div className={cn('text-2xl font-semibold tracking-tight', colorMap[color])}>
          {value}
        </div>
      )}

      {subtext && (
        <p className="text-xs text-neutral-400 dark:text-neutral-500">{subtext}</p>
      )}
    </motion.div>
  )
}
