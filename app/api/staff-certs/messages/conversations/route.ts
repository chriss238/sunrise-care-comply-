import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  // Get the last message per nurse, ordered by most recent
  const nurses = await prisma.nurse.findMany({
    where: { chatMessages: { some: {} } },
    include: {
      chatMessages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
      _count: { select: { chatMessages: true } },
    },
    orderBy: { updatedAt: 'desc' },
  })

  const conversations = nurses.map((n) => ({
    nurseId: n.id,
    nurseName: n.name,
    nurseRole: n.role,
    whatsappNumber: n.whatsappNumber,
    preferredLanguage: n.preferredLanguage,
    lastMessage: n.chatMessages[0] ?? null,
    messageCount: n._count.chatMessages,
  }))

  return NextResponse.json(conversations)
}
