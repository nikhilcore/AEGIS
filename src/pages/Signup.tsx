
import { useState, type FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'

interface SignupProps {
  onBackToLogin: () => void
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function Signup({ onBackToLogin }: SignupProps) {
  const { login } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Please fill in all fields.')
      return
    }

    if (name.trim().length < 2) {
      setError('Name must contain at least 2 characters.')
      return
    }

    if (password.length < 8) {
      setError('Password must contain at least 8 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    try {
      setLoading(true)

      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to create account.')
      }

      // Synchronise the frontend authentication state.
      await login(email.trim(), password)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to create account.'
      )
    } finally {
      setLoading(false)
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
              Build a safer
              <br />
              <span className="text-white/70">digital healthcare</span>
              <br />
              environment.
            </h2>

            <p className="mt-6 text-white/75 leading-7">
              Join AEGIS to explore cyber-resilience monitoring,
              threat intelligence, digital-twin analysis and
              simulated incident investigation.
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
            <div className="lg:hidden flex items-center gap-3 mb-8">
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

            <div className="mb-7">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F5F6FF] text-[#6045F5] text-xs font-semibold mb-5">
                <span className="w-2 h-2 rounded-full bg-[#16A36A]" />
                Create Account
              </div>

              <h2 className="text-3xl font-bold text-[#11152F]">
                Create your account
              </h2>

              <p className="mt-3 text-[#687086] leading-6">
                Get started with the AEGIS security intelligence platform.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-[#11152F] mb-2"
                >
                  Full name
                </label>

                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={100}
                  className="w-full rounded-xl border border-[#E5E7F0] bg-white px-4 py-3 text-[#11152F] outline-none transition focus:border-[#6045F5] focus:ring-4 focus:ring-[#6045F5]/10 placeholder:text-[#A0A5B5]"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="signup-email"
                  className="block text-sm font-medium text-[#11152F] mb-2"
                >
                  Email address
                </label>

                <input
                  id="signup-email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-[#E5E7F0] bg-white px-4 py-3 text-[#11152F] outline-none transition focus:border-[#6045F5] focus:ring-4 focus:ring-[#6045F5]/10 placeholder:text-[#A0A5B5]"
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="signup-password"
                  className="block text-sm font-medium text-[#11152F] mb-2"
                >
                  Password
                </label>

                <div className="relative">
                  <input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    maxLength={128}
                    className="w-full rounded-xl border border-[#E5E7F0] bg-white px-4 py-3 pr-20 text-[#11152F] outline-none transition focus:border-[#6045F5] focus:ring-4 focus:ring-[#6045F5]/10 placeholder:text-[#A0A5B5]"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((previous) => !previous)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-[#6045F5]"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>

                <p className="mt-2 text-xs text-[#687086]">
                  Use at least 8 characters.
                </p>
              </div>

              {/* Confirm password */}
              <div>
                <label
                  htmlFor="confirm-password"
                  className="block text-sm font-medium text-[#11152F] mb-2"
                >
                  Confirm password
                </label>

                <div className="relative">
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    maxLength={128}
                    className="w-full rounded-xl border border-[#E5E7F0] bg-white px-4 py-3 pr-20 text-[#11152F] outline-none transition focus:border-[#6045F5] focus:ring-4 focus:ring-[#6045F5]/10 placeholder:text-[#A0A5B5]"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((previous) => !previous)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-[#6045F5]"
                  >
                    {showConfirmPassword ? 'Hide' : 'Show'}
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
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-[#6045F5] to-[#477BFF] px-4 py-3.5 font-semibold text-white shadow-lg shadow-[#6045F5]/20 transition hover:shadow-xl hover:shadow-[#6045F5]/30 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:transform-none"
              >
                {loading ? 'Creating account...' : 'Create AEGIS account'}
              </button>
            </form>

            {/* Login link */}
            <div className="mt-6 text-center text-sm text-[#687086]">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onBackToLogin}
                className="font-semibold text-[#6045F5] hover:text-[#477BFF]"
              >
                Sign in
              </button>
            </div>

            <div className="mt-7 border-t border-[#E5E7F0] pt-5">
              <p className="text-center text-xs text-[#A0A5B5] leading-5">
                AEGIS is an educational cybersecurity simulation.
                It is not connected to live hospital infrastructure.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
