import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const nurse = await prisma.nurse.findUnique({
    where: { id: Number(params.id) },
    include: { nurseCerts: { orderBy: { expiryDate: 'asc' } } },
  })
  if (!nurse) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(nurse)
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json()
  const nurse = await prisma.nurse.update({
    where: { id: Number(params.id) },
    data: {
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
  return NextResponse.json(nurse)
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  await prisma.nurse.delete({ where: { id: Number(params.id) } })
  return new NextResponse(null, { status: 204 })
}
