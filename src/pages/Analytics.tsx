import { useMemo, useEffect, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  Shield,
  PlayCircle,
  CheckCircle,
} from 'lucide-react'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts'
import { useSimulationStore } from '../store/simulationStore'

type Severity = 'Low' | 'Medium' | 'High' | 'Critical'

type BackendAsset = {
  id: string
  name: string
  department?: string
  risk_score?: number
  riskScore?: number
}

type BackendEvent = {
  id?: string
  external_id?: string
  severity: Severity
  status: string
  timestamp?: string
}

type BackendSimulation = {
  id: string
  status: string
}

const severityColors: Record<Severity, string> = {
  Low: '#16A36A',
  Medium: '#F59E0B',
  High: '#F97316',
  Critical: '#EF4444',
}

function Analytics() {
  const simulatedEvents = useSimulationStore((state) => state.events)
  const simulations = useSimulationStore((state) => state.simulations)
  const activeSimulation = useSimulationStore((state) => state.activeSimulation)
  const completedCount = useSimulationStore((state) => state.completedCount)

  const [backendAssets, setBackendAssets] = useState<BackendAsset[]>([])
  const [backendEvents, setBackendEvents] = useState<BackendEvent[]>([])
  const [backendSimulations, setBackendSimulations] = useState<BackendSimulation[]>([])
  const [backendLoading, setBackendLoading] = useState(true)
  const [backendError, setBackendError] = useState('')

  useEffect(() => {
    let mounted = true

    const fetchAnalyticsData = async () => {
      try {
        const [assetsResponse, eventsResponse, simulationsResponse] =
          await Promise.all([
            fetch('http://localhost:5000/api/assets'),
            fetch('http://localhost:5000/api/events'),
            fetch('http://localhost:5000/api/simulations'),
          ])

        if (!assetsResponse.ok || !eventsResponse.ok || !simulationsResponse.ok) {
          throw new Error('Failed to fetch analytics data from backend.')
        }

        const [assetsData, eventsData, simulationsData] = await Promise.all([
          assetsResponse.json(),
          eventsResponse.json(),
          simulationsResponse.json(),
        ])

        if (!mounted) return
        setBackendAssets(Array.isArray(assetsData.assets) ? assetsData.assets : [])
        setBackendEvents(Array.isArray(eventsData.events) ? eventsData.events : [])
        setBackendSimulations(
          Array.isArray(simulationsData.simulations)
            ? simulationsData.simulations
            : []
        )
        setBackendError('')
      } catch (error) {
        if (mounted) {
          setBackendError(
            error instanceof Error
              ? error.message
              : 'Unable to load backend analytics.'
          )
        }
      } finally {
        if (mounted) setBackendLoading(false)
      }
    }

    fetchAnalyticsData()
    const interval = setInterval(fetchAnalyticsData, 10000)

    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [])

  const allEvents = useMemo(() => {
    const backendEventList = backendEvents.map((event, index) => ({
      id: event.external_id ?? event.id ?? `backend-event-${index}`,
      severity: event.severity,
      status: event.status,
      timestamp: event.timestamp,
    }))

    const simulationEventList = simulatedEvents.map((event) => ({
      id: event.id,
      severity: event.severity,
      status: event.status,
      timestamp: event.timestamp,
    }))

    // Avoid counting a locally generated event twice if it is also persisted in the backend.
    const eventMap = new Map<string, (typeof backendEventList)[number] | (typeof simulationEventList)[number]>()
    backendEventList.forEach((event) => eventMap.set(event.id, event))
    simulationEventList.forEach((event) => eventMap.set(event.id, event))

    return Array.from(eventMap.values())
  }, [backendEvents, simulatedEvents])

  const severityData = useMemo(
    () =>
      (['Critical', 'High', 'Medium', 'Low'] as Severity[]).map((severity) => ({
        name: severity,
        value: allEvents.filter((event) => event.severity === severity).length,
      })),
    [allEvents]
  )

  const statusData = useMemo(
    () =>
      ['New', 'Investigating', 'Resolved'].map((status) => ({
        name: status,
        value: allEvents.filter((event) => event.status === status).length,
      })),
    [allEvents]
  )

  const eventTrendData = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - index))
      date.setHours(0, 0, 0, 0)
      return date
    })

    return days.map((date) => {
      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)

      const dayEvents = allEvents.filter((event) => {
        if (!event.timestamp) return false
        const eventDate = new Date(event.timestamp)
        return eventDate >= date && eventDate < nextDate
      })

      const result: Record<string, string | number> = {
        date: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      }

      ;(['Critical', 'High', 'Medium', 'Low'] as Severity[]).forEach((severity) => {
        result[severity] = dayEvents.filter((event) => event.severity === severity).length
      })

      return result
    })
  }, [allEvents])

  const assetRiskData = useMemo(
    () =>
      backendAssets.map((asset) => ({
        name: asset.name ?? 'Unnamed asset',
        score: Number(asset.risk_score ?? asset.riskScore ?? 0),
        department: asset.department ?? 'Unassigned',
      })),
    [backendAssets]
  )

  const departmentRiskData = useMemo(() => {
    const departments = [...new Set(assetRiskData.map((asset) => asset.department))]

    return departments.map((department) => {
      const departmentAssets = assetRiskData.filter(
        (asset) => asset.department === department
      )
      const averageRisk = departmentAssets.length
        ? Math.round(
            departmentAssets.reduce((total, asset) => total + asset.score, 0) /
              departmentAssets.length
          )
        : 0

      return { department, averageRisk, assetCount: departmentAssets.length }
    })
  }, [assetRiskData])

  const backendCompleted = backendSimulations.filter(
    (simulation) => simulation.status === 'Completed' || simulation.status === 'Stopped'
  ).length

  const backendRunning = backendSimulations.filter(
    (simulation) => simulation.status === 'Running'
  ).length

  const simulationData = [
    {
      name: 'Simulations',
      Completed: Math.max(completedCount, backendCompleted),
      Running: Math.max(activeSimulation ? 1 : 0, backendRunning),
    },
  ]

  const criticalCount = allEvents.filter((event) => event.severity === 'Critical').length
  const highCount = allEvents.filter((event) => event.severity === 'High').length
  const resolvedCount = allEvents.filter((event) => event.status === 'Resolved').length

  if (backendLoading) {
    return (
      <div className="space-y-6 bg-[#F5F6FF] p-4 sm:p-6 lg:p-8 text-[#11152F]">
        <h1 className="text-2xl font-semibold text-[#11152F]">Analytics</h1>
        <div className="rounded-xl border border-[#E5E7F0] bg-white p-5 shadow-sm text-sm text-[#687086]">
          Loading analytics data from backend...
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 bg-[#F5F6FF] p-4 sm:p-6 lg:p-8 text-[#11152F]">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-[#11152F]">Analytics</h1>
        <p className="mt-1 text-sm text-[#687086]">
          Security analytics and simulation performance overview
        </p>
        {backendError && (
          <p className="mt-2 text-sm text-[#B7791F]">
            Backend refresh warning: {backendError}
          </p>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Events" value={allEvents.length} description="Backend and simulation events" icon={Activity} color="text-[#477BFF]" />
        <StatCard title="Critical Events" value={criticalCount} description="Critical severity events" icon={AlertTriangle} color="text-[#EF4444]" />
        <StatCard title="High Severity" value={highCount} description="High priority events" icon={Shield} color="text-[#F59E0B]" />
        <StatCard title="Resolved Events" value={resolvedCount} description="Events marked as resolved" icon={CheckCircle} color="text-[#16A36A]" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Severity Chart */}
        <div className="rounded-xl border border-[#E5E7F0] bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-[#11152F]">Event Severity Distribution</h2>
          <p className="mt-1 text-sm text-[#687086]">Distribution of events by severity</p>
          <div className="mt-5 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={severityData} dataKey="value" nameKey="name" innerRadius={65} outerRadius={100} paddingAngle={4}>
                  {severityData.map((entry) => (
                    <Cell key={entry.name} fill={severityColors[entry.name as Severity]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7F0', borderRadius: '8px', color: '#11152F' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {severityData.map((item) => (
              <div key={item.name} className="flex items-center gap-2 text-xs text-[#687086]">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: severityColors[item.name as Severity] }} />
                {item.name} ({item.value})
              </div>
            ))}
          </div>
        </div>

        {/* Status Chart */}
        <div className="rounded-xl border border-[#E5E7F0] bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-[#11152F]">Event Status Overview</h2>
          <p className="mt-1 text-sm text-[#687086]">Current event lifecycle distribution</p>
          <div className="mt-5 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7F0" />
                <XAxis dataKey="name" stroke="#687086" />
                <YAxis stroke="#687086" allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7F0', borderRadius: '8px', color: '#11152F' }} />
                <Bar dataKey="value" fill="#6045F5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Asset Risk Analysis */}
        <div className="rounded-xl border border-[#E5E7F0] bg-white p-5 shadow-sm xl:col-span-2">
          <h2 className="font-semibold text-[#11152F]">Asset Risk Analysis</h2>
          <p className="mt-1 text-sm text-[#687086]">Backend risk scores across hospital infrastructure assets</p>
          <div className="mt-5 h-[420px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={assetRiskData} layout="vertical" margin={{ left: 20, right: 30, top: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7F0" />
                <XAxis type="number" domain={[0, 100]} stroke="#687086" allowDecimals={false} />
                <YAxis type="category" dataKey="name" width={190} stroke="#687086" tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7F0', borderRadius: '8px', color: '#11152F' }} formatter={(value) => [`${value}/100`, 'Risk Score']} />
                <Bar dataKey="score" name="Risk Score" radius={[0, 6, 6, 0]} fill="#F59E0B" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-xs text-[#687086]">
            Scores are synthetic indicators for demonstration purposes and do not represent real-world hospital infrastructure risk.
          </p>
        </div>

        {/* Department Risk Comparison */}
        <div className="rounded-xl border border-[#E5E7F0] bg-white p-5 shadow-sm xl:col-span-2">
          <h2 className="font-semibold text-[#11152F]">Department Risk Comparison</h2>
          <p className="mt-1 text-sm text-[#687086]">Average simulated asset risk score by department</p>
          <div className="mt-5 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentRiskData} margin={{ left: 10, right: 20, top: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7F0" />
                <XAxis dataKey="department" stroke="#687086" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} stroke="#687086" allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7F0', borderRadius: '8px', color: '#11152F' }} formatter={(value, name) => [name === 'averageRisk' ? `${value}/100` : value, name === 'averageRisk' ? 'Average Risk' : 'Assets']} />
                <Bar dataKey="averageRisk" name="Average Risk" fill="#477BFF" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-xs text-[#687086]">Department scores are averages of the synthetic asset scores shown above.</p>
        </div>

        {/* Simulation Activity */}
        <div className="rounded-xl border border-[#E5E7F0] bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-[#11152F]">Simulation Activity</h2>
          <p className="mt-1 text-sm text-[#687086]">Simulation execution overview</p>
          <div className="mt-5 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={simulationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7F0" />
                <XAxis dataKey="name" stroke="#687086" />
                <YAxis stroke="#687086" allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7F0', borderRadius: '8px', color: '#11152F' }} />
                <Bar dataKey="Completed" fill="#16A36A" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Running" fill="#477BFF" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Event Trends Over Time */}
        <div className="rounded-xl border border-[#E5E7F0] bg-white p-5 shadow-sm xl:col-span-2">
          <h2 className="font-semibold text-[#11152F]">Event Trends Over Time</h2>
          <p className="mt-1 text-sm text-[#687086]">Backend and simulation events grouped by date</p>
          <div className="mt-5 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={eventTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7F0" />
                <XAxis dataKey="date" stroke="#687086" />
                <YAxis stroke="#687086" allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7F0', borderRadius: '8px', color: '#11152F' }} />
                <Line type="monotone" dataKey="Critical" stroke={severityColors.Critical} strokeWidth={2} />
                <Line type="monotone" dataKey="High" stroke={severityColors.High} strokeWidth={2} />
                <Line type="monotone" dataKey="Medium" stroke={severityColors.Medium} strokeWidth={2} />
                <Line type="monotone" dataKey="Low" stroke={severityColors.Low} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Simulation Summary */}
        <div className="rounded-xl border border-[#E5E7F0] bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-[#11152F]">Simulation Summary</h2>
          <p className="mt-1 text-sm text-[#687086]">Overview of the simulation engine</p>
          <div className="mt-5 space-y-4">
            <SummaryRow label="Total simulations recorded" value={Math.max(simulations.length, backendSimulations.length)} />
            <SummaryRow label="Completed / stopped" value={Math.max(completedCount, backendCompleted)} />
            <SummaryRow label="Currently running" value={Math.max(activeSimulation ? 1 : 0, backendRunning)} />
            <SummaryRow label="Generated simulation events" value={simulatedEvents.length} />
          </div>
          {activeSimulation && (
            <div className="mt-5 rounded-lg border border-[#DCE5FF] bg-[#F5F8FF] p-3">
              <div className="flex items-center gap-2 text-sm text-[#477BFF]">
                <PlayCircle size={16} />
                Active Simulation
              </div>
              <p className="mt-2 text-sm font-medium text-[#11152F]">{activeSimulation.scenarioName}</p>
              <p className="mt-1 text-xs text-[#687086]">Target: {activeSimulation.targetAsset}</p>
            </div>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="rounded-lg border border-[#E5E7F0] bg-white p-4 shadow-sm">
        <p className="text-xs leading-6 text-[#687086]">
          Analytics are generated from backend records, synthetic baseline data and educational simulations. These metrics do not represent real hospital security telemetry.
        </p>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  color,
}: {
  title: string
  value: number
  description: string
  icon: React.ElementType
  color: string
}) {
  return (
    <div className="rounded-xl border border-[#E5E7F0] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#687086]">{title}</p>
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
      <p className="mt-3 text-2xl font-semibold text-[#11152F]">{value}</p>
      <p className="mt-1 text-xs text-[#687086]">{description}</p>
    </div>
  )
}

function SummaryRow({
  label,
  value,
}: {
  label: string
  value: number
}) {
  return (
    <div className="flex items-center justify-between border-b border-[#E5E7F0] pb-3">
      <span className="text-sm text-[#687086]">{label}</span>
      <span className="font-semibold text-[#11152F]">{value}</span>
    </div>
  )
}

export default Analytics
