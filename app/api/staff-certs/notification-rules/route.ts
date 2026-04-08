import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const rules = await prisma.notificationRule.findMany({ orderBy: { daysBeforeExpiry: 'desc' } })
  return NextResponse.json(rules)
}

export async function POST(req: Request) {
  const body = await req.json()
  const rule = await prisma.notificationRule.create({
    data: {
      certType: body.certType ?? 'All Certifications',
      daysBeforeExpiry: Number(body.daysBeforeExpiry),
      templateEn: body.templateEn,
      templateFil: body.templateFil ?? null,
      templateId: body.templateId ?? null,
      active: body.active ?? true,
      escalateToAdmin: body.escalateToAdmin ?? false,
      escalateDays: body.escalateDays ? Number(body.escalateDays) : null,
    },
  })
  return NextResponse.json(rule, { status: 201 })
}
