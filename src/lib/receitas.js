// ─── CATÁLOGO DE RECEITAS ────────────────────────────────────────────────────
// Cada receita = 1 lote (massa)
// rendimento = número de cookies por lote

export const catalogoReceitas = {
  tradicional: {
    id: 'tradicional',
    nome: 'Tradicional',
    emoji: '🍪',
    cor: '#BC544B',
    preco: 10,
    rendimento: 12,
    descricao: 'Brown Butter clássico com chocolate meio amargo.',
    massa: {
      manteiga:     115,
      mascavo:       50,
      refinado:      50,
      ovo:           50,
      farinha:      150,
      bicarbonato:    2,
      sal:            1,
      moeda:         85,
      gotas_pretas: 100,
    },
    recheio: null,
  },

  nutella: {
    id: 'nutella',
    nome: 'Nutella',
    emoji: '🟤',
    cor: '#7B4F2E',
    preco: 12,
    rendimento: 12,
    descricao: 'Massa tradicional com recheio generoso de Nutella.',
    massa: {
      manteiga:    50,
      mascavo:     30,
      refinado:    20,
      ovo:         25,
      baunilha:     3,
      farinha:     90,
      amido:       10,
      fermento:     1,
      bicarbonato:  1,
      sal:          1,
      gotas_pretas: 40,
      moeda:        40,
    },
    recheio: { nutella: 150 },
  },

  casadinho: {
    id: 'casadinho',
    nome: 'Casadinho',
    emoji: '🤎',
    cor: '#A0622E',
    preco: 12,
    rendimento: 12,
    descricao: 'Massa tradicional, recheio de Ninho com Nutella.',
    massa: {
      manteiga:     50,
      mascavo:      30,
      refinado:     20,
      ovo:          25,
      baunilha:      3,
      farinha:      90,
      amido:        10,
      fermento:      1,
      bicarbonato:   1,
      sal:           1,
      gotas_pretas:  40,
      gotas_brancas: 40,
    },
    recheio: {
      nutella:          75,
      leite_condensado: 80,
      creme_leite:      20,
      leite_po:         20,
      manteiga:         10,
    },
  },

  red_velvet: {
    id: 'red_velvet',
    nome: 'Red Velvet',
    emoji: '❤️',
    cor: '#BC3B3B',
    preco: 12,
    rendimento: 12,
    descricao: 'Massa vermelha com recheio de cream cheese.',
    massa: {
      manteiga:     50,
      mascavo:      30,
      refinado:     20,
      ovo:          25,
      vinagre:       1,
      corante:      15, // gotas
      farinha:      90,
      leite_po:     15,
      amido:        10,
      cacau:         1,
      sal:           1,
      bicarbonato:   1,
      fermento:      1,
      gotas_brancas: 80,
    },
    recheio: {
      leite_condensado: 55,
      creme_leite:      35,
      leite_po:         20,
      cream_cheese:     50,
    },
  },

  red_nut: {
    id: 'red_nut',
    nome: 'Red Nut',
    emoji: '🔴',
    cor: '#C44B3A',
    preco: 12,
    rendimento: 12,
    descricao: 'Massa vermelha com recheio de Nutella.',
    massa: {
      manteiga:    50,
      mascavo:     30,
      refinado:    20,
      ovo:         25,
      vinagre:      1,
      corante:     15,
      farinha:     90,
      leite_po:    15,
      amido:       10,
      cacau:        1,
      sal:          1,
      bicarbonato:  1,
      fermento:     1,
      gotas_pretas: 80,
    },
    recheio: { nutella: 150 },
  },

  ninho_nutella: {
    id: 'ninho_nutella',
    nome: 'Ninho c/ Nutella',
    emoji: '🥛',
    cor: '#C89060',
    preco: 12,
    rendimento: 12,
    descricao: 'Massa de leite Ninho com recheio de Nutella.',
    massa: {
      manteiga:     50,
      refinado:     50,
      ovo:          25,
      farinha:      80,
      amido:        10,
      leite_po:     30,
      sal:           1,
      fermento:      1,
      gotas_brancas: 80,
    },
    recheio: { nutella: 150 },
  },

  beijinho: {
    id: 'beijinho',
    nome: 'Beijinho',
    emoji: '🥥',
    cor: '#8C7B6E',
    preco: 12,
    rendimento: 12,
    descricao: 'Massa de Ninho com brigadeiro de coco.',
    massa: {
      manteiga:     50,
      refinado:     50,
      ovo:          25,
      farinha:      80,
      amido:        10,
      leite_po:     30,
      sal:           1,
      fermento:      1,
      gotas_brancas: 80,
    },
    recheio: {
      leite_condensado: 160,
      creme_leite:       40,
      coco_ralado:       40,
      manteiga:          10,
    },
  },

  brigadeiro: {
    id: 'brigadeiro',
    nome: 'Brigadeiro',
    emoji: '🍫',
    cor: '#5C3A1E',
    preco: 10,
    rendimento: 12,
    descricao: 'Massa de cacau com brigadeiro de chocolate.',
    massa: {
      manteiga:    50,
      mascavo:     30,
      refinado:    20,
      ovo:         25,
      farinha:     90,
      amido:       10,
      cacau:       15,
      sal:          1,
      bicarbonato:  1,
      fermento:     1,
      gotas_pretas: 80,
    },
    recheio: {
      leite_condensado: 160,
      creme_leite:       40,
      chocolate_po:      40,
    },
  },

  nesquik: {
    id: 'nesquik',
    nome: 'Nesquik',
    emoji: '🐰',
    cor: '#7B3F1E',
    preco: 10,
    rendimento: 12,
    descricao: 'Massa de cacau com brigadeiro de Nesquik.',
    massa: {
      manteiga:    50,
      mascavo:     30,
      refinado:    20,
      ovo:         25,
      farinha:     90,
      amido:       10,
      cacau:       15,
      sal:          1,
      bicarbonato:  1,
      fermento:     1,
      gotas_pretas: 80,
    },
    recheio: {
      leite_condensado: 160,
      creme_leite:       40,
      nesquik:           12,
    },
  },

  cappuccino: {
    id: 'cappuccino',
    nome: 'Cappuccino',
    emoji: '☕',
    cor: '#6B4226',
    preco: 12,
    rendimento: 12,
    descricao: 'Massa aromática com brigadeiro de café.',
    massa: {
      manteiga:    50,
      mascavo:     30,
      refinado:    20,
      ovo:         25,
      farinha:     85,
      amido:       10,
      leite_po:    15,
      canela:       1,
      sal:          1,
      bicarbonato:  1,
      fermento:     1,
      moeda:        40,
      choc_branco:  40,
    },
    recheio: {
      leite_condensado: 160,
      creme_leite:       40,
      cafe_soluvel:       3,
      manteiga:          10,
    },
  },

  oreo: {
    id: 'oreo',
    nome: 'Oreo',
    emoji: '⚫',
    cor: '#2C2C2C',
    preco: 10,
    rendimento: 12,
    descricao: 'Cacau black com chocolate branco e Oreo.',
    massa: {
      manteiga:    50,
      mascavo:     50,
      refinado:    20,
      ovo:         25,
      farinha:     85,
      amido:       10,
      cacau_black: 15,
      sal:          1,
      bicarbonato:  1,
      fermento:     1,
      choc_branco:  80,
    },
    recheio: {
      choc_branco:   135,
      biscoito_oreo:  35,
    },
  },
}

// ─── INGREDIENTES NORMALIZADOS ────────────────────────────────────────────────
export const INGREDIENTES = [
  { id:'manteiga',          label:'Manteiga',                 cat:'Laticínios',    unit:'g',  estoque_minimo:500  },
  { id:'mascavo',           label:'Açúcar Mascavo',           cat:'Açúcares',      unit:'g',  estoque_minimo:500  },
  { id:'refinado',          label:'Açúcar Refinado',          cat:'Açúcares',      unit:'g',  estoque_minimo:500  },
  { id:'ovo',               label:'Ovo',                      cat:'Proteínas',     unit:'g',  estoque_minimo:200  },
  { id:'baunilha',          label:'Essência de Baunilha',     cat:'Aromas',        unit:'ml', estoque_minimo:50   },
  { id:'farinha',           label:'Farinha de Trigo',         cat:'Secos',         unit:'g',  estoque_minimo:1000 },
  { id:'amido',             label:'Amido de Milho',           cat:'Secos',         unit:'g',  estoque_minimo:200  },
  { id:'fermento',          label:'Fermento',                 cat:'Fermentos',     unit:'g',  estoque_minimo:50   },
  { id:'bicarbonato',       label:'Bicarbonato de Sódio',     cat:'Fermentos',     unit:'g',  estoque_minimo:50   },
  { id:'sal',               label:'Sal',                      cat:'Temperos',      unit:'g',  estoque_minimo:100  },
  { id:'gotas_pretas',      label:'Gotas de Choc. Preto',     cat:'Chocolates',    unit:'g',  estoque_minimo:300  },
  { id:'gotas_brancas',     label:'Gotas de Choc. Branco',    cat:'Chocolates',    unit:'g',  estoque_minimo:300  },
  { id:'moeda',             label:'Chocolate Moeda',          cat:'Chocolates',    unit:'g',  estoque_minimo:200  },
  { id:'choc_branco',       label:'Chocolate Branco',         cat:'Chocolates',    unit:'g',  estoque_minimo:300  },
  { id:'cacau',             label:'Cacau 100%',               cat:'Chocolates',    unit:'g',  estoque_minimo:100  },
  { id:'cacau_black',       label:'Cacau Black',              cat:'Chocolates',    unit:'g',  estoque_minimo:100  },
  { id:'chocolate_po',      label:'Chocolate em Pó',          cat:'Chocolates',    unit:'g',  estoque_minimo:100  },
  { id:'nutella',           label:'Nutella',                  cat:'Recheios',      unit:'g',  estoque_minimo:500  },
  { id:'leite_condensado',  label:'Leite Condensado',         cat:'Laticínios',    unit:'g',  estoque_minimo:800  },
  { id:'creme_leite',       label:'Creme de Leite',           cat:'Laticínios',    unit:'g',  estoque_minimo:400  },
  { id:'leite_po',          label:'Leite em Pó (Ninho)',      cat:'Laticínios',    unit:'g',  estoque_minimo:300  },
  { id:'cream_cheese',      label:'Cream Cheese',             cat:'Laticínios',    unit:'g',  estoque_minimo:200  },
  { id:'coco_ralado',       label:'Coco Ralado',              cat:'Outros',        unit:'g',  estoque_minimo:100  },
  { id:'cafe_soluvel',      label:'Café Solúvel',             cat:'Outros',        unit:'g',  estoque_minimo:50   },
  { id:'nesquik',           label:'Nesquik',                  cat:'Outros',        unit:'g',  estoque_minimo:100  },
  { id:'canela',            label:'Canela em Pó',             cat:'Temperos',      unit:'g',  estoque_minimo:50   },
  { id:'corante',           label:'Corante Alimentar Verm.',  cat:'Outros',        unit:'gt', estoque_minimo:50   },
  { id:'vinagre',           label:'Vinagre',                  cat:'Outros',        unit:'g',  estoque_minimo:100  },
  { id:'biscoito_oreo',     label:'Biscoito Oreo',            cat:'Outros',        unit:'g',  estoque_minimo:150  },
]

// ─── RECEITAS SAZONAIS ────────────────────────────────────────────────────────

// OVO COOKIE NUTELLA
// Massa: 1 lote rende 300g
// Montagem: 180g massa + 170g Nutella por ovo
export const ovoNutella = {
  id: 'ovo_nutella',
  nome: 'Ovo Cookie Nutella',
  emoji: '🥚',
  massaPorOvo: 180,   // g de massa por ovo
  recheio: 170,       // g de Nutella
  totalMassaG: 300,   // g que 1 lote de massa rende
  ovoPorLote: Math.floor(300 / 180), // ~1 ovo por lote
  massa: {
    manteiga:    50,
    refinado:    30,
    mascavo:     30,
    ovo:         25,
    farinha:     90,
    amido:       10,
    bicarbonato:  1,
    sal:          1,
    gotas_pretas: 75,
  },
}

// OVO COOKIE RED VELVET
// Rendimento: 300g de massa por lote
// Aberto: 170g massa fundo + 145g recheio + 35g mini cookies
// Casca: cada ovo consome 170g de massa
export const ovoRedVelvet = {
  id: 'ovo_red_velvet',
  nome: 'Ovo Cookie Red Velvet',
  emoji: '❤️🥚',
  totalMassaG: 300,
  // Aberto: 170g fundo + 35g mini cookies (snacks)
  aberto: { fundo: 170, miniCookies: 35, recheio: 145 },
  massa: {
    manteiga:     50,
    refinado:     40,
    mascavo:      10,
    ovo:          25,
    farinha:      95,
    amido:        10,
    cacau:         1,
    corante:      25, // gotas
    bicarbonato:   1,
    sal:           1,
    choc_branco:  75,
  },
  creme: {
    leite_condensado: 100,
    creme_leite:       50,
    leite_po:          12,
    cream_cheese:     115,
    // rendimento: 215g por ovo
  },
}

// FONDUE DE COOKIE
// 100g fundo + 100g no contorno = 200g
export const fondueCookie = {
  id: 'fondue',
  nome: 'Fondue de Cookie',
  emoji: '🍶',
  massaTotalG: 200, // 100g fundo + 100g contorno
  massa: {
    manteiga:    40,
    mascavo:     25,
    refinado:    15,
    ovo:         15,
    baunilha:     2,
    farinha:     55,
    bicarbonato:  1,
    sal:          1,
    choc_amargo:  60,
  },
  ganache_amargo: {
    choc_amargo:  60,
    creme_leite:  80,
  },
  ganache_branco: {
    choc_branco: 95,
    creme_leite: 40,
  },
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

// Calcula ingredientes necessários para N lotes de uma receita
export function calcularIngredientes(receitaId, nLotes) {
  const receita = catalogoReceitas[receitaId]
  if (!receita || nLotes <= 0) return {}

  const result = {}
  const somar = (obj) => {
    Object.entries(obj).forEach(([k, v]) => {
      if (typeof v === 'number') result[k] = (result[k] || 0) + v * nLotes
    })
  }
  somar(receita.massa)
  if (receita.recheio) somar(receita.recheio)
  return result
}

// Calcula capacidade máxima de produção dado estoque disponível
export function calcularCapacidade(receitaId, estoque = {}) {
  const receita = catalogoReceitas[receitaId]
  if (!receita) return { maxLotes: 0, limitante: null }

  const todos = { ...receita.massa, ...(receita.recheio || {}) }
  let maxLotes = Infinity
  let limitante = null

  Object.entries(todos).forEach(([ing, qtd]) => {
    if (qtd <= 0) return
    const disponivel = estoque[ing] ?? 0
    const possivel = Math.floor(disponivel / qtd)
    if (possivel < maxLotes) {
      maxLotes = possivel
      limitante = ing
    }
  })

  return {
    maxLotes: maxLotes === Infinity ? 0 : maxLotes,
    maxCookies: (maxLotes === Infinity ? 0 : maxLotes) * receita.rendimento,
    limitante,
  }
}

// Calcula falta de ingredientes para produzir N lotes
export function calcularFalta(receitaId, nLotes, estoque = {}) {
  const necessario = calcularIngredientes(receitaId, nLotes)
  const falta = {}
  Object.entries(necessario).forEach(([ing, qtd]) => {
    const disponivel = estoque[ing] ?? 0
    if (qtd > disponivel) falta[ing] = qtd - disponivel
  })
  return falta
}

// Label de ingrediente por ID
export function labelIngrediente(id) {
  return INGREDIENTES.find(i => i.id === id)?.label ?? id
}

export const RECEITAS_LIST = Object.values(catalogoReceitas)