// ─── RECEITA BASE (por 1 massa = ~5 cookies) ───────────────────────────────
export const RECEITA_BASE = {
  manteiga:     { g: 50,  label: 'Manteiga'       },
  mascavo:      { g: 30,  label: 'Açúcar Mascavo'  },
  refinado:     { g: 20,  label: 'Açúcar Refinado' },
  ovo:          { g: 25,  label: 'Ovo'             },
  baunilha:     { g: 3,   label: 'Essência de Baunilha' },
  farinha:      { g: 90,  label: 'Farinha'         },
  amido:        { g: 10,  label: 'Amido de Milho'  },
  fermento:     { g: 1,   label: 'Fermento'        },
  bicarbonato:  { g: 1,   label: 'Bicarbonato'     },
  sal:          { g: 1,   label: 'Sal'             },
  gotasPreta:   { g: 40,  label: 'Gotas de Chocolate Preto' },
}

export const RENDIMENTO_POR_MASSA = 5 // cookies por massa

// ─── PREÇOS POR SABOR ────────────────────────────────────────────────────────
export const PRECOS = {
  Tradicional:      10,
  Oreo:             10,
  Nesquik:          10,
  Brigadeiro:       10,
  Beijinho:         10,
  Cappuccino:       12,
  'Red Velvet':     12,
  'Red Nut':        12,
  Nutella:          12,
  'Ninho c/Nutella':12,
  Casadinho:        12,
}

// ─── RECEITAS COMPLETAS ──────────────────────────────────────────────────────
// Ingredientes por 1 massa
export const RECEITAS = {
  Tradicional: {
    descricao: 'Massa clássica, chocolate meio amargo e gotas.',
    cor: '#BC544B',
    massa: {
      Manteiga:         115, Mascavo: 50, Refinado: 50, Ovo: 50,
      Farinha:          150, Bicarbonato: 2, Sal: 1,
      'Gotas Pretas':   100, Moeda: 85,
    },
    recheio: null,
  },
  Nutella: {
    descricao: 'Massa tradicional com recheio de Nutella.',
    cor: '#7B4F2E',
    massa: {
      Manteiga: 50, Mascavo: 30, Refinado: 20, Ovo: 25, Baunilha: 3,
      Farinha: 90, Amido: 10, Fermento: 1, Bicarbonato: 1, Sal: 1, 'Gotas Pretas': 40,
    },
    recheio: { Nutella: 150 },
  },
  Casadinho: {
    descricao: 'Massa tradicional, recheio de Ninho + Nutella.',
    cor: '#A0622E',
    massa: {
      Manteiga: 50, Mascavo: 30, Refinado: 20, Ovo: 25, Baunilha: 3,
      Farinha: 90, Amido: 10, Fermento: 1, Bicarbonato: 1, Sal: 1, 'Gotas Mistas': 40,
    },
    recheio: { Nutella: 75, 'Leite Condensado': 80, 'Creme de Leite': 20, 'Leite em Pó': 20, Manteiga: 10 },
  },
  'Red Velvet': {
    descricao: 'Massa vermelha com recheio de cream cheese.',
    cor: '#BC3B3B',
    massa: {
      Manteiga: 50, Mascavo: 30, Refinado: 20, Ovo: 25, Vinagre: 1,
      Corante: '15 gotas', Farinha: 90, 'Leite em Pó': 15, Amido: 10,
      'Cacau 100%': 1, Sal: 1, Bicarbonato: 1, Fermento: 1, 'Gotas Brancas': 80,
    },
    recheio: { 'Leite Condensado': 55, 'Creme de Leite': 35, 'Leite em Pó': 20, 'Cream Cheese': 50 },
  },
  'Red Nut': {
    descricao: 'Massa vermelha com recheio de Nutella.',
    cor: '#C44B3A',
    massa: {
      Manteiga: 50, Mascavo: 30, Refinado: 20, Ovo: 25, Vinagre: 1,
      Corante: '15 gotas', Farinha: 90, 'Leite em Pó': 15, Amido: 10,
      'Cacau 100%': 1, Sal: 1, Bicarbonato: 1, Fermento: 1, 'Gotas Pretas': 80,
    },
    recheio: { Nutella: 150 },
  },
  'Ninho c/Nutella': {
    descricao: 'Massa de leite Ninho com Nutella.',
    cor: '#C89060',
    massa: {
      Manteiga: 50, Refinado: 50, Ovo: 25, Farinha: 80,
      Amido: 10, 'Leite em Pó': 30, Sal: 1, Fermento: 1, 'Gotas Brancas': 80,
    },
    recheio: { Nutella: 150 },
  },
  Beijinho: {
    descricao: 'Massa de Ninho com brigadeiro de coco.',
    cor: '#8C7B6E',
    massa: {
      Manteiga: 50, Refinado: 50, Ovo: 25, Farinha: 80,
      Amido: 10, 'Leite em Pó': 30, Sal: 1, Fermento: 1, 'Gotas Brancas': 80,
    },
    recheio: { 'Leite Condensado': 160, 'Creme de Leite': 40, 'Coco Ralado': 40, Manteiga: 10 },
  },
  Brigadeiro: {
    descricao: 'Massa de cacau com brigadeiro de chocolate.',
    cor: '#5C3A1E',
    massa: {
      Manteiga: 50, Mascavo: 30, Refinado: 20, Ovo: 25, Farinha: 90,
      Amido: 10, 'Cacau 100%': 15, Sal: 1, Bicarbonato: 1, Fermento: 1, 'Gotas Pretas': 80,
    },
    recheio: { 'Leite Condensado': 160, 'Creme de Leite': 40, 'Chocolate em Pó': 40 },
  },
  Nesquik: {
    descricao: 'Massa de cacau com brigadeiro Nesquik.',
    cor: '#7B3F1E',
    massa: {
      Manteiga: 50, Mascavo: 30, Refinado: 20, Ovo: 25, Farinha: 90,
      Amido: 10, 'Cacau 100%': 15, Sal: 1, Bicarbonato: 1, Fermento: 1, 'Gotas Pretas': 80,
    },
    recheio: { 'Leite Condensado': 160, 'Creme de Leite': 40, Nesquik: 12 },
  },
  Cappuccino: {
    descricao: 'Massa aromática com brigadeiro de café.',
    cor: '#6B4226',
    massa: {
      Manteiga: 50, Mascavo: 30, Refinado: 20, Ovo: 25, Farinha: 85, Amido: 10,
      'Leite em Pó': 15, 'Canela em Pó': 1, Sal: 1, Bicarbonato: 1, Fermento: 1,
      Moeda: 40, 'Chocolate Branco': 40,
    },
    recheio: { 'Leite Condensado': 160, 'Creme de Leite': 40, 'Café Solúvel': 3, Manteiga: 10 },
  },
  Oreo: {
    descricao: 'Cacau black com chocolate branco e Oreo.',
    cor: '#2C2C2C',
    massa: {
      Manteiga: 50, Mascavo: 50, Refinado: 20, Ovo: 25, Farinha: 85, Amido: 10,
      'Cacau Black': 15, Sal: 1, Bicarbonato: 1, Fermento: 1, 'Chocolate Branco': 80,
    },
    recheio: { 'Chocolate Branco': 135, 'Biscoito Oreo': 35 },
  },
}

// ─── INGREDIENTES NORMALIZADOS ───────────────────────────────────────────────
export const INGREDIENTES = [
  { id: 'manteiga',         label: 'Manteiga',               categoria: 'Laticínios',    unit: 'g' },
  { id: 'mascavo',          label: 'Açúcar Mascavo',          categoria: 'Açúcares',      unit: 'g' },
  { id: 'refinado',         label: 'Açúcar Refinado',         categoria: 'Açúcares',      unit: 'g' },
  { id: 'ovo',              label: 'Ovo',                     categoria: 'Proteínas',     unit: 'g' },
  { id: 'baunilha',         label: 'Essência de Baunilha',    categoria: 'Aromatizantes', unit: 'ml' },
  { id: 'farinha',          label: 'Farinha de Trigo',        categoria: 'Secos',         unit: 'g' },
  { id: 'amido',            label: 'Amido de Milho',          categoria: 'Secos',         unit: 'g' },
  { id: 'fermento',         label: 'Fermento',                categoria: 'Fermentos',     unit: 'g' },
  { id: 'bicarbonato',      label: 'Bicarbonato de Sódio',    categoria: 'Fermentos',     unit: 'g' },
  { id: 'sal',              label: 'Sal',                     categoria: 'Temperos',      unit: 'g' },
  { id: 'gotas_pretas',     label: 'Gotas de Choc. Preto',   categoria: 'Chocolates',    unit: 'g' },
  { id: 'gotas_brancas',    label: 'Gotas de Choc. Branco',  categoria: 'Chocolates',    unit: 'g' },
  { id: 'nutella',          label: 'Nutella',                 categoria: 'Recheios',      unit: 'g' },
  { id: 'leite_condensado', label: 'Leite Condensado',        categoria: 'Laticínios',    unit: 'g' },
  { id: 'creme_leite',      label: 'Creme de Leite',          categoria: 'Laticínios',    unit: 'g' },
  { id: 'leite_po',         label: 'Leite em Pó',             categoria: 'Laticínios',    unit: 'g' },
  { id: 'cacau',            label: 'Cacau 100%',              categoria: 'Chocolates',    unit: 'g' },
  { id: 'cacau_black',      label: 'Cacau Black',             categoria: 'Chocolates',    unit: 'g' },
  { id: 'choc_branco',      label: 'Chocolate Branco',        categoria: 'Chocolates',    unit: 'g' },
  { id: 'choc_po',          label: 'Chocolate em Pó',         categoria: 'Chocolates',    unit: 'g' },
  { id: 'biscoito_oreo',    label: 'Biscoito Oreo',           categoria: 'Outros',        unit: 'g' },
  { id: 'cream_cheese',     label: 'Cream Cheese',            categoria: 'Laticínios',    unit: 'g' },
  { id: 'coco_ralado',      label: 'Coco Ralado',             categoria: 'Outros',        unit: 'g' },
  { id: 'cafe_soluvel',     label: 'Café Solúvel',            categoria: 'Outros',        unit: 'g' },
  { id: 'nesquik',          label: 'Nesquik',                 categoria: 'Outros',        unit: 'g' },
  { id: 'canela',           label: 'Canela em Pó',            categoria: 'Temperos',      unit: 'g' },
  { id: 'corante',          label: 'Corante Alimentar',       categoria: 'Outros',        unit: 'ml' },
  { id: 'vinagre',          label: 'Vinagre',                 categoria: 'Outros',        unit: 'ml' },
  { id: 'moeda',            label: 'Chocolate Moeda',         categoria: 'Chocolates',    unit: 'g' },
]

// ─── PÁSCOA ──────────────────────────────────────────────────────────────────
// 1 massa de ovo = 300g de massa
export const OVO_MASSA_G      = 300
export const OVO_ABERTO_FUNDO = 175  // g
export const OVO_ABERTO_MINI  = 3    // mini cookies de 10g cada
export const OVO_FECHADO_FUNDO= 150  // g
export const OVO_FECHADO_TAMPA= 90   // g

export function calcOvoAberto(qtd = 1) {
  const massaTotal = OVO_ABERTO_FUNDO + OVO_ABERTO_MINI * 10
  const massasNecessarias = Math.ceil((massaTotal * qtd) / OVO_MASSA_G)
  return { qtd, massaTotal, massasNecessarias, cookiesMini: OVO_ABERTO_MINI * qtd }
}

export function calcOvoFechado(qtd = 1) {
  const massaTotal = OVO_FECHADO_FUNDO + OVO_FECHADO_TAMPA
  const massasNecessarias = Math.ceil((massaTotal * qtd) / OVO_MASSA_G)
  return { qtd, massaTotal, massasNecessarias }
}

// ─── CALCULADORA DE PRODUÇÃO ─────────────────────────────────────────────────
// Por 1 massa base → ingredientes em gramas
export const RECEITA_BASE_G = {
  manteiga: 50, mascavo: 30, refinado: 20, ovo: 25, baunilha: 3,
  farinha: 90, amido: 10, fermento: 1, bicarbonato: 1, sal: 1, gotas_pretas: 40,
}

export function calcularProducao(massas, receita = RECEITA_BASE_G) {
  const result = {}
  Object.entries(receita).forEach(([key, g]) => {
    result[key] = g * massas
  })
  return result
}

export function calcularCapacidade(estoque, receita = RECEITA_BASE_G) {
  let minMassas = Infinity
  let ingredienteLimitante = null
  Object.entries(receita).forEach(([key, g]) => {
    if (g <= 0) return
    const disponivel = estoque[key] ?? 0
    const massasPos = Math.floor(disponivel / g)
    if (massasPos < minMassas) {
      minMassas = massasPos
      ingredienteLimitante = key
    }
  })
  return {
    maxMassas: minMassas === Infinity ? 0 : minMassas,
    maxCookies: (minMassas === Infinity ? 0 : minMassas) * RENDIMENTO_POR_MASSA,
    ingredienteLimitante,
  }
}