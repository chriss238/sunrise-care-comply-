import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const certs = await prisma.nurseCert.findMany({
    orderBy: { expiryDate: 'asc' },
    include: { nurse: { select: { name: true, role: true } } },
  })
  return NextResponse.json(certs)
}

export async function POST(req: Request) {
  const body = await req.json()
  const cert = await prisma.nurseCert.create({
    data: {
      nurseId: Number(body.nurseId),
      certType: body.certType,
      certNumber: body.certNumber,
      holderName: body.holderName,
      issuingBody: body.issuingBody,
      issueDate: body.issueDate ? new Date(body.issueDate) : null,
      expiryDate: new Date(body.expiryDate),
      renewalDate: body.renewalDate ? new Date(body.renewalDate) : null,
      attachmentUrl: body.attachmentUrl ?? null,
    },
  })
  return NextResponse.json(cert, { status: 201 })
}
