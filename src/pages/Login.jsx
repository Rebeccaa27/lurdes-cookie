import { useState } from 'react'
import { motion } from 'framer-motion'
import { Cookie, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import Button from '../components/Button'

export default function Login() {
  const [email, setEmail]     = useState('')
  const [pass, setPass]       = useState('')
  const [show, setShow]       = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  async function submit(e) {
    e.preventDefault()
    setError(''); setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass })
    if (error) setError(error.message)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-6">
      <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}}
        transition={{duration:.35,ease:[.4,0,.2,1]}} className="w-full max-w-sm">

        <div className="flex items-center gap-3 mb-10">
          <div className="w-11 h-11 rounded-2xl bg-navy flex items-center justify-center">
            <Cookie size={22} strokeWidth={2} className="text-terra" />
          </div>
          <div>
            <p className="text-base font-semibold text-ink-700 leading-none">CookieHQ</p>
            <p className="text-xs text-ink-400 mt-0.5">Gestão da Confeitaria</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-card-lg border border-cream-200 p-7">
          <h1 className="font-serif text-xl text-ink-700 font-medium mb-1">Bem-vinda de volta</h1>
          <p className="text-xs text-ink-400 mb-6">Entre com suas credenciais para continuar</p>

          <form onSubmit={submit} className="flex flex-col gap-4">
            <div>
              <label className="field-label">Email</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
                placeholder="seu@email.com" required className="field" />
            </div>
            <div>
              <label className="field-label">Senha</label>
              <div className="relative">
                <input type={show?'text':'password'} value={pass} onChange={e=>setPass(e.target.value)}
                  placeholder="••••••••" required className="field pr-10" />
                <button type="button" onClick={()=>setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-300 hover:text-ink-500 transition-colors">
                  {show ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
            </div>
            {error && (
              <p className="text-xs text-terra bg-terra-100 border border-terra/20 rounded-xl px-4 py-3">{error}</p>
            )}
            <Button type="submit" loading={loading} fullWidth size="lg" iconRight={ArrowRight} className="mt-1">
              Entrar
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-ink-300 mt-6">
          Acesso restrito · CookieHQ © {new Date().getFullYear()}
        </p>
      </motion.div>
    </div>
  )
}
