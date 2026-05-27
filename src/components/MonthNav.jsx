import { ChevronLeft, ChevronRight } from 'lucide-react'
import { MESES } from '../../lib/utils'

export default function MonthNav({ mes, ano, onPrev, onNext, onReset }) {
  const now = new Date()
  const isCurrent = mes === now.getMonth() && ano === now.getFullYear()
  return (
    <div className="flex items-center gap-2">
      <button onClick={onPrev}
        className="w-8 h-8 rounded-xl border border-cream-300 bg-white flex items-center justify-center
          text-ink-400 hover:text-ink hover:bg-cream-100 transition-all shadow-card">
        <ChevronLeft size={15} strokeWidth={2} />
      </button>
      <div className="flex items-baseline gap-1.5 min-w-[130px] justify-center">
        <span className="text-sm font-semibold text-ink-700">{MESES[mes]}</span>
        <span className="text-xs text-ink-400">{ano}</span>
      </div>
      <button onClick={onNext}
        className="w-8 h-8 rounded-xl border border-cream-300 bg-white flex items-center justify-center
          text-ink-400 hover:text-ink hover:bg-cream-100 transition-all shadow-card">
        <ChevronRight size={15} strokeWidth={2} />
      </button>
      {!isCurrent && onReset && (
        <button onClick={onReset}
          className="ml-1 px-2.5 py-1 text-xs rounded-lg border border-cream-300 bg-white
            text-ink-400 hover:text-ink hover:bg-cream-100 transition-all">
          Hoje
        </button>
      )}
    </div>
  )
}