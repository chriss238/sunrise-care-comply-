'use client'

import { useState, useEffect, useCallback } from 'react'
import type { CertWithStatus } from '@/lib/certifications'
import { getInitials } from '@/lib/certifications'
import { formatSgDate } from '@/lib/utils'
import StatusBadge from './StatusBadge'
import ReminderModal, { loadReminder } from '@/components/ReminderModal'

interface Props {
  cert: CertWithStatus
  onEdit: (cert: CertWithStatus) => void
  onDelete: (cert: CertWithStatus) => void
}

export default function CertificationRow({ cert, onEdit, onDelete }: Props) {
  const daysLabel = cert.days >= 0 ? `${cert.days}d left` : `${Math.abs(cert.days)}d overdue`
  const [showReminder, setShowReminder] = useState(false)
  const [hasReminder, setHasReminder]   = useState(false)

  useEffect(() => {
    // Use a cert-specific key offset to avoid clashing with compliance item IDs
    setHasReminder(!!loadReminder(cert.id + 10000))
  }, [cert.id])

  const handleReminderClose = useCallback(() => {
    setShowReminder(false)
    setHasReminder(!!loadReminder(cert.id + 10000))
  }, [cert.id])

  return (
    <tr className="cert-row-hover border-b border-gray-200">
      {/* Type */}
      <td className="px-5 py-4 text-sm font-semibold text-sg-navy whitespace-nowrap">
        {cert.type}
      </td>

      {/* Holder */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-md flex items-center justify-center text-sm font-bold text-white shrink-0"
            style={{ background: 'linear-gradient(135deg, #ff8087, #ed5e68)' }}
            aria-hidden="true"
          >
            {getInitials(cert.holderName)}
          </div>
          <div>
            <div className="text-sm text-gray-900">{cert.holderName}</div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-0.5">
              {cert.issuingBody}
            </div>
          </div>
        </div>
      </td>

      {/* Cert number */}
      <td className="px-5 py-4 font-mono text-[13px] text-sg-navy font-medium">
        {cert.certNumber ?? '—'}
      </td>

      {/* Expiry */}
      <td className="px-5 py-4">
        <div className="text-sm font-medium text-gray-900">{formatSgDate(cert.expiryDate)}</div>
        <div className="text-xs text-gray-500 mt-0.5">{daysLabel}</div>
      </td>

      {/* Status */}
      <td className="px-5 py-4">
        <StatusBadge status={cert.status} label={cert.statusLabel} />
      </td>

      {/* Actions */}
      <td className="px-5 py-4">
        <div className="flex items-center justify-end gap-2">
          {/* Bell / reminder */}
          <button
            onClick={() => setShowReminder(true)}
            aria-label={hasReminder ? 'Edit reminders (active)' : 'Set reminder'}
            title={hasReminder ? 'Reminders active' : 'Set reminder'}
            className="relative w-8 h-8 rounded-md flex items-center justify-center text-base bg-gray-100 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-sg-navy"
          >
            <span>{hasReminder ? '🔔' : '🔕'}</span>
            {hasReminder && (
              <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full border border-white" style={{ background: '#ed5e68' }} />
            )}
          </button>

          <button
            onClick={() => onEdit(cert)}
            aria-label={`Edit ${cert.holderName} certification`}
            className={[
              'w-8 h-8 rounded-md flex items-center justify-center text-base bg-gray-100 text-sg-navy',
              'transition-all duration-200 hover:-translate-y-0.5 hover:bg-sg-navy hover:text-white hover:shadow-md',
              'focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-sg-navy',
            ].join(' ')}
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(cert)}
            aria-label={`Delete ${cert.holderName} certification`}
            className={[
              'w-8 h-8 rounded-md flex items-center justify-center text-base bg-gray-100 text-sg-red',
              'transition-all duration-200 hover:-translate-y-0.5 hover:bg-sg-red hover:text-white hover:shadow-md',
              'focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-sg-red',
            ].join(' ')}
          >
            🗑️
          </button>
        </div>
      </td>

      {showReminder && (
        <ReminderModal
          item={{
            id: cert.id + 10000,
            itemName: `${cert.type} — ${cert.holderName}`,
            dueDate: cert.expiryDate,
          }}
          onClose={handleReminderClose}
        />
      )}
    </tr>
  )
}
