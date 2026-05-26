import { useState } from 'react'
import { motion } from 'framer-motion'
import { CircleDollarSign, CheckCircle2 } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useToast } from '../components/Toast'
import CardResumo from '../components/CardResumo'
import MonthNav from '../components/MonthNav'
import Button from '../components/Button'
import Badge from '../components/Badge'
import EmptyState from '../components/EmptyState'
import { useVendas } from '../lib/hooks'
import { formatBRL, formatDate, getInitials } from '../lib/utils'

function DebtorCard({ cliente, vendas, onPagarTudo, onPagarVenda }) {
  const total = vendas.reduce((s, v) => s + v.valor, 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface dark:bg-surface-dark-secondary border border-surface-border dark:border-surface-dark-border rounded-2xl shadow-soft overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border dark:border-surface-dark-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">
              {getInitials(cliente)}
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">{cliente}</p>
            <p className="text-2xs text-neutral-400 dark:text-neutral-500">
              {vendas.length} {vendas.length === 1 ? 'compra' : 'compras'} em aberto
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-base font-bold text-red-500 dark:text-red-400">
            {formatBRL(total)}
          </span>
          <Button
            size="xs"
            icon={CheckCircle2}
            onClick={() => onPagarTudo(cliente)}
          >
            Quitar tudo
          </Button>
        </div>
      </div>

      {/* Vendas */}
      <div className="px-5">
        {vendas.map((v, i) => (
          <div
            key={v.id}
            className="flex items-center justify-between py-3 border-b border-surface-border dark:border-surface-dark-border last:border-0"
          >
            <div className="flex items-center gap-2">
              <span className="text-2xs text-neutral-400 dark:text-neutral-500 w-4 text-center">{i + 1}</span>
              <div>
                <span className="text-sm text-neutral-700 dark:text-neutral-300">{v.sabor}</span>
                <span className="text-xs text-neutral-400 dark:text-neutral-500 ml-2">×{v.qtd}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-neutral-400 dark:text-neutral-500">{formatDate(v.data)}</span>
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {formatBRL(v.valor)}
              </span>
              <button
                onClick={() => onPagarVenda(v)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400
                  hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all"
                title="Marcar como pago"
              >
                <CheckCircle2 size={14} strokeWidth={2} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

export default function Dividas() {
  const now = new Date()
  const [mes, setMes] = useState(now.getMonth())
  const [ano, setAno] = useState(now.getFullYear())
  const toast = useToast()

  const { vendas, loading, refetch } = useVendas(mes, ano)

  function onMesChange(m, a) { setMes(m); setAno(a) }

  const fiados = vendas.filter((v) => v.pag === 'fiado')
  const totalDevido = fiados.reduce((s, v) => s + v.valor, 0)
  const devedores = [...new Set(fiados.map((v) => v.cliente))]

  async function handlePagarTudo(cliente) {
    const ids = fiados.filter((v) => v.cliente === cliente).map((v) => v.id)
    const { error } = await supabase.from('vendas').update({ pag: 'pago' }).in('id', ids)
    if (error) toast(error.message, 'error')
    else { toast(`${cliente} — dívida quitada ✓`); refetch() }
  }

  async function handlePagarVenda(venda) {
    const { error } = await supabase.from('vendas').update({ pag: 'pago' }).eq('id', venda.id)
    if (error) toast(error.message, 'error')
    else { toast('Venda marcada como paga ✓'); refetch() }
  }

  async function handleQuitarTudo() {
    if (!confirm('Quitar TODAS as dívidas deste mês?')) return
    const ids = fiados.map((v) => v.id)
    if (!ids.length) return
    await supabase.from('vendas').update({ pag: 'pago' }).in('id', ids)
    refetch()
    toast('Todas as dívidas quitadas ✓')
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="p-5 lg:p-8 max-w-4xl mx-auto"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <MonthNav mes={mes} ano={ano} onChange={onMesChange} />
        {fiados.length > 0 && (
          <Button variant="secondary" size="sm" onClick={handleQuitarTudo}>
            Quitar todas
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        <CardResumo label="Total em aberto" value={formatBRL(totalDevido)}  color="danger"   delay={0}    loading={loading} />
        <CardResumo label="Devedores"        value={devedores.length}        color="warning"  delay={0.05} loading={loading} />
        <CardResumo label="Qtd fiados"       value={fiados.length}                            delay={0.1}  loading={loading} />
      </div>

      {/* Devedores */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2].map((i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}
        </div>
      ) : devedores.length === 0 ? (
        <EmptyState
          icon={CircleDollarSign}
          title="Nenhuma dívida em aberto"
          description="Todas as vendas deste mês estão quitadas 🎉"
        />
      ) : (
        <div className="flex flex-col gap-3">
          {devedores.map((cliente) => (
            <DebtorCard
              key={cliente}
              cliente={cliente}
              vendas={fiados.filter((v) => v.cliente === cliente)}
              onPagarTudo={handlePagarTudo}
              onPagarVenda={handlePagarVenda}
            />
          ))}
        </div>
      )}
    </motion.div>
  )
}
