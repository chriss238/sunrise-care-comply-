import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateStatus, daysUntil } from '@/lib/utils'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function PATCH(req: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params
  const body = await req.json()

  const item = await prisma.complianceItem.update({
    where: { id: parseInt(id) },
    data: {
      ...(body.category   !== undefined && { category: body.category }),
      ...(body.itemName   !== undefined && { itemName: body.itemName }),
      ...(body.dueDate    !== undefined && { dueDate: new Date(body.dueDate) }),
      ...(body.notes      !== undefined && { notes: body.notes }),
    },
  })

  return NextResponse.json({
    ...item,
    dueDate: item.dueDate.toISOString(),
    completedAt: item.completedAt?.toISOString() ?? null,
    createdAt: item.createdAt.toISOString(),
    status: calculateStatus(item.dueDate),
    daysUntil: daysUntil(item.dueDate),
  })
}

export async function DELETE(_req: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params

  await prisma.complianceItem.update({
    where: { id: parseInt(id) },
    data: { deletedAt: new Date() },
  })

  return NextResponse.json({ success: true })
}
