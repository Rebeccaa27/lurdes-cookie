import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'

import { useAuth } from './lib/hooks'
import { ToastProvider } from './components/Toast'
import Sidebar from './components/Sidebar'
import Header from './components/Header'

import Login      from './pages/Login'
import Dashboard  from './pages/Dashboard'
import Vendas     from './pages/Vendas'
import CRM        from './pages/CRM'
import Estoque    from './pages/Estoque'
import Receitas   from './pages/Receitas'
import Producao   from './pages/Producao'
import Financeiro from './pages/Financeiro'
import Sazonais   from './pages/Sazonais'
import Config     from './pages/Config'

function ProtectedLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#F3EFE9' }}>
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="flex-1 flex flex-col lg:ml-[220px] min-h-screen">
        <Header onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 lg:p-6" style={{ backgroundColor: '#F3EFE9' }}>
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/"           element={<Dashboard />}  />
              <Route path="/vendas"     element={<Vendas />}     />
              <Route path="/crm"        element={<CRM />}        />
              <Route path="/clientes"   element={<Navigate to="/crm" replace />} />
              <Route path="/dividas"    element={<Navigate to="/crm" replace />} />
              <Route path="/estoque"    element={<Estoque />}    />
              <Route path="/producao"   element={<Producao />}   />
              <Route path="/receitas"   element={<Receitas />}   />
              <Route path="/financeiro" element={<Financeiro />} />
              <Route path="/sazonais"   element={<Sazonais />}   />
              <Route path="/config"     element={<Config />}     />
              <Route path="*"           element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F3EFE9' }}>
        <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#C2410C', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route
        path="/*"
        element={user ? <ProtectedLayout /> : <Navigate to="/login" replace />}
      />
    </Routes>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ToastProvider>
  )
}
