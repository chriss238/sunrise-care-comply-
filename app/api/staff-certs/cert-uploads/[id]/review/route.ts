import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json()
  const upload = await prisma.certUpload.update({
    where: { id: Number(params.id) },
    data: {
      reviewStatus: body.reviewStatus, // 'approved' | 'rejected'
      reviewNotes: body.reviewNotes ?? null,
      approvedAt: body.reviewStatus === 'approved' ? new Date() : null,
    },
  })
  return NextResponse.json(upload)
}
