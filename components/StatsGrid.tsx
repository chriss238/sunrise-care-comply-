interface Stats {
  total: number
  overdue: number
  soon: number
  ok: number
}

interface Props {
  stats: Stats
}

export default function StatsGrid({ stats }: Props) {
  const cards = [
    { label: 'Total Items',  value: stats.total,   colorClass: 'text-white' },
    { label: 'Overdue',      value: stats.overdue, colorClass: 'text-sg-coral-light' },
    { label: 'Due Soon',     value: stats.soon,    colorClass: 'text-sg-amber' },
    { label: 'Compliant',    value: stats.ok,      colorClass: 'text-sg-green' },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {cards.map(({ label, value, colorClass }) => (
        <div
          key={label}
          className="rounded-xl p-4 border backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5"
          style={{
            background: 'rgba(255,255,255,0.12)',
            borderColor: 'rgba(255,255,255,0.15)',
          }}
        >
          <div className="text-xs font-semibold uppercase tracking-widest text-white/85 mb-2">
            {label}
          </div>
          <div className={`text-4xl font-bold tracking-tight leading-none ${colorClass}`}>
            {value}
          </div>
        </div>
      ))}
    </div>
  )
}
