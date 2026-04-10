'use client'

import { useState, useMemo, useRef } from 'react'
import TopBar from './TopBar'
import type { ItemWithStatus, FilterType, FacilitySummary } from '@/lib/types'
import { formatSgDate } from '@/lib/utils'
import { generateMOHAuditReport } from '@/lib/pdf-export'
import StatsGrid from './StatsGrid'
import FilterButtons from './FilterButtons'
import ComplianceSection from './ComplianceSection'
import OverdueAlertBanner from './OverdueAlertBanner'
import Tabs from './Tabs'

interface Props {
  facility: FacilitySummary
  initialItems: ItemWithStatus[]
  currentUserName: string
  facilityId: number
}

const CATEGORY_ICONS: Record<string, string> = {
  'Staff certifications': '👨‍⚕️',
  'MOH licensing':        '📋',
  'Facility audits':      '🏢',
  'Medication protocols': '💊',
  'Resident care plans':  '📝',
}

const CATEGORY_FILTER_MAP: Partial<Record<FilterType, string>> = {
  staff:      'Staff certifications',
  facility:   'Facility audits',
  medication: 'Medication protocols',
}

export default function Dashboard({ facility, initialItems, currentUserName, facilityId }: Props) {
  const [items, setItems] = useState<ItemWithStatus[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('nhCompletions') || '{}')
      return initialItems.map((i) =>
        saved[i.id]
          ? { ...i, completedAt: saved[i.id].completedAt, completedBy: saved[i.id].completedBy }
          : i
      )
    } catch {
      return initialItems
    }
  })
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const [addingToCategory, setAddingToCategory] = useState<string | null>(null)
  const complianceRef = useRef<HTMLDivElement>(null)

  function handleBannerClick() {
    setActiveFilter('overdue')
    setTimeout(() => {
      complianceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }

  async function handleGeneratePdf() {
    if (generatingPdf) return
    setGeneratingPdf(true)
    try {
      await generateMOHAuditReport(items, facility)
    } finally {
      setGeneratingPdf(false)
    }
  }

  function handleComplete(id: number) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, completedAt: new Date().toISOString(), completedBy: currentUserName }
          : item
      )
    )
  }

  function handleUpdate(id: number, fields: Partial<ItemWithStatus>) {
    setItems((prev) => prev.map((item) => item.id === id ? { ...item, ...fields } : item))
  }

  async function handleAddItem(category: string, itemName: string, dueDate: string) {
    const res = await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ facilityId, category, itemName, dueDate }),
    })
    if (!res.ok) return
    const newItem = await res.json()
    // Re-compute status client-side (mirror server logic)
    const days = Math.ceil((new Date(dueDate).getTime() - Date.now()) / 86400000)
    const status = days < 0 ? 'overdue' : days <= 30 ? 'soon' : 'ok'
    setItems((prev) => [...prev, { ...newItem, status, daysUntil: days, attachments: [] }])
    setAddingToCategory(null)
  }

  // Stats always reflect the full item list, not the filtered view
  const stats = useMemo(() => {
    const active = items.filter((i) => !i.completedAt)
    return {
      total:   items.length,
      overdue: active.filter((i) => i.status === 'overdue').length,
      soon:    active.filter((i) => i.status === 'soon').length,
      ok:      active.filter((i) => i.status === 'ok').length,
    }
  }, [items])

  const overdueItems = useMemo(
    () => items.filter((i) => i.status === 'overdue' && !i.completedAt),
    [items]
  )
  const overdueCount = overdueItems.length
  const criticalItems = useMemo(
    () => overdueItems
      .filter((i) => i.category === 'Staff certifications' && i.daysUntil < -30)
      .map((i) => i.itemName),
    [overdueItems]
  )

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (activeFilter === 'all')     return true
      if (activeFilter === 'overdue') return item.status === 'overdue' && !item.completedAt
      if (activeFilter === 'soon')    return item.status === 'soon'    && !item.completedAt
      const category = CATEGORY_FILTER_MAP[activeFilter]
      if (category) return item.category === category
      return true
    })
  }, [items, activeFilter])

  const grouped = useMemo(() => {
    const map = new Map<string, ItemWithStatus[]>()
    for (const item of filteredItems) {
      const arr = map.get(item.category) ?? []
      arr.push(item)
      map.set(item.category, arr)
    }
    return Array.from(map.entries())
  }, [filteredItems])

  return (
    <>
      <OverdueAlertBanner
        overdueCount={overdueCount}
        criticalItems={criticalItems}
        onClickFilter={handleBannerClick}
      />

      {/* ── Header ── */}
      <header
        className="relative overflow-hidden header-glow"
        style={{ background: 'linear-gradient(135deg, #151f42 0%, #1f2d5c 100%)' }}
      >
        <TopBar />

        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-6 relative z-10">
          {/* Top row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #ed5e68 0%, #d13844 100%)',
                  boxShadow: '0 4px 12px rgba(237,94,104,0.3)',
                }}
                aria-hidden="true"
              >
                🏥
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  {facility.name}
                </h1>
                <div className="flex items-center gap-1.5 text-sm text-white/85 font-medium mt-0.5">
                  <span>License:</span>
                  <span
                    className="px-2.5 py-0.5 rounded-md text-[13px] border border-white/20"
                    style={{ background: 'rgba(255,255,255,0.15)' }}
                  >
                    {facility.mohLicense}
                  </span>
                </div>
              </div>
            </div>

            <div className="sm:text-right">
              <div className="text-xs uppercase tracking-widest text-white/75 font-semibold mb-1">
                Last MOH Audit
              </div>
              <div className="text-lg font-bold text-white">
                {formatSgDate(facility.lastAuditDate)}
              </div>
            </div>
          </div>

          {/* Stats + PDF button */}
          <div aria-live="polite" aria-label="Compliance statistics">
            <StatsGrid stats={stats} />
          </div>
          <div className="mt-3 flex justify-end">
            <button
              onClick={handleGeneratePdf}
              disabled={generatingPdf}
              aria-label="Generate MOH Audit Report PDF"
              className={[
                'flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all',
                'focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-white/50',
                generatingPdf
                  ? 'bg-white/20 text-white/50 cursor-not-allowed'
                  : 'bg-white/15 text-white hover:bg-white/25 border border-white/20',
              ].join(' ')}
            >
              <span>📄</span>
              <span>{generatingPdf ? 'Generating…' : 'Generate MOH Audit Report'}</span>
            </button>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <Tabs />
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        {/* Filter bar */}
        <div className="animate-fade-in-down bg-white rounded-xl px-6 py-4 mb-6 shadow-sm border border-gray-200">
          <div className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">
            Filter by
          </div>
          <FilterButtons activeFilter={activeFilter} onFilterChange={setActiveFilter} />
        </div>

        {/* Compliance sections */}
        <div ref={complianceRef} role="region" aria-live="polite" aria-label="Compliance items">
          {grouped.length === 0 ? (
            <div
              className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-16 text-center text-gray-500"
              role="status"
            >
              <div className="text-5xl mb-4 opacity-40" aria-hidden="true">📋</div>
              <p className="text-base font-medium">No compliance items match this filter.</p>
            </div>
          ) : (
            grouped.map(([category, categoryItems]) => (
              <ComplianceSection
                key={category}
                category={category}
                icon={CATEGORY_ICONS[category] ?? '📋'}
                items={categoryItems}
                onComplete={handleComplete}
                onUpdate={handleUpdate}
                onAddItem={handleAddItem}
                isAddingItem={addingToCategory === category}
                onStartAdd={() => setAddingToCategory(category)}
                onCancelAdd={() => setAddingToCategory(null)}
                currentUserName={currentUserName}
              />
            ))
          )}
        </div>
      </main>
    </>
  )
}
