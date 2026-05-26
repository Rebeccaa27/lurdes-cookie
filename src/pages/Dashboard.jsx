import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ShoppingBag, TrendingUp, CircleDollarSign, Package, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import CardResumo from '../components/CardResumo'
import Badge from '../components/Badge'
import { formatBRL, formatDate, MESES } from '../lib/utils'

function RecentRow({ venda }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-surface-border dark:border-surface-dark-border last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center flex-shrink-0">
          <span className="text-2xs font-semibold text-brand-600 dark:text-brand-400">
            {venda.cliente?.[0]?.toUpperCase() ?? '?'}
          </span>
        </div>
        <div>
          <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 leading-none">
            {venda.cliente}
          </p>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
            {venda.sabor} · {formatDate(venda.data)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2.5">
        <Badge variant={venda.pag === 'pago' ? 'success' : 'warning'}>
          {venda.pag === 'pago' ? 'Pago' : 'Fiado'}
        </Badge>
        <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
          {formatBRL(venda.valor)}
        </span>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats]   = useState(null)
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)

  const now = new Date()
  const mes = now.getMonth()
  const ano = now.getFullYear()

  useEffect(() => {
    async function load() {
      setLoading(true)
      const start = `${ano}-${String(mes + 1).padStart(2, '0')}-01`
      const end   = new Date(ano, mes + 1, 1).toISOString().slice(0, 10)

      const { data: vendas } = await supabase
        .from('vendas')
        .select('*')
        .gte('data', start)
        .lt('data', end)
        .order('data', { ascending: false })

      const all = vendas || []
      const totalVendas  = all.reduce((s, v) => s + (v.valor || 0), 0)
      const totalPago    = all.filter((v) => v.pag === 'pago').reduce((s, v) => s + v.valor, 0)
      const totalFiado   = all.filter((v) => v.pag === 'fiado').reduce((s, v) => s + v.valor, 0)
      const nDevedores   = new Set(all.filter((v) => v.pag === 'fiado').map((v) => v.cliente)).size

      setStats({ totalVendas, totalPago, totalFiado, nDevedores, nVendas: all.length })
      setRecent(all.slice(0, 6))
      setLoading(false)
    }
    load()
  }, [mes, ano])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="p-5 lg:p-8 max-w-4xl mx-auto"
    >
      {/* Month label */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
            {MESES[mes]} {ano}
          </h2>
          <p className="text-xs text-neutral-400 dark:text-neutral-500">Resumo do mês atual</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <CardResumo label="Total vendas"   value={formatBRL(stats?.totalVendas)}  color="brand"   icon={TrendingUp}         delay={0}   loading={loading} />
        <CardResumo label="Recebido"       value={formatBRL(stats?.totalPago)}    color="success" icon={ShoppingBag}        delay={0.05}loading={loading} />
        <CardResumo label="A receber"      value={formatBRL(stats?.totalFiado)}   color="danger"  icon={CircleDollarSign}   delay={0.1} loading={loading} />
        <CardResumo label="Clientes fiado" value={stats?.nDevedores ?? '—'}       color="warning" icon={Package}            delay={0.15}loading={loading} />
      </div>

      {/* Recent sales */}
      <div className="bg-surface dark:bg-surface-dark-secondary border border-surface-border dark:border-surface-dark-border rounded-2xl shadow-soft">
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border dark:border-surface-dark-border">
          <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
            Últimas vendas
          </h3>
          <Link
            to="/vendas"
            className="flex items-center gap-1 text-xs text-neutral-400 dark:text-neutral-500
              hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
          >
            Ver todas <ArrowRight size={13} strokeWidth={2} />
          </Link>
        </div>

        <div className="px-5">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-3 border-b border-surface-border dark:border-surface-dark-border last:border-0">
                <div className="skeleton w-8 h-8 rounded-xl flex-shrink-0" />
                <div className="flex-1">
                  <div className="skeleton h-3.5 w-24 mb-1.5 rounded" />
                  <div className="skeleton h-3 w-36 rounded" />
                </div>
                <div className="skeleton h-4 w-16 rounded" />
              </div>
            ))
          ) : recent.length === 0 ? (
            <div className="py-12 text-center text-sm text-neutral-400 dark:text-neutral-500">
              Nenhuma venda neste mês ainda
            </div>
          ) : (
            recent.map((v) => <RecentRow key={v.id} venda={v} />)
          )}
        </div>
      </div>
    </motion.div>
  )
}
