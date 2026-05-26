import { ChevronLeft, ChevronRight } from 'lucide-react'
import { MESES } from '../lib/utils'
import { cn } from '../lib/utils'

export default function MonthNav({ mes, ano, onChange, className = '' }) {
  function prev() {
    if (mes === 0) onChange(11, ano - 1)
    else           onChange(mes - 1, ano)
  }
  function next() {
    if (mes === 11) onChange(0, ano + 1)
    else            onChange(mes + 1, ano)
  }

  const isCurrentMonth =
    mes === new Date().getMonth() && ano === new Date().getFullYear()

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <button
        onClick={prev}
        className="w-8 h-8 rounded-xl border border-surface-border dark:border-surface-dark-border
          bg-surface dark:bg-surface-dark-secondary text-neutral-500 hover:text-neutral-900
          dark:hover:text-neutral-100 hover:bg-surface-tertiary dark:hover:bg-surface-dark-tertiary
          flex items-center justify-center transition-all duration-150"
      >
        <ChevronLeft size={15} strokeWidth={2} />
      </button>

      <div className="flex items-baseline gap-1.5 min-w-[130px] justify-center">
        <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
          {MESES[mes]}
        </span>
        <span className="text-xs text-neutral-400 dark:text-neutral-500">
          {ano}
        </span>
      </div>

      <button
        onClick={next}
        className="w-8 h-8 rounded-xl border border-surface-border dark:border-surface-dark-border
          bg-surface dark:bg-surface-dark-secondary text-neutral-500 hover:text-neutral-900
          dark:hover:text-neutral-100 hover:bg-surface-tertiary dark:hover:bg-surface-dark-tertiary
          flex items-center justify-center transition-all duration-150"
      >
        <ChevronRight size={15} strokeWidth={2} />
      </button>

      {!isCurrentMonth && (
        <button
          onClick={() => onChange(new Date().getMonth(), new Date().getFullYear())}
          className="ml-1 px-2.5 py-1 text-xs rounded-lg border border-surface-border
            dark:border-surface-dark-border text-neutral-500 hover:text-neutral-900
            dark:hover:text-neutral-100 hover:bg-surface-tertiary dark:hover:bg-surface-dark-tertiary
            transition-all duration-150"
        >
          Hoje
        </button>
      )}
    </div>
  )
}
