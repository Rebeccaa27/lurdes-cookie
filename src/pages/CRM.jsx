import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { motion, AnimatePresence } from 'framer-motion'

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

const COLS = [
  { id: 'devendo', label: 'A receber',  color: '#C2410C', bg: '#FFF5F0', border: '#FED7C3' },
  { id: 'pagos',   label: 'Recebido',   color: '#166534', bg: '#F0FDF4', border: '#BBF7D0' },
  { id: 'historico', label: 'Histórico', color: '#1A1714', bg: '#F8F5F1', border: '#E8E2DA' },
]

function normalizarNome(nome) {
  return nome.trim().toLowerCase().replace(/\s+/g, ' ')
    .replace(/(^|\s)\S/g, l => l.toUpperCase())
}

function Avatar({ nome, color }) {
  return (
    <div
      className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
      style={{ background: color }}
    >
      {nome?.charAt(0)?.toUpperCase()}
    </div>
  )
}

function CardCliente({ cliente, pago, onAbrir, onPago }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="w-full text-left p-3.5 rounded-xl cursor-pointer transition-all hover:shadow-md"
      style={{ background: '#fff', border: '1px solid #E8E2DA' }}
      onClick={() => onAbrir && onAbrir(cliente)}
    >
      <div className="flex items-start gap-3">
        <Avatar nome={cliente.nome} color={pago ? '#166534' : '#C2410C'} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: '#1A1714' }}>{cliente.nome}</p>
          <p className="text-xs mt-0.5" style={{ color: '#9E9589' }}>
            {cliente.compras.length} {cliente.compras.length === 1 ? 'compra' : 'compras'}
          </p>
        </div>
        <p className="text-sm font-bold flex-shrink-0" style={{ color: pago ? '#166534' : '#C2410C' }}>
          R$ {cliente.total.toFixed(2).replace('.',',')}
        </p>
      </div>

      {/* Sabores comprados */}
      <div className="flex flex-wrap gap-1 mt-2.5">
        {[...new Set(cliente.compras.map(c => c.sabor))].slice(0, 3).map(s => (
          <span key={s} className="text-2xs px-2 py-0.5 rounded-md font-medium"
            style={{ background: '#F0EBE3', color: '#78716C', fontSize: 11 }}>
            {s}
          </span>
        ))}
      </div>

      {!pago && onPago && (
        <button
          onClick={e => { e.stopPropagation(); onPago(normalizarNome(cliente.nome).toLowerCase()) }}
          className="w-full mt-3 py-1.5 rounded-lg text-xs font-semibold transition hover:opacity-80"
          style={{ background: '#166534', color: '#fff' }}
        >
          Confirmar pagamento
        </button>
      )}

      {pago && cliente.pago_em && (
        <p className="text-2xs mt-2" style={{ color: '#9E9589', fontSize: 10 }}>
          Pago em {new Date(cliente.pago_em).toLocaleDateString('pt-BR')}
        </p>
      )}
    </motion.div>
  )
}

function HistoricoItem({ item }) {
  return (
    <div className="p-3.5 rounded-xl" style={{ background: '#fff', border: '1px solid #E8E2DA' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Avatar nome={item.cliente_key} color="#9E9589" />
          <div>
            <p className="text-sm font-medium" style={{ color: '#1A1714' }}>{item.cliente_key}</p>
            <p className="text-xs" style={{ color: '#9E9589' }}>{MESES[item.mes - 1]} {item.ano}</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs px-2 py-0.5 rounded-md font-semibold"
            style={{ background: '#DCFCE7', color: '#166534' }}>Pago</span>
          {item.pago_em && (
            <p className="text-2xs mt-0.5" style={{ color: '#9E9589', fontSize: 10 }}>
              {new Date(item.pago_em).toLocaleDateString('pt-BR')}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default function CRM() {
  const hoje = new Date()
  const [mes, setMes]       = useState(hoje.getMonth())
  const [ano, setAno]       = useState(hoje.getFullYear())
  const [dados, setDados]   = useState([])
  const [loading, setLoading] = useState(true)
  const [clienteAberto, setClienteAberto] = useState(null)
  const [historicoMeses, setHistoricoMeses] = useState([])
  const [confirmFechar, setConfirmFechar]   = useState(false)
  const [fechandoMes, setFechandoMes]       = useState(false)

  const buscarDados = useCallback(async () => {
    setLoading(true)
    const start = `${ano}-${String(mes + 1).padStart(2, '0')}-01`
    const end   = new Date(ano, mes + 1, 1).toISOString().slice(0, 10)

    const { data: vendas } = await supabase
      .from('vendas')
      .select('id,cliente,sabor,qtd,valor,pag,data')
      .gte('data', start).lt('data', end)

    if (!vendas) { setLoading(false); return }

    const mapa = {}
    vendas.forEach(v => {
      const key = normalizarNome(v.cliente).toLowerCase()
      if (!mapa[key]) mapa[key] = { nome: normalizarNome(v.cliente), compras: [], total: 0 }
      mapa[key].compras.push(v)
      mapa[key].total += Number(v.valor) * Number(v.qtd)
    })

    const { data: status } = await supabase
      .from('crm_status').select('cliente_key,pago,pago_em')
      .eq('mes', mes + 1).eq('ano', ano)

    const statusMap = {}
    ;(status || []).forEach(s => { statusMap[s.cliente_key] = s })

    const lista = Object.values(mapa).map(c => ({
      ...c,
      pago:    statusMap[normalizarNome(c.nome).toLowerCase()]?.pago    || false,
      pago_em: statusMap[normalizarNome(c.nome).toLowerCase()]?.pago_em || null,
    })).sort((a, b) => a.nome.localeCompare(b.nome))

    setDados(lista)
    setLoading(false)
  }, [mes, ano])

  const buscarHistorico = useCallback(async () => {
    const { data } = await supabase
      .from('crm_status').select('cliente_key,mes,ano,pago,pago_em')
      .eq('pago', true).order('ano', { ascending: false }).order('mes', { ascending: false }).limit(80)
    setHistoricoMeses(data || [])
  }, [])

  useEffect(() => { buscarDados() }, [buscarDados])
  useEffect(() => { buscarHistorico() }, [buscarHistorico])

  useEffect(() => {
    const ch = supabase.channel('crm-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vendas' }, buscarDados)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'crm_status' }, buscarDados)
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [buscarDados])

  async function marcarPago(nomeKey) {
    await supabase.from('crm_status').upsert(
      { cliente_key: nomeKey.toLowerCase(), mes: mes + 1, ano, pago: true, pago_em: new Date().toISOString() },
      { onConflict: 'cliente_key,mes,ano' }
    )
    buscarDados()
    buscarHistorico()
  }

  async function fecharMes() {
    setFechandoMes(true)
    await new Promise(r => setTimeout(r, 400))
    setConfirmFechar(false)
    setFechandoMes(false)
    buscarHistorico()
  }

  function navMes(dir) {
    let m = mes + dir, a = ano
    if (m < 0)  { m = 11; a-- }
    if (m > 11) { m = 0;  a++ }
    setMes(m); setAno(a)
  }

  const devendo = dados.filter(c => !c.pago)
  const pagos   = dados.filter(c =>  c.pago)
  const totalDevendo = devendo.reduce((s, c) => s + c.total, 0)
  const totalPago    = pagos.reduce((s, c) => s + c.total, 0)
  const mesAtual = hoje.getMonth() === mes && hoje.getFullYear() === ano

  const colData = {
    devendo:   devendo,
    pagos:     pagos,
    historico: historicoMeses,
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 lg:py-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#9E9589' }}>Cobranças</p>
          <h1 className="text-3xl font-bold" style={{ color: '#1A1714' }}>CRM</h1>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Nav mês */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{ background: '#fff', border: '1px solid #E8E2DA' }}>
            <button onClick={() => navMes(-1)} className="text-lg leading-none font-light hover:opacity-60 transition" style={{ color: '#9E9589' }}>‹</button>
            <span className="text-sm font-semibold px-1" style={{ color: '#1A1714' }}>{MESES[mes]} {ano}</span>
            <button onClick={() => navMes(1)}  className="text-lg leading-none font-light hover:opacity-60 transition" style={{ color: '#9E9589' }}>›</button>
          </div>
          {mesAtual && (
            <button
              onClick={() => setConfirmFechar(true)}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition hover:opacity-80"
              style={{ background: '#1A1714', color: '#fff' }}
            >
              Fechar mês
            </button>
          )}
        </div>
      </div>

      {/* Resumo numérico */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Clientes',   value: dados.length,                                           color: '#1A1714' },
          { label: 'A receber',  value: `R$ ${totalDevendo.toFixed(2).replace('.',',')}`,        color: '#C2410C' },
          { label: 'Recebido',   value: `R$ ${totalPago.toFixed(2).replace('.',',')}`,           color: '#166534' },
          { label: 'Pagos',      value: pagos.length,                                            color: '#166534' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl p-4" style={{ background: '#fff', border: '1px solid #E8E2DA' }}>
            <p className="text-xs uppercase tracking-wider" style={{ color: '#9E9589' }}>{k.label}</p>
            <p className="text-xl font-bold mt-1" style={{ color: k.color }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Kanban */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#C2410C', borderTopColor: 'transparent' }} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {COLS.map(col => (
            <div key={col.id} className="flex flex-col rounded-2xl overflow-hidden" style={{ border: `1px solid ${col.border}`, background: col.bg, minHeight: 400 }}>

              {/* Coluna header */}
              <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${col.border}` }}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: col.color }} />
                  <p className="text-xs font-bold uppercase tracking-wider" style={{ color: col.color }}>{col.label}</p>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: '#fff', color: col.color }}>
                  {col.id === 'historico' ? historicoMeses.length : colData[col.id].length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex-1 p-3 overflow-y-auto space-y-2" style={{ maxHeight: 520 }}>
                <AnimatePresence>
                  {col.id === 'historico' ? (
                    historicoMeses.length === 0 ? (
                      <p className="text-xs text-center py-8" style={{ color: '#9E9589' }}>Nenhum registro ainda</p>
                    ) : (
                      historicoMeses.map(item => <HistoricoItem key={`${item.cliente_key}-${item.mes}-${item.ano}`} item={item} />)
                    )
                  ) : colData[col.id].length === 0 ? (
                    <p className="text-xs text-center py-8" style={{ color: col.color, opacity: 0.5 }}>
                      {col.id === 'devendo' ? 'Nenhum cliente devendo' : 'Nenhum pagamento confirmado'}
                    </p>
                  ) : (
                    colData[col.id].map(c => (
                      <CardCliente
                        key={c.nome}
                        cliente={c}
                        pago={col.id === 'pagos'}
                        onAbrir={setClienteAberto}
                        onPago={col.id === 'devendo' ? marcarPago : null}
                      />
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal detalhes cliente */}
      <AnimatePresence>
        {clienteAberto && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.45)' }}
            onClick={() => setClienteAberto(null)}
          >
            <motion.div
              initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }}
              transition={{ type: 'spring', damping: 24, stiffness: 300 }}
              className="w-full max-w-md rounded-2xl p-6"
              style={{ background: '#fff' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <Avatar nome={clienteAberto.nome} color={clienteAberto.pago ? '#166534' : '#C2410C'} />
                  <div>
                    <p className="font-bold" style={{ color: '#1A1714' }}>{clienteAberto.nome}</p>
                    <p className="text-xs" style={{ color: '#9E9589' }}>Histórico do mês</p>
                  </div>
                </div>
                <button onClick={() => setClienteAberto(null)} className="text-xl leading-none" style={{ color: '#9E9589' }}>×</button>
              </div>

              <div className="space-y-2 mb-5 max-h-56 overflow-y-auto">
                {clienteAberto.compras.map(v => (
                  <div key={v.id} className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid #F5F0EB' }}>
                    <div>
                      <p className="text-sm font-medium" style={{ color: '#1A1714' }}>{v.sabor} × {v.qtd}</p>
                      <p className="text-xs" style={{ color: '#9E9589' }}>{new Date(v.data + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                    </div>
                    <span className="text-sm font-bold" style={{ color: '#C2410C' }}>R$ {(v.valor * v.qtd).toFixed(2).replace('.',',')}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between px-4 py-3 rounded-xl mb-4" style={{ background: '#FEF3C7' }}>
                <span className="text-sm font-semibold" style={{ color: '#92400E' }}>Total pendente</span>
                <span className="text-lg font-bold" style={{ color: '#C2410C' }}>R$ {clienteAberto.total.toFixed(2).replace('.',',')}</span>
              </div>

              {!clienteAberto.pago && (
                <button
                  onClick={() => { marcarPago(normalizarNome(clienteAberto.nome).toLowerCase()); setClienteAberto(null) }}
                  className="w-full py-3 rounded-xl text-white text-sm font-semibold transition hover:opacity-80"
                  style={{ background: '#166534' }}
                >
                  Confirmar pagamento
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal fechar mês */}
      <AnimatePresence>
        {confirmFechar && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.45)' }}
            onClick={() => setConfirmFechar(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm rounded-2xl p-6"
              style={{ background: '#fff' }}
              onClick={e => e.stopPropagation()}
            >
              <p className="font-bold text-lg mb-2" style={{ color: '#1A1714' }}>Fechar {MESES[mes]}?</p>
              <p className="text-sm mb-4" style={{ color: '#78716C' }}>
                Clientes pagos serão movidos para o Histórico. Devedores continuam visíveis no próximo mês.
              </p>
              <div className="flex gap-2">
                <button onClick={() => setConfirmFechar(false)}
                  className="flex-1 py-2.5 rounded-xl border text-sm" style={{ borderColor: '#E5E0D9', color: '#78716C' }}>Cancelar</button>
                <button onClick={fecharMes} disabled={fechandoMes}
                  className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-50" style={{ background: '#1A1714' }}>
                  {fechandoMes ? 'Fechando...' : 'Confirmar'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
