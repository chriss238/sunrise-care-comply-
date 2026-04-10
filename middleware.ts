import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth.config'

// Use the edge-safe config so middleware never imports Prisma / Node.js builtins
export default NextAuth(authConfig).auth

export const config = {
  matcher: ['/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)'],
}
