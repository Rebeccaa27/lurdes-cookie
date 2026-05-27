import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, ShoppingBag, CircleDollarSign, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { supabase } from '../lib/supabaseClient'
import { useEstoque } from '../lib/hooks'
import CardResumo from '../components/ui/CardResumo'
import StockMeter from '../components/dashboard/StockMeter'
import AlertBanner from '../components/dashboard/AlertBanner'
import Badge from '../components/ui/Badge'
import { formatBRL, formatDate, MESES_CURTOS } from '../lib/utils'
import { INGREDIENTES, catalogoReceitas } from '../lib/receitas'
import { catalogoReceitas } from '../lib/receitas'

// Tooltip customizado para o gráfico
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-cream-200 rounded-xl px-3 py-2 shadow-card text-xs">
      <p className="text-ink-400 mb-1">{label}</p>
      <p className="font-semibold text-terra">{formatBRL(payload[0].value)}</p>
    </div>
  )
}

const TOP_INGREDIENTS = ['manteiga', 'farinha', 'gotas_pretas', 'nutella', 'leite_condensado']

export default function Dashboard() {
  const now  = new Date()
  const mes  = now.getMonth()
  const ano  = now.getFullYear()

  const [stats,   setStats]   = useState(null)
  const [recent,  setRecent]  = useState([])
  const [chart,   setChart]   = useState([])
  const [topSales, setTopSales] = useState([])
  const [loading, setLoading] = useState(true)

  const { estoqueMap } = useEstoque()

  useEffect(() => {
    async function load() {
      setLoading(true)
      const start = `${ano}-${String(mes+1).padStart(2,'0')}-01`
      const end   = new Date(ano, mes+1, 1).toISOString().slice(0,10)

      const { data: vendas } = await supabase
        .from('vendas').select('*').gte('data', start).lt('data', end)
        .order('data', { ascending: false })

      const all = vendas || []
      const totalVendas  = all.reduce((s,v) => s + (v.valor||0), 0)
      const totalPago    = all.filter(v=>v.pag==='pago').reduce((s,v)=>s+v.valor,0)
      const totalFiado   = all.filter(v=>v.pag==='fiado').reduce((s,v)=>s+v.valor,0)
      const nDevedores   = new Set(all.filter(v=>v.pag==='fiado').map(v=>v.cliente)).size
      setStats({ totalVendas, totalPago, totalFiado, nDevedores, nVendas: all.length })
      setRecent(all.slice(0, 5))

      // Chart — últimos 7 meses
      const chartData = []
      for (let i = 6; i >= 0; i--) {
        const d = new Date(ano, mes - i, 1)
        const s = d.toISOString().slice(0,10)
        const e = new Date(d.getFullYear(), d.getMonth()+1,1).toISOString().slice(0,10)
        const { data } = await supabase.from('vendas').select('valor').gte('data',s).lt('data',e)
        chartData.push({
          mes: MESES_CURTOS[d.getMonth()],
          total: (data||[]).reduce((sum,v)=>sum+(v.valor||0),0),
        })
      }
      setChart(chartData)

      // Top sabores
      const contagem = {}
      all.forEach(v => { contagem[v.sabor] = (contagem[v.sabor]||0) + (v.qtd||1) })
      const sorted = Object.entries(contagem).sort((a,b)=>b[1]-a[1]).slice(0,4)
      setTopSales(sorted)

      setLoading(false)
    }
    load()
  }, [mes, ano])

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{duration:.25}}
      className="p-6 lg:p-8 max-w-6xl mx-auto">

      <AlertBanner estoqueMap={estoqueMap} />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6 anim-stagger">
        <CardResumo label="Total do mês"   value={formatBRL(stats?.totalVendas)}  color="terra"   icon={TrendingUp}        delay={0}    loading={loading} />
        <CardResumo label="Recebido"       value={formatBRL(stats?.totalPago)}    color="success" icon={ShoppingBag}       delay={.06}  loading={loading} />
        <CardResumo label="A receber"      value={formatBRL(stats?.totalFiado)}   color="danger"  icon={CircleDollarSign}  delay={.12}  loading={loading} />
        <CardResumo label="Clientes fiado" value={stats?.nDevedores ?? '—'}       color="warning" icon={Users}             delay={.18}  loading={loading} />
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-5 mb-6">
        {/* Sales chart — spans 2 cols */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-card-lg border border-cream-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-serif text-base font-medium text-ink-700">Vendas recentes</h3>
              <p className="text-xs text-ink-400 mt-0.5">Últimos 7 meses</p>
            </div>
            {chart.length > 0 && (
              <span className="text-sm font-semibold text-terra">
                {formatBRL(chart[chart.length-1]?.total)}
              </span>
            )}
          </div>
          {loading ? <div className="skeleton h-44 rounded-2xl" /> : (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chart} margin={{top:4,right:4,left:-20,bottom:0}}>
                <defs>
                  <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#BC544B" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#BC544B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="mes" tick={{fontSize:11,fill:'#A8A29E'}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize:11,fill:'#A8A29E'}} axisLine={false} tickLine={false} tickFormatter={v=>`R$${v/1000}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="total" stroke="#BC544B" strokeWidth={2.5}
                  fill="url(#g)" dot={{fill:'#BC544B',strokeWidth:0,r:3}}
                  activeDot={{r:5,fill:'#BC544B',strokeWidth:0}} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Itens mais vendidos */}
        <div className="bg-white rounded-3xl shadow-card-lg border border-cream-200 p-6">
          <h3 className="font-serif text-base font-medium text-ink-700 mb-4">Itens Mais Vendidos</h3>
          {loading ? (
            <div className="flex flex-col gap-3">
              {[1,2,3,4].map(i=><div key={i} className="skeleton h-12 rounded-xl"/>)}
            </div>
          ) : topSales.length === 0 ? (
            <p className="text-xs text-ink-300 text-center py-8">Nenhuma venda ainda</p>
          ) : (
            <div className="flex flex-col gap-2">
              {topSales.map(([sabor, qty]) => {
                const r = Object.values(catalogoReceitas).find(x=>x.nome===sabor)
                return (
                  <div key={sabor} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-cream-100 transition-colors">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                      style={{background:`${r?.cor}20`}}>
                      {r?.emoji ?? '🍪'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink-700 truncate">{sabor}</p>
                      <p className="text-xs text-ink-400">{formatBRL((r?.preco??10)*qty)}</p>
                    </div>
                    <Badge variant="terra">{qty} un</Badge>
                  </div>
                )
              })}
            </div>
          )}

          {/* Alertas de estoque */}
          <div className="mt-5 bg-terra rounded-2xl p-4">
            <p className="text-sm font-semibold text-white mb-2">Alertas de Estoque</p>
            <p className="text-xs text-terra-200 leading-relaxed">
              {INGREDIENTES
                .filter(i => (estoqueMap[i.id] ?? 0) <= i.estoque_minimo)
                .slice(0, 3)
                .map(i => i.label)
                .join(', ') || 'Tudo OK por agora.'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Estoque em tempo real — top ingredients */}
      <div className="bg-white rounded-3xl shadow-card-lg border border-cream-200 p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-serif text-base font-medium text-ink-700">Estoque em Tempo Real</h3>
          <Link to="/estoque" className="text-xs text-terra hover:underline">Ver completo →</Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {TOP_INGREDIENTS.map(id => {
            const ing = INGREDIENTES.find(i=>i.id===id)
            if (!ing) return null
            return (
              <StockMeter key={id} label={ing.label}
                qty={estoqueMap[id] ?? 0} min={ing.estoque_minimo} unit={ing.unit} />
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}