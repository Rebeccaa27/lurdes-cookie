import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { catalogoReceitas, INGREDIENTES } from '../lib/receitas'

function labelIng(id) { return INGREDIENTES.find(i => i.id === id)?.label ?? id }
function unitIng(id)  { return INGREDIENTES.find(i => i.id === id)?.unit  ?? 'g' }

/**
 * Calcula ingredientes totais dado um mapa { saborId: nMassas }.
 * Cada entrada representa MASSAS (lotes), nao cookies.
 * 1 massa = 1 lote inteiro da receita, independente do rendimento.
 */
function calcPorMassas(mapaLotes) {
  const totais = {}
  Object.entries(mapaLotes).forEach(([saborId, n]) => {
    const lotes = parseInt(n) || 0
    if (lotes <= 0) return
    const rec = catalogoReceitas[saborId]
    if (!rec) return
    const partes = {
      ...rec.massa,
      ...(rec.recheio && typeof rec.recheio === 'object' ? rec.recheio : {}),
    }
    Object.entries(partes).forEach(([ingId, qtdPorLote]) => {
      if (typeof qtdPorLote !== 'number') return
      totais[ingId] = (totais[ingId] || 0) + qtdPorLote * lotes
    })
  })
  return totais
}

function TabelaResultado({ resultado, titulo, sub }) {
  const entries = Object.entries(resultado)
  if (entries.length === 0) return (
    <p className="text-sm" style={{ color: 'var(--text-lo)' }}>Informe pelo menos uma massa acima de 0.</p>
  )

  // Agrupar por categoria
  const grupos = {}
  entries.forEach(([ingId, qtd]) => {
    const cat = INGREDIENTES.find(i => i.id === ingId)?.cat ?? 'Outros'
    if (!grupos[cat]) grupos[cat] = []
    grupos[cat].push({ ingId, qtd })
  })

  return (
    <div>
      {titulo && (
        <div className="mb-4">
          <p className="font-semibold" style={{ color: 'var(--text-hi)', fontFamily: 'DM Serif Display, serif', fontSize: '1.05rem' }}>{titulo}</p>
          {sub && <p className="text-xs mt-0.5" style={{ color: 'var(--text-lo)' }}>{sub}</p>}
        </div>
      )}
      <div className="space-y-4">
        {Object.entries(grupos).map(([cat, items]) => (
          <div key={cat}>
            <p className="section-title mb-2">{cat}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {items.map(({ ingId, qtd }) => (
                <div key={ingId} className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ background: 'var(--bg)' }}>
                  <span className="text-sm" style={{ color: 'var(--text-md)' }}>{labelIng(ingId)}</span>
                  <span className="text-sm font-semibold ml-4" style={{ color: 'var(--text-hi)' }}>
                    {Number.isInteger(qtd) ? qtd : qtd.toFixed(1)}{unitIng(ingId)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Calculadora() {
  const saboresList = Object.entries(catalogoReceitas)
  const [aba, setAba] = useState('mes')

  // Aba planejamento — quantidade de MASSAS por sabor
  const [plano, setPlano] = useState(() => Object.fromEntries(saboresList.map(([id]) => [id, ''])))
  const [resultMes, setResultMes] = useState(null)

  // Aba avulsa — uma massa
  const [saborAvulso, setSaborAvulso] = useState(saboresList[0]?.[0] || '')
  const [massasAvulsas, setMassasAvulsas] = useState('1')
  const [resultAvulso, setResultAvulso] = useState(null)

  function calcularMes(e) {
    e.preventDefault()
    setResultMes(calcPorMassas(plano))
  }

  function calcularAvulso(e) {
    e.preventDefault()
    if (!saborAvulso) return
    setResultAvulso(calcPorMassas({ [saborAvulso]: massasAvulsas }))
  }

  const rec = catalogoReceitas[saborAvulso]

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 lg:py-8">

      <div className="mb-6">
        <h1 className="font-display text-3xl" style={{ color: 'var(--text-hi)' }}>Calculadora</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-lo)' }}>Informe o numero de massas — 1 massa = 1 lote completo da receita</p>
      </div>

      {/* Abas */}
      <div className="flex gap-1 p-1 rounded-xl mb-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)', width: 'fit-content' }}>
        {[['mes','Planejamento do Mes'],['avulso','Massa Avulsa']].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setAba(id)}
            className="btn btn-sm"
            style={aba === id
              ? { background: 'var(--brand)', color: '#fff' }
              : { background: 'transparent', color: 'var(--text-md)', fontWeight: 500 }
            }
          >{label}</button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ── Planejamento ── */}
        {aba === 'mes' && (
          <motion.div key="mes" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="card mb-4">
              <p className="font-semibold mb-0.5" style={{ color: 'var(--text-hi)' }}>Quantas massas de cada sabor?</p>
              <p className="text-xs mb-5" style={{ color: 'var(--text-lo)' }}>Digite o numero de massas (lotes). 1 massa rende {saboresList[0]?.[1]?.rendimento ?? 5} cookies.</p>
              <form onSubmit={calcularMes}>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
                  {saboresList.map(([id, rec]) => (
                    <div key={id}>
                      <label className="label">{rec.nome}</label>
                      <input
                        type="number" min="0" placeholder="0"
                        value={plano[id] || ''}
                        onChange={e => setPlano(p => ({ ...p, [id]: e.target.value }))}
                        className="field"
                      />
                    </div>
                  ))}
                </div>
                <button type="submit" className="btn btn-primary w-full btn-lg">Calcular ingredientes</button>
              </form>
            </div>

            {resultMes && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card">
                <TabelaResultado
                  resultado={resultMes}
                  titulo="Ingredientes necessarios"
                  sub={`Para ${Object.values(plano).reduce((s, v) => s + (parseInt(v) || 0), 0)} massa(s) planejada(s)`}
                />
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ── Massa Avulsa ── */}
        {aba === 'avulso' && (
          <motion.div key="avulso" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="card mb-4">
              <p className="font-semibold mb-0.5" style={{ color: 'var(--text-hi)' }}>Calcular uma massa avulsa</p>
              <p className="text-xs mb-5" style={{ color: 'var(--text-lo)' }}>Escolha o sabor e o numero de massas (lotes) que precisa fazer.</p>
              <form onSubmit={calcularAvulso}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                  <div>
                    <label className="label">Sabor</label>
                    <select value={saborAvulso} onChange={e => { setSaborAvulso(e.target.value); setResultAvulso(null) }} className="field">
                      {saboresList.map(([id, r]) => <option key={id} value={id}>{r.nome}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Numero de massas</label>
                    <input
                      type="number" min="1" required
                      value={massasAvulsas}
                      onChange={e => { setMassasAvulsas(e.target.value); setResultAvulso(null) }}
                      className="field"
                      placeholder="1"
                    />
                  </div>
                </div>

                {rec && (
                  <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg mb-5" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                    <div className="flex-1">
                      <p className="text-xs font-semibold" style={{ color: 'var(--text-md)' }}>{rec.nome}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-lo)' }}>
                        1 massa rende {rec.rendimento} cookies
                        {parseInt(massasAvulsas) > 1 && ` — ${parseInt(massasAvulsas)} massas = ${parseInt(massasAvulsas) * rec.rendimento} cookies`}
                      </p>
                    </div>
                  </div>
                )}

                <button type="submit" className="btn btn-primary w-full btn-lg">Calcular massa</button>
              </form>
            </div>

            {resultAvulso && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card">
                <TabelaResultado
                  resultado={resultAvulso}
                  titulo={`${rec?.nome} — ${massasAvulsas} massa(s)`}
                  sub={`Rende ${(parseInt(massasAvulsas) || 1) * (rec?.rendimento ?? 1)} cookies`}
                />
              </motion.div>
            )}
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
