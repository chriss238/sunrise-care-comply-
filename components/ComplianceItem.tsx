'use client'

import { useState, useEffect, useCallback } from 'react'
import type { ItemWithStatus } from '@/lib/types'
import { formatSgDate } from '@/lib/utils'
import ReminderModal, { loadReminder } from './ReminderModal'

interface Props {
  item: ItemWithStatus
  onComplete: (id: number) => void
}

const STATUS_BORDER: Record<string, string> = {
  overdue: 'border-l-sg-red',
  soon:    'border-l-sg-amber',
  ok:      'border-l-sg-green',
}

const STATUS_BADGE: Record<string, { bg: string; text: string; border: string }> = {
  overdue: { bg: 'bg-red-50',    text: 'text-sg-red',   border: 'border-sg-red' },
  soon:    { bg: 'bg-yellow-50', text: 'text-amber-600', border: 'border-sg-amber' },
  ok:      { bg: 'bg-green-50',  text: 'text-sg-green', border: 'border-sg-green' },
}

export default function ComplianceItem({ item, onComplete }: Props) {
  const [completing, setCompleting]     = useState(false)
  const [showReminder, setShowReminder] = useState(false)
  const [hasReminder, setHasReminder]   = useState(false)
  const isCompleted = item.completedAt !== null

  useEffect(() => {
    setHasReminder(!!loadReminder(item.id))
  }, [item.id])

  const handleReminderClose = useCallback(() => {
    setShowReminder(false)
    setHasReminder(!!loadReminder(item.id))
  }, [item.id])

  const days = item.daysUntil
  const statusText =
    item.status === 'overdue'
      ? `Overdue ${Math.abs(days)}d`
      : `${days}d left`

  const badge = STATUS_BADGE[item.status]

  async function handleComplete() {
    if (isCompleted || completing) return
    setCompleting(true)
    onComplete(item.id)
    try {
      await fetch(`/api/items/${item.id}/complete`, { method: 'POST' })
      // Persist to localStorage as a resilience layer
      try {
        const saved = JSON.parse(localStorage.getItem('nhCompletions') || '{}')
        saved[item.id] = { completedAt: new Date().toISOString(), completedBy: 'Staff' }
        localStorage.setItem('nhCompletions', JSON.stringify(saved))
      } catch { /* storage quota or private browsing */ }
    } catch {
      // optimistic update already applied; silently ignore network errors
    } finally {
      setCompleting(false)
    }
  }

  return (
    <div
      className={[
        'compliance-item-base',
        `compliance-item-${item.status}`,
        'bg-white border-2 border-gray-200 border-l-4 rounded-xl px-5 py-4',
        'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3',
        'transition-all duration-200 hover:border-[var(--item-color)] hover:shadow-md hover:translate-x-1',
        STATUS_BORDER[item.status],
        isCompleted ? 'opacity-60 bg-gray-50' : '',
      ].join(' ')}
    >
      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-sg-navy leading-snug mb-1.5">
          {item.itemName}
        </h3>
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
          <span>📅 Due: {formatSgDate(item.dueDate)}</span>
          {isCompleted && (
            <span className="inline-flex items-center gap-1 bg-sg-green text-white px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wide">
              ✓ Completed
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 shrink-0">
        <div
          className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border-2 whitespace-nowrap ${badge.bg} ${badge.text} ${badge.border}`}
          aria-label={`Status: ${statusText}`}
        >
          {statusText}
        </div>

        {/* Bell / reminder button */}
        <button
          onClick={() => setShowReminder(true)}
          aria-label={hasReminder ? 'Edit reminders (active)' : 'Set reminder'}
          title={hasReminder ? 'Reminders active' : 'Set reminder'}
          className="relative w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200 hover:scale-110 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-sg-navy"
          style={{ color: hasReminder ? '#ed5e68' : undefined }}
        >
          <span className="text-base">{hasReminder ? '🔔' : '🔕'}</span>
          {hasReminder && (
            <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full border border-white" style={{ background: '#ed5e68' }} />
          )}
        </button>

        <button
          onClick={handleComplete}
          disabled={isCompleted || completing}
          aria-label={`Mark ${item.itemName} as complete`}
          className={[
            'px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200',
            'focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-sg-navy',
            isCompleted || completing
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-sg-navy text-white hover:bg-sg-navy-dark hover:-translate-y-0.5 hover:shadow-md active:translate-y-0',
          ].join(' ')}
        >
          {isCompleted ? 'Completed' : completing ? 'Saving…' : 'Complete'}
        </button>
      </div>

      {showReminder && (
        <ReminderModal
          item={{ id: item.id, itemName: item.itemName, dueDate: item.dueDate }}
          onClose={handleReminderClose}
        />
      )}
    </div>
  )
}
