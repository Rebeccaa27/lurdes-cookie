import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, ShoppingBag, CircleDollarSign,
  Package, BookOpen, LogOut, X, Moon, Sun, Cookie,
} from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { cn } from '../lib/utils'

const NAV = [
  { to: '/',         label: 'Dashboard', icon: LayoutDashboard },
  { to: '/vendas',   label: 'Vendas',    icon: ShoppingBag     },
  { to: '/dividas',  label: 'Dívidas',   icon: CircleDollarSign},
  { to: '/estoque',  label: 'Estoque',   icon: Package         },
  { to: '/receitas', label: 'Receitas',  icon: BookOpen        },
]

function NavItem({ to, label, Icon, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      end={to === '/'}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
          isActive
            ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300'
            : 'text-neutral-500 dark:text-neutral-400 hover:bg-surface-tertiary dark:hover:bg-surface-dark-tertiary hover:text-neutral-800 dark:hover:text-neutral-200'
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            size={16}
            strokeWidth={isActive ? 2 : 1.75}
            className={isActive ? 'text-brand-600 dark:text-brand-400' : ''}
          />
          {label}
        </>
      )}
    </NavLink>
  )
}

// Desktop sidebar
function DesktopSidebar({ dark, setDark }) {
  const navigate = useNavigate()

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <aside className="hidden lg:flex flex-col w-[220px] min-h-screen border-r border-surface-border dark:border-surface-dark-border bg-surface dark:bg-surface-dark-secondary fixed left-0 top-0 bottom-0 z-40">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-surface-border dark:border-surface-dark-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center">
            <Cookie size={16} strokeWidth={2} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 leading-none">
              Lurdes
            </p>
            <p className="text-2xs text-neutral-400 dark:text-neutral-500 mt-0.5">
              Cookie
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {NAV.map(({ to, label, icon }) => (
          <NavItem key={to} to={to} label={label} Icon={icon} />
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-surface-border dark:border-surface-dark-border flex flex-col gap-1">
        <button
          onClick={() => setDark(!dark)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
            text-neutral-500 dark:text-neutral-400 hover:bg-surface-tertiary dark:hover:bg-surface-dark-tertiary
            hover:text-neutral-800 dark:hover:text-neutral-200 transition-all duration-150 w-full"
        >
          {dark
            ? <Sun size={16} strokeWidth={1.75} />
            : <Moon size={16} strokeWidth={1.75} />
          }
          {dark ? 'Modo claro' : 'Modo escuro'}
        </button>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
            text-neutral-500 dark:text-neutral-400 hover:bg-red-50 dark:hover:bg-red-900/10
            hover:text-red-600 dark:hover:text-red-400 transition-all duration-150 w-full"
        >
          <LogOut size={16} strokeWidth={1.75} />
          Sair
        </button>
      </div>
    </aside>
  )
}

// Mobile drawer
function MobileDrawer({ open, onClose, dark, setDark }) {
  const navigate = useNavigate()

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          />
          <motion.aside
            key="drawer"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="fixed left-0 top-0 bottom-0 z-50 w-72 bg-surface dark:bg-surface-dark-secondary
              border-r border-surface-border dark:border-surface-dark-border flex flex-col lg:hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-5 border-b border-surface-border dark:border-surface-dark-border">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center">
                  <Cookie size={16} strokeWidth={2} className="text-white" />
                </div>
                <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  Lurdes Cookie
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700
                  dark:hover:text-neutral-200 hover:bg-surface-tertiary dark:hover:bg-surface-dark-tertiary"
              >
                <X size={16} strokeWidth={2} />
              </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
              {NAV.map(({ to, label, icon }) => (
                <NavItem key={to} to={to} label={label} Icon={icon} onClick={onClose} />
              ))}
            </nav>

            {/* Footer */}
            <div className="px-3 py-4 border-t border-surface-border dark:border-surface-dark-border flex flex-col gap-1">
              <button
                onClick={() => { setDark(!dark); onClose() }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                  text-neutral-500 dark:text-neutral-400 hover:bg-surface-tertiary dark:hover:bg-surface-dark-tertiary
                  hover:text-neutral-800 dark:hover:text-neutral-200 transition-all duration-150 w-full"
              >
                {dark ? <Sun size={16} strokeWidth={1.75} /> : <Moon size={16} strokeWidth={1.75} />}
                {dark ? 'Modo claro' : 'Modo escuro'}
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                  text-neutral-500 dark:text-neutral-400 hover:bg-red-50 dark:hover:bg-red-900/10
                  hover:text-red-600 dark:hover:text-red-400 transition-all duration-150 w-full"
              >
                <LogOut size={16} strokeWidth={1.75} />
                Sair
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

export default function Sidebar({ dark, setDark, mobileOpen, onMobileClose }) {
  return (
    <>
      <DesktopSidebar dark={dark} setDark={setDark} />
      <MobileDrawer open={mobileOpen} onClose={onMobileClose} dark={dark} setDark={setDark} />
    </>
  )
}
