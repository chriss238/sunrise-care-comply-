import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateStatus, daysUntil } from '@/lib/utils'

export async function GET() {
  const items = await prisma.complianceItem.findMany({
    where: { deletedAt: null },
    orderBy: [{ category: 'asc' }, { dueDate: 'asc' }],
  })

  const itemsWithStatus = items.map((item) => ({
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
  }))

  return NextResponse.json(itemsWithStatus)
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  if (!body.facilityId || !body.category || !body.itemName || !body.dueDate) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const item = await prisma.complianceItem.create({
    data: {
      facilityId: Number(body.facilityId),
      category: body.category,
      itemName: body.itemName,
      dueDate: new Date(body.dueDate),
      notes: body.notes ?? null,
    },
  })

  return NextResponse.json(
    {
      ...item,
      dueDate: item.dueDate.toISOString(),
      completedAt: item.completedAt?.toISOString() ?? null,
      createdAt: item.createdAt.toISOString(),
      status: calculateStatus(item.dueDate),
      daysUntil: daysUntil(item.dueDate),
    },
    { status: 201 }
  )
}
