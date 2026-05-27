import { AlertTriangle, TrendingDown, Zap } from 'lucide-react'
import { INGREDIENTES, catalogoReceitas, calcularCapacidade } from '../../lib/receitas'
import { labelIngrediente } from '../../lib/receitas'

export default function AlertBanner({ estoqueMap = {} }) {
  const alerts = []

  // Ingredientes zerados ou críticos
  INGREDIENTES.forEach(ing => {
    const qty = estoqueMap[ing.id] ?? 0
    if (qty <= 0) {
      alerts.push({ type: 'danger', msg: `${ing.label} está zerado no estoque.` })
    } else if (qty <= ing.estoque_minimo) {
      alerts.push({ type: 'warning', msg: `${ing.label} está abaixo do mínimo (${qty}${ing.unit} / mín ${ing.estoque_minimo}${ing.unit}).` })
    }
  })

  // Capacidade máxima de produção
  const receitas = Object.values(catalogoReceitas)
  receitas.forEach(r => {
    const { maxLotes, limitante } = calcularCapacidade(r.id, estoqueMap)
    if (maxLotes <= 2 && maxLotes > 0) {
      alerts.push({
        type: 'info',
        msg: `${r.nome}: consegues produzir apenas mais ${maxLotes} lote${maxLotes > 1 ? 's' : ''}.${limitante ? ` Limitado por: ${labelIngrediente(limitante)}.` : ''}`,
      })
    } else if (maxLotes === 0) {
      alerts.push({
        type: 'danger',
        msg: `${r.nome}: impossível produzir.${limitante ? ` Falta: ${labelIngrediente(limitante)}.` : ''}`,
      })
    }
  })

  if (alerts.length === 0) return null

  const ICONS = { danger: AlertTriangle, warning: TrendingDown, info: Zap }
  const COLORS = {
    danger:  'bg-terra-100 border-terra/30 text-terra',
    warning: 'bg-amber-50 border-amber-200 text-amber-700',
    info:    'bg-navy-100 border-navy-200 text-navy',
  }

  return (
    <div className="flex flex-col gap-2 mb-6">
      {alerts.slice(0, 4).map((a, i) => {
        const Icon = ICONS[a.type]
        return (
          <div key={i} className={`flex items-start gap-3 px-4 py-3 rounded-2xl border text-sm ${COLORS[a.type]}`}>
            <Icon size={15} strokeWidth={2} className="mt-0.5 flex-shrink-0" />
            <span>{a.msg}</span>
          </div>
        )
      })}
      {alerts.length > 4 && (
        <p className="text-xs text-ink-300 text-center">+{alerts.length - 4} alertas adicionais</p>
      )}
    </div>
  )
}