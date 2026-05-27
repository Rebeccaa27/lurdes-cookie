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
    // Sem JOIN — tabela vendas não tem FK para clientes
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

  // Realtime: re-busca quando qualquer linha de vendas mudar
  useEffect(() => {
    const channel = supabase
      .channel(`vendas-rt-${mes}-${ano}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vendas' }, () => {
        fetchVendas()
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [fetchVendas, mes, ano])

  return { vendas, loading, error, refetch: fetchVendas }
}

// ── Clientes (lista de nomes únicos das vendas) ────────────────────────────
export function useClientes() {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading]   = useState(true)

  const fetchClientes = useCallback(async () => {
    setLoading(true)
    // Busca nomes únicos direto da tabela vendas (não há tabela clientes separada)
    const { data } = await supabase
      .from('vendas')
      .select('cliente')
      .order('cliente')
    const unicos = [...new Set((data || []).map(v => v.cliente).filter(Boolean))]
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
    // Coluna é 'ingrediente' (texto), não 'ingrediente_id'
    const { data } = await supabase
      .from('estoque')
      .select('id, ingrediente, quantidade, updated_at')
      .order('ingrediente')
    setEstoque(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchEstoque() }, [fetchEstoque])

  // Map por ingrediente_id (compat com componentes que usam IDs do receitas.js)
  // e também por nome do ingrediente
  const estoqueMap = (estoque || []).reduce((acc, r) => {
    // chave pelo nome exato do banco
    acc[r.ingrediente] = r.quantidade
    return acc
  }, {})

  return { estoque, estoqueMap, loading, refetch: fetchEstoque }
}

// ── Custos Operacionais ───────────────────────────────────────────────────────
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

// ── Mês atual state ───────────────────────────────────────────────────────────
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
