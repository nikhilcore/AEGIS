
import {
  Search,
  Bell,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react'

function Topbar() {
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
        <button className="relative rounded-xl p-2.5 text-[#687086] transition-all duration-200 hover:bg-[#F5F6FF] hover:text-[#6045F5]">
          <Bell size={19} />

          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#EF4444] ring-2 ring-white" />
        </button>

        {/* Profile */}
        <button className="flex items-center gap-2 border-l border-[#E5E7F0] pl-3 sm:gap-3 sm:pl-5">

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#6045F5] to-[#477BFF] text-sm font-semibold text-white shadow-sm">
            A
          </div>

          <div className="hidden text-left md:block">
            <p className="text-sm font-semibold text-[#11152F]">
              Administrator
            </p>

            <p className="text-xs text-[#687086]">
              Security Analyst
            </p>
          </div>

          <ChevronDown
            size={15}
            className="hidden text-[#687086] md:block"
          />
        </button>

      </div>
    </header>
  )
}

export default Topbar
