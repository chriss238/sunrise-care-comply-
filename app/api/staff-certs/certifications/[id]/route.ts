import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json()
  const cert = await prisma.nurseCert.update({
    where: { id: Number(params.id) },
    data: {
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
  return NextResponse.json(cert)
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  await prisma.nurseCert.delete({ where: { id: Number(params.id) } })
  return new NextResponse(null, { status: 204 })
}
