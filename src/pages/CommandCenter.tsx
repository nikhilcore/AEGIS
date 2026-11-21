import {
  Activity,
  AlertTriangle,
  Shield,
  Server,
  ArrowDownRight,
  Clock,
  Wifi,
  Monitor,
  HeartPulse,
} from 'lucide-react'

import { useEffect, useState } from 'react'

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

import {
  getSeverityClass,
  getRiskBarClass,
} from '../utils/severity'

type Severity = 'Critical' | 'High' | 'Medium' | 'Low'

type Asset = {
  id: string
  name: string
  department: string
  riskScore: number
  riskLevel: Severity
}

type Event = {
  id: string
  title: string
  description: string
  severity: Severity
  assetId: string
  timestamp: string
  status: string
}

const severityOrder = ['Critical', 'High', 'Medium', 'Low']

const severityColorMap: Record<string, string> = {
  Critical: '#ef4444',
  High: '#f59e0b',
  Medium: '#6045F5',
  Low: '#687086',
}

const activityData = [
  { time: '00:00', incidents: 2 },
  { time: '04:00', incidents: 1 },
  { time: '08:00', incidents: 5 },
  { time: '12:00', incidents: 8 },
  { time: '16:00', incidents: 6 },
  { time: '20:00', incidents: 4 },
]

function KPI({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendLabel,
}: {
  title: string
  value: string
  subtitle: string
  icon: React.ElementType
  trend: string
  trendLabel: string
}) {
  return (
    <div className="rounded-xl border border-[#E5E7F0] bg-[#FFFFFF] p-5 transition hover:border-[#6045F5]/30">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[#687086]">{title}</p>

          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#11152F]">
            {value}
          </h2>
        </div>

        <div className="rounded-lg border border-[#E5E7F0] bg-[#F5F6FF] p-3 text-[#6045F5]">
          <Icon size={20} />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <span className="flex items-center gap-1 text-xs text-[#16A36A]">
          <ArrowDownRight size={14} />
          {trend}
        </span>

        <span className="text-xs text-[#687086]">
          {trendLabel}
        </span>
      </div>

      <p className="mt-2 text-xs text-[#687086]">
        {subtitle}
      </p>
    </div>
  )
}

function CommandCenter() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [incidents, setIncidents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [backendError, setBackendError] = useState('')

  useEffect(() => {
    let cancelled = false

    const fetchDashboardData = async () => {
      try {
        setBackendError('')

        const [assetsResponse, eventsResponse, incidentsResponse] =
          await Promise.all([
            fetch('http://localhost:5000/api/assets'),
            fetch('http://localhost:5000/api/events'),
            fetch('http://localhost:5000/api/incidents'),
          ])

        if (
          !assetsResponse.ok ||
          !eventsResponse.ok ||
          !incidentsResponse.ok
        ) {
          throw new Error('Unable to fetch dashboard data.')
        }

        const assetsData = await assetsResponse.json()
        const eventsData = await eventsResponse.json()
        const incidentsData = await incidentsResponse.json()

        const mappedAssets: Asset[] = (assetsData.assets ?? []).map(
          (asset: any) => ({
            id: String(asset.id),
            name: asset.name ?? 'Unnamed asset',
            department: asset.department ?? 'Unassigned',
            riskScore: Number(
              asset.risk_score ?? asset.riskScore ?? 0,
            ),
            riskLevel:
              asset.risk_level ??
              asset.riskLevel ??
              'Low'
          }),
        )

        const mappedEvents: Event[] = (eventsData.events ?? []).map(
          (event: any) => ({
            id: String(event.external_id ?? event.id),
            title: event.title ?? 'Untitled event',
            description: event.description ?? '',
            severity: event.severity ?? 'Low',
            assetId: String(event.asset_id ?? event.assetId ?? ''),
            timestamp: event.timestamp,
            status: event.status ?? 'New',
          }),
        )

        if (!cancelled) {
          setAssets(mappedAssets)
          setEvents(mappedEvents)
          setIncidents(incidentsData.incidents ?? [])
        }
      } catch (error) {
        console.error('Command Center API error:', error)

        if (!cancelled) {
          setBackendError(
            'Unable to load dashboard data from the backend.',
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchDashboardData()
    const interval = setInterval(fetchDashboardData, 10000)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  const totalAssets = assets.length

  const highRiskAssets = assets.filter(
    (asset) => asset.riskScore >= 75,
  )

  const severityData = severityOrder.map((severity) => ({
    name: severity,
    value: events.filter(
      (event) => event.severity === severity,
    ).length,
  }))

  const totalEvents = events.length

  const sortedAssets = [...assets].sort(
    (a, b) => b.riskScore - a.riskScore,
  )

  const recentEvents = [...events].sort(
    (a, b) =>
      new Date(b.timestamp).getTime() -
      new Date(a.timestamp).getTime(),
  )

  const activeIncidents = incidents.filter(
    (incident: any) =>
      !['Resolved', 'Closed'].includes(incident.status),
  ).length

  if (loading) {
    return (
      <div className="p-6 text-[#687086]">
        Loading Command Center data...
      </div>
    )
  }

  if (backendError) {
    return (
      <div className="space-y-4 p-6">
        <h1 className="text-2xl font-semibold text-[#11152F]">
          Command Center
        </h1>

        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-400">
          {backendError}
        </div>

        <button
          onClick={() => window.location.reload()}
          className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-[#11152F] hover:bg-[#F5F6FF]"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Page Heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-medium tracking-[2px] text-[#6045F5]">
            OVERVIEW
          </p>

          <h1 className="mt-2 text-2xl font-semibold text-[#11152F]">
            Command Center
          </h1>

          <p className="mt-2 text-sm text-[#687086]">
            Monitor simulated hospital infrastructure,
            security events and operational risk.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-[#E5E7F0] bg-[#FFFFFF] px-3 py-2">
          <Activity size={16} className="text-[#16A36A]" />

          <span className="text-xs text-[#687086]">
            Monitoring active
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPI
          title="Total Assets"
          value={String(totalAssets)}
          subtitle="Registered infrastructure assets"
          icon={Server}
          trend="+4.2%"
          trendLabel="vs last week"
        />

        <KPI
          title="Active Incidents"
          value={String(activeIncidents)}
          subtitle="Incidents requiring investigation"
          icon={AlertTriangle}
          trend="-12.5%"
          trendLabel="vs last week"
        />

        <KPI
          title="High-Risk Assets"
          value={String(highRiskAssets.length)}
          subtitle="Assets with risk score ≥ 75"
          icon={Shield}
          trend="-8.1%"
          trendLabel="vs last week"
        />

        <KPI
          title="System Availability"
          value="99.94%"
          subtitle="Simulated infrastructure uptime"
          icon={Activity}
          trend="+0.3%"
          trendLabel="vs last week"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Activity Chart */}
        <div className="rounded-xl border border-[#E5E7F0] bg-[#FFFFFF] p-5 xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-[#11152F]">
                Security Activity
              </h2>

              <p className="mt-1 text-xs text-[#687086]">
                Simulated event activity throughout the day
              </p>
            </div>

            <span className="rounded-md border border-[#E5E7F0] bg-[#F5F6FF] px-3 py-1.5 text-xs text-[#687086]">
              24 hours
            </span>
          </div>

          <div className="mt-6 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient
                    id="activityGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#6045F5"
                      stopOpacity={0.3}
                    />

                    <stop
                      offset="95%"
                      stopColor="#6045F5"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  stroke="#E5E7F0"
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="time"
                  stroke="#687086"
                  tick={{ fill: '#687086', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  stroke="#687086"
                  tick={{ fill: '#687086', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  contentStyle={{
                    background: '#FFFFFF',
                    border: '1px solid #E5E7F0',
                    borderRadius: '8px',
                    color: '#11152F',
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="incidents"
                  stroke="#6045F5"
                  strokeWidth={2}
                  fill="url(#activityGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Distribution */}
        <div className="rounded-xl border border-[#E5E7F0] bg-[#FFFFFF] p-5">
          <h2 className="font-semibold text-[#11152F]">
            Event Severity
          </h2>

          <p className="mt-1 text-xs text-[#687086]">
            Distribution of backend events
          </p>

          <div className="relative mt-4 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={65}
                  outerRadius={90}
                  paddingAngle={4}
                  stroke="none"
                >
                  {severityData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={severityColorMap[entry.name] ?? '#687086'}
                    />
                  ))}
                </Pie>

                <Tooltip
                  contentStyle={{
                    background: '#FFFFFF',
                    border: '1px solid #E5E7F0',
                    borderRadius: '8px',
                    color: '#11152F',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-semibold text-[#11152F]">
                {totalEvents}
              </span>

              <span className="text-xs text-[#687086]">
                Total events
              </span>
            </div>
          </div>

          <div className="mt-3 space-y-3">
            {severityData.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{
                      backgroundColor:
                        severityColorMap[item.name] ?? '#687086',
                    }}
                  />

                  <span className="text-sm text-[#687086]">
                    {item.name}
                  </span>
                </div>

                <span className="text-sm font-medium text-[#11152F]">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Event Feed and Asset Risks */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {/* Event Feed */}
        <div className="rounded-xl border border-[#E5E7F0] bg-[#FFFFFF]">
          <div className="flex items-center justify-between border-b border-[#E5E7F0] p-5">
            <div>
              <h2 className="font-semibold text-[#11152F]">
                Recent Security Events
              </h2>

              <p className="mt-1 text-xs text-[#687086]">
                Latest simulated detections
              </p>
            </div>

            <Activity size={18} className="text-[#6045F5]" />
          </div>

          <div className="divide-y divide-[#E5E7F0]">
            {recentEvents.map((event) => {
              const asset = assets.find(
                (item) => item.id === event.assetId,
              )

              return (
                <div
                  key={event.id}
                  className="flex gap-4 p-4 transition hover:bg-[#F5F6FF]/60"
                >
                  <div className="mt-1">
                    <span
                      className={`block h-2.5 w-2.5 rounded-full ${
                        event.severity === 'Critical'
                          ? 'bg-red-500'
                          : event.severity === 'High'
                            ? 'bg-amber-400'
                            : event.severity === 'Medium'
                              ? 'bg-sky-400'
                              : 'bg-slate-400'
                      }`}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-[#11152F]">
                        {event.title}
                      </p>

                      <span
                        className={`rounded-md border px-2 py-0.5 text-[10px] ${getSeverityClass(event.severity)}`}
                      >
                        {event.severity}
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-[#687086]">
                      {event.id} · {asset?.name ?? event.assetId}
                    </p>

                    <div className="mt-2 flex items-center gap-1 text-xs text-[#687086]">
                      <Clock size={12} />

                      {new Date(event.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Asset Risk */}
        <div className="rounded-xl border border-[#E5E7F0] bg-[#FFFFFF]">
          <div className="flex items-center justify-between border-b border-[#E5E7F0] p-5">
            <div>
              <h2 className="font-semibold text-[#11152F]">
                Highest Risk Assets
              </h2>

              <p className="mt-1 text-xs text-[#687086]">
                Prioritised by simulated risk score
              </p>
            </div>

            <Shield size={18} className="text-[#F59E0B]" />
          </div>

          <div className="divide-y divide-[#E5E7F0]">
            {sortedAssets.slice(0, 4).map((asset) => (
              <div
                key={asset.id}
                className="p-4 transition hover:bg-[#F5F6FF]/60"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg border border-[#E5E7F0] bg-[#F5F6FF] p-2 text-[#687086]">
                      <Monitor size={18} />
                    </div>

                    <div>
                      <p className="text-sm font-medium text-[#11152F]">
                        {asset.name}
                      </p>

                      <p className="mt-1 text-xs text-[#687086]">
                        {asset.department}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-semibold text-[#11152F]">
                      {asset.riskScore}
                    </p>

                    <span
                      className={`rounded-md border px-2 py-0.5 text-[10px] ${getSeverityClass(asset.riskLevel)}`}
                    >
                      {asset.riskLevel}
                    </span>
                  </div>
                </div>

                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#E5E7F0]">
                  <div
                    className={`h-full ${getRiskBarClass(asset.riskScore)}`}
                    style={{
                      width: `${asset.riskScore}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Infrastructure Overview */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="flex items-center gap-4 rounded-xl border border-[#E5E7F0] bg-[#FFFFFF] p-5">
          <div className="rounded-lg bg-[#16A36A]/10 p-3 text-[#16A36A]">
            <Wifi size={20} />
          </div>

          <div>
            <p className="text-xs text-[#687086]">
              Connected Devices
            </p>

            <p className="mt-1 text-xl font-semibold text-[#11152F]">
              231 / 248
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-[#E5E7F0] bg-[#FFFFFF] p-5">
          <div className="rounded-lg bg-[#6045F5]/10 p-3 text-[#6045F5]">
            <HeartPulse size={20} />
          </div>

          <div>
            <p className="text-xs text-[#687086]">
              Patient Monitoring Devices
            </p>

            <p className="mt-1 text-xl font-semibold text-[#11152F]">
              64
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-[#E5E7F0] bg-[#FFFFFF] p-5">
          <div className="rounded-lg bg-[#F59E0B]/10 p-3 text-[#F59E0B]">
            <AlertTriangle size={20} />
          </div>

          <div>
            <p className="text-xs text-[#687086]">
              Unresolved Alerts
            </p>

            <p className="mt-1 text-xl font-semibold text-[#11152F]">
              7
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CommandCenter
