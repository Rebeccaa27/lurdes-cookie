import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calculator, Save, ChevronDown, ChevronUp, Package } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useToast } from '../components/Toast'
import Button from '../components/Button'
import Badge from '../components/Badge'
import { useEstoque } from '../lib/hooks'
import { cn } from '../lib/utils'
import { RECEITAS, INGREDIENTES, calcularIngredientes, catalogoReceitas } from '../lib/receitas'

function StatusBadge({ qtd }) {
  if (qtd === null || qtd === undefined) return <Badge variant="default">Sem dados</Badge>
  if (qtd === 0)  return <Badge variant="danger">Zerado</Badge>
  if (qtd < 50)   return <Badge variant="warning">Baixo</Badge>
  return <Badge variant="success">OK</Badge>
}

export default function Estoque() {
  const toast = useToast()
  const { estoque, loading, refetch } = useEstoque()
  const [edits, setEdits] = useState({})
  const [saving, setSaving] = useState(false)
  const [estoqueAberto, setEstoqueAberto] = useState(false)

  // Calculadora
  const [producao, setProducao] = useState({})
  const [resultado, setResultado] = useState(null)

  function getStockQty(id) {
    const row = estoque.find((r) => r.ingrediente_id === id || r.ingrediente === id)
    return row ? row.quantidade : null
  }

  function handleEdit(id, val) {
    setEdits((e) => ({ ...e, [id]: val }))
  }

  async function saveAll() {
    setSaving(true)
    const upserts = Object.entries(edits)
      .filter(([, v]) => v !== '' && !isNaN(parseFloat(v)))
      .map(([ingrediente_id, quantidade]) => ({
        ingrediente_id,
        ingrediente: ingrediente_id,
        quantidade: parseFloat(quantidade),
      }))

    if (!upserts.length) { toast('Nenhuma alteração para salvar', 'warning'); setSaving(false); return }

    const { error } = await supabase
      .from('estoque')
      .upsert(upserts, { onConflict: 'ingrediente_id' })

    if (error) {
      // fallback: tenta upsert por 'ingrediente'
      const { error: err2 } = await supabase
        .from('estoque')
        .upsert(
          upserts.map(({ ingrediente_id, quantidade }) => ({ ingrediente: ingrediente_id, quantidade })),
          { onConflict: 'ingrediente' }
        )
      setSaving(false)
      if (err2) { toast(err2.message, 'error'); return }
    } else {
      setSaving(false)
    }
    toast('Estoque atualizado ✓')
    setEdits({})
    refetch()
  }

  function calcular() {
    const result = {}
    let temAlgo = false
    Object.entries(producao).forEach(([nomeReceita, val]) => {
      const nLotes = parseFloat(val)
      if (nLotes > 0) {
        temAlgo = true
        const receita = Object.values(catalogoReceitas).find((r) => r.nome === nomeReceita)
        if (!receita) return
        const ings = calcularIngredientes(receita.id, nLotes)
        Object.entries(ings).forEach(([ing, qtd]) => { result[ing] = (result[ing] || 0) + qtd })
      }
    })
    if (!temAlgo) { toast('Informe ao menos 1 lote', 'warning'); return }
    setResultado(result)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="p-5 lg:p-8 max-w-4xl mx-auto"
    >
      {/* ── Calculadora de produção (primeiro) ── */}
      <div className="bg-white border border-cream-200 rounded-2xl shadow-card overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-cream-200">
          <h3 className="text-sm font-semibold text-ink-700">Calculadora de produção</h3>
          <p className="text-xs text-ink-300 mt-0.5">Informe os lotes de cada sabor para ver o que precisa comprar</p>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-5">
            {Object.keys(RECEITAS).map((sabor) => (
              <div key={sabor}>
                <label className="block text-xs font-medium text-ink-400 mb-1.5">{sabor}</label>
                <input
                  type="number" min="0" placeholder="0"
                  value={producao[sabor] ?? ''}
                  onChange={(e) => setProducao((p) => ({ ...p, [sabor]: e.target.value }))}
                  className="w-full px-3 py-2 text-sm text-center rounded-xl border border-cream-300 bg-white text-ink focus:outline-none focus:ring-2 focus:ring-terra/25"
                />
              </div>
            ))}
          </div>
          <Button icon={Calculator} onClick={calcular}>Calcular necessidade</Button>
        </div>

        {resultado && (
          <div className="border-t border-cream-200">
            <div className="px-5 py-4">
              <p className="text-xs font-semibold text-ink-400 tracking-wider uppercase mb-3">Resultado</p>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-cream-200">
                      {['Ingrediente','Necessário','Em estoque','Comprar'].map(h => (
                        <th key={h} className="px-3 py-2 text-left text-2xs font-semibold tracking-wider uppercase text-ink-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(resultado)
                      .sort((a, b) => a[0].localeCompare(b[0]))
                      .map(([ingId, qtdNec]) => {
                        const ingDef = INGREDIENTES.find(i => i.id === ingId)
                        const label = ingDef?.label ?? ingId
                        const tem = getStockQty(ingId) ?? 0
                        const falta = Math.max(0, qtdNec - tem)
                        return (
                          <tr key={ingId} className="border-b border-cream-200 last:border-0">
                            <td className="px-3 py-2.5 text-sm text-ink-700">{label}</td>
                            <td className="px-3 py-2.5 text-sm text-ink-400">{qtdNec.toFixed(0)}g</td>
                            <td className="px-3 py-2.5 text-sm text-ink-400">{tem}g</td>
                            <td className="px-3 py-2.5">
                              {falta > 0
                                ? <span className="text-sm font-semibold text-red-500">{falta.toFixed(0)}g</span>
                                : <span className="text-sm font-medium text-emerald-600">✓ OK</span>}
                            </td>
                          </tr>
                        )
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Ingredientes em estoque (colapsável) ── */}
      <div className="bg-white border border-cream-200 rounded-2xl shadow-card overflow-hidden">
        <button
          onClick={() => setEstoqueAberto(a => !a)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-cream-100/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Package size={16} className="text-ink-400" />
            <div className="text-left">
              <p className="text-sm font-semibold text-ink-700">Ingredientes em estoque</p>
              <p className="text-xs text-ink-300">Clique para ver e editar quantidades (em gramas)</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {Object.keys(edits).length > 0 && (
              <span className="text-xs bg-terra/10 text-terra px-2 py-0.5 rounded-full font-medium">
                {Object.keys(edits).length} alteração(ões)
              </span>
            )}
            {estoqueAberto ? <ChevronUp size={16} className="text-ink-400" /> : <ChevronDown size={16} className="text-ink-400" />}
          </div>
        </button>

        <AnimatePresence>
          {estoqueAberto && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden"
            >
              <div className="border-t border-cream-200">
                <div className="px-5 py-3 flex items-center justify-between border-b border-cream-100 bg-cream-50/40">
                  <p className="text-xs text-ink-300">Todos os valores são em <strong>gramas (g)</strong>. Edite e clique em Salvar.</p>
                  <Button icon={Save} size="sm" loading={saving} onClick={saveAll}>Salvar</Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-cream-200">
                        <th className="px-4 py-3 text-left text-2xs font-semibold tracking-wider uppercase text-ink-400">Ingrediente</th>
                        <th className="px-4 py-3 text-left text-2xs font-semibold tracking-wider uppercase text-ink-400">Qtd (g)</th>
                        <th className="px-4 py-3 text-left text-2xs font-semibold tracking-wider uppercase text-ink-400">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading
                        ? Array.from({ length: 8 }).map((_, i) => (
                            <tr key={i} className="border-b border-cream-200">
                              <td className="px-4 py-3"><div className="skeleton h-4 w-28 rounded" /></td>
                              <td className="px-4 py-3"><div className="skeleton h-8 w-24 rounded-lg" /></td>
                              <td className="px-4 py-3"><div className="skeleton h-5 w-14 rounded-md" /></td>
                            </tr>
                          ))
                        : INGREDIENTES.map((ing) => {
                            const currentQty = getStockQty(ing.id)
                            const editVal = edits[ing.id] ?? ''
                            const displayQty = editVal !== '' ? parseFloat(editVal) : currentQty
                            return (
                              <tr key={ing.id} className="border-b border-cream-200 last:border-0 hover:bg-cream-50/40 transition-colors">
                                <td className="px-4 py-2.5">
                                  <div>
                                    <p className="text-sm text-ink-700">{ing.label}</p>
                                    <p className="text-2xs text-ink-300">{ing.cat}</p>
                                  </div>
                                </td>
                                <td className="px-4 py-2.5">
                                  <div className="flex items-center gap-1.5">
                                    <input
                                      type="number"
                                      min="0"
                                      placeholder={currentQty ?? '0'}
                                      value={editVal}
                                      onChange={(e) => handleEdit(ing.id, e.target.value)}
                                      className={cn(
                                        'w-28 px-3 py-1.5 text-sm rounded-lg border transition-all',
                                        'bg-white text-ink-700 focus:outline-none focus:ring-2 focus:ring-terra/25',
                                        editVal !== '' ? 'border-terra/50' : 'border-cream-300'
                                      )}
                                    />
                                    <span className="text-xs text-ink-300">g</span>
                                  </div>
                                </td>
                                <td className="px-4 py-2.5">
                                  <StatusBadge qtd={displayQty} />
                                </td>
                              </tr>
                            )
                          })}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
