import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, CheckCircle2, ShoppingBag, ChevronRight, X } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { PRECOS } from '../lib/receitas'
import { useToast } from '../components/Toast'
import { useVendas } from '../lib/hooks'
import { formatBRL, formatDate } from '../lib/utils'
import MonthNav from '../components/MonthNav'

const SABORES = Object.keys(PRECOS)

const EMPTY_FORM = {
  cliente: '',
  sabor: SABORES[0] || 'Tradicional',
  qtd: 1,
  valor: '',
  pag: 'fiado',
  data: new Date().toISOString().slice(0, 10),
}

function normNome(n) {
  return (n || '').trim().toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
}
function normKey(n) {
  return (n || '').trim().toLowerCase().replace(/\s+/g, ' ')
}

const AVATAR_COLORS = [
  ['#FDE8D8','#C05621'],['#D1FAE5','#065F46'],['#EDE9FE','#5B21B6'],
  ['#FEE2E2','#991B1B'],['#E0F2FE','#0369A1'],['#FCE7F3','#9D174D'],
  ['#FEF9C3','#854D0E'],['#F0FDF4','#166534'],
]
function avatarColor(nome) {
  let h = 0
  for (let i = 0; i < nome.length; i++) h = (h * 31 + nome.charCodeAt(i)) & 0xfffff
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}

/**
 * Recalcula todas as vendas do cliente no mês/ano e sincroniza crm_status:
 *  - se todas as vendas forem pagas  → pago: true
 *  - se qualquer venda for fiado     → pago: false
 * Isso garante que o CRM reflete o estado real das vendas.
 */
async function syncCrmStatus(nomeKey, mes, ano) {
  const start = `${ano}-${String(mes + 1).padStart(2, '0')}-01`
  const end   = new Date(ano, mes + 1, 1).toISOString().slice(0, 10)

  const { data: vendasDoCliente } = await supabase
    .from('vendas')
    .select('pag')
    .gte('data', start)
    .lt('data', end)
    .ilike('cliente', nomeKey.trim())

  if (!vendasDoCliente || vendasDoCliente.length === 0) return

  const todosPagos = vendasDoCliente.every(v => v.pag === 'pago')

  await supabase.from('crm_status').upsert(
    {
      cliente_key: nomeKey,
      mes:         mes + 1,
      ano,
      pago:        todosPagos,
      pago_em:     todosPagos ? new Date().toISOString() : null,
    },
    { onConflict: 'cliente_key,mes,ano' }
  )
}

export default function Vendas() {
  const now = new Date()
  const [mes, setMes]         = useState(now.getMonth())
  const [ano, setAno]         = useState(now.getFullYear())
  const [modalOpen, setModal] = useState(false)
  const [form, setForm]       = useState(EMPTY_FORM)
  const [saving, setSaving]   = useState(false)
  const [clienteModal, setClienteModal] = useState(null)

  const toast = useToast()
  const { vendas, loading, refetch } = useVendas(mes, ano)

  function openModal() { setForm(EMPTY_FORM); setModal(true) }

  function setSabor(sabor) {
    setForm(f => ({ ...f, sabor, valor: PRECOS[sabor] ? (PRECOS[sabor] * f.qtd).toFixed(2) : f.valor }))
  }
  function setQtd(raw) {
    const q = Math.max(1, parseInt(raw) || 1)
    setForm(f => ({ ...f, qtd: q, valor: PRECOS[f.sabor] ? (PRECOS[f.sabor] * q).toFixed(2) : f.valor }))
  }

  async function handleSave() {
    if (!form.cliente.trim()) { toast('Informe o nome do cliente', 'error'); return }
    setSaving(true)

    const nomeNorm = normNome(form.cliente)
    const key      = normKey(nomeNorm)
    const dataVenda = form.data          // 'YYYY-MM-DD'
    const mesVenda  = new Date(dataVenda + 'T00:00:00').getMonth()
    const anoVenda  = new Date(dataVenda + 'T00:00:00').getFullYear()

    const { error } = await supabase.from('vendas').insert({
      cliente: nomeNorm,
      sabor:   form.sabor,
      qtd:     form.qtd,
      valor:   parseFloat(form.valor) || PRECOS[form.sabor] * form.qtd,
      pag:     form.pag,
      data:    dataVenda,
    })

    if (error) { setSaving(false); toast(error.message, 'error'); return }

    // Sincroniza CRM: se pago -> recebido; se fiado -> devendo
    await syncCrmStatus(key, mesVenda, anoVenda)

    setSaving(false)
    toast('Venda registrada')
    setModal(false)
    refetch()
  }

  async function handleToggle(v) {
    const novoPag = v.pag === 'pago' ? 'fiado' : 'pago'
    const { error } = await supabase.from('vendas').update({ pag: novoPag }).eq('id', v.id)
    if (error) { toast(error.message, 'error'); return }

    // Re-sincroniza CRM com o novo status
    const mesVenda = new Date(v.data + 'T00:00:00').getMonth()
    const anoVenda = new Date(v.data + 'T00:00:00').getFullYear()
    await syncCrmStatus(normKey(v.cliente), mesVenda, anoVenda)

    toast(novoPag === 'pago' ? 'Marcado como pago' : 'Marcado como fiado')
    refetch()
  }

  async function handleDelete(id) {
    if (!confirm('Remover esta venda?')) return
    const venda = vendas.find(v => v.id === id)
    await supabase.from('vendas').delete().eq('id', id)

    if (venda) {
      const mesVenda = new Date(venda.data + 'T00:00:00').getMonth()
      const anoVenda = new Date(venda.data + 'T00:00:00').getFullYear()
      await syncCrmStatus(normKey(venda.cliente), mesVenda, anoVenda)
    }

    refetch()
    toast('Venda removida')
  }

  async function marcarTudoPago(nomeCliente) {
    const vendasFiado = vendas.filter(v => normNome(v.cliente) === nomeCliente && v.pag === 'fiado')
    await Promise.all(vendasFiado.map(v => supabase.from('vendas').update({ pag: 'pago' }).eq('id', v.id)))

    // Sincroniza CRM -> todas as vendas viram pago, vai para Recebido
    if (vendasFiado.length > 0) {
      const mesVenda = new Date(vendasFiado[0].data + 'T00:00:00').getMonth()
      const anoVenda = new Date(vendasFiado[0].data + 'T00:00:00').getFullYear()
      await syncCrmStatus(normKey(nomeCliente), mesVenda, anoVenda)
    }

    toast('Tudo marcado como pago!')
    refetch()
    setClienteModal(null)
  }

  const clientes = useMemo(() => {
    const map = {}
    vendas.forEach(v => {
      const nome = normNome(v.cliente)
      if (!map[nome]) map[nome] = { nome, vendas: [], total: 0, fiado: 0 }
      map[nome].vendas.push(v)
      map[nome].total += Number(v.valor)
      if (v.pag === 'fiado') map[nome].fiado += Number(v.valor)
    })
    return Object.values(map).sort((a, b) => b.fiado - a.fiado || b.total - a.total)
  }, [vendas])

  const clienteData   = clienteModal ? clientes.find(c => c.nome === clienteModal) : null
  const vendasCliente = clienteData?.vendas.slice().sort((a, b) => b.data.localeCompare(a.data)) ?? []
  const totalCliente  = clienteData?.total ?? 0
  const fiadoCliente  = clienteData?.fiado ?? 0

  const totalMes   = vendas.reduce((s, v) => s + v.valor, 0)
  const totalPago  = vendas.filter(v => v.pag === 'pago').reduce((s, v) => s + v.valor, 0)
  const totalFiado = vendas.filter(v => v.pag === 'fiado').reduce((s, v) => s + v.valor, 0)

  return (
    <div className="px-4 py-6 lg:py-8 max-w-5xl mx-auto">

      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="font-display text-3xl" style={{ color: 'var(--text-hi)' }}>Vendas</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <MonthNav mes={mes} ano={ano} onChange={(m, a) => { setMes(m); setAno(a) }} />
          <button onClick={openModal} className="btn btn-primary btn-sm">
            <Plus size={14} strokeWidth={2.5} /> Nova venda
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total do mes',  value: formatBRL(totalMes),   color: 'var(--text-hi)'  },
          { label: 'Recebido',      value: formatBRL(totalPago),  color: 'var(--success)'  },
          { label: 'A receber',     value: formatBRL(totalFiado), color: 'var(--brand)'    },
          { label: 'Qtd vendas',    value: vendas.length,         color: 'var(--text-hi)'  },
        ].map((k, i) => (
          <motion.div key={k.label} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.05 }} className="card">
            <p className="section-title mb-1">{k.label}</p>
            {loading
              ? <div className="skeleton h-7 w-24 mt-1 rounded" />
              : <p className="text-xl font-bold" style={{ color: k.color }}>{k.value}</p>
            }
          </motion.div>
        ))}
      </div>

      {/* Lista de clientes */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="p-5 space-y-2.5">
            {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
          </div>
        ) : clientes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <ShoppingBag size={28} style={{ color: 'var(--text-lo)' }} strokeWidth={1.5} />
            <p className="text-sm" style={{ color: 'var(--text-lo)' }}>Nenhuma venda neste mês</p>
            <button onClick={openModal} className="btn btn-primary btn-sm">Registrar venda</button>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {clientes.map((c, i) => {
              const [bg, fg] = avatarColor(c.nome)
              return (
                <motion.button
                  key={c.nome}
                  initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.04 }}
                  className="w-full flex items-center gap-4 px-5 py-4 text-left transition hover:bg-[var(--bg)]"
                  onClick={() => setClienteModal(c.nome)}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{ background: bg, color: fg }}>
                    {c.nome[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-hi)' }}>{c.nome}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-lo)' }}>
                      {c.vendas.length} {c.vendas.length === 1 ? 'venda' : 'vendas'} · total {formatBRL(c.total)}
                    </p>
                  </div>
                  {c.fiado > 0 ? (
                    <div className="text-right flex-shrink-0">
                      <span className="badge badge-orange">💸 {formatBRL(c.fiado)}</span>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-lo)' }}>a receber</p>
                    </div>
                  ) : (
                    <span className="badge badge-green text-xs">✓ Pago</span>
                  )}
                  <ChevronRight size={16} style={{ color: 'var(--text-lo)', flexShrink: 0 }} />
                </motion.button>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Modal Cliente ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {clienteModal && (
          <motion.div
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,.5)' }}
            onClick={() => setClienteModal(null)}
          >
            <motion.div
              initial={{ y:32, opacity:0 }} animate={{ y:0, opacity:1 }} exit={{ y:32, opacity:0 }}
              transition={{ type:'spring', damping:26, stiffness:320 }}
              className="w-full max-w-md rounded-2xl overflow-hidden flex flex-col"
              style={{ background:'var(--surface)', maxHeight:'85vh' }}
              onClick={e => e.stopPropagation()}
            >
              {(() => {
                const [bg, fg] = avatarColor(clienteModal)
                return (
                  <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom:'1px solid var(--border)' }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold flex-shrink-0"
                      style={{ background:bg, color:fg }}>
                      {clienteModal[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-display text-lg" style={{ color:'var(--text-hi)' }}>{clienteModal}</p>
                      <p className="text-xs" style={{ color:'var(--text-lo)' }}>
                        {vendasCliente.length} venda{vendasCliente.length !== 1 ? 's' : ''} este mês
                      </p>
                    </div>
                    <button onClick={() => setClienteModal(null)} className="btn btn-ghost btn-sm" style={{ color:'var(--text-lo)' }}>
                      <X size={16} />
                    </button>
                  </div>
                )
              })()}

              <div className="grid grid-cols-2 gap-3 px-5 py-3" style={{ borderBottom:'1px solid var(--border)' }}>
                <div className="p-3 rounded-xl text-center" style={{ background:'var(--bg)' }}>
                  <p className="text-xs" style={{ color:'var(--text-lo)' }}>Total comprado</p>
                  <p className="font-bold text-sm mt-0.5" style={{ color:'var(--text-hi)' }}>{formatBRL(totalCliente)}</p>
                </div>
                <div className="p-3 rounded-xl text-center"
                  style={{ background: fiadoCliente > 0 ? '#FEF3C7' : '#F0FDF4', border:`1px solid ${fiadoCliente > 0 ? '#FDE68A' : '#86EFAC'}` }}>
                  <p className="text-xs" style={{ color: fiadoCliente > 0 ? '#92400E' : '#166534' }}>Dívida atual</p>
                  <p className="font-bold text-sm mt-0.5" style={{ color: fiadoCliente > 0 ? '#92400E' : '#166534' }}>
                    {fiadoCliente > 0 ? formatBRL(fiadoCliente) : 'Sem dívida ✓'}
                  </p>
                </div>
              </div>

              <div className="overflow-y-auto flex-1 px-5 py-3 space-y-2">
                {vendasCliente.map(v => (
                  <div key={v.id} className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background:'var(--bg)', border:'1px solid var(--border)' }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium" style={{ color:'var(--text-hi)' }}>{v.sabor}</p>
                      <p className="text-xs" style={{ color:'var(--text-lo)' }}>{formatDate(v.data)} · {v.qtd} un</p>
                    </div>
                    <span className="font-bold text-sm flex-shrink-0" style={{ color:'var(--text-hi)' }}>{formatBRL(v.valor)}</span>
                    <span className={`badge flex-shrink-0 ${v.pag === 'pago' ? 'badge-green' : 'badge-orange'}`}>
                      {v.pag === 'pago' ? 'Pago' : 'Fiado'}
                    </span>
                    <div className="flex gap-0.5 flex-shrink-0">
                      <button onClick={() => handleToggle(v)} title={v.pag === 'pago' ? 'Marcar fiado' : 'Marcar pago'}
                        className="p-1.5 rounded-md transition"
                        style={{ color:'var(--text-lo)' }}
                        onMouseEnter={e => e.currentTarget.style.color='var(--success)'}
                        onMouseLeave={e => e.currentTarget.style.color='var(--text-lo)'}
                      >
                        <CheckCircle2 size={14} strokeWidth={2} />
                      </button>
                      <button onClick={() => handleDelete(v.id)}
                        className="p-1.5 rounded-md transition"
                        style={{ color:'var(--text-lo)' }}
                        onMouseEnter={e => e.currentTarget.style.color='var(--danger)'}
                        onMouseLeave={e => e.currentTarget.style.color='var(--text-lo)'}
                      >
                        <Trash2 size={14} strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {fiadoCliente > 0 && (
                <div className="px-5 py-4" style={{ borderTop:'1px solid var(--border)' }}>
                  <button className="btn btn-primary w-full" onClick={() => marcarTudoPago(clienteModal)}>
                    ✓ Marcar tudo como pago ({formatBRL(fiadoCliente)})
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Modal Nova Venda ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            style={{ background:'rgba(0,0,0,.45)' }}
            onClick={() => setModal(false)}
          >
            <motion.div
              initial={{ y:20, opacity:0 }} animate={{ y:0, opacity:1 }} exit={{ y:20, opacity:0 }}
              transition={{ type:'spring', damping:26, stiffness:320 }}
              className="w-full max-w-md rounded-2xl p-6"
              style={{ background:'var(--surface)' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <p className="font-display text-xl" style={{ color:'var(--text-hi)' }}>Nova venda</p>
                <button onClick={() => setModal(false)} className="btn btn-ghost btn-sm" style={{ color:'var(--text-lo)' }}>Fechar</button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="label">Cliente</label>
                  <input className="field" placeholder="Nome do cliente" value={form.cliente}
                    onChange={e => setForm(f => ({ ...f, cliente: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Sabor</label>
                    <select className="field" value={form.sabor} onChange={e => setSabor(e.target.value)}>
                      {SABORES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Quantidade</label>
                    <input type="number" min="1" className="field" value={form.qtd} onChange={e => setQtd(e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Valor (R$)</label>
                    <input type="number" step="0.01" className="field" value={form.valor}
                      onChange={e => setForm(f => ({ ...f, valor: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label">Pagamento</label>
                    <select className="field" value={form.pag} onChange={e => setForm(f => ({ ...f, pag: e.target.value }))}>
                      <option value="fiado">Fiado</option>
                      <option value="pago">Pago</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label">Data</label>
                  <input type="date" className="field" value={form.data}
                    onChange={e => setForm(f => ({ ...f, data: e.target.value }))} />
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button onClick={() => setModal(false)} className="btn btn-secondary flex-1">Cancelar</button>
                <button onClick={handleSave} disabled={saving} className="btn btn-primary flex-1">
                  {saving ? <span className="spinner" style={{ width:16, height:16 }} /> : 'Salvar'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
