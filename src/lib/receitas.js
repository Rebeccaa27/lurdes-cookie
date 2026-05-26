// Preços por sabor (em reais)
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

// Cada receita representa 1 lote (~12 cookies)
// Quantidades em gramas; strings indicam unidades especiais
export const RECEITAS = {
  Tradicional: {
    descricao: 'Massa Brown Butter, chocolate meio amargo, gotas de chocolate e flor de sal.',
    massa: {
      Manteiga:     115,
      Mascavo:       50,
      Refinado:      50,
      Ovo:           50,
      Farinha:      150,
      Bicabornato:    2,
      Sal:            1,
      'Gotas Preta': 100,
      Moeda:         85,
    },
    recheio: null,
  },

  Nutella: {
    descricao: 'Massa tradicional com recheio generoso de Nutella.',
    massa: {
      Manteiga:     50,
      Mascavo:      30,
      Refinado:     20,
      Ovo:          25,
      Baunilha:      3,
      Farinha:      90,
      Amido:        10,
      Fermento:      1,
      Bicarbonato:   1,
      Sal:           1,
      'Gotas Preta': 40,
    },
    recheio: {
      Nutella: 150,
    },
  },

  Casadinho: {
    descricao: 'Massa tradicional com recheio brigadeiro de Ninho e Nutella.',
    massa: {
      Manteiga:              50,
      Mascavo:               30,
      Refinado:              20,
      Ovo:                   25,
      Baunilha:               3,
      Farinha:               90,
      Amido:                 10,
      Fermento:               1,
      Bicarbonato:            1,
      Sal:                    1,
      'Gotas Preta e Branca': 40,
    },
    recheio: {
      Nutella:           75,
      'Leite condensado':80,
      'Creme de leite':  20,
      'Leite em Pó':     20,
      Manteiga:          10,
    },
  },

  'Red Velvet': {
    descricao: 'Massa de tom vermelho com recheio brigadeiro de Ninho e cream cheese.',
    massa: {
      Manteiga:      50,
      Mascavo:       30,
      Refinado:      20,
      Ovo:           25,
      Vinagre:        1,
      Corante:       '15 gotas',
      Farinha:       90,
      'Leite em Pó': 15,
      Amido:         10,
      'Cacau 100%':   1,
      Sal:            1,
      Bicarbonato:    1,
      Fermento:       1,
      'Gotas Branca': 80,
    },
    recheio: {
      'Leite condensado': 55,
      'Creme de leite':   35,
      'Leite em Pó':      20,
      'Cream Cheese':     50,
    },
  },

  'Red Nut': {
    descricao: 'Massa de tom vermelho com recheio de Nutella.',
    massa: {
      Manteiga:      50,
      Mascavo:       30,
      Refinado:      20,
      Ovo:           25,
      Vinagre:        1,
      Corante:       '15 gotas',
      Farinha:       90,
      'Leite em Pó': 15,
      Amido:         10,
      'Cacau 100%':   1,
      Sal:            1,
      Bicarbonato:    1,
      Fermento:       1,
      'Gotas Preta':  80,
    },
    recheio: {
      Nutella: 150,
    },
  },

  'Ninho c/Nutella': {
    descricao: 'Massa de leite Ninho com recheio de Nutella.',
    massa: {
      Manteiga:       50,
      Refinado:       50,
      Ovo:            25,
      Farinha:        80,
      Amido:          10,
      'Leite em Pó':  30,
      Sal:             1,
      Fermento:        1,
      'Gotas Branca':  80,
    },
    recheio: {
      Nutella: 150,
    },
  },

  Beijinho: {
    descricao: 'Massa de leite Ninho com recheio brigadeiro de coco.',
    massa: {
      Manteiga:       50,
      Refinado:       50,
      Ovo:            25,
      Farinha:        80,
      Amido:          10,
      'Leite em Pó':  30,
      Sal:             1,
      Fermento:        1,
      'Gotas Branca':  80,
    },
    recheio: {
      'Leite condensado': 160,
      'Creme de leite':    40,
      'Coco ralado':       40,
      Manteiga:            10,
    },
  },

  Brigadeiro: {
    descricao: 'Massa de cacau com recheio brigadeiro de chocolate.',
    massa: {
      Manteiga:      50,
      Mascavo:       30,
      Refinado:      20,
      Ovo:           25,
      Farinha:       90,
      Amido:         10,
      'Cacau 100%':  15,
      Sal:            1,
      Bicarbonato:    1,
      Fermento:       1,
      'Gotas Preta':  80,
    },
    recheio: {
      'Leite condensado':  160,
      'Creme de leite':     40,
      'Chocolate em pó':    40,
    },
  },

  Nesquik: {
    descricao: 'Massa de cacau com recheio brigadeiro de Nesquik.',
    massa: {
      Manteiga:      50,
      Mascavo:       30,
      Refinado:      20,
      Ovo:           25,
      Farinha:       90,
      Amido:         10,
      'Cacau 100%':  15,
      Sal:            1,
      Bicarbonato:    1,
      Fermento:       1,
      'Gotas Preta':  80,
    },
    recheio: {
      'Leite condensado': 160,
      'Creme de leite':    40,
      Nesquik:             12,
    },
  },

  Cappuccino: {
    descricao: 'Massa aromática com recheio brigadeiro de café.',
    massa: {
      Manteiga:        50,
      Mascavo:         30,
      Refinado:        20,
      Ovo:             25,
      Farinha:         85,
      Amido:           10,
      'Leite em Pó':   15,
      'Canela em Pó':   1,
      Sal:              1,
      Bicarbonato:      1,
      Fermento:         1,
      Moeda:           40,
      'Choc. Branco':  40,
    },
    recheio: {
      'Leite condensado': 160,
      'Creme de leite':    40,
      'Café solúvel':       3,
      Manteiga:            10,
    },
  },

  Oreo: {
    descricao: 'Massa cacau black com recheio de chocolate branco e biscoito Oreo.',
    massa: {
      Manteiga:            50,
      Mascavo:             50,
      Refinado:            20,
      Ovo:                 25,
      Farinha:             85,
      Amido:               10,
      'Cacau black':       15,
      Sal:                  1,
      Bicarbonato:          1,
      Fermento:             1,
      'Chocolate branco':  80,
    },
    recheio: {
      'Chocolate branco': 135,
      'Biscoito Oreo':     35,
    },
  },
}

// Lista de todos os ingredientes únicos ordenados
export const ALL_INGREDIENTS = [
  ...new Set(
    Object.values(RECEITAS).flatMap((r) => [
      ...Object.keys(r.massa),
      ...(r.recheio ? Object.keys(r.recheio) : []),
    ])
  ),
].sort()

// Multiplicadores de lote disponíveis
export const LOTES = [1, 2, 3, 4]

// Calcula ingredientes totais dado um mapa { sabor: nLotes }
export function calcularIngredientes(producao) {
  const total = {}
  Object.entries(producao).forEach(([sabor, lotes]) => {
    if (!lotes || lotes <= 0) return
    const receita = RECEITAS[sabor]
    if (!receita) return
    const somar = (obj) => {
      Object.entries(obj).forEach(([ing, qtd]) => {
        if (typeof qtd === 'number') {
          total[ing] = (total[ing] || 0) + qtd * lotes
        }
      })
    }
    somar(receita.massa)
    if (receita.recheio) somar(receita.recheio)
  })
  return total
}
