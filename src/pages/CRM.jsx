import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { motion, AnimatePresence } from 'framer-motion'

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

function normalizarNome(nome) {
  return nome.trim().toLowerCase().replace(/\s+/g, ' ')
    .replace(/(^|\s)\S/g, l => l.toUpperCase())
}

export default function CRM() {
  const hoje = new Date()
  const [mes, setMes]       = useState(hoje.getMonth())
  const [ano, setAno]       = useState(hoje.getFullYear())
  const [dados, setDados]   = useState([])
  const [loading, setLoading] = useState(true)
  const [clienteAberto, setClienteAberto] = useState(null)
  const [vendaCliente, setVendaCliente]   = useState([])
  const [historicoMeses, setHistoricoMeses] = useState([])
  const [aba, setAba] = useState('devendo') // 'devendo' | 'pagos' | 'historico'

  const buscarDados = useCallback(async () => {
    setLoading(true)
    const start = `${ano}-${String(mes + 1).padStart(2, '0')}-01`
    const end   = new Date(ano, mes + 1, 1).toISOString().slice(0, 10)

    const { data: vendas } = await supabase
      .from('vendas')
      .select('id, cliente, sabor, qtd, valor, pag, data')
      .gte('data', start)
      .lt('data', end)

    if (!vendas) { setLoading(false); return }

    // Agrupa por nome normalizado
    const mapa = {}
    vendas.forEach(v => {
      const key = normalizarNome(v.cliente)
      if (!mapa[key]) mapa[key] = { nome: normalizarNome(v.cliente), compras: [], total: 0, pago: false }
      mapa[key].compras.push(v)
      mapa[key].total += Number(v.valor) * Number(v.qtd)
    })

    // Busca status de pagamento mensal
    const { data: status } = await supabase
      .from('crm_status')
      .select('cliente_key, pago, pago_em')
      .eq('mes', mes + 1)
      .eq('ano', ano)

    const statusMap = {}
    ;(status || []).forEach(s => { statusMap[s.cliente_key] = s })

    const lista = Object.values(mapa).map(c => ({
      ...c,
      pago: statusMap[normalizarNome(c.nome)]?.pago || false,
      pago_em: statusMap[normalizarNome(c.nome)]?.pago_em || null,
    }))

    lista.sort((a, b) => a.nome.localeCompare(b.nome))
    setDados(lista)
    setLoading(false)
  }, [mes, ano])

  const buscarHistorico = useCallback(async () => {
    const { data } = await supabase
      .from('crm_status')
      .select('cliente_key, mes, ano, pago, pago_em')
      .eq('pago', true)
      .order('ano', { ascending: false })
      .order('mes', { ascending: false })
      .limit(100)
    setHistoricoMeses(data || [])
  }, [])

  useEffect(() => { buscarDados() }, [buscarDados])
  useEffect(() => { buscarHistorico() }, [buscarHistorico])

  // Realtime
  useEffect(() => {
    const ch = supabase.channel('crm-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vendas' }, buscarDados)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'crm_status' }, buscarDados)
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [buscarDados])

  async function marcarPago(nomeKey) {
    await supabase.from('crm_status').upsert({
      cliente_key: nomeKey,
      mes: mes + 1,
      ano,
      pago: true,
      pago_em: new Date().toISOString(),
    }, { onConflict: 'cliente_key,mes,ano' })
    buscarDados()
  }

  async function abrirCliente(cliente) {
    setClienteAberto(cliente)
    setVendaCliente(cliente.compras)
  }

  const devendo = dados.filter(c => !c.pago)
  const pagos   = dados.filter(c => c.pago)

  const totalDevendo = devendo.reduce((s, c) => s + c.total, 0)
  const totalPago    = pagos.reduce((s, c) => s + c.total, 0)

  function navMes(dir) {
    let m = mes + dir, a = ano
    if (m < 0) { m = 11; a-- }
    if (m > 11) { m = 0; a++ }
    setMes(m); setAno(a)
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Título */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: '#1C1917' }}>CRM de Cobranças</h1>
        <p className="text-sm mt-0.5" style={{ color: '#78716C' }}>Controle mensal de clientes e pagamentos</p>
      </div>

      {/* Navegação de mês */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navMes(-1)} className="p-1.5 rounded-lg hover:bg-black/10 transition">‹</button>
        <span className="font-semibold text-sm" style={{ color: '#1C1917' }}>{MESES[mes]} {ano}</span>
        <button onClick={() => navMes(1)} className="p-1.5 rounded-lg hover:bg-black/10 transition">›</button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Clientes', value: dados.length, color: '#1C1917' },
          { label: 'A Receber', value: `R$ ${totalDevendo.toFixed(2).replace('.',',')}`, color: '#C2410C' },
          { label: 'Recebido', value: `R$ ${totalPago.toFixed(2).replace('.',',')}`, color: '#15803D' },
          { label: 'Pagos', value: pagos.length, color: '#15803D' },
        ].map(k => (
          <div key={k.label} className="rounded-xl p-4" style={{ background: '#fff', border: '1px solid #E5E0D9' }}>
            <p className="text-xs mb-1" style={{ color: '#78716C' }}>{k.label}</p>
            <p className="text-xl font-bold" style={{ color: k.color }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Abas */}
      <div className="flex gap-1 mb-4 bg-white rounded-xl p-1 w-fit" style={{ border: '1px solid #E5E0D9' }}>
        {[['devendo','Devendo','🔴'],['pagos','Pagos','✅'],['historico','Histórico','📅']].map(([id, label, ico]) => (
          <button
            key={id}
            onClick={() => setAba(id)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              aba === id ? 'text-white' : 'text-stone-500 hover:text-stone-800'
            }`}
            style={aba === id ? { background: '#C2410C' } : {}}
          >{ico} {label}</button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#C2410C', borderTopColor: 'transparent' }} />
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {aba === 'devendo' && (
            <motion.div key="devendo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {devendo.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-4xl mb-3">🎉</p>
                  <p className="font-semibold" style={{ color: '#1C1917' }}>Nenhum cliente devendo!</p>
                  <p className="text-sm mt-1" style={{ color: '#78716C' }}>Todos os clientes deste mês já pagaram.</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {devendo.map(c => (
                    <ClienteCard key={c.nome} cliente={c} onAbrir={abrirCliente} onPago={marcarPago} />
                  ))}
                </div>
              )}
            </motion.div>
          )}
          {aba === 'pagos' && (
            <motion.div key="pagos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {pagos.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-4xl mb-3">💳</p>
                  <p className="font-semibold" style={{ color: '#1C1917' }}>Nenhum pagamento registrado ainda</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {pagos.map(c => (
                    <ClienteCard key={c.nome} cliente={c} pago onAbrir={abrirCliente} />
                  ))}
                </div>
              )}
            </motion.div>
          )}
          {aba === 'historico' && (
            <motion.div key="historico" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <HistoricoPagamentos dados={historicoMeses} />
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Modal cliente */}
      <AnimatePresence>
        {clienteAberto && (
          <ModalCliente
            cliente={clienteAberto}
            vendas={vendaCliente}
            onClose={() => setClienteAberto(null)}
            onPago={() => { marcarPago(normalizarNome(clienteAberto.nome)); setClienteAberto(null) }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function ClienteCard({ cliente, pago, onAbrir, onPago }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between p-4 rounded-xl cursor-pointer hover:shadow-md transition-all"
      style={{ background: '#fff', border: '1px solid #E5E0D9' }}
      onClick={() => onAbrir(cliente)}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
          style={{ background: pago ? '#15803D' : '#C2410C' }}
        >
          {cliente.nome.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-sm" style={{ color: '#1C1917' }}>{cliente.nome}</p>
          <p className="text-xs" style={{ color: '#78716C' }}>{cliente.compras.length} compra{cliente.compras.length !== 1 ? 's' : ''} · {MESES[new Date().getMonth()]}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-bold text-sm" style={{ color: pago ? '#15803D' : '#C2410C' }}>
          R$ {cliente.total.toFixed(2).replace('.',',')}
        </span>
        {!pago && onPago && (
          <button
            onClick={e => { e.stopPropagation(); onPago(normalizarNome(cliente.nome)) }}
            className="px-3 py-1.5 rounded-lg text-white text-xs font-semibold transition hover:opacity-80"
            style={{ background: '#15803D' }}
          >
            ✓ Pago
          </button>
        )}
        {pago && (
          <span className="px-2 py-1 rounded-full text-xs font-semibold" style={{ background: '#DCFCE7', color: '#15803D' }}>Pago</span>
        )}
      </div>
    </motion.div>
  )
}

function ModalCliente({ cliente, vendas, onClose, onPago }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        className="w-full max-w-md rounded-2xl p-6"
        style={{ background: '#fff' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-lg" style={{ color: '#1C1917' }}>{cliente.nome}</h2>
            <p className="text-sm" style={{ color: '#78716C' }}>Histórico do mês</p>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 text-xl">×</button>
        </div>

        <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
          {vendas.map(v => (
            <div key={v.id} className="flex justify-between items-center py-2 border-b" style={{ borderColor: '#F5F0EB' }}>
              <div>
                <p className="text-sm font-medium" style={{ color: '#1C1917' }}>🍪 {v.sabor} × {v.qtd}</p>
                <p className="text-xs" style={{ color: '#78716C' }}>{new Date(v.data).toLocaleDateString('pt-BR')}</p>
              </div>
              <span className="text-sm font-bold" style={{ color: '#C2410C' }}>R$ {(v.valor * v.qtd).toFixed(2).replace('.',',')}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl mb-4" style={{ background: '#FEF3C7' }}>
          <span className="font-semibold text-sm">Total pendente</span>
          <span className="font-bold text-lg" style={{ color: '#C2410C' }}>R$ {cliente.total.toFixed(2).replace('.',',')}</span>
        </div>

        {!cliente.pago && (
          <button
            onClick={onPago}
            className="w-full py-3 rounded-xl text-white font-semibold transition hover:opacity-80"
            style={{ background: '#15803D' }}
          >
            ✓ Marcar como Pago
          </button>
        )}
      </motion.div>
    </motion.div>
  )
}

function HistoricoPagamentos({ dados }) {
  if (!dados.length) return (
    <div className="text-center py-16">
      <p className="text-4xl mb-3">📅</p>
      <p className="font-semibold" style={{ color: '#1C1917' }}>Nenhum histórico ainda</p>
      <p className="text-sm mt-1" style={{ color: '#78716C' }}>Os pagamentos confirmados aparecerão aqui.</p>
    </div>
  )

  // Agrupa por mês/ano
  const grupos = {}
  dados.forEach(d => {
    const key = `${MESES[d.mes - 1]} ${d.ano}`
    if (!grupos[key]) grupos[key] = []
    grupos[key].push(d)
  })

  return (
    <div className="space-y-4">
      {Object.entries(grupos).map(([periodo, items]) => (
        <div key={periodo} className="rounded-xl p-4" style={{ background: '#fff', border: '1px solid #E5E0D9' }}>
          <p className="font-semibold text-sm mb-3" style={{ color: '#1C1917' }}>{periodo}</p>
          <div className="space-y-1.5">
            {items.map(item => (
              <div key={item.cliente_key} className="flex items-center justify-between text-sm">
                <span style={{ color: '#44403C' }}>{item.cliente_key}</span>
                <span className="text-xs" style={{ color: '#78716C' }}>
                  {item.pago_em ? new Date(item.pago_em).toLocaleDateString('pt-BR') : '—'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: '#DCFCE7', color: '#15803D' }}>Pago</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
