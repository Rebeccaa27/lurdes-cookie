import { useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Target, DollarSign, ShoppingCart, Wallet } from 'lucide-react'
import { useVendas } from '../lib/hooks'
import { catalogoReceitas, INGREDIENTES } from '../lib/receitas'
import { formatBRL } from '../lib/utils'
import MonthNav from '../components/MonthNav'
import CardResumo from '../components/CardResumo'

// Custo estimado por grama de ingrediente (valores aproximados)
const CUSTO_ING = {
  manteiga:         0.025,
  mascavo:          0.009,
  refinado:         0.007,
  ovo:              0.020,
  farinha:          0.005,
  amido:            0.010,
  fermento:         0.040,
  bicarbonato:      0.030,
  sal:              0.003,
  gotas_pretas:     0.045,
  gotas_brancas:    0.045,
  moeda:            0.045,
  choc_branco:      0.040,
  cacau:            0.060,
  cacau_black:      0.065,
  chocolate_po:     0.030,
  nutella:          0.060,
  leite_condensado: 0.018,
  creme_leite:      0.022,
  leite_po:         0.040,
  cream_cheese:     0.045,
  coco_ralado:      0.030,
  cafe_soluvel:     0.100,
  nesquik:          0.050,
  canela:           0.080,
  corante:          0.020,
  vinagre:          0.010,
  biscoito_oreo:    0.040,
  baunilha:         0.080,
  choc_amargo:      0.050,
}

function custoReceita(receita) {
  const itens = { ...receita.massa, ...(receita.recheio || {}) }
  return Object.entries(itens).reduce((s, [id, qtd]) => s + (CUSTO_ING[id] ?? 0) * qtd, 0)
}

function custoPorCookie(receita) {
  return custoReceita(receita) / receita.rendimento
}

function lucroUnitario(receita) {
  return receita.preco - custoPorCookie(receita)
}

export default function Financeiro() {
  const now = new Date()
  const [mes, setMes] = useState(now.getMonth())
  const [ano, setAno] = useState(now.getFullYear())
  const [meta, setMeta] = useState('')

  const { vendas, loading } = useVendas(mes, ano)
  const receitas = Object.values(catalogoReceitas)

  // ─── KPIs do mês ──────────────────────────────────────────────────────────
  const totalBruto  = vendas.reduce((s, v) => s + v.valor, 0)
  const totalPago   = vendas.filter(v => v.pag === 'pago').reduce((s, v) => s + v.valor, 0)
  const totalFiado  = vendas.filter(v => v.pag === 'fiado').reduce((s, v) => s + v.valor, 0)

  // Estimativa de custo: agrupa cookies vendidos por sabor e aplica custo
  const custoEstimado = vendas.reduce((s, v) => {
    const r = receitas.find(r => r.nome === v.sabor)
    return s + (r ? custoPorCookie(r) * v.qtd : 0)
  }, 0)

  const lucroLiquido   = totalBruto - custoEstimado
  const margemMedia    = totalBruto > 0 ? (lucroLiquido / totalBruto) * 100 : 0
  const reinvestimento = custoEstimado // sugerido: repor exatamente o custo gasto

  // ─── Simulador de meta ────────────────────────────────────────────────────
  const metaNum = parseFloat(meta) || 0
  const simulacao = receitas.map(r => {
    const lucro = lucroUnitario(r)
    const qtdNecessaria = lucro > 0 ? Math.ceil(metaNum / lucro) : null
    const lotesNecessarios = qtdNecessaria ? Math.ceil(qtdNecessaria / r.rendimento) : null
    return { receita: r, lucro, qtdNecessaria, lotesNecessarios }
  }).filter(s => s.lucro > 0).sort((a, b) => b.lucro - a.lucro)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="p-5 lg:p-8 max-w-3xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-success-50 dark:bg-emerald-900/20 flex items-center justify-center">
            <TrendingUp size={18} className="text-success-600 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">Financeiro</h1>
            <p className="text-xs text-neutral-400">Caixa, lucro e simulador de metas</p>
          </div>
        </div>
        <MonthNav mes={mes} ano={ano} onChange={(m, a) => { setMes(m); setAno(a) }} />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <CardResumo label="Faturamento" value={formatBRL(totalBruto)} color="brand" loading={loading} />
        <CardResumo label="No caixa"     value={formatBRL(totalPago)}  color="success" loading={loading} />
        <CardResumo label="A receber"    value={formatBRL(totalFiado)} color="danger"  loading={loading} />
        <CardResumo label="Lucro líq."   value={formatBRL(lucroLiquido)} color="brand" loading={loading} />
      </div>

      {/* Detalhes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        <div className="bg-surface dark:bg-surface-dark-secondary border border-surface-border dark:border-surface-dark-border rounded-2xl p-4 shadow-soft">
          <div className="flex items-center gap-2 mb-1">
            <ShoppingCart size={14} className="text-neutral-400" />
            <p className="text-2xs uppercase tracking-wider text-neutral-400">Custo estimado</p>
          </div>
          <p className="text-xl font-bold text-neutral-800 dark:text-neutral-100">{formatBRL(custoEstimado)}</p>
          <p className="text-xs text-neutral-400 mt-1">Ingredientes usados neste mês</p>
        </div>
        <div className="bg-surface dark:bg-surface-dark-secondary border border-surface-border dark:border-surface-dark-border rounded-2xl p-4 shadow-soft">
          <div className="flex items-center gap-2 mb-1">
            <Wallet size={14} className="text-neutral-400" />
            <p className="text-2xs uppercase tracking-wider text-neutral-400">Reinvestir</p>
          </div>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{formatBRL(reinvestimento)}</p>
          <p className="text-xs text-neutral-400 mt-1">Sugestão: repor estoque gasto</p>
        </div>
        <div className="bg-surface dark:bg-surface-dark-secondary border border-surface-border dark:border-surface-dark-border rounded-2xl p-4 shadow-soft">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign size={14} className="text-neutral-400" />
            <p className="text-2xs uppercase tracking-wider text-neutral-400">Margem média</p>
          </div>
          <p className="text-xl font-bold text-neutral-800 dark:text-neutral-100">{margemMedia.toFixed(1)}%</p>
          <p className="text-xs text-neutral-400 mt-1">Sobre o faturamento bruto</p>
        </div>
      </div>

      {/* Simulador de meta */}
      <div className="bg-surface dark:bg-surface-dark-secondary border border-surface-border dark:border-surface-dark-border rounded-2xl p-5 shadow-soft mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Target size={16} className="text-brand-500" />
          <h2 className="font-semibold text-sm text-neutral-800 dark:text-neutral-100">Simulador de Meta de Lucro</h2>
        </div>
        <p className="text-xs text-neutral-400 mb-3">Informe quanto quer lucrar e veja quantos cookies precisa vender de cada tipo.</p>
        <div className="flex items-center gap-3 mb-5">
          <span className="text-sm font-medium text-neutral-500">R$</span>
          <input
            type="number"
            min="0"
            placeholder="Ex: 500"
            value={meta}
            onChange={e => setMeta(e.target.value)}
            className="input-base flex-1"
          />
          <span className="text-sm text-neutral-400">de lucro</span>
        </div>

        {metaNum > 0 && (
          <div className="space-y-2">
            {simulacao.map(({ receita, lucro, qtdNecessaria, lotesNecessarios }) => (
              <div key={receita.id} className="flex items-center gap-3 p-3 bg-surface-offset dark:bg-surface-dark-offset rounded-xl">
                <span className="text-lg w-8 text-center">{receita.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 truncate">{receita.nome}</p>
                  <p className="text-xs text-neutral-400">
                    Lucro por unidade: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatBRL(lucro)}</span>
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-neutral-800 dark:text-neutral-100">{qtdNecessaria} cookies</p>
                  <p className="text-xs text-neutral-400">{lotesNecessarios} lote{lotesNecessarios !== 1 ? 's' : ''}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tabela de lucratividade */}
      <div className="bg-surface dark:bg-surface-dark-secondary border border-surface-border dark:border-surface-dark-border rounded-2xl overflow-hidden shadow-soft">
        <div className="px-5 py-3 border-b border-surface-border dark:border-surface-dark-border">
          <h2 className="font-semibold text-sm text-neutral-800 dark:text-neutral-100">Lucratividade por Sabor</h2>
          <p className="text-xs text-neutral-400 mt-0.5">Custo estimado × preço de venda por unidade</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="border-b border-surface-border dark:border-surface-dark-border">
                {['Sabor','Preço','Custo/un','Lucro/un','Margem'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-2xs font-semibold text-neutral-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {receitas.map(r => {
                const custo  = custoPorCookie(r)
                const lucro  = lucroUnitario(r)
                const margem = (lucro / r.preco) * 100
                return (
                  <tr key={r.id} className="border-b border-surface-border dark:border-surface-dark-border last:border-0 hover:bg-surface-offset/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span>{r.emoji}</span>
                        <span className="text-sm text-neutral-700 dark:text-neutral-300">{r.nome}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400">{formatBRL(r.preco)}</td>
                    <td className="px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400">{formatBRL(custo)}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-emerald-600 dark:text-emerald-400">{formatBRL(lucro)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${
                        margem >= 60 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' :
                        margem >= 40 ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400' :
                        'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                      }`}>
                        {margem.toFixed(0)}%
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  )
}
