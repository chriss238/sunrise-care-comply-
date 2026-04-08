'use client'

interface Props {
  search: string
  category: string
  status: string
  onSearch: (v: string) => void
  onCategory: (v: string) => void
  onStatus: (v: string) => void
}

const inputClass = [
  'w-full px-3.5 py-2.5 border-2 border-gray-200 rounded-lg text-sm font-sans',
  'transition-all duration-200',
  'focus:outline-none focus:border-sg-navy focus:shadow-[0_0_0_3px_rgba(31,45,92,0.1)]',
].join(' ')

export default function CertFilters({ search, category, status, onSearch, onCategory, onStatus }: Props) {
  return (
    <div className="animate-fade-in-up bg-white rounded-xl px-6 py-5 mb-6 shadow-sm border border-gray-200" style={{ animationDelay: '0.1s' }}>
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 min-w-0">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Search
          </label>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search by holder name or cert number…"
            aria-label="Search certifications by holder name or cert number"
            className={inputClass}
          />
        </div>

        {/* Category */}
        <div className="sm:w-52">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => onCategory(e.target.value)}
            aria-label="Filter by category"
            className={inputClass}
          >
            <option value="all">All Categories</option>
            <option value="Staff">Staff Certifications</option>
            <option value="Facility">Facility Licenses</option>
            <option value="Equipment">Equipment Certifications</option>
          </select>
        </div>

        {/* Status */}
        <div className="sm:w-52">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => onStatus(e.target.value)}
            aria-label="Filter by status"
            className={inputClass}
          >
            <option value="all">All Statuses</option>
            <option value="expired">🔴 Expired</option>
            <option value="expiring">🟡 Expiring Soon</option>
            <option value="renewal">🟠 Pending Renewal</option>
            <option value="valid">🟢 Valid</option>
          </select>
        </div>
      </div>
    </div>
  )
}
