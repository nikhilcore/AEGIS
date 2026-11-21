import { useEffect, useRef, useState } from 'react'
import {
  FlaskConical,
  ShieldAlert,
  Network,
  Server,
  Activity,
  Play,
  Clock,
  Target,
  Square,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'

import {
  useSimulationStore,
  type SimulatedEvent,
  type SimulationRecord,
} from '../store/simulationStore'

type Scenario = {
  id: string
  name: string
  description: string
  category: string
  severity: 'Low' | 'Medium' | 'High' | 'Critical'
  duration: string
  target: string
  icon: typeof ShieldAlert
}

const scenarios: Scenario[] = [
  {
    id: 'SIM-001',
    name: 'Authentication Server Compromise',
    description:
      'Simulates suspicious activity affecting the hospital authentication server and connected infrastructure.',
    category: 'Identity & Access',
    severity: 'Critical',
    duration: '5 minutes',
    target: 'AST-005',
    icon: ShieldAlert,
  },
  {
    id: 'SIM-002',
    name: 'Network Traffic Anomaly',
    description:
      'Simulates abnormal network activity affecting the hospital core network.',
    category: 'Network Security',
    severity: 'High',
    duration: '3 minutes',
    target: 'AST-003',
    icon: Network,
  },
  {
    id: 'SIM-003',
    name: 'Medical Device Configuration Alert',
    description:
      'Simulates an unexpected configuration change on a connected medical monitoring device.',
    category: 'Medical Devices',
    severity: 'High',
    duration: '4 minutes',
    target: 'AST-001',
    icon: Activity,
  },
  {
    id: 'SIM-004',
    name: 'Application Availability Disruption',
    description:
      'Simulates a service availability warning affecting a hospital application server.',
    category: 'Infrastructure',
    severity: 'Medium',
    duration: '3 minutes',
    target: 'AST-004',
    icon: Server,
  },
]

const severityStyles: Record<string, string> = {
  Low: 'bg-[#E8F8F0] text-[#16A36A] border-[#BDE8D0]',
  Medium: 'bg-[#FFF8E8] text-[#B7791F] border-[#F3D69B]',
  High: 'bg-[#FFF1E8] text-[#EA580C] border-[#FFD0B0]',
  Critical: 'bg-[#FFF0F0] text-[#EF4444] border-[#FECACA]',
}

function SimulationLab() {
  const [selectedScenario, setSelectedScenario] =
    useState<Scenario | null>(null)
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'offline'>('checking')
  const [backendMessage, setBackendMessage] = useState('')
  const backendSimulationId = useRef<string | null>(null)

  useEffect(() => {
    let mounted = true
    const checkBackend = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/simulations')
        if (!response.ok) throw new Error('Backend request failed')
        if (mounted) setBackendStatus('connected')
      } catch {
        if (mounted) setBackendStatus('offline')
      }
    }
    checkBackend()
    const interval = setInterval(checkBackend, 10000)
    return () => { mounted = false; clearInterval(interval) }
  }, [])

  // Shared state from Zustand
  const events = useSimulationStore((state) => state.events)
  const activeSimulation = useSimulationStore(
    (state) => state.activeSimulation
  )
  const simulations = useSimulationStore(
    (state) => state.simulations
  )
  const completedCount = useSimulationStore(
    (state) => state.completedCount
  )

  const startSimulation = useSimulationStore(
    (state) => state.startSimulation
  )
  const stopSimulation = useSimulationStore(
    (state) => state.stopSimulation
  )
  const clearSimulationEvents = useSimulationStore(
    (state) => state.clearSimulationEvents
  )

  const activeScenario = activeSimulation
    ? scenarios.find(
        (scenario) => scenario.id === activeSimulation.scenarioId
      ) ?? null
    : null

  const generateEvent = (scenario: Scenario): SimulatedEvent => {
    const eventMessages: Record<string, string> = {
      'SIM-001':
        'Simulated authentication anomaly detected on authentication server.',
      'SIM-002':
        'Simulated network traffic anomaly recorded on core router.',
      'SIM-003':
        'Simulated device configuration change detected.',
      'SIM-004':
        'Simulated service availability warning generated.',
    }

    return {
      id: `EVT-SIM-${Date.now()}`,
      title: scenario.name,
      description: eventMessages[scenario.id],
      severity: scenario.severity,
      assetId: scenario.target,
      scenarioId: scenario.id,
      scenarioName: scenario.name,
      status: 'New',
      timestamp: new Date().toISOString(),
      source: 'Simulation',
    }
  }

  const runSimulation = async (scenario: Scenario) => {
    if (activeSimulation) return

    const simulation: SimulationRecord = {
      id: `RUN-${Date.now()}`,
      scenarioId: scenario.id,
      scenarioName: scenario.name,
      targetAsset: scenario.target,
      severity: scenario.severity,
      status: 'Running',
      startedAt: new Date().toISOString(),
    }

    const event = generateEvent(scenario)

    startSimulation(simulation, event)
    setSelectedScenario(null)

    // Persist the synthetic simulation record in the backend.
    try {
      const response = await fetch('http://localhost:5000/api/simulations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario_id: scenario.id,
          scenario_name: scenario.name,
          target_asset_id: scenario.target,
          severity: scenario.severity,
          status: 'Running',
          started_at: simulation.startedAt,
        }),
      })
      if (!response.ok) throw new Error('Could not save simulation')
      const result = await response.json()
      backendSimulationId.current = result.simulation?.id ?? result.id ?? null
      setBackendStatus('connected')
      setBackendMessage('Simulation saved to backend.')
    } catch {
      backendSimulationId.current = null
      setBackendStatus('offline')
      setBackendMessage('Simulation is running locally, but backend persistence failed.')
    }
  }

  const handleStopSimulation = async () => {
    const backendId = backendSimulationId.current
    stopSimulation()
    backendSimulationId.current = null
    if (backendId) {
      try {
        const response = await fetch(`http://localhost:5000/api/simulations/${backendId}/stop`, { method: 'PATCH' })
        if (!response.ok) throw new Error('Stop request failed')
        setBackendMessage('Simulation stopped and updated in backend.')
      } catch {
        setBackendMessage('Simulation stopped locally; backend stop update failed.')
      }
    }
  }

  const clearEvents = () => {
    clearSimulationEvents()
  }

  return (
    <div className="min-h-full space-y-6 bg-[#F5F6FF] p-4 sm:p-6 lg:p-8 text-[#11152F]">

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <FlaskConical className="text-[#6045F5]" size={22} />
            <h1 className="text-2xl font-bold">Simulation Lab</h1>
          </div>

          <p className="text-sm text-[#687086]">
            Run controlled cybersecurity scenarios within the AEGIS
            hospital digital twin.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-[#BDE8D0] bg-[#E8F8F0] px-3 py-2">
          <span className="h-2 w-2 rounded-full bg-[#16A36A]" />
          <span className="text-xs font-medium text-[#16A36A]">
            SIMULATION ENVIRONMENT
          </span>
        </div>
      </div>

      <div className={`rounded-lg border px-4 py-3 text-sm ${backendStatus === 'connected' ? 'border-[#BDE8D0] bg-[#E8F8F0] text-[#16A36A]' : backendStatus === 'offline' ? 'border-[#F3D69B] bg-[#FFF8E8] text-[#B7791F]' : 'border-[#E5E7F0] bg-white text-[#687086]'}`}>
        Backend: {backendStatus === 'connected' ? 'Connected' : backendStatus === 'offline' ? 'Offline / persistence unavailable' : 'Checking...'}
        {backendMessage && <span className="ml-2">· {backendMessage}</span>}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-[#E5E7F0] bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#687086]">Available Scenarios</p>
            <FlaskConical className="text-[#6045F5]" size={20} />
          </div>
          <h2 className="mt-3 text-3xl font-bold">{scenarios.length}</h2>
        </div>

        <div className="rounded-xl border border-[#E5E7F0] bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#687086]">Active Simulations</p>
            <Activity className="text-[#F59E0B]" size={20} />
          </div>
          <h2 className="mt-3 text-3xl font-bold">{activeSimulation ? 1 : 0}</h2>
        </div>

        <div className="rounded-xl border border-[#E5E7F0] bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#687086]">Simulation Targets</p>
            <Target className="text-[#477BFF]" size={20} />
          </div>
          <h2 className="mt-3 text-3xl font-bold">{scenarios.length}</h2>
        </div>

        <div className="rounded-xl border border-[#E5E7F0] bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#687086]">Completed Simulations</p>
            <CheckCircle2 className="text-[#16A36A]" size={20} />
          </div>
          <h2 className="mt-3 text-3xl font-bold">{completedCount}</h2>
        </div>
      </div>

      {/* Active Simulation */}
      {activeScenario && (
        <div className="rounded-xl border border-[#F3D69B] bg-[#FFF8E8] p-5">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#F59E0B]" />
                <span className="text-sm font-semibold text-[#B7791F]">
                  SIMULATION RUNNING
                </span>
              </div>

              <h2 className="mt-3 text-lg font-semibold">
                {activeScenario.name}
              </h2>

              <p className="mt-1 text-sm text-[#687086]">
                Target: {activeScenario.target}
              </p>
            </div>

            <button
              onClick={handleStopSimulation}
              className="flex items-center justify-center gap-2 rounded-lg border border-[#FECACA] bg-[#FFF0F0] px-4 py-3 text-sm font-medium text-[#EF4444] transition hover:bg-[#FEE2E2]"
            >
              <Square size={16} />
              Stop Simulation
            </button>
          </div>

          <div className="mt-5 rounded-lg border border-[#E5E7F0] bg-white p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle size={18} className="mt-0.5 text-[#F59E0B]" />
              <div>
                <p className="text-sm font-medium">Simulated impact</p>
                <p className="mt-1 text-sm text-[#687086]">
                  A simulated event has been generated for target asset
                  {` ${activeScenario.target}`}. No real systems are affected.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scenarios */}
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Available Scenarios</h2>
          <p className="mt-1 text-sm text-[#687086]">
            Select a scenario to inspect or run it.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {scenarios.map((scenario) => {
            const Icon = scenario.icon
            const isRunning = activeScenario?.id === scenario.id

            return (
              <div
                key={scenario.id}
                className="rounded-xl border border-[#E5E7F0] bg-white p-5 shadow-sm transition hover:border-[#C7C9F8] hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl border border-[#E5E7F0] bg-[#F5F6FF] p-3">
                      <Icon size={20} className="text-[#6045F5]" />
                    </div>

                    <div>
                      <h3 className="font-semibold">{scenario.name}</h3>
                      <p className="mt-1 text-xs text-[#687086]">
                        {scenario.id} · {scenario.category}
                      </p>
                    </div>
                  </div>

                  <span className={`rounded-md border px-2 py-1 text-xs font-medium ${severityStyles[scenario.severity]}`}>
                    {scenario.severity}
                  </span>
                </div>

                <p className="mt-4 text-sm leading-6 text-[#687086]">
                  {scenario.description}
                </p>

                <div className="mt-5 flex flex-wrap gap-4 border-t border-[#E5E7F0] pt-4">
                  <div className="flex items-center gap-2 text-xs text-[#687086]">
                    <Target size={14} />
                    <span>Target: {scenario.target}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#687086]">
                    <Clock size={14} />
                    <span>{scenario.duration}</span>
                  </div>
                </div>

                <div className="mt-5 flex gap-3">
                  <button
                    disabled={!!activeSimulation}
                    onClick={() => setSelectedScenario(scenario)}
                    className="flex-1 rounded-lg border border-[#E5E7F0] bg-[#F5F6FF] py-2.5 text-sm font-medium text-[#687086] transition hover:bg-[#EEF0FF] hover:text-[#6045F5] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Configure
                  </button>

                  <button
                    disabled={!!activeSimulation}
                    onClick={() => runSimulation(scenario)}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-medium transition ${
                      isRunning
                        ? 'border-[#F3D69B] bg-[#FFF8E8] text-[#B7791F]'
                        : 'border-[#6045F5] bg-[#6045F5] text-white hover:bg-[#5035DB]'
                    } disabled:cursor-not-allowed disabled:opacity-40`}
                  >
                    <Play size={16} />
                    Run Simulation
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Configuration Panel */}
      {selectedScenario && (
        <div className="rounded-xl border border-[#C7C9F8] bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold">Scenario Configuration</h2>
              <p className="mt-1 text-sm text-[#687086]">
                {selectedScenario.name}
              </p>
            </div>

            <button
              onClick={() => setSelectedScenario(null)}
              className="rounded-lg border border-[#E5E7F0] px-3 py-1.5 text-sm text-[#687086] transition hover:bg-[#F5F6FF] hover:text-[#6045F5]"
            >
              Close
            </button>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-[#E5E7F0] bg-[#F5F6FF] p-4">
              <p className="text-xs text-[#687086]">Scenario ID</p>
              <p className="mt-2 font-medium">{selectedScenario.id}</p>
            </div>

            <div className="rounded-lg border border-[#E5E7F0] bg-[#F5F6FF] p-4">
              <p className="text-xs text-[#687086]">Target Asset</p>
              <p className="mt-2 font-medium">{selectedScenario.target}</p>
            </div>

            <div className="rounded-lg border border-[#E5E7F0] bg-[#F5F6FF] p-4">
              <p className="text-xs text-[#687086]">Severity</p>
              <p className="mt-2 font-medium">{selectedScenario.severity}</p>
            </div>

            <div className="rounded-lg border border-[#E5E7F0] bg-[#F5F6FF] p-4">
              <p className="text-xs text-[#687086]">Estimated Duration</p>
              <p className="mt-2 font-medium">{selectedScenario.duration}</p>
            </div>
          </div>

          <button
            onClick={() => runSimulation(selectedScenario)}
            disabled={!!activeSimulation}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-[#6045F5] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#5035DB] disabled:opacity-40"
          >
            <Play size={16} />
            Start Simulation
          </button>
        </div>
      )}

      {/* Event Log */}
      <div className="rounded-xl border border-[#E5E7F0] bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-[#E5E7F0] p-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-semibold">Simulation Activity Log</h2>
            <p className="mt-1 text-sm text-[#687086]">
              Events generated during simulated scenarios.
            </p>
          </div>

          <button
            onClick={clearEvents}
            disabled={events.length === 0}
            className="rounded-lg border border-[#E5E7F0] px-3 py-2 text-xs font-medium text-[#687086] transition hover:bg-[#F5F6FF] hover:text-[#6045F5] disabled:opacity-40"
          >
            Clear Log
          </button>
        </div>

        {events.length === 0 ? (
          <div className="p-10 text-center">
            <Activity size={30} className="mx-auto text-[#A0A6B8]" />
            <p className="mt-3 text-sm text-[#687086]">
              No simulation events generated yet.
            </p>
            <p className="mt-1 text-xs text-[#A0A6B8]">
              Run a scenario to populate this activity log.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#E5E7F0]">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-lg border border-[#FFD0B0] bg-[#FFF1E8] p-2">
                    <ShieldAlert size={18} className="text-[#EA580C]" />
                  </div>

                  <div>
                    <p className="text-sm font-medium">{event.description}</p>
                    <p className="mt-1 text-xs text-[#687086]">
                      {event.id} · {event.scenarioName}
                    </p>
                    <p className="mt-1 text-xs text-[#687086]">
                      Target: {event.assetId}
                    </p>
                    <p className="mt-1 text-xs text-[#687086]">
                      Status: {event.status}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                  <span className={`rounded-md border px-2 py-1 text-xs ${severityStyles[event.severity]}`}>
                    {event.severity}
                  </span>
                  <span className="text-xs text-[#687086]">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Simulation History */}
      <div className="rounded-xl border border-[#E5E7F0] bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Simulation History</h2>
        <p className="mt-1 text-sm text-[#687086]">
          Records of simulations initiated during this session.
        </p>

        {simulations.length === 0 ? (
          <p className="mt-5 text-sm text-[#687086]">
            No simulation records available.
          </p>
        ) : (
          <div className="mt-5 space-y-3">
            {simulations.map((simulation) => (
              <div
                key={simulation.id}
                className="flex flex-col justify-between gap-3 rounded-lg border border-[#E5E7F0] bg-[#F5F6FF] p-4 sm:flex-row sm:items-center"
              >
                <div>
                  <p className="font-medium">{simulation.scenarioName}</p>
                  <p className="mt-1 text-xs text-[#687086]">
                    {simulation.id} · Target: {simulation.targetAsset}
                  </p>
                  <p className="mt-1 text-xs text-[#687086]">
                    Started: {new Date(simulation.startedAt).toLocaleString()}
                  </p>
                  {simulation.stoppedAt && (
                    <p className="mt-1 text-xs text-[#687086]">
                      Stopped: {new Date(simulation.stoppedAt).toLocaleString()}
                    </p>
                  )}
                </div>

                <span
                  className={`rounded-md border px-2 py-1 text-xs ${
                    simulation.status === 'Running'
                      ? 'border-[#F3D69B] bg-[#FFF8E8] text-[#B7791F]'
                      : 'border-[#BDE8D0] bg-[#E8F8F0] text-[#16A36A]'
                  }`}
                >
                  {simulation.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="rounded-xl border border-[#E5E7F0] bg-white p-4 shadow-sm">
        <p className="text-xs leading-5 text-[#687086]">
          AEGIS Simulation Lab uses synthetic scenarios and simulated
          infrastructure. Simulation events are generated locally within the
          application state. No real hospital systems, medical devices or patient
          data are affected.
        </p>
      </div>
    </div>
  )
}

export default SimulationLab
