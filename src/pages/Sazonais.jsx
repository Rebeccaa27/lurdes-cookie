import { motion } from 'framer-motion'
import { Sunset } from 'lucide-react'

export default function Sazonais() {
  return (
    <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:.25}}
      className="p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-warm-500 flex items-center justify-center">
          <Sunset size={18} strokeWidth={1.75} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-ink-700">Sazonais</h1>
          <p className="text-xs text-ink-400">Ovos de Páscoa e Fondue</p>
        </div>
      </div>
      <div className="bg-white rounded-3xl shadow-card-lg border border-cream-200 p-10 flex flex-col items-center justify-center gap-4 text-center">
        <div className="w-16 h-16 rounded-3xl bg-cream-200 flex items-center justify-center">
          <Sunset size={28} strokeWidth={1.5} className="text-ink-300" />
        </div>
        <h2 className="text-base font-semibold text-ink-700">Produtos Sazonais</h2>
        <p className="text-sm text-ink-400 max-w-sm">Gerencie produtos de época como Ovos de Páscoa e Fondue de Chocolate.</p>
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-warm-100 text-warm-700 text-xs font-medium">Em desenvolvimento</span>
      </div>
    </motion.div>
  )
}
