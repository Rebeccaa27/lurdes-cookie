import { cn } from '../lib/utils'

export default function EmptyState({ icon: Icon, title, description, action, className = '' }) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-6 text-center', className)}>
      {Icon && (
        <div className="w-14 h-14 rounded-3xl bg-cream-200 flex items-center justify-center mb-4">
          <Icon size={24} strokeWidth={1.5} className="text-ink-300" />
        </div>
      )}
      <p className="text-sm font-medium text-ink-600 mb-1">{title}</p>
      {description && <p className="text-xs text-ink-300 max-w-xs">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
