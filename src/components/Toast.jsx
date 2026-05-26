import { createContext, useContext, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, AlertCircle, X } from 'lucide-react'
import { cn } from '../lib/utils'

const ToastContext = createContext(null)

const ICONS = {
  success: CheckCircle2,
  error:   XCircle,
  warning: AlertCircle,
}

const STYLES = {
  success: 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200',
  error:   'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 text-red-800 dark:text-red-200',
  warning: 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-200',
}

const ICON_STYLES = {
  success: 'text-emerald-500',
  error:   'text-red-500',
  warning: 'text-amber-500',
}

let id = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const add = useCallback((msg, type = 'success') => {
    const tid = ++id
    setToasts((t) => [...t, { id: tid, msg, type }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== tid)), 3500)
  }, [])

  const remove = useCallback((tid) => setToasts((t) => t.filter((x) => x.id !== tid)), [])

  return (
    <ToastContext.Provider value={add}>
      {children}
      <div className="fixed bottom-5 right-5 z-[60] flex flex-col gap-2 items-end">
        <AnimatePresence>
          {toasts.map((t) => {
            const Icon = ICONS[t.type] ?? CheckCircle2
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  'flex items-center gap-3 pl-3.5 pr-3 py-2.5 rounded-xl border shadow-card text-sm',
                  STYLES[t.type]
                )}
              >
                <Icon size={16} strokeWidth={2} className={ICON_STYLES[t.type]} />
                <span className="max-w-[260px]">{t.msg}</span>
                <button
                  onClick={() => remove(t.id)}
                  className="ml-1 opacity-50 hover:opacity-100 transition-opacity"
                >
                  <X size={13} strokeWidth={2} />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
