import { NavLink, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

const NAV = [
  { to: '/',            icon: '⊞',  label: 'Dashboard'    },
  { to: '/vendas',      icon: '🛒',  label: 'Vendas'       },
  { to: '/crm',         icon: '👥',  label: 'CRM'          },
  { to: '/financeiro',  icon: '💰',  label: 'Financeiro'   },
  { to: '/estoque',     icon: '📦',  label: 'Estoque'      },
  { to: '/calculadora', icon: '🧮',  label: 'Calculadora'  },
  { to: '/producao',    icon: '🍪',  label: 'Produção'     },
  { to: '/receitas',    icon: '📋',  label: 'Receitas'     },
  { to: '/sazonais',    icon: '🥚',  label: 'Sazonais'     },
  { to: '/config',      icon: '⚙️',  label: 'Config'       },
]

export default function Sidebar({ mobileOpen, onMobileClose }) {
  const navigate = useNavigate()

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const base = [
    'fixed inset-y-0 left-0 z-40 flex flex-col',
    'w-[220px] transition-transform duration-300',
  ].join(' ')

  const mobileClass = mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside className={`${base} ${mobileClass}`} style={{ background: '#1C1917' }}>
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-xl">🍪</span>
            <div>
              <p className="text-white font-bold text-sm tracking-wide">Doce Controle</p>
              <p className="text-white/40 text-xs">Estoque · Vendas · Clientes</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={onMobileClose}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all',
                  isActive
                    ? 'bg-[#C2410C] text-white font-semibold'
                    : 'text-white/60 hover:text-white hover:bg-white/10',
                ].join(' ')
              }
            >
              <span className="text-base w-5 text-center">{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/10 transition-all"
          >
            <span className="text-base w-5 text-center">↩</span>
            <span>Sair</span>
          </button>
        </div>
      </aside>
    </>
  )
}
