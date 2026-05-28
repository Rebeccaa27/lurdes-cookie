import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { motion, AnimatePresence } from 'framer-motion'
import { catalogoReceitas } from '../lib/receitas'

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

export default function Financeiro() {
  const hoje = new Date()
  const [mes, setMes]   = useState(hoje.getMonth())
  const [ano, setAno]   = useState(hoje.getFullYear())
  const [vendas, setVendas]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [historico, setHistorico] = useState([])
  const [mostrarHist, setMostrarHist] = useState(false)
  const [abaSabor, setAbaSabor] = useState(false)
  const [editandoPreco, setEditandoPreco] = useState(null)
  const [simulandoPreco, setSimulandoPreco] = useState(null)
  const [novoPreco, setNovoPreco] = useState('')
  const [precoSimulado, setPrecoSimulado] = useState('')
  const [precos, setPrecos]     = useState({})
  const [acumulado, setAcumulado] = useState(0)

  const buscarVendas = useCallback(async () => {
    setLoading(true)
    const start = `${ano}-${String(mes + 1).padStart(2, '0')}-01`
    const end   = new Date(ano, mes + 1, 1).toISOString().slice(0, 10)
    const { data } = await supabase
      .from('vendas')
      .select('id,sabor,qtd,valor,pag,data')
      .gte('data', start)
      .lt('data', end)
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
        .from('vendas')
        .select('qtd,valor,pag')
        .gte('data', start)
        .lt('data', end)
      const fat  = (data || []).reduce((s, v) => s + v.valor * v.qtd, 0)
      const pago = (data || []).filter(v => v.pag === 'pago').reduce((s, v) => s + v.valor * v.qtd, 0)
      meses.push({ label: `${MESES[m].slice(0,3)} ${a}`, faturamento: fat, recebido: pago })
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

  useEffect(() => { buscarVendas() }, [buscarVendas])
  useEffect(() => { buscarHistorico() }, [buscarHistorico])
  useEffect(() => { buscarPrecos() }, [buscarPrecos])

  useEffect(() => {
    const ch = supabase.channel('fin-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vendas' }, buscarVendas)
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [buscarVendas])

  const faturamento = vendas.reduce((s, v) => s + v.valor * v.qtd, 0)
  const recebido    = vendas.filter(v => v.pag === 'pago').reduce((s, v) => s + v.valor * v.qtd, 0)
  const aReceber    = faturamento - recebido
  const totalAcumulado = acumulado + faturamento

  const saboresMap = {}
  vendas.forEach(v => {
    if (!saboresMap[v.sabor]) saboresMap[v.sabor] = { sabor: v.sabor, qtd: 0, receita: 0 }
    saboresMap[v.sabor].qtd     += v.qtd
    saboresMap[v.sabor].receita += v.valor * v.qtd
  })
  const sabores = Object.values(saboresMap).sort((a, b) => b.receita - a.receita)

  async function salvarPreco(sabor) {
    const p = parseFloat(novoPreco)
    if (!p || isNaN(p)) return
    const rec = catalogoReceitas[sabor]
    const custo = precos[sabor]?.custo || 0
    await supabase.from('precos_sabores').upsert(
      { sabor, preco: p, custo, atualizado_em: new Date().toISOString() },
      { onConflict: 'sabor' }
    )
    setPrecos(prev => ({ ...prev, [sabor]: { preco: p, custo: prev[sabor]?.custo || 0 } }))
    setEditandoPreco(null)
    setNovoPreco('')
  }

  function navMes(dir) {
    let m = mes + dir, a = ano
    if (m < 0) { m = 11; a-- }
    if (m > 11) { m = 0; a++ }
    setMes(m); setAno(a)
  }

  const fatAnterior = historico.length ? historico[historico.length - 1].faturamento : 0
  const variacao    = fatAnterior > 0 ? ((faturamento - fatAnterior) / fatAnterior * 100).toFixed(1) : null
  const maxHist     = Math.max(faturamento, ...historico.map(x => x.faturamento), 1)

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1C1917' }}>Financeiro</h1>
          <p className="text-sm mt-0.5" style={{ color: '#78716C' }}>Caixa do mês e lucratividade por sabor</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setMostrarHist(v => !v)}
            className="px-3 py-2 rounded-lg text-sm font-medium transition"
            style={{ background: '#fff', border: '1px solid #E5E0D9', color: '#44403C' }}
          >
            {mostrarHist ? 'Ocultar' : '📅 Comparar Meses'}
          </button>
        </div>
      </div>

      {/* Nav mês */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navMes(-1)} className="p-1.5 rounded-lg hover:bg-black/10 transition">‹</button>
        <span className="font-semibold text-sm" style={{ color: '#1C1917' }}>{MESES[mes]} {ano}</span>
        <button onClick={() => navMes(1)} className="p-1.5 rounded-lg hover:bg-black/10 transition">›</button>
        {variacao !== null && (
          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
            Number(variacao) >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {Number(variacao) >= 0 ? '▲' : '▼'} {Math.abs(variacao)}% vs mês anterior
          </span>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Faturamento', value: `R$ ${faturamento.toFixed(2).replace('.',',')}`, color: '#1C1917' },
          { label: 'No Caixa',   value: `R$ ${recebido.toFixed(2).replace('.',',')}`,    color: '#15803D' },
          { label: 'A Receber',  value: `R$ ${aReceber.toFixed(2).replace('.',',')}`,    color: '#C2410C' },
          { label: 'Vendas',     value: vendas.reduce((s,v)=>s+v.qtd,0),                color: '#1C1917' },
        ].map(k => (
          <div key={k.label} className="rounded-xl p-4" style={{ background: '#fff', border: '1px solid #E5E0D9' }}>
            <p className="text-xs mb-1" style={{ color: '#78716C' }}>{k.label}</p>
            <p className="text-xl font-bold" style={{ color: k.color }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Histórico comparativo */}
      <AnimatePresence>
        {mostrarHist && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <div className="rounded-xl p-4" style={{ background: '#fff', border: '1px solid #E5E0D9' }}>
              <div className="flex items-start justify-between mb-4">
                <p className="font-semibold text-sm" style={{ color: '#1C1917' }}>📊 Comparativo — Últimos 6 meses</p>
                <div className="text-right">
                  <p className="text-xs" style={{ color: '#78716C' }}>Acumulado total</p>
                  <p className="font-bold text-sm" style={{ color: '#15803D' }}>R$ {totalAcumulado.toFixed(2).replace('.',',')}</p>
                </div>
              </div>
              <div className="space-y-2">
                {historico.map(h => (
                  <div key={h.label} className="flex items-center gap-3">
                    <span className="text-xs w-16 text-right" style={{ color: '#78716C' }}>{h.label}</span>
                    <div className="flex-1 bg-stone-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full"
                        style={{ width: `${(h.faturamento / maxHist) * 100}%`, background: '#C2410C', opacity: 0.6 }}
                      />
                    </div>
                    <span className="text-xs font-semibold w-24 text-right" style={{ color: '#1C1917' }}>
                      R$ {h.faturamento.toFixed(2).replace('.',',')}
                    </span>
                  </div>
                ))}
                {/* Mês atual em destaque */}
                <div className="flex items-center gap-3">
                  <span className="text-xs w-16 text-right font-bold" style={{ color: '#C2410C' }}>{MESES[mes].slice(0,3)} {ano}</span>
                  <div className="flex-1 bg-stone-100 rounded-full h-2">
                    <div className="h-2 rounded-full" style={{ width: `${(faturamento / maxHist) * 100}%`, background: '#C2410C' }} />
                  </div>
                  <span className="text-xs font-bold w-24 text-right" style={{ color: '#C2410C' }}>
                    R$ {faturamento.toFixed(2).replace('.',',')}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lucratividade por sabor */}
      <div className="rounded-xl" style={{ background: '#fff', border: '1px solid #E5E0D9' }}>
        <button
          className="w-full flex items-center justify-between p-4"
          onClick={() => setAbaSabor(v => !v)}
        >
          <div className="text-left">
            <p className="font-semibold" style={{ color: '#1C1917' }}>Lucratividade por sabor</p>
            <p className="text-xs mt-0.5" style={{ color: '#78716C' }}>Clique para ver análise e simular preços</p>
          </div>
          <span style={{ color: '#78716C' }}>{abaSabor ? '▲' : '▼'}</span>
        </button>

        <AnimatePresence>
          {abaSabor && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ borderBottom: '1px solid #E5E0D9' }}>
                        {['Sabor','Vendas','Preço/un','Custo/un','Lucro/un','Margem','Ações'].map(h => (
                          <th key={h} className="text-left py-2 pr-4 text-xs font-semibold" style={{ color: '#78716C' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(sabores.length > 0 ? sabores : Object.keys(catalogoReceitas).map(id => ({ sabor: id, qtd: 0, receita: 0 }))).map(s => {
                        const rec    = catalogoReceitas[s.sabor]
                        const preco  = precos[s.sabor]?.preco || rec?.preco || 0
                        const custo  = precos[s.sabor]?.custo || 0
                        const simVal = simulandoPreco === s.sabor && precoSimulado ? parseFloat(precoSimulado) : null
                        const precoMostrar = simVal || preco
                        const lucro  = precoMostrar - custo
                        const margem = precoMostrar > 0 ? ((lucro / precoMostrar) * 100).toFixed(0) : 0
                        const editando  = editandoPreco  === s.sabor
                        const simulando = simulandoPreco === s.sabor
                        return (
                          <tr key={s.sabor} style={{ borderBottom: '1px solid #F5F0EB' }}>
                            <td className="py-2.5 pr-4 font-medium" style={{ color: '#1C1917' }}>{rec?.nome || s.sabor}</td>
                            <td className="py-2.5 pr-4" style={{ color: '#78716C' }}>{s.qtd}</td>
                            <td className="py-2.5 pr-4">
                              {editando ? (
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    value={novoPreco}
                                    onChange={e => setNovoPreco(e.target.value)}
                                    className="w-20 border rounded px-1.5 py-0.5 text-xs"
                                    style={{ borderColor: '#E5E0D9' }}
                                    placeholder={preco}
                                    autoFocus
                                  />
                                  <button onClick={() => salvarPreco(s.sabor)} className="text-xs px-2 py-0.5 rounded text-white" style={{ background: '#15803D' }}>💾 Salvar</button>
                                  <button onClick={() => { setEditandoPreco(null); setNovoPreco('') }} className="text-xs px-1">✕</button>
                                </div>
                              ) : simulando ? (
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    value={precoSimulado}
                                    onChange={e => setPrecoSimulado(e.target.value)}
                                    className="w-20 border rounded px-1.5 py-0.5 text-xs"
                                    style={{ borderColor: '#E5E0D9', background: '#FEF3C7' }}
                                    placeholder={preco}
                                    autoFocus
                                  />
                                  <button
                                    onClick={() => { setEditandoPreco(s.sabor); setNovoPreco(precoSimulado); setSimulandoPreco(null) }}
                                    className="text-xs px-2 py-0.5 rounded text-white" style={{ background: '#C2410C' }}
                                  >💾 Salvar</button>
                                  <button onClick={() => { setSimulandoPreco(null); setPrecoSimulado('') }} className="text-xs px-1">✕</button>
                                </div>
                              ) : (
                                <span style={{ color: simVal ? '#C2410C' : '#44403C', fontWeight: simVal ? 600 : 400 }}>
                                  R$ {precoMostrar.toFixed(2).replace('.',',')}
                                  {simVal && <span className="ml-1 text-xs text-amber-600">(simulado)</span>}
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 pr-4" style={{ color: '#78716C' }}>R$ {custo.toFixed(2).replace('.',',')}</td>
                            <td className="py-2.5 pr-4 font-semibold" style={{ color: '#15803D' }}>R$ {lucro.toFixed(2).replace('.',',')}</td>
                            <td className="py-2.5 pr-4">
                              <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: '#DCFCE7', color: '#15803D' }}>{margem}%</span>
                            </td>
                            <td className="py-2.5">
                              <div className="flex gap-1">
                                <button
                                  onClick={() => { setSimulandoPreco(s.sabor); setPrecoSimulado(preco.toString()); setEditandoPreco(null) }}
                                  className="text-xs px-2 py-1 rounded hover:bg-amber-50 transition"
                                  style={{ color: '#92400E' }}
                                  title="Simular novo preço sem salvar"
                                >🔮 Simular</button>
                                <button
                                  onClick={() => { setEditandoPreco(s.sabor); setNovoPreco(preco.toString()); setSimulandoPreco(null) }}
                                  className="text-xs px-2 py-1 rounded hover:bg-stone-100 transition"
                                  style={{ color: '#C2410C' }}
                                  title="Editar e salvar preço"
                                >✏️ Editar</button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
