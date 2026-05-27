import { createContext, useContext, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import { cn } from '../../lib/utils'

const Ctx = createContext(null)

const CFG = {
  success: { Icon: CheckCircle2, cls: 'bg-emerald-50 border-emerald-200 text-emerald-800', icon: 'text-emerald-500' },
  error:   { Icon: XCircle,      cls: 'bg-red-50 border-red-200 text-red-800',             icon: 'text-red-500'     },
  warning: { Icon: AlertTriangle,cls: 'bg-amber-50 border-amber-200 text-amber-800',       icon: 'text-amber-500'   },
  info:    { Icon: Info,         cls: 'bg-navy-100 border-navy-200 text-navy',             icon: 'text-navy-300'    },
}
let _id = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const add = useCallback((msg, type = 'success') => {
    const id = ++_id
    setToasts(t => [...t, { id, msg, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3800)
  }, [])
  const rm = useCallback(id => setToasts(t => t.filter(x => x.id !== id)), [])

  return (
    <Ctx.Provider value={add}>
      {children}
      <div className="fixed bottom-5 right-5 z-[60] flex flex-col gap-2 items-end pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => {
            const { Icon, cls, icon } = CFG[t.type] ?? CFG.success
            return (
              <motion.div key={t.id}
                initial={{opacity:0,y:10,scale:.97}} animate={{opacity:1,y:0,scale:1}}
                exit={{opacity:0,y:6,scale:.97}} transition={{duration:.2}}
                className={cn('pointer-events-auto flex items-center gap-3 pl-4 pr-3 py-3 rounded-2xl border shadow-card-lg text-sm', cls)}
              >
                <Icon size={15} strokeWidth={2} className={icon} />
                <span className="max-w-[260px]">{t.msg}</span>
                <button onClick={() => rm(t.id)} className="ml-1 opacity-50 hover:opacity-100">
                  <X size={13} strokeWidth={2} />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  )
}

export const useToast = () => useContext(Ctx)