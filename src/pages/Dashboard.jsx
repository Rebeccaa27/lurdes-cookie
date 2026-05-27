import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { motion } from 'framer-motion'

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

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
      supabase.from('vendas').select('qtd,valor,pag,sabor').gte('data', start).lt('data', end),
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

  const saboresVendidos = {}
  vendas.forEach(v => {
    saboresVendidos[v.sabor] = (saboresVendidos[v.sabor] || 0) + v.qtd
  })
  const topSabores = Object.entries(saboresVendidos)
    .sort((a, b) => b[1] - a[1]).slice(0, 5)

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: '#1C1917' }}>Dashboard</h1>
        <p className="text-sm mt-0.5" style={{ color: '#78716C' }}>{MESES[mes]} {ano}</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#C2410C', borderTopColor: 'transparent' }} />
        </div>
      ) : (
        <>
          {/* Alertas de cookies */}
          {alertas.length > 0 && (
            <div className="rounded-xl p-4 mb-6" style={{ background: '#FEF3C7', border: '1px solid #FDE68A' }}>
              <p className="font-semibold text-sm mb-2" style={{ color: '#92400E' }}>⚠️ Estoque de Cookies Baixo</p>
              <div className="flex flex-wrap gap-2">
                {alertas.map(c => (
                  <span key={c.sabor} className="px-2 py-1 rounded-lg text-xs font-medium" style={{ background: '#FDE68A', color: '#92400E' }}>
                    🍪 {c.sabor}: {c.quantidade} un
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Faturamento', value: `R$ ${faturamento.toFixed(2).replace('.',',')}`, color: '#1C1917', icon: '💰' },
              { label: 'Recebido',   value: `R$ ${recebido.toFixed(2).replace('.',',')}`,    color: '#15803D', icon: '✅' },
              { label: 'A Receber',  value: `R$ ${aReceber.toFixed(2).replace('.',',')}`,    color: '#C2410C', icon: '⏳' },
              { label: 'Cookies Vendidos', value: totalVendas,                               color: '#1C1917', icon: '🍪' },
            ].map(k => (
              <motion.div
                key={k.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl p-4"
                style={{ background: '#fff', border: '1px solid #E5E0D9' }}
              >
                <div className="flex items-start justify-between mb-1">
                  <p className="text-xs" style={{ color: '#78716C' }}>{k.label}</p>
                  <span className="text-base">{k.icon}</span>
                </div>
                <p className="text-xl font-bold" style={{ color: k.color }}>{k.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Grid inferior */}
          <div className="grid lg:grid-cols-2 gap-4">
            {/* Estoque cookies */}
            <div className="rounded-xl p-4" style={{ background: '#fff', border: '1px solid #E5E0D9' }}>
              <div className="flex items-center justify-between mb-3">
                <p className="font-semibold text-sm" style={{ color: '#1C1917' }}>🍪 Estoque de Cookies</p>
                <Link to="/estoque" className="text-xs" style={{ color: '#C2410C' }}>Ver tudo →</Link>
              </div>
              {cookies.length === 0 ? (
                <p className="text-sm text-center py-4" style={{ color: '#78716C' }}>Nenhum item cadastrado</p>
              ) : (
                <div className="space-y-2">
                  {cookies.slice(0, 6).map(c => (
                    <div key={c.sabor} className="flex items-center justify-between">
                      <span className="text-sm" style={{ color: '#44403C' }}>{c.sabor}</span>
                      <div className="flex items-center gap-2">
                        {c.quantidade <= (c.minimo || 3) && (
                          <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: '#FEE2E2', color: '#DC2626' }}>Baixo</span>
                        )}
                        <span className="text-sm font-semibold" style={{ color: c.quantidade <= (c.minimo || 3) ? '#DC2626' : '#1C1917' }}>
                          {c.quantidade} un
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top sabores vendidos */}
            <div className="rounded-xl p-4" style={{ background: '#fff', border: '1px solid #E5E0D9' }}>
              <div className="flex items-center justify-between mb-3">
                <p className="font-semibold text-sm" style={{ color: '#1C1917' }}>🏆 Top Sabores do Mês</p>
                <Link to="/vendas" className="text-xs" style={{ color: '#C2410C' }}>Ver vendas →</Link>
              </div>
              {topSabores.length === 0 ? (
                <p className="text-sm text-center py-4" style={{ color: '#78716C' }}>Nenhuma venda este mês</p>
              ) : (
                <div className="space-y-2">
                  {topSabores.map(([sabor, qtd], i) => (
                    <div key={sabor} className="flex items-center gap-3">
                      <span className="text-xs w-5 font-bold" style={{ color: '#78716C' }}>{i + 1}.</span>
                      <span className="flex-1 text-sm" style={{ color: '#44403C' }}>{sabor}</span>
                      <span className="text-sm font-semibold" style={{ color: '#1C1917' }}>{qtd} un</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Atalhos */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
            {[
              { to: '/vendas',   icon: '🛒', label: 'Nova Venda'    },
              { to: '/crm',      icon: '👥', label: 'CRM'           },
              { to: '/estoque',  icon: '📦', label: 'Estoque'       },
              { to: '/producao', icon: '🍪', label: 'Produção'      },
            ].map(a => (
              <Link
                key={a.to}
                to={a.to}
                className="flex flex-col items-center gap-2 p-4 rounded-xl hover:shadow-md transition-all text-center"
                style={{ background: '#fff', border: '1px solid #E5E0D9' }}
              >
                <span className="text-2xl">{a.icon}</span>
                <span className="text-xs font-medium" style={{ color: '#44403C' }}>{a.label}</span>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
