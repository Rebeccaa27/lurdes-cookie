import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Plus, ShoppingBag, Trash2, CheckCircle2 } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { PRECOS } from '../lib/receitas'
import { useToast } from '../components/Toast'
import CardResumo from '../components/CardResumo'
import MonthNav from '../components/MonthNav'
import Button from '../components/Button'
import Modal from '../components/Modal'
import Badge from '../components/Badge'
import EmptyState from '../components/EmptyState'
import { useVendas } from '../lib/hooks'
import { formatBRL, formatDate } from '../lib/utils'

const SABORES = Object.keys(PRECOS)

const INITIAL_FORM = {
  cliente: '', sabor: 'Tradicional', qtd: 1, valor: '', pag: 'fiado',
  data: new Date().toISOString().slice(0, 10),
}

function VendaRow({ venda, onToggle, onDelete }) {
  return (
    <motion.tr
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="group border-b border-surface-border dark:border-surface-dark-border last:border-0"
    >
      <td className="py-3 px-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center flex-shrink-0">
            <span className="text-2xs font-semibold text-brand-600 dark:text-brand-400">
              {venda.cliente?.[0]?.toUpperCase()}
            </span>
          </div>
          <span className="text-sm text-neutral-800 dark:text-neutral-200">{venda.cliente}</span>
        </div>
      </td>
      <td className="py-3 px-4 text-sm text-neutral-600 dark:text-neutral-400">{venda.sabor}</td>
      <td className="py-3 px-4 text-sm text-neutral-600 dark:text-neutral-400 text-center">{venda.qtd}</td>
      <td className="py-3 px-4 text-sm font-medium text-neutral-800 dark:text-neutral-200">{formatBRL(venda.valor)}</td>
      <td className="py-3 px-4">{formatDate(venda.data)}</td>
      <td className="py-3 px-4">
        <Badge variant={venda.pag === 'pago' ? 'success' : 'warning'}>
          {venda.pag === 'pago' ? 'Pago' : 'Fiado'}
        </Badge>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onToggle(venda)}
            title={venda.pag === 'pago' ? 'Marcar como fiado' : 'Marcar como pago'}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all"
          >
            <CheckCircle2 size={14} strokeWidth={2} />
          </button>
          <button
            onClick={() => onDelete(venda.id)}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all"
          >
            <Trash2 size={14} strokeWidth={2} />
          </button>
        </div>
      </td>
    </motion.tr>
  )
}

export default function Vendas() {
  const now = new Date()
  const [mes, setMes] = useState(now.getMonth())
  const [ano, setAno] = useState(now.getFullYear())
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(INITIAL_FORM)
  const [saving, setSaving] = useState(false)

  const toast = useToast()
  const { vendas, loading, refetch } = useVendas(mes, ano)

  function onMesChange(m, a) { setMes(m); setAno(a) }

  function handleSaborChange(sabor) {
    setForm((f) => ({
      ...f, sabor,
      valor: PRECOS[sabor] ? (PRECOS[sabor] * f.qtd).toFixed(2) : f.valor,
    }))
  }

  function handleQtdChange(qtd) {
    const q = Math.max(1, parseInt(qtd) || 1)
    setForm((f) => ({ ...f, qtd: q, valor: (PRECOS[f.sabor] * q).toFixed(2) }))
  }

  async function handleSave() {
    if (!form.cliente.trim()) { toast('Informe o nome do cliente', 'error'); return }
    if (!form.sabor)          { toast('Selecione um sabor', 'error'); return }
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
    toast('Venda registrada com sucesso')
    setModalOpen(false)
    setForm(INITIAL_FORM)
    refetch()
  }

  async function handleToggle(venda) {
    const novoPag = venda.pag === 'pago' ? 'fiado' : 'pago'
    const { error } = await supabase.from('vendas').update({ pag: novoPag }).eq('id', venda.id)
    if (error) toast(error.message, 'error')
    else { toast(novoPag === 'pago' ? 'Marcado como pago ✓' : 'Marcado como fiado'); refetch() }
  }

  async function handleDelete(id) {
    if (!confirm('Remover esta venda?')) return
    await supabase.from('vendas').delete().eq('id', id)
    refetch()
    toast('Venda removida')
  }

  const totalMes   = vendas.reduce((s, v) => s + v.valor, 0)
  const totalPago  = vendas.filter((v) => v.pag === 'pago').reduce((s, v) => s + v.valor, 0)
  const totalFiado = vendas.filter((v) => v.pag === 'fiado').reduce((s, v) => s + v.valor, 0)

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
        <Button icon={Plus} onClick={() => setModalOpen(true)} size="sm">
          Nova venda
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <CardResumo label="Total do mês" value={formatBRL(totalMes)}   color="brand"   delay={0}    loading={loading} />
        <CardResumo label="Recebido"     value={formatBRL(totalPago)}  color="success" delay={0.05} loading={loading} />
        <CardResumo label="A receber"    value={formatBRL(totalFiado)} color="danger"  delay={0.1}  loading={loading} />
        <CardResumo label="Vendas"       value={vendas.length}                         delay={0.15} loading={loading} />
      </div>

      {/* Table */}
      <div className="bg-surface dark:bg-surface-dark-secondary border border-surface-border dark:border-surface-dark-border rounded-2xl shadow-soft overflow-hidden">
        {loading ? (
          <div className="p-6 flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton h-10 rounded-xl" />
            ))}
          </div>
        ) : vendas.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="Nenhuma venda neste mês"
            description="Clique em 'Nova venda' para registrar"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-surface-border dark:border-surface-dark-border">
                  {['Cliente', 'Sabor', 'Qtd', 'Valor', 'Data', 'Status', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-2xs font-semibold text-neutral-400 dark:text-neutral-500 tracking-wider uppercase">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {vendas.map((v) => (
                  <VendaRow key={v.id} venda={v} onToggle={handleToggle} onDelete={handleDelete} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Nova venda"
        description="Preencha os dados da venda"
        footer={
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} loading={saving}>Salvar venda</Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <div>
            <label className="label-base">Cliente</label>
            <input
              className="input-base"
              placeholder="Nome do cliente"
              value={form.cliente}
              onChange={(e) => setForm((f) => ({ ...f, cliente: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-base">Sabor</label>
              <select
                className="input-base"
                value={form.sabor}
                onChange={(e) => handleSaborChange(e.target.value)}
              >
                {SABORES.map((s) => (
                  <option key={s} value={s}>{s} — {formatBRL(PRECOS[s])}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-base">Quantidade</label>
              <input
                type="number" min="1"
                className="input-base"
                value={form.qtd}
                onChange={(e) => handleQtdChange(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-base">Valor (R$)</label>
              <input
                type="number" step="0.01"
                className="input-base"
                value={form.valor}
                onChange={(e) => setForm((f) => ({ ...f, valor: e.target.value }))}
              />
            </div>
            <div>
              <label className="label-base">Pagamento</label>
              <select
                className="input-base"
                value={form.pag}
                onChange={(e) => setForm((f) => ({ ...f, pag: e.target.value }))}
              >
                <option value="fiado">Fiado</option>
                <option value="pago">Pago</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label-base">Data</label>
            <input
              type="date"
              className="input-base"
              value={form.data}
              onChange={(e) => setForm((f) => ({ ...f, data: e.target.value }))}
            />
          </div>
        </div>
      </Modal>
    </motion.div>
  )
}
