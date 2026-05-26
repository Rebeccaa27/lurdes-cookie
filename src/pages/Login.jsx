import { useState } from 'react'
import { motion } from 'framer-motion'
import { Cookie, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import Button from '../components/Button'

export default function Login() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-surface-secondary dark:bg-surface-dark flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-sm"
      >
        {/* Brand */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-2xl bg-brand-600 flex items-center justify-center">
            <Cookie size={20} strokeWidth={2} className="text-white" />
          </div>
          <div>
            <p className="text-base font-semibold text-neutral-900 dark:text-neutral-100 leading-none">
              Lurdes Cookie
            </p>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
              Gestão do negócio
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-surface dark:bg-surface-dark-secondary border border-surface-border dark:border-surface-dark-border rounded-2xl shadow-card p-6">
          <h1 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
            Entrar na sua conta
          </h1>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 mb-6">
            Preencha os dados para continuar
          </p>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="label-base">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="input-base"
              />
            </div>

            <div>
              <label className="label-base">Senha</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="input-base pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                >
                  {showPass
                    ? <EyeOff size={15} strokeWidth={1.75} />
                    : <Eye size={15} strokeWidth={1.75} />
                  }
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-xl px-3.5 py-2.5">
                {error}
              </p>
            )}

            <Button
              type="submit"
              loading={loading}
              fullWidth
              iconRight={ArrowRight}
              className="mt-1"
            >
              Entrar
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-neutral-400 dark:text-neutral-600 mt-6">
          Acesso restrito · Lurdes Cookie © {new Date().getFullYear()}
        </p>
      </motion.div>
    </div>
  )
}
