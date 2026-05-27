import { useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'

const TITLES = {
  '/':           { title: 'Visão Geral',  sub: 'Resumo do negócio'           },
  '/producao':   { title: 'Produção',     sub: 'Receitas e ingredientes'      },
  '/estoque':    { title: 'Estoque',      sub: 'Controle de ingredientes'     },
  '/vendas':     { title: 'Vendas',       sub: 'Registre e acompanhe vendas'  },
  '/clientes':   { title: 'Clientes',     sub: 'Quem está devendo'            },
  '/financeiro': { title: 'Financeiro',   sub: 'Lucro, custos e lucratividade'},
  '/sazonais':   { title: 'Sazonais',     sub: 'Produtos especiais'           },
}

export default function Header({ onMenuClick }) {
  const { pathname } = useLocation()
  const { title, sub } = TITLES[pathname] ?? { title: '', sub: '' }

  return (
    <header className="h-[64px] flex items-center px-6 lg:px-8 gap-4
      bg-[#F3EBE3]/80 backdrop-blur-md border-b border-cream-300 sticky top-0 z-30">
      <button onClick={onMenuClick}
        className="lg:hidden p-2 rounded-xl text-ink-400 hover:text-ink hover:bg-cream-200 transition-all">
        <Menu size={20} strokeWidth={1.75} />
      </button>
      <div className="flex items-baseline gap-2.5">
        <h1 className="text-base font-semibold text-ink-700 leading-none">{title}</h1>
        {sub && <span className="hidden sm:block text-xs text-ink-300">{sub}</span>}
      </div>
    </header>
  )
}
