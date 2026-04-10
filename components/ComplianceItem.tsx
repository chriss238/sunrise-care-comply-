'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { ItemWithStatus, AttachmentSummary } from '@/lib/types'
import { formatSgDate } from '@/lib/utils'
import ReminderModal, { loadReminder } from './ReminderModal'

interface Props {
  item: ItemWithStatus
  onComplete: (id: number) => void
  onUpdate: (id: number, fields: Partial<ItemWithStatus>) => void
  currentUserName: string
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

export default function ComplianceItem({ item, onComplete, onUpdate, currentUserName }: Props) {
  const [completing, setCompleting]     = useState(false)
  const [showReminder, setShowReminder] = useState(false)
  const [hasReminder, setHasReminder]   = useState(false)
  const [attachments, setAttachments]   = useState<AttachmentSummary[]>(item.attachments)
  const [uploading, setUploading]       = useState(false)
  const [uploadError, setUploadError]   = useState<string | null>(null)
  const [editing, setEditing]           = useState(false)
  const [editName, setEditName]         = useState(item.itemName)
  const [editDate, setEditDate]         = useState(item.dueDate.slice(0, 10))
  const [editNotes, setEditNotes]       = useState(item.notes ?? '')
  const [saving, setSaving]             = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
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
        saved[item.id] = { completedAt: new Date().toISOString(), completedBy: currentUserName }
        localStorage.setItem('nhCompletions', JSON.stringify(saved))
      } catch { /* storage quota or private browsing */ }
    } catch {
      // optimistic update already applied; silently ignore network errors
    } finally {
      setCompleting(false)
    }
  }

  async function handleSaveEdit() {
    if (!editName.trim() || !editDate) return
    setSaving(true)
    try {
      await fetch(`/api/items/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemName: editName.trim(), dueDate: editDate, notes: editNotes }),
      })
      const days = Math.ceil((new Date(editDate).getTime() - Date.now()) / 86400000)
      const status = days < 0 ? 'overdue' : days <= 30 ? 'soon' : 'ok'
      onUpdate(item.id, { itemName: editName.trim(), dueDate: editDate, notes: editNotes, status, daysUntil: days })
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadError(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('complianceItemId', String(item.id))
      const res = await fetch('/api/upload-attachment', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) {
        setUploadError(data.error ?? 'Upload failed')
      } else {
        setAttachments((prev) => [...prev, data as AttachmentSummary])
      }
    } catch {
      setUploadError('Upload failed — please try again')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  if (editing) {
    return (
      <div className="bg-blue-50 border-2 border-blue-300 rounded-xl px-5 py-4 flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="Item name"
            autoFocus
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
          />
          <input
            type="date"
            value={editDate}
            onChange={(e) => setEditDate(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
          />
        </div>
        <input
          type="text"
          value={editNotes}
          onChange={(e) => setEditNotes(e.target.value)}
          placeholder="Notes (optional)"
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
        />
        <div className="flex gap-2 justify-end">
          <button
            onClick={handleSaveEdit}
            disabled={!editName.trim() || !editDate || saving}
            className="px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider text-white disabled:opacity-50 transition-all"
            style={{ background: 'linear-gradient(135deg, #1f2d5c 0%, #151f42 100%)' }}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button
            onClick={() => { setEditing(false); setEditName(item.itemName); setEditDate(item.dueDate.slice(0, 10)); setEditNotes(item.notes ?? '') }}
            className="px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    )
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
          {item.notes && <span className="text-gray-400">· {item.notes}</span>}
          {isCompleted && (
            <span className="inline-flex items-center gap-1 bg-sg-green text-white px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wide">
              ✓ Completed
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <div
          className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border-2 whitespace-nowrap ${badge.bg} ${badge.text} ${badge.border}`}
          aria-label={`Status: ${statusText}`}
        >
          {statusText}
        </div>

        {/* Edit button */}
        <button
          onClick={() => setEditing(true)}
          aria-label="Edit item"
          title="Edit item"
          className="w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200 hover:scale-110 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-sg-navy text-gray-400 hover:text-sg-navy"
        >
          <span className="text-base">✏️</span>
        </button>

        {/* Upload evidence button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          aria-label="Upload evidence document"
          title="Upload evidence (PDF, JPG, PNG — max 5MB)"
          className="relative w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200 hover:scale-110 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-sg-navy disabled:opacity-50"
        >
          <span className="text-base">{uploading ? '⏳' : attachments.length > 0 ? '📎' : '📄'}</span>
          {attachments.length > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center"
              style={{ background: '#1f2d5c' }}
            >
              {attachments.length}
            </span>
          )}
        </button>

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

      {/* Attachments row */}
      {(attachments.length > 0 || uploadError) && (
        <div className="w-full mt-1 flex flex-wrap items-center gap-2 text-xs">
          {attachments.map((a) => (
            <a
              key={a.id}
              href={a.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            >
              📎 {a.filename}
            </a>
          ))}
          {uploadError && (
            <span className="text-red-600">{uploadError}</span>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
        onChange={handleFileChange}
      />

      {showReminder && (
        <ReminderModal
          item={{ id: item.id, itemName: item.itemName, dueDate: item.dueDate }}
          onClose={handleReminderClose}
        />
      )}
    </div>
  )
}
