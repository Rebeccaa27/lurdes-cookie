import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '../lib/utils'

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
}

export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = 'md',
  footer,
}) {
  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/30 dark:bg-black/50 backdrop-blur-sm"
          />

          {/* Dialog */}
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6">
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
              className={cn(
                'w-full relative flex flex-col',
                'bg-surface dark:bg-surface-dark-secondary',
                'border border-surface-border dark:border-surface-dark-border',
                'rounded-2xl shadow-modal',
                'max-h-[90vh] overflow-hidden',
                sizes[size]
              )}
            >
              {/* Header */}
              <div className="flex items-start justify-between p-5 border-b border-surface-border dark:border-surface-dark-border">
                <div>
                  {title && (
                    <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                      {description}
                    </p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="ml-4 p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700
                    dark:hover:text-neutral-200 hover:bg-surface-tertiary dark:hover:bg-surface-dark-tertiary
                    transition-all duration-150"
                >
                  <X size={16} strokeWidth={2} />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-5">
                {children}
              </div>

              {/* Footer */}
              {footer && (
                <div className="p-5 pt-0 border-t border-surface-border dark:border-surface-dark-border mt-4">
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
