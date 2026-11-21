import { useEffect, useState } from 'react'
import { useSimulationStore } from '../store/simulationStore'

import {
  Activity,
  AlertTriangle,
  Shield,
  Search,
  Filter,
  Clock,
  Server,
  Eye,
  X,
  ChevronDown,
} from 'lucide-react'

type EventSeverity = 'Critical' | 'High' | 'Medium' | 'Low'

type EventStatus = 'New' | 'Investigating' | 'Resolved'

interface SecurityEvent {
  id: string
  title: string
  category: string
  severity: EventSeverity
  source: string
  department: string
  timestamp: string
  status: EventStatus
  description: string
  recommendation: string
  isSimulation?: boolean
  apiId?: string
}

const simulatedEvents: SecurityEvent[] = [
  {
    id: 'EVT-1001',
    title: 'Unusual Authentication Activity',
    category: 'Authentication',
    severity: 'Critical',
    source: 'AST-005',
    department: 'IT Infrastructure',
    timestamp: '02:42:18',
    status: 'New',
    description:
      'A simulated burst of failed authentication attempts was detected against the authentication server.',
    recommendation:
      'Review the simulated authentication activity and inspect the affected account and server.',
  },
  {
    id: 'EVT-1002',
    title: 'Network Traffic Anomaly',
    category: 'Network',
    severity: 'High',
    source: 'AST-003',
    department: 'IT Infrastructure',
    timestamp: '02:38:54',
    status: 'Investigating',
    description:
      'Traffic volume exceeded the simulated baseline for the hospital core router.',
    recommendation:
      'Review traffic patterns, associated assets and the event timeline.',
  },
  {
    id: 'EVT-1003',
    title: 'Device Configuration Change',
    category: 'Device',
    severity: 'High',
    source: 'AST-001',
    department: 'Intensive Care',
    timestamp: '02:31:09',
    status: 'New',
    description:
      'A simulated configuration change was recorded for the ICU patient monitor.',
    recommendation:
      'Review the configuration change and compare it with the simulated expected configuration.',
  },
  {
    id: 'EVT-1004',
    title: 'Application Access Spike',
    category: 'Application',
    severity: 'Medium',
    source: 'AST-006',
    department: 'Pharmacy',
    timestamp: '02:24:33',
    status: 'Investigating',
    description:
      'The simulated pharmacy application recorded a higher-than-normal number of access requests.',
    recommendation:
      'Review the access records and identify whether the activity matches the simulated operational baseline.',
  },
  {
    id: 'EVT-1005',
    title: 'Service Availability Alert',
    category: 'Availability',
    severity: 'Medium',
    source: 'AST-007',
    department: 'Laboratory',
    timestamp: '02:19:41',
    status: 'Resolved',
    description:
      'A simulated service availability alert was triggered for the laboratory server.',
    recommendation:
      'Review the simulated service health and document the resolution.',
  },
  {
    id: 'EVT-1006',
    title: 'Unusual Gateway Activity',
    category: 'Network',
    severity: 'Critical',
    source: 'AST-002',
    department: 'Intensive Care',
    timestamp: '02:12:06',
    status: 'New',
    description:
      'The simulated gateway recorded an unusual connection pattern involving connected assets.',
    recommendation:
      'Review the simulated gateway logs and associated network dependencies.',
  },
  {
    id: 'EVT-1007',
    title: 'Privilege Escalation Pattern',
    category: 'Authentication',
    severity: 'High',
    source: 'AST-004',
    department: 'IT Infrastructure',
    timestamp: '02:06:22',
    status: 'New',
    description:
      'A simulated access pattern matched a privilege escalation detection rule.',
    recommendation:
      'Review the simulated privilege changes and associated access events.',
  },
  {
    id: 'EVT-1008',
    title: 'Routine System Activity',
    category: 'System',
    severity: 'Low',
    source: 'AST-008',
    department: 'Emergency',
    timestamp: '01:58:13',
    status: 'Resolved',
    description:
      'Routine simulated system activity was recorded for the emergency department monitor.',
    recommendation:
      'No immediate action is suggested in this simulation.',
  },
]

const severityStyles: Record<EventSeverity, string> = {
  Critical: 'border-red-200 bg-red-50 text-red-700',
  High: 'border-amber-200 bg-amber-50 text-amber-700',
  Medium: 'border-blue-200 bg-sky-500/10 text-[#6045F5]',
  Low: 'border-emerald-200 bg-emerald-50 text-emerald-700',
}

const statusStyles: Record<EventStatus, string> = {
  New: 'bg-red-50 text-red-700',
  Investigating: 'bg-amber-50 text-amber-700',
  Resolved: 'bg-emerald-50 text-emerald-700',
}

function ThreatIntelligence() {
  const [events, setEvents] = useState<SecurityEvent[]>(simulatedEvents)
  const [apiEvents, setApiEvents] = useState<SecurityEvent[]>([])
  const [apiError, setApiError] = useState('')
  const sharedSimulationEvents = useSimulationStore((state) => state.events)
  const updateSharedEventStatus = useSimulationStore((state) => state.updateEventStatus)

  useEffect(() => {
    let cancelled = false

    const loadEvents = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/events')
        if (!response.ok) throw new Error(`Request failed (${response.status})`)
        const data = await response.json()
        const rows = Array.isArray(data) ? data : (data.events ?? data.data ?? [])

        const mapped: SecurityEvent[] = rows.map((raw: any) => ({
          id: String(raw.external_id ?? raw.event_id ?? raw.id ?? `EVT-${Math.random()}`),
          apiId: raw.id ? String(raw.id) : undefined,
          title: raw.title ?? raw.name ?? 'Untitled Event',
          category: raw.category ?? raw.event_type ?? raw.source_type ?? 'Security',
          severity: ['Critical', 'High', 'Medium', 'Low'].includes(raw.severity) ? raw.severity : 'Medium',
          source: String(raw.asset_id ?? raw.assetId ?? raw.source ?? 'Unknown Asset'),
          department: raw.department ?? 'Simulated Infrastructure',
          timestamp: raw.timestamp ? new Date(raw.timestamp).toLocaleTimeString() : (raw.created_at ? new Date(raw.created_at).toLocaleTimeString() : 'Unknown'),
          status: ['New', 'Investigating', 'Resolved'].includes(raw.status) ? raw.status : 'New',
          description: raw.description ?? 'No event description provided.',
          recommendation: raw.recommendation ?? 'Review this synthetic event and its affected asset.',
        }))
        if (!cancelled) {
          setApiEvents(mapped)
          setApiError('')
        }
      } catch (error) {
        if (!cancelled) setApiError('Backend events could not be loaded. Showing local sample events.')
      }
    }

    loadEvents()
    return () => { cancelled = true }
  }, [])

  const simulationEvents: SecurityEvent[] = sharedSimulationEvents.map((event) => ({
    id: event.id,
    title: event.title,
    category: 'Simulation',
    severity: event.severity,
    source: event.assetId,
    department: 'Simulated Infrastructure',
    timestamp: new Date(event.timestamp).toLocaleTimeString(),
    status: event.status,
    description: event.description,
    recommendation: 'Review this simulation-generated event and its affected synthetic asset.',
    isSimulation: true,
  }))

  const allEvents = [...simulationEvents, ...(apiEvents.length ? apiEvents : events)]

  const [searchTerm, setSearchTerm] = useState('')
  const [severityFilter, setSeverityFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [selectedEvent, setSelectedEvent] =
    useState<SecurityEvent | null>(null)

  const filteredEvents = allEvents.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesSeverity =
      severityFilter === 'All' ||
      event.severity === severityFilter

    const matchesStatus =
      statusFilter === 'All' ||
      event.status === statusFilter

    return matchesSearch && matchesSeverity && matchesStatus
  })

  const criticalCount = allEvents.filter(
    (event) => event.severity === 'Critical'
  ).length

  const highCount = allEvents.filter(
    (event) => event.severity === 'High'
  ).length

  const investigatingCount = allEvents.filter(
    (event) => event.status === 'Investigating'
  ).length

  const newCount = allEvents.filter(
    (event) => event.status === 'New'
  ).length

  const updateEventStatus = async (eventId: string, newStatus: EventStatus) => {
    const event = allEvents.find((item) => item.id === eventId)

    if (eventId.startsWith('EVT-SIM-')) {
      updateSharedEventStatus(eventId, newStatus)
    } else if (event?.apiId) {
      try {
        const response = await fetch(`http://localhost:5000/api/events/${event.apiId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        })
        if (!response.ok) throw new Error(`Status update failed (${response.status})`)
        setApiEvents((current) => current.map((item) => item.id === eventId ? { ...item, status: newStatus } : item))
      } catch (error) {
        setApiError('Could not save the event status to the backend.')
      }
    } else {
      setEvents((currentEvents) => currentEvents.map((item) => item.id === eventId ? { ...item, status: newStatus } : item))
    }

    setSelectedEvent((current) => current?.id === eventId ? { ...current, status: newStatus } : current)
  }

  return (
    <div className="min-h-full min-w-0 max-w-full bg-[#F5F6FF] p-4 text-[#11152F] sm:p-6">

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">

        <div>
          <div className="mb-2 flex items-center gap-2">
            <Shield size={18} className="text-[#6045F5]" />

            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6045F5]">
              Security Operations
            </span>
          </div>

          <h1 className="text-2xl font-bold text-[#11152F]">
            Threat Intelligence
          </h1>

          <p className="mt-1 text-sm text-[#687086]">
            Monitor, filter and investigate simulated security events.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
          <Activity size={16} className="text-emerald-400" />

          <span className="text-xs font-medium text-emerald-400">
            Event Monitoring Active
          </span>
        </div>

      </div>

      {apiError && <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-300">{apiError}</div>}

      {/* Summary Cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          title="Critical Events"
          value={criticalCount}
          icon={<AlertTriangle size={19} />}
          color="text-red-400"
        />

        <StatCard
          title="High Severity"
          value={highCount}
          icon={<Shield size={19} />}
          color="text-amber-400"
        />

        <StatCard
          title="Investigating"
          value={investigatingCount}
          icon={<Eye size={19} />}
          color="text-[#6045F5]"
        />

        <StatCard
          title="New Events"
          value={newCount}
          icon={<Activity size={19} />}
          color="text-[#6045F5]"
        />

      </div>

      {/* Event Table */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-[#E5E7F0] bg-white">

        {/* Toolbar */}
        <div className="flex flex-col gap-4 border-b border-[#E5E7F0] p-4 xl:flex-row xl:items-center xl:justify-between">

          <div>
            <h2 className="text-sm font-semibold text-[#11152F]">
              Security Event Stream
            </h2>

            <p className="mt-1 text-xs text-[#687086]">
              {filteredEvents.length} events displayed
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">

            {/* Search */}
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#687086]"
              />

              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-[#E5E7F0] bg-white py-2 pl-9 pr-3 text-sm text-[#11152F] outline-none transition focus:border-[#6045F5] focus:ring-2 focus:ring-[#6045F5]/10 sm:w-64"
              />
            </div>

            {/* Severity Filter */}
            <div className="relative">
              <Filter
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#687086]"
              />

              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="w-full appearance-none rounded-lg border border-[#E5E7F0] bg-white py-2 pl-9 pr-9 text-sm text-[#374151] outline-none focus:border-[#6045F5] focus:ring-2 focus:ring-[#6045F5]/10 sm:w-40"
              >
                <option value="All">All Severities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>

              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#687086]"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full appearance-none rounded-lg border border-[#E5E7F0] bg-white py-2 pl-3 pr-9 text-sm text-[#374151] outline-none focus:border-[#6045F5] focus:ring-2 focus:ring-[#6045F5]/10 sm:w-40"
              >
                <option value="All">All Statuses</option>
                <option value="New">New</option>
                <option value="Investigating">Investigating</option>
                <option value="Resolved">Resolved</option>
              </select>

              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#687086]"
              />
            </div>

          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">

          <table className="w-full min-w-[900px] text-left">

            <thead className="border-b border-[#E5E7F0] bg-white">
              <tr>
                <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-[#687086]">
                  Event
                </th>

                <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-[#687086]">
                  Severity
                </th>

                <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-[#687086]">
                  Source
                </th>

                <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-[#687086]">
                  Category
                </th>

                <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-[#687086]">
                  Time
                </th>

                <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-[#687086]">
                  Status
                </th>

                <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-[#687086]">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#253247]">

              {filteredEvents.map((event) => (
                <tr
                  key={event.id}
                  className="transition hover:bg-[#F5F6FF]/50"
                >

                  {/* Event */}
                  <td className="px-4 py-4">
                    <div>
                      <p className="text-sm font-medium text-[#11152F]">
                        {event.title}
                      </p>

                      <p className="mt-1 text-[10px] text-[#687086]">
                        {event.id}
                      </p>
                    </div>
                  </td>

                  {/* Severity */}
                  <td className="px-4 py-4">
                    <span
                      className={`rounded-md border px-2 py-1 text-[10px] font-semibold ${severityStyles[event.severity]}`}
                    >
                      {event.severity}
                    </span>
                  </td>

                  {/* Source */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <Server size={14} className="text-[#687086]" />

                      <span className="text-xs text-[#374151]">
                        {event.source}
                      </span>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-4 py-4">
                    <span className="text-xs text-[#687086]">
                      {event.category}
                    </span>
                  </td>

                  {/* Time */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-[#687086]" />

                      <span className="text-xs text-[#687086]">
                        {event.timestamp}
                      </span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4">
                    <span
                      className={`rounded-md px-2 py-1 text-[10px] font-semibold ${statusStyles[event.status]}`}
                    >
                      {event.status}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="px-4 py-4">
                    <button
                      onClick={() => setSelectedEvent(event)}
                      className="flex items-center gap-2 rounded-lg border border-[#E5E7F0] bg-[#F5F6FF] px-3 py-2 text-xs font-medium text-[#374151] transition hover:border-[#6045F5]/40 hover:text-[#6045F5]"
                    >
                      <Eye size={14} />
                      Inspect
                    </button>
                  </td>

                </tr>
              ))}

              {filteredEvents.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center"
                  >
                    <Search
                      size={24}
                      className="mx-auto text-[#687086]"
                    />

                    <p className="mt-3 text-sm text-[#687086]">
                      No events match your filters.
                    </p>
                  </td>
                </tr>
              )}

            </tbody>
          </table>
        </div>

      </div>

      {/* Event Investigation Panel */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#E5E7F0] bg-white shadow-2xl">

            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#E5E7F0] p-5">

              <div>
                <p className="text-xs uppercase tracking-wider text-[#6045F5]">
                  Event Investigation
                </p>

                <h2 className="mt-2 text-lg font-bold text-[#11152F]">
                  {selectedEvent.title}
                </h2>

                <p className="mt-1 text-xs text-[#687086]">
                  {selectedEvent.id}
                </p>
              </div>

              <button
                onClick={() => setSelectedEvent(null)}
                className="rounded-lg p-2 text-[#687086] hover:bg-[#F5F6FF] hover:text-[#11152F]"
              >
                <X size={18} />
              </button>

            </div>

            {/* Modal Content */}
            <div className="space-y-5 p-5">

              {/* Severity and Status */}
              <div className="flex flex-wrap gap-3">

                <span
                  className={`rounded-lg border px-3 py-2 text-xs font-semibold ${severityStyles[selectedEvent.severity]}`}
                >
                  {selectedEvent.severity} Severity
                </span>

                <span
                  className={`rounded-lg px-3 py-2 text-xs font-semibold ${statusStyles[selectedEvent.status]}`}
                >
                  {selectedEvent.status}
                </span>

              </div>

              {/* Details */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <DetailItem
                  label="Source Asset"
                  value={selectedEvent.source}
                />

                <DetailItem
                  label="Department"
                  value={selectedEvent.department}
                />

                <DetailItem
                  label="Category"
                  value={selectedEvent.category}
                />

                <DetailItem
                  label="Event Time"
                  value={selectedEvent.timestamp}
                />

              </div>

              {/* Description */}
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#687086]">
                  Event Description
                </h3>

                <div className="rounded-xl border border-[#E5E7F0] bg-white p-4">
                  <p className="text-sm leading-6 text-[#374151]">
                    {selectedEvent.description}
                  </p>
                </div>
              </div>

              {/* Recommendation */}
              <div>
                <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#6045F5]">
                  <Shield size={14} />
                  Suggested Investigation
                </h3>

                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                  <p className="text-sm leading-6 text-[#374151]">
                    {selectedEvent.recommendation}
                  </p>
                </div>
              </div>

              {/* Status Actions */}
              <div className="border-t border-[#E5E7F0] pt-5">

                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#687086]">
                  Update Event Status
                </h3>

                <div className="flex flex-wrap gap-2">

                  <button
                    onClick={() =>
                      updateEventStatus(selectedEvent.id, 'New')
                    }
                    className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-500/20"
                  >
                    Mark New
                  </button>

                  <button
                    onClick={() =>
                      updateEventStatus(selectedEvent.id, 'Investigating')
                    }
                    className="rounded-lg border border-amber-200 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-400 transition hover:bg-amber-500/20"
                  >
                    Investigating
                  </button>

                  <button
                    onClick={() =>
                      updateEventStatus(selectedEvent.id, 'Resolved')
                    }
                    className="rounded-lg border border-emerald-200 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-400 transition hover:bg-emerald-500/20"
                  >
                    Resolve Event
                  </button>

                </div>

              </div>

            </div>

          </div>
        </div>
      )}

      {/* Simulation Disclaimer */}
      <div className="mt-5 rounded-xl border border-[#E5E7F0] bg-white p-4">
        <p className="text-xs leading-5 text-[#687086]">
          AEGIS event monitoring uses simulated security events and
          detection scenarios. These events do not represent actual
          hospital security incidents.
        </p>
      </div>

    </div>
  )
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string
  value: number
  icon: React.ReactNode
  color: string
}) {
  return (
    <div className="rounded-xl border border-[#E5E7F0] bg-white p-4">

      <div className="flex items-center justify-between">

        <div>
          <p className="text-xs text-[#687086]">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold text-[#11152F]">
            {value}
          </p>
        </div>

        <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-[#F5F6FF] ${color}`}>
          {icon}
        </div>

      </div>

    </div>
  )
}

function DetailItem({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl border border-[#E5E7F0] bg-white p-3">
      <p className="text-[10px] uppercase tracking-wider text-[#687086]">
        {label}
      </p>

      <p className="mt-2 text-sm font-semibold text-[#11152F]">
        {value}
      </p>
    </div>
  )
}

export default ThreatIntelligence