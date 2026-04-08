'use client'

import type { FilterType } from '@/lib/types'

interface Props {
  activeFilter: FilterType
  onFilterChange: (filter: FilterType) => void
}

const FILTERS: { id: FilterType; label: string; ariaLabel: string }[] = [
  { id: 'all',        label: 'All Items',             ariaLabel: 'Show all compliance items' },
  { id: 'overdue',    label: 'Overdue',                ariaLabel: 'Show overdue items only' },
  { id: 'soon',       label: 'Due Soon',               ariaLabel: 'Show items due soon' },
  { id: 'staff',      label: 'Staff Certifications',   ariaLabel: 'Show staff certification items' },
  { id: 'facility',   label: 'Facility Audits',        ariaLabel: 'Show facility audit items' },
  { id: 'medication', label: 'Medication Protocols',   ariaLabel: 'Show medication protocol items' },
]

export default function FilterButtons({ activeFilter, onFilterChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter compliance items">
      {FILTERS.map(({ id, label, ariaLabel }) => {
        const isActive = activeFilter === id
        return (
          <button
            key={id}
            onClick={() => onFilterChange(id)}
            aria-label={ariaLabel}
            aria-pressed={isActive}
            className={[
              'px-4 py-2.5 rounded-lg text-sm font-semibold border-2 transition-all duration-200',
              'focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-sg-navy',
              isActive
                ? 'bg-sg-navy text-white border-sg-navy hover:bg-sg-navy-dark hover:border-sg-navy-dark'
                : 'bg-white text-gray-600 border-gray-200 hover:border-sg-navy-light hover:bg-gray-50 hover:-translate-y-px',
            ].join(' ')}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
