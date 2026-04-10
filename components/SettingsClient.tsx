'use client'

import { useState } from 'react'
import TopBar from './TopBar'
import Tabs from './Tabs'

interface AdminRow {
  id: number
  name: string
  email: string
  role: string
}

const DUMMY_ADMINS: AdminRow[] = [
  { id: 1, name: 'Dr. Rachel Lim', email: 'rachel.lim@sunrisecare.sg', role: 'Facility Manager' },
  { id: 2, name: 'James Tan', email: 'james.tan@sunrisecare.sg', role: 'Compliance Officer' },
  { id: 3, name: 'Admin User', email: 'admin@sunrisecare.sg', role: 'System Admin' },
]

interface Props {
  currentUserName: string
  facilityName: string
  mohLicense: string
}

export default function SettingsClient({ currentUserName, facilityName, mohLicense }: Props) {
  const [admins, setAdmins] = useState<AdminRow[]>(DUMMY_ADMINS)
  const [editingAdmin, setEditingAdmin] = useState<AdminRow | null>(null)
  const [addingAdmin, setAddingAdmin] = useState(false)
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', role: 'Compliance Officer' })
  const [toast, setToast] = useState('')
  const [notifPrefs, setNotifPrefs] = useState({ emailAlerts: true, smsAlerts: false, weeklyDigest: true, overdueEscalation: true })
  const [accountName, setAccountName] = useState(currentUserName)
  const [accountEmail, setAccountEmail] = useState('admin@sunrisecare.sg')

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  function handleAddAdmin() {
    if (!newAdmin.name || !newAdmin.email) return
    setAdmins((prev) => [...prev, { ...newAdmin, id: Date.now() }])
    setNewAdmin({ name: '', email: '', role: 'Compliance Officer' })
    setAddingAdmin(false)
    showToast('Admin account added.')
  }

  function handleEditAdmin() {
    if (!editingAdmin) return
    setAdmins((prev) => prev.map((a) => a.id === editingAdmin.id ? editingAdmin : a))
    setEditingAdmin(null)
    showToast('Admin account updated.')
  }

  function handleRemoveAdmin(id: number) {
    if (!confirm('Remove this admin account?')) return
    setAdmins((prev) => prev.filter((a) => a.id !== id))
    showToast('Admin account removed.')
  }

  return (
    <>
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-lg animate-fade-in-down">
          ✅ {toast}
        </div>
      )}

      {/* Header — same pattern as all other tabs */}
      <header
        className="relative overflow-hidden sticky top-0 z-50 shadow-md header-glow"
        style={{ background: 'linear-gradient(135deg, #151f42 0%, #1f2d5c 100%)' }}
      >
        <TopBar />
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-6 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl shrink-0"
                style={{ background: 'linear-gradient(135deg, #ed5e68 0%, #d13844 100%)', boxShadow: '0 4px 12px rgba(237,94,104,0.3)' }}
                aria-hidden="true"
              >
                🏥
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">{facilityName}</h1>
                <div className="flex items-center gap-1.5 text-sm text-white/85 font-medium mt-0.5">
                  <span>License:</span>
                  <span className="px-2.5 py-0.5 rounded-md text-[13px] border border-white/20" style={{ background: 'rgba(255,255,255,0.15)' }}>
                    {mohLicense}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <Tabs />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">

        {/* Admin Accounts */}
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Admin Accounts</h2>
            <button
              onClick={() => setAddingAdmin(true)}
              className="px-4 py-2 text-sm font-semibold text-white rounded-lg shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
              style={{ background: 'linear-gradient(135deg, #1e2a4a, #2a3d6f)' }}
            >
              + Add Admin
            </button>
          </div>

          {addingAdmin && (
            <div className="px-6 py-4 bg-blue-50 border-b border-blue-100 flex flex-wrap items-end gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">Name</label>
                <input value={newAdmin.name} onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })} placeholder="Full name" autoFocus className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#1e2a4a]" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">Email</label>
                <input type="email" value={newAdmin.email} onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })} placeholder="email@sunrisecare.sg" className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#1e2a4a]" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">Role</label>
                <select value={newAdmin.role} onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value })} className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#1e2a4a] bg-white">
                  {['Facility Manager', 'Compliance Officer', 'System Admin', 'Nurse Manager'].map((r) => <option key={r}>{r}</option>)}
                </select>
              </div>
              <button onClick={handleAddAdmin} className="px-4 py-2 text-sm font-semibold text-white rounded-lg" style={{ background: 'linear-gradient(135deg, #1e2a4a, #2a3d6f)' }}>Save</button>
              <button onClick={() => setAddingAdmin(false)} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-white">Cancel</button>
            </div>
          )}

          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Email</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Role</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {admins.map((admin) => (
                editingAdmin?.id === admin.id ? (
                  <tr key={admin.id} className="bg-blue-50">
                    <td className="px-6 py-3"><input value={editingAdmin.name} onChange={(e) => setEditingAdmin({ ...editingAdmin, name: e.target.value })} autoFocus className="px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:border-[#1e2a4a] w-full" /></td>
                    <td className="px-4 py-3"><input type="email" value={editingAdmin.email} onChange={(e) => setEditingAdmin({ ...editingAdmin, email: e.target.value })} className="px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:border-[#1e2a4a] w-full" /></td>
                    <td className="px-4 py-3">
                      <select value={editingAdmin.role} onChange={(e) => setEditingAdmin({ ...editingAdmin, role: e.target.value })} className="px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:border-[#1e2a4a] bg-white">
                        {['Facility Manager', 'Compliance Officer', 'System Admin', 'Nurse Manager'].map((r) => <option key={r}>{r}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={handleEditAdmin} className="text-xs font-semibold text-white px-3 py-1.5 rounded-lg" style={{ background: 'linear-gradient(135deg, #1e2a4a, #2a3d6f)' }}>Save</button>
                        <button onClick={() => setEditingAdmin(null)} className="text-xs text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50">Cancel</button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={admin.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 font-semibold text-gray-900">{admin.name}</td>
                    <td className="px-4 py-3 text-gray-600">{admin.email}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold bg-[#1e2a4a]/10 text-[#1e2a4a] px-2 py-0.5 rounded-full">{admin.role}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => setEditingAdmin(admin)} className="text-xs font-semibold text-[#1e2a4a] hover:underline">Edit</button>
                        <button onClick={() => handleRemoveAdmin(admin.id)} className="text-xs font-semibold text-red-600 hover:underline">Remove</button>
                      </div>
                    </td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        </section>

        {/* Facility Info */}
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Facility Information</h2>
          </div>
          <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">Facility Name</label>
              <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-700">{facilityName}</div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">MOH License Number</label>
              <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-700 font-mono">{mohLicense}</div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">Address</label>
              <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-700">123 Care Avenue, Singapore 456789</div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">Bed Capacity</label>
              <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-700">120 beds</div>
            </div>
          </div>
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
            <p className="text-xs text-gray-400">Facility details are managed by MOH. Contact your MOH liaison to update.</p>
          </div>
        </section>

        {/* Notification Preferences */}
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Notification Preferences</h2>
          </div>
          <div className="px-6 py-5 space-y-4">
            {[
              { key: 'emailAlerts', label: 'Email Alerts', desc: 'Receive compliance alerts via email' },
              { key: 'smsAlerts', label: 'SMS Alerts', desc: 'Receive urgent alerts via SMS' },
              { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'Weekly summary of compliance status every Monday' },
              { key: 'overdueEscalation', label: 'Overdue Escalation', desc: 'Escalate overdue items to facility manager after 3 days' },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <div className="text-sm font-semibold text-gray-900">{label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{desc}</div>
                </div>
                <button
                  onClick={() => { setNotifPrefs((p) => ({ ...p, [key]: !p[key as keyof typeof p] })); showToast('Preferences saved.') }}
                  className={`relative w-10 h-5 rounded-full transition-colors ${notifPrefs[key as keyof typeof notifPrefs] ? 'bg-green-500' : 'bg-gray-300'}`}
                >
                  <span className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all" style={{ left: notifPrefs[key as keyof typeof notifPrefs] ? '22px' : '2px' }} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Account */}
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">My Account</h2>
          </div>
          <div className="px-6 py-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">Display Name</label>
                <input value={accountName} onChange={(e) => setAccountName(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#1e2a4a] focus:ring-2 focus:ring-[#1e2a4a]/10" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">Email</label>
                <input type="email" value={accountEmail} onChange={(e) => setAccountEmail(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#1e2a4a] focus:ring-2 focus:ring-[#1e2a4a]/10" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">New Password</label>
              <input type="password" placeholder="Leave blank to keep current password" className="w-full max-w-sm px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#1e2a4a] focus:ring-2 focus:ring-[#1e2a4a]/10" />
            </div>
          </div>
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
            <button
              onClick={() => showToast('Account details saved.')}
              className="px-6 py-2.5 text-sm font-semibold text-white rounded-lg shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
              style={{ background: 'linear-gradient(135deg, #1e2a4a, #2a3d6f)' }}
            >
              Save Changes
            </button>
          </div>
        </section>

      </main>
    </>
  )
}
