import { motion } from 'framer-motion'
import { Users } from 'lucide-react'

export default function Clientes() {
  return (
    <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:.25}}
      className="p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-navy flex items-center justify-center">
          <Users size={18} strokeWidth={1.75} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-ink-700">Clientes</h1>
          <p className="text-xs text-ink-400">Gestão de clientes e dívidas</p>
        </div>
      </div>
      <div className="bg-white rounded-3xl shadow-card-lg border border-cream-200 p-10 flex flex-col items-center justify-center gap-4 text-center">
        <div className="w-16 h-16 rounded-3xl bg-cream-200 flex items-center justify-center">
          <Users size={28} strokeWidth={1.5} className="text-ink-300" />
        </div>
        <h2 className="text-base font-semibold text-ink-700">Módulo de Clientes</h2>
        <p className="text-sm text-ink-400 max-w-sm">Gerencie seus clientes, veja quem está em dídea e acompanhe o histórico de compras.</p>
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-navy-100 text-navy text-xs font-medium">Em desenvolvimento</span>
      </div>
    </motion.div>
  )
}
