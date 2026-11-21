
import { useState } from 'react'
import {
  Search,
  Bell,
  ShieldCheck,
  ChevronDown,
  LogOut,
  UserCircle,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

function Topbar() {
  const { user, logout } = useAuth()
  const [profileOpen, setProfileOpen] = useState(false)
  const [logoutLoading, setLogoutLoading] = useState(false)
  const [logoutError, setLogoutError] = useState('')

  const handleLogout = async () => {
    try {
      setLogoutLoading(true)
      setLogoutError('')
      await logout()
    } catch (error) {
      setLogoutError(
        error instanceof Error ? error.message : 'Logout failed.'
      )
    } finally {
      setLogoutLoading(false)
    }
  }

  const initials = user?.name
    ? user.name
        .trim()
        .split(/\s+/)
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'A'

  return (
    <header className="flex h-20 shrink-0 items-center justify-between border-b border-[#E5E7F0] bg-white px-4 sm:px-6 lg:px-8">
      {/* Left */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[#11152F]">
            Hospital Infrastructure
          </span>

          <span className="rounded-md border border-[#16A36A]/20 bg-[#16A36A]/10 px-2 py-1 text-[10px] font-semibold tracking-wide text-[#16A36A]">
            SIMULATION
          </span>
        </div>

        <p className="mt-1 text-xs text-[#687086]">
          Security Operations Environment
        </p>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3 sm:gap-5">
        {/* Search */}
        <button className="hidden items-center gap-3 rounded-xl border border-[#E5E7F0] bg-[#F5F6FF] px-4 py-2.5 text-sm text-[#687086] transition-all duration-200 hover:border-[#6045F5]/30 hover:bg-white md:flex">
          <Search size={16} className="text-[#687086]" />

          <span>Search infrastructure...</span>

          <span className="ml-4 rounded-md border border-[#E5E7F0] bg-white px-1.5 py-0.5 text-xs text-[#687086]">
            /
          </span>
        </button>

        {/* System Status */}
        <div className="hidden items-center gap-2 rounded-full border border-[#16A36A]/15 bg-[#16A36A]/5 px-3 py-2 sm:flex">
          <ShieldCheck size={17} className="text-[#16A36A]" />

          <span className="text-xs font-medium text-[#16A36A]">
            System Operational
          </span>
        </div>

        {/* Notifications */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-xl p-2.5 text-[#687086] transition-all duration-200 hover:bg-[#F5F6FF] hover:text-[#6045F5]"
        >
          <Bell size={19} />

          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#EF4444] ring-2 ring-white" />
        </button>

        {/* Profile Dropdown */}
        <div className="relative border-l border-[#E5E7F0] pl-3 sm:pl-5">
          <button
            type="button"
            onClick={() => setProfileOpen((previous) => !previous)}
            aria-expanded={profileOpen}
            aria-label="User profile menu"
            className="flex items-center gap-2 transition hover:opacity-80 sm:gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#6045F5] to-[#477BFF] text-sm font-semibold text-white shadow-sm">
              {initials}
            </div>

            <div className="hidden text-left md:block">
              <p className="max-w-40 truncate text-sm font-semibold text-[#11152F]">
                {user?.name || 'Administrator'}
              </p>

              <p className="text-xs text-[#687086]">
                {user?.role || 'Security Analyst'}
              </p>
            </div>

            <ChevronDown
              size={15}
              className={`hidden text-[#687086] transition-transform md:block ${
                profileOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Dropdown */}
          {profileOpen && (
            <div className="absolute right-0 top-full z-50 mt-3 w-72 overflow-hidden rounded-2xl border border-[#E5E7F0] bg-white shadow-xl shadow-[#11152F]/10">
              {/* User information */}
              <div className="border-b border-[#E5E7F0] bg-[#F5F6FF] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#6045F5] to-[#477BFF] text-sm font-semibold text-white">
                    {initials}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#11152F]">
                      {user?.name || 'Administrator'}
                    </p>

                    <p className="truncate text-xs text-[#687086]">
                      {user?.email || ''}
                    </p>
                  </div>
                </div>

                <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#6045F5]/10 bg-white px-3 py-1.5">
                  <UserCircle size={14} className="text-[#6045F5]" />

                  <span className="text-xs font-medium text-[#6045F5]">
                    {user?.role || 'Security Analyst'}
                  </span>
                </div>
              </div>

              {/* Logout */}
              <div className="p-2">
                {logoutError && (
                  <p className="mb-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
                    {logoutError}
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={logoutLoading}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <LogOut size={17} />

                  <span>
                    {logoutLoading ? 'Signing out...' : 'Sign out'}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Topbar
