import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { motion, AnimatePresence } from 'framer-motion'
import { RECEITAS_LIST, catalogoReceitas } from '../lib/receitas'
import { useToast } from '../components/Toast'

const MESES = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
]

function receitaPorNome(nome) {
  return RECEITAS_LIST.find(r => r.nome.toLowerCase() === nome?.toLowerCase()) || null
}

function fmt(v) { return `R$ ${Number(v).toFixed(2).replace('.',',')}` }

// Calcula custo de 1 cookie de uma receita usando preços por kg
function calcularCustoCookie(receita, precosIng) {
  if (!receita) return 0
  const ingredientes = { ...receita.massa, ...(receita.recheio || {}) }
  let total = 0
  Object.entries(ingredientes).forEach(([ing, qtdG]) => {
    const precoKg = precosIng[ing] ?? 0
    if (precoKg > 0) total += (qtdG / 1000) * precoKg
  })
  return total / (receita.rendimento || 5)
}

export default function Financeiro() {
  const toast = useToast()
  const hoje  = new Date()
  const [mes, setMes] = useState(hoje.getMonth())
  const [ano, setAno] = useState(hoje.getFullYear())
  const [vendas,   setVendas]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [historico, setHistorico]     = useState([])
  const [mostrarHist, setMostrarHist] = useState(false)
  const [abaSabor,    setAbaSabor]    = useState(false)
  const [precos,    setPrecos]    = useState({})     // precos_sabores: preco salvo manualmente
  const [precosIng, setPrecosIng] = useState({})     // precos_ingredientes: preco por kg
  const [acumulado, setAcumulado] = useState(0)

  // modal editar
  const [modalEditar, setModalEditar] = useState(null)
  const [editPreco,   setEditPreco]   = useState('')
  const [editCusto,   setEditCusto]   = useState('')
  const [salvando,    setSalvando]    = useState(false)

  // simular
  const [simSabor, setSimSabor] = useState(null)
  const [simPreco, setSimPreco] = useState('')

  const buscarVendas = useCallback(async () => {
    setLoading(true)
    const start = `${ano}-${String(mes+1).padStart(2,'0')}-01`
    const end   = new Date(ano, mes+1, 1).toISOString().slice(0,10)
    const { data } = await supabase.from('vendas').select('id,sabor,qtd,valor,pag,data').gte('data',start).lt('data',end)
    setVendas(data || [])
    setLoading(false)
  }, [mes, ano])

  const buscarHistorico = useCallback(async () => {
    const meses = []
    for (let i = 1; i <= 6; i++) {
      let m = mes - i, a = ano
      if (m < 0) { m += 12; a-- }
      const start = `${a}-${String(m+1).padStart(2,'0')}-01`
      const end   = new Date(a, m+1, 1).toISOString().slice(0,10)
      const { data } = await supabase.from('vendas').select('qtd,valor,pag').gte('data',start).lt('data',end)
      const fat  = (data||[]).reduce((s,v) => s + v.valor*v.qtd, 0)
      const pago = (data||[]).filter(v => v.pag==='pago').reduce((s,v) => s + v.valor*v.qtd, 0)
      meses.push({ label:`${MESES[m].slice(0,3)} ${a}`, faturamento:fat, recebido:pago })
    }
    const lista = meses.reverse()
    setHistorico(lista)
    setAcumulado(lista.reduce((s,h) => s + h.faturamento, 0))
  }, [mes, ano])

  const buscarPrecos = useCallback(async () => {
    const { data } = await supabase.from('precos_sabores').select('sabor,preco,custo')
    if (data) {
      const map = {}
      data.forEach(r => { map[r.sabor] = { preco: r.preco??0, custo: r.custo??0 } })
      setPrecos(map)
    }
  }, [])

  const buscarPrecosIng = useCallback(async () => {
    const { data } = await supabase.from('precos_ingredientes').select('ingrediente,preco_kg')
    if (data) {
      const map = {}
      data.forEach(r => { map[r.ingrediente] = r.preco_kg })
      setPrecosIng(map)
    }
  }, [])

  useEffect(() => { buscarVendas()    }, [buscarVendas])
  useEffect(() => { buscarHistorico() }, [buscarHistorico])
  useEffect(() => { buscarPrecos()    }, [buscarPrecos])
  useEffect(() => { buscarPrecosIng() }, [buscarPrecosIng])

  useEffect(() => {
    const ch = supabase.channel('fin-rt')
      .on('postgres_changes', { event:'*', schema:'public', table:'vendas' }, buscarVendas)
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [buscarVendas])

  const faturamento = vendas.reduce((s,v) => s + Number(v.valor)*v.qtd, 0)
  const recebido    = vendas.filter(v => v.pag==='pago').reduce((s,v) => s + Number(v.valor)*v.qtd, 0)
  const aReceber    = faturamento - recebido

  const saboresMap = {}
  vendas.forEach(v => {
    if (!saboresMap[v.sabor]) saboresMap[v.sabor] = { qtd:0, receita:0 }
    saboresMap[v.sabor].qtd     += v.qtd
    saboresMap[v.sabor].receita += Number(v.valor)*v.qtd
  })

  const todosSabores = RECEITAS_LIST.map(r => ({
    sabor:   r.nome,
    qtd:     saboresMap[r.nome]?.qtd     ?? 0,
    receita: saboresMap[r.nome]?.receita ?? 0,
  })).sort((a,b) => b.receita - a.receita || a.sabor.localeCompare(b.sabor,'pt-BR'))

  // resolve custo: manual (precos_sabores) > automático (ingredientes) > 0
  function getCusto(nomeSabor) {
    const custoManual = precos[nomeSabor]?.custo ?? 0
    if (custoManual > 0) return { custo: custoManual, fonte: 'manual' }
    const rec = Object.values(catalogoReceitas).find(r => r.nome === nomeSabor)
    const custoAuto = calcularCustoCookie(rec, precosIng)
    if (custoAuto > 0) return { custo: custoAuto, fonte: 'auto' }
    return { custo: 0, fonte: 'vazio' }
  }

  // ─ Saúde financeira ──────────────────────────────────────────────
  const analiseGeral = (() => {
    const comCusto = todosSabores.filter(s => getCusto(s.sabor).custo > 0)
    if (comCusto.length === 0) return null
    const margens = comCusto.map(s => {
      const p = precos[s.sabor]?.preco ?? receitaPorNome(s.sabor)?.preco ?? 0
      const c = getCusto(s.sabor).custo
      return p > 0 ? ((p-c)/p)*100 : 0
    })
    const mediaM   = margens.reduce((a,b) => a+b, 0) / margens.length
    const abaixo30 = comCusto.filter((_,i) => margens[i] < 30)
    const prejuizo = comCusto.filter((_,i) => margens[i] <= 0)
    if (prejuizo.length > 0) return { tipo:'danger',  emoji:'⚠️', titulo:'Atenção: vendendo com prejuízo!',           msg:`${prejuizo.map(s=>s.sabor).join(', ')} estão com custo acima do preço.` }
    if (mediaM >= 30)        return { tipo:'success', emoji:'💰', titulo:`Lucrando bem — margem média ${mediaM.toFixed(0)}%`, msg:'Todos os sabores estão com margem saudável. Continue assim!' }
    if (mediaM >= 10)        return { tipo:'warning', emoji:'📉', titulo:`Margem baixa — média ${mediaM.toFixed(0)}%`,     msg: abaixo30.length ? `${abaixo30.map(s=>s.sabor).join(', ')} abaixo de 30%.` : 'Recomendado mínimo 30% por sabor.' }
    return                          { tipo:'danger',  emoji:'🚨', titulo:`Margem crítica — média ${mediaM.toFixed(0)}%`,  msg:'Revise os custos e preços urgente.' }
  })()

  const BS = {
    success: { bg:'#F0FDF4', border:'#86EFAC', text:'#166534' },
    warning: { bg:'#FFFBEB', border:'#FDE68A', text:'#92400E' },
    danger:  { bg:'#FEF2F2', border:'#FECACA', text:'#991B1B' },
  }

  async function salvarEdicao() {
    const p = parseFloat(editPreco)
    const c = parseFloat(editCusto)
    if (isNaN(p) || p <= 0) { toast('Informe um preço válido', 'error'); return }
    if (isNaN(c) || c < 0)  { toast('Informe um custo válido',  'error'); return }
    setSalvando(true)
    const { error } = await supabase.from('precos_sabores').upsert(
      { sabor: modalEditar.sabor, preco: p, custo: c, atualizado_em: new Date().toISOString() },
      { onConflict: 'sabor' }
    )
    setSalvando(false)
    if (error) { toast('Erro ao salvar: ' + error.message, 'error'); return }
    setPrecos(prev => ({ ...prev, [modalEditar.sabor]: { preco: p, custo: c } }))
    toast('Preços salvos!', 'success')
    setModalEditar(null)
  }

  function abrirEditar(s) {
    const preco = precos[s.sabor]?.preco ?? receitaPorNome(s.sabor)?.preco ?? 0
    const { custo } = getCusto(s.sabor)
    setModalEditar({ sabor: s.sabor, preco, custo })
    setEditPreco(String(preco))
    setEditCusto(custo > 0 ? String(Number(custo).toFixed(2)) : '')
  }

  function navMes(dir) {
    let m = mes+dir, a = ano
    if (m < 0)  { m = 11; a-- }
    if (m > 11) { m = 0;  a++ }
    setMes(m); setAno(a)
  }

  const fatAnterior    = historico.length ? historico[historico.length-1].faturamento : 0
  const variacao       = fatAnterior > 0 ? ((faturamento-fatAnterior)/fatAnterior*100).toFixed(1) : null
  const maxHist        = Math.max(faturamento, ...historico.map(x => x.faturamento), 1)
  const totalAcumulado = acumulado + faturamento

  return (
    <div className="max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <p className="section-title mb-1">Caixa</p>
          <h1 className="font-display text-2xl" style={{ color:'var(--text-hi)' }}>Financeiro</h1>
        </div>
        <button onClick={() => setMostrarHist(v => !v)} className="btn btn-secondary btn-sm">
          {mostrarHist ? 'Ocultar histórico' : 'Comparar meses'}
        </button>
      </div>

      {/* Nav mês */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navMes(-1)} className="btn btn-ghost btn-sm">‹</button>
        <span className="font-semibold" style={{ color:'var(--text-hi)' }}>{MESES[mes]} {ano}</span>
        <button onClick={() => navMes(1)}  className="btn btn-ghost btn-sm">›</button>
        {variacao !== null && (
          <span className={`badge ${Number(variacao)>=0?'badge-green':'badge-red'}`}>
            {Number(variacao)>=0?'+':''}{variacao}% vs mês anterior
          </span>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label:'Faturamento', value:fmt(faturamento), color:'var(--text-hi)'  },
          { label:'No Caixa',   value:fmt(recebido),    color:'var(--success)'  },
          { label:'A Receber',  value:fmt(aReceber),    color:'var(--brand)'    },
          { label:'Cookies',    value:vendas.reduce((s,v)=>s+v.qtd,0), color:'var(--text-hi)' },
        ].map(k => (
          <div key={k.label} className="card">
            <p className="section-title mb-1">{k.label}</p>
            {loading ? <div className="skeleton h-7 w-20 mt-1 rounded" />
              : <p className="text-xl font-bold" style={{ color:k.color }}>{k.value}</p>}
          </div>
        ))}
      </div>

      {/* Histórico */}
      <AnimatePresence>
        {mostrarHist && (
          <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}} className="mb-6 overflow-hidden">
            <div className="card">
              <div className="flex items-start justify-between mb-4">
                <p className="font-semibold" style={{ color:'var(--text-hi)' }}>Comparativo — Últimos 6 meses</p>
                <div className="text-right">
                  <p className="section-title">Acumulado</p>
                  <p className="font-bold text-sm mt-0.5" style={{ color:'var(--success)' }}>R$ {totalAcumulado.toFixed(2).replace('.',',')}</p>
                </div>
              </div>
              <div className="space-y-2">
                {historico.map(h => (
                  <div key={h.label} className="flex items-center gap-3">
                    <span className="text-xs w-16 text-right" style={{ color:'var(--text-lo)' }}>{h.label}</span>
                    <div className="flex-1 rounded-full h-2" style={{ background:'var(--bg)' }}>
                      <div className="h-2 rounded-full" style={{ width:`${(h.faturamento/maxHist)*100}%`, background:'var(--brand)', opacity:.5 }} />
                    </div>
                    <span className="text-xs font-semibold w-24 text-right" style={{ color:'var(--text-hi)' }}>R$ {h.faturamento.toFixed(2).replace('.',',')}</span>
                  </div>
                ))}
                <div className="flex items-center gap-3">
                  <span className="text-xs w-16 text-right font-bold" style={{ color:'var(--brand)' }}>{MESES[mes].slice(0,3)} {ano}</span>
                  <div className="flex-1 rounded-full h-2" style={{ background:'var(--bg)' }}>
                    <div className="h-2 rounded-full" style={{ width:`${(faturamento/maxHist)*100}%`, background:'var(--brand)' }} />
                  </div>
                  <span className="text-xs font-bold w-24 text-right" style={{ color:'var(--brand)' }}>R$ {faturamento.toFixed(2).replace('.',',')}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lucratividade por sabor */}
      <div className="card" style={{ padding:0, overflow:'hidden' }}>
        <button className="w-full flex items-center justify-between px-5 py-4" onClick={() => setAbaSabor(v => !v)}>
          <div className="text-left">
            <p className="font-semibold" style={{ color:'var(--text-hi)' }}>Lucratividade por sabor</p>
            <p className="text-xs mt-0.5" style={{ color:'var(--text-lo)' }}>Clique para ver análise e simular preços</p>
          </div>
          <span style={{ color:'var(--text-lo)' }}>{abaSabor ? '▲' : '▼'}</span>
        </button>

        <AnimatePresence>
          {abaSabor && (
            <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}} className="overflow-hidden">

              {/* Banner saúde */}
              {analiseGeral ? (
                <div className="mx-5 mt-4 mb-2 rounded-xl px-4 py-3" style={{ background:BS[analiseGeral.tipo].bg, border:`1px solid ${BS[analiseGeral.tipo].border}` }}>
                  <p className="font-semibold text-sm" style={{ color:BS[analiseGeral.tipo].text }}>{analiseGeral.emoji} {analiseGeral.titulo}</p>
                  <p className="text-xs mt-1" style={{ color:BS[analiseGeral.tipo].text, opacity:.85 }}>{analiseGeral.msg}</p>
                </div>
              ) : (
                <div className="mx-5 mt-4 mb-2 rounded-xl px-4 py-3" style={{ background:'#EFF6FF', border:'1px solid #BFDBFE' }}>
                  <p className="text-sm" style={{ color:'#1E40AF' }}>
                    💡 Vá em <strong>Estoque → 💰 Preços de Compra</strong> e informe o preço de cada ingrediente para ver o custo calculado automaticamente.
                  </p>
                </div>
              )}

              <div className="tbl-wrap" style={{ borderTop:'1px solid var(--border)' }}>
                <table className="tbl">
                  <thead>
                    <tr>{['Sabor','Vendas','Preço/un','Custo/un','Lucro/un','Margem','Ações'].map(h => <th key={h}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {todosSabores.map(s => {
                      const preco  = precos[s.sabor]?.preco ?? receitaPorNome(s.sabor)?.preco ?? 0
                      const { custo, fonte } = getCusto(s.sabor)
                      const isSim  = simSabor === s.sabor
                      const simVal = isSim && simPreco ? parseFloat(simPreco) : null
                      const precoM = simVal || preco
                      const lucro  = precoM - custo
                      const margem = precoM > 0 ? ((lucro/precoM)*100).toFixed(0) : 0
                      return (
                        <tr key={s.sabor}>
                          <td className="font-medium" style={{ color:'var(--text-hi)' }}>{s.sabor}</td>
                          <td>{s.qtd > 0 ? s.qtd : <span style={{ color:'var(--text-lo)' }}>—</span>}</td>

                          {/* Preço + simulação */}
                          <td>
                            {isSim ? (
                              <div className="flex items-center gap-1">
                                <input type="number" autoFocus min="0" step="0.01" value={simPreco}
                                  onChange={e => setSimPreco(e.target.value)}
                                  className="field" style={{ width:80, padding:'.25rem .5rem', fontSize:'.8125rem', background:'#FEF3C7' }}
                                />
                                <button onClick={() => { setSimSabor(null); setSimPreco('') }} className="btn btn-ghost btn-sm">X</button>
                              </div>
                            ) : (
                              <span style={{ color:simVal?'var(--brand)':'var(--text-md)', fontWeight:simVal?600:400 }}>
                                {fmt(precoM)}{simVal && <span className="badge badge-orange ml-1 text-xs">sim</span>}
                              </span>
                            )}
                          </td>

                          {/* Custo com indicador de fonte */}
                          <td>
                            <span style={{ color: custo>0?'var(--text-md)':'var(--text-lo)' }}>{fmt(custo)}</span>
                            {fonte === 'auto' && <span className="ml-1 text-xs" style={{ color:'var(--brand)', opacity:.7 }} title="Calculado pelos ingredientes">⚙️</span>}
                            {fonte === 'manual' && <span className="ml-1 text-xs" style={{ color:'var(--text-lo)', opacity:.7 }} title="Inserido manualmente">✏️</span>}
                          </td>

                          <td style={{ color:lucro>=0?'var(--success)':'var(--danger)', fontWeight:600 }}>{fmt(lucro)}</td>
                          <td>
                            <span className={`badge ${Number(margem)>=30?'badge-green':Number(margem)>=10?'badge-orange':'badge-red'}`}>
                              {margem}%
                            </span>
                            <span className="ml-1 text-xs" style={{ color:'var(--text-lo)' }}>
                              {custo===0 ? '?' : Number(margem)>=30 ? '✓ ok' : Number(margem)>0 ? '↑ ajustar' : '⚠ prejuízo'}
                            </span>
                          </td>
                          <td>
                            <div className="flex gap-1">
                              <button onClick={() => { setSimSabor(s.sabor); setSimPreco(String(preco)) }} className="btn btn-ghost btn-sm" style={{ color:'var(--warn)' }}>🔮 Sim</button>
                              <button onClick={() => abrirEditar(s)} className="btn btn-ghost btn-sm" style={{ color:'var(--brand)' }}>✏️ Editar</button>
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

      {/* Modal Editar Preço + Custo */}
      <AnimatePresence>
        {modalEditar && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            style={{ background:'rgba(0,0,0,.5)' }} onClick={() => setModalEditar(null)}
          >
            <motion.div
              initial={{y:32,opacity:0}} animate={{y:0,opacity:1}} exit={{y:32,opacity:0}}
              transition={{ type:'spring', damping:26, stiffness:320 }}
              className="w-full max-w-sm rounded-2xl p-6" style={{ background:'var(--surface)' }}
              onClick={e => e.stopPropagation()}
            >
              <h2 className="font-display text-xl mb-1" style={{ color:'var(--text-hi)' }}>✏️ Editar preços</h2>
              <p className="text-sm mb-5" style={{ color:'var(--text-lo)' }}>{modalEditar.sabor}</p>

              {/* Valores atuais */}
              <div className="flex gap-3 mb-4 p-3 rounded-xl" style={{ background:'var(--bg)', border:'1px solid var(--border)' }}>
                <div className="flex-1 text-center">
                  <p className="text-xs" style={{ color:'var(--text-lo)' }}>Preço atual</p>
                  <p className="font-bold" style={{ color:'var(--text-hi)' }}>{fmt(modalEditar.preco)}</p>
                </div>
                <div style={{ width:1, background:'var(--border)' }} />
                <div className="flex-1 text-center">
                  <p className="text-xs" style={{ color:'var(--text-lo)' }}>Custo atual</p>
                  <p className="font-bold" style={{ color:'var(--text-hi)' }}>{fmt(modalEditar.custo)}</p>
                </div>
                <div style={{ width:1, background:'var(--border)' }} />
                <div className="flex-1 text-center">
                  <p className="text-xs" style={{ color:'var(--text-lo)' }}>Lucro atual</p>
                  <p className="font-bold" style={{ color: modalEditar.preco-modalEditar.custo >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                    {fmt(modalEditar.preco - modalEditar.custo)}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="label">Novo preço de venda (R$)</label>
                  <input type="number" min="0" step="0.01" autoFocus className="field mt-1" value={editPreco}
                    onChange={e => setEditPreco(e.target.value)} placeholder="Ex: 12.00" />
                </div>
                <div>
                  <label className="label">Custo por unidade (R$)</label>
                  <input type="number" min="0" step="0.01" className="field mt-1" value={editCusto}
                    onChange={e => setEditCusto(e.target.value)} placeholder="Ex: 4.50" />
                  <p className="text-xs mt-1" style={{ color:'var(--text-lo)' }}>
                    💡 Deixe em branco para usar o cálculo automático pelos ingredientes.
                  </p>
                </div>

                {editPreco && editCusto && (() => {
                  const p = parseFloat(editPreco)||0
                  const c = parseFloat(editCusto)||0
                  const l = p-c
                  const m = p>0 ? ((l/p)*100).toFixed(0) : 0
                  return (
                    <div className="p-3 rounded-xl" style={{ background:'var(--bg)', border:'1px solid var(--border)' }}>
                      <div className="flex justify-between items-center">
                        <span className="text-xs" style={{ color:'var(--text-lo)' }}>Preview novo lucro</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm" style={{ color: l>=0?'var(--success)':'var(--danger)' }}>{fmt(l)}</span>
                          <span className={`badge ${Number(m)>=30?'badge-green':Number(m)>=10?'badge-orange':'badge-red'}`}>{m}%</span>
                        </div>
                      </div>
                    </div>
                  )
                })()}
              </div>

              <div className="flex gap-2 mt-5">
                <button onClick={() => setModalEditar(null)} className="btn btn-secondary flex-1">Cancelar</button>
                <button onClick={salvarEdicao} disabled={salvando} className="btn btn-primary flex-1">
                  {salvando ? <span className="spinner" style={{ width:16, height:16 }} /> : 'Salvar'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
