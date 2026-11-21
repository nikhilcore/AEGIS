
import { useState, type FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'
import { firebaseAuth, googleProvider } from '../firebase'
import { signInWithPopup } from 'firebase/auth'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

interface LoginProps {
  onSignup: () => void
}

export default function Login({ onSignup }: LoginProps) {
  const { login, refreshUser } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (!email.trim() || !password) {
      setError('Please enter both email and password.')
      return
    }

    try {
      setLoading(true)
      await login(email.trim(), password)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to sign in.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError('')

    try {
      setGoogleLoading(true)

      // Open the Google sign-in popup
      const result = await signInWithPopup(
        firebaseAuth,
        googleProvider
      )

      // Obtain the Google ID token
      const idToken = await result.user.getIdToken()

      // Send token to AEGIS backend for verification
      const response = await fetch(`${API_URL}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ idToken }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || 'Google authentication failed.'
        )
      }

      // Load the AEGIS session from the backend cookie
      await refreshUser()
    } catch (err) {
      console.error('Google login error:', err)

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to sign in with Google.'
      )
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F6FF] flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl shadow-[#6045F5]/10 border border-[#E5E7F0] grid lg:grid-cols-2">

        {/* Left panel */}
        <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-[#6045F5] via-[#6045F5] to-[#477BFF] p-12 text-white relative overflow-hidden">
          <div className="absolute -right-24 -top-24 w-80 h-80 rounded-full border border-white/10" />
          <div className="absolute -right-12 -top-12 w-56 h-56 rounded-full border border-white/10" />
          <div className="absolute -left-24 -bottom-24 w-80 h-80 rounded-full bg-white/5" />

          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="w-7 h-7"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M12 2.5 20 6v5.5c0 5-3.4 8.5-8 10-4.6-1.5-8-5-8-10V6l8-3.5Z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-wide">AEGIS</h1>
                <p className="text-xs text-white/70 tracking-[0.2em] uppercase">
                  Cyber Resilience
                </p>
              </div>
            </div>
          </div>

          <div className="relative z-10 max-w-md">
            <p className="text-sm font-medium text-white/70 uppercase tracking-[0.25em] mb-4">
              Security Intelligence Platform
            </p>

            <h2 className="text-4xl xl:text-5xl font-bold leading-tight">
              Protecting the
              <br />
              <span className="text-white/70">digital healthcare</span>
              <br />
              ecosystem.
            </h2>

            <p className="mt-6 text-white/75 leading-7">
              A unified environment for cyber-resilience monitoring,
              threat intelligence, digital-twin analysis and
              incident investigation.
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              {['Threat Intelligence', 'Digital Twin', 'Risk Analytics'].map(
                (item) => (
                  <span
                    key={item}
                    className="px-4 py-2 rounded-full border border-white/20 bg-white/10 text-sm"
                  >
                    {item}
                  </span>
                )
              )}
            </div>
          </div>

          <div className="relative z-10 text-xs text-white/60">
            AEGIS · Educational Cybersecurity Simulation
          </div>
        </div>

        {/* Right panel */}
        <div className="flex items-center justify-center p-6 sm:p-12 lg:p-16">
          <div className="w-full max-w-md">

            {/* Mobile branding */}
            <div className="lg:hidden flex items-center gap-3 mb-10">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6045F5] to-[#477BFF] text-white flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="w-7 h-7"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M12 2.5 20 6v5.5c0 5-3.4 8.5-8 10-4.6-1.5-8-5-8-10V6l8-3.5Z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#11152F]">AEGIS</h1>
                <p className="text-xs text-[#687086]">Cyber Resilience</p>
              </div>
            </div>

            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F5F6FF] text-[#6045F5] text-xs font-semibold mb-5">
                <span className="w-2 h-2 rounded-full bg-[#16A36A]" />
                Secure Access Portal
              </div>

              <h2 className="text-3xl font-bold text-[#11152F]">
                Welcome back
              </h2>

              <p className="mt-3 text-[#687086] leading-6">
                Sign in to access your AEGIS security intelligence
                dashboard.
              </p>
            </div>

            {/* Google Sign-In */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading || loading}
              className="w-full flex items-center justify-center gap-3 rounded-xl border border-[#E5E7F0] bg-white px-4 py-3.5 font-medium text-[#11152F] transition hover:bg-[#F8F9FC] hover:border-[#D1D5E5] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {googleLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#E5E7F0] border-t-[#6045F5]" />
              ) : (
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 48 48"
                >
                  <path
                    fill="#FFC107"
                    d="M43.6 20.5H42V20H24v8h11.3A12 12 0 1 1 24 12a11.8 11.8 0 0 1 7.8 2.9l5.7-5.7A19.9 19.9 0 1 0 24 44a19.9 19.9 0 0 0 19.6-23.5Z"
                  />
                  <path
                    fill="#FF3D00"
                    d="m6.3 14.7 6.6 4.8A12 12 0 0 1 24 12c2.9 0 5.6 1 7.8 2.9l5.7-5.7A19.9 19.9 0 0 0 24 4C16.4 4 9.8 8.3 6.3 14.7Z"
                  />
                  <path
                    fill="#4CAF50"
                    d="M24 44a19.9 19.9 0 0 0 13.5-5.2l-6.2-5.2A12 12 0 0 1 12.8 28l-6.5 5A19.9 19.9 0 0 0 24 44Z"
                  />
                  <path
                    fill="#1976D2"
                    d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-4 5.6l6.2 5.2A19.9 19.9 0 0 0 43.6 20.5Z"
                  />
                </svg>
              )}

              {googleLoading
                ? 'Signing in with Google...'
                : 'Continue with Google'}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-[#E5E7F0]" />
              <span className="text-xs text-[#A0A5B5] uppercase tracking-wider">
                or continue with email
              </span>
              <div className="flex-1 h-px bg-[#E5E7F0]" />
            </div>

            {/* Email/password form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-[#11152F] mb-2"
                >
                  Email address
                </label>

                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-[#E5E7F0] bg-white px-4 py-3.5 text-[#11152F] outline-none transition focus:border-[#6045F5] focus:ring-4 focus:ring-[#6045F5]/10 placeholder:text-[#A0A5B5]"
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-[#11152F] mb-2"
                >
                  Password
                </label>

                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-[#E5E7F0] bg-white px-4 py-3.5 pr-20 text-[#11152F] outline-none transition focus:border-[#6045F5] focus:ring-4 focus:ring-[#6045F5]/10 placeholder:text-[#A0A5B5]"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-[#6045F5] hover:text-[#477BFF]"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || googleLoading}
                className="w-full rounded-xl bg-gradient-to-r from-[#6045F5] to-[#477BFF] px-4 py-3.5 font-semibold text-white shadow-lg shadow-[#6045F5]/20 transition hover:shadow-xl hover:shadow-[#6045F5]/30 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:transform-none"
              >
                {loading ? 'Signing in...' : 'Sign in to AEGIS'}
              </button>
            </form>

            {/* Signup link */}
            <div className="mt-6 text-center text-sm text-[#687086]">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={onSignup}
                className="font-semibold text-[#6045F5] hover:text-[#477BFF] transition"
              >
                Create account
              </button>
            </div>

            {/* Security */}
            <div className="mt-8 border-t border-[#E5E7F0] pt-6">
              <div className="flex items-center gap-3 text-[#687086] text-sm">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="w-5 h-5 text-[#6045F5] shrink-0"
                >
                  <rect x="4" y="10" width="16" height="11" rx="2" />
                  <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                  <path d="M12 14v3" />
                </svg>

                <p>
                  Your authentication session is secured using
                  HTTP-only cookies.
                </p>
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-[#A0A5B5] leading-5">
              AEGIS is an educational cybersecurity simulation.
              It is not connected to live hospital infrastructure.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
