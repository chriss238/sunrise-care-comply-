'use client'

import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'

export interface ReminderItem {
  id: number
  itemName: string
  dueDate: string
}

interface ReminderSettings {
  days: number[]
  email: string
  extraEmail: string
}

interface Props {
  item: ReminderItem
  onClose: () => void
}

const STORAGE_KEY = 'nhReminders'

export function loadReminder(id: number): ReminderSettings | null {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    return all[id] ?? null
  } catch {
    return null
  }
}

function saveReminder(id: number, settings: ReminderSettings) {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    all[id] = settings
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  } catch { /* quota */ }
}

function clearReminder(id: number) {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    delete all[id]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  } catch { /* quota */ }
}

function reminderDate(dueDate: string, daysBefore: number): string {
  const d = new Date(dueDate)
  d.setDate(d.getDate() - daysBefore)
  return d.toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function ReminderModal({ item, onClose }: Props) {
  const [days, setDays]             = useState<number[]>([30, 60, 90])
  const [email, setEmail]           = useState('admin@sunrisecare.com.sg')
  const [extraEmail, setExtraEmail] = useState('')

  useEffect(() => {
    const existing = loadReminder(item.id)
    if (existing) {
      setDays(existing.days)
      setEmail(existing.email)
      setExtraEmail(existing.extraEmail)
    }
  }, [item.id])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  function toggleDay(d: number) {
    setDays((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort((a, b) => a - b))
  }

  function handleSave() {
    if (days.length > 0) {
      saveReminder(item.id, { days, email, extraEmail })
    } else {
      clearReminder(item.id)
    }
    onClose()
  }

  function handleClear() {
    clearReminder(item.id)
    onClose()
  }

  const dueLabel = new Date(item.dueDate).toLocaleDateString('en-SG', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  const modalContent = (
    <div
      className="animate-fade-in fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      role="dialog"
      aria-modal="true"
      aria-label="Expiry Reminder Settings"
    >
      <div className="animate-slide-up bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-sg-navy leading-snug">Expiry Reminder Settings</h2>
            <p className="text-sm text-gray-500 mt-0.5 truncate">{item.itemName}</p>
            <p className="text-xs text-gray-400 mt-0.5">Due: {dueLabel}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors shrink-0 mt-0.5"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Intervals */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">
              Send reminder before expiry
            </p>
            <div className="space-y-2.5">
              {[30, 60, 90].map((d) => (
                <label key={d} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={days.includes(d)}
                    onChange={() => toggleDay(d)}
                    className="w-4 h-4 accent-sg-navy rounded cursor-pointer"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-sg-navy transition-colors">
                    <span className="font-semibold">{d} days before</span>
                    <span className="text-gray-400 ml-2">({reminderDate(item.dueDate, d)})</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Primary email */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5">
              Send to
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-sg-navy focus:ring-2 focus:ring-sg-navy/10"
              placeholder="admin@sunrisecare.com.sg"
            />
          </div>

          {/* Extra email */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5">
              Additional recipient <span className="font-normal normal-case text-gray-400">(optional)</span>
            </label>
            <input
              type="email"
              value={extraEmail}
              onChange={(e) => setExtraEmail(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-sg-navy focus:ring-2 focus:ring-sg-navy/10"
              placeholder="supervisor@sunrisecare.com.sg"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3 bg-gray-50 rounded-b-2xl">
          <button
            onClick={handleClear}
            className="text-xs font-semibold text-gray-400 hover:text-sg-red transition-colors"
          >
            Clear reminders
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-semibold text-white rounded-lg hover:-translate-y-0.5 hover:shadow-md transition-all active:translate-y-0 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-sg-navy"
              style={{ background: 'linear-gradient(135deg, #1f2d5c 0%, #151f42 100%)' }}
            >
              Save Reminders
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  if (typeof document === 'undefined') return null
  return createPortal(modalContent, document.body)
}
