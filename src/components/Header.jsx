export default function Header({ onMenuClick }) {
  const now = new Date()
  const dia = now.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })

  return (
    <header
      className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 border-b"
      style={{ background: '#FAF8F5', borderColor: '#E5E0D9' }}
    >
      <button
        onClick={onMenuClick}
        className="lg:hidden p-1.5 rounded-lg hover:bg-black/5 transition"
      >
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round" />
        </svg>
      </button>

      <div className="hidden lg:block" />

      <div className="flex items-center gap-3">
        <span className="text-xs capitalize" style={{ color: '#78716C' }}>{dia}</span>
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
          style={{ background: '#C2410C' }}
        >
          L
        </div>
      </div>
    </header>
  )
}
