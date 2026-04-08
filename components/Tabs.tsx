'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { href: '/',                label: '🏥 Dashboard' },
  { href: '/certifications',  label: '📋 Certifications' },
  { href: '/staff-certs',     label: '👥 Staff Certs' },
]

export default function Tabs() {
  const pathname = usePathname()

  return (
    <div
      className="flex gap-1 border-b-2"
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
              'relative px-6 py-3 text-sm font-semibold transition-colors duration-200',
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
