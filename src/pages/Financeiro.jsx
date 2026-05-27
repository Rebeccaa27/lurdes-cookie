import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, DollarSign, ShoppingCart, Wallet, ChevronDown, ChevronUp, X } from 'lucide-react'
import { useVendas } from '../lib/hooks'
import { catalogoReceitas, INGREDIENTES } from '../lib/receitas'
import { formatBRL } from '../lib/utils'
import MonthNav from '../components/MonthNav'
import CardResumo from '../components/CardResumo'

const CUSTO_ING = {
  manteiga:0.025,mascavo:0.009,refinado:0.007,ovo:0.020,farinha:0.005,
  amido:0.010,fermento:0.040,bicarbonato:0.030,sal:0.003,
  gotas_pretas:0.045,gotas_brancas:0.045,moeda:0.045,choc_branco:0.040,
  cacau:0.060,cacau_black:0.065,chocolate_po:0.030,nutella:0.060,
  leite_condensado:0.018,creme_leite:0.022,leite_po:0.040,cream_cheese:0.045,
  coco_ralado:0.030,cafe_soluvel:0.100,nesquik:0.050,canela:0.080,
  corante:0.020,vinagre:0.010,biscoito_oreo:0.040,baunilha:0.080,
}

function custoReceita(receita) {
  const itens = { ...receita.massa, ...(receita.recheio || {}) }
  return Object.entries(itens).reduce((s, [id, qtd]) => s + (CUSTO_ING[id] ?? 0) * qtd, 0)
}
function custoPorCookie(receita) { return custoReceita(receita) / receita.rendimento }
function lucroUnitario(receita) { return receita.preco - custoPorCookie(receita) }

function MiniRelatorio({ receita, onClose }) {
  const custo  = custoPorCookie(receita)
  const lucro  = lucroUnitario(receita)
  const margem = (lucro / receita.preco) * 100
  const custoLote = custoReceita(receita)

  let status, statusColor, statusMsg
  if (margem >= 60) {
    status = 'Margem excelente'
    statusColor = 'text-emerald-700 bg-emerald-50 border-emerald-200'
    statusMsg = `Com ${margem.toFixed(0)}% de margem, você está cobrindo bem os custos e obtendo lucro saudável. Continue assim.`
  } else if (margem >= 40) {
    status = 'Margem razoável'
    statusColor = 'text-amber-700 bg-amber-50 border-amber-200'
    statusMsg = `Margem de ${margem.toFixed(0)}% é aceitável, mas há espaço para melhorar. Considere aumentar o preço ou reduzir ingredientes.`
  } else if (margem >= 20) {
    status = 'Margem baixa'
    statusColor = 'text-orange-700 bg-orange-50 border-orange-200'
    statusMsg = `Atenção: ${margem.toFixed(0)}% de margem é baixo. Você pode estar subestimando o custo da sua mão de obra. Reavalie o preço.`
  } else {
    status = 'Possível prejuízo'
    statusColor = 'text-red-700 bg-red-50 border-red-200'
    statusMsg = `Com apenas ${margem.toFixed(0)}% de margem, o custo de ingredientes já compromete grande parte do valor. Revise urgente o preço de venda.`
  }

  const precoSugerido60 = custo / 0.40  // para ter 60% margem

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white rounded-2xl shadow-xl border border-cream-200 w-full max-w-md"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-cream-200">
          <div>
            <h3 className="font-semibold text-ink-700">{receita.nome}</h3>
            <p className="text-xs text-ink-300 mt-0.5">Mini relatório de lucratividade</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-ink-300 hover:text-ink hover:bg-cream-100 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Status */}
          <div className={`border rounded-xl p-3 ${statusColor}`}>
            <p className="text-sm font-semibold mb-1">{status}</p>
            <p className="text-xs leading-relaxed">{statusMsg}</p>
          </div>

          {/* Números */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Preço de venda', valor: formatBRL(receita.preco), neg: false },
              { label: 'Custo/unidade',  valor: formatBRL(custo),         neg: true  },
              { label: 'Lucro/unidade',  valor: formatBRL(lucro),         neg: lucro < 0 },
              { label: 'Custo do lote',  valor: formatBRL(custoLote),     neg: true  },
            ].map(({ label, valor, neg }) => (
              <div key={label} className="bg-cream-50 rounded-xl p-3">
                <p className="text-xs text-ink-300 mb-1">{label}</p>
                <p className={`text-base font-bold ${neg ? 'text-ink-600' : 'text-emerald-600'}`}>{valor}</p>
              </div>
            ))}
          </div>

          {/* Margem visual */}
          <div>
            <div className="flex justify-between text-xs text-ink-400 mb-1.5">
              <span>Margem sobre o preço</span>
              <span className="font-semibold text-ink-700">{margem.toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-cream-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  margem >= 60 ? 'bg-emerald-500' : margem >= 40 ? 'bg-amber-400' : 'bg-red-400'
                }`}
                style={{ width: `${Math.min(100, margem)}%` }}
              />
            </div>
          </div>

          {/* Sugestão de preço */}
          {margem < 60 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
              <p className="text-xs font-semibold text-blue-700 mb-1">Sugestão de preço</p>
              <p className="text-xs text-blue-600">
                Para atingir 60% de margem, sugerimos cobrar no mínimo <strong>{formatBRL(precoSugerido60)}</strong> por unidade.
              </p>
            </div>
          )}

          {/* Editar preço */}
          <EditarPreco receita={receita} />
        </div>
      </motion.div>
    </div>
  )
}

function EditarPreco({ receita }) {
  const [novoPreco, setNovoPreco] = useState('')
  const [salvo, setSalvo] = useState(false)

  function simular() {
    const p = parseFloat(novoPreco)
    if (!p || p <= 0) return
    const custo  = custoPorCookie(receita)
    const lucro  = p - custo
    const margem = (lucro / p) * 100
    setSalvo({ p, lucro, margem })
  }

  return (
    <div className="border border-cream-300 rounded-xl p-3">
      <p className="text-xs font-semibold text-ink-500 mb-2">Simular novo preço</p>
      <div className="flex gap-2">
        <div className="flex items-center gap-1.5 flex-1">
          <span className="text-xs text-ink-400">R$</span>
          <input
            type="number" step="0.50" min="0"
            placeholder={receita.preco}
            value={novoPreco}
            onChange={e => { setNovoPreco(e.target.value); setSalvo(false) }}
            className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-cream-300 bg-white text-ink focus:outline-none focus:ring-2 focus:ring-terra/25"
          />
        </div>
        <button onClick={simular}
          className="px-3 py-1.5 rounded-lg bg-terra text-white text-xs font-medium hover:bg-terra-hover transition-colors">
          Simular
        </button>
      </div>
      {salvo && (
        <div className="mt-2 text-xs text-ink-500">
          Com <strong>{formatBRL(salvo.p)}</strong>: lucro <strong className="text-emerald-600">{formatBRL(salvo.lucro)}</strong> · margem <strong>{salvo.margem.toFixed(1)}%</strong>
        </div>
      )}
    </div>
  )
}

export default function Financeiro() {
  const now = new Date()
  const [mes, setMes] = useState(now.getMonth())
  const [ano, setAno] = useState(now.getFullYear())
  const [relatorioAberto, setRelatorioAberto] = useState(null)

  const { vendas, loading } = useVendas(mes, ano)
  const receitas = Object.values(catalogoReceitas)

  const totalBruto  = vendas.reduce((s, v) => s + v.valor, 0)
  const totalPago   = vendas.filter(v => v.pag === 'pago').reduce((s, v) => s + v.valor, 0)
  const totalFiado  = vendas.filter(v => v.pag === 'fiado').reduce((s, v) => s + v.valor, 0)

  const custoEstimado = vendas.reduce((s, v) => {
    const r = receitas.find(r => r.nome === v.sabor)
    return s + (r ? custoPorCookie(r) * v.qtd : 0)
  }, 0)

  const lucroLiquido   = totalBruto - custoEstimado
  const margemMedia    = totalBruto > 0 ? (lucroLiquido / totalBruto) * 100 : 0
  const reinvestimento = custoEstimado

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
          <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
            <TrendingUp size={18} className="text-emerald-600" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-ink-700">Financeiro</h1>
            <p className="text-xs text-ink-300">Caixa do mês e lucratividade por sabor</p>
          </div>
        </div>
        <MonthNav mes={mes} ano={ano} onChange={(m, a) => { setMes(m); setAno(a) }} />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <CardResumo label="Faturamento" value={formatBRL(totalBruto)}    color="brand"   loading={loading} />
        <CardResumo label="No caixa"    value={formatBRL(totalPago)}     color="success" loading={loading} />
        <CardResumo label="A receber"   value={formatBRL(totalFiado)}    color="danger"  loading={loading} />
        <CardResumo label="Lucro líq."  value={formatBRL(lucroLiquido)} color="brand"   loading={loading} />
      </div>

      {/* Detalhes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        <div className="bg-white border border-cream-200 rounded-2xl p-4 shadow-card">
          <div className="flex items-center gap-2 mb-1">
            <ShoppingCart size={14} className="text-ink-300" />
            <p className="text-2xs uppercase tracking-wider text-ink-300">Custo estimado</p>
          </div>
          <p className="text-xl font-bold text-ink-700">{formatBRL(custoEstimado)}</p>
          <p className="text-xs text-ink-300 mt-1">Ingredientes usados este mês</p>
        </div>
        <div className="bg-white border border-cream-200 rounded-2xl p-4 shadow-card">
          <div className="flex items-center gap-2 mb-1">
            <Wallet size={14} className="text-ink-300" />
            <p className="text-2xs uppercase tracking-wider text-ink-300">Reinvestir</p>
          </div>
          <p className="text-xl font-bold text-emerald-600">{formatBRL(reinvestimento)}</p>
          <p className="text-xs text-ink-300 mt-1">Sugerido para repor estoque</p>
        </div>
        <div className="bg-white border border-cream-200 rounded-2xl p-4 shadow-card">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign size={14} className="text-ink-300" />
            <p className="text-2xs uppercase tracking-wider text-ink-300">Margem média</p>
          </div>
          <p className="text-xl font-bold text-ink-700">{margemMedia.toFixed(1)}%</p>
          <p className="text-xs text-ink-300 mt-1">Sobre o faturamento bruto</p>
        </div>
      </div>

      {/* Tabela de lucratividade — clica para ver relatório */}
      <div className="bg-white border border-cream-200 rounded-2xl overflow-hidden shadow-card">
        <div className="px-5 py-3 border-b border-cream-200">
          <h2 className="font-semibold text-sm text-ink-700">Lucratividade por sabor</h2>
          <p className="text-xs text-ink-300 mt-0.5">Clique em um sabor para ver o mini relatório</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px]">
            <thead>
              <tr className="border-b border-cream-200">
                {['Sabor','Preço','Custo/un','Lucro/un','Margem',''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-2xs font-semibold text-ink-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {receitas.map(r => {
                const custo  = custoPorCookie(r)
                const lucro  = lucroUnitario(r)
                const margem = (lucro / r.preco) * 100
                return (
                  <tr key={r.id} className="border-b border-cream-200 last:border-0 hover:bg-cream-50/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-ink-700">{r.nome}</td>
                    <td className="px-4 py-3 text-sm text-ink-500">{formatBRL(r.preco)}</td>
                    <td className="px-4 py-3 text-sm text-ink-500">{formatBRL(custo)}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-emerald-600">{formatBRL(lucro)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${
                        margem >= 60 ? 'bg-emerald-50 text-emerald-700' :
                        margem >= 40 ? 'bg-amber-50 text-amber-700' :
                        'bg-red-50 text-red-700'
                      }`}>{margem.toFixed(0)}%</span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setRelatorioAberto(r)}
                        className="text-xs text-terra hover:underline font-medium"
                      >
                        Ver análise
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal mini relatório */}
      <AnimatePresence>
        {relatorioAberto && (
          <MiniRelatorio
            receita={relatorioAberto}
            onClose={() => setRelatorioAberto(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
