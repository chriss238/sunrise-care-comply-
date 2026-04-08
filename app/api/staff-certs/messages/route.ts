import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendWhatsAppMessage } from '@/lib/mock/whatsapp'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const nurseId = searchParams.get('nurseId')

  const messages = await prisma.chatMessage.findMany({
    where: nurseId ? { nurseId: Number(nurseId) } : undefined,
    orderBy: { createdAt: 'asc' },
    include: { nurse: { select: { name: true, role: true, whatsappNumber: true } } },
  })
  return NextResponse.json(messages)
}

export async function POST(req: Request) {
  const body = await req.json()
  const nurse = await prisma.nurse.findUnique({ where: { id: Number(body.nurseId) } })
  if (!nurse) return NextResponse.json({ error: 'Nurse not found' }, { status: 404 })

  if (body.direction === 'outbound' && nurse.whatsappNumber) {
    await sendWhatsAppMessage(nurse.whatsappNumber, body.messageText, nurse.preferredLanguage)
  }

  const message = await prisma.chatMessage.create({
    data: {
      nurseId: Number(body.nurseId),
      phoneNumber: nurse.whatsappNumber ?? body.phoneNumber ?? '',
      direction: body.direction,
      messageText: body.messageText,
      language: body.language ?? null,
      intent: body.intent ?? null,
      handledByBot: body.handledByBot ?? false,
    },
  })
  return NextResponse.json(message, { status: 201 })
}
