import { useState } from 'react'
import { ovoNutella, ovoRedVelvet, fondueCookie } from '../../lib/receitas'
import { formatBRL } from '../../lib/utils'

function OvoCard({ produto, qtd, onChange }) {
  const calcNutella = (q) => ({
    massas: Math.ceil((ovoNutella.massaPorOvo * q) / ovoNutella.totalMassaG),
    nutella: ovoNutella.recheio * q,
    massa_g: ovoNutella.massaPorOvo * q,
  })
  const calcRV = (q) => ({
    massas: Math.ceil((ovoRedVelvet.aberto.fundo * q) / ovoRedVelvet.totalMassaG),
    creme_g: ovoRedVelvet.aberto.recheio * q,
    mini: ovoRedVelvet.aberto.miniCookies * q,
  })

  const info = produto === 'nutella' ? calcNutella(qtd) : calcRV(qtd)

  return (
    <div className="bg-white rounded-2xl shadow-card border border-cream-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="font-medium text-ink-700 text-sm">
            {produto === 'nutella' ? '🥚 Ovo Cookie Nutella' : '❤️ Ovo Cookie Red Velvet'}
          </p>
          <p className="text-xs text-ink-400 mt-0.5">
            {produto === 'nutella'
              ? `${ovoNutella.massaPorOvo}g massa + ${ovoNutella.recheio}g Nutella`
              : `${ovoRedVelvet.aberto.fundo}g massa + ${ovoRedVelvet.aberto.recheio}g creme + ${ovoRedVelvet.aberto.miniCookies} mini cookies`}
          </p>
        </div>
        <input type="number" min="0" value={qtd} onChange={e => onChange(parseInt(e.target.value)||0)}
          className="w-20 text-center field text-lg font-bold" />
      </div>
      {qtd > 0 && (
        <div className="grid grid-cols-2 gap-2 pt-4 border-t border-cream-200">
          <div className="bg-cream-100 rounded-xl p-3">
            <p className="text-2xs text-ink-400">Lotes de massa</p>
            <p className="text-sm font-semibold text-ink-700">{info.massas} lote{info.massas>1?'s':''}</p>
          </div>
          {produto === 'nutella' && (
            <div className="bg-warm-50 rounded-xl p-3">
              <p className="text-2xs text-ink-400">Nutella necessária</p>
              <p className="text-sm font-semibold text-warm-700">{info.nutella}g</p>
            </div>
          )}
          {produto === 'red_velvet' && (
            <>
              <div className="bg-terra-100 rounded-xl p-3">
                <p className="text-2xs text-ink-400">Creme (g)</p>
                <p className="text-sm font-semibold text-terra">{info.creme_g}g</p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

function FondueCard({ qtd, onChange }) {
  const calc = (q) => ({
    massas: Math.ceil((fondueCookie.massaTotalG * q) / 200),
    ganache_amargo: fondueCookie.ganache_amargo.choc_amargo * q,
    ganache_branco: fondueCookie.ganache_branco.choc_branco * q,
  })
  const info = calc(qtd)
  return (
    <div className="bg-white rounded-2xl shadow-card border border-cream-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="font-medium text-ink-700 text-sm">🍶 Fondue de Cookie</p>
          <p className="text-xs text-ink-400 mt-0.5">200g por fondue (100g fundo + 100g contorno)</p>
        </div>
        <input type="number" min="0" value={qtd} onChange={e => onChange(parseInt(e.target.value)||0)}
          className="w-20 text-center field text-lg font-bold" />
      </div>
      {qtd > 0 && (
        <div className="grid grid-cols-3 gap-2 pt-4 border-t border-cream-200">
          <div className="bg-cream-100 rounded-xl p-3 text-center">
            <p className="text-2xs text-ink-400">Lotes</p>
            <p className="text-sm font-semibold text-ink-700">{info.massas}</p>
          </div>
          <div className="bg-ink-100 rounded-xl p-3 text-center">
            <p className="text-2xs text-ink-400">Ganache amargo</p>
            <p className="text-sm font-semibold text-ink-700">{info.ganache_amargo}g</p>
          </div>
          <div className="bg-cream-200 rounded-xl p-3 text-center">
            <p className="text-2xs text-ink-400">Ganache branco</p>
            <p className="text-sm font-semibold text-ink-700">{info.ganache_branco}g</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default function EasterCalculator() {
  const [qtdNutella, setQtdNutella] = useState(0)
  const [qtdRV, setQtdRV]           = useState(0)
  const [qtdFondue, setQtdFondue]   = useState(0)

  return (
    <div className="flex flex-col gap-5">
      <div className="grid md:grid-cols-2 gap-4">
        <OvoCard produto="nutella"    qtd={qtdNutella} onChange={setQtdNutella} />
        <OvoCard produto="red_velvet" qtd={qtdRV}      onChange={setQtdRV}      />
      </div>
      <FondueCard qtd={qtdFondue} onChange={setQtdFondue} />
    </div>
  )
}