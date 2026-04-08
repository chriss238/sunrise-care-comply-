import { prisma } from '@/lib/prisma'
import { getCertStatus } from '@/lib/certifications'
import type { CertWithStatus } from '@/lib/certifications'
import CertificationsClient from '@/components/certifications/CertificationsClient'

export const metadata = {
  title: 'Certifications | Sunrise Care Home',
}

export default async function CertificationsPage() {
  const facility = await prisma.facility.findFirst({ orderBy: { id: 'asc' } })

  if (!facility) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-4">📋</div>
          <p className="text-lg font-medium">No facility found.</p>
          <p className="text-sm mt-1">
            Run <code className="bg-gray-100 px-1.5 py-0.5 rounded">npm run db:seed</code> to set up demo data.
          </p>
        </div>
      </div>
    )
  }

  const rawCerts = await prisma.certification.findMany({
    where: { deletedAt: null, facilityId: facility.id },
    orderBy: { expiryDate: 'asc' },
  })

  const certs: CertWithStatus[] = rawCerts.map((c) => {
    const { status, label, days } = getCertStatus(c.expiryDate, c.renewalDate)
    return {
      id: c.id,
      facilityId: c.facilityId,
      category: c.category,
      type: c.type,
      holderName: c.holderName,
      certNumber: c.certNumber,
      issuingBody: c.issuingBody,
      issueDate: c.issueDate?.toISOString() ?? null,
      expiryDate: c.expiryDate.toISOString(),
      renewalDate: c.renewalDate?.toISOString() ?? null,
      notes: c.notes,
      attachmentUrl: c.attachmentUrl,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
      status,
      statusLabel: label,
      days,
    }
  })

  return (
    <CertificationsClient
      initialCerts={certs}
      facilityId={facility.id}
      facilityName={facility.name}
      mohLicense={facility.mohLicense}
    />
  )
}
