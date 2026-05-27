import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { ovoNutella, ovoRedVelvet, fondueCookie, INGREDIENTES } from '../lib/receitas'
import { useEstoque } from '../lib/hooks'
import { formatBRL } from '../lib/utils'

function labelIng(id) {
  return INGREDIENTES.find(i => i.id === id)?.label ?? id
}
function unitIng(id) {
  return INGREDIENTES.find(i => i.id === id)?.unit ?? 'g'
}

// Custo estimado por grama (mesmo objeto do Financeiro)
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

// ─── Card OVO NUTELLA ─────────────────────────────────────────────────────────
function CardOvoNutella({ estoqueMap }) {
  const [qtd, setQtd] = useState(1)

  const massaNecessaria = ovoNutella.massaPorOvo * qtd
  const recheioNecessario = ovoNutella.recheio * qtd   // 170g nutella
  const lotesNecessarios  = Math.ceil(massaNecessaria / ovoNutella.totalMassaG)

  // custo estimado
  const custoMassa = custoObj(ovoNutella.massa)
  const custoTotal = (custoMassa * lotesNecessarios) + custoObj({ nutella: recheioNecessario })

  // verificar estoque
  const todosItens = { ...ovoNutella.massa, nutella: ovoNutella.recheio }
  const falta = Object.entries(todosItens).filter(([id, qtdPorLoteOuUn]) => {
    const necessario = id === 'nutella' ? recheioNecessario : qtdPorLoteOuUn * lotesNecessarios
    return (estoqueMap[id] ?? 0) < necessario
  })

  return (
    <CardBase emoji={ovoNutella.emoji} nome={ovoNutella.nome}>
      <p className="text-xs text-neutral-400 mb-4">Cada ovo usa {ovoNutella.massaPorOvo}g de massa + {ovoNutella.recheio}g de Nutella · Lote rende {ovoNutella.totalMassaG}g de massa</p>
      <Contador qtd={qtd} setQtd={setQtd} label="ovos" />
      <ResumoCalculo itens={[
        { label: 'Massa necessária',    valor: `${massaNecessaria}g` },
        { label: 'Lotes de massa',      valor: `${lotesNecessarios} lote(s)` },
        { label: 'Nutella',             valor: `${recheioNecessario}g` },
        { label: 'Custo estimado',      valor: formatBRL(custoTotal), destaque: true },
      ]} />
      <AlertaEstoque falta={falta} />
    </CardBase>
  )
}

// ─── Card OVO RED VELVET ──────────────────────────────────────────────────────
function CardOvoRedVelvet({ estoqueMap }) {
  const [qtd, setQtd] = useState(1)

  const massaFundo       = ovoRedVelvet.aberto.fundo        * qtd  // 170g
  const miniCookies      = ovoRedVelvet.aberto.miniCookies  * qtd  // 35g
  const massaTotalNec    = (massaFundo + miniCookies) * qtd
  const lotesNecessarios = Math.ceil((massaFundo + miniCookies) / ovoRedVelvet.totalMassaG * qtd)

  const custoMassa = custoObj(ovoRedVelvet.massa)
  const custoCreme = custoObj(ovoRedVelvet.creme)
  const custoTotal = custoMassa * lotesNecessarios + custoCreme * qtd

  const falta = []

  return (
    <CardBase emoji={ovoRedVelvet.emoji} nome={ovoRedVelvet.nome}>
      <p className="text-xs text-neutral-400 mb-4">170g fundo + 35g mini cookies (por ovo) + creme de cream cheese</p>
      <Contador qtd={qtd} setQtd={setQtd} label="ovos" />
      <ResumoCalculo itens={[
        { label: 'Massa fundo',         valor: `${ovoRedVelvet.aberto.fundo * qtd}g` },
        { label: 'Mini cookies',        valor: `${ovoRedVelvet.aberto.miniCookies * qtd}g` },
        { label: 'Lotes de massa',      valor: `${lotesNecessarios} lote(s)` },
        { label: 'Recheio creme',       valor: `${ovoRedVelvet.aberto.recheio * qtd}g` },
        { label: 'Custo estimado',      valor: formatBRL(custoTotal), destaque: true },
      ]} />
      <AlertaEstoque falta={falta} />
    </CardBase>
  )
}

// ─── Card FONDUE ──────────────────────────────────────────────────────────────
function CardFondue({ estoqueMap }) {
  const [qtd, setQtd] = useState(1)
  const [tipo, setTipo] = useState('amargo')

  const massaNecessaria  = fondueCookie.massaTotalG * qtd
  const lotesNecessarios = Math.ceil(massaNecessaria / fondueCookie.massaTotalG)
  const ganache = tipo === 'amargo' ? fondueCookie.ganache_amargo : fondueCookie.ganache_branco
  const custoMassa  = custoObj(fondueCookie.massa)
  const custoGanache = custoObj(ganache)
  const custoTotal  = custoMassa * lotesNecessarios + custoGanache * qtd

  return (
    <CardBase emoji={fondueCookie.emoji} nome={fondueCookie.nome}>
      <p className="text-xs text-neutral-400 mb-4">100g fundo + 100g contorno · 1 lote de massa por fondue</p>
      <Contador qtd={qtd} setQtd={setQtd} label="fondues" />
      <div className="flex gap-2 mb-4">
        {['amargo','branco'].map(t => (
          <button key={t} onClick={() => setTipo(t)}
            className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              tipo === t
                ? 'bg-brand-500 text-white'
                : 'bg-surface-offset dark:bg-surface-dark-offset text-neutral-500 hover:bg-surface-dynamic'
            }`}>
            Ganache {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
      <ResumoCalculo itens={[
        { label: 'Massa necessária',    valor: `${massaNecessaria}g` },
        { label: 'Lotes de massa',      valor: `${lotesNecessarios} lote(s)` },
        { label: 'Choc. ganache',       valor: tipo === 'amargo' ? `${fondueCookie.ganache_amargo.choc_amargo * qtd}g` : `${fondueCookie.ganache_branco.choc_branco * qtd}g` },
        { label: 'Creme de leite',      valor: tipo === 'amargo' ? `${fondueCookie.ganache_amargo.creme_leite * qtd}g` : `${fondueCookie.ganache_branco.creme_leite * qtd}g` },
        { label: 'Custo estimado',      valor: formatBRL(custoTotal), destaque: true },
      ]} />
    </CardBase>
  )
}

// ─── Sub-componentes reutilizáveis ────────────────────────────────────────────
function CardBase({ emoji, nome, children }) {
  return (
    <div className="bg-surface dark:bg-surface-dark-secondary border border-surface-border dark:border-surface-dark-border rounded-2xl p-5 shadow-soft">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">{emoji}</span>
        <h2 className="font-semibold text-base text-neutral-800 dark:text-neutral-100">{nome}</h2>
      </div>
      {children}
    </div>
  )
}

function Contador({ qtd, setQtd, label }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="text-xs text-neutral-500">Quantidade:</span>
      <div className="flex items-center gap-2 bg-surface-offset dark:bg-surface-dark-offset rounded-xl p-1">
        <button onClick={() => setQtd(q => Math.max(1, q - 1))}
          className="w-7 h-7 rounded-lg bg-surface dark:bg-surface-dark-secondary text-neutral-600 dark:text-neutral-300 font-bold hover:bg-surface-dynamic transition-colors">−</button>
        <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-200 w-8 text-center">{qtd}</span>
        <button onClick={() => setQtd(q => q + 1)}
          className="w-7 h-7 rounded-lg bg-surface dark:bg-surface-dark-secondary text-neutral-600 dark:text-neutral-300 font-bold hover:bg-surface-dynamic transition-colors">+</button>
      </div>
      <span className="text-xs text-neutral-400">{label}</span>
    </div>
  )
}

function ResumoCalculo({ itens }) {
  return (
    <div className="bg-surface-offset dark:bg-surface-dark-offset rounded-xl p-3 space-y-2">
      {itens.map(({ label, valor, destaque }) => (
        <div key={label} className="flex justify-between items-center">
          <span className={`text-xs ${destaque ? 'font-semibold text-neutral-700 dark:text-neutral-200' : 'text-neutral-500'}`}>{label}</span>
          <span className={`text-sm font-bold ${
            destaque ? 'text-brand-600 dark:text-brand-400' : 'text-neutral-700 dark:text-neutral-300'
          }`}>{valor}</span>
        </div>
      ))}
    </div>
  )
}

function AlertaEstoque({ falta }) {
  if (!falta || falta.length === 0) return null
  return (
    <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl">
      <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">⚠️ Estoque insuficiente:</p>
      {falta.map(([id]) => (
        <p key={id} className="text-xs text-amber-600 dark:text-amber-500">{labelIng(id)}</p>
      ))}
    </div>
  )
}

// ─── Página ───────────────────────────────────────────────────────────────────
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
        <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
          <Sparkles size={18} className="text-amber-500" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">Produtos Sazonais</h1>
          <p className="text-xs text-neutral-400">Calculadora de ingredientes e custo por produto especial</p>
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
