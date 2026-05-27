import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Menu, Search } from 'lucide-react'
import Button from '../ui/Button'

const TITLES = {
  '/':           { title: 'Visão Geral',  sub: 'Resumo do negócio'               },
  '/producao':   { title: 'Produção',     sub: 'Calcule lotes e ingredientes'     },
  '/estoque':    { title: 'Estoque',      sub: 'Controle de ingredientes'         },
  '/vendas':     { title: 'Vendas',       sub: 'Registre e acompanhe vendas'      },
  '/clientes':   { title: 'Clientes',     sub: 'Gestão de clientes e dívidas'     },
  '/financeiro': { title: 'Financeiro',   sub: 'Lucro, custos e metas'            },
  '/sazonais':   { title: 'Sazonais',     sub: 'Ovos de Páscoa e Fondue'          },
  '/relatorios': { title: 'Relatórios',   sub: 'Análises e métricas'              },
  '/config':     { title: 'Configurações',sub: 'Ajustes do sistema'               },
}

export default function Header({ onMenuClick }) {
  const { pathname } = useLocation()
  const { title, sub } = TITLES[pathname] ?? { title: '', sub: '' }
  const [search, setSearch] = useState('')

  return (
    <header className="h-[64px] flex items-center justify-between px-6 lg:px-8 gap-4
      bg-cream/80 backdrop-blur-md border-b border-cream-300 sticky top-0 z-30">
      {/* Left */}
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-ink-400 hover:text-ink hover:bg-cream-200 transition-all">
          <Menu size={20} strokeWidth={1.75} />
        </button>
        <div className="flex items-baseline gap-2.5">
          <h1 className="text-base font-semibold text-ink-700 leading-none">{title}</h1>
          {sub && <span className="hidden sm:block text-xs text-ink-300">{sub}</span>}
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-cream-300 shadow-card">
          <Search size={14} strokeWidth={1.75} className="text-ink-300" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Pesquisar..."
            className="w-36 text-sm bg-transparent outline-none text-ink placeholder-ink-300"
          />
        </div>
        <Button variant="terra" size="sm">Ações</Button>
      </div>
    </header>
  )
}