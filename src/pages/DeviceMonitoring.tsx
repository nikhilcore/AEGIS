
import { useEffect, useState } from 'react'
import {
  Activity,
  HeartPulse,
  Monitor,
  Search,
  Wifi,
  WifiOff,
  Thermometer,
  Wind,
  AlertTriangle,
  Clock,
} from 'lucide-react'

type DeviceStatus = 'Online' | 'Warning' | 'Offline' | 'Maintenance'

interface Device {
  id: string
  name: string
  department: string
  room: string
  status: DeviceStatus
  patient: string
  heartRate: number
  spo2: number
  respiratoryRate: number
  temperature: number
  lastUpdated: string
}

const initialDevices: Device[] = [
  {
    id: 'DEV-001',
    name: 'ICU Patient Monitor 07',
    department: 'Intensive Care',
    room: 'ICU-07',
    status: 'Warning',
    patient: 'Simulated Patient A',
    heartRate: 112,
    spo2: 94,
    respiratoryRate: 22,
    temperature: 37.8,
    lastUpdated: 'Just now',
  },
  {
    id: 'DEV-002',
    name: 'ICU Patient Monitor 08',
    department: 'Intensive Care',
    room: 'ICU-08',
    status: 'Online',
    patient: 'Simulated Patient B',
    heartRate: 78,
    spo2: 98,
    respiratoryRate: 16,
    temperature: 36.8,
    lastUpdated: 'Just now',
  },
  {
    id: 'DEV-003',
    name: 'ED Monitor 03',
    department: 'Emergency',
    room: 'ED-03',
    status: 'Online',
    patient: 'Simulated Patient C',
    heartRate: 86,
    spo2: 97,
    respiratoryRate: 18,
    temperature: 37.1,
    lastUpdated: 'Just now',
  },
  {
    id: 'DEV-004',
    name: 'Ward Monitor 12',
    department: 'General Ward',
    room: 'WARD-12',
    status: 'Offline',
    patient: 'Simulated Patient D',
    heartRate: 0,
    spo2: 0,
    respiratoryRate: 0,
    temperature: 0,
    lastUpdated: '4 minutes ago',
  },
  {
    id: 'DEV-005',
    name: 'ICU Patient Monitor 04',
    department: 'Intensive Care',
    room: 'ICU-04',
    status: 'Online',
    patient: 'Simulated Patient E',
    heartRate: 72,
    spo2: 99,
    respiratoryRate: 15,
    temperature: 36.6,
    lastUpdated: 'Just now',
  },
  {
    id: 'DEV-006',
    name: 'Surgical Monitor 02',
    department: 'Surgery',
    room: 'SURG-02',
    status: 'Maintenance',
    patient: 'No simulated patient',
    heartRate: 0,
    spo2: 0,
    respiratoryRate: 0,
    temperature: 0,
    lastUpdated: '12 minutes ago',
  },
  {
    id: 'DEV-007',
    name: 'ED Monitor 05',
    department: 'Emergency',
    room: 'ED-05',
    status: 'Warning',
    patient: 'Simulated Patient F',
    heartRate: 105,
    spo2: 92,
    respiratoryRate: 24,
    temperature: 38.1,
    lastUpdated: 'Just now',
  },
  {
    id: 'DEV-008',
    name: 'Ward Monitor 09',
    department: 'General Ward',
    room: 'WARD-09',
    status: 'Online',
    patient: 'Simulated Patient G',
    heartRate: 81,
    spo2: 97,
    respiratoryRate: 17,
    temperature: 36.9,
    lastUpdated: 'Just now',
  },
]

const statusStyles: Record<DeviceStatus, string> = {
  Online: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Warning: 'bg-amber-50 text-amber-700 border-amber-200',
  Offline: 'bg-red-50 text-red-700 border-red-200',
  Maintenance: 'bg-slate-100 text-[#687086] border-slate-500/20',
}

function DeviceMonitoring() {
  const [devices, setDevices] = useState(initialDevices)
  const [selectedDevice, setSelectedDevice] = useState(initialDevices[0])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [backendConnected, setBackendConnected] = useState(false)
  const [backendLoading, setBackendLoading] = useState(true)

  // Load asset registry data from the backend. Telemetry remains synthetic/local.
  useEffect(() => {
    let cancelled = false

    const loadBackendAssets = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/assets')
        if (!response.ok) throw new Error('Backend request failed')
        const payload = await response.json()
        const assets = Array.isArray(payload) ? payload : payload.assets
        if (!Array.isArray(assets)) throw new Error('Invalid assets response')

        if (!cancelled) {
          setDevices((currentDevices) => {
            const merged = currentDevices.map((device) => {
              const asset = assets.find((item: any) =>
                [item.external_id, item.asset_code, item.device_id, item.id]
                  .some((value) => value != null && String(value) === device.id)
                || (item.name && String(item.name).toLowerCase() === device.name.toLowerCase())
              )
              if (!asset) return device

              const statusValue = String(asset.status ?? device.status).toLowerCase()
              const status: DeviceStatus =
                statusValue.includes('offline') ? 'Offline' :
                statusValue.includes('maintenance') ? 'Maintenance' :
                statusValue.includes('warning') || statusValue.includes('alert') ? 'Warning' :
                'Online'

              return {
                ...device,
                name: asset.name ?? device.name,
                department: asset.department ?? device.department,
                room: asset.room ?? asset.location ?? device.room,
                status,
              }
            })
            return merged
          })
          setBackendConnected(true)
        }
      } catch {
        if (!cancelled) setBackendConnected(false)
      } finally {
        if (!cancelled) setBackendLoading(false)
      }
    }

    loadBackendAssets()
    const interval = setInterval(loadBackendAssets, 10000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  // Simulate changing telemetry readings
  useEffect(() => {
    const interval = setInterval(() => {
      setDevices((currentDevices) =>
        currentDevices.map((device) => {
          if (
            device.status === 'Offline' ||
            device.status === 'Maintenance'
          ) {
            return device
          }

          return {
            ...device,
            heartRate: Math.max(
              55,
              Math.min(130, device.heartRate + Math.floor(Math.random() * 7) - 3)
            ),
            spo2: Math.max(
              90,
              Math.min(100, device.spo2 + Math.floor(Math.random() * 3) - 1)
            ),
            respiratoryRate: Math.max(
              10,
              Math.min(
                30,
                device.respiratoryRate + Math.floor(Math.random() * 3) - 1
              )
            ),
            temperature: Number(
              Math.max(
                36,
                Math.min(
                  39,
                  device.temperature + (Math.random() * 0.2 - 0.1)
                )
              ).toFixed(1)
            ),
            lastUpdated: 'Just now',
          }
        })
      )
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  // Keep the selected device updated as telemetry changes
  useEffect(() => {
    const updatedDevice = devices.find(
      (device) => device.id === selectedDevice.id
    )

    if (updatedDevice) {
      setSelectedDevice(updatedDevice)
    }
  }, [devices])

  const filteredDevices = devices.filter((device) => {
    const matchesSearch =
      device.name.toLowerCase().includes(search.toLowerCase()) ||
      device.department.toLowerCase().includes(search.toLowerCase()) ||
      device.room.toLowerCase().includes(search.toLowerCase()) ||
      device.id.toLowerCase().includes(search.toLowerCase())

    const matchesStatus =
      statusFilter === 'All' || device.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const onlineCount = devices.filter(
    (device) => device.status === 'Online'
  ).length

  const warningCount = devices.filter(
    (device) => device.status === 'Warning'
  ).length

  const offlineCount = devices.filter(
    (device) => device.status === 'Offline'
  ).length

  const maintenanceCount = devices.filter(
    (device) => device.status === 'Maintenance'
  ).length

  const abnormalDevices = devices.filter(
    (device) => device.status === 'Warning'
  )

  return (
    <div className="space-y-6 p-4 sm:p-6 text-[#11152F]">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#11152F]">
            Medical Device Monitoring
          </h1>
          <p className="mt-1 text-sm text-[#687086]">
            Simulated medical device telemetry and operational monitoring
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${backendConnected ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
            <span className={`h-2 w-2 rounded-full ${backendConnected ? 'animate-pulse bg-emerald-400' : 'bg-amber-400'}`} />
            <span className={`text-sm ${backendConnected ? 'text-emerald-700' : 'text-amber-700'}`}>
              {backendLoading ? 'Checking Backend...' : backendConnected ? 'Backend Connected' : 'Backend Offline'}
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-[#6045F5]/20 bg-[#6045F5]/5 px-3 py-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-blue-400" />
            <span className="text-sm text-[#6045F5]">Simulation Active</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">

        <StatCard
          title="Total Devices"
          value={devices.length}
          icon={Monitor}
          color="text-[#6045F5]"
        />

        <StatCard
          title="Online"
          value={onlineCount}
          icon={Wifi}
          color="text-emerald-700"
        />

        <StatCard
          title="Warnings"
          value={warningCount}
          icon={AlertTriangle}
          color="text-amber-700"
        />

        <StatCard
          title="Offline"
          value={offlineCount}
          icon={WifiOff}
          color="text-red-700"
        />

        <StatCard
          title="Maintenance"
          value={maintenanceCount}
          icon={Clock}
          color="text-[#687086]"
        />

      </div>

      {/* Alerts */}
      <div className="rounded-xl border border-[#E5E7F0] bg-[#F5F6FF] p-5">
        <div className="mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <h2 className="font-semibold text-[#11152F]">
            Monitoring Alerts
          </h2>
        </div>

        {abnormalDevices.length === 0 ? (
          <p className="text-sm text-[#687086]">
            No simulated monitoring alerts currently detected.
          </p>
        ) : (
          <div className="space-y-3">
            {abnormalDevices.map((device) => (
              <div
                key={device.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#E5E7F0] bg-white p-3"
              >
                <div>
                  <p className="font-medium text-[#6045F5]">
                    {device.name}
                  </p>
                  <p className="mt-1 text-sm text-[#687086]">
                    {device.room} · {device.department}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedDevice(device)}
                  className="rounded-lg border border-[#D9D2FF] px-3 py-2 text-sm text-[#6045F5] transition hover:bg-[#EEF0FF]"
                >
                  Investigate
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

        {/* Device List */}
        <div className="xl:col-span-2">
          <div className="rounded-xl border border-[#E5E7F0] bg-white shadow-sm">

            <div className="border-b border-[#E5E7F0] p-5">
              <h2 className="font-semibold text-[#11152F]">
                Device Registry
              </h2>
              <p className="mt-1 text-sm text-[#687086]">
                Monitor device status across hospital departments
              </p>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#687086]" />

                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search devices..."
                    className="w-full rounded-lg border border-[#E5E7F0] bg-[#F5F6FF] py-2 pl-10 pr-3 text-sm text-[#11152F] outline-none focus:border-[#6045F5]"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-lg border border-[#E5E7F0] bg-[#F5F6FF] px-3 py-2 text-sm text-[#11152F] outline-none"
                >
                  <option value="All">All statuses</option>
                  <option value="Online">Online</option>
                  <option value="Warning">Warning</option>
                  <option value="Offline">Offline</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>
            </div>

            <div className="space-y-3 p-4">
              {filteredDevices.map((device) => (
                <button
                  key={device.id}
                  onClick={() => setSelectedDevice(device)}
                  className={`w-full rounded-xl border p-4 text-left transition ${
                    selectedDevice.id === device.id
                      ? 'border-[#6045F5]/40 bg-[#6045F5]/5'
                      : 'border-[#E5E7F0] bg-[#F5F6FF] hover:border-[#E5E7F0]'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">

                    <div className="flex gap-3">
                      <div className="rounded-lg bg-[#F5F6FF] p-3">
                        <Monitor className="h-5 w-5 text-[#6045F5]" />
                      </div>

                      <div>
                        <h3 className="font-medium text-[#11152F]">
                          {device.name}
                        </h3>

                        <p className="mt-1 text-xs text-[#687086]">
                          {device.id} · {device.room}
                        </p>

                        <p className="mt-1 text-sm text-[#687086]">
                          {device.department}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`rounded-full border px-3 py-1 text-xs ${statusStyles[device.status]}`}
                    >
                      {device.status}
                    </span>
                  </div>

                  {device.status === 'Online' ||
                  device.status === 'Warning' ? (
                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">

                      <MiniMetric
                        label="Heart Rate"
                        value={`${device.heartRate} bpm`}
                      />

                      <MiniMetric
                        label="SpO₂"
                        value={`${device.spo2}%`}
                      />

                      <MiniMetric
                        label="Resp. Rate"
                        value={`${device.respiratoryRate}/min`}
                      />

                      <MiniMetric
                        label="Temperature"
                        value={`${device.temperature}°C`}
                      />

                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-[#687086]">
                      Telemetry unavailable
                    </p>
                  )}
                </button>
              ))}

              {filteredDevices.length === 0 && (
                <div className="py-10 text-center text-[#687086]">
                  No devices match your filters.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Selected Device Panel */}
        <div className="space-y-6">

          <div className="rounded-xl border border-[#E5E7F0] bg-white p-5 shadow-sm">

            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-semibold text-[#11152F]">
                Device Details
              </h2>

              <Activity className="h-5 w-5 text-[#6045F5]" />
            </div>

            <div className="mb-5">
              <p className="text-lg font-medium text-[#11152F]">
                {selectedDevice.name}
              </p>

              <p className="mt-1 text-sm text-[#687086]">
                {selectedDevice.id}
              </p>
            </div>

            <div className="space-y-3 text-sm">
              <DetailRow label="Department" value={selectedDevice.department} />
              <DetailRow label="Room" value={selectedDevice.room} />
              <DetailRow label="Status" value={selectedDevice.status} />
              <DetailRow label="Patient" value={selectedDevice.patient} />
              <DetailRow label="Updated" value={selectedDevice.lastUpdated} />
            </div>

            <div className="mt-5 rounded-lg border border-[#E5E7F0] bg-[#F5F6FF] p-3">
              <p className="text-xs text-[#687086]">
                Telemetry source
              </p>
              <p className="mt-1 text-sm text-[#6045F5]">
                Simulated Device Stream
              </p>
            </div>

          </div>

          {/* Telemetry */}
          <div className="rounded-xl border border-[#E5E7F0] bg-white p-5 shadow-sm">

            <h2 className="mb-4 font-semibold text-[#11152F]">
              Simulated Telemetry
            </h2>

            {selectedDevice.status === 'Online' ||
            selectedDevice.status === 'Warning' ? (
              <div className="space-y-4">

                <TelemetryCard
                  icon={HeartPulse}
                  label="Heart Rate"
                  value={selectedDevice.heartRate}
                  unit="bpm"
                  color="text-rose-600"
                />

                <TelemetryCard
                  icon={Activity}
                  label="SpO₂"
                  value={selectedDevice.spo2}
                  unit="%"
                  color="text-[#6045F5]"
                />

                <TelemetryCard
                  icon={Wind}
                  label="Respiratory Rate"
                  value={selectedDevice.respiratoryRate}
                  unit="/min"
                  color="text-emerald-700"
                />

                <TelemetryCard
                  icon={Thermometer}
                  label="Temperature"
                  value={selectedDevice.temperature}
                  unit="°C"
                  color="text-amber-700"
                />

              </div>
            ) : (
              <div className="rounded-lg border border-[#E5E7F0] bg-[#F5F6FF] p-5 text-center">
                <WifiOff className="mx-auto h-8 w-8 text-[#687086]" />
                <p className="mt-3 font-medium text-[#374151]">
                  Telemetry unavailable
                </p>
                <p className="mt-1 text-sm text-[#687086]">
                  This device is currently {selectedDevice.status.toLowerCase()}.
                </p>
              </div>
            )}

          </div>

        </div>
      </div>

      {/* Disclaimer */}
      <div className="rounded-lg border border-[#E5E7F0] bg-white p-4">
        <p className="text-xs leading-6 text-[#687086]">
          AEGIS Medical Device Monitoring is an educational simulation.
          All telemetry, device information and patient identifiers are
          synthetic. This platform is not a real medical monitoring system
          and must not be used for clinical decisions.
        </p>
      </div>

    </div>
  )
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string
  value: number
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
    </div>
  )
}

function MiniMetric({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-lg border border-[#E5E7F0] bg-white p-3">
      <p className="text-xs text-[#687086]">{label}</p>
      <p className="mt-2 text-sm font-medium text-[#11152F]">{value}</p>
    </div>
  )
}

function DetailRow({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[#E5E7F0] pb-3">
      <span className="text-[#687086]">{label}</span>
      <span className="text-right text-[#11152F]">{value}</span>
    </div>
  )
}

function TelemetryCard({
  icon: Icon,
  label,
  value,
  unit,
  color,
}: {
  icon: React.ElementType
  label: string
  value: number
  unit: string
  color: string
}) {
  return (
    <div className="rounded-lg border border-[#E5E7F0] bg-[#F5F6FF] p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${color}`} />
          <span className="text-sm text-[#687086]">{label}</span>
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-[#11152F]">{value}</span>
        <span className="text-sm text-[#687086]">{unit}</span>
      </div>
    </div>
  )
}

export default DeviceMonitoring
