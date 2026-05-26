export const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                      'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

export const formatBRL = (v) =>
  new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(v??0)

export const formatDate = (iso) => {
  if(!iso) return '—'
  const [y,m,d] = iso.split('-')
  return `${d}/${m}/${y}`
}

export const monthStart = (mes,ano) => `${ano}-${String(mes+1).padStart(2,'0')}-01`
export const monthEnd   = (mes,ano) => new Date(ano,mes+1,0).toISOString().slice(0,10)

export const cn = (...c) => c.filter(Boolean).join(' ')

export const getInitials = (name='') =>
  name.split(' ').slice(0,2).map(w=>w[0]?.toUpperCase()??'').join('')

export const clamp = (v,min,max) => Math.min(Math.max(v,min),max)