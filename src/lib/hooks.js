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

// ── Dark mode ─────────────────────────────────────────────────────────────────
export function useDarkMode() {
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem('lc_dark')
    if (stored !== null) return stored === 'true'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('lc_dark', dark)
  }, [dark])

  return [dark, setDark]
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
      .select('*')
      .gte('data', start)
      .lt('data', end)
      .order('data', { ascending: false })

    if (error) setError(error.message)
    else setVendas(data || [])
    setLoading(false)
  }, [mes, ano])

  useEffect(() => { fetchVendas() }, [fetchVendas])

  return { vendas, loading, error, refetch: fetchVendas }
}

// ── Estoque ───────────────────────────────────────────────────────────────────
export function useEstoque() {
  const [estoque, setEstoque] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchEstoque = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('estoque').select('*').order('ingrediente')
    setEstoque(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchEstoque() }, [fetchEstoque])

  return { estoque, loading, refetch: fetchEstoque }
}
