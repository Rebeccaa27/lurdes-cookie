import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { motion, AnimatePresence } from 'framer-motion'
import { catalogoReceitas, RECEITAS_LIST } from '../lib/receitas'

const MESES = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
]

function receitaPorNome(nome) {
  return RECEITAS_LIST.find(
    r => r.nome.toLowerCase() === nome?.toLowerCase()
  ) || null
}

export default function Financeiro() {
  const hoje = new Date()
  const [mes, setMes] = useState(hoje.getMonth())
  const [ano, setAno] = useState(hoje.getFullYear())
  const [vendas, setVendas]   = useState([])
  const [loading, setLoading] = useState(true)
  const [historico, setHistorico]     = useState([])
  const [mostrarHist, setMostrarHist] = useState(false)
  const [abaSabor, setAbaSabor]       = useState(false)
  const [editandoPreco, setEditandoPreco]   = useState(null)
  const [simulandoPreco, setSimulandoPreco] = useState(null)
  const [novoPreco, setNovoPreco]           = useState('')
  const [precoSimulado, setPrecoSimulado]   = useState('')
  const [precos, setPrecos]   = useState({})
  const [acumulado, setAcumulado] = useState(0)

  const buscarVendas = useCallback(async () => {
    setLoading(true)
    const start = `${ano}-${String(mes + 1).padStart(2, '0')}-01`
    const end   = new Date(ano, mes + 1, 1).toISOString().slice(0, 10)
    const { data } = await supabase
      .from('vendas')
      .select('id,sabor,qtd,valor,pag,data')
      .gte('data', start).lt('data', end)
    setVendas(data || [])
    setLoading(false)
  }, [mes, ano])

  const buscarHistorico = useCallback(async () => {
    const meses = []
    for (let i = 1; i <= 6; i++) {
      let m = mes - i, a = ano
      if (m < 0) { m += 12; a-- }
      const start = `${a}-${String(m + 1).padStart(2, '0')}-01`
      const end   = new Date(a, m + 1, 1).toISOString().slice(0, 10)
      const { data } = await supabase
        .from('vendas').select('qtd,valor,pag').gte('data', start).lt('data', end)
      const fat  = (data || []).reduce((s, v) => s + v.valor * v.qtd, 0)
      const pago = (data || []).filter(v => v.pag === 'pago').reduce((s, v) => s + v.valor * v.qtd, 0)
      meses.push({ label: `${MESES[m].slice(0, 3)} ${a}`, faturamento: fat, recebido: pago })
    }
    const lista = meses.reverse()
    setHistorico(lista)
    setAcumulado(lista.reduce((s, h) => s + h.faturamento, 0))
  }, [mes, ano])

  const buscarPrecos = useCallback(async () => {
    const { data } = await supabase.from('precos_sabores').select('sabor,preco,custo')
    if (data) {
      const map = {}
      data.forEach(r => { map[r.sabor] = { preco: r.preco, custo: r.custo } })
      setPrecos(map)
    }
  }, [])

  useEffect(() => { buscarVendas()    }, [buscarVendas])
  useEffect(() => { buscarHistorico() }, [buscarHistorico])
  useEffect(() => { buscarPrecos()    }, [buscarPrecos])

  useEffect(() => {
    const ch = supabase.channel('fin-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vendas' }, buscarVendas)
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [buscarVendas])

  const faturamento = vendas.reduce((s, v) => s + Number(v.valor) * v.qtd, 0)
  const recebido    = vendas.filter(v => v.pag === 'pago').reduce((s, v) => s + Number(v.valor) * v.qtd, 0)
  const aReceber    = faturamento - recebido

  const saboresMap = {}
  vendas.forEach(v => {
    const key = v.sabor
    if (!saboresMap[key]) saboresMap[key] = { sabor: key, qtd: 0, receita: 0 }
    saboresMap[key].qtd     += v.qtd
    saboresMap[key].receita += Number(v.valor) * v.qtd
  })

  const todosSabores = RECEITAS_LIST.map(r => ({
    sabor:   r.nome,
    qtd:     saboresMap[r.nome]?.qtd     ?? 0,
    receita: saboresMap[r.nome]?.receita ?? 0,
  })).sort((a, b) => b.receita - a.receita || a.sabor.localeCompare(b.sabor, 'pt-BR'))

  // ─ Saúde financeira geral (baseada nos preços cadastrados) ────────────
  const analiseGeral = (() => {
    const comCusto = todosSabores.filter(s => {
      const custo = precos[s.sabor]?.custo ?? 0
      return custo > 0
    })
    if (comCusto.length === 0) return null   // sem custo cadastrado ainda

    const margens = comCusto.map(s => {
      const preco = precos[s.sabor]?.preco ?? receitaPorNome(s.sabor)?.preco ?? 0
      const custo = precos[s.sabor]?.custo ?? 0
      return preco > 0 ? ((preco - custo) / preco) * 100 : 0
    })
    const mediaM   = margens.reduce((a, b) => a + b, 0) / margens.length
    const abaixo30 = comCusto.filter((s, i) => margens[i] < 30)
    const prejuizo = comCusto.filter((s, i) => margens[i] <= 0)

    if (prejuizo.length > 0) {
      return {
        tipo: 'danger',
        emoji: '⚠️',
        titulo: 'Atenção: você está vendendo com prejuízo!',
        msg: `${prejuizo.map(s => s.sabor).join(', ')} estão com custo acima do preço de venda. Ajuste o preço ou reduza o custo.`,
      }
    }
    if (mediaM >= 30) {
      return {
        tipo: 'success',
        emoji: '💰',
        titulo: `Lucrando bem — margem média ${mediaM.toFixed(0)}%`,
        msg: 'Todos os sabores estão com margem saudável. Continue assim!',
      }
    }
    if (mediaM >= 10) {
      return {
        tipo: 'warning',
        emoji: '📉',
        titulo: `Margem baixa — média ${mediaM.toFixed(0)}%`,
        msg: abaixo30.length > 0
          ? `${abaixo30.map(s => s.sabor).join(', ')} estão abaixo de 30% de margem. Considere ajustar os preços.`
          : 'Margem abaixo do ideal. O recomendado é pelo menos 30% por sabor.',
      }
    }
    return {
      tipo: 'danger',
      emoji: '🚨',
      titulo: `Margem crítica — média ${mediaM.toFixed(0)}%`,
      msg: 'A margem média está abaixo de 10%. Revise os custos e preços urgente.',
    }
  })()

  const bannerStyle = {
    success: { bg: '#F0FDF4', border: '#86EFAC', text: '#166534' },
    warning: { bg: '#FFFBEB', border: '#FDE68A', text: '#92400E' },
    danger:  { bg: '#FEF2F2', border: '#FECACA', text: '#991B1B' },
  }

  async function salvarPreco(nomeSabor) {
    const p = parseFloat(novoPreco)
    if (!p || isNaN(p)) return
    const custo = precos[nomeSabor]?.custo || 0
    const { error } = await supabase.from('precos_sabores').upsert(
      { sabor: nomeSabor, preco: p, custo, atualizado_em: new Date().toISOString() },
      { onConflict: 'sabor' }
    )
    if (error) { console.error(error); return }
    setPrecos(prev => ({ ...prev, [nomeSabor]: { preco: p, custo: prev[nomeSabor]?.custo || 0 } }))
    setEditandoPreco(null)
    setNovoPreco('')
  }

  function navMes(dir) {
    let m = mes + dir, a = ano
    if (m < 0)  { m = 11; a-- }
    if (m > 11) { m = 0;  a++ }
    setMes(m); setAno(a)
  }

  const fatAnterior    = historico.length ? historico[historico.length - 1].faturamento : 0
  const variacao       = fatAnterior > 0 ? ((faturamento - fatAnterior) / fatAnterior * 100).toFixed(1) : null
  const maxHist        = Math.max(faturamento, ...historico.map(x => x.faturamento), 1)
  const totalAcumulado = acumulado + faturamento

  return (
    <div className="max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <p className="section-title mb-1">Caixa</p>
          <h1 className="font-display text-2xl" style={{ color: 'var(--text-hi)' }}>Financeiro</h1>
        </div>
        <button onClick={() => setMostrarHist(v => !v)} className="btn btn-secondary btn-sm">
          {mostrarHist ? 'Ocultar histórico' : 'Comparar meses'}
        </button>
      </div>

      {/* Nav mês */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navMes(-1)} className="btn btn-ghost btn-sm">‹</button>
        <span className="font-semibold" style={{ color: 'var(--text-hi)' }}>{MESES[mes]} {ano}</span>
        <button onClick={() => navMes(1)}  className="btn btn-ghost btn-sm">›</button>
        {variacao !== null && (
          <span className={`badge ${Number(variacao) >= 0 ? 'badge-green' : 'badge-red'}`}>
            {Number(variacao) >= 0 ? '+' : ''}{variacao}% vs mês anterior
          </span>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Faturamento', value: `R$ ${faturamento.toFixed(2).replace('.',',')}`, color: 'var(--text-hi)'  },
          { label: 'No Caixa',   value: `R$ ${recebido.toFixed(2).replace('.',',')}`,    color: 'var(--success)' },
          { label: 'A Receber',  value: `R$ ${aReceber.toFixed(2).replace('.',',')}`,    color: 'var(--brand)'   },
          { label: 'Cookies',    value: vendas.reduce((s, v) => s + v.qtd, 0),          color: 'var(--text-hi)'  },
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

      {/* Histórico */}
      <AnimatePresence>
        {mostrarHist && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <div className="card">
              <div className="flex items-start justify-between mb-4">
                <p className="font-semibold" style={{ color: 'var(--text-hi)' }}>Comparativo — Últimos 6 meses</p>
                <div className="text-right">
                  <p className="section-title">Acumulado</p>
                  <p className="font-bold text-sm mt-0.5" style={{ color: 'var(--success)' }}>
                    R$ {totalAcumulado.toFixed(2).replace('.',',')}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                {historico.map(h => (
                  <div key={h.label} className="flex items-center gap-3">
                    <span className="text-xs w-16 text-right" style={{ color: 'var(--text-lo)' }}>{h.label}</span>
                    <div className="flex-1 rounded-full h-2" style={{ background: 'var(--bg)' }}>
                      <div className="h-2 rounded-full" style={{ width: `${(h.faturamento / maxHist) * 100}%`, background: 'var(--brand)', opacity: .5 }} />
                    </div>
                    <span className="text-xs font-semibold w-24 text-right" style={{ color: 'var(--text-hi)' }}>
                      R$ {h.faturamento.toFixed(2).replace('.',',')}
                    </span>
                  </div>
                ))}
                <div className="flex items-center gap-3">
                  <span className="text-xs w-16 text-right font-bold" style={{ color: 'var(--brand)' }}>
                    {MESES[mes].slice(0, 3)} {ano}
                  </span>
                  <div className="flex-1 rounded-full h-2" style={{ background: 'var(--bg)' }}>
                    <div className="h-2 rounded-full" style={{ width: `${(faturamento / maxHist) * 100}%`, background: 'var(--brand)' }} />
                  </div>
                  <span className="text-xs font-bold w-24 text-right" style={{ color: 'var(--brand)' }}>
                    R$ {faturamento.toFixed(2).replace('.',',')}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lucratividade por sabor */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <button
          className="w-full flex items-center justify-between px-5 py-4"
          onClick={() => setAbaSabor(v => !v)}
        >
          <div className="text-left">
            <p className="font-semibold" style={{ color: 'var(--text-hi)' }}>Lucratividade por sabor</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-lo)' }}>Clique para ver análise e simular preços</p>
          </div>
          <span style={{ color: 'var(--text-lo)' }}>{abaSabor ? '▲' : '▼'}</span>
        </button>

        <AnimatePresence>
          {abaSabor && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              {/* ─── Banner de saúde financeira ─────────────────────── */}
              {analiseGeral ? (
                <div
                  className="mx-5 mt-4 mb-2 rounded-xl px-4 py-3"
                  style={{
                    background: bannerStyle[analiseGeral.tipo].bg,
                    border: `1px solid ${bannerStyle[analiseGeral.tipo].border}`,
                  }}
                >
                  <p className="font-semibold text-sm" style={{ color: bannerStyle[analiseGeral.tipo].text }}>
                    {analiseGeral.emoji} {analiseGeral.titulo}
                  </p>
                  <p className="text-xs mt-1" style={{ color: bannerStyle[analiseGeral.tipo].text, opacity: .85 }}>
                    {analiseGeral.msg}
                  </p>
                </div>
              ) : (
                <div
                  className="mx-5 mt-4 mb-2 rounded-xl px-4 py-3"
                  style={{ background: '#F8FAFC', border: '1px solid var(--border)' }}
                >
                  <p className="text-sm" style={{ color: 'var(--text-lo)' }}>
                    💡 Cadastre o <strong>custo</strong> de cada sabor clicando em <strong>Editar</strong> para ver a análise de lucro.
                  </p>
                </div>
              )}

              <div className="tbl-wrap" style={{ borderTop: '1px solid var(--border)' }}>
                <table className="tbl">
                  <thead>
                    <tr>
                      {['Sabor','Vendas','Preço/un','Custo/un','Lucro/un','Margem','Ações'].map(h => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {todosSabores.map(s => {
                      const rec    = receitaPorNome(s.sabor)
                      const preco  = precos[s.sabor]?.preco ?? rec?.preco ?? 0
                      const custo  = precos[s.sabor]?.custo ?? 0
                      const simVal = simulandoPreco === s.sabor && precoSimulado ? parseFloat(precoSimulado) : null
                      const precoMostrar = simVal || preco
                      const lucro  = precoMostrar - custo
                      const margem = precoMostrar > 0 ? ((lucro / precoMostrar) * 100).toFixed(0) : 0
                      const isEdit = editandoPreco  === s.sabor
                      const isSim  = simulandoPreco === s.sabor
                      return (
                        <tr key={s.sabor}>
                          <td className="font-medium" style={{ color: 'var(--text-hi)' }}>{s.sabor}</td>
                          <td>{s.qtd > 0 ? s.qtd : <span style={{ color: 'var(--text-lo)' }}>—</span>}</td>
                          <td>
                            {isEdit ? (
                              <div className="flex items-center gap-1">
                                <input
                                  type="number" autoFocus value={novoPreco}
                                  onChange={e => setNovoPreco(e.target.value)}
                                  className="field" style={{ width: 80, padding: '.25rem .5rem', fontSize: '.8125rem' }}
                                  placeholder={preco}
                                />
                                <button onClick={() => salvarPreco(s.sabor)} className="btn btn-sm" style={{ background: 'var(--success)', color: '#fff' }}>Salvar</button>
                                <button onClick={() => { setEditandoPreco(null); setNovoPreco('') }} className="btn btn-ghost btn-sm">X</button>
                              </div>
                            ) : isSim ? (
                              <div className="flex items-center gap-1">
                                <input
                                  type="number" autoFocus value={precoSimulado}
                                  onChange={e => setPrecoSimulado(e.target.value)}
                                  className="field" style={{ width: 80, padding: '.25rem .5rem', fontSize: '.8125rem', background: '#FEF3C7' }}
                                  placeholder={preco}
                                />
                                <button
                                  onClick={() => { setEditandoPreco(s.sabor); setNovoPreco(precoSimulado); setSimulandoPreco(null) }}
                                  className="btn btn-sm" style={{ background: 'var(--brand)', color: '#fff' }}
                                >Salvar</button>
                                <button onClick={() => { setSimulandoPreco(null); setPrecoSimulado('') }} className="btn btn-ghost btn-sm">X</button>
                              </div>
                            ) : (
                              <span style={{ color: simVal ? 'var(--brand)' : 'var(--text-md)', fontWeight: simVal ? 600 : 400 }}>
                                R$ {precoMostrar.toFixed(2).replace('.',',')}
                                {simVal && <span className="badge badge-orange ml-1">simulado</span>}
                              </span>
                            )}
                          </td>
                          <td style={{ color: 'var(--text-lo)' }}>R$ {custo.toFixed(2).replace('.',',')}</td>
                          <td style={{ color: lucro >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                            R$ {lucro.toFixed(2).replace('.',',')}
                          </td>
                          <td>
                            <span className={`badge ${Number(margem) >= 30 ? 'badge-green' : Number(margem) >= 10 ? 'badge-orange' : 'badge-red'}`}>
                              {margem}%
                            </span>
                          </td>
                          <td>
                            <div className="flex gap-1">
                              <button
                                onClick={() => { setSimulandoPreco(s.sabor); setPrecoSimulado(String(preco)); setEditandoPreco(null) }}
                                className="btn btn-ghost btn-sm" style={{ color: 'var(--warn)' }}
                              >🔮 Simular</button>
                              <button
                                onClick={() => { setEditandoPreco(s.sabor); setNovoPreco(String(preco)); setSimulandoPreco(null) }}
                                className="btn btn-ghost btn-sm" style={{ color: 'var(--brand)' }}
                              >✏️ Editar</button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
