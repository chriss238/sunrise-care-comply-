'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { CertWithStatus } from '@/lib/certifications'
import { getCertStatus } from '@/lib/certifications'

interface MockCert {
  type: string
  holderName: string
  certNumber: string
  issuingBody: string
  expiryDate: string
  category: string
}

const MOCK_PROVIDERS: Record<string, MockCert[]> = {
  'HMI Institute': [
    {
      type: 'BLS Certification',
      holderName: 'Alice Ng',
      certNumber: 'HMI-BLS-2026-0123',
      issuingBody: 'HMI Institute of Health Sciences',
      expiryDate: '2026-08-15',
      category: 'Staff',
    },
    {
      type: 'Infection Control Course',
      holderName: 'David Tan',
      certNumber: 'HMI-ICC-2026-0124',
      issuingBody: 'HMI Institute of Health Sciences',
      expiryDate: '2026-09-20',
      category: 'Staff',
    },
  ],
  'Ren Ci Learning Academy': [
    {
      type: 'Dementia Care Training',
      holderName: 'Sarah Lim',
      certNumber: 'RC-DCT-2026-0089',
      issuingBody: 'Ren Ci Hospital Training Centre',
      expiryDate: '2026-07-10',
      category: 'Staff',
    },
  ],
  'AIC CCLMS': [
    {
      type: 'Wound Care Management',
      holderName: 'Michael Wong',
      certNumber: 'AIC-WCM-2026-0234',
      issuingBody: 'Agency for Integrated Care',
      expiryDate: '2026-11-30',
      category: 'Staff',
    },
    {
      type: 'Palliative Care Certificate',
      holderName: 'Jenny Ong',
      certNumber: 'AIC-PCC-2026-0235',
      issuingBody: 'Agency for Integrated Care',
      expiryDate: '2026-10-05',
      category: 'Staff',
    },
  ],
}

interface Props {
  facilityId: number
  onClose: () => void
  onImport: (certs: CertWithStatus[]) => void
}

let nextMockId = -1 // negative IDs mark in-memory imported certs

export default function ImportProviderModal({ facilityId, onClose, onImport }: Props) {
  const [provider, setProvider]           = useState('HMI Institute')
  const [status, setStatus]               = useState<'idle' | 'loading' | 'success'>('idle')
  const [loadingMsg, setLoadingMsg]       = useState('')
  const [importedCerts, setImportedCerts] = useState<MockCert[]>([])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  async function handleImport() {
    setStatus('loading')
    setLoadingMsg(`Connecting to ${provider}…`)

    await new Promise((r) => setTimeout(r, 900))
    setLoadingMsg('Fetching latest certifications…')
    await new Promise((r) => setTimeout(r, 900))

    const mocks = MOCK_PROVIDERS[provider] ?? []
    setImportedCerts(mocks)

    // Build CertWithStatus objects (in-memory only, no API call)
    const now = new Date().toISOString()
    const certObjs: CertWithStatus[] = mocks.map((m) => {
      const { status: s, label, days } = getCertStatus(m.expiryDate)
      return {
        id:           nextMockId--,
        facilityId,
        category:     m.category,
        type:         m.type,
        holderName:   m.holderName,
        certNumber:   m.certNumber,
        issuingBody:  m.issuingBody,
        issueDate:    null,
        expiryDate:   m.expiryDate,
        renewalDate:  null,
        notes:        `[Imported from ${provider}]`,
        attachmentUrl: null,
        createdAt:    now,
        updatedAt:    now,
        status:       s,
        statusLabel:  label,
        days,
      }
    })

    onImport(certObjs)
    setStatus('success')
  }

  function formatExpiry(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-SG', {
      day: 'numeric', month: 'short', year: 'numeric',
    })
  }

  const modalContent = (
    <div
      className="animate-fade-in fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => { if (e.target === e.currentTarget && status !== 'loading') onClose() }}
      role="dialog"
      aria-modal="true"
      aria-label="Import from Training Provider"
    >
      <div className="animate-slide-up bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-sg-navy">Import Staff Certifications</h2>
            <p className="text-sm text-gray-500 mt-0.5">Import records from a registered training provider</p>
          </div>
          {status !== 'loading' && (
            <button
              onClick={onClose}
              aria-label="Close"
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          {status === 'idle' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5">
                  Select Training Provider
                </label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-sg-navy focus:ring-2 focus:ring-sg-navy/10 bg-white"
                >
                  {Object.keys(MOCK_PROVIDERS).map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                  <option value="Manual Upload">Manual Upload</option>
                </select>
              </div>
              <p className="text-xs text-gray-400">
                {MOCK_PROVIDERS[provider]?.length ?? 0} records available from {provider}
              </p>
            </div>
          )}

          {status === 'loading' && (
            <div className="flex flex-col items-center py-6 gap-4">
              <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-sg-navy animate-spin" />
              <p className="text-sm font-semibold text-sg-navy">{loadingMsg}</p>
              <p className="text-xs text-gray-400">Please wait…</p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sg-green">
                <span className="text-2xl">✅</span>
                <div>
                  <p className="text-sm font-bold">Import Successful</p>
                  <p className="text-xs text-gray-500">
                    {importedCerts.length} certification{importedCerts.length !== 1 ? 's' : ''} imported from {provider}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {importedCerts.map((c, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                    <div
                      className="w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5"
                      style={{ background: 'linear-gradient(135deg, #ff8087, #ed5e68)' }}
                    >
                      {c.holderName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-sg-navy">{c.type}</p>
                      <p className="text-xs text-gray-500">{c.holderName}</p>
                      <p className="text-xs text-gray-400 font-mono mt-0.5">{c.certNumber}</p>
                      <p className="text-xs text-gray-400">Expires: {formatExpiry(c.expiryDate)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {status !== 'loading' && (
          <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50 rounded-b-2xl">
            {status === 'idle' && (
              <>
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg hover:-translate-y-0.5 hover:shadow-md transition-all active:translate-y-0"
                  style={{ background: 'linear-gradient(135deg, #1f2d5c 0%, #151f42 100%)' }}
                >
                  <span>📥</span>
                  <span>Import Records</span>
                </button>
              </>
            )}
            {status === 'success' && (
              <button
                onClick={onClose}
                className="px-6 py-2 text-sm font-semibold text-white rounded-lg hover:-translate-y-0.5 hover:shadow-md transition-all"
                style={{ background: 'linear-gradient(135deg, #1f2d5c 0%, #151f42 100%)' }}
              >
                Done
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )

  if (typeof document === 'undefined') return null
  return createPortal(modalContent, document.body)
}
