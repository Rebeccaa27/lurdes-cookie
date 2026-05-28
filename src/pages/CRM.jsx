import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { motion, AnimatePresence } from 'framer-motion'

const MESES = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
]

const COLS = [
  { id: 'devendo',   label: 'A receber', color: 'var(--brand)',   bg: '#FFF8F5', border: '#FDDCCC' },
  { id: 'pagos',     label: 'Recebido',  color: 'var(--success)', bg: '#F0FDF4', border: '#BBF7D0' },
  { id: 'historico', label: 'Histórico', color: 'var(--text-lo)', bg: 'var(--bg)', border: 'var(--border)' },
]

function normKey(nome) {
  return nome.trim().toLowerCase().replace(/\s+/g, ' ')
}
function normDisplay(nome) {
  return normKey(nome).replace(/(^|\s)\S/g, l => l.toUpperCase())
}

function Avatar({ nome, color }) {
  return (
    <div
      className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
      style={{ background: color }}
    >
      {nome?.trim().charAt(0).toUpperCase()}
    </div>
  )
}

function CardCliente({ cliente, pago, onAbrir, onPago, loadingKey }) {
  const isLoading = loadingKey === normKey(cliente.nome)
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="rounded-xl p-3.5 cursor-pointer"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)', transition: 'box-shadow .15s' }}
      onClick={() => onAbrir && onAbrir(cliente)}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,.08)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      <div className="flex items-start gap-3">
        <Avatar nome={cliente.nome} color={pago ? 'var(--success)' : 'var(--brand)'} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-hi)' }}>{cliente.nome}</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-lo)' }}>
            {cliente.compras.length} {cliente.compras.length === 1 ? 'compra' : 'compras'}
          </p>
        </div>
        <p className="text-sm font-bold flex-shrink-0" style={{ color: pago ? 'var(--success)' : 'var(--brand)' }}>
          R$ {cliente.total.toFixed(2).replace('.',',')}
        </p>
      </div>

      <div className="flex flex-wrap gap-1 mt-2.5">
        {[...new Set(cliente.compras.map(c => c.sabor))].slice(0, 4).map(s => (
          <span key={s} className="badge badge-gray">{s}</span>
        ))}
      </div>

      {pago && cliente.pago_em && (
        <p className="text-xs mt-2" style={{ color: 'var(--text-lo)' }}>
          Pago em {new Date(cliente.pago_em).toLocaleDateString('pt-BR')}
        </p>
      )}

      {!pago && onPago && (
        <button
          disabled={isLoading}
          onClick={e => {
            e.stopPropagation()
            onPago(normKey(cliente.nome))
          }}
          className="btn w-full mt-3"
          style={{
            background: 'var(--success)',
            color: '#fff',
            fontSize: '.8125rem',
            padding: '.375rem .75rem',
            opacity: isLoading ? .6 : 1,
          }}
        >
          {isLoading
            ? <span className="spinner" style={{ width: 14, height: 14, borderColor: 'rgba(255,255,255,.3)', borderTopColor: '#fff' }} />
            : 'Confirmar pagamento'
          }
        </button>
      )}
    </motion.div>
  )
}

function HistoricoItem({ item }) {
  return (
    <div className="rounded-xl p-3.5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Avatar nome={item.cliente_key} color="var(--text-lo)" />
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-hi)' }}>{normDisplay(item.cliente_key)}</p>
            <p className="text-xs" style={{ color: 'var(--text-lo)' }}>{MESES[item.mes - 1]} {item.ano}</p>
          </div>
        </div>
        <div className="text-right">
          <span className="badge badge-green">Pago</span>
          {item.pago_em && (
            <p className="text-xs mt-1" style={{ color: 'var(--text-lo)' }}>
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
  const [mes, setMes]     = useState(hoje.getMonth())
  const [ano, setAno]     = useState(hoje.getFullYear())
  const [dados, setDados] = useState([])
  const [loading, setLoading]     = useState(true)
  const [loadingKey, setLoadingKey] = useState(null)   // chave do cliente sendo processado
  const [erroMsg, setErroMsg]       = useState(null)
  const [clienteAberto, setClienteAberto] = useState(null)
  const [historico, setHistorico]   = useState([])
  const [confirmFechar, setConfirmFechar] = useState(false)
  const [fechandoMes, setFechandoMes]     = useState(false)

  // ── Buscar vendas + status do mês ──
  const buscarDados = useCallback(async () => {
    setLoading(true)
    const start = `${ano}-${String(mes + 1).padStart(2, '0')}-01`
    const end   = new Date(ano, mes + 1, 1).toISOString().slice(0, 10)

    const { data: vendas, error: eV } = await supabase
      .from('vendas')
      .select('id,cliente,sabor,qtd,valor,pag,data')
      .gte('data', start).lt('data', end)

    if (eV) { console.error('vendas:', eV); setLoading(false); return }

    const mapa = {}
    ;(vendas || []).forEach(v => {
      const key = normKey(v.cliente)
      if (!mapa[key]) mapa[key] = { nome: normDisplay(v.cliente), compras: [], total: 0 }
      mapa[key].compras.push(v)
      mapa[key].total += Number(v.valor)
    })

    const { data: status, error: eS } = await supabase
      .from('crm_status')
      .select('cliente_key,pago,pago_em')
      .eq('mes', mes + 1).eq('ano', ano)

    if (eS) console.error('crm_status:', eS)

    const sm = {}
    ;(status || []).forEach(s => { sm[s.cliente_key] = s })

    setDados(
      Object.values(mapa)
        .map(c => ({
          ...c,
          pago:    sm[normKey(c.nome)]?.pago    ?? false,
          pago_em: sm[normKey(c.nome)]?.pago_em ?? null,
        }))
        .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
    )
    setLoading(false)
  }, [mes, ano])

  // ── Buscar histórico de todos os meses ──
  const buscarHistorico = useCallback(async () => {
    const { data } = await supabase
      .from('crm_status')
      .select('cliente_key,mes,ano,pago,pago_em')
      .eq('pago', true)
      .order('ano',  { ascending: false })
      .order('mes',  { ascending: false })
      .limit(100)
    setHistorico(data || [])
  }, [])

  useEffect(() => { buscarDados()    }, [buscarDados])
  useEffect(() => { buscarHistorico() }, [buscarHistorico])

  // Realtime
  useEffect(() => {
    const ch = supabase.channel('crm-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vendas' },     buscarDados)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'crm_status' }, () => { buscarDados(); buscarHistorico() })
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [buscarDados, buscarHistorico])

  // ── Marcar como pago ──
  async function marcarPago(nomeKey) {
    setLoadingKey(nomeKey)
    setErroMsg(null)

    // Optimistic update
    setDados(prev => prev.map(c =>
      normKey(c.nome) === nomeKey
        ? { ...c, pago: true, pago_em: new Date().toISOString() }
        : c
    ))
    // Fechar modal se estava aberto
    setClienteAberto(prev =>
      prev && normKey(prev.nome) === nomeKey ? null : prev
    )

    const { error } = await supabase
      .from('crm_status')
      .upsert(
        {
          cliente_key: nomeKey,
          mes:         mes + 1,
          ano,
          pago:        true,
          pago_em:     new Date().toISOString(),
        },
        { onConflict: 'cliente_key,mes,ano' }
      )

    if (error) {
      console.error('marcarPago:', error)
      setErroMsg(`Erro ao salvar: ${error.message}`)
      // Reverter optimistic
      buscarDados()
    } else {
      buscarHistorico()
    }
    setLoadingKey(null)
  }

  // ── Fechar mês ──
  async function fecharMes() {
    setFechandoMes(true)
    // Upsert de todos os pagos para historico — já estão em crm_status
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
  const mesAtual = hoje.getMonth() === mes && hoje.getFullYear() === ano

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 lg:py-8">

      {/* Erro banner */}
      <AnimatePresence>
        {erroMsg && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mb-4 px-4 py-3 rounded-xl flex items-center justify-between"
            style={{ background: '#FEE2E2', border: '1px solid #FECACA' }}
          >
            <p className="text-sm" style={{ color: 'var(--danger)' }}>{erroMsg}</p>
            <button onClick={() => setErroMsg(null)} className="text-sm font-semibold ml-4" style={{ color: 'var(--danger)' }}>Fechar</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <p className="section-title mb-1">Cobranças</p>
          <h1 className="font-display text-3xl" style={{ color: 'var(--text-hi)' }}>CRM</h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <button onClick={() => navMes(-1)} className="btn btn-ghost btn-sm" style={{ padding: '2px 6px', fontSize: '1.1rem', lineHeight: 1 }}>‹</button>
            <span className="text-sm font-semibold" style={{ color: 'var(--text-hi)', minWidth: 110, textAlign: 'center' }}>
              {MESES[mes]} {ano}
            </span>
            <button onClick={() => navMes(1)}  className="btn btn-ghost btn-sm" style={{ padding: '2px 6px', fontSize: '1.1rem', lineHeight: 1 }}>›</button>
          </div>
          {mesAtual && (
            <button onClick={() => setConfirmFechar(true)} className="btn btn-sm" style={{ background: 'var(--text-hi)', color: '#fff' }}>
              Fechar mês
            </button>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Clientes',  value: dados.length,                                              color: 'var(--text-hi)'  },
          { label: 'A receber', value: `R$ ${devendo.reduce((s,c)=>s+c.total,0).toFixed(2).replace('.',',')}`, color: 'var(--brand)'   },
          { label: 'Recebido',  value: `R$ ${pagos.reduce((s,c)=>s+c.total,0).toFixed(2).replace('.',',')}`,   color: 'var(--success)' },
          { label: 'Pagos',     value: pagos.length,                                              color: 'var(--success)'  },
        ].map(k => (
          <div key={k.label} className="card">
            <p className="section-title mb-1">{k.label}</p>
            {loading
              ? <div className="skeleton h-7 w-20 mt-1 rounded" />
              : <p className="text-xl font-bold" style={{ color: k.color }}>{k.value}</p>
            }
          </div>
        ))}
      </div>

      {/* Kanban */}
      {loading ? (
        <div className="flex justify-center py-16"><div className="spinner" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {COLS.map(col => (
            <div
              key={col.id}
              className="flex flex-col rounded-2xl overflow-hidden"
              style={{ border: `1px solid ${col.border}`, background: col.bg, minHeight: 440 }}
            >
              {/* Coluna header */}
              <div className="px-4 py-2.5 flex items-center justify-between" style={{ borderBottom: `1px solid ${col.border}` }}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: col.color }} />
                  <p className="section-title" style={{ color: col.color }}>{col.label}</p>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: 'var(--surface)', color: col.color }}>
                  {col.id === 'historico' ? historico.length
                    : col.id === 'devendo' ? devendo.length : pagos.length}
                </span>
              </div>

              {/* Lista */}
              <div className="flex-1 p-3 space-y-2 overflow-y-auto" style={{ maxHeight: 560 }}>
                <AnimatePresence>
                  {col.id === 'historico' ? (
                    historico.length === 0
                      ? <p className="text-xs text-center py-8" style={{ color: 'var(--text-lo)' }}>Nenhum registro ainda</p>
                      : historico.map(item => (
                          <HistoricoItem key={`${item.cliente_key}-${item.mes}-${item.ano}`} item={item} />
                        ))
                  ) : col.id === 'devendo' ? (
                    devendo.length === 0
                      ? <p className="text-xs text-center py-8" style={{ color: 'var(--text-lo)' }}>Nenhum cliente devendo</p>
                      : devendo.map(c => (
                          <CardCliente key={c.nome} cliente={c} pago={false}
                            onAbrir={setClienteAberto} onPago={marcarPago} loadingKey={loadingKey} />
                        ))
                  ) : (
                    pagos.length === 0
                      ? <p className="text-xs text-center py-8" style={{ color: 'var(--text-lo)' }}>Nenhum pagamento confirmado</p>
                      : pagos.map(c => (
                          <CardCliente key={c.nome} cliente={c} pago={true}
                            onAbrir={setClienteAberto} onPago={null} loadingKey={null} />
                        ))
                  )}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal detalhe cliente */}
      <AnimatePresence>
        {clienteAberto && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,.5)' }}
            onClick={() => setClienteAberto(null)}
          >
            <motion.div
              initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 24, opacity: 0 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              className="w-full max-w-md rounded-2xl p-6"
              style={{ background: 'var(--surface)' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <Avatar nome={clienteAberto.nome} color={clienteAberto.pago ? 'var(--success)' : 'var(--brand)'} />
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--text-hi)' }}>{clienteAberto.nome}</p>
                    <p className="text-xs" style={{ color: 'var(--text-lo)' }}>Compras de {MESES[mes]}</p>
                  </div>
                </div>
                <button onClick={() => setClienteAberto(null)} className="btn btn-ghost btn-sm" style={{ color: 'var(--text-lo)' }}>Fechar</button>
              </div>

              <div className="space-y-2 mb-4 max-h-52 overflow-y-auto">
                {clienteAberto.compras.map(v => (
                  <div key={v.id} className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-hi)' }}>{v.sabor} × {v.qtd}</p>
                      <p className="text-xs" style={{ color: 'var(--text-lo)' }}>
                        {new Date(v.data + 'T00:00:00').toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <span className="text-sm font-bold" style={{ color: 'var(--brand)' }}>
                      R$ {Number(v.valor).toFixed(2).replace('.',',')}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between px-4 py-3 rounded-xl mb-4"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                <span className="text-sm font-semibold" style={{ color: 'var(--text-md)' }}>Total</span>
                <span className="text-lg font-bold" style={{ color: 'var(--brand)' }}>
                  R$ {clienteAberto.total.toFixed(2).replace('.',',')}
                </span>
              </div>

              {!clienteAberto.pago && (
                <button
                  disabled={loadingKey === normKey(clienteAberto.nome)}
                  onClick={() => marcarPago(normKey(clienteAberto.nome))}
                  className="btn btn-lg w-full"
                  style={{ background: 'var(--success)', color: '#fff' }}
                >
                  {loadingKey === normKey(clienteAberto.nome)
                    ? <span className="spinner" style={{ width: 16, height: 16, borderColor: 'rgba(255,255,255,.3)', borderTopColor: '#fff' }} />
                    : 'Confirmar pagamento'
                  }
                </button>
              )}

              {clienteAberto.pago && (
                <div className="flex items-center justify-center py-2 rounded-xl" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                  <span className="text-sm font-semibold" style={{ color: 'var(--success)' }}>Pagamento confirmado</span>
                </div>
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
            style={{ background: 'rgba(0,0,0,.5)' }}
            onClick={() => setConfirmFechar(false)}
          >
            <motion.div
              initial={{ scale: .96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: .96, opacity: 0 }}
              className="w-full max-w-sm rounded-2xl p-6"
              style={{ background: 'var(--surface)' }}
              onClick={e => e.stopPropagation()}
            >
              <p className="font-display text-xl mb-2" style={{ color: 'var(--text-hi)' }}>Fechar {MESES[mes]}?</p>
              <p className="text-sm mb-5" style={{ color: 'var(--text-md)' }}>
                Clientes já pagos serão registrados no Histórico. Devedores permanecem na lista do próximo mês.
              </p>
              <div className="flex gap-2">
                <button onClick={() => setConfirmFechar(false)} className="btn btn-secondary flex-1">Cancelar</button>
                <button onClick={fecharMes} disabled={fechandoMes} className="btn btn-primary flex-1">
                  {fechandoMes ? <span className="spinner" style={{ width: 16, height: 16 }} /> : 'Confirmar'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
