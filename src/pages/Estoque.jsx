import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { INGREDIENTES, RECEITAS_LIST } from '../lib/receitas'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '../components/Toast'

const SABORES_LISTA = RECEITAS_LIST.map(r => r.nome).sort()

export default function Estoque() {
  const toast = useToast()
  const [aba, setAba]           = useState('cookies')
  const [cookies, setCookies]   = useState([])
  const [ingredientes, setIngredientes] = useState([])
  const [loading, setLoading]   = useState(true)
  const [salvando, setSalvando] = useState(false)

  const [modalCookie, setModalCookie]     = useState(false)
  const [modalIng, setModalIng]           = useState(false)
  const [editando, setEditando]           = useState(null)        // cookie editando
  const [editandoIng, setEditandoIng]     = useState(null)        // ingrediente editando

  const [formCookie, setFormCookie] = useState({ sabor: '', quantidade: '', minimo: 3 })
  const [formIng, setFormIng]       = useState({ ingrediente: '', quantidade: '' })

  const buscarCookies = useCallback(async () => {
    const { data, error } = await supabase
      .from('estoque_cookies')
      .select('id,sabor,quantidade,minimo,updated_at')
      .order('sabor')
    if (!error) setCookies(data || [])
  }, [])

  const buscarIngredientes = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('estoque')
      .select('id,ingrediente,quantidade,updated_at')
      .order('ingrediente')
    setIngredientes(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { buscarCookies(); buscarIngredientes() }, [buscarCookies, buscarIngredientes])

  useEffect(() => {
    const ch = supabase.channel('estoque-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'estoque_cookies' }, buscarCookies)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'estoque' }, buscarIngredientes)
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [buscarCookies, buscarIngredientes])

  // ── Salvar Cookie ──────────────────────────────────────────
  async function salvarCookie(e) {
    e.preventDefault()
    if (!formCookie.sabor) return
    setSalvando(true)
    const payload = {
      sabor:      formCookie.sabor,
      quantidade: Number(formCookie.quantidade),
      minimo:     Number(formCookie.minimo) || 3,
    }
    let error
    if (editando?.id) {
      ;({ error } = await supabase.from('estoque_cookies').update(payload).eq('id', editando.id))
    } else {
      ;({ error } = await supabase.from('estoque_cookies').upsert(payload, { onConflict: 'sabor' }))
    }
    setSalvando(false)
    if (error) {
      toast('Erro ao salvar: ' + error.message, 'error')
    } else {
      toast(editando ? 'Estoque atualizado!' : 'Cookie adicionado!', 'success')
      setModalCookie(false)
      setEditando(null)
      setFormCookie({ sabor: '', quantidade: '', minimo: 3 })
      buscarCookies()
    }
  }

  // ── Salvar Ingrediente ─────────────────────────────────────
  async function salvarIngrediente(e) {
    e.preventDefault()
    setSalvando(true)
    const { error } = await supabase.from('estoque').upsert(
      { ingrediente: formIng.ingrediente, quantidade: Number(formIng.quantidade) },
      { onConflict: 'ingrediente' }
    )
    setSalvando(false)
    if (error) {
      toast('Erro ao salvar: ' + error.message, 'error')
    } else {
      toast('Ingrediente atualizado!', 'success')
      setModalIng(false)
      setEditandoIng(null)
      setFormIng({ ingrediente: '', quantidade: '' })
      buscarIngredientes()
    }
  }

  // ── Abrir modal ingrediente ────────────────────────────────
  // editando = abre com nome travado + quantidade atual
  // novo     = abre seletor limpo
  function abrirEditIng(ing) {
    setEditandoIng(ing)
    setFormIng({ ingrediente: ing.ingrediente, quantidade: ing.quantidade })
    setModalIng(true)
  }

  function abrirNovoIng() {
    setEditandoIng(null)
    setFormIng({ ingrediente: '', quantidade: '' })
    setModalIng(true)
  }

  // ── Cookie helpers ─────────────────────────────────────────
  function abrirEditCookie(c) {
    setEditando(c)
    setFormCookie({ sabor: c.sabor, quantidade: c.quantidade, minimo: c.minimo || 3 })
    setModalCookie(true)
  }

  async function deletarCookie(id) {
    if (!window.confirm('Remover este item?')) return
    await supabase.from('estoque_cookies').delete().eq('id', id)
    toast('Removido!', 'success')
    buscarCookies()
  }

  const alertasCookies = cookies.filter(c => c.quantidade <= (c.minimo || 3))
  const alertasIng = ingredientes.filter(i => {
    const ref = INGREDIENTES.find(x => x.label.toLowerCase() === i.ingrediente.toLowerCase())
    return ref ? i.quantidade <= ref.estoque_minimo * 0.2 : false
  })

  const fieldCls = 'field mt-1'

  return (
    <div className="max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="section-title mb-1">Inventário</p>
          <h1 className="font-display text-2xl" style={{ color: 'var(--text-hi)' }}>Estoque</h1>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            if (aba === 'cookies') {
              setEditando(null)
              setFormCookie({ sabor: '', quantidade: '', minimo: 3 })
              setModalCookie(true)
            } else {
              abrirNovoIng()
            }
          }}
        >
          + Adicionar
        </button>
      </div>

      {/* Alertas */}
      {aba === 'cookies' && alertasCookies.length > 0 && (
        <div className="rounded-xl p-4 mb-4" style={{ background: '#FEF3C7', border: '1px solid #FDE68A' }}>
          <p className="font-semibold text-sm mb-1" style={{ color: '#92400E' }}>Repor Estoque</p>
          <p className="text-xs" style={{ color: '#92400E' }}>
            {alertasCookies.map(c => `${c.sabor} (${c.quantidade} un)`).join(' · ')}
          </p>
        </div>
      )}
      {aba === 'ingredientes' && alertasIng.length > 0 && (
        <div className="rounded-xl p-4 mb-4" style={{ background: '#FEE2E2', border: '1px solid #FECACA' }}>
          <p className="font-semibold text-sm mb-1" style={{ color: 'var(--danger)' }}>Ingredientes Críticos</p>
          <p className="text-xs" style={{ color: 'var(--danger)' }}>
            {alertasIng.map(i => i.ingrediente).join(' · ')}
          </p>
        </div>
      )}

      {/* Abas */}
      <div className="flex gap-1 mb-4 p-1 rounded-xl w-fit" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        {[['cookies', 'Cookies Prontos'], ['ingredientes', 'Ingredientes']].map(([id, label]) => (
          <button key={id} onClick={() => setAba(id)}
            className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
            style={aba === id ? { background: 'var(--brand)', color: '#fff' } : { color: 'var(--text-md)' }}
          >{label}</button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="spinner" /></div>
      ) : (
        <AnimatePresence mode="wait">

          {/* ABA COOKIES */}
          {aba === 'cookies' && (
            <motion.div key="cookies" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {cookies.length === 0 ? (
                <div className="text-center py-16">
                  <p className="font-semibold" style={{ color: 'var(--text-hi)' }}>Nenhum cookie cadastrado</p>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-lo)' }}>Adicione os cookies que você produziu.</p>
                </div>
              ) : (
                <div className="grid gap-2">
                  {cookies.map(c => (
                    <motion.div key={c.id} layout
                      className="flex items-center justify-between p-4 rounded-xl"
                      style={{ background: 'var(--surface)', border: `1px solid ${c.quantidade <= (c.minimo || 3) ? '#FDE68A' : 'var(--border)'}` }}
                    >
                      <div>
                        <p className="font-medium text-sm" style={{ color: 'var(--text-hi)' }}>{c.sabor}</p>
                        <p className="text-xs" style={{ color: 'var(--text-lo)' }}>mín. {c.minimo || 3} un</p>
                      </div>
                      <div className="flex items-center gap-3">
                        {c.quantidade <= (c.minimo || 3) && <span className="badge badge-orange">Repor</span>}
                        <span className="text-lg font-bold" style={{ color: c.quantidade <= (c.minimo || 3) ? 'var(--brand)' : 'var(--text-hi)' }}>{c.quantidade}</span>
                        <span className="text-xs" style={{ color: 'var(--text-lo)' }}>un</span>
                        <button onClick={() => abrirEditCookie(c)} className="btn btn-ghost btn-sm" style={{ color: 'var(--text-lo)' }}>Editar</button>
                        <button onClick={() => deletarCookie(c.id)} className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }}>Remover</button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ABA INGREDIENTES */}
          {aba === 'ingredientes' && (
            <motion.div key="ing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="grid gap-2">
                {ingredientes.map(i => {
                  const ref   = INGREDIENTES.find(x => x.label.toLowerCase() === i.ingrediente.toLowerCase())
                  const baixo = ref ? i.quantidade <= ref.estoque_minimo * 0.2 : false
                  return (
                    <div key={i.id}
                      className="flex items-center justify-between p-3 rounded-xl"
                      style={{ background: 'var(--surface)', border: `1px solid ${baixo ? '#FECACA' : 'var(--border)'}` }}
                    >
                      <span className="text-sm font-medium" style={{ color: 'var(--text-hi)' }}>
                        {i.ingrediente}
                      </span>
                      <div className="flex items-center gap-2">
                        {baixo && <span className="badge badge-red">Crítico</span>}
                        <span className="font-bold text-sm" style={{ color: baixo ? 'var(--danger)' : 'var(--text-hi)' }}>
                          {i.quantidade}{ref?.unit || 'g'}
                        </span>
                        {/* Editar: abre modal com nome já preenchido */}
                        <button
                          onClick={() => abrirEditIng(i)}
                          className="btn btn-ghost btn-sm"
                          style={{ color: 'var(--text-lo)' }}
                        >Editar</button>
                      </div>
                    </div>
                  )
                })}
                {ingredientes.length === 0 && (
                  <p className="text-center py-12 text-sm" style={{ color: 'var(--text-lo)' }}>Nenhum ingrediente cadastrado ainda.</p>
                )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      )}

      {/* Modal Cookie */}
      <AnimatePresence>
        {modalCookie && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,.5)' }} onClick={() => setModalCookie(false)}
          >
            <motion.form
              initial={{ y: 32, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 32, opacity: 0 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              className="w-full max-w-sm rounded-2xl p-6" style={{ background: 'var(--surface)' }}
              onClick={e => e.stopPropagation()} onSubmit={salvarCookie}
            >
              <h2 className="font-display text-xl mb-5" style={{ color: 'var(--text-hi)' }}>
                {editando ? 'Editar Cookie' : 'Adicionar Cookie'}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="label">Sabor</label>
                  <select className={fieldCls} value={formCookie.sabor}
                    onChange={e => setFormCookie(p => ({ ...p, sabor: e.target.value }))}
                    required disabled={!!editando}
                  >
                    <option value="">Selecionar sabor...</option>
                    {SABORES_LISTA.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Quantidade (unidades)</label>
                  <input type="number" min="0" className={fieldCls} value={formCookie.quantidade}
                    onChange={e => setFormCookie(p => ({ ...p, quantidade: e.target.value }))} required autoFocus={!!editando} />
                </div>
                <div>
                  <label className="label">Alerta de mínimo (unidades)</label>
                  <input type="number" min="0" className={fieldCls} value={formCookie.minimo}
                    onChange={e => setFormCookie(p => ({ ...p, minimo: e.target.value }))} />
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button type="button" onClick={() => setModalCookie(false)} className="btn btn-secondary flex-1">Cancelar</button>
                <button type="submit" disabled={salvando} className="btn btn-primary flex-1">
                  {salvando ? <span className="spinner" style={{ width: 16, height: 16 }} /> : 'Salvar'}
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Ingrediente */}
      <AnimatePresence>
        {modalIng && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,.5)' }} onClick={() => setModalIng(false)}
          >
            <motion.form
              initial={{ y: 32, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 32, opacity: 0 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              className="w-full max-w-sm rounded-2xl p-6" style={{ background: 'var(--surface)' }}
              onClick={e => e.stopPropagation()} onSubmit={salvarIngrediente}
            >
              <h2 className="font-display text-xl mb-5" style={{ color: 'var(--text-hi)' }}>
                {editandoIng ? `Atualizar: ${editandoIng.ingrediente}` : 'Novo Ingrediente'}
              </h2>

              <div className="space-y-4">
                {/* Se editando: mostra nome como texto fixo. Se novo: mostra select */}
                {editandoIng ? (
                  <div>
                    <label className="label">Ingrediente</label>
                    <div
                      className="field mt-1 cursor-default"
                      style={{ background: 'var(--bg)', color: 'var(--text-md)' }}
                    >
                      {editandoIng.ingrediente}
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="label">Ingrediente</label>
                    <select className={fieldCls} value={formIng.ingrediente}
                      onChange={e => setFormIng(p => ({ ...p, ingrediente: e.target.value }))} required
                    >
                      <option value="">Selecionar ingrediente...</option>
                      {INGREDIENTES.map(i => <option key={i.id} value={i.label}>{i.label}</option>)}
                    </select>
                  </div>
                )}

                <div>
                  <label className="label">Quantidade (g / ml)</label>
                  <input
                    type="number" min="0"
                    className={fieldCls}
                    value={formIng.quantidade}
                    onChange={e => setFormIng(p => ({ ...p, quantidade: e.target.value }))}
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button type="button" onClick={() => setModalIng(false)} className="btn btn-secondary flex-1">Cancelar</button>
                <button type="submit" disabled={salvando} className="btn btn-primary flex-1">
                  {salvando ? <span className="spinner" style={{ width: 16, height: 16 }} /> : 'Salvar'}
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
