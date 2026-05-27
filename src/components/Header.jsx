import { useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'

const TITLES = {
  '/':           { title: 'Visão Geral',  sub: 'Resumo do negócio' },
  '/vendas':     { title: 'Vendas',       sub: 'Registro de pedidos' },
  '/clientes':   { title: 'Clientes',     sub: 'Fiados e histórico' },
  '/dividas':    { title: 'Dívidas',      sub: 'Contas a receber' },
  '/estoque':    { title: 'Estoque',      sub: 'Ingredientes' },
  '/producao':   { title: 'Produção',     sub: 'Receitas e produção' },
  '/receitas':   { title: 'Receitas',     sub: 'Fichas técnicas' },
  '/financeiro': { title: 'Financeiro',   sub: 'Custos e lucro' },
  '/sazonais':   { title: 'Sazonais',     sub: 'Datas especiais' },
  '/relatorios': { title: 'Relatórios',   sub: 'Análises' },
  '/config':     { title: 'Config',       sub: 'Configurações' },
}

export default function Header({ onMenuClick }) {
  const { pathname } = useLocation()
  const info = TITLES[pathname] ?? { title: 'CookieHQ', sub: '' }

  return (
    <header className="sticky top-0 z-30 bg-cream/90 backdrop-blur-md border-b border-cream-300">
      <div className="flex items-center gap-3 px-4 md:px-6 h-14">
        {/* Mobile menu toggle */}
        <button onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl hover:bg-cream-200 text-choco-600 transition-colors"
          aria-label="Abrir menu">
          <Menu size={20} strokeWidth={1.75} />
        </button>

        <div className="min-w-0">
          <h1 className="text-sm md:text-base font-semibold text-choco leading-none truncate">{info.title}</h1>
          {info.sub && <p className="text-xs text-choco-400 mt-0.5 hidden sm:block">{info.sub}</p>}
        </div>
      </div>
    </header>
  )
}
