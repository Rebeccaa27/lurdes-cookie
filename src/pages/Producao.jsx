import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, BookOpen } from 'lucide-react'
import { catalogoReceitas, INGREDIENTES, ovoNutella, ovoRedVelvet, fondueCookie } from '../lib/receitas'
import { formatBRL } from '../lib/utils'

const SAZONAIS = [ovoNutella, ovoRedVelvet, fondueCookie]

function labelIng(id) {
  return INGREDIENTES.find(i => i.id === id)?.label ?? id
}
function unitIng(id) {
  return INGREDIENTES.find(i => i.id === id)?.unit ?? 'g'
}

function SecaoIngredientes({ titulo, obj }) {
  if (!obj) return null
  return (
    <div className="mb-3">
      <p className="text-2xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-2">{titulo}</p>
      <div className="flex flex-wrap gap-2">
        {Object.entries(obj).map(([id, qtd]) => (
          <span key={id} className="inline-flex items-center gap-1 bg-surface-offset dark:bg-surface-dark-offset rounded-lg px-2.5 py-1 text-xs text-neutral-700 dark:text-neutral-300">
            <span className="font-medium">{qtd}{unitIng(id)}</span>
            <span className="text-neutral-400">{labelIng(id)}</span>
          </span>
        ))}
      </div>
    </div>
  )
}

function CardReceita({ receita }) {
  const [aberto, setAberto] = useState(false)

  return (
    <motion.div
      layout
      className="bg-surface dark:bg-surface-dark-secondary border border-surface-border dark:border-surface-dark-border rounded-2xl overflow-hidden shadow-soft"
    >
      <button
        onClick={() => setAberto(a => !a)}
        className="w-full flex items-center gap-4 p-4 text-left hover:bg-surface-offset/50 dark:hover:bg-surface-dark-offset/30 transition-colors"
      >
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{ background: receita.cor + '22' }}>
          {receita.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-neutral-800 dark:text-neutral-100">{receita.nome}</p>
          <p className="text-xs text-neutral-400 truncate mt-0.5">{receita.descricao}</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20 px-2.5 py-1 rounded-lg">
            {formatBRL(receita.preco)}/un — {receita.rendimento} un/lote
          </span>
          {aberto ? <ChevronUp size={16} className="text-neutral-400" /> : <ChevronDown size={16} className="text-neutral-400" />}
        </div>
      </button>

      <AnimatePresence>
        {aberto && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-surface-border dark:border-surface-dark-border pt-3">
              <SecaoIngredientes titulo="Massa" obj={receita.massa} />
              {receita.recheio && <SecaoIngredientes titulo="Recheio" obj={receita.recheio} />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function CardSazonal({ receita }) {
  const [aberto, setAberto] = useState(false)
  const partes = Object.entries(receita).filter(([k]) =>
    !['id','nome','emoji','massaPorOvo','recheio','totalMassaG','ovoPorLote','massaTotalG','aberto'].includes(k) && typeof receita[k] === 'object'
  )

  return (
    <motion.div
      layout
      className="bg-surface dark:bg-surface-dark-secondary border border-surface-border dark:border-surface-dark-border rounded-2xl overflow-hidden shadow-soft"
    >
      <button
        onClick={() => setAberto(a => !a)}
        className="w-full flex items-center gap-4 p-4 text-left hover:bg-surface-offset/50 transition-colors"
      >
        <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center text-2xl flex-shrink-0">
          {receita.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-neutral-800 dark:text-neutral-100">{receita.nome}</p>
          <p className="text-xs text-neutral-400 mt-0.5">Produto sazonal — ver detalhes</p>
        </div>
        {aberto ? <ChevronUp size={16} className="text-neutral-400" /> : <ChevronDown size={16} className="text-neutral-400" />}
      </button>

      <AnimatePresence>
        {aberto && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-surface-border dark:border-surface-dark-border pt-3 space-y-3">
              {receita.massa && <SecaoIngredientes titulo="Massa" obj={receita.massa} />}
              {receita.recheio && typeof receita.recheio === 'object' && !Array.isArray(receita.recheio) &&
                Object.keys(receita.recheio).some(k => typeof receita.recheio[k] === 'number') &&
                <SecaoIngredientes titulo="Recheio" obj={receita.recheio} />}
              {receita.creme && <SecaoIngredientes titulo="Creme" obj={receita.creme} />}
              {receita.ganache_amargo && <SecaoIngredientes titulo="Ganache Amargo" obj={receita.ganache_amargo} />}
              {receita.ganache_branco && <SecaoIngredientes titulo="Ganache Branco" obj={receita.ganache_branco} />}
              {receita.massaPorOvo && (
                <div className="text-xs text-neutral-500 dark:text-neutral-400 bg-surface-offset dark:bg-surface-dark-offset rounded-lg p-3">
                  <span className="font-medium">Montagem: </span>
                  {receita.massaPorOvo}g de massa + {receita.recheio?.nutella ?? '—'}g de Nutella por ovo · Rende ~{receita.ovoPorLote} ovo(s) por lote
                </div>
              )}
              {receita.massaTotalG && (
                <div className="text-xs text-neutral-500 dark:text-neutral-400 bg-surface-offset dark:bg-surface-dark-offset rounded-lg p-3">
                  <span className="font-medium">Rendimento: </span>{receita.massaTotalG}g de massa total por lote
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function Producao() {
  const receitas = Object.values(catalogoReceitas)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="p-5 lg:p-8 max-w-3xl mx-auto"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center">
          <BookOpen size={18} className="text-brand-600 dark:text-brand-400" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">Livro de Receitas</h1>
          <p className="text-xs text-neutral-400">{receitas.length} receitas · {SAZONAIS.length} sazonais</p>
        </div>
      </div>

      <p className="text-2xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-3">Receitas Permanentes</p>
      <div className="flex flex-col gap-3 mb-8">
        {receitas.map(r => <CardReceita key={r.id} receita={r} />)}
      </div>

      <p className="text-2xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-3">Produtos Sazonais</p>
      <div className="flex flex-col gap-3">
        {SAZONAIS.map(r => <CardSazonal key={r.id} receita={r} />)}
      </div>
    </motion.div>
  )
}
