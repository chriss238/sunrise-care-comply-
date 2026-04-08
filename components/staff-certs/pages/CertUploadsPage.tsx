'use client'

import { useState, useEffect } from 'react'
import ConfidenceMeter from '../shared/ConfidenceMeter'
import NurseAvatar from '../shared/NurseAvatar'
import type { CertUploadRow } from '@/lib/staff-certs'
import { formatRelativeTime } from '@/lib/staff-certs'

export default function CertUploadsPage() {
  const [uploads, setUploads] = useState<CertUploadRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')
  const [reviewing, setReviewing] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/staff-certs/cert-uploads')
      .then((r) => r.json())
      .then((d) => { setUploads(d); setLoading(false) })
  }, [])

  async function review(uploadId: number, status: 'approved' | 'rejected', notes?: string) {
    setReviewing(uploadId)
    const updated = await fetch(`/api/staff-certs/cert-uploads/${uploadId}/review`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewStatus: status, reviewNotes: notes ?? null }),
    }).then((r) => r.json())
    setUploads((prev) => prev.map((u) => u.id === updated.id ? { ...u, reviewStatus: updated.reviewStatus, approvedAt: updated.approvedAt } : u))
    setReviewing(null)
  }

  const filtered = filterStatus === 'all' ? uploads : uploads.filter((u) => u.reviewStatus === filterStatus)

  if (loading) return <div className="text-center py-12 text-gray-400 animate-pulse">Loading uploads…</div>

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4 flex flex-wrap items-center gap-3">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Certificate Uploads</h3>
        <div className="flex gap-2 ml-auto">
          {['all', 'pending', 'approved', 'rejected'].map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)} className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${filterStatus === s ? 'bg-[#1e2a4a] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-gray-500 font-medium">No uploads match this filter.</p>
        </div>
      )}

      {/* Review cards */}
      <div className="space-y-4">
        {filtered.map((upload) => {
          const extracted = upload.extractedData ? JSON.parse(upload.extractedData) : {}
          const isPending = upload.reviewStatus === 'pending'
          const isApproved = upload.reviewStatus === 'approved'

          return (
            <div key={upload.id} className={`bg-white rounded-xl border shadow-sm overflow-hidden ${isPending ? 'border-amber-200' : isApproved ? 'border-green-200' : 'border-red-200'}`}>
              {/* Status bar */}
              <div className={`px-5 py-2 flex items-center gap-3 text-xs font-bold ${isPending ? 'bg-amber-50 text-amber-800' : isApproved ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                <span>{isPending ? '⏳ Pending Review' : isApproved ? '✅ Approved' : '❌ Rejected'}</span>
                <span className="ml-auto font-normal opacity-70">via {upload.uploadMethod} · {formatRelativeTime(upload.createdAt)}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                {/* Left: certificate preview */}
                <div className="p-5 flex flex-col items-center gap-3">
                  <div className="w-full aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center">
                    <img
                      src={upload.fileUrl}
                      alt="Certificate"
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/300x400/e8f4f8/1e2a4a?text=Certificate' }}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <NurseAvatar name={upload.nurse?.name ?? '?'} size="sm" />
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{upload.nurse?.name}</div>
                      <div className="text-xs text-gray-400">{upload.nurse?.role}</div>
                    </div>
                  </div>
                </div>

                {/* Middle: extracted data */}
                <div className="p-5 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600">AI-Extracted Data</h4>
                  {upload.confidenceScore != null && <ConfidenceMeter score={upload.confidenceScore} />}
                  <div className="space-y-2">
                    {Object.entries(extracted).map(([key, val]) => (
                      <div key={key} className="flex justify-between gap-2 text-xs">
                        <span className="text-gray-500 font-semibold uppercase tracking-wide shrink-0">{key.replace(/_/g, ' ')}</span>
                        <span className="text-gray-900 font-mono text-right">{String(val)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: actions */}
                <div className="p-5 flex flex-col gap-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600">Actions</h4>
                  {isPending ? (
                    <>
                      <button
                        onClick={() => review(upload.id, 'approved')}
                        disabled={reviewing === upload.id}
                        className="w-full px-4 py-2.5 text-sm font-semibold text-white rounded-lg shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-60"
                        style={{ background: 'linear-gradient(135deg, #4caf50, #2e7d32)' }}
                      >
                        {reviewing === upload.id ? '…' : '✅ Approve'}
                      </button>
                      <button
                        onClick={() => review(upload.id, 'approved')}
                        disabled={reviewing === upload.id}
                        className="w-full px-4 py-2.5 text-sm font-semibold text-[#1e2a4a] bg-white border border-[#1e2a4a]/30 rounded-lg hover:bg-[#1e2a4a]/5 transition-all"
                      >
                        ✏️ Edit & Approve
                      </button>
                      <button
                        onClick={() => review(upload.id, 'rejected', 'Rejected by admin')}
                        disabled={reviewing === upload.id}
                        className="w-full px-4 py-2.5 text-sm font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-all"
                      >
                        ❌ Reject
                      </button>
                    </>
                  ) : (
                    <div className={`text-center py-4 rounded-lg ${isApproved ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                      <div className="text-2xl mb-1">{isApproved ? '✅' : '❌'}</div>
                      <div className="text-sm font-semibold">{isApproved ? 'Approved' : 'Rejected'}</div>
                      {upload.approvedAt && <div className="text-xs opacity-70 mt-1">{formatRelativeTime(upload.approvedAt)}</div>}
                    </div>
                  )}
                  <div className="mt-auto pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-400">Upload ID: #{upload.id}</p>
                    <p className="text-xs text-gray-400">OCR: {upload.ocrStatus}</p>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
