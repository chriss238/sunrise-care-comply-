import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')

  const uploads = await prisma.certUpload.findMany({
    where: status ? { reviewStatus: status } : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      nurse: { select: { name: true, role: true } },
      nurseCert: { select: { certType: true } },
    },
  })
  return NextResponse.json(uploads)
}

export async function POST(req: Request) {
  const body = await req.json()
  const upload = await prisma.certUpload.create({
    data: {
      nurseId: Number(body.nurseId),
      nurseCertId: body.nurseCertId ? Number(body.nurseCertId) : null,
      fileUrl: body.fileUrl,
      uploadMethod: body.uploadMethod ?? 'web',
      ocrStatus: 'pending',
      reviewStatus: 'pending',
    },
  })
  return NextResponse.json(upload, { status: 201 })
}
