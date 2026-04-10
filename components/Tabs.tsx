'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { href: '/',                              label: '🏥 Dashboard' },
  { href: '/staff-certs/nurses',            label: '👥 Staff Details' },
  { href: '/certifications',                label: '📋 All Certifications' },
  { href: '/staff-certs/notifications',     label: '🔔 Notifications' },
  { href: '/staff-certs/cert-uploads',      label: '📤 Cert Upload' },
  { href: '/staff-certs/messages',          label: '💬 Messages' },
  { href: '/settings',                      label: '⚙️ Settings' },
]

export default function Tabs() {
  const pathname = usePathname()

  return (
    <div
      className="flex flex-wrap gap-1 border-b-2"
      style={{ borderColor: 'rgba(255,255,255,0.1)' }}
      role="tablist"
      aria-label="Application navigation"
    >
      {TABS.map(({ href, label }) => {
        const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            role="tab"
            aria-selected={isActive}
            className={[
              'relative px-4 py-3 text-sm font-semibold transition-colors duration-200 whitespace-nowrap',
              'focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-white/50',
              isActive
                ? 'text-white tab-active-link'
                : 'text-white/70 hover:text-white hover:bg-white/5',
            ].join(' ')}
          >
            {label}
          </Link>
        )
      })}
    </div>
  )
}
