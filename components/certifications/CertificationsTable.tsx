'use client'

import type { CertWithStatus } from '@/lib/certifications'
import CertificationRow from './CertificationRow'

export type SortCol = 'type' | 'holder' | 'certNumber' | 'expiry' | 'status'
export type SortDir = 'asc' | 'desc'

interface Props {
  certs: CertWithStatus[]        // already filtered + sorted
  total: number                  // total after filtering (for pagination info)
  page: number
  totalPages: number
  sortCol: SortCol
  sortDir: SortDir
  onSort: (col: SortCol) => void
  onPage: (page: number) => void
  onEdit: (cert: CertWithStatus) => void
  onDelete: (cert: CertWithStatus) => void
}

const COLUMNS: { key: SortCol | null; label: string }[] = [
  { key: 'type',       label: 'Type' },
  { key: 'holder',     label: 'Holder' },
  { key: 'certNumber', label: 'Cert Number' },
  { key: 'expiry',     label: 'Expiry Date' },
  { key: 'status',     label: 'Status' },
  { key: null,         label: 'Actions' },
]

const PER_PAGE = 10

export default function CertificationsTable({
  certs, total, page, totalPages, sortCol, sortDir,
  onSort, onPage, onEdit, onDelete,
}: Props) {
  const start = total === 0 ? 0 : (page - 1) * PER_PAGE + 1
  const end   = Math.min(page * PER_PAGE, total)

  // Build pagination page numbers with ellipsis
  const pageNumbers: (number | '…')[] = []
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pageNumbers.push(i)
    } else if (i === page - 2 || i === page + 2) {
      pageNumbers.push('…')
    }
  }

  return (
    <div className="animate-fade-in-up bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden" style={{ animationDelay: '0.2s' }}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse" aria-label="Certifications table">
          <thead
            className="sticky top-0 z-10 text-white"
            style={{ background: 'linear-gradient(135deg, #151f42 0%, #1f2d5c 100%)' }}
          >
            <tr>
              {COLUMNS.map(({ key, label }) => (
                <th
                  key={label}
                  onClick={key ? () => onSort(key) : undefined}
                  aria-sort={
                    key && sortCol === key
                      ? sortDir === 'asc' ? 'ascending' : 'descending'
                      : undefined
                  }
                  className={[
                    'px-5 py-4 text-left text-xs font-bold uppercase tracking-wider whitespace-nowrap select-none',
                    key ? 'cursor-pointer hover:bg-white/10' : '',
                  ].join(' ')}
                >
                  {label}
                  {key && (
                    <span className="ml-1.5 text-[10px]">
                      {sortCol === key
                        ? sortDir === 'asc' ? <span className="text-sg-coral">↑</span> : <span className="text-sg-coral">↓</span>
                        : <span className="opacity-40">⇅</span>}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {certs.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-20 text-center text-gray-500">
                  <div className="text-6xl mb-4 opacity-30" aria-hidden="true">📋</div>
                  <p className="text-base font-medium">No certifications match your filters.</p>
                </td>
              </tr>
            ) : (
              certs.map((cert) => (
                <CertificationRow
                  key={cert.id}
                  cert={cert}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-5 border-t border-gray-200">
        <div className="text-sm text-gray-500 font-medium" aria-live="polite">
          Showing {start}–{end} of {total}
        </div>
        <div className="flex items-center gap-1" role="navigation" aria-label="Pagination">
          <button
            onClick={() => onPage(page - 1)}
            disabled={page === 1}
            aria-label="Previous page"
            className="min-w-9 h-9 px-3 border-2 border-gray-200 rounded-md text-sm font-semibold transition-all hover:border-sg-navy hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-sg-navy"
          >
            ‹
          </button>

          {pageNumbers.map((n, i) =>
            n === '…' ? (
              <span key={`ellipsis-${i}`} className="px-2 text-gray-500 text-sm">…</span>
            ) : (
              <button
                key={n}
                onClick={() => onPage(n)}
                aria-label={`Go to page ${n}`}
                aria-current={n === page ? 'page' : undefined}
                className={[
                  'min-w-9 h-9 px-3 border-2 rounded-md text-sm font-semibold transition-all',
                  'focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-sg-navy',
                  n === page
                    ? 'bg-sg-navy text-white border-sg-navy'
                    : 'bg-white border-gray-200 hover:border-sg-navy hover:bg-gray-50',
                ].join(' ')}
              >
                {n}
              </button>
            )
          )}

          <button
            onClick={() => onPage(page + 1)}
            disabled={page >= totalPages || totalPages === 0}
            aria-label="Next page"
            className="min-w-9 h-9 px-3 border-2 border-gray-200 rounded-md text-sm font-semibold transition-all hover:border-sg-navy hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-sg-navy"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  )
}
