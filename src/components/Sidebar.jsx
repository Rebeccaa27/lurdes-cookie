import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, ShoppingBag, Package, Cpu,
  Users, DollarSign, Sunset,
  LogOut, X, Menu, Cookie,
} from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { cn } from '../lib/utils'

const NAV = [
  { to: '/',           label: 'Visão Geral', Icon: LayoutDashboard },
  { to: '/producao',   label: 'Produção',    Icon: Cpu             },
  { to: '/estoque',    label: 'Estoque',     Icon: Package         },
  { to: '/vendas',     label: 'Vendas',      Icon: ShoppingBag     },
  { to: '/clientes',   label: 'Clientes',    Icon: Users           },
  { to: '/financeiro', label: 'Financeiro',  Icon: DollarSign      },
  { to: '/sazonais',   label: 'Sazonais',    Icon: Sunset          },
]

function NavItem({ to, label, Icon, onClick }) {
  return (
    <NavLink to={to} end={to==='/'} onClick={onClick}
      className={({ isActive }) => cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group',
        isActive
          ? 'bg-terra text-white shadow-sm'
          : 'text-navy-100 hover:bg-navy-500 hover:text-white'
      )}
    >
      {({ isActive }) => (
        <>
          <Icon size={16} strokeWidth={isActive ? 2 : 1.75} />
          {label}
        </>
      )}
    </NavLink>
  )
}

function SidebarContent({ onClose }) {
  const navigate = useNavigate()
  async function logout() {
    await supabase.auth.signOut()
    navigate('/login')
    onClose?.()
  }
  return (
    <div className="flex flex-col h-full bg-navy">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-navy-500">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-terra flex items-center justify-center flex-shrink-0">
            <Cookie size={18} strokeWidth={2} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white leading-none">CookieHQ</p>
            <p className="text-xs text-navy-200 mt-0.5">Gestão da Confeitaria</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto">
        {NAV.map(n => <NavItem key={n.to} {...n} onClick={onClose} />)}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-navy-500">
        <button onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium
            text-navy-100 hover:bg-red-900/30 hover:text-red-300 transition-all duration-150">
          <LogOut size={16} strokeWidth={1.75} />
          Sair
        </button>
      </div>
    </div>
  )
}

export default function Sidebar({ mobileOpen, onMobileClose }) {
  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex flex-col w-[220px] fixed left-0 top-0 bottom-0 z-40">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div key="ov" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
              onClick={onMobileClose}
              className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm lg:hidden" />
            <motion.aside key="dr"
              initial={{x:'-100%'}} animate={{x:0}} exit={{x:'-100%'}}
              transition={{duration:.28,ease:[.4,0,.2,1]}}
              className="fixed left-0 top-0 bottom-0 z-50 w-72 lg:hidden flex flex-col">
              <div className="absolute top-4 right-4">
                <button onClick={onMobileClose}
                  className="p-1.5 rounded-lg bg-navy-500 text-navy-100 hover:bg-navy-400">
                  <X size={16} strokeWidth={2} />
                </button>
              </div>
              <SidebarContent onClose={onMobileClose} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
