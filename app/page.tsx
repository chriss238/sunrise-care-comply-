import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { calculateStatus, daysUntil } from '@/lib/utils'
import type { ItemWithStatus, FacilitySummary } from '@/lib/types'
import Dashboard from '@/components/Dashboard'

export default async function Home() {
  const session = await auth()
  const currentUserName = session?.user?.name ?? 'Staff'
  const facility = await prisma.facility.findFirst({
    orderBy: { id: 'asc' },
  })

  if (!facility) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-4">🏥</div>
          <p className="text-lg font-medium">No facility found.</p>
          <p className="text-sm mt-1">Run <code className="bg-gray-100 px-1.5 py-0.5 rounded">npm run db:seed</code> to set up demo data.</p>
        </div>
      </div>
    )
  }

  const rawItems = await prisma.complianceItem.findMany({
    where: { facilityId: facility.id, deletedAt: null },
    orderBy: [{ category: 'asc' }, { dueDate: 'asc' }],
    include: { attachments: { select: { id: true, filename: true, fileUrl: true } } },
  })

  const facilitySummary: FacilitySummary = {
    id: facility.id,
    name: facility.name,
    mohLicense: facility.mohLicense,
    lastAuditDate: facility.lastAuditDate.toISOString(),
  }

  const items: ItemWithStatus[] = rawItems.map((item) => ({
    id: item.id,
    facilityId: item.facilityId,
    category: item.category,
    itemName: item.itemName,
    dueDate: item.dueDate.toISOString(),
    notes: item.notes,
    completedAt: item.completedAt?.toISOString() ?? null,
    completedBy: item.completedBy,
    status: calculateStatus(item.dueDate),
    daysUntil: daysUntil(item.dueDate),
    attachments: item.attachments,
  }))

  return (
    <Dashboard
      facility={facilitySummary}
      initialItems={items}
      currentUserName={currentUserName}
    />
  )
}
