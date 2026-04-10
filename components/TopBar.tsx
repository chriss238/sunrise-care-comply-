'use client'

import { signOut, useSession } from 'next-auth/react'

export default function TopBar() {
  const { data: session } = useSession()
  const name = session?.user?.name ?? 'Staff'

  return (
    <div className="absolute top-4 right-6 flex flex-col items-end gap-1 z-10">
      <span className="text-[10px] uppercase tracking-[0.15em] text-white/50 font-semibold">
        Ministry of Health · Singapore
      </span>
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-white/70">{name}</span>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="text-[10px] uppercase tracking-wider font-semibold text-white/60 hover:text-white border border-white/20 hover:border-white/50 rounded px-2 py-0.5 transition-all"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}
