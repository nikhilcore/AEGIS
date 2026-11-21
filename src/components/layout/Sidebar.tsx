
import {
  Activity,
  LayoutDashboard,
  Network,
  ShieldAlert,
  Siren,
  Monitor,
  BrainCircuit,
  FlaskConical,
  ChartNoAxesCombined,
  FileText,
  Settings,
  ChevronLeft,
  Database,
} from 'lucide-react'

const navigation = [
  {
    title: 'OVERVIEW',
    items: [
      { name: 'Command Center', icon: LayoutDashboard },
      { name: 'Asset Inventory', icon: Database },
    ],
  },
  {
    title: 'INTELLIGENCE',
    items: [
      { name: 'Digital Twin', icon: Network },
      { name: 'Threat Intelligence', icon: ShieldAlert },
      { name: 'Incident Investigation', icon: Siren },
      { name: 'Device Monitoring', icon: Monitor },
      { name: 'AI Intelligence', icon: BrainCircuit },
    ],
  },
  {
    title: 'OPERATIONS',
    items: [
      { name: 'Simulation Lab', icon: FlaskConical },
      { name: 'Analytics', icon: ChartNoAxesCombined },
      { name: 'Reports', icon: FileText },
    ],
  },
]

type SidebarProps = {
  activePage: string
  onNavigate: (page: string) => void
}

function Sidebar({ activePage, onNavigate }: SidebarProps) {
  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-[#E5E7F0] bg-white">

      {/* Brand */}
      <div className="flex h-20 shrink-0 items-center gap-3 border-b border-[#E5E7F0] px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#6045F5] to-[#477BFF] text-white shadow-md shadow-purple-500/20">
          <Activity size={22} />
        </div>

        <div>
          <h1 className="text-xl font-bold tracking-wider text-[#11152F]">
            AEGIS
          </h1>

          <p className="text-[10px] tracking-[2px] text-[#687086]">
            INTELLIGENCE SYSTEM
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-7 overflow-y-auto px-4 py-6">
        {navigation.map((section) => (
          <div key={section.title}>
            <p className="mb-3 px-3 text-[10px] font-semibold tracking-[2px] text-[#687086]">
              {section.title}
            </p>

            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon
                const active = item.name === activePage

                return (
                  <button
                    key={item.name}
                    onClick={() => onNavigate(item.name)}
                    className={`group flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-sm font-medium transition-all duration-200 ${
                      active
                        ? 'border-[#6045F5]/10 bg-[#6045F5]/[0.08] text-[#6045F5]'
                        : 'border-transparent text-[#687086] hover:border-[#E5E7F0] hover:bg-[#F5F6FF] hover:text-[#11152F]'
                    }`}
                  >
                    <Icon
                      size={18}
                      className={`shrink-0 transition-colors ${
                        active
                          ? 'text-[#6045F5]'
                          : 'text-[#687086] group-hover:text-[#477BFF]'
                      }`}
                    />

                    <span>{item.name}</span>

                    {active && (
                      <span className="ml-auto h-2 w-2 rounded-full bg-[#6045F5]" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="shrink-0 border-t border-[#E5E7F0] p-4">

        <button
          onClick={() => onNavigate('Settings')}
          className={`flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-sm font-medium transition ${
            activePage === 'Settings'
              ? 'border-[#6045F5]/10 bg-[#6045F5]/[0.08] text-[#6045F5]'
              : 'border-transparent text-[#687086] hover:border-[#E5E7F0] hover:bg-[#F5F6FF] hover:text-[#11152F]'
          }`}
        >
          <Settings
            size={18}
            className={activePage === 'Settings' ? 'text-[#6045F5]' : ''}
          />
          <span>Settings</span>
        </button>

        <div className="mt-4 flex items-center justify-between px-3">
          <div className="flex items-center gap-2 text-xs text-[#687086]">
            <ChevronLeft size={14} />
            <span>AEGIS v0.1.0</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#16A36A]" />
            <span className="text-[10px] font-medium text-[#16A36A]">
              ACTIVE
            </span>
          </div>
        </div>
      </div>

    </aside>
  )
}

export default Sidebar
