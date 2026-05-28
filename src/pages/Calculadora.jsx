import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { catalogoReceitas, INGREDIENTES } from '../lib/receitas'

function normalizarIng(id) {
  return INGREDIENTES.find(i => i.id === id)?.label ?? id
}
function unitIng(id) {
  return INGREDIENTES.find(i => i.id === id)?.unit ?? 'g'
}

function calcularIngredientes(saboresQtd) {
  const totais = {}
  Object.entries(saboresQtd).forEach(([saborId, qtd]) => {
    const rec = catalogoReceitas[saborId]
    if (!rec || !qtd) return
    const n = Number(qtd)
    if (!n) return
    const partes = { ...(rec.massa || {}), ...(rec.recheio && typeof rec.recheio === 'object' ? rec.recheio : {}) }
    const rend = rec.rendimento || 1
    Object.entries(partes).forEach(([ingId, qtdPorLote]) => {
      if (typeof qtdPorLote !== 'number') return
      const proporcao = n / rend
      totais[ingId] = (totais[ingId] || 0) + qtdPorLote * proporcao
    })
  })
  return totais
}

export default function Calculadora() {
  const saboresList = Object.entries(catalogoReceitas)

  // Modo 1: Planejar mês inteiro
  const [planejamento, setPlanejamento] = useState(() => {
    const init = {}
    saboresList.forEach(([id]) => { init[id] = '' })
    return init
  })
  const [resultMes, setResultMes] = useState(null)

  // Modo 2: Massa avulsa (um sabor)
  const [saborAvulso, setSaborAvulso] = useState(saboresList[0]?.[0] || '')
  const [qtdAvulsa, setQtdAvulsa] = useState('')
  const [resultAvulso, setResultAvulso] = useState(null)

  const [aba, setAba] = useState('mes')

  function calcularMes(e) {
    e.preventDefault()
    const result = calcularIngredientes(planejamento)
    setResultMes(result)
  }

  function calcularAvulso(e) {
    e.preventDefault()
    if (!saborAvulso || !qtdAvulsa) return
    const result = calcularIngredientes({ [saborAvulso]: qtdAvulsa })
    setResultAvulso(result)
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: '#1C1917' }}>Calculadora de Produção</h1>
        <p className="text-sm mt-0.5" style={{ color: '#78716C' }}>Calcule os ingredientes necessários para produzir</p>
      </div>

      {/* Abas */}
      <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 w-fit" style={{ border: '1px solid #E5E0D9' }}>
        {[['mes','📅 Planejamento do Mês'],['avulso','🍪 Massa Avulsa']].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setAba(id)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              aba === id ? 'text-white' : 'text-stone-500 hover:text-stone-800'
            }`}
            style={aba === id ? { background: '#C2410C' } : {}}
          >{label}</button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {aba === 'mes' && (
          <motion.div key="mes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="rounded-xl p-5 mb-4" style={{ background: '#fff', border: '1px solid #E5E0D9' }}>
              <p className="font-semibold mb-1" style={{ color: '#1C1917' }}>Quantas unidades de cada sabor você quer produzir este mês?</p>
              <p className="text-xs mb-4" style={{ color: '#78716C' }}>O sistema calculará todos os ingredientes necessários.</p>
              <form onSubmit={calcularMes}>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {saboresList.map(([id, rec]) => (
                    <div key={id}>
                      <label className="text-xs font-medium" style={{ color: '#78716C' }}>{rec.nome}</label>
                      <input
                        type="number" min="0" placeholder="0"
                        value={planejamento[id] || ''}
                        onChange={e => setPlanejamento(p => ({ ...p, [id]: e.target.value }))}
                        className="w-full mt-1 px-3 py-2 rounded-lg border text-sm"
                        style={{ borderColor: '#E5E0D9' }}
                      />
                    </div>
                  ))}
                </div>
                <button type="submit"
                  className="w-full py-3 rounded-xl text-white font-semibold transition hover:opacity-80"
                  style={{ background: '#C2410C' }}
                >
                  📅 Calcular Necessidade do Mês
                </button>
              </form>
            </div>

            {resultMes && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-xl p-5" style={{ background: '#fff', border: '1px solid #E5E0D9' }}
              >
                <p className="font-semibold mb-3" style={{ color: '#1C1917' }}>📦 Ingredientes necessários para o mês</p>
                {Object.keys(resultMes).length === 0 ? (
                  <p className="text-sm" style={{ color: '#78716C' }}>Informe pelo menos uma quantidade acima de 0.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(resultMes).map(([ingId, qtd]) => (
                      <div key={ingId} className="flex justify-between items-center p-2.5 rounded-lg" style={{ background: '#F5F0EB' }}>
                        <span className="text-sm" style={{ color: '#44403C' }}>{normalizarIng(ingId)}</span>
                        <span className="font-semibold text-sm" style={{ color: '#1C1917' }}>{qtd.toFixed(1)}{unitIng(ingId)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        )}

        {aba === 'avulso' && (
          <motion.div key="avulso" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="rounded-xl p-5 mb-4" style={{ background: '#fff', border: '1px solid #E5E0D9' }}>
              <p className="font-semibold mb-1" style={{ color: '#1C1917' }}>Precisa fazer uma massa avulsa?</p>
              <p className="text-xs mb-4" style={{ color: '#78716C' }}>Informe o sabor e a quantidade de unidades. O sistema calcula os ingredientes pontualmente.</p>
              <form onSubmit={calcularAvulso}>
                <div className="space-y-3 mb-4">
                  <div>
                    <label className="text-xs font-semibold" style={{ color: '#78716C' }}>Sabor</label>
                    <select
                      value={saborAvulso}
                      onChange={e => setSaborAvulso(e.target.value)}
                      className="w-full mt-1 px-3 py-2 rounded-lg border text-sm"
                      style={{ borderColor: '#E5E0D9' }}
                    >
                      {saboresList.map(([id, rec]) => (
                        <option key={id} value={id}>{rec.nome}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold" style={{ color: '#78716C' }}>Quantidade (unidades)</label>
                    <input
                      type="number" min="1" required
                      value={qtdAvulsa}
                      onChange={e => setQtdAvulsa(e.target.value)}
                      className="w-full mt-1 px-3 py-2 rounded-lg border text-sm"
                      style={{ borderColor: '#E5E0D9' }}
                      placeholder="Ex: 24"
                    />
                  </div>
                </div>
                <button type="submit"
                  className="w-full py-3 rounded-xl text-white font-semibold transition hover:opacity-80"
                  style={{ background: '#C2410C' }}
                >
                  🍪 Calcular Massa Avulsa
                </button>
              </form>
            </div>

            {resultAvulso && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-xl p-5" style={{ background: '#fff', border: '1px solid #E5E0D9' }}
              >
                <p className="font-semibold mb-1" style={{ color: '#1C1917' }}
                >🍪 {catalogoReceitas[saborAvulso]?.nome} — {qtdAvulsa} unidades</p>
                <p className="text-xs mb-3" style={{ color: '#78716C' }}>Ingredientes necessários para esta produção:</p>
                {Object.keys(resultAvulso).length === 0 ? (
                  <p className="text-sm" style={{ color: '#78716C' }}>Receita sem ingredientes mapeados.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(resultAvulso).map(([ingId, qtd]) => (
                      <div key={ingId} className="flex justify-between items-center p-2.5 rounded-lg" style={{ background: '#F5F0EB' }}>
                        <span className="text-sm" style={{ color: '#44403C' }}>{normalizarIng(ingId)}</span>
                        <span className="font-semibold text-sm" style={{ color: '#1C1917' }}>{qtd.toFixed(1)}{unitIng(ingId)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
