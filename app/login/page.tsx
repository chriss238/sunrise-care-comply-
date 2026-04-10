import { loginAction } from './actions'

interface Props {
  searchParams: { error?: string; callbackUrl?: string }
}

export default function LoginPage({ searchParams }: Props) {
  // NextAuth redirects here with ?error=CredentialsSignin on bad credentials
  const hasError = !!searchParams.error

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg, #151f42 0%, #1f2d5c 100%)' }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8">
        {/* Branding */}
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl mx-auto mb-4"
            style={{
              background: 'linear-gradient(135deg, #ed5e68 0%, #d13844 100%)',
              boxShadow: '0 4px 12px rgba(237,94,104,0.3)',
            }}
          >
            🏥
          </div>
          <h1 className="text-xl font-bold" style={{ color: '#1f2d5c' }}>
            Sunrise Care Home
          </h1>
          <p className="text-sm text-gray-500 mt-1">Compliance Dashboard</p>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">
            Ministry of Health · Singapore
          </p>
        </div>

        <form action={loginAction} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent"
              defaultValue="admin@sunrisecare.sg"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent"
              defaultValue="password123"
            />
          </div>

          {hasError && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2.5 text-sm">
              Invalid email or password. Please try again.
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg text-sm font-semibold text-white uppercase tracking-wider transition-all hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
            style={{ background: 'linear-gradient(135deg, #1f2d5c 0%, #151f42 100%)' }}
          >
            Sign In
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          Protected · PDPA compliant
        </p>
      </div>
    </div>
  )
}
