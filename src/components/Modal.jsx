import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '../lib/utils'

const SIZES = { sm:'max-w-sm', md:'max-w-md', lg:'max-w-lg', xl:'max-w-2xl' }

export default function Modal({ open, onClose, title, description, children, footer, size = 'md' }) {
  useEffect(() => {
    if (!open) return
    const h = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', h); document.body.style.overflow = '' }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div key="bd"
            initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:.2}}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-ink/30 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6">
            <motion.div key="modal"
              initial={{opacity:0,scale:.96,y:12}} animate={{opacity:1,scale:1,y:0}}
              exit={{opacity:0,scale:.96,y:8}} transition={{duration:.22,ease:[.4,0,.2,1]}}
              className={cn('w-full bg-white rounded-3xl shadow-modal border border-cream-200 flex flex-col max-h-[90vh]', SIZES[size])}
            >
              <div className="flex items-start justify-between px-6 py-5 border-b border-cream-200">
                <div>
                  {title && <h2 className="text-sm font-semibold text-ink-700">{title}</h2>}
                  {description && <p className="text-xs text-ink-400 mt-0.5">{description}</p>}
                </div>
                <button onClick={onClose}
                  className="ml-4 p-1.5 rounded-lg text-ink-300 hover:text-ink-600 hover:bg-cream-200 transition-all">
                  <X size={16} strokeWidth={2} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
              {footer && <div className="px-6 py-4 border-t border-cream-200">{footer}</div>}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
