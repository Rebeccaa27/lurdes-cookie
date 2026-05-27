import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { INGREDIENTES } from '../lib/receitas'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '../components/Toast'

export default function Estoque() {
  const toast = useToast()
  const [aba, setAba]               = useState('cookies')  // 'cookies' | 'ingredientes'
  const [cookies, setCookies]       = useState([])
  const [ingredientes, setIngredientes] = useState([])
  const [loading, setLoading]       = useState(true)

  // Modais
  const [modalCookie, setModalCookie]   = useState(false)
  const [modalIng, setModalIng]         = useState(false)
  const [editando, setEditando]         = useState(null)

  const [formCookie, setFormCookie] = useState({ sabor: '', quantidade: '', minimo: 3 })
  const [formIng, setFormIng]       = useState({ ingrediente: '', quantidade: '' })

  const buscarCookies = useCallback(async () => {
    const { data } = await supabase
      .from('estoque_cookies')
      .select('id,sabor,quantidade,minimo,updated_at')
      .order('sabor')
    setCookies(data || [])
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

  // Realtime
  useEffect(() => {
    const ch = supabase.channel('estoque-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'estoque_cookies' }, buscarCookies)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'estoque' }, buscarIngredientes)
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [buscarCookies, buscarIngredientes])

  async function salvarCookie(e) {
    e.preventDefault()
    const payload = {
      sabor: formCookie.sabor.trim(),
      quantidade: Number(formCookie.quantidade),
      minimo: Number(formCookie.minimo),
    }
    if (editando?.id) {
      await supabase.from('estoque_cookies').update(payload).eq('id', editando.id)
      toast.success('Estoque atualizado!')
    } else {
      await supabase.from('estoque_cookies').insert(payload)
      toast.success('Cookie adicionado!')
    }
    setModalCookie(false)
    setEditando(null)
    setFormCookie({ sabor: '', quantidade: '', minimo: 3 })
    buscarCookies()
  }

  async function salvarIngrediente(e) {
    e.preventDefault()
    await supabase.from('estoque').upsert(
      { ingrediente: formIng.ingrediente, quantidade: Number(formIng.quantidade) },
      { onConflict: 'ingrediente' }
    )
    toast.success('Estoque salvo!')
    setModalIng(false)
    setFormIng({ ingrediente: '', quantidade: '' })
    buscarIngredientes()
  }

  function abrirEditCookie(c) {
    setEditando(c)
    setFormCookie({ sabor: c.sabor, quantidade: c.quantidade, minimo: c.minimo || 3 })
    setModalCookie(true)
  }

  async function deletarCookie(id) {
    if (!window.confirm('Remover este item?')) return
    await supabase.from('estoque_cookies').delete().eq('id', id)
    toast.success('Removido!')
    buscarCookies()
  }

  const alertasCookies = cookies.filter(c => c.quantidade <= (c.minimo || 3))
  const alertasIng     = ingredientes.filter(i => {
    const ref = INGREDIENTES.find(x => x.label.toLowerCase() === i.ingrediente.toLowerCase())
    return ref ? i.quantidade <= ref.estoque_minimo * 0.2 : false
  })

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1C1917' }}>Estoque</h1>
          <p className="text-sm mt-0.5" style={{ color: '#78716C' }}>Cookies prontos e ingredientes</p>
        </div>
        <button
          onClick={() => aba === 'cookies' ? (setEditando(null), setFormCookie({ sabor: '', quantidade: '', minimo: 3 }), setModalCookie(true)) : (setFormIng({ ingrediente: '', quantidade: '' }), setModalIng(true))}
          className="px-4 py-2 rounded-xl text-white text-sm font-semibold transition hover:opacity-80"
          style={{ background: '#C2410C' }}
        >+ Adicionar</button>
      </div>

      {/* Alertas */}
      {aba === 'cookies' && alertasCookies.length > 0 && (
        <div className="rounded-xl p-4 mb-4" style={{ background: '#FEF3C7', border: '1px solid #FDE68A' }}>
          <p className="font-semibold text-sm mb-1" style={{ color: '#92400E' }}>⚠️ Repor Estoque de Cookies</p>
          <p className="text-xs" style={{ color: '#92400E' }}>{alertasCookies.map(c => `${c.sabor} (${c.quantidade} un)`).join(' · ')}</p>
        </div>
      )}
      {aba === 'ingredientes' && alertasIng.length > 0 && (
        <div className="rounded-xl p-4 mb-4" style={{ background: '#FEE2E2', border: '1px solid #FECACA' }}>
          <p className="font-semibold text-sm mb-1" style={{ color: '#DC2626' }}>🔴 Ingredientes Críticos</p>
          <p className="text-xs" style={{ color: '#DC2626' }}>{alertasIng.map(i => i.ingrediente).join(' · ')}</p>
        </div>
      )}

      {/* Abas */}
      <div className="flex gap-1 mb-4 bg-white rounded-xl p-1 w-fit" style={{ border: '1px solid #E5E0D9' }}>
        {[['cookies','🍪 Cookies Prontos'],['ingredientes','🧂 Ingredientes']].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setAba(id)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              aba === id ? 'text-white' : 'text-stone-500 hover:text-stone-800'
            }`}
            style={aba === id ? { background: '#C2410C' } : {}}
          >{label}</button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#C2410C', borderTopColor: 'transparent' }} />
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {aba === 'cookies' && (
            <motion.div key="cookies" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {cookies.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-4xl mb-3">🍪</p>
                  <p className="font-semibold" style={{ color: '#1C1917' }}>Nenhum cookie cadastrado</p>
                  <p className="text-sm mt-1" style={{ color: '#78716C' }}>Adicione os cookies que você produziu.</p>
                </div>
              ) : (
                <div className="grid gap-2">
                  {cookies.map(c => (
                    <motion.div
                      key={c.id}
                      layout
                      className="flex items-center justify-between p-4 rounded-xl"
                      style={{ background: '#fff', border: `1px solid ${c.quantidade <= (c.minimo || 3) ? '#FDE68A' : '#E5E0D9'}` }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">🍪</span>
                        <div>
                          <p className="font-medium text-sm" style={{ color: '#1C1917' }}>{c.sabor}</p>
                          <p className="text-xs" style={{ color: '#78716C' }}>Mínimo: {c.minimo || 3} un</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {c.quantidade <= (c.minimo || 3) && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: '#FEF3C7', color: '#92400E' }}>Repor</span>
                        )}
                        <span className="text-lg font-bold" style={{ color: c.quantidade <= (c.minimo || 3) ? '#C2410C' : '#1C1917' }}>{c.quantidade}</span>
                        <span className="text-xs" style={{ color: '#78716C' }}>un</span>
                        <button onClick={() => abrirEditCookie(c)} className="p-1.5 rounded hover:bg-stone-100 transition text-xs" style={{ color: '#78716C' }}>✏️</button>
                        <button onClick={() => deletarCookie(c.id)} className="p-1.5 rounded hover:bg-red-50 transition text-xs">🗑️</button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {aba === 'ingredientes' && (
            <motion.div key="ing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="grid gap-2">
                {ingredientes.map(i => {
                  const ref = INGREDIENTES.find(x => x.label.toLowerCase() === i.ingrediente.toLowerCase())
                  const baixo = ref ? i.quantidade <= ref.estoque_minimo * 0.2 : false
                  return (
                    <div
                      key={i.id}
                      className="flex items-center justify-between p-3 rounded-xl"
                      style={{ background: '#fff', border: `1px solid ${baixo ? '#FECACA' : '#E5E0D9'}` }}
                    >
                      <span className="text-sm font-medium" style={{ color: '#1C1917' }}>{i.ingrediente}</span>
                      <div className="flex items-center gap-2">
                        {baixo && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#FEE2E2', color: '#DC2626' }}>Crítico</span>}
                        <span className="font-bold text-sm" style={{ color: baixo ? '#DC2626' : '#1C1917' }}>{i.quantidade}g</span>
                        <button
                          onClick={() => { setFormIng({ ingrediente: i.ingrediente, quantidade: i.quantidade }); setModalIng(true) }}
                          className="p-1 rounded hover:bg-stone-100 transition text-xs"
                        >✏️</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Modal Cookies */}
      <AnimatePresence>
        {modalCookie && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setModalCookie(false)}
          >
            <motion.form
              initial={{ y: 40 }} animate={{ y: 0 }} exit={{ y: 40 }}
              className="w-full max-w-sm rounded-2xl p-6"
              style={{ background: '#fff' }}
              onClick={e => e.stopPropagation()}
              onSubmit={salvarCookie}
            >
              <h2 className="font-bold text-lg mb-4" style={{ color: '#1C1917' }}>{editando ? 'Editar Cookie' : 'Adicionar Cookie'}</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold" style={{ color: '#78716C' }}>Sabor</label>
                  <input value={formCookie.sabor} onChange={e => setFormCookie(p => ({ ...p, sabor: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 rounded-lg border text-sm"
                    style={{ borderColor: '#E5E0D9' }} placeholder="Ex: Red Velvet" required />
                </div>
                <div>
                  <label className="text-xs font-semibold" style={{ color: '#78716C' }}>Quantidade (unidades)</label>
                  <input type="number" min="0" value={formCookie.quantidade} onChange={e => setFormCookie(p => ({ ...p, quantidade: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 rounded-lg border text-sm"
                    style={{ borderColor: '#E5E0D9' }} required />
                </div>
                <div>
                  <label className="text-xs font-semibold" style={{ color: '#78716C' }}>Alerta de mínimo (unidades)</label>
                  <input type="number" min="0" value={formCookie.minimo} onChange={e => setFormCookie(p => ({ ...p, minimo: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 rounded-lg border text-sm"
                    style={{ borderColor: '#E5E0D9' }} />
                </div>
              </div>
              <div className="flex gap-2 mt-5">
                <button type="button" onClick={() => setModalCookie(false)}
                  className="flex-1 py-2.5 rounded-xl border text-sm" style={{ borderColor: '#E5E0D9', color: '#78716C' }}>Cancelar</button>
                <button type="submit"
                  className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold" style={{ background: '#C2410C' }}>Salvar</button>
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
            style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setModalIng(false)}
          >
            <motion.form
              initial={{ y: 40 }} animate={{ y: 0 }} exit={{ y: 40 }}
              className="w-full max-w-sm rounded-2xl p-6"
              style={{ background: '#fff' }}
              onClick={e => e.stopPropagation()}
              onSubmit={salvarIngrediente}
            >
              <h2 className="font-bold text-lg mb-4" style={{ color: '#1C1917' }}>Atualizar Ingrediente</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold" style={{ color: '#78716C' }}>Ingrediente</label>
                  <select value={formIng.ingrediente} onChange={e => setFormIng(p => ({ ...p, ingrediente: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 rounded-lg border text-sm"
                    style={{ borderColor: '#E5E0D9' }} required>
                    <option value="">Selecionar...</option>
                    {INGREDIENTES.map(i => <option key={i.id} value={i.label}>{i.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold" style={{ color: '#78716C' }}>Quantidade (g/ml)</label>
                  <input type="number" min="0" value={formIng.quantidade} onChange={e => setFormIng(p => ({ ...p, quantidade: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 rounded-lg border text-sm"
                    style={{ borderColor: '#E5E0D9' }} required />
                </div>
              </div>
              <div className="flex gap-2 mt-5">
                <button type="button" onClick={() => setModalIng(false)}
                  className="flex-1 py-2.5 rounded-xl border text-sm" style={{ borderColor: '#E5E0D9', color: '#78716C' }}>Cancelar</button>
                <button type="submit"
                  className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold" style={{ background: '#C2410C' }}>Salvar</button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
