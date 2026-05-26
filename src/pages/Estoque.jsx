import { useState } from 'react'
import { motion } from 'framer-motion'
import { Package, Calculator, Save } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useToast } from '../components/Toast'
import Button from '../components/Button'
import Badge from '../components/Badge'
import { useEstoque } from '../lib/hooks'
import { RECEITAS, ALL_INGREDIENTS, calcularIngredientes, PRECOS } from '../lib/receitas'
import { cn } from '../lib/utils'

function StatusBadge({ qtd }) {
  if (qtd === null || qtd === undefined)
    return <Badge variant="default">Sem dados</Badge>
  if (qtd === 0) return <Badge variant="danger">Zerado</Badge>
  if (qtd < 50)  return <Badge variant="warning">Baixo</Badge>
  return <Badge variant="success">OK</Badge>
}

export default function Estoque() {
  const toast = useToast()
  const { estoque, loading, refetch } = useEstoque()

  // Local edits map: { ingrediente: newQtd }
  const [edits, setEdits] = useState({})
  const [saving, setSaving] = useState(false)

  // Production calculator
  const [producao, setProducao] = useState({})
  const [resultado, setResultado] = useState(null)

  function getStockQty(ing) {
    const row = estoque.find((r) => r.ingrediente === ing)
    return row ? row.quantidade : null
  }

  function handleEdit(ing, val) {
    setEdits((e) => ({ ...e, [ing]: val }))
  }

  async function saveAll() {
    setSaving(true)
    const upserts = Object.entries(edits)
      .filter(([, v]) => v !== '' && !isNaN(parseFloat(v)))
      .map(([ingrediente, quantidade]) => ({
        ingrediente,
        quantidade: parseFloat(quantidade),
      }))

    if (!upserts.length) { toast('Nenhuma alteração para salvar', 'warning'); setSaving(false); return }

    const { error } = await supabase.from('estoque').upsert(upserts, { onConflict: 'ingrediente' })
    setSaving(false)
    if (error) { toast(error.message, 'error'); return }
    toast('Estoque atualizado ✓')
    setEdits({})
    refetch()
  }

  function calcular() {
    const prod = {}
    Object.entries(producao).forEach(([k, v]) => { if (parseFloat(v) > 0) prod[k] = parseFloat(v) })
    if (!Object.keys(prod).length) { toast('Informe ao menos 1 lote', 'warning'); return }
    setResultado(calcularIngredientes(prod))
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="p-5 lg:p-8 max-w-4xl mx-auto"
    >
      {/* ── Estoque atual ── */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
            Ingredientes em estoque
          </h2>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
            Edite os campos e salve para atualizar
          </p>
        </div>
        <Button icon={Save} size="sm" loading={saving} onClick={saveAll}>
          Salvar
        </Button>
      </div>

      <div className="bg-surface dark:bg-surface-dark-secondary border border-surface-border dark:border-surface-dark-border rounded-2xl shadow-soft overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-border dark:border-surface-dark-border">
                <th className="px-4 py-3 text-left text-2xs font-semibold tracking-wider uppercase text-neutral-400 dark:text-neutral-500">
                  Ingrediente
                </th>
                <th className="px-4 py-3 text-left text-2xs font-semibold tracking-wider uppercase text-neutral-400 dark:text-neutral-500">
                  Estoque (g)
                </th>
                <th className="px-4 py-3 text-left text-2xs font-semibold tracking-wider uppercase text-neutral-400 dark:text-neutral-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="border-b border-surface-border dark:border-surface-dark-border">
                      <td className="px-4 py-3"><div className="skeleton h-4 w-28 rounded" /></td>
                      <td className="px-4 py-3"><div className="skeleton h-8 w-24 rounded-lg" /></td>
                      <td className="px-4 py-3"><div className="skeleton h-5 w-14 rounded-md" /></td>
                    </tr>
                  ))
                : ALL_INGREDIENTS.map((ing) => {
                    const currentQty = getStockQty(ing)
                    const editVal = edits[ing] ?? ''
                    const displayQty = editVal !== '' ? parseFloat(editVal) : currentQty
                    return (
                      <tr key={ing} className="border-b border-surface-border dark:border-surface-dark-border last:border-0 group">
                        <td className="px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-300">{ing}</td>
                        <td className="px-4 py-2.5">
                          <input
                            type="number"
                            min="0"
                            placeholder={currentQty ?? '—'}
                            value={editVal}
                            onChange={(e) => handleEdit(ing, e.target.value)}
                            className={cn(
                              'w-28 px-3 py-1.5 text-sm rounded-lg border transition-all duration-150',
                              'bg-surface dark:bg-surface-dark-tertiary text-neutral-800 dark:text-neutral-200',
                              'focus:outline-none focus:ring-2 focus:ring-brand-400/30',
                              editVal !== ''
                                ? 'border-brand-400 dark:border-brand-500'
                                : 'border-surface-border dark:border-surface-dark-border'
                            )}
                          />
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

      {/* ── Calculadora de produção ── */}
      <div className="bg-surface dark:bg-surface-dark-secondary border border-surface-border dark:border-surface-dark-border rounded-2xl shadow-soft overflow-hidden">
        <div className="px-5 py-4 border-b border-surface-border dark:border-surface-dark-border">
          <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
            Calculadora de produção
          </h3>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
            Informe os lotes de cada sabor para ver o que precisa comprar
          </p>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-5">
            {Object.keys(RECEITAS).map((sabor) => (
              <div key={sabor}>
                <label className="label-base">{sabor}</label>
                <input
                  type="number" min="0" placeholder="0"
                  value={producao[sabor] ?? ''}
                  onChange={(e) => setProducao((p) => ({ ...p, [sabor]: e.target.value }))}
                  className="input-base text-center"
                />
              </div>
            ))}
          </div>

          <Button icon={Calculator} onClick={calcular}>Calcular necessidade</Button>
        </div>

        {resultado && (
          <div className="border-t border-surface-border dark:border-surface-dark-border">
            <div className="px-5 py-4">
              <p className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 tracking-wider uppercase mb-3">
                Resultado
              </p>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-surface-border dark:border-surface-dark-border">
                      {['Ingrediente', 'Necessário', 'Em estoque', 'Comprar'].map((h) => (
                        <th key={h} className="px-3 py-2 text-left text-2xs font-semibold tracking-wider uppercase text-neutral-400 dark:text-neutral-500">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(resultado)
                      .sort((a, b) => a[0].localeCompare(b[0]))
                      .map(([ing, qtdNec]) => {
                        const tem = getStockQty(ing) ?? 0
                        const falta = Math.max(0, qtdNec - tem)
                        return (
                          <tr key={ing} className="border-b border-surface-border dark:border-surface-dark-border last:border-0">
                            <td className="px-3 py-2.5 text-sm text-neutral-700 dark:text-neutral-300">{ing}</td>
                            <td className="px-3 py-2.5 text-sm text-neutral-600 dark:text-neutral-400">{qtdNec.toFixed(0)}g</td>
                            <td className="px-3 py-2.5 text-sm text-neutral-600 dark:text-neutral-400">{tem}g</td>
                            <td className="px-3 py-2.5">
                              {falta > 0 ? (
                                <span className="text-sm font-semibold text-red-500 dark:text-red-400">{falta.toFixed(0)}g</span>
                              ) : (
                                <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">✓ OK</span>
                              )}
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
    </motion.div>
  )
}
