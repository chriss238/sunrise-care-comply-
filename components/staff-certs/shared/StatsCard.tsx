interface StatsCardProps {
  label: string
  value: number | string
  icon: string
  colorClass: string
  bgClass: string
  sub?: string
}

export default function StatsCard({ label, value, icon, colorClass, bgClass, sub }: StatsCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${bgClass}`}>
        {icon}
      </div>
      <div>
        <div className={`text-2xl font-bold ${colorClass}`}>{value}</div>
        <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</div>
        {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
      </div>
    </div>
  )
}
