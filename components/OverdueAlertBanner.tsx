'use client'

interface Props {
  overdueCount: number
  criticalItems: string[]
  onClickFilter: () => void
}

export default function OverdueAlertBanner({ overdueCount, criticalItems, onClickFilter }: Props) {
  if (overdueCount === 0) return null

  const isCritical = criticalItems.length > 0

  return (
    <div
      className="sticky top-0 z-50 cursor-pointer select-none"
      style={{ background: isCritical ? '#7f1d1d' : '#dc2626' }}
      onClick={onClickFilter}
      role="alert"
      aria-live="assertive"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-3 flex items-center gap-3">
        <span className="text-xl shrink-0" aria-hidden="true">⚠️</span>
        <div className="flex-1 min-w-0">
          {isCritical ? (
            <span className="font-bold text-white text-sm">
              CRITICAL: {criticalItems.join(', ')} — practicing certificate overdue. Immediate renewal required.
            </span>
          ) : (
            <span className="font-bold text-white text-sm">
              URGENT: {overdueCount} compliance {overdueCount === 1 ? 'item' : 'items'} overdue. Immediate action required.
            </span>
          )}
        </div>
        <span className="text-white/75 text-xs shrink-0 hidden sm:block">Click to view →</span>
      </div>
    </div>
  )
}
