import type { NextAuthConfig } from 'next-auth'

// Edge-safe config — no Node.js builtins, no Prisma
// Used by middleware to verify JWT without touching the DB
export const authConfig: NextAuthConfig = {
  pages: { signIn: '/login' },
  callbacks: {
    authorized({ auth }) {
      return !!auth?.user
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role?: string }).role
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  session: { strategy: 'jwt', maxAge: 30 * 60 },
  providers: [], // providers added in auth.ts
}
