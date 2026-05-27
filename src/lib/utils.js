export const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                      'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

export const MESES_CURTOS = ['Jan','Fev','Mar','Abr','Mai','Jun',
                             'Jul','Ago','Set','Out','Nov','Dez']

export const formatBRL = (v) =>
  new Intl.NumberFormat('pt-BR', { style:'currency', currency:'BRL' }).format(v ?? 0)

export const formatDate = (iso) => {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

export const today = () => new Date().toISOString().slice(0, 10)

export const monthStart = (mes, ano) =>
  `${ano}-${String(mes + 1).padStart(2, '0')}-01`

export const monthEnd = (mes, ano) =>
  new Date(ano, mes + 1, 0).toISOString().slice(0, 10)

export const cn = (...c) => c.filter(Boolean).join(' ')

export const getInitials = (name = '') =>
  name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('')

export const pct = (val, max) => max > 0 ? Math.min(100, (val / max) * 100) : 0

export const stockStatus = (qty, min) => {
  if (qty <= 0)       return { label: 'Zerado',  color: 'text-red-500',    bg: 'bg-red-50',    ring: '#EF4444' }
  if (qty <= min)     return { label: 'Crítico', color: 'text-terra',      bg: 'bg-terra-100', ring: '#BC544B' }
  if (qty <= min * 2) return { label: 'Baixo',   color: 'text-amber-600',  bg: 'bg-amber-50',  ring: '#D97706' }
  return                     { label: 'OK',      color: 'text-emerald-600',bg: 'bg-emerald-50',ring: '#10B981' }
}