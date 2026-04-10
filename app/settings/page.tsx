import { auth } from '@/lib/auth'
import SettingsClient from '@/components/SettingsClient'

export default async function SettingsPage() {
  const session = await auth()
  const currentUserName = session?.user?.name ?? 'Admin'
  return <SettingsClient currentUserName={currentUserName} />
}
