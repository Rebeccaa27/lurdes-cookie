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
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 lg:hidden"
          style={{ background: 'rgba(0,0,0,.5)' }}
          onClick={onMobileClose}
        />
      )}

      <aside
        className={[
          'fixed inset-y-0 left-0 z-40 flex flex-col w-[220px] transition-transform duration-300',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        ].join(' ')}
        style={{ background: 'var(--sidebar)', borderRight: '1px solid #1E1B18' }}
      >
        {/* Marca */}
        <div className="px-5 pt-6 pb-5" style={{ borderBottom: '1px solid #1E1B18' }}>
          <p className="sidebar-brand">Doce Controle</p>
          <p className="sidebar-sub">Gestão da confeitaria</p>
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
                'sidebar-link' + (isActive ? ' active' : '')
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Sair */}
        <div className="px-3 py-4" style={{ borderTop: '1px solid #1E1B18' }}>
          <button className="sidebar-logout" onClick={handleLogout}>
            Sair
          </button>
        </div>
      </aside>
    </>
  )
}
