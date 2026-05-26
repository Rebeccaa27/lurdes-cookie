import { cn } from '../lib/utils'

export default function EmptyState({ icon: Icon, title, description, action, className = '' }) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-6 text-center', className)}>
      {Icon && (
        <div className="w-12 h-12 rounded-2xl bg-surface-tertiary dark:bg-surface-dark-tertiary
          flex items-center justify-center mb-4">
          <Icon size={22} strokeWidth={1.5} className="text-neutral-400 dark:text-neutral-500" />
        </div>
      )}
      <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">{title}</p>
      {description && (
        <p className="text-xs text-neutral-400 dark:text-neutral-500 max-w-xs">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
