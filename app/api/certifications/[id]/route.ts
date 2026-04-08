import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCertStatus } from '@/lib/certifications'

interface RouteContext {
  params: Promise<{ id: string }>
}

function serializeCert(cert: {
  id: number; facilityId: number; category: string; type: string
  holderName: string; certNumber: string | null; issuingBody: string
  issueDate: Date | null; expiryDate: Date; renewalDate: Date | null
  notes: string | null; attachmentUrl: string | null
  createdAt: Date; updatedAt: Date
}) {
  const { status, label, days } = getCertStatus(cert.expiryDate, cert.renewalDate)
  return {
    id: cert.id,
    facilityId: cert.facilityId,
    category: cert.category,
    type: cert.type,
    holderName: cert.holderName,
    certNumber: cert.certNumber,
    issuingBody: cert.issuingBody,
    issueDate: cert.issueDate?.toISOString() ?? null,
    expiryDate: cert.expiryDate.toISOString(),
    renewalDate: cert.renewalDate?.toISOString() ?? null,
    notes: cert.notes,
    attachmentUrl: cert.attachmentUrl,
    createdAt: cert.createdAt.toISOString(),
    updatedAt: cert.updatedAt.toISOString(),
    status,
    statusLabel: label,
    days,
  }
}

export async function PATCH(req: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params
  const body = await req.json()

  const cert = await prisma.certification.update({
    where: { id: parseInt(id) },
    data: {
      ...(body.category    !== undefined && { category: body.category }),
      ...(body.type        !== undefined && { type: body.type }),
      ...(body.holderName  !== undefined && { holderName: body.holderName }),
      ...(body.certNumber  !== undefined && { certNumber: body.certNumber || null }),
      ...(body.issuingBody !== undefined && { issuingBody: body.issuingBody }),
      ...(body.issueDate   !== undefined && { issueDate: body.issueDate ? new Date(body.issueDate) : null }),
      ...(body.expiryDate  !== undefined && { expiryDate: new Date(body.expiryDate) }),
      ...(body.renewalDate !== undefined && { renewalDate: body.renewalDate ? new Date(body.renewalDate) : null }),
      ...(body.notes       !== undefined && { notes: body.notes || null }),
    },
  })

  return NextResponse.json(serializeCert(cert))
}

export async function DELETE(_req: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params
  await prisma.certification.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ success: true })
}
