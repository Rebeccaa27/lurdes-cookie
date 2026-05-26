import { Menu } from 'lucide-react'
import { useLocation } from 'react-router-dom'

const PAGE_TITLES = {
  '/':         { title: 'Dashboard',  sub: 'Visão geral do negócio' },
  '/vendas':   { title: 'Vendas',     sub: 'Registre e acompanhe suas vendas' },
  '/dividas':  { title: 'Dívidas',    sub: 'Clientes com pagamento em aberto' },
  '/estoque':  { title: 'Estoque',    sub: 'Ingredientes disponíveis' },
  '/receitas': { title: 'Receitas',   sub: 'Ingredientes por sabor e lote' },
}

export default function Header({ onMenuClick }) {
  const { pathname } = useLocation()
  const { title, sub } = PAGE_TITLES[pathname] ?? { title: '', sub: '' }

  return (
    <header className="h-[60px] flex items-center px-5 lg:px-8 gap-4
      border-b border-surface-border dark:border-surface-dark-border
      bg-surface/80 dark:bg-surface-dark/80 backdrop-blur-md sticky top-0 z-30"
    >
      {/* Mobile hamburger */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-1.5 rounded-xl text-neutral-400 hover:text-neutral-700
          dark:hover:text-neutral-200 hover:bg-surface-tertiary dark:hover:bg-surface-dark-tertiary
          transition-all duration-150"
      >
        <Menu size={20} strokeWidth={1.75} />
      </button>

      <div className="flex items-baseline gap-2.5">
        <h1 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          {title}
        </h1>
        {sub && (
          <span className="hidden sm:block text-xs text-neutral-400 dark:text-neutral-500">
            {sub}
          </span>
        )}
      </div>
    </header>
  )
}
