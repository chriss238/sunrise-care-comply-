export type CertStatus = 'expired' | 'expiring' | 'renewal' | 'valid'

export interface CertStatusResult {
  status: CertStatus
  label: string
  days: number
}

/**
 * Status priority: expired → renewal (today ≥ renewalDate) → expiring (≤30d) → valid
 */
export function getCertStatus(
  expiryDate: Date | string,
  renewalDate?: Date | string | null
): CertStatusResult {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const expiry = new Date(expiryDate)
  expiry.setHours(0, 0, 0, 0)

  const days = Math.ceil((expiry.getTime() - today.getTime()) / 86400000)

  if (days < 0) return { status: 'expired', label: 'Expired', days }

  if (renewalDate) {
    const renewal = new Date(renewalDate)
    renewal.setHours(0, 0, 0, 0)
    if (today >= renewal) return { status: 'renewal', label: 'Pending Renewal', days }
  }

  if (days <= 30) return { status: 'expiring', label: 'Expiring Soon', days }

  return { status: 'valid', label: 'Valid', days }
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export interface CertWithStatus {
  id: number
  facilityId: number
  category: string
  type: string
  holderName: string
  certNumber: string | null
  issuingBody: string
  issueDate: string | null
  expiryDate: string
  renewalDate: string | null
  notes: string | null
  attachmentUrl: string | null
  createdAt: string
  updatedAt: string
  status: CertStatus
  statusLabel: string
  days: number
}
