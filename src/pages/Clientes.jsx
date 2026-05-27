import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Users, CheckCircle2, AlertCircle, Clock } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { formatBRL, formatDate } from '../lib/utils'
import { useToast } from '../components/Toast'
import EmptyState from '../components/EmptyState'

function useDividas() {
  const [dados, setDados] = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('vendas')
      .select('id, cliente, sabor, qtd, valor, pag, data')
      .eq('pag', 'fiado')
      .order('data', { ascending: false })
    setDados(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])
  return { dados, loading, refetch: fetch }
}

export default function Clientes() {
  const { dados, loading, refetch } = useDividas()
  const toast = useToast()

  async function marcarPago(id, nome, valor) {
    const ok = confirm(`Marcar como pago? ${nome} — ${formatBRL(valor)}`)
    if (!ok) return
    const { error } = await supabase.from('vendas').update({ pag: 'pago' }).eq('id', id)
    if (error) toast(error.message, 'error')
    else { toast(`${nome} marcado como pago ✓`); refetch() }
  }

  // Agrupar por cliente
  const porCliente = dados.reduce((acc, v) => {
    if (!acc[v.cliente]) acc[v.cliente] = []
    acc[v.cliente].push(v)
    return acc
  }, {})

  const clientes = Object.entries(porCliente).map(([nome, vendas]) => ({
    nome,
    vendas,
    total: vendas.reduce((s, v) => s + v.valor, 0),
  })).sort((a, b) => b.total - a.total)

  const totalGeral = clientes.reduce((s, c) => s + c.total, 0)

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
          <div className="w-9 h-9 rounded-xl bg-danger-50 dark:bg-red-900/20 flex items-center justify-center">
            <Users size={18} className="text-danger-600 dark:text-red-400" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">Clientes com Fiado</h1>
            <p className="text-xs text-neutral-400">{clientes.length} clientes devendo</p>
          </div>
        </div>
        {totalGeral > 0 && (
          <div className="text-right">
            <p className="text-2xs text-neutral-400 uppercase tracking-wider">Total a receber</p>
            <p className="text-xl font-bold text-danger-600 dark:text-red-400">{formatBRL(totalGeral)}</p>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1,2,3].map(i => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
      ) : clientes.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="Nenhum fiado pendente"
          description="Todos os clientes estão em dia!"
        />
      ) : (
        <div className="flex flex-col gap-4">
          {clientes.map(({ nome, vendas, total }) => (
            <div key={nome} className="bg-surface dark:bg-surface-dark-secondary border border-surface-border dark:border-surface-dark-border rounded-2xl overflow-hidden shadow-soft">
              {/* Card header do cliente */}
              <div className="flex items-center justify-between px-4 py-3 bg-surface-offset/60 dark:bg-surface-dark-offset/40 border-b border-surface-border dark:border-surface-dark-border">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center">
                    <span className="text-sm font-bold text-brand-600 dark:text-brand-400">
                      {nome[0]?.toUpperCase()}
                    </span>
                  </div>
                  <span className="font-semibold text-sm text-neutral-800 dark:text-neutral-100">{nome}</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle size={14} className="text-amber-500" />
                  <span className="text-sm font-bold text-danger-600 dark:text-red-400">{formatBRL(total)}</span>
                </div>
              </div>

              {/* Linhas de venda */}
              <div className="divide-y divide-surface-border dark:divide-surface-dark-border">
                {vendas.map(v => (
                  <div key={v.id} className="flex items-center justify-between px-4 py-2.5 group">
                    <div className="flex items-center gap-3">
                      <Clock size={13} className="text-neutral-300 dark:text-neutral-600 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                          {v.qtd}× {v.sabor}
                        </p>
                        <p className="text-2xs text-neutral-400">{formatDate(v.data)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">{formatBRL(v.valor)}</span>
                      <button
                        onClick={() => marcarPago(v.id, nome, v.valor)}
                        title="Marcar como pago"
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg text-neutral-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/10"
                      >
                        <CheckCircle2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
