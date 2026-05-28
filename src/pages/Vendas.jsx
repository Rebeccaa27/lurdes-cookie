import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, CheckCircle2, ShoppingBag } from 'lucide-react'
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

export default function Vendas() {
  const now = new Date()
  const [mes, setMes]       = useState(now.getMonth())
  const [ano, setAno]       = useState(now.getFullYear())
  const [modalOpen, setModal] = useState(false)
  const [form, setForm]     = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

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
    const { error } = await supabase.from('vendas').insert({
      cliente: form.cliente.trim(),
      sabor:   form.sabor,
      qtd:     form.qtd,
      valor:   parseFloat(form.valor) || PRECOS[form.sabor] * form.qtd,
      pag:     form.pag,
      data:    form.data,
    })
    setSaving(false)
    if (error) { toast(error.message, 'error'); return }
    toast('Venda registrada')
    setModal(false)
    refetch()
  }

  async function handleToggle(v) {
    const novoPag = v.pag === 'pago' ? 'fiado' : 'pago'
    const { error } = await supabase.from('vendas').update({ pag: novoPag }).eq('id', v.id)
    if (error) toast(error.message, 'error')
    else { toast(novoPag === 'pago' ? 'Marcado como pago' : 'Marcado como fiado'); refetch() }
  }

  async function handleDelete(id) {
    if (!confirm('Remover esta venda?')) return
    await supabase.from('vendas').delete().eq('id', id)
    refetch(); toast('Venda removida')
  }

  const totalMes   = vendas.reduce((s, v) => s + v.valor, 0)
  const totalPago  = vendas.filter(v => v.pag === 'pago').reduce((s, v) => s + v.valor, 0)
  const totalFiado = vendas.filter(v => v.pag === 'fiado').reduce((s, v) => s + v.valor, 0)

  return (
    <div className="px-4 py-6 lg:py-8 max-w-5xl mx-auto">

      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display text-3xl" style={{ color: 'var(--text-hi)' }}>Vendas</h1>
        </div>
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
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="card"
          >
            <p className="section-title mb-1">{k.label}</p>
            {loading
              ? <div className="skeleton h-7 w-24 mt-1 rounded" />
              : <p className="text-xl font-bold" style={{ color: k.color }}>{k.value}</p>
            }
          </motion.div>
        ))}
      </div>

      {/* Tabela */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="p-5 space-y-2.5">
            {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-10 rounded-lg" />)}
          </div>
        ) : vendas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <ShoppingBag size={28} style={{ color: 'var(--text-lo)' }} strokeWidth={1.5} />
            <p className="text-sm" style={{ color: 'var(--text-lo)' }}>Nenhuma venda neste mes</p>
            <button onClick={openModal} className="btn btn-primary btn-sm">Registrar venda</button>
          </div>
        ) : (
          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  {['Cliente','Sabor','Qtd','Valor','Data','Status',''].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {vendas.map(v => (
                    <motion.tr
                      key={v.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="group"
                    >
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                            style={{ background: '#F0EBE4', color: 'var(--brand)' }}>
                            {v.cliente?.[0]?.toUpperCase()}
                          </div>
                          <span style={{ color: 'var(--text-hi)', fontWeight: 500 }}>{v.cliente}</span>
                        </div>
                      </td>
                      <td>{v.sabor}</td>
                      <td className="text-center">{v.qtd}</td>
                      <td style={{ color: 'var(--text-hi)', fontWeight: 600 }}>{formatBRL(v.valor)}</td>
                      <td>{formatDate(v.data)}</td>
                      <td>
                        <span className={`badge ${v.pag === 'pago' ? 'badge-green' : 'badge-orange'}`}>
                          {v.pag === 'pago' ? 'Pago' : 'Fiado'}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleToggle(v)} title={v.pag === 'pago' ? 'Marcar fiado' : 'Marcar pago'}
                            className="p-1.5 rounded-md transition hover:bg-emerald-50"
                            style={{ color: 'var(--text-lo)' }}
                            onMouseEnter={e => e.currentTarget.style.color = 'var(--success)'}
                            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-lo)'}
                          >
                            <CheckCircle2 size={14} strokeWidth={2} />
                          </button>
                          <button onClick={() => handleDelete(v.id)}
                            className="p-1.5 rounded-md transition hover:bg-red-50"
                            style={{ color: 'var(--text-lo)' }}
                            onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
                            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-lo)'}
                          >
                            <Trash2 size={14} strokeWidth={2} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,.45)' }}
            onClick={() => setModal(false)}
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              className="w-full max-w-md rounded-2xl p-6"
              style={{ background: 'var(--surface)' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <p className="font-display text-xl" style={{ color: 'var(--text-hi)' }}>Nova venda</p>
                <button onClick={() => setModal(false)} className="btn btn-ghost btn-sm" style={{ color: 'var(--text-lo)' }}>Fechar</button>
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
                  {saving ? <span className="spinner" style={{ width: 16, height: 16 }} /> : 'Salvar'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
