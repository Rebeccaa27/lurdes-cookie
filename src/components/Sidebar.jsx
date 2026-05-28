import { NavLink, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

const NAV = [
  { to: '/',            label: 'Dashboard'   },
  { to: '/vendas',      label: 'Vendas'      },
  { to: '/crm',         label: 'CRM'         },
  { to: '/financeiro',  label: 'Financeiro'  },
  { to: '/estoque',     label: 'Estoque'     },
  { to: '/calculadora', label: 'Calculadora' },
  { to: '/producao',    label: 'Produção'    },
  { to: '/receitas',    label: 'Receitas'    },
  { to: '/sazonais',    label: 'Sazonais'    },
  { to: '/config',      label: 'Config'      },
]

export default function Sidebar({ mobileOpen, onMobileClose }) {
  const navigate = useNavigate()

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <>
      {/* Overlay mobile */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={onMobileClose} />
      )}

      <aside
        className={[
          'fixed inset-y-0 left-0 z-40 flex flex-col w-[200px] transition-transform duration-300',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        ].join(' ')}
        style={{ background: '#111009', borderRight: '1px solid #1E1B18' }}
      >
        {/* Marca */}
        <div className="px-5 py-6" style={{ borderBottom: '1px solid #1E1B18' }}>
          <p className="text-white font-bold text-sm tracking-wide">Doce Controle</p>
          <p className="text-xs mt-0.5" style={{ color: '#6B6460' }}>Gestão da confeitaria</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={onMobileClose}
              className={({ isActive }) =>
                [
                  'flex items-center px-3 py-2 rounded-lg text-sm transition-all',
                  isActive
                    ? 'bg-[#C2410C] text-white font-semibold'
                    : 'text-[#857E79] hover:text-white hover:bg-white/8',
                ].join(' ')
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Sair */}
        <div className="px-3 py-4" style={{ borderTop: '1px solid #1E1B18' }}>
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2 rounded-lg text-sm transition-all text-left"
            style={{ color: '#6B6460' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#6B6460'; e.currentTarget.style.background = 'transparent' }}
          >
            Sair
          </button>
        </div>
      </aside>
    </>
  )
}
