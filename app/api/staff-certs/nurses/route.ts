import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const facility = await prisma.facility.findFirst({ orderBy: { id: 'asc' } })
  if (!facility) return NextResponse.json({ error: 'No facility' }, { status: 404 })

  const nurses = await prisma.nurse.findMany({
    where: { facilityId: facility.id },
    orderBy: { name: 'asc' },
    include: { _count: { select: { nurseCerts: true } } },
  })
  return NextResponse.json(nurses)
}

export async function POST(req: Request) {
  const facility = await prisma.facility.findFirst({ orderBy: { id: 'asc' } })
  if (!facility) return NextResponse.json({ error: 'No facility' }, { status: 404 })

  const body = await req.json()
  const nurse = await prisma.nurse.create({
    data: {
      facilityId: facility.id,
      name: body.name,
      email: body.email,
      role: body.role,
      employeeId: body.employeeId ?? null,
      whatsappNumber: body.whatsappNumber ?? null,
      whatsappOptIn: body.whatsappOptIn ?? false,
      preferredLanguage: body.preferredLanguage ?? 'en',
      alternativePhone: body.alternativePhone ?? null,
      dateJoined: body.dateJoined ? new Date(body.dateJoined) : null,
      internalNotes: body.internalNotes ?? null,
    },
  })
  return NextResponse.json(nurse, { status: 201 })
}
