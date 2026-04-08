'use client'

import { useState, useEffect } from 'react'
import StatsCard from '../shared/StatsCard'
import NurseAvatar from '../shared/NurseAvatar'
import NurseStatusBadge from '../shared/NurseStatusBadge'
import type { StaffCertStats, NotificationLogRow, CertUploadRow, NurseCertStatus } from '@/lib/staff-certs'
import { formatRelativeTime, getLogStatusProps } from '@/lib/staff-certs'

export default function DashboardPage() {
  const [stats, setStats] = useState<StaffCertStats | null>(null)
  const [logs, setLogs] = useState<NotificationLogRow[]>([])
  const [uploads, setUploads] = useState<CertUploadRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/staff-certs/stats').then((r) => r.json()),
      fetch('/api/staff-certs/notification-logs').then((r) => r.json()),
      fetch('/api/staff-certs/cert-uploads?status=pending').then((r) => r.json()),
    ]).then(([s, l, u]) => {
      setStats(s)
      setLogs(l.slice(0, 8))
      setUploads(u)
      setLoading(false)
    })
  }, [])

  if (loading) return <PageSkeleton />

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Total Nurses" value={stats?.totalNurses ?? 0} icon="👩‍⚕️" colorClass="text-blue-700" bgClass="bg-blue-50" sub="Active staff" />
        <StatsCard label="Valid Certs" value={stats?.validCerts ?? 0} icon="✅" colorClass="text-green-700" bgClass="bg-green-50" sub="Up to date" />
        <StatsCard label="Expiring Soon" value={stats?.expiringSoon ?? 0} icon="⚠️" colorClass="text-orange-700" bgClass="bg-orange-50" sub="Within 30 days" />
        <StatsCard label="Expired" value={stats?.expiredCerts ?? 0} icon="🔴" colorClass="text-red-700" bgClass="bg-red-50" sub="Action required" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Notifications */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Recent Notifications</h3>
            <span className="text-xs text-gray-500">{logs.length} shown</span>
          </div>
          <div className="divide-y divide-gray-50">
            {logs.length === 0 ? (
              <p className="text-sm text-gray-500 p-5">No notifications yet.</p>
            ) : (
              logs.map((log) => {
                const sp = getLogStatusProps(log.status)
                return (
                  <div key={log.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                    <NurseAvatar name={log.recipient?.name ?? '?'} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900 truncate">{log.recipient?.name}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${sp.bgClass} ${sp.colorClass}`}>{sp.label}</span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{log.nurseCert?.certType ?? 'Certification'}</p>
                    </div>
                    <span className="text-xs text-gray-400 shrink-0">{formatRelativeTime(log.sentAt)}</span>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Pending Uploads */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Pending Reviews</h3>
            <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">{uploads.length}</span>
          </div>
          {uploads.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-3xl mb-2">✅</div>
              <p className="text-sm text-gray-500">All uploads reviewed</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {uploads.map((u) => {
                const conf = u.confidenceScore ?? 0
                const confColor = conf >= 90 ? 'text-green-600' : 'text-amber-600'
                return (
                  <div key={u.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                    <div className="w-9 h-9 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-center text-lg shrink-0">📄</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900 truncate">{u.nurseCert?.certType ?? 'Certificate'}</div>
                      <div className="text-xs text-gray-500">{u.nurse?.name} · via {u.uploadMethod}</div>
                    </div>
                    <span className={`text-xs font-bold ${confColor}`}>{conf.toFixed(0)}%</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* WhatsApp opt-in banner */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5 flex items-center gap-4">
        <div className="text-3xl">📱</div>
        <div>
          <div className="text-sm font-bold text-green-900">WhatsApp Reminders Active</div>
          <div className="text-xs text-green-700 mt-0.5">
            {stats?.optInRate ?? 0}% of nurses opted in · Reminders sent at 90, 60, 30, 14 & 7 days before expiry
          </div>
        </div>
        <div className="ml-auto text-xs font-bold text-green-700 bg-green-100 px-3 py-1.5 rounded-full">{stats?.optInRate ?? 0}% Opt-in</div>
      </div>
    </div>
  )
}

function PageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-72 bg-gray-100 rounded-xl" />
        <div className="h-72 bg-gray-100 rounded-xl" />
      </div>
    </div>
  )
}
