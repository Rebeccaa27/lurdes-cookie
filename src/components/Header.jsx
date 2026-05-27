import { useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'

const TITLES = {
  '/':           { title: 'Vis\u00e3o Geral',  sub: 'Resumo do neg\u00f3cio' },
  '/vendas':     { title: 'Vendas',       sub: 'Registro de pedidos' },
  '/clientes':   { title: 'Clientes',     sub: 'Fiados e hist\u00f3rico' },
  '/dividas':    { title: 'D\u00edvidas',      sub: 'Contas a receber' },
  '/estoque':    { title: 'Estoque',      sub: 'Ingredientes' },
  '/producao':   { title: 'Produ\u00e7\u00e3o',     sub: 'Receitas e produ\u00e7\u00e3o' },
  '/receitas':   { title: 'Receitas',     sub: 'Fichas t\u00e9cnicas' },
  '/financeiro': { title: 'Financeiro',   sub: 'Custos e lucro' },
  '/sazonais':   { title: 'Sazonais',     sub: 'Datas especiais' },
  '/relatorios': { title: 'Relat\u00f3rios',   sub: 'An\u00e1lises' },
  '/config':     { title: 'Config',       sub: 'Configura\u00e7\u00f5es' },
}

export default function Header({ onMenuClick }) {
  const { pathname } = useLocation()
  const info = TITLES[pathname] ?? { title: 'CookieHQ', sub: '' }

  return (
    <header className="sticky top-0 z-30 bg-cream/90 backdrop-blur-md border-b border-cream-300">
      <div className="flex items-center gap-3 px-4 md:px-6 h-14">
        <button onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl hover:bg-cream-200 text-navy-500 transition-colors"
          aria-label="Abrir menu">
          <Menu size={20} strokeWidth={1.75} />
        </button>
        <div className="min-w-0">
          <h1 className="text-sm md:text-base font-semibold text-navy leading-none truncate">{info.title}</h1>
          {info.sub && <p className="text-xs text-navy-400 mt-0.5 hidden sm:block">{info.sub}</p>}
        </div>
      </div>
    </header>
  )
}
