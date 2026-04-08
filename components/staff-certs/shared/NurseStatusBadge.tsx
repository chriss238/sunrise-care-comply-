import type { NurseCertStatus } from '@/lib/staff-certs'
import { getNurseCertBadgeProps } from '@/lib/staff-certs'

interface Props {
  status: NurseCertStatus
  pulsing?: boolean
}

export default function NurseStatusBadge({ status, pulsing = true }: Props) {
  const { label, colorClass, dotClass, bgClass } = getNurseCertBadgeProps(status)
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wider ${bgClass} ${colorClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotClass} ${pulsing && (status === 'expired' || status === 'expiring') ? 'animate-pulse' : ''}`} />
      {label}
    </span>
  )
}
