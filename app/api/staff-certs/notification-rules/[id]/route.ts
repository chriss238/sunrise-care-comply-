import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json()
  const rule = await prisma.notificationRule.update({
    where: { id: Number(params.id) },
    data: {
      certType: body.certType,
      daysBeforeExpiry: body.daysBeforeExpiry !== undefined ? Number(body.daysBeforeExpiry) : undefined,
      templateEn: body.templateEn,
      templateFil: body.templateFil ?? null,
      templateId: body.templateId ?? null,
      active: body.active,
      escalateToAdmin: body.escalateToAdmin,
      escalateDays: body.escalateDays ? Number(body.escalateDays) : null,
    },
  })
  return NextResponse.json(rule)
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  await prisma.notificationRule.delete({ where: { id: Number(params.id) } })
  return new NextResponse(null, { status: 204 })
}
