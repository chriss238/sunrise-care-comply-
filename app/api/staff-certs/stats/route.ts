import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateNurseCertStatus } from '@/lib/staff-certs'

export async function GET() {
  const facility = await prisma.facility.findFirst({ orderBy: { id: 'asc' } })
  if (!facility) return NextResponse.json({ error: 'No facility' }, { status: 404 })

  const [totalNurses, allCerts, pendingUploads, optInNurses] = await Promise.all([
    prisma.nurse.count({ where: { facilityId: facility.id } }),
    prisma.nurseCert.findMany({ select: { expiryDate: true } }),
    prisma.certUpload.count({ where: { reviewStatus: 'pending' } }),
    prisma.nurse.count({ where: { facilityId: facility.id, whatsappOptIn: true } }),
  ])

  let validCerts = 0, expiringSoon = 0, expiredCerts = 0

  for (const cert of allCerts) {
    const { status } = calculateNurseCertStatus(cert.expiryDate)
    if (status === 'valid' || status === 'pending_renewal') validCerts++
    else if (status === 'expiring') expiringSoon++
    else if (status === 'expired') expiredCerts++
  }

  const stats = {
    totalNurses,
    validCerts,
    expiringSoon,
    expiredCerts,
    pendingUploads,
    optInRate: totalNurses > 0 ? Math.round((optInNurses / totalNurses) * 100) : 0,
  }

  return NextResponse.json(stats)
}
