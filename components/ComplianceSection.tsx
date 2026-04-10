import type { ItemWithStatus } from '@/lib/types'
import ComplianceItem from './ComplianceItem'

interface Props {
  category: string
  icon: string
  items: ItemWithStatus[]
  onComplete: (id: number) => void
  currentUserName: string
}

export default function ComplianceSection({
  category,
  icon,
  items,
  onComplete,
  currentUserName,
}: Props) {
  return (
    <section
      className="mb-8 animate-fade-in-down"
      role="region"
      aria-label={`${category} compliance items`}
    >
      {/* Section header */}
      <div className="flex items-center gap-3 mb-4 pb-3 border-b-[3px] border-sg-coral">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0"
          style={{ background: 'linear-gradient(135deg, #ed5e68 0%, #d13844 100%)' }}
          aria-hidden="true"
        >
          {icon}
        </div>
        <h2 className="text-lg font-bold text-sg-navy tracking-tight">{category}</h2>
      </div>

      {/* Items */}
      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <ComplianceItem key={item.id} item={item} onComplete={onComplete} currentUserName={currentUserName} />
        ))}
      </div>
    </section>
  )
}
