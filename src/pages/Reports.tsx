import { useMemo, useState, useEffect } from 'react'
import {
  FileText,
  Shield,
  Activity,
  AlertTriangle,
  Download,
  Eye,
} from 'lucide-react'
import { useSimulationStore } from '../store/simulationStore'

type ReportType = 'Security Overview' | 'Incident Report' | 'Simulation Report' | 'Asset Risk Report'

type BackendAsset = {
  id: string
  name: string
  department?: string
  risk_score?: number
  riskScore?: number
  risk_level?: string
  riskLevel?: string
}

type BackendEvent = {
  id?: string
  external_id?: string
  severity: string
  status: string
  timestamp?: string
  title?: string
  description?: string
}

type BackendSimulation = {
  id: string
  scenario_name?: string
  scenarioName?: string
  scenario_id?: string
  target_asset_id?: string
  targetAsset?: string
  severity?: string
  status: string
  started_at?: string
}

function Reports() {
  const simulatedEvents = useSimulationStore((state) => state.events)
  const simulations = useSimulationStore((state) => state.simulations)
  const activeSimulation = useSimulationStore((state) => state.activeSimulation)

  const [selectedReport, setSelectedReport] = useState<ReportType | null>(null)
  const [backendAssets, setBackendAssets] = useState<BackendAsset[]>([])
  const [backendEvents, setBackendEvents] = useState<BackendEvent[]>([])
  const [backendSimulations, setBackendSimulations] = useState<BackendSimulation[]>([])
  const [loading, setLoading] = useState(true)
  const [backendError, setBackendError] = useState('')

  useEffect(() => {
    let mounted = true

    const fetchReportData = async () => {
      try {
        const [assetsResponse, eventsResponse, simulationsResponse] = await Promise.all([
          fetch('http://localhost:5000/api/assets'),
          fetch('http://localhost:5000/api/events'),
          fetch('http://localhost:5000/api/simulations'),
        ])

        if (!assetsResponse.ok || !eventsResponse.ok || !simulationsResponse.ok) {
          throw new Error('One or more report data requests failed.')
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
          Array.isArray(simulationsData.simulations) ? simulationsData.simulations : []
        )
        setBackendError('')
      } catch (error) {
        if (mounted) {
          setBackendError(error instanceof Error ? error.message : 'Unable to load report data.')
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchReportData()
    const interval = setInterval(fetchReportData, 10000)
    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [])

  const allEvents = useMemo(() => {
    const mappedBackend = backendEvents.map((event, index) => ({
      id: event.external_id ?? event.id ?? `backend-event-${index}`,
      severity: event.severity,
      status: event.status,
      timestamp: event.timestamp,
      title: event.title ?? '',
      description: event.description ?? '',
    }))
    const mappedLocal = simulatedEvents.map((event) => ({
      id: event.id,
      severity: event.severity,
      status: event.status,
      timestamp: event.timestamp,
      title: '',
      description: '',
    }))
    const deduplicated = new Map<string, (typeof mappedBackend)[number] | (typeof mappedLocal)[number]>()
    mappedBackend.forEach((event) => deduplicated.set(event.id, event))
    mappedLocal.forEach((event) => deduplicated.set(event.id, event))
    return Array.from(deduplicated.values())
  }, [backendEvents, simulatedEvents])

  const assets = useMemo(
    () =>
      backendAssets.map((asset) => ({
        id: asset.id,
        name: asset.name ?? 'Unnamed asset',
        department: asset.department ?? 'Unassigned',
        score: Number(asset.risk_score ?? asset.riskScore ?? 0),
        level: asset.risk_level ?? asset.riskLevel ?? 'Unknown',
      })),
    [backendAssets]
  )

  const allSimulations = useMemo(() => {
    const mappedBackend = backendSimulations.map((simulation) => ({
      id: simulation.id,
      scenarioName: simulation.scenario_name ?? simulation.scenarioName ?? simulation.scenario_id ?? 'Unnamed scenario',
      targetAsset: simulation.targetAsset ?? simulation.target_asset_id ?? 'Unknown target',
      severity: simulation.severity ?? 'Unknown',
      status: simulation.status,
    }))
    const mappedLocal = simulations.map((simulation) => ({
      id: simulation.id,
      scenarioName: simulation.scenarioName,
      targetAsset: simulation.targetAsset,
      severity: simulation.severity,
      status: simulation.status,
    }))
    const map = new Map<string, (typeof mappedBackend)[number] | (typeof mappedLocal)[number]>()
    mappedBackend.forEach((item) => map.set(item.id, item))
    mappedLocal.forEach((item) => map.set(item.id, item))
    return Array.from(map.values())
  }, [backendSimulations, simulations])

  const reportCards = [
    {
      title: 'Security Overview',
      description: 'Summary of security events and severity distribution.',
      icon: Shield,
      count: allEvents.length,
    },
    {
      title: 'Incident Report',
      description: 'Overview of security events requiring investigation.',
      icon: AlertTriangle,
      count: allEvents.filter((event) => event.status !== 'Resolved' && event.status !== 'Closed').length,
    },
    {
      title: 'Simulation Report',
      description: 'Summary of simulation activity and generated events.',
      icon: Activity,
      count: allSimulations.length,
    },
    {
      title: 'Asset Risk Report',
      description: 'Risk assessment overview of synthetic infrastructure.',
      icon: FileText,
      count: assets.length,
    },
  ]

  const generateReport = (report: ReportType) => setSelectedReport(report)

  const downloadReport = () => {
    if (!selectedReport) return
    let content = ''

    if (selectedReport === 'Security Overview') {
      content = [
        'AEGIS SECURITY OVERVIEW REPORT',
        '================================',
        `Generated: ${new Date().toLocaleString()}`,
        '',
        `Total Events: ${allEvents.length}`,
        `Critical: ${allEvents.filter((e) => e.severity === 'Critical').length}`,
        `High: ${allEvents.filter((e) => e.severity === 'High').length}`,
        `Medium: ${allEvents.filter((e) => e.severity === 'Medium').length}`,
        `Low: ${allEvents.filter((e) => e.severity === 'Low').length}`,
        '',
        `New: ${allEvents.filter((e) => e.status === 'New').length}`,
        `Investigating: ${allEvents.filter((e) => e.status === 'Investigating').length}`,
        `Resolved: ${allEvents.filter((e) => e.status === 'Resolved').length}`,
        '',
        'Disclaimer: Synthetic educational data only.',
      ].join('\n')
    }

    if (selectedReport === 'Incident Report') {
      content = [
        'AEGIS INCIDENT OVERVIEW REPORT',
        '================================',
        `Generated: ${new Date().toLocaleString()}`,
        '',
        ...allEvents.map((event) => `${event.id} | Severity: ${event.severity} | Status: ${event.status}${event.title ? ` | Title: ${event.title}` : ''}`),
        '',
        'Disclaimer: Synthetic educational data only.',
      ].join('\n')
    }

    if (selectedReport === 'Simulation Report') {
      content = [
        'AEGIS SIMULATION REPORT',
        '================================',
        `Generated: ${new Date().toLocaleString()}`,
        '',
        `Total Simulations: ${allSimulations.length}`,
        `Currently Running: ${activeSimulation ? activeSimulation.scenarioName : allSimulations.find((s) => s.status === 'Running')?.scenarioName ?? 'None'}`,
        '',
        'Simulation History:',
        ...allSimulations.map((simulation) => `${simulation.scenarioName} | Target: ${simulation.targetAsset} | Severity: ${simulation.severity} | Status: ${simulation.status}`),
        '',
        'Disclaimer: Simulated activity only.',
      ].join('\n')
    }

    if (selectedReport === 'Asset Risk Report') {
      content = [
        'AEGIS ASSET RISK REPORT',
        '================================',
        `Generated: ${new Date().toLocaleString()}`,
        '',
        ...assets.map((asset) => `${asset.id} | ${asset.name} | Department: ${asset.department} | Risk Score: ${asset.score} | Risk Level: ${asset.level}`),
        '',
        'Disclaimer: Synthetic risk scores only.',
      ].join('\n')
    }

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${selectedReport.replace(/\s+/g, '-')}-Report.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="space-y-6 p-6 text-[#11152F]">
        <h1 className="text-2xl font-semibold text-[#11152F]">Reports</h1>
        <div className="rounded-2xl border border-[#E5E7F0] bg-white p-5 shadow-sm text-sm text-[#687086]">
          Loading report data from backend...
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 text-[#11152F]">
      <div>
        <h1 className="text-2xl font-semibold text-[#11152F]">Reports</h1>
        <p className="mt-1 text-sm text-[#687086]">Generate and review structured AEGIS security reports</p>
        {backendError && <p className="mt-2 text-sm text-amber-400">Backend refresh warning: {backendError}</p>}
      </div>

      {/* Report cards */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {reportCards.map((report) => {
          const Icon = report.icon
          return (
            <div key={report.title} className="rounded-2xl border border-[#E5E7F0] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="rounded-lg bg-[#6045F5]/10 p-3 text-[#6045F5]"><Icon size={22} /></div>
                <span className="text-xs text-[#687086]">{report.count} records</span>
              </div>
              <h2 className="mt-4 font-semibold text-[#11152F]">{report.title}</h2>
              <p className="mt-2 min-h-10 text-sm text-[#687086]">{report.description}</p>
              <button onClick={() => generateReport(report.title as ReportType)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-[#6045F5]/20 bg-[#6045F5]/10 px-3 py-2 text-sm text-[#6045F5] transition hover:bg-[#6045F5]/20">
                <Eye size={16} /> Preview Report
              </button>
            </div>
          )
        })}
      </div>

      {/* Report Preview */}
      {selectedReport && (
        <div className="rounded-2xl border border-[#E5E7F0] bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-semibold text-[#11152F]">{selectedReport}</h2>
              <p className="mt-1 text-sm text-[#687086]">Report preview generated from current backend and simulation data</p>
            </div>
            <button onClick={downloadReport} className="flex items-center justify-center gap-2 rounded-lg bg-[#6045F5] px-4 py-2 text-sm font-medium text-[#11152F] transition hover:bg-[#5036DB]">
              <Download size={16} /> Download Report
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <PreviewStat label="Total Events" value={allEvents.length} />
            <PreviewStat label="Active Simulation" value={activeSimulation || allSimulations.some((s) => s.status === 'Running') ? 1 : 0} />
            <PreviewStat label="Recorded Simulations" value={allSimulations.length} />
          </div>

          <div className="mt-6 rounded-xl border border-[#E5E7F0] bg-[#F5F6FF] p-4">
            <h3 className="font-medium text-[#11152F]">Report Contents</h3>
            <p className="mt-3 text-sm leading-6 text-[#687086]">
              {selectedReport === 'Security Overview' && 'This report summarises security event distribution, event severity and current lifecycle status across backend and simulation-generated events.'}
              {selectedReport === 'Incident Report' && 'This report lists security events, their severity and their current status. It is an event overview, not a complete case-management record.'}
              {selectedReport === 'Simulation Report' && 'This report summarises recorded simulation scenarios, their target assets, severity and execution status.'}
              {selectedReport === 'Asset Risk Report' && 'This report lists synthetic infrastructure assets, their departments, risk scores and risk levels.'}
            </p>
          </div>

          {selectedReport === 'Asset Risk Report' && (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#E5E7F0] text-[#687086]">
                    <th className="px-3 py-3">Asset</th><th className="px-3 py-3">Department</th><th className="px-3 py-3">Score</th><th className="px-3 py-3">Level</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map((asset) => (
                    <tr key={asset.id} className="border-b border-[#E5E7F0]/50">
                      <td className="px-3 py-3 text-[#11152F]">{asset.name}</td>
                      <td className="px-3 py-3 text-[#687086]">{asset.department}</td>
                      <td className="px-3 py-3 font-medium text-[#11152F]">{asset.score}</td>
                      <td className="px-3 py-3"><span className="text-[#6045F5]">{asset.level}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {selectedReport === 'Simulation Report' && (
            <div className="mt-5 space-y-3">
              {allSimulations.length === 0 ? <p className="text-sm text-[#687086]">No simulation records available yet.</p> : allSimulations.map((simulation) => (
                <div key={simulation.id} className="rounded-xl border border-[#E5E7F0] p-4">
                  <p className="font-medium text-[#11152F]">{simulation.scenarioName}</p>
                  <p className="mt-1 text-sm text-[#687086]">Target: {simulation.targetAsset}</p>
                  <p className="mt-1 text-sm text-[#687086]">Status: {simulation.status}</p>
                </div>
              ))}
            </div>
          )}

          {selectedReport !== 'Asset Risk Report' && selectedReport !== 'Simulation Report' && (
            <div className="mt-5 space-y-3">
              {allEvents.map((event) => (
                <div key={event.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E5E7F0] p-4">
                  <span className="text-sm text-[#11152F]">{event.id}</span>
                  <span className="text-sm text-[#687086]">{event.severity}</span>
                  <span className="text-sm text-[#6045F5]">{event.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Disclaimer */}
      <div className="rounded-lg border border-[#E5E7F0] bg-white p-4">
        <p className="text-xs leading-6 text-[#687086]">
          Reports are generated using backend records and educational simulations. They do not represent real hospital security telemetry, patient records or clinical assessments.
        </p>
      </div>
    </div>
  )
}

function PreviewStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-[#E5E7F0] bg-[#F5F6FF] p-4">
      <p className="text-sm text-[#687086]">{label}</p>
      <p className="mt-2 text-xl font-semibold text-[#11152F]">{value}</p>
    </div>
  )
}

export default Reports
    