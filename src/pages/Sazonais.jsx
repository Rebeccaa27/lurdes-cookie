import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { ovoNutella, ovoRedVelvet, fondueCookie, INGREDIENTES } from '../lib/receitas'
import { useEstoque } from '../lib/hooks'
import { formatBRL } from '../lib/utils'

function labelIng(id) { return INGREDIENTES.find(i => i.id === id)?.label ?? id }

const CUSTO_ING = {
  manteiga:0.025,mascavo:0.009,refinado:0.007,ovo:0.020,farinha:0.005,
  amido:0.010,fermento:0.040,bicarbonato:0.030,sal:0.003,
  gotas_pretas:0.045,gotas_brancas:0.045,moeda:0.045,choc_branco:0.040,
  choc_amargo:0.050,cacau:0.060,cacau_black:0.065,chocolate_po:0.030,
  nutella:0.060,leite_condensado:0.018,creme_leite:0.022,leite_po:0.040,
  cream_cheese:0.045,coco_ralado:0.030,cafe_soluvel:0.100,
  corante:0.020,vinagre:0.010,baunilha:0.080,
}

function custoObj(obj) {
  return Object.entries(obj || {}).reduce((s,[id,q]) => s + (CUSTO_ING[id] ?? 0) * q, 0)
}

function CardOvoNutella({ estoqueMap }) {
  const [qtd, setQtd] = useState(1)
  const massaNecessaria   = ovoNutella.massaPorOvo * qtd
  const recheioNecessario = (ovoNutella.recheio ?? 170) * qtd
  const lotesNecessarios  = Math.ceil(massaNecessaria / ovoNutella.totalMassaG)
  const custoMassa = custoObj(ovoNutella.massa)
  const custoTotal = custoMassa * lotesNecessarios + custoObj({ nutella: recheioNecessario })
  const falta = Object.entries({ ...ovoNutella.massa, nutella: ovoNutella.recheio ?? 170 }).filter(([id, qtdRef]) => {
    const nec = id === 'nutella' ? recheioNecessario : qtdRef * lotesNecessarios
    return (estoqueMap[id] ?? 0) < nec
  })
  return (
    <CardBase nome={ovoNutella.nome}>
      <p className="text-xs text-ink-400 mb-4">{ovoNutella.massaPorOvo}g de massa + {ovoNutella.recheio ?? 170}g de Nutella por ovo · Lote rende {ovoNutella.totalMassaG}g</p>
      <Contador qtd={qtd} setQtd={setQtd} label="ovos" />
      <ResumoCalculo itens={[
        { label: 'Massa necessária',  valor: `${massaNecessaria}g` },
        { label: 'Lotes de massa',    valor: `${lotesNecessarios} lote(s)` },
        { label: 'Nutella',           valor: `${recheioNecessario}g` },
        { label: 'Custo estimado',    valor: formatBRL(custoTotal), destaque: true },
      ]} />
      <AlertaEstoque falta={falta} />
    </CardBase>
  )
}

function CardOvoRedVelvet({ estoqueMap }) {
  const [qtd, setQtd] = useState(1)
  const lotesNecessarios = Math.ceil((ovoRedVelvet.aberto.fundo + ovoRedVelvet.aberto.miniCookies) * qtd / ovoRedVelvet.totalMassaG)
  const custoMassa = custoObj(ovoRedVelvet.massa)
  const custoCreme = custoObj(ovoRedVelvet.creme)
  const custoTotal = custoMassa * lotesNecessarios + custoCreme * qtd
  return (
    <CardBase nome={ovoRedVelvet.nome}>
      <p className="text-xs text-ink-400 mb-4">170g fundo + 35g mini cookies por ovo · Creme de cream cheese</p>
      <Contador qtd={qtd} setQtd={setQtd} label="ovos" />
      <ResumoCalculo itens={[
        { label: 'Massa fundo',       valor: `${ovoRedVelvet.aberto.fundo * qtd}g` },
        { label: 'Mini cookies',      valor: `${ovoRedVelvet.aberto.miniCookies * qtd}g` },
        { label: 'Lotes de massa',    valor: `${lotesNecessarios} lote(s)` },
        { label: 'Recheio creme',     valor: `${ovoRedVelvet.aberto.recheio * qtd}g` },
        { label: 'Custo estimado',    valor: formatBRL(custoTotal), destaque: true },
      ]} />
    </CardBase>
  )
}

function CardFondue({ estoqueMap }) {
  const [qtd, setQtd] = useState(1)
  const [tipo, setTipo] = useState('amargo')
  const lotesNecessarios = Math.ceil(fondueCookie.massaTotalG * qtd / fondueCookie.massaTotalG)
  const ganache = tipo === 'amargo' ? fondueCookie.ganache_amargo : fondueCookie.ganache_branco
  const custoTotal = custoObj(fondueCookie.massa) * lotesNecessarios + custoObj(ganache) * qtd
  return (
    <CardBase nome={fondueCookie.nome}>
      <p className="text-xs text-ink-400 mb-4">100g fundo + 100g contorno · 1 lote de massa por fondue</p>
      <Contador qtd={qtd} setQtd={setQtd} label="fondues" />
      <div className="flex gap-2 mb-4">
        {['amargo','branco'].map(t => (
          <button key={t} onClick={() => setTipo(t)}
            className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              tipo === t ? 'bg-navy text-white' : 'bg-cream-100 text-ink-500 hover:bg-cream-200'
            }`}>
            Ganache {t === 'amargo' ? 'Amargo' : 'Branco'}
          </button>
        ))}
      </div>
      <ResumoCalculo itens={[
        { label: 'Massa necessária',  valor: `${fondueCookie.massaTotalG * qtd}g` },
        { label: 'Lotes de massa',    valor: `${lotesNecessarios} lote(s)` },
        { label: 'Choc. ganache',     valor: tipo === 'amargo' ? `${fondueCookie.ganache_amargo.choc_amargo * qtd}g` : `${fondueCookie.ganache_branco.choc_branco * qtd}g` },
        { label: 'Creme de leite',    valor: tipo === 'amargo' ? `${fondueCookie.ganache_amargo.creme_leite * qtd}g` : `${fondueCookie.ganache_branco.creme_leite * qtd}g` },
        { label: 'Custo estimado',    valor: formatBRL(custoTotal), destaque: true },
      ]} />
    </CardBase>
  )
}

function CardBase({ nome, children }) {
  return (
    <div className="bg-white border border-cream-200 rounded-2xl p-5 shadow-card">
      <h2 className="font-semibold text-base text-ink-700 mb-4">{nome}</h2>
      {children}
    </div>
  )
}

function Contador({ qtd, setQtd, label }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="text-xs text-ink-400">Quantidade:</span>
      <div className="flex items-center gap-2 bg-cream-100 rounded-xl p-1">
        <button onClick={() => setQtd(q => Math.max(1, q - 1))}
          className="w-7 h-7 rounded-lg bg-white text-ink-600 font-bold hover:bg-cream-200 transition-colors shadow-card text-sm">−</button>
        <span className="text-sm font-semibold text-ink-700 w-8 text-center">{qtd}</span>
        <button onClick={() => setQtd(q => q + 1)}
          className="w-7 h-7 rounded-lg bg-white text-ink-600 font-bold hover:bg-cream-200 transition-colors shadow-card text-sm">+</button>
      </div>
      <span className="text-xs text-ink-300">{label}</span>
    </div>
  )
}

function ResumoCalculo({ itens }) {
  return (
    <div className="bg-cream-50 rounded-xl p-3 space-y-2">
      {itens.map(({ label, valor, destaque }) => (
        <div key={label} className="flex justify-between items-center">
          <span className={`text-xs ${destaque ? 'font-semibold text-ink-600' : 'text-ink-400'}`}>{label}</span>
          <span className={`text-sm font-bold ${destaque ? 'text-terra' : 'text-ink-600'}`}>{valor}</span>
        </div>
      ))}
    </div>
  )
}

function AlertaEstoque({ falta }) {
  if (!falta || falta.length === 0) return null
  return (
    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
      <p className="text-xs font-semibold text-amber-700 mb-1">Estoque insuficiente:</p>
      {falta.map(([id]) => (
        <p key={id} className="text-xs text-amber-600">{labelIng(id)}</p>
      ))}
    </div>
  )
}

export default function Sazonais() {
  const { estoqueMap, loading } = useEstoque()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="p-5 lg:p-8 max-w-3xl mx-auto"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-cream-200 flex items-center justify-center">
          <Sparkles size={18} className="text-ink-500" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-ink-700">Produtos Sazonais</h1>
          <p className="text-xs text-ink-300">Calculadora de ingredientes e custo por produto</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="skeleton h-48 rounded-2xl" />)}
        </div>
      ) : (
        <div className="space-y-5">
          <CardOvoNutella estoqueMap={estoqueMap} />
          <CardOvoRedVelvet estoqueMap={estoqueMap} />
          <CardFondue estoqueMap={estoqueMap} />
        </div>
      )}
    </motion.div>
  )
}
