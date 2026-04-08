import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')

  const logs = await prisma.notificationLog.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      recipient: { select: { name: true, role: true } },
      nurseCert: { select: { certType: true } },
    },
  })
  return NextResponse.json(logs)
}
