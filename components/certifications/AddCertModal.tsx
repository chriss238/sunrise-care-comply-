'use client'

import { useEffect, useRef, useState } from 'react'
import type { CertWithStatus } from '@/lib/certifications'

interface Props {
  mode: 'add' | 'edit'
  cert?: CertWithStatus
  facilityId: number
  onClose: () => void
  onSave: (cert: CertWithStatus) => void
}

const inputClass = [
  'w-full px-3.5 py-3 border-2 border-gray-200 rounded-lg text-sm font-sans',
  'transition-all duration-200',
  'focus:outline-none focus:border-sg-navy focus:shadow-[0_0_0_3px_rgba(31,45,92,0.1)]',
].join(' ')

const labelClass = 'block text-sm font-semibold text-gray-900 mb-2'

export default function AddCertModal({ mode, cert, facilityId, onClose, onSave }: Props) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const firstInputRef = useRef<HTMLSelectElement>(null)

  useEffect(() => {
    firstInputRef.current?.focus()
  }, [])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSaving(true)

    const form = e.currentTarget
    const get = (id: string) => (form.elements.namedItem(id) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)?.value ?? ''

    const body = {
      facilityId,
      category:    get('category'),
      type:        get('type'),
      holderName:  get('holderName'),
      certNumber:  get('certNumber') || null,
      issuingBody: get('issuingBody'),
      issueDate:   get('issueDate') || null,
      expiryDate:  get('expiryDate'),
      renewalDate: get('renewalDate') || null,
      notes:       get('notes') || null,
    }

    try {
      const url  = mode === 'edit' && cert ? `/api/certifications/${cert.id}` : '/api/certifications'
      const method = mode === 'edit' ? 'PATCH' : 'POST'
      const res  = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error(await res.text())
      const saved = await res.json()
      onSave(saved)
    } catch {
      setError('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const title = mode === 'add' ? 'Add New Certification' : 'Edit Certification'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="animate-slide-up bg-white rounded-xl shadow-2xl w-[90%] max-w-2xl max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b-2 border-gray-200">
          <h2 className="text-xl font-bold text-sg-navy">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-md bg-gray-100 text-gray-500 text-xl flex items-center justify-center transition-colors hover:bg-sg-red hover:text-white focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-sg-navy"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form id="cert-form" onSubmit={handleSubmit}>
          <div className="px-6 py-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Category */}
            <div>
              <label htmlFor="category" className={labelClass}>
                Category <span className="text-sg-red">*</span>
              </label>
              <select id="category" name="category" required ref={firstInputRef} defaultValue={cert?.category ?? ''} className={inputClass}>
                <option value="">Select category</option>
                <option value="Staff">Staff</option>
                <option value="Facility">Facility</option>
                <option value="Equipment">Equipment</option>
              </select>
            </div>

            {/* Type */}
            <div>
              <label htmlFor="type" className={labelClass}>
                Type <span className="text-sg-red">*</span>
              </label>
              <input id="type" name="type" type="text" required placeholder="e.g., RN Practicing Certificate" defaultValue={cert?.type ?? ''} className={inputClass} />
            </div>

            {/* Holder Name — full width */}
            <div className="sm:col-span-2">
              <label htmlFor="holderName" className={labelClass}>
                Holder Name <span className="text-sg-red">*</span>
              </label>
              <input id="holderName" name="holderName" type="text" required placeholder="e.g., Mary Tan or Sunrise Care Home" defaultValue={cert?.holderName ?? ''} className={inputClass} />
            </div>

            {/* Cert Number */}
            <div>
              <label htmlFor="certNumber" className={labelClass}>Cert Number</label>
              <input id="certNumber" name="certNumber" type="text" placeholder="e.g., RN-2024-1234" defaultValue={cert?.certNumber ?? ''} className={`${inputClass} font-mono`} />
            </div>

            {/* Issuing Body */}
            <div>
              <label htmlFor="issuingBody" className={labelClass}>
                Issuing Body <span className="text-sg-red">*</span>
              </label>
              <select id="issuingBody" name="issuingBody" required defaultValue={cert?.issuingBody ?? ''} className={inputClass}>
                <option value="">Select issuing body</option>
                <option value="SNB">SNB (Singapore Nursing Board)</option>
                <option value="SRFAC">SRFAC (Singapore Resuscitation &amp; First Aid Council)</option>
                <option value="MOH">MOH (Ministry of Health)</option>
                <option value="SCDF">SCDF (Singapore Civil Defence Force)</option>
                <option value="HSA">HSA (Health Sciences Authority)</option>
                <option value="SFA">SFA (Singapore Food Agency)</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Issue Date */}
            <div>
              <label htmlFor="issueDate" className={labelClass}>Issue Date</label>
              <input id="issueDate" name="issueDate" type="date" defaultValue={cert?.issueDate ? cert.issueDate.slice(0, 10) : ''} className={inputClass} />
            </div>

            {/* Expiry Date */}
            <div>
              <label htmlFor="expiryDate" className={labelClass}>
                Expiry Date <span className="text-sg-red">*</span>
              </label>
              <input id="expiryDate" name="expiryDate" type="date" required defaultValue={cert?.expiryDate ? cert.expiryDate.slice(0, 10) : ''} className={inputClass} />
            </div>

            {/* Renewal Date */}
            <div>
              <label htmlFor="renewalDate" className={labelClass}>Renewal Date</label>
              <input id="renewalDate" name="renewalDate" type="date" defaultValue={cert?.renewalDate ? cert.renewalDate.slice(0, 10) : ''} className={inputClass} />
            </div>

            {/* Notes — full width */}
            <div className="sm:col-span-2">
              <label htmlFor="notes" className={labelClass}>Notes</label>
              <textarea id="notes" name="notes" rows={3} placeholder="Additional notes…" defaultValue={cert?.notes ?? ''} className={`${inputClass} resize-y`} />
            </div>
          </div>

          {error && (
            <p className="px-6 pb-4 text-sm text-sg-red font-medium" role="alert">{error}</p>
          )}

          {/* Footer */}
          <div className="flex gap-3 justify-end px-6 py-5 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-lg text-sm font-semibold bg-gray-200 text-gray-900 hover:bg-gray-300 transition-colors focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-sg-navy"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-lg text-sm font-semibold bg-sg-navy text-white hover:bg-sg-navy-dark hover:-translate-y-0.5 hover:shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-sg-navy"
            >
              {saving ? 'Saving…' : 'Save Certification'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
