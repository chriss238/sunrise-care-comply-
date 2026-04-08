import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import StaffCertsLayout from '@/components/staff-certs/StaffCertsLayout'

const VALID_TABS = ['dashboard', 'nurses', 'user-details', 'certifications', 'notifications', 'cert-uploads', 'messages']

export default async function StaffCertsTabPage({ params }: { params: { tab: string } }) {
  if (!VALID_TABS.includes(params.tab)) notFound()

  const facility = await prisma.facility.findFirst({ orderBy: { id: 'asc' } })
  if (!facility) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-4">🏥</div>
          <p className="text-lg font-medium">No facility found.</p>
          <p className="text-sm mt-1">Run <code className="bg-gray-100 px-1.5 py-0.5 rounded">npm run db:seed</code> to set up demo data.</p>
        </div>
      </div>
    )
  }

  return (
    <StaffCertsLayout
      activeTab={params.tab}
      facilityName={facility.name}
      mohLicense={facility.mohLicense}
    />
  )
}
