import type { ItemWithStatus, FacilitySummary } from '@/lib/types'

const CATEGORIES = [
  'Staff certifications',
  'MOH licensing',
  'Facility audits',
  'Medication protocols',
  'Resident care plans',
]

const NAVY  = [31, 45, 92]  as [number, number, number]
const CORAL = [237, 94, 104] as [number, number, number]
const GRAY  = [73, 80, 87]   as [number, number, number]
const LIGHT = [233, 236, 239] as [number, number, number]
const GREEN = [0, 184, 148]  as [number, number, number]
const RED   = [214, 48, 49]  as [number, number, number]
const AMBER = [243, 156, 18] as [number, number, number]
const WHITE = [255, 255, 255] as [number, number, number]

function daysFrom(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86_400_000)
}

export async function generateMOHAuditReport(
  items: ItemWithStatus[],
  facility: FacilitySummary
): Promise<void> {
  // Dynamic imports to avoid SSR issues
  const { jsPDF } = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageW = 210
  const margin = 18
  let y = 0

  // ── Header block ──────────────────────────────────────────────────────────
  doc.setFillColor(...NAVY)
  doc.rect(0, 0, pageW, 48, 'F')

  doc.setTextColor(...WHITE)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('MINISTRY OF HEALTH · SINGAPORE', pageW - margin, 10, { align: 'right' })

  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text(facility.name, margin, 22)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`License: ${facility.mohLicense}`, margin, 30)

  doc.setFontSize(9)
  doc.text(
    `MOH Compliance Audit Report  ·  Generated: ${new Date().toLocaleDateString('en-SG', { day: 'numeric', month: 'long', year: 'numeric' })}`,
    margin, 38
  )

  y = 58

  // ── Coral rule ────────────────────────────────────────────────────────────
  doc.setDrawColor(...CORAL)
  doc.setLineWidth(0.8)
  doc.line(margin, y - 4, pageW - margin, y - 4)

  // ── Compliance Summary ────────────────────────────────────────────────────
  doc.setTextColor(...NAVY)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text('Compliance Summary', margin, y)
  y += 7

  const summaryBody: (string | number)[][] = []
  let grandTotal = 0, grandOverdue = 0, grandSoon = 0, grandOk = 0

  for (const cat of CATEGORIES) {
    const ci = items.filter((i) => i.category === cat)
    if (!ci.length) continue
    const ov = ci.filter((i) => i.status === 'overdue' && !i.completedAt).length
    const so = ci.filter((i) => i.status === 'soon'    && !i.completedAt).length
    const ok = ci.filter((i) => i.status === 'ok'      && !i.completedAt).length
    summaryBody.push([cat, ci.length, ov, so, ok])
    grandTotal   += ci.length
    grandOverdue += ov
    grandSoon    += so
    grandOk      += ok
  }
  summaryBody.push(['TOTAL', grandTotal, grandOverdue, grandSoon, grandOk])

  autoTable(doc, {
    startY: y,
    head: [['Category', 'Total', 'Overdue', 'Due Soon', 'Compliant']],
    body: summaryBody,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { halign: 'center' },
      2: { halign: 'center', textColor: RED },
      3: { halign: 'center', textColor: AMBER },
      4: { halign: 'center', textColor: GREEN },
    },
    footStyles: { fillColor: LIGHT, textColor: NAVY, fontStyle: 'bold' },
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 14

  // ── Detailed Items ────────────────────────────────────────────────────────
  doc.setTextColor(...NAVY)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text('Detailed Compliance Items', margin, y)
  y += 4

  doc.setDrawColor(...CORAL)
  doc.setLineWidth(0.5)
  doc.line(margin, y, pageW - margin, y)
  y += 8

  for (const cat of CATEGORIES) {
    const ci = items.filter((i) => i.category === cat)
    if (!ci.length) continue

    if (y > 255) { doc.addPage(); y = 20 }

    // Category heading bar
    doc.setFillColor(...LIGHT)
    doc.rect(margin, y - 1.5, pageW - margin * 2, 8, 'F')
    doc.setTextColor(...NAVY)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text(cat.toUpperCase(), margin + 2, y + 4.5)
    y += 12

    for (const item of ci) {
      if (y > 268) { doc.addPage(); y = 20 }

      const days = daysFrom(item.dueDate)
      let statusColor = GREEN
      let statusLabel = `${days}d left`
      if (item.completedAt) {
        statusColor = [120, 130, 140]
        statusLabel = 'Completed'
      } else if (item.status === 'overdue') {
        statusColor = RED
        statusLabel = `Overdue ${Math.abs(days)}d`
      } else if (item.status === 'soon') {
        statusColor = AMBER
        statusLabel = `${days}d left`
      }

      const completedBadge = item.completedAt ? '✓' : '○'
      doc.setTextColor(...GRAY)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')

      const nameLines = doc.splitTextToSize(`${completedBadge} ${item.itemName}`, 105)
      doc.text(nameLines, margin + 2, y)

      const dueTxt = new Date(item.dueDate).toLocaleDateString('en-SG', {
        day: 'numeric', month: 'short', year: 'numeric',
      })
      doc.text(`Due: ${dueTxt}`, 128, y)

      doc.setTextColor(...statusColor as [number, number, number])
      doc.setFont('helvetica', 'bold')
      doc.text(statusLabel, pageW - margin, y, { align: 'right' })

      y += nameLines.length > 1 ? nameLines.length * 5.5 + 1 : 7
    }
    y += 4
  }

  // ── Footer / Signature ────────────────────────────────────────────────────
  if (y > 255) { doc.addPage(); y = 20 }
  y += 8

  doc.setDrawColor(...LIGHT)
  doc.setLineWidth(0.5)
  doc.line(margin, y, pageW - margin, y)
  y += 7

  doc.setTextColor(...GRAY)
  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'normal')
  doc.text('Report generated by Zafyre Comply  ·  Ministry of Health, Singapore', pageW / 2, y, { align: 'center' })
  y += 10

  doc.setFontSize(9)
  doc.text('Administrator Signature: ___________________________', margin, y)
  doc.text('Date: _______________', pageW - margin, y, { align: 'right' })
  y += 9
  doc.text('Designation: ___________________________', margin, y)

  const dateStr = new Date().toISOString().slice(0, 10)
  doc.save(`MOH-Audit-Report-${dateStr}.pdf`)
}
