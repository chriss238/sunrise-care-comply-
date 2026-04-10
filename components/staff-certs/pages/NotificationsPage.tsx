'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { NotificationRuleRow, NotificationLogRow } from '@/lib/staff-certs'
import { formatRelativeTime, formatSgDate, getLogStatusProps, LANGUAGE_LABELS } from '@/lib/staff-certs'

export default function NotificationsPage() {
  const router = useRouter()
  const [rules, setRules] = useState<NotificationRuleRow[]>([])
  const [logs, setLogs] = useState<NotificationLogRow[]>([])
  const [logFilter, setLogFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [editRule, setEditRule] = useState<NotificationRuleRow | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/staff-certs/notification-rules').then((r) => r.json()),
      fetch('/api/staff-certs/notification-logs').then((r) => r.json()),
    ]).then(([r, l]) => { setRules(r); setLogs(l); setLoading(false) })
  }, [])

  async function toggleActive(rule: NotificationRuleRow) {
    const updated = await fetch(`/api/staff-certs/notification-rules/${rule.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...rule, active: !rule.active }),
    }).then((r) => r.json())
    setRules((prev) => prev.map((r) => r.id === updated.id ? updated : r))
  }

  async function saveRule() {
    if (!editRule) return
    setSaving(true)
    const updated = await fetch(`/api/staff-certs/notification-rules/${editRule.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editRule),
    }).then((r) => r.json())
    setRules((prev) => prev.map((r) => r.id === updated.id ? updated : r))
    setEditRule(null)
    setSaving(false)
  }

  const filteredLogs = logFilter === 'all' ? logs : logs.filter((l) => l.status === logFilter)

  if (loading) return <div className="text-center py-12 text-gray-400 animate-pulse">Loading…</div>

  return (
    <div className="space-y-6">
      {/* Rules table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Notification Rules</h3>
          <span className="text-xs text-gray-500">{rules.length} rules</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Timing</th>
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Cert Type</th>
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Template</th>
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Languages</th>
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Escalation</th>
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Active</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rules.map((rule) => (
              <tr key={rule.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-[#1e2a4a]/10 text-[#1e2a4a] flex items-center justify-center text-xs font-bold shrink-0">{rule.daysBeforeExpiry}d</span>
                    <span className="text-xs text-gray-500">before expiry</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs font-semibold text-gray-700">{rule.certType}</td>
                <td className="px-4 py-3 max-w-xs">
                  <p className="text-xs text-gray-600 truncate">{rule.templateEn}</p>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-semibold">EN</span>
                    {rule.templateFil && <span className="text-[10px] bg-yellow-50 text-yellow-700 px-1.5 py-0.5 rounded font-semibold">FIL</span>}
                    {rule.templateId && <span className="text-[10px] bg-red-50 text-red-700 px-1.5 py-0.5 rounded font-semibold">ID</span>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {rule.escalateToAdmin ? (
                    <span className="text-xs text-orange-700 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full font-semibold">
                      After {rule.escalateDays}d
                    </span>
                  ) : <span className="text-xs text-gray-400">—</span>}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleActive(rule)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${rule.active ? 'bg-green-500' : 'bg-gray-300'}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${rule.active ? 'left-5.5 translate-x-0.5' : 'left-0.5'}`} style={{ left: rule.active ? '22px' : '2px' }} />
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => setEditRule(rule)} className="text-xs font-semibold text-[#1e2a4a] hover:underline">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Logs table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap items-center gap-3">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Notification Log</h3>
          <div className="flex gap-2 ml-auto">
            {['all', 'sent', 'delivered', 'read', 'replied', 'failed'].map((s) => (
              <button key={s} onClick={() => setLogFilter(s)} className={`text-xs font-semibold px-3 py-1 rounded-full transition-colors ${logFilter === s ? 'bg-[#1e2a4a] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Recipient</th>
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Cert</th>
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Message</th>
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Lang</th>
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Sent</th>
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Reply</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredLogs.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-12 text-gray-400">No logs match this filter.</td></tr>
            ) : filteredLogs.map((log) => {
              const sp = getLogStatusProps(log.status)
              return (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-semibold text-gray-900">{log.recipient?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{log.nurseCert?.certType ?? '—'}</td>
                  <td className="px-4 py-3 max-w-xs"><p className="text-xs text-gray-600 truncate">{log.messageText}</p></td>
                  <td className="px-4 py-3 text-xs text-gray-500 uppercase">{log.language}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatRelativeTime(log.sentAt)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${sp.bgClass} ${sp.colorClass}`}>{sp.label}</span>
                    {log.escalated && <span className="ml-1 text-[10px] font-bold text-orange-700 bg-orange-50 px-1.5 py-0.5 rounded">Escalated</span>}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600 max-w-xs">
                    {log.replyText ? <span className="italic">"{log.replyText}"</span> : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => router.push(`/staff-certs/messages?nurseId=${log.recipientId}`)}
                      className="text-xs font-semibold text-[#1e2a4a] hover:underline whitespace-nowrap"
                    >
                      View →
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Edit rule modal */}
      {editRule && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4">
            <h3 className="text-base font-bold text-gray-900">Edit Notification Rule</h3>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">Days Before Expiry</label>
              <input type="number" value={editRule.daysBeforeExpiry} onChange={(e) => setEditRule({ ...editRule, daysBeforeExpiry: Number(e.target.value) })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#1e2a4a]" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">English Template</label>
              <textarea rows={3} value={editRule.templateEn} onChange={(e) => setEditRule({ ...editRule, templateEn: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#1e2a4a] resize-none" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">Filipino Template</label>
              <textarea rows={2} value={editRule.templateFil ?? ''} onChange={(e) => setEditRule({ ...editRule, templateFil: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#1e2a4a] resize-none" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">Indonesian Template</label>
              <textarea rows={2} value={editRule.templateId ?? ''} onChange={(e) => setEditRule({ ...editRule, templateId: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#1e2a4a] resize-none" />
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="escalate" checked={editRule.escalateToAdmin} onChange={(e) => setEditRule({ ...editRule, escalateToAdmin: e.target.checked })} className="w-4 h-4" />
              <label htmlFor="escalate" className="text-sm text-gray-700">Escalate to admin</label>
              {editRule.escalateToAdmin && (
                <input type="number" value={editRule.escalateDays ?? ''} onChange={(e) => setEditRule({ ...editRule, escalateDays: Number(e.target.value) })} placeholder="Days" className="w-20 px-2 py-1 text-sm border border-gray-200 rounded ml-2" />
              )}
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={saveRule} disabled={saving} className="px-5 py-2 text-sm font-semibold text-white rounded-lg" style={{ background: 'linear-gradient(135deg, #1e2a4a, #2a3d6f)' }}>{saving ? 'Saving…' : 'Save'}</button>
              <button onClick={() => setEditRule(null)} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
