import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendWhatsAppReminder } from '@/lib/whatsapp'

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0)
}

function endOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999)
}

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const target = new Date()
  target.setDate(target.getDate() + 30)

  // Find nurse certs expiring in exactly 30 days for nurses with WhatsApp opt-in
  const expiringCerts = await prisma.nurseCert.findMany({
    where: {
      expiryDate: {
        gte: startOfDay(target),
        lte: endOfDay(target),
      },
      nurse: {
        whatsappOptIn: true,
        whatsappNumber: { not: null },
      },
    },
    include: { nurse: true },
  })

  let sent = 0
  let failed = 0

  for (const cert of expiringCerts) {
    // Duplicate guard: skip if already notified today for this cert
    const alreadySent = await prisma.notificationLog.findFirst({
      where: {
        nurseCertId: cert.id,
        createdAt: {
          gte: startOfDay(new Date()),
          lte: endOfDay(new Date()),
        },
        status: 'sent',
      },
    })
    if (alreadySent) continue

    const expiryStr = cert.expiryDate.toLocaleDateString('en-SG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
    const messageText = `Hi ${cert.nurse.name}, your ${cert.certType} expires in 30 days (Due: ${expiryStr}). Please renew before expiry.`

    try {
      await sendWhatsAppReminder(
        cert.nurse.whatsappNumber!,
        cert.nurse.name,
        cert.certType,
        expiryStr
      )

      await prisma.notificationLog.create({
        data: {
          nurseCertId: cert.id,
          recipientId: cert.nurseId,
          phoneNumber: cert.nurse.whatsappNumber!,
          language: cert.nurse.preferredLanguage,
          messageText,
          sentAt: new Date(),
          status: 'sent',
        },
      })
      sent++
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Unknown error'
      await prisma.notificationLog.create({
        data: {
          nurseCertId: cert.id,
          recipientId: cert.nurseId,
          phoneNumber: cert.nurse.whatsappNumber!,
          language: cert.nurse.preferredLanguage,
          messageText,
          status: 'failed',
          replyText: errMsg,
        },
      })
      failed++
    }
  }

  return NextResponse.json({ sent, failed, total: expiringCerts.length })
}
