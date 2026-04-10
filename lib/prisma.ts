import { PrismaClient } from '@prisma/client'
import path from 'path'
import fs from 'fs'

// On Vercel the filesystem is read-only except /tmp.
// Copy the seeded SQLite DB to /tmp on first request so Prisma can open it.
function getDatabaseUrl(): string {
  if (process.env.VERCEL) {
    const tmpDb = '/tmp/dev.db'
    if (!fs.existsSync(tmpDb)) {
      const src = path.join(process.cwd(), 'prisma', 'dev.db')
      fs.copyFileSync(src, tmpDb)
    }
    return `file:${tmpDb}`
  }
  // Resolve the SQLite DB to an absolute path so it works regardless of CWD
  const dbPath = path.join(process.cwd(), 'prisma', 'dev.db')
  return `file:${dbPath}`
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: { db: { url: getDatabaseUrl() } },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
