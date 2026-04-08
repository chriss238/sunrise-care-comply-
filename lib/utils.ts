import type { ItemStatus } from './types'

export function daysUntil(dueDate: Date | string): number {
  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.ceil((due.getTime() - today.getTime()) / 86400000)
}

export function calculateStatus(dueDate: Date | string): ItemStatus {
  const days = daysUntil(dueDate)
  if (days < 0) return 'overdue'
  if (days <= 30) return 'soon'
  return 'ok'
}

export function formatSgDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-SG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
