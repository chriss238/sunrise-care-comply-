'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import NurseAvatar from '../shared/NurseAvatar'
import type { NurseRow } from '@/lib/staff-certs'
import { LANGUAGE_LABELS, ROLE_COLORS } from '@/lib/staff-certs'

const EMPTY_FORM = {
  name: '', email: '', role: 'RN', employeeId: '', whatsappNumber: '',
  whatsappOptIn: false, preferredLanguage: 'en', alternativePhone: '',
  dateJoined: '', internalNotes: '',
}

export default function UserDetailsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nurseId = searchParams.get('nurseId')

  const [nurses, setNurses] = useState<NurseRow[]>([])
  const [editingNurse, setEditingNurse] = useState<NurseRow | null>(null)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    fetch('/api/staff-certs/nurses').then((r) => r.json()).then(setNurses)
  }, [])

  useEffect(() => {
    if (nurseId) {
      fetch(`/api/staff-certs/nurses/${nurseId}`).then((r) => r.json()).then((n: NurseRow) => {
        setEditingNurse(n)
        setForm({
          name: n.name, email: n.email, role: n.role,
          employeeId: n.employeeId ?? '', whatsappNumber: n.whatsappNumber ?? '',
          whatsappOptIn: n.whatsappOptIn, preferredLanguage: n.preferredLanguage,
          alternativePhone: n.alternativePhone ?? '',
          dateJoined: n.dateJoined ? n.dateJoined.slice(0, 10) : '',
          internalNotes: n.internalNotes ?? '',
        })
        setShowForm(true)
      })
    }
  }, [nurseId])

  function openNewForm() {
    setEditingNurse(null)
    setForm({ ...EMPTY_FORM })
    setShowForm(true)
  }

  function openEditForm(nurse: NurseRow) {
    setEditingNurse(nurse)
    setForm({
      name: nurse.name, email: nurse.email, role: nurse.role,
      employeeId: nurse.employeeId ?? '', whatsappNumber: nurse.whatsappNumber ?? '',
      whatsappOptIn: nurse.whatsappOptIn, preferredLanguage: nurse.preferredLanguage,
      alternativePhone: nurse.alternativePhone ?? '',
      dateJoined: nurse.dateJoined ? nurse.dateJoined.slice(0, 10) : '',
      internalNotes: nurse.internalNotes ?? '',
    })
    setShowForm(true)
    router.replace('/staff-certs/user-details?nurseId=' + nurse.id)
  }

  async function handleSave() {
    if (!form.name || !form.email || !form.role) { setMsg('Name, email, and role are required.'); return }
    setSaving(true); setMsg('')
    try {
      const url = editingNurse ? `/api/staff-certs/nurses/${editingNurse.id}` : '/api/staff-certs/nurses'
      const method = editingNurse ? 'PATCH' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (!res.ok) throw new Error(await res.text())
      const saved: NurseRow = await res.json()
      setNurses((prev) => editingNurse ? prev.map((n) => n.id === saved.id ? saved : n) : [...prev, saved])
      setMsg(editingNurse ? '✅ Nurse updated.' : '✅ Nurse created.')
      setEditingNurse(saved)
    } catch (e: any) {
      setMsg('❌ Error: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!editingNurse) return
    if (!confirm(`Delete ${editingNurse.name}? This will also delete all their certifications and records.`)) return
    await fetch(`/api/staff-certs/nurses/${editingNurse.id}`, { method: 'DELETE' })
    setNurses((prev) => prev.filter((n) => n.id !== editingNurse.id))
    setShowForm(false)
    setEditingNurse(null)
    router.replace('/staff-certs/user-details')
  }

  if (showForm) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={() => { setShowForm(false); router.replace('/staff-certs/user-details') }} className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1">← Back to list</button>
          <span className="text-gray-300">|</span>
          <h2 className="text-base font-bold text-gray-900">{editingNurse ? `Editing: ${editingNurse.name}` : 'Add New Nurse'}</h2>
        </div>

        {msg && <div className={`text-sm px-4 py-2 rounded-lg ${msg.startsWith('✅') ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>{msg}</div>}

        {/* Personal Info */}
        <FormSection title="Personal Information">
          <FormRow>
            <Field label="Full Name *" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="e.g. Mary Tan" />
            <Field label="Employee ID" value={form.employeeId} onChange={(v) => setForm({ ...form, employeeId: v })} placeholder="EMP-2024-001" mono />
          </FormRow>
          <FormRow>
            <Field label="Role *" value={form.role} onChange={(v) => setForm({ ...form, role: v })} type="select" options={['RN', 'EN', 'Care Aide', 'HCA', 'APN']} />
            <Field label="Date Joined" value={form.dateJoined} onChange={(v) => setForm({ ...form, dateJoined: v })} type="date" />
          </FormRow>
        </FormSection>

        {/* Contact Info */}
        <FormSection title="Contact & WhatsApp">
          <FormRow>
            <Field label="Email *" value={form.email} onChange={(v) => setForm({ ...form, email: v })} placeholder="nurse@sunrise.com" type="email" />
            <Field label="WhatsApp Number" value={form.whatsappNumber} onChange={(v) => setForm({ ...form, whatsappNumber: v })} placeholder="+65 9123 4567" mono />
          </FormRow>
          <FormRow>
            <Field label="Alternative Phone" value={form.alternativePhone} onChange={(v) => setForm({ ...form, alternativePhone: v })} placeholder="+65 6123 4567" mono />
            <Field label="Preferred Language" value={form.preferredLanguage} onChange={(v) => setForm({ ...form, preferredLanguage: v })} type="select" options={['en', 'fil', 'id']} labels={{ en: 'English', fil: 'Filipino', id: 'Indonesian' }} />
          </FormRow>
          <div className="flex items-center gap-3 px-1">
            <input type="checkbox" id="optIn" checked={form.whatsappOptIn} onChange={(e) => setForm({ ...form, whatsappOptIn: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-[#1e2a4a]" />
            <label htmlFor="optIn" className="text-sm text-gray-700 font-medium">Opted in to WhatsApp reminders</label>
          </div>
        </FormSection>

        {/* Notes */}
        <FormSection title="Internal Notes">
          <textarea
            value={form.internalNotes}
            onChange={(e) => setForm({ ...form, internalNotes: e.target.value })}
            rows={3}
            placeholder="Any internal notes about this nurse…"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#1e2a4a] focus:ring-2 focus:ring-[#1e2a4a]/10 resize-none"
          />
        </FormSection>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 text-sm font-semibold text-white rounded-lg shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #1e2a4a, #2a3d6f)' }}
          >
            {saving ? 'Saving…' : editingNurse ? 'Save Changes' : 'Create Nurse'}
          </button>
          <button onClick={() => { setShowForm(false); router.replace('/staff-certs/user-details') }} className="px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all">
            Cancel
          </button>
          {editingNurse && (
            <button onClick={handleDelete} className="ml-auto px-4 py-2.5 text-sm font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-all">
              🗑 Delete Nurse
            </button>
          )}
        </div>
      </div>
    )
  }

  // Nurse card grid
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">Select a nurse to view or edit their details.</p>
        <button onClick={openNewForm} className="px-4 py-2 text-sm font-semibold text-white rounded-lg shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all" style={{ background: 'linear-gradient(135deg, #1e2a4a, #2a3d6f)' }}>+ Add Nurse</button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {nurses.map((nurse) => (
          <button key={nurse.id} onClick={() => openEditForm(nurse)} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col items-center gap-2 hover:border-[#1e2a4a] hover:shadow-md transition-all text-left">
            <NurseAvatar name={nurse.name} size="lg" />
            <div className="text-center">
              <div className="text-sm font-bold text-gray-900">{nurse.name}</div>
              <div className={`mt-1 text-xs font-semibold px-2 py-0.5 rounded-full ${ROLE_COLORS[nurse.role] ?? 'bg-gray-100 text-gray-700'}`}>{nurse.role}</div>
              <div className="text-xs text-gray-400 mt-1">{nurse.employeeId ?? nurse.email}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600">{title}</h3>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  )
}

function FormRow({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
}

interface FieldProps {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: 'text' | 'email' | 'date' | 'select'
  options?: string[]
  labels?: Record<string, string>
  mono?: boolean
}

function Field({ label, value, onChange, placeholder, type = 'text', options, labels, mono }: FieldProps) {
  const baseClass = `w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#1e2a4a] focus:ring-2 focus:ring-[#1e2a4a]/10 ${mono ? 'font-mono' : ''}`
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">{label}</label>
      {type === 'select' ? (
        <select value={value} onChange={(e) => onChange(e.target.value)} className={baseClass + ' bg-white'}>
          {options?.map((o) => <option key={o} value={o}>{labels?.[o] ?? o}</option>)}
        </select>
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={baseClass} />
      )}
    </div>
  )
}
