import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function POST(req: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params
  const body = await req.json().catch(() => ({}))
  const now = new Date()
  const itemId = parseInt(id)
  const completedBy: string = body.completedBy ?? 'Staff'

  const [log] = await Promise.all([
    prisma.completionLog.create({
      data: {
        itemId,
        completedBy,
        notes: body.notes ?? null,
        completedAt: now,
      },
    }),
    prisma.complianceItem.update({
      where: { id: itemId },
      data: { completedAt: now, completedBy },
    }),
  ])

  return NextResponse.json(
    {
      ...log,
      completedAt: log.completedAt.toISOString(),
      createdAt: log.createdAt.toISOString(),
    },
    { status: 201 }
  )
}
