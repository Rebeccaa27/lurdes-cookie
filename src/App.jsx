import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'

import { useAuth, useDarkMode } from './lib/hooks'
import { ToastProvider } from './components/Toast'
import Sidebar from './components/Sidebar'
import Header from './components/Header'

import Login      from './pages/Login'
import Dashboard  from './pages/Dashboard'
import Vendas     from './pages/Vendas'
import Dividas    from './pages/Dividas'
import Estoque    from './pages/Estoque'
import Receitas   from './pages/Receitas'

function ProtectedLayout({ dark, setDark }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-surface-secondary dark:bg-surface-dark">
      <Sidebar
        dark={dark}
        setDark={setDark}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Main area — offset for desktop sidebar */}
      <div className="flex-1 flex flex-col lg:ml-[220px] min-h-screen">
        <Header onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/"         element={<Dashboard />} />
              <Route path="/vendas"   element={<Vendas />}    />
              <Route path="/dividas"  element={<Dividas />}   />
              <Route path="/estoque"  element={<Estoque />}   />
              <Route path="/receitas" element={<Receitas />}  />
              <Route path="*"         element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}

function AppRoutes({ dark, setDark }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-secondary dark:bg-surface-dark">
        <div className="w-6 h-6 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route
        path="/*"
        element={user
          ? <ProtectedLayout dark={dark} setDark={setDark} />
          : <Navigate to="/login" replace />
        }
      />
    </Routes>
  )
}

export default function App() {
  const [dark, setDark] = useDarkMode()

  return (
    <ToastProvider>
      <BrowserRouter>
        <AppRoutes dark={dark} setDark={setDark} />
      </BrowserRouter>
    </ToastProvider>
  )
}
