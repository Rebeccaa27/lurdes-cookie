import { pct, stockStatus } from '../../lib/utils'

function CircleProgress({ value, color, size = 64 }) {
  const r = (size - 8) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (value / 100) * circ
  return (
    <svg width={size} height={size} className="progress-ring">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#F3EDE3" strokeWidth={6} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color}
        strokeWidth={6} strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset}
        style={{transition:'stroke-dashoffset .6s cubic-bezier(.4,0,.2,1)'}}
      />
    </svg>
  )
}

export default function StockMeter({ label, qty, min, unit = 'g' }) {
  const status = stockStatus(qty, min)
  const percent = pct(qty, min * 3)
  return (
    <div className="bg-white rounded-2xl shadow-card border border-cream-200 p-4 flex flex-col items-center gap-2 text-center">
      <p className="text-xs font-medium text-ink-400 truncate w-full">{label}</p>
      <div className="relative">
        <CircleProgress value={percent} color={status.ring} size={64} />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-semibold text-ink-700">{qty ?? 0}{unit}</span>
        </div>
      </div>
      <span className={`text-2xs font-medium px-2 py-0.5 rounded-full ${status.bg} ${status.color}`}>
        {status.label}
      </span>
    </div>
  )
}