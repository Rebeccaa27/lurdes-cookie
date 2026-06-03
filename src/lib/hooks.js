import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabaseClient'

// ── Auth ──────────────────────────────────────────────────────────────────────
export function useAuth() {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  return { user, loading }
}

// ── Vendas ────────────────────────────────────────────────────────────────────
export function useVendas(mes, ano) {
  const [vendas, setVendas]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const fetchVendas = useCallback(async () => {
    setLoading(true)
    const start = `${ano}-${String(mes + 1).padStart(2, '0')}-01`
    const end   = new Date(ano, mes + 1, 1).toISOString().slice(0, 10)
    const { data, error } = await supabase
      .from('vendas')
      .select('id, cliente, sabor, qtd, valor, pag, data, created_at')
      .gte('data', start)
      .lt('data', end)
      .order('data', { ascending: false })
    if (error) setError(error.message)
    else setVendas(data || [])
    setLoading(false)
  }, [mes, ano])

  useEffect(() => { fetchVendas() }, [fetchVendas])

  useEffect(() => {
    const channel = supabase
      .channel(`vendas-rt-${mes}-${ano}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vendas' }, () => fetchVendas())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [fetchVendas, mes, ano])

  return { vendas, loading, error, refetch: fetchVendas }
}

// ── Clientes ──────────────────────────────────────────────────────────────────
function normNomeCliente(n) {
  return (n || '').trim().toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
}

export function useClientes() {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading]   = useState(true)

  const fetchClientes = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('vendas').select('cliente').order('cliente')
    const seen = new Set()
    const unicos = []
    ;(data || []).forEach(v => {
      const norm = normNomeCliente(v.cliente)
      if (norm && !seen.has(norm)) { seen.add(norm); unicos.push(norm) }
    })
    setClientes(unicos.map(nome => ({ nome })))
    setLoading(false)
  }, [])

  useEffect(() => { fetchClientes() }, [fetchClientes])
  return { clientes, loading, refetch: fetchClientes }
}

// ── Estoque ───────────────────────────────────────────────────────────────────
export function useEstoque() {
  const [estoque, setEstoque] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchEstoque = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('estoque')
      .select('id, ingrediente, quantidade, updated_at')
      .order('ingrediente')
    setEstoque(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchEstoque() }, [fetchEstoque])

  const estoqueMap = (estoque || []).reduce((acc, r) => {
    acc[r.ingrediente] = r.quantidade
    return acc
  }, {})

  return { estoque, estoqueMap, loading, refetch: fetchEstoque }
}

// ── Custos ────────────────────────────────────────────────────────────────────
export function useCustos(mes, ano) {
  const [custos, setCustos]   = useState([])
  const [loading, setLoading] = useState(true)

  const fetchCustos = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('custos_operacionais')
      .select('*')
      .eq('mes', mes + 1)
      .eq('ano', ano)
    setCustos(data || [])
    setLoading(false)
  }, [mes, ano])

  useEffect(() => { fetchCustos() }, [fetchCustos])
  return { custos, loading, refetch: fetchCustos }
}

// ── Conversas (Chat) ──────────────────────────────────────────────────────────
export function useConversas(filtro = 'todas') {
  const [conversas, setConversas] = useState([])
  const [loading, setLoading]     = useState(true)

  const fetchConversas = useCallback(async () => {
    setLoading(true)
    let q = supabase
      .from('conversas')
      .select('*, mensagens(id, texto, criado_em, origem)')
      .order('atualizado_em', { ascending: false })

    if (filtro === 'nao_lidas')  q = q.eq('nao_lida', true)
    if (filtro === 'automacao')  q = q.eq('status', 'automacao')
    if (filtro === 'finalizadas') q = q.eq('status', 'finalizada')

    const { data } = await q
    setConversas(data || [])
    setLoading(false)
  }, [filtro])

  useEffect(() => { fetchConversas() }, [fetchConversas])

  useEffect(() => {
    const ch = supabase
      .channel('conversas-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversas' }, fetchConversas)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mensagens' }, fetchConversas)
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [fetchConversas])

  return { conversas, loading, refetch: fetchConversas }
}

export function useMensagens(conversaId) {
  const [mensagens, setMensagens] = useState([])
  const [loading, setLoading]     = useState(true)

  const fetchMensagens = useCallback(async () => {
    if (!conversaId) { setMensagens([]); setLoading(false); return }
    setLoading(true)
    const { data } = await supabase
      .from('mensagens')
      .select('*')
      .eq('conversa_id', conversaId)
      .order('criado_em', { ascending: true })
    setMensagens(data || [])
    setLoading(false)
  }, [conversaId])

  useEffect(() => { fetchMensagens() }, [fetchMensagens])

  useEffect(() => {
    if (!conversaId) return
    const ch = supabase
      .channel(`mensagens-${conversaId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'mensagens',
        filter: `conversa_id=eq.${conversaId}`
      }, fetchMensagens)
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [conversaId, fetchMensagens])

  return { mensagens, loading, refetch: fetchMensagens }
}

// ── Helpers de estado ─────────────────────────────────────────────────────────
export function useMesAtual() {
  const now = new Date()
  const [mes, setMes] = useState(now.getMonth())
  const [ano, setAno] = useState(now.getFullYear())

  function prev() {
    if (mes === 0) { setMes(11); setAno(a => a - 1) }
    else setMes(m => m - 1)
  }
  function next() {
    if (mes === 11) { setMes(0); setAno(a => a + 1) }
    else setMes(m => m + 1)
  }
  function reset() { setMes(now.getMonth()); setAno(now.getFullYear()) }

  return { mes, ano, prev, next, reset }
}

export function useDarkMode() {
  const [dark, setDark] = useState(() => {
    try {
      const stored = localStorage.getItem('lc_dark')
      if (stored !== null) return stored === 'true'
    } catch {}
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    try { localStorage.setItem('lc_dark', dark) } catch {}
  }, [dark])

  return [dark, setDark]
}
