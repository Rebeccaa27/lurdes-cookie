import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { motion } from 'framer-motion'

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

function Spark({ value, max, color }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0
  return (
    <div className="h-1 w-full rounded-full" style={{ background: '#F0EBE3' }}>
      <div className="h-1 rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
    </div>
  )
}

function StatCard({ label, value, sub, color = '#C2410C', spark, sparkMax, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
      className="flex flex-col justify-between p-5 rounded-2xl"
      style={{ background: '#fff', border: '1px solid #E8E2DA', minHeight: 110 }}
    >
      <p className="text-xs font-medium tracking-wide uppercase" style={{ color: '#9E9589', letterSpacing: '0.07em' }}>{label}</p>
      <p className="text-2xl font-bold mt-1" style={{ color }}>{value}</p>
      {sub && <p className="text-xs mt-0.5" style={{ color: '#B0A89E' }}>{sub}</p>}
      {spark !== undefined && (
        <div className="mt-3">
          <Spark value={spark} max={sparkMax} color={color} />
        </div>
      )}
    </motion.div>
  )
}

export default function Dashboard() {
  const hoje = new Date()
  const mes  = hoje.getMonth()
  const ano  = hoje.getFullYear()

  const [vendas, setVendas]   = useState([])
  const [cookies, setCookies] = useState([])
  const [loading, setLoading] = useState(true)

  const buscar = useCallback(async () => {
    setLoading(true)
    const start = `${ano}-${String(mes + 1).padStart(2, '0')}-01`
    const end   = new Date(ano, mes + 1, 1).toISOString().slice(0, 10)
    const [{ data: v }, { data: c }] = await Promise.all([
      supabase.from('vendas').select('qtd,valor,pag,sabor,data').gte('data', start).lt('data', end),
      supabase.from('estoque_cookies').select('sabor,quantidade,minimo'),
    ])
    setVendas(v || [])
    setCookies(c || [])
    setLoading(false)
  }, [mes, ano])

  useEffect(() => { buscar() }, [buscar])

  useEffect(() => {
    const ch = supabase.channel('dash-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vendas' }, buscar)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'estoque_cookies' }, buscar)
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [buscar])

  const faturamento = vendas.reduce((s, v) => s + v.valor * v.qtd, 0)
  const recebido    = vendas.filter(v => v.pag === 'pago').reduce((s, v) => s + v.valor * v.qtd, 0)
  const aReceber    = faturamento - recebido
  const totalVendas = vendas.reduce((s, v) => s + v.qtd, 0)
  const alertas     = cookies.filter(c => c.quantidade <= (c.minimo || 3))

  const saboresMap = {}
  vendas.forEach(v => { saboresMap[v.sabor] = (saboresMap[v.sabor] || 0) + v.qtd })
  const topSabores = Object.entries(saboresMap).sort((a, b) => b[1] - a[1]).slice(0, 5)
  const maxSabor   = topSabores[0]?.[1] || 1

  // Vendas por dia (últimos 7 dias)
  const hoje7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(hoje); d.setDate(hoje.getDate() - (6 - i))
    return d.toISOString().slice(0, 10)
  })
  const vendasDia = hoje7.map(dia => ({
    dia: dia.slice(8),
    total: vendas.filter(v => v.data === dia).reduce((s, v) => s + v.valor * v.qtd, 0)
  }))
  const maxDia = Math.max(...vendasDia.map(x => x.total), 1)

  const fmt = (n) => `R$ ${n.toFixed(2).replace('.',',')}`

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#C2410C', borderTopColor: 'transparent' }} />
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 lg:py-8">

      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#B0A89E' }}>{MESES[mes]} {ano}</p>
        <h1 className="text-3xl font-bold" style={{ color: '#1A1714' }}>Visão Geral</h1>
      </div>

      {/* Alertas — só texto, sem emoji */}
      {alertas.length > 0 && (
        <div className="rounded-xl px-4 py-3 mb-6 flex items-center gap-3" style={{ background: '#FEF3C7', border: '1px solid #FDE68A' }}>
          <div className="w-1.5 h-8 rounded-full flex-shrink-0" style={{ background: '#D97706' }} />
          <div>
            <p className="text-xs font-semibold" style={{ color: '#92400E' }}>Estoque baixo</p>
            <p className="text-xs mt-0.5" style={{ color: '#92400E' }}>
              {alertas.map(c => `${c.sabor} (${c.quantidade} un)`).join('  ·  ')}
            </p>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <StatCard index={0} label="Faturamento" value={fmt(faturamento)} color="#1A1714" spark={faturamento} sparkMax={Math.max(faturamento, 1)} />
        <StatCard index={1} label="Recebido" value={fmt(recebido)} color="#166534" spark={recebido} sparkMax={Math.max(faturamento, 1)} />
        <StatCard index={2} label="A receber" value={fmt(aReceber)} color="#C2410C" spark={aReceber} sparkMax={Math.max(faturamento, 1)} />
        <StatCard index={3} label="Cookies vendidos" value={totalVendas} sub="unidades no mês" color="#1A1714" />
      </div>

      {/* Grid inferior */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">

        {/* Vendas 7 dias */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="lg:col-span-2 rounded-2xl p-5"
          style={{ background: '#fff', border: '1px solid #E8E2DA' }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#9E9589' }}>Vendas — últimos 7 dias</p>
          <div className="flex items-end gap-2 h-24">
            {vendasDia.map(({ dia, total }) => (
              <div key={dia} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-sm transition-all duration-500" style={{
                  height: `${Math.max((total / maxDia) * 80, total > 0 ? 6 : 2)}px`,
                  background: total > 0 ? '#C2410C' : '#F0EBE3',
                  minHeight: 2
                }} />
                <p className="text-2xs" style={{ color: '#B0A89E', fontSize: 10 }}>{dia}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top sabores */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-2xl p-5"
          style={{ background: '#fff', border: '1px solid #E8E2DA' }}
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#9E9589' }}>Top sabores</p>
            <Link to="/vendas" className="text-xs font-medium" style={{ color: '#C2410C' }}>Ver tudo</Link>
          </div>
          {topSabores.length === 0 ? (
            <p className="text-xs py-4 text-center" style={{ color: '#B0A89E' }}>Nenhuma venda este mês</p>
          ) : (
            <div className="space-y-3">
              {topSabores.map(([sabor, qtd], i) => (
                <div key={sabor}>
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: '#44403C' }}>{sabor}</span>
                    <span className="font-semibold" style={{ color: '#1A1714' }}>{qtd} un</span>
                  </div>
                  <Spark value={qtd} max={maxSabor} color={i === 0 ? '#C2410C' : '#D4C5B5'} />
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Estoque + Atalhos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Estoque cookies */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="rounded-2xl p-5"
          style={{ background: '#fff', border: '1px solid #E8E2DA' }}
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#9E9589' }}>Estoque de cookies</p>
            <Link to="/estoque" className="text-xs font-medium" style={{ color: '#C2410C' }}>Gerenciar</Link>
          </div>
          {cookies.length === 0 ? (
            <p className="text-xs py-4 text-center" style={{ color: '#B0A89E' }}>Nenhum item cadastrado</p>
          ) : (
            <div className="space-y-2.5">
              {cookies.slice(0, 6).map(c => {
                const baixo = c.quantidade <= (c.minimo || 3)
                return (
                  <div key={c.sabor} className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: '#44403C' }}>{c.sabor}</span>
                    <div className="flex items-center gap-2">
                      {baixo && <span className="text-2xs px-1.5 py-0.5 rounded font-semibold" style={{ background: '#FEE2E2', color: '#DC2626', fontSize: 10 }}>baixo</span>}
                      <span className="text-sm font-semibold" style={{ color: baixo ? '#DC2626' : '#1A1714' }}>{c.quantidade} un</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </motion.div>

        {/* Atalhos */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="rounded-2xl p-5"
          style={{ background: '#fff', border: '1px solid #E8E2DA' }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#9E9589' }}>Acesso rápido</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { to: '/vendas',      label: 'Nova venda',    desc: 'Registrar venda' },
              { to: '/crm',         label: 'CRM',           desc: 'Cobranças' },
              { to: '/estoque',     label: 'Estoque',       desc: 'Controle de itens' },
              { to: '/calculadora', label: 'Calculadora',   desc: 'Planejar produção' },
            ].map(a => (
              <Link
                key={a.to}
                to={a.to}
                className="flex flex-col gap-0.5 p-3.5 rounded-xl transition-all hover:shadow-sm"
                style={{ background: '#F8F5F1', border: '1px solid #EDE8E2' }}
              >
                <span className="text-sm font-semibold" style={{ color: '#1A1714' }}>{a.label}</span>
                <span className="text-xs" style={{ color: '#9E9589' }}>{a.desc}</span>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
