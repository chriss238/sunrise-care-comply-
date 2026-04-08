// ── Types ─────────────────────────────────────────────────────────────────────

export type NurseCertStatus = 'expired' | 'expiring' | 'pending_renewal' | 'valid'

export interface NurseRow {
  id: number
  facilityId: number
  name: string
  email: string
  role: string
  employeeId: string | null
  whatsappNumber: string | null
  whatsappOptIn: boolean
  preferredLanguage: string
  alternativePhone: string | null
  dateJoined: string | null
  internalNotes: string | null
  createdAt: string
  updatedAt: string
  _count?: { nurseCerts: number }
}

export interface NurseCertRow {
  id: number
  nurseId: number
  certType: string
  certNumber: string
  holderName: string
  issuingBody: string
  issueDate: string | null
  expiryDate: string
  renewalDate: string | null
  attachmentUrl: string | null
  createdAt: string
  updatedAt: string
  status: NurseCertStatus
  statusLabel: string
  days: number
  nurse?: { name: string; role: string }
}

export interface NotificationRuleRow {
  id: number
  certType: string
  daysBeforeExpiry: number
  templateEn: string
  templateFil: string | null
  templateId: string | null
  active: boolean
  escalateToAdmin: boolean
  escalateDays: number | null
  createdAt: string
  updatedAt: string
}

export interface NotificationLogRow {
  id: number
  nurseCertId: number | null
  recipientId: number
  phoneNumber: string
  language: string
  messageText: string
  sentAt: string | null
  deliveredAt: string | null
  readAt: string | null
  repliedAt: string | null
  replyText: string | null
  status: string
  escalated: boolean
  createdAt: string
  recipient?: { name: string; role: string }
  nurseCert?: { certType: string } | null
}

export interface CertUploadRow {
  id: number
  nurseCertId: number | null
  nurseId: number
  fileUrl: string
  uploadMethod: string
  ocrStatus: string
  extractedData: string | null
  confidenceScore: number | null
  reviewedById: number | null
  approvedAt: string | null
  reviewStatus: string
  reviewNotes: string | null
  createdAt: string
  nurse?: { name: string; role: string }
  nurseCert?: { certType: string } | null
}

export interface ChatMessageRow {
  id: number
  nurseId: number
  phoneNumber: string
  direction: 'inbound' | 'outbound'
  messageText: string
  language: string | null
  intent: string | null
  botResponse: string | null
  handledByBot: boolean
  escalated: boolean
  createdAt: string
  nurse?: { name: string; role: string; whatsappNumber: string | null }
}

export interface StaffCertStats {
  totalNurses: number
  validCerts: number
  expiringSoon: number
  expiredCerts: number
  pendingUploads: number
  optInRate: number
}

// ── Status Calculation ─────────────────────────────────────────────────────────

export function calculateNurseCertStatus(expiryDate: Date | string): {
  status: NurseCertStatus
  label: string
  days: number
} {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expiry = new Date(expiryDate)
  expiry.setHours(0, 0, 0, 0)
  const days = Math.ceil((expiry.getTime() - today.getTime()) / 86400000)

  if (days < 0)   return { status: 'expired',          label: 'Expired',          days }
  if (days <= 30)  return { status: 'expiring',         label: 'Expiring Soon',    days }
  if (days <= 60)  return { status: 'pending_renewal',  label: 'Pending Renewal',  days }
  return               { status: 'valid',             label: 'Valid',            days }
}

export interface StatusBadgeProps {
  label: string
  colorClass: string
  dotClass: string
  bgClass: string
}

export function getNurseCertBadgeProps(status: NurseCertStatus): StatusBadgeProps {
  switch (status) {
    case 'expired':
      return { label: 'Expired',         colorClass: 'text-red-700',    dotClass: 'bg-red-500',    bgClass: 'bg-red-50 border border-red-200' }
    case 'expiring':
      return { label: 'Expiring Soon',   colorClass: 'text-orange-700', dotClass: 'bg-orange-500', bgClass: 'bg-orange-50 border border-orange-200' }
    case 'pending_renewal':
      return { label: 'Pending Renewal', colorClass: 'text-amber-700',  dotClass: 'bg-amber-500',  bgClass: 'bg-amber-50 border border-amber-200' }
    case 'valid':
      return { label: 'Valid',           colorClass: 'text-green-700',  dotClass: 'bg-green-500',  bgClass: 'bg-green-50 border border-green-200' }
  }
}

export function getLogStatusProps(status: string) {
  switch (status) {
    case 'replied':   return { label: 'Replied',   colorClass: 'text-green-700',  bgClass: 'bg-green-50 border border-green-200' }
    case 'read':      return { label: 'Read',       colorClass: 'text-blue-700',   bgClass: 'bg-blue-50 border border-blue-200' }
    case 'delivered': return { label: 'Delivered',  colorClass: 'text-indigo-700', bgClass: 'bg-indigo-50 border border-indigo-200' }
    case 'sent':      return { label: 'Sent',       colorClass: 'text-gray-700',   bgClass: 'bg-gray-50 border border-gray-200' }
    case 'failed':    return { label: 'Failed',     colorClass: 'text-red-700',    bgClass: 'bg-red-50 border border-red-200' }
    default:          return { label: status,       colorClass: 'text-gray-700',   bgClass: 'bg-gray-50 border border-gray-200' }
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function getAvatarColor(name: string): string {
  const colors = [
    'bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500',
    'bg-pink-500', 'bg-teal-500', 'bg-indigo-500', 'bg-red-500',
  ]
  const idx = name.charCodeAt(0) % colors.length
  return colors[idx]
}

export function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1)    return 'just now'
  if (diffMins < 60)   return `${diffMins}m ago`
  if (diffHours < 24)  return `${diffHours}h ago`
  if (diffDays < 7)    return `${diffDays}d ago`
  return date.toLocaleDateString('en-SG', { day: 'numeric', month: 'short' })
}

export function formatSgDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-SG', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

export const LANGUAGE_LABELS: Record<string, string> = {
  en: '🇬🇧 English',
  fil: '🇵🇭 Filipino',
  id: '🇮🇩 Indonesian',
}

export const ROLE_COLORS: Record<string, string> = {
  RN: 'bg-blue-100 text-blue-800',
  EN: 'bg-purple-100 text-purple-800',
  'Care Aide': 'bg-green-100 text-green-800',
}
