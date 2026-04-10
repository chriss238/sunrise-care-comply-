'use client'

import { useState, useMemo } from 'react'
import TopBar from '@/components/TopBar'
import type { CertWithStatus } from '@/lib/certifications'
import { getCertStatus } from '@/lib/certifications'
import Tabs from '@/components/Tabs'
import CertFilters from './CertFilters'
import CertificationsTable from './CertificationsTable'
import AddCertModal from './AddCertModal'
import DeleteConfirmModal from './DeleteConfirmModal'
import ImportProviderModal from './ImportProviderModal'
import type { SortCol, SortDir } from './CertificationsTable'

const PER_PAGE = 10

interface Props {
  initialCerts: CertWithStatus[]
  facilityId: number
  facilityName: string
  mohLicense: string
}

export default function CertificationsClient({
  initialCerts, facilityId, facilityName, mohLicense,
}: Props) {
  const [certs, setCerts]           = useState<CertWithStatus[]>(initialCerts)
  const [search, setSearch]         = useState('')
  const [category, setCategory]     = useState('all')
  const [statusFilter, setStatus]   = useState('all')
  const [sortCol, setSortCol]       = useState<SortCol>('expiry')
  const [sortDir, setSortDir]       = useState<SortDir>('asc')
  const [page, setPage]             = useState(1)
  const [modal, setModal]           = useState<null | 'add' | CertWithStatus>(null)
  const [deleteTarget, setDeleteTarget] = useState<CertWithStatus | null>(null)
  const [showImport, setShowImport]  = useState(false)

  function handleSort(col: SortCol) {
    if (sortCol === col) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortCol(col)
      setSortDir('asc')
    }
  }

  function handleFilterChange(setter: (v: string) => void) {
    return (v: string) => { setter(v); setPage(1) }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return certs.filter((c) => {
      if (q && !c.holderName.toLowerCase().includes(q) && !(c.certNumber?.toLowerCase().includes(q))) return false
      if (category !== 'all' && c.category !== category) return false
      if (statusFilter !== 'all' && c.status !== statusFilter) return false
      return true
    })
  }, [certs, search, category, statusFilter])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let aVal: string | number, bVal: string | number
      if (sortCol === 'type')       { aVal = a.type;       bVal = b.type }
      else if (sortCol === 'holder')     { aVal = a.holderName; bVal = b.holderName }
      else if (sortCol === 'certNumber') { aVal = a.certNumber ?? ''; bVal = b.certNumber ?? '' }
      else if (sortCol === 'expiry')     { aVal = a.expiryDate; bVal = b.expiryDate }
      else                               { aVal = a.days;       bVal = b.days }
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1
      return 0
    })
  }, [filtered, sortCol, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / PER_PAGE))
  const clampedPage = Math.min(page, totalPages)
  const paginated = sorted.slice((clampedPage - 1) * PER_PAGE, clampedPage * PER_PAGE)

  function handleSave(saved: CertWithStatus) {
    // Re-compute status from saved dates (server already does this, but ensure consistency)
    const { status, label, days } = getCertStatus(saved.expiryDate, saved.renewalDate)
    const updated: CertWithStatus = { ...saved, status, statusLabel: label, days }
    setCerts((prev) => {
      const idx = prev.findIndex((c) => c.id === updated.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = updated
        return next
      }
      return [...prev, updated]
    })
    setModal(null)
  }

  function handleDelete(id: number) {
    setCerts((prev) => prev.filter((c) => c.id !== id))
    setDeleteTarget(null)
  }

  return (
    <>
      {/* ── Sticky Header ── */}
      <header
        className="relative overflow-hidden sticky top-0 z-50 shadow-md header-glow"
        style={{ background: 'linear-gradient(135deg, #151f42 0%, #1f2d5c 100%)' }}
      >
        <TopBar />

        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-6 relative z-10">
          {/* Facility bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #ed5e68 0%, #d13844 100%)',
                  boxShadow: '0 4px 12px rgba(237,94,104,0.3)',
                }}
                aria-hidden="true"
              >
                🏥
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">{facilityName}</h1>
                <div className="flex items-center gap-1.5 text-sm text-white/85 font-medium mt-0.5">
                  <span>License:</span>
                  <span
                    className="px-2.5 py-0.5 rounded-md text-[13px] border border-white/20"
                    style={{ background: 'rgba(255,255,255,0.15)' }}
                  >
                    {mohLicense}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <Tabs />
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        {/* Page header */}
        <div className="animate-fade-in-down flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
              style={{ background: 'linear-gradient(135deg, #ed5e68 0%, #d13844 100%)', boxShadow: '0 4px 12px rgba(237,94,104,0.3)' }}
              aria-hidden="true"
            >
              📋
            </div>
            <div>
              <h1 className="text-2xl font-bold text-sg-navy tracking-tight">
                Certifications &amp; Accreditations
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Manage staff credentials, facility licenses, and equipment certifications
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowImport(true)}
              aria-label="Import certifications from a training provider"
              className={[
                'flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold border-2 border-gray-200 bg-white text-sg-navy',
                'hover:border-sg-navy hover:bg-gray-50 hover:-translate-y-0.5 hover:shadow-sm transition-all',
                'focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-sg-navy',
              ].join(' ')}
            >
              <span>📥</span>
              <span>Import from Provider</span>
            </button>
            <button
              onClick={() => setModal('add')}
              aria-label="Add new certification"
              className={[
                'flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold bg-sg-navy text-white',
                'hover:bg-sg-navy-dark hover:-translate-y-0.5 hover:shadow-md transition-all',
                'focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-sg-navy',
              ].join(' ')}
            >
              <span>➕</span>
              <span>Add Certification</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <CertFilters
          search={search}
          category={category}
          status={statusFilter}
          onSearch={handleFilterChange(setSearch)}
          onCategory={handleFilterChange(setCategory)}
          onStatus={handleFilterChange(setStatus)}
        />

        {/* Table */}
        <div aria-live="polite" aria-label="Certifications list">
          <CertificationsTable
            certs={paginated}
            total={sorted.length}
            page={clampedPage}
            totalPages={totalPages}
            sortCol={sortCol}
            sortDir={sortDir}
            onSort={handleSort}
            onPage={setPage}
            onEdit={(cert) => setModal(cert)}
            onDelete={setDeleteTarget}
          />
        </div>
      </main>

      {/* ── Modals ── */}
      {modal !== null && (
        <AddCertModal
          mode={modal === 'add' ? 'add' : 'edit'}
          cert={modal === 'add' ? undefined : modal}
          facilityId={facilityId}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          cert={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}

      {showImport && (
        <ImportProviderModal
          facilityId={facilityId}
          onClose={() => setShowImport(false)}
          onImport={(newCerts) => {
            setCerts((prev) => [...newCerts, ...prev])
          }}
        />
      )}
    </>
  )
}
