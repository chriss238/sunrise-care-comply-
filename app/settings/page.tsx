import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import SettingsClient from '@/components/SettingsClient'

export default async function SettingsPage() {
  const [session, facility] = await Promise.all([
    auth(),
    prisma.facility.findFirst({ orderBy: { id: 'asc' } }),
  ])
  const currentUserName = session?.user?.name ?? 'Admin'
  return (
    <SettingsClient
      currentUserName={currentUserName}
      facilityName={facility?.name ?? 'Sunrise Care Home'}
      mohLicense={facility?.mohLicense ?? '—'}
    />
  )
}
