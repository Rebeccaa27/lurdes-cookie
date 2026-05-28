import { Menu } from 'lucide-react'
import { useLocation } from 'react-router-dom'

const TITLES = {
  '/':            'Dashboard',
  '/vendas':      'Vendas',
  '/crm':         'CRM',
  '/financeiro':  'Financeiro',
  '/estoque':     'Estoque',
  '/calculadora': 'Calculadora',
  '/producao':    'Produção',
  '/receitas':    'Receitas',
  '/sazonais':    'Sazonais',
  '/config':      'Configurações',
}

export default function Header({ onMenuClick }) {
  const { pathname } = useLocation()
  const title = TITLES[pathname] ?? 'Doce Controle'

  return (
    <header
      className="sticky top-0 z-20 flex items-center h-14 px-4 lg:px-6"
      style={{ background: '#F3EFE9', borderBottom: '1px solid #E8E2DA' }}
    >
      <button
        className="lg:hidden mr-3 p-1.5 rounded-lg transition hover:bg-black/8"
        onClick={onMenuClick}
        style={{ color: '#78716C' }}
      >
        <Menu size={18} />
      </button>
      <p className="text-sm font-semibold" style={{ color: '#1A1714' }}>{title}</p>
    </header>
  )
}
