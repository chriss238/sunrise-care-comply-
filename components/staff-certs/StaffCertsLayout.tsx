'use client'

import Link from 'next/link'
import Tabs from '@/components/Tabs'
import TopBar from '@/components/TopBar'
import { formatSgDate } from '@/lib/utils'
import DashboardPage from './pages/DashboardPage'
import NursesPage from './pages/NursesPage'
import UserDetailsPage from './pages/UserDetailsPage'
import CertificationsPage from './pages/CertificationsPage'
import NotificationsPage from './pages/NotificationsPage'
import CertUploadsPage from './pages/CertUploadsPage'
import MessagesPage from './pages/MessagesPage'
import { Suspense } from 'react'

const SUB_TABS = [
  { id: 'nurses',          label: '👩‍⚕️ Staff Details' },
  { id: 'notifications',   label: '🔔 Notifications' },
  { id: 'cert-uploads',    label: '📤 Cert Uploads' },
  { id: 'messages',        label: '💬 Messages' },
]

interface Props {
  activeTab: string
  facilityName: string
  mohLicense: string
}

function renderPage(tab: string) {
  switch (tab) {
    case 'dashboard':      return <DashboardPage />
    case 'nurses':         return <NursesPage />
    case 'user-details':   return <Suspense><UserDetailsPage /></Suspense>
    case 'certifications': return <CertificationsPage />
    case 'notifications':  return <NotificationsPage />
    case 'cert-uploads':   return <CertUploadsPage />
    case 'messages':       return <MessagesPage />
    default:               return <DashboardPage />
  }
}

export default function StaffCertsLayout({ activeTab, facilityName, mohLicense }: Props) {
  return (
    <>
      {/* ── Header ── */}
      <header
        className="relative overflow-hidden header-glow"
        style={{ background: 'linear-gradient(135deg, #151f42 0%, #1f2d5c 100%)' }}
      >
        <TopBar />

        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-6 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #ed5e68 0%, #d13844 100%)',
                  boxShadow: '0 4px 12px rgba(237,94,104,0.3)',
                }}
              >
                👥
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">{facilityName}</h1>
                <div className="flex items-center gap-1.5 text-sm text-white/85 font-medium mt-0.5">
                  <span>License:</span>
                  <span className="px-2.5 py-0.5 rounded-md text-[13px] border border-white/20" style={{ background: 'rgba(255,255,255,0.15)' }}>
                    {mohLicense}
                  </span>
                </div>
              </div>
            </div>
            <div className="sm:text-right">
              <div className="text-xs uppercase tracking-widest text-white/75 font-semibold mb-1">Module</div>
              <div className="text-lg font-bold text-white">Staff Certifications</div>
            </div>
          </div>
        </div>

        {/* Main tabs */}
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <Tabs />
        </div>
      </header>

      {/* ── Sub-tabs + content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
        {/* Sub-tab nav */}
        <div className="flex gap-1 overflow-x-auto pb-1 mb-6 border-b border-gray-200">
          {SUB_TABS.map(({ id, label }) => {
            const isActive = id === activeTab
            return (
              <Link
                key={id}
                href={`/staff-certs/${id}`}
                className={[
                  'relative px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors rounded-t-lg',
                  isActive
                    ? 'text-[#1e2a4a] bg-white border-x border-t border-gray-200 -mb-px'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50',
                ].join(' ')}
              >
                {label}
                {isActive && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{ background: 'var(--sg-coral)' }}
                  />
                )}
              </Link>
            )
          })}
        </div>

        {/* Page content */}
        <div>{renderPage(activeTab)}</div>
      </div>
    </>
  )
}
