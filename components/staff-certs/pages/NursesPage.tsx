'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import NurseAvatar from '../shared/NurseAvatar'
import type { NurseRow } from '@/lib/staff-certs'
import { LANGUAGE_LABELS, ROLE_COLORS } from '@/lib/staff-certs'

export default function NursesPage() {
  const router = useRouter()
  const [nurses, setNurses] = useState<NurseRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterOptIn, setFilterOptIn] = useState<'all' | 'yes' | 'no'>('all')
  const [filterLang, setFilterLang] = useState('all')

  useEffect(() => {
    fetch('/api/staff-certs/nurses')
      .then((r) => r.json())
      .then((d) => { setNurses(d); setLoading(false) })
  }, [])

  const filtered = useMemo(() => {
    return nurses.filter((n) => {
      if (search && !n.name.toLowerCase().includes(search.toLowerCase()) && !n.email.toLowerCase().includes(search.toLowerCase())) return false
      if (filterOptIn === 'yes' && !n.whatsappOptIn) return false
      if (filterOptIn === 'no' && n.whatsappOptIn) return false
      if (filterLang !== 'all' && n.preferredLanguage !== filterLang) return false
      return true
    })
  }, [nurses, search, filterOptIn, filterLang])

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4 flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Search name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-48 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#1e2a4a] focus:ring-2 focus:ring-[#1e2a4a]/10"
        />
        <select value={filterOptIn} onChange={(e) => setFilterOptIn(e.target.value as 'all'|'yes'|'no')} className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#1e2a4a] bg-white">
          <option value="all">All opt-in status</option>
          <option value="yes">WhatsApp opted in</option>
          <option value="no">Not opted in</option>
        </select>
        <select value={filterLang} onChange={(e) => setFilterLang(e.target.value)} className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#1e2a4a] bg-white">
          <option value="all">All languages</option>
          <option value="en">English</option>
          <option value="fil">Filipino</option>
          <option value="id">Indonesian</option>
        </select>
        <div className="flex-1" />
        <button
          onClick={() => alert('CSV import would open a file picker. Not yet implemented in prototype.')}
          className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 shadow-sm transition-all"
        >
          📥 Import CSV
        </button>
        <button
          onClick={() => router.push('/staff-certs/user-details')}
          className="px-4 py-2 text-sm font-semibold text-white rounded-lg shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
          style={{ background: 'linear-gradient(135deg, #1e2a4a, #2a3d6f)' }}
        >
          + Add Nurse
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400 animate-pulse">Loading nurses…</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Nurse</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Role</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Employee ID</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">WhatsApp</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Language</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Certs</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">No nurses match your filters.</td></tr>
              ) : filtered.map((nurse) => (
                <tr key={nurse.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <NurseAvatar name={nurse.name} size="sm" />
                      <div>
                        <div className="font-semibold text-gray-900">{nurse.name}</div>
                        <div className="text-xs text-gray-400">{nurse.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ROLE_COLORS[nurse.role] ?? 'bg-gray-100 text-gray-700'}`}>
                      {nurse.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{nurse.employeeId ?? '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${nurse.whatsappOptIn ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className="text-xs text-gray-600">{nurse.whatsappNumber ?? '—'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">{LANGUAGE_LABELS[nurse.preferredLanguage] ?? nurse.preferredLanguage}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                      {(nurse._count?.nurseCerts ?? 0)} certs
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => router.push('/staff-certs/user-details?nurseId=' + nurse.id)}
                      className="text-xs font-semibold text-[#1e2a4a] hover:underline"
                    >
                      Edit →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="text-xs text-gray-400">{filtered.length} of {nurses.length} nurses</div>
    </div>
  )
}
