import type { CertStatus } from '@/lib/certifications'

interface Props {
  status: CertStatus
  label: string
}

const VARIANTS: Record<CertStatus, { bg: string; text: string; border: string }> = {
  expired:  { bg: 'bg-red-50',    text: 'text-sg-red',   border: 'border-sg-red' },
  expiring: { bg: 'bg-yellow-50', text: 'text-amber-600', border: 'border-sg-amber' },
  renewal:  { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-400' },
  valid:    { bg: 'bg-green-50',  text: 'text-sg-green', border: 'border-sg-green' },
}

export default function StatusBadge({ status, label }: Props) {
  const { bg, text, border } = VARIANTS[status]
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider border-2 whitespace-nowrap ${bg} ${text} ${border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full bg-current animate-pulse-dot`} aria-hidden="true" />
      {label}
    </span>
  )
}
