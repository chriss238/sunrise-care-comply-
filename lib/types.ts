export type ItemStatus = 'overdue' | 'soon' | 'ok'
export type FilterType = 'all' | 'overdue' | 'soon' | 'staff' | 'facility' | 'medication'

export interface AttachmentSummary {
  id: number
  filename: string
  fileUrl: string
}

export interface ItemWithStatus {
  id: number
  facilityId: number
  category: string
  itemName: string
  dueDate: string
  notes: string | null
  completedAt: string | null
  completedBy: string | null
  status: ItemStatus
  daysUntil: number
  attachments: AttachmentSummary[]
}

export interface FacilitySummary {
  id: number
  name: string
  mohLicense: string
  lastAuditDate: string
}
