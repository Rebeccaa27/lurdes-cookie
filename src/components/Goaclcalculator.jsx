import { useState } from 'react'
import { Target } from 'lucide-react'
import { formatBRL } from '../../lib/utils'
import Button from '../ui/Button'

export default function GoalCalculator({ precoMedio = 11 }) {
  const [meta, setMeta] = useState('')
  const [resultado, setResultado] = useState(null)

  function calcular() {
    const m = parseFloat(meta)
    if (!m || m <= 0) return
    const faturamento = m / 0.4 // ~40% margem líquida estimada
    const cookies     = Math.ceil(faturamento / precoMedio)
    const diario      = Math.ceil(cookies / 30)
    const semanal     = Math.ceil(cookies / 4)
    setResultado({ meta: m, faturamento, cookies, diario, semanal })
  }

  return (
    <div className="bg-white rounded-2xl shadow-card border border-cream-200 p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl bg-terra-100 flex items-center justify-center">
          <Target size={15} strokeWidth={1.75} className="text-terra" />
        </div>
        <div>
          <p className="text-sm font-semibold text-ink-700">Meta de Lucro</p>
          <p className="text-xs text-ink-300">Engenharia reversa financeira</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <div className="flex-1">
          <label className="field-label">Quero lucrar por mês</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-ink-400 font-medium">R$</span>
            <input type="number" min="0" placeholder="0,00"
              value={meta} onChange={e => setMeta(e.target.value)}
              className="field pl-9" />
          </div>
        </div>
        <div className="flex items-end">
          <Button onClick={calcular} size="sm" variant="navy">Calcular</Button>
        </div>
      </div>

      {resultado && (
        <div className="grid grid-cols-2 gap-2 mt-2">
          {[
            { l: 'Faturamento necessário', v: formatBRL(resultado.faturamento), hl: true },
            { l: 'Cookies a vender/mês',   v: `${resultado.cookies} un` },
            { l: 'Por dia',                v: `${resultado.diario} cookies` },
            { l: 'Por semana',             v: `${resultado.semanal} cookies` },
          ].map((item, i) => (
            <div key={i} className={`rounded-xl p-3 border ${item.hl ? 'bg-terra-100 border-terra/30' : 'bg-cream-100 border-cream-300'}`}>
              <p className="text-2xs text-ink-400 mb-0.5">{item.l}</p>
              <p className={`text-sm font-semibold ${item.hl ? 'text-terra' : 'text-ink-700'}`}>{item.v}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}