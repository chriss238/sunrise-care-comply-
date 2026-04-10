'use client'

import { useState } from 'react'

interface Props {
  category: string
  onSave: (itemName: string, dueDate: string) => Promise<void>
  onCancel: () => void
}

export default function NewItemForm({ category, onSave, onCancel }: Props) {
  const [itemName, setItemName] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!itemName.trim() || !dueDate) return
    setSaving(true)
    try {
      await onSave(itemName.trim(), dueDate)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
      <input
        type="text"
        value={itemName}
        onChange={(e) => setItemName(e.target.value)}
        placeholder="Item name…"
        autoFocus
        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
      />
      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
      />
      <div className="flex gap-2 shrink-0">
        <button
          onClick={handleSave}
          disabled={!itemName.trim() || !dueDate || saving}
          className="px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: 'linear-gradient(135deg, #1f2d5c 0%, #151f42 100%)' }}
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 transition-all"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
