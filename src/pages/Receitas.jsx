import { useState } from 'react'
import { RECEITAS, PRECOS, LOTES, calcularIngredientes } from '../lib/receitas'

export default function Receitas() {
  const sabores = Object.keys(RECEITAS)
  const [producao, setProducao] = useState(
    () => Object.fromEntries(sabores.map((s) => [s, 0]))
  )

  const totalIngredientes = calcularIngredientes(producao)
  const temProducao = Object.values(producao).some((v) => v > 0)

  function setLote(sabor, valor) {
    setProducao((prev) => ({ ...prev, [sabor]: Number(valor) }))
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">Receitas</h1>
      <p className="text-sm text-gray-500 mb-6">
        Selecione quantos lotes de cada sabor para calcular os ingredientes.
      </p>

      {/* Grid de sabores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {sabores.map((nome) => {
          const receita = RECEITAS[nome]
          return (
            <div
              key={nome}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700"
            >
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: receita.cor }}
                />
                <span className="font-semibold">{nome}</span>
                <span className="ml-auto text-green-600 font-bold text-sm">
                  R$ {PRECOS[nome] ?? '—'}
                </span>
              </div>
              <p className="text-xs text-gray-400 mb-3">{receita.descricao}</p>

              {/* Seletor de lotes */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Lotes:</span>
                <div className="flex gap-1">
                  {[0, ...LOTES].map((l) => (
                    <button
                      key={l}
                      onClick={() => setLote(nome, l)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors
                        ${producao[nome] === l
                          ? 'bg-amber-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-amber-100'
                        }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Resultado dos ingredientes */}
      {temProducao && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-bold mb-4">🛒 Ingredientes necessários</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {Object.entries(totalIngredientes)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([ing, qtd]) => (
                <div
                  key={ing}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3"
                >
                  <p className="text-xs text-gray-500 dark:text-gray-400">{ing}</p>
                  <p className="font-bold text-gray-800 dark:text-gray-100">
                    {qtd}g
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}