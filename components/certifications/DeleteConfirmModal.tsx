'use client'

import { useEffect, useState } from 'react'
import type { CertWithStatus } from '@/lib/certifications'
import { formatSgDate } from '@/lib/utils'

interface Props {
  cert: CertWithStatus
  onClose: () => void
  onConfirm: (id: number) => void
}

export default function DeleteConfirmModal({ cert, onClose, onConfirm }: Props) {
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  async function handleDelete() {
    setDeleting(true)
    try {
      await fetch(`/api/certifications/${cert.id}`, { method: 'DELETE' })
      onConfirm(cert.id)
    } catch {
      setDeleting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Delete certification confirmation"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="animate-slide-up bg-white rounded-xl shadow-2xl w-[90%] max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b-2 border-gray-200">
          <h2 className="text-xl font-bold text-sg-navy">Delete Certification</h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-md bg-gray-100 text-gray-500 text-xl flex items-center justify-center transition-colors hover:bg-sg-red hover:text-white focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-sg-navy"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          <p className="text-sm text-gray-700 mb-4">Are you sure you want to delete this certification?</p>
          <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-sg-red">
            <div className="font-semibold text-sg-navy mb-1">
              {cert.holderName} — {cert.certNumber ?? 'No cert number'}
            </div>
            <div className="text-sm text-gray-500">
              {cert.type} • Expires: {formatSgDate(cert.expiryDate)}
            </div>
          </div>
          <p className="mt-4 text-sm text-sg-red font-medium" role="alert">
            ⚠️ This action cannot be undone.
          </p>
        </div>

        {/* Footer */}
        <div className="flex gap-3 justify-end px-6 py-5 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-lg text-sm font-semibold bg-gray-200 text-gray-900 hover:bg-gray-300 transition-colors focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-sg-navy"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            aria-label={`Confirm delete ${cert.holderName} certification`}
            className="px-6 py-3 rounded-lg text-sm font-semibold bg-sg-red text-white hover:bg-red-800 hover:-translate-y-0.5 hover:shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-sg-red"
          >
            {deleting ? 'Deleting…' : 'Delete Certification'}
          </button>
        </div>
      </div>
    </div>
  )
}
