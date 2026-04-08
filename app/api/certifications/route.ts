import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCertStatus } from '@/lib/certifications'

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

export async function GET() {
  const certs = await prisma.certification.findMany({
    where: { deletedAt: null },
    orderBy: { expiryDate: 'asc' },
  })

  return NextResponse.json(certs.map(serializeCert))
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  if (!body.category || !body.type || !body.holderName || !body.expiryDate || !body.issuingBody) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const cert = await prisma.certification.create({
    data: {
      facilityId: Number(body.facilityId),
      category: body.category,
      type: body.type,
      holderName: body.holderName,
      certNumber: body.certNumber || null,
      issuingBody: body.issuingBody,
      issueDate: body.issueDate ? new Date(body.issueDate) : null,
      expiryDate: new Date(body.expiryDate),
      renewalDate: body.renewalDate ? new Date(body.renewalDate) : null,
      notes: body.notes || null,
    },
  })

  return NextResponse.json(serializeCert(cert), { status: 201 })
}
