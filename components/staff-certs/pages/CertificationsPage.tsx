'use client'

import { useState, useEffect, useMemo } from 'react'
import NurseStatusBadge from '../shared/NurseStatusBadge'
import type { NurseCertRow, NurseCertStatus } from '@/lib/staff-certs'
import { calculateNurseCertStatus, formatSgDate } from '@/lib/staff-certs'

const CERT_TYPES = ['All Types', 'RN Practicing Certificate', 'EN Practicing Certificate', 'BLS Certification', 'CPR Certification', 'Wound Care Certificate', 'Dementia Care Certificate', 'First Aid Certificate', 'Medication Management', 'Infection Control', 'Other']

export default function CertificationsPage() {
  const [certs, setCerts] = useState<NurseCertRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<NurseCertStatus | 'all'>('all')
  const [filterType, setFilterType] = useState('All Types')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  useEffect(() => {
    fetch('/api/staff-certs/certifications')
      .then((r) => r.json())
      .then((raw: any[]) => {
        const withStatus: NurseCertRow[] = raw.map((c) => {
          const { status, label, days } = calculateNurseCertStatus(c.expiryDate)
          return { ...c, status, statusLabel: label, days }
        })
        setCerts(withStatus)
        setLoading(false)
      })
  }, [])

  const filtered = useMemo(() => {
    return certs
      .filter((c) => {
        if (filterStatus !== 'all' && c.status !== filterStatus) return false
        if (filterType !== 'All Types' && c.certType !== filterType) return false
        if (search) {
          const q = search.toLowerCase()
          return c.holderName.toLowerCase().includes(q) || c.certNumber.toLowerCase().includes(q) || c.certType.toLowerCase().includes(q)
        }
        return true
      })
      .sort((a, b) => {
        const diff = new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
        return sortDir === 'asc' ? diff : -diff
      })
  }, [certs, filterStatus, filterType, search, sortDir])

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4 flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Search name, cert # or type…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-48 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#1e2a4a] focus:ring-2 focus:ring-[#1e2a4a]/10"
        />
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as NurseCertStatus | 'all')} className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#1e2a4a] bg-white">
          <option value="all">All statuses</option>
          <option value="expired">Expired</option>
          <option value="expiring">Expiring Soon</option>
          <option value="pending_renewal">Pending Renewal</option>
          <option value="valid">Valid</option>
        </select>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#1e2a4a] bg-white">
          {CERT_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400 animate-pulse">Loading certifications…</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Cert Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Holder</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Cert #</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Issuing Body</th>
                <th className="text-left px-4 py-3 cursor-pointer text-xs font-semibold uppercase tracking-wider text-gray-500 hover:text-gray-900 select-none" onClick={() => setSortDir((d) => d === 'asc' ? 'desc' : 'asc')}>
                  Expiry {sortDir === 'asc' ? '↑' : '↓'}
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">No certifications match your filters.</td></tr>
              ) : filtered.map((cert) => (
                <tr key={cert.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-gray-900">{cert.certType}</td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-gray-900">{cert.holderName}</div>
                    {cert.nurse && <div className="text-xs text-gray-400">{cert.nurse.role}</div>}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{cert.certNumber}</td>
                  <td className="px-4 py-3 text-gray-600">{cert.issuingBody}</td>
                  <td className="px-4 py-3">
                    <div className="text-gray-900">{formatSgDate(cert.expiryDate)}</div>
                    <div className={`text-xs ${cert.days < 0 ? 'text-red-500' : cert.days <= 30 ? 'text-orange-500' : 'text-gray-400'}`}>
                      {cert.days < 0 ? `${Math.abs(cert.days)}d overdue` : `${cert.days}d left`}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <NurseStatusBadge status={cert.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="text-xs text-gray-400">{filtered.length} of {certs.length} certifications</div>
    </div>
  )
}
