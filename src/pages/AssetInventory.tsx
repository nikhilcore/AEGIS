import { useEffect, useMemo, useState } from 'react'
import {
  Search,
  Shield,
  Server,
  Monitor,
  Activity,
  Wifi,
  ChevronDown,
  X,
} from 'lucide-react'

import type { Asset } from '../types/asset'
import { getSeverityClass, getRiskBarClass } from '../utils/severity'

const API_URL = 'http://localhost:5000/api/assets'

const statuses = ['All Statuses', 'Online', 'Offline', 'Isolated', 'Maintenance']
const riskLevels = ['All Risk Levels', 'Critical', 'High', 'Medium', 'Low']

function normaliseAsset(raw: any): Asset {
  return {
    id: raw.id,
    name: raw.name,
    assetType: raw.assetType ?? raw.asset_type ?? raw.type ?? 'Unknown',
    department: raw.department ?? 'Unknown',
    simulatedIp:
      raw.simulatedIp ?? raw.simulated_ip ?? raw.ip_address ?? 'N/A',
    status: raw.status ?? 'Unknown',
    riskScore: Number(raw.riskScore ?? raw.risk_score ?? 0),
    riskLevel: raw.riskLevel ?? raw.risk_level ?? 'Low',
    riskFactors: raw.riskFactors ?? raw.risk_factors ?? {},
  }
}

function AssetIcon({ type }: { type: string }) {
  if (type.toLowerCase().includes('monitor')) {
    return <Activity size={18} />
  }

  if (type.toLowerCase().includes('server')) {
    return <Server size={18} />
  }

  if (type.toLowerCase().includes('router')) {
    return <Wifi size={18} />
  }

  return <Monitor size={18} />
}

function AssetDetailPanel({
  asset,
  onClose,
}: {
  asset: Asset
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#11152F]/30 backdrop-blur-sm">
      <div className="h-full w-full max-w-lg overflow-y-auto border-l border-[#E5E7F0] bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs tracking-[2px] text-[#6045F5]">
              ASSET DETAILS
            </p>

            <h2 className="mt-2 text-xl font-semibold text-[#11152F]">
              {asset.name}
            </h2>

            <p className="mt-1 text-sm text-[#687086]">{asset.id}</p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg border border-[#E5E7F0] p-2 text-[#687086] hover:bg-[#F5F6FF]"
            aria-label="Close asset details"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-6 rounded-xl border border-[#E5E7F0] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#687086]">Simulated Risk Score</p>

              <p className="mt-2 text-4xl font-semibold text-[#11152F]">
                {asset.riskScore}
                <span className="text-base text-[#687086]">/100</span>
              </p>
            </div>

            <span
              className={`rounded-lg border px-3 py-2 text-sm ${getSeverityClass(asset.riskLevel)}`}
            >
              {asset.riskLevel}
            </span>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#E5E7F0]">
            <div
              className={`h-full ${getRiskBarClass(asset.riskScore)}`}
              style={{ width: `${asset.riskScore}%` }}
            />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-[#E5E7F0] bg-white p-4 shadow-sm">
            <p className="text-xs text-[#687086]">Asset Type</p>
            <p className="mt-2 text-sm text-[#11152F]">{asset.assetType}</p>
          </div>

          <div className="rounded-xl border border-[#E5E7F0] bg-white p-4 shadow-sm">
            <p className="text-xs text-[#687086]">Department</p>
            <p className="mt-2 text-sm text-[#11152F]">{asset.department}</p>
          </div>

          <div className="rounded-xl border border-[#E5E7F0] bg-white p-4 shadow-sm">
            <p className="text-xs text-[#687086]">Status</p>
            <p className="mt-2 text-sm text-[#11152F]">{asset.status}</p>
          </div>

          <div className="rounded-xl border border-[#E5E7F0] bg-white p-4 shadow-sm">
            <p className="text-xs text-[#687086]">Simulated IP</p>
            <p className="mt-2 font-mono text-sm text-[#11152F]">
              {asset.simulatedIp}
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-[#E5E7F0] bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-[#11152F]">Risk Factor Breakdown</h3>

          <p className="mt-1 text-xs text-[#687086]">
            Inputs used by the AEGIS risk engine
          </p>

          <div className="mt-5 space-y-5">
            {Object.entries(asset.riskFactors).map(([factor, value]) => (
              <div key={factor}>
                <div className="mb-2 flex justify-between">
                  <span className="text-sm capitalize text-[#687086]">
                    {factor}
                  </span>

                  <span className="text-sm font-medium text-[#11152F]">
                    {value}/100
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-[#E5E7F0]">
                  <div
                    className="h-full rounded-full bg-[#6045F5]"
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            ))}

            {Object.keys(asset.riskFactors).length === 0 && (
              <p className="text-sm text-[#687086]">
                Risk factor details are unavailable.
              </p>
            )}
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-[#E5E7F0] bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-[#11152F]">
            Infrastructure Information
          </h3>

          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-3">
              <span className="text-[#687086]">Asset ID</span>
              <span className="text-[#11152F]">{asset.id}</span>
            </div>

            <div className="flex justify-between gap-3">
              <span className="text-[#687086]">Department</span>
              <span className="text-[#11152F]">{asset.department}</span>
            </div>

            <div className="flex justify-between gap-3">
              <span className="text-[#687086]">Status</span>
              <span className="text-[#11152F]">{asset.status}</span>
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-[#477BFF]/20 bg-[#F5F6FF] p-4">
          <p className="text-sm text-[#477BFF]">
            All asset data and risk scores in this workspace are simulated.
          </p>
        </div>
      </div>
    </div>
  )
}

function AssetInventory() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState('All Departments')
  const [type, setType] = useState('All Types')
  const [status, setStatus] = useState('All Statuses')
  const [risk, setRisk] = useState('All Risk Levels')
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await fetch(API_URL)

        if (!response.ok) {
          throw new Error(`API request failed: ${response.status}`)
        }

        const data = await response.json()

        const rawAssets = Array.isArray(data) ? data : data.assets

        if (!Array.isArray(rawAssets)) {
          throw new Error('Invalid assets response from server.')
        }

        setAssets(rawAssets.map(normaliseAsset))
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Unable to load assets.',
        )
      } finally {
        setLoading(false)
      }
    }

    fetchAssets()
  }, [])

  const departments = useMemo(
    () => [
      'All Departments',
      ...new Set(assets.map((asset) => asset.department)),
    ],
    [assets],
  )

  const assetTypes = useMemo(
    () => ['All Types', ...new Set(assets.map((asset) => asset.assetType))],
    [assets],
  )

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const query = search.toLowerCase()

      const matchesSearch =
        asset.name.toLowerCase().includes(query) ||
        asset.id.toLowerCase().includes(query) ||
        asset.department.toLowerCase().includes(query) ||
        asset.assetType.toLowerCase().includes(query) ||
        asset.simulatedIp.toLowerCase().includes(query)

      const matchesDepartment =
        department === 'All Departments' || asset.department === department

      const matchesType = type === 'All Types' || asset.assetType === type

      const matchesStatus = status === 'All Statuses' || asset.status === status

      const matchesRisk = risk === 'All Risk Levels' || asset.riskLevel === risk

      return (
        matchesSearch &&
        matchesDepartment &&
        matchesType &&
        matchesStatus &&
        matchesRisk
      )
    })
  }, [assets, search, department, type, status, risk])

  const criticalCount = assets.filter(
    (asset) => asset.riskLevel === 'Critical',
  ).length

  const highCount = assets.filter(
    (asset) => asset.riskLevel === 'High',
  ).length

  const onlineCount = assets.filter(
    (asset) => asset.status === 'Online',
  ).length

  const resetFilters = () => {
    setSearch('')
    setDepartment('All Departments')
    setType('All Types')
    setStatus('All Statuses')
    setRisk('All Risk Levels')
  }

  return (
    <div className="w-full min-w-0 space-y-6">
      {loading && (
        <div className="rounded-xl border border-[#E5E7F0] bg-white p-6 text-sm text-[#6045F5]">
          Loading assets from AEGIS database...
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-[#EF4444]/20 bg-[#EF4444]/5 p-4 text-sm text-[#EF4444]">
          {error}
        </div>
      )}

      {/* Heading */}
      <div>
        <p className="text-xs font-medium tracking-[2px] text-[#477BFF]">
          INFRASTRUCTURE
        </p>

        <h1 className="mt-2 text-2xl font-semibold text-[#11152F]">
          Asset Inventory
        </h1>

        <p className="mt-2 text-sm text-[#687086]">
          Explore and prioritise simulated hospital infrastructure assets.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Total Assets"
          value={assets.length}
          icon={<Server size={18} />}
        />

        <SummaryCard
          title="Online Assets"
          value={onlineCount}
          icon={<Wifi size={18} />}
        />

        <SummaryCard
          title="Critical Assets"
          value={criticalCount}
          icon={<Shield size={18} />}
          accent="text-red-400"
        />

        <SummaryCard
          title="High Risk Assets"
          value={highCount}
          icon={<Shield size={18} />}
          accent="text-amber-400"
        />
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-[#E5E7F0] bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#687086]"
            />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, ID, IP, department or type..."
              className="w-full min-w-0 rounded-lg border border-[#E5E7F0] bg-white py-3 pl-10 pr-4 text-sm text-[#11152F] placeholder:text-[#9AA3B5] outline-none transition focus:border-[#6045F5] focus:ring-2 focus:ring-[#6045F5]/10"
            />
          </div>

          <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <FilterSelect
              value={department}
              options={departments}
              onChange={setDepartment}
            />

            <FilterSelect value={type} options={assetTypes} onChange={setType} />

            <FilterSelect
              value={status}
              options={statuses}
              onChange={setStatus}
            />

            <FilterSelect value={risk} options={riskLevels} onChange={setRisk} />
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-[#687086]">
              Showing {filteredAssets.length} of {assets.length} assets
            </p>

            <button
              onClick={resetFilters}
              className="flex items-center gap-2 text-xs text-[#6045F5] hover:text-[#477BFF]"
            >
              <X size={14} />
              Reset filters
            </button>
          </div>
        </div>
      </div>

      {/* Asset Table */}
      <div className="overflow-hidden rounded-xl border border-[#E5E7F0] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead className="border-b border-[#E5E7F0] bg-[#F5F6FF]">
              <tr>
                <th className="px-5 py-4 text-xs font-semibold tracking-wide text-[#687086]">
                  ASSET
                </th>

                <th className="px-5 py-4 text-xs font-semibold tracking-wide text-[#687086]">
                  DEPARTMENT
                </th>

                <th className="px-5 py-4 text-xs font-semibold tracking-wide text-[#687086]">
                  IP ADDRESS
                </th>

                <th className="px-5 py-4 text-xs font-semibold tracking-wide text-[#687086]">
                  STATUS
                </th>

                <th className="px-5 py-4 text-xs font-semibold tracking-wide text-[#687086]">
                  RISK
                </th>

                <th className="px-5 py-4 text-xs font-semibold tracking-wide text-[#687086]">
                  SCORE
                </th>

                <th className="px-5 py-4 text-xs font-semibold tracking-wide text-[#687086]">
                  ACTION
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#E5E7F0]">
              {filteredAssets.map((asset) => (
                <tr key={asset.id} className="transition hover:bg-[#F5F6FF]">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg border border-[#E5E7F0] bg-[#F5F6FF] p-2 text-[#6045F5]">
                        <AssetIcon type={asset.assetType} />
                      </div>

                      <div>
                        <p className="text-sm font-medium text-[#11152F]">
                          {asset.name}
                        </p>

                        <p className="mt-1 text-xs text-[#687086]">
                          {asset.id} · {asset.assetType}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4 text-sm text-[#687086]">
                    {asset.department}
                  </td>

                  <td className="px-5 py-4 font-mono text-xs text-[#687086]">
                    {asset.simulatedIp}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`rounded-md border px-2.5 py-1 text-xs ${
                        asset.status === 'Online'
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          : 'border-slate-200 bg-slate-50 text-slate-600'
                      }`}
                    >
                      {asset.status}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`rounded-md border px-2.5 py-1 text-xs ${getSeverityClass(asset.riskLevel)}`}
                    >
                      {asset.riskLevel}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="w-8 text-sm font-semibold text-[#11152F]">
                        {asset.riskScore}
                      </span>

                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-[#E5E7F0]">
                        <div
                          className={`h-full ${getRiskBarClass(asset.riskScore)}`}
                          style={{ width: `${asset.riskScore}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <button
                      onClick={() => setSelectedAsset(asset)}
                      className="rounded-lg border border-[#6045F5]/20 bg-[#F5F6FF] px-3 py-2 text-xs font-medium text-[#6045F5] transition hover:border-[#6045F5]/40 hover:bg-[#6045F5]/10"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}

              {!loading && filteredAssets.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center text-sm text-[#687086]"
                  >
                    No assets match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedAsset && (
        <AssetDetailPanel
          asset={selectedAsset}
          onClose={() => setSelectedAsset(null)}
        />
      )}
    </div>
  )
}

function SummaryCard({
  title,
  value,
  icon,
  accent = 'text-[#6045F5]',
}: {
  title: string
  value: number
  icon: React.ReactNode
  accent?: string
}) {
  return (
    <div className="rounded-xl border border-[#E5E7F0] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[#687086]">{title}</p>

          <p className="mt-3 text-2xl font-semibold text-[#11152F]">{value}</p>
        </div>

        <div
          className={`rounded-lg border border-[#E5E7F0] bg-[#F5F6FF] p-3 ${accent}`}
        >
          {icon}
        </div>
      </div>
    </div>
  )
}

function FilterSelect({
  value,
  options,
  onChange,
}: {
  value: string
  options: string[]
  onChange: (value: string) => void
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full appearance-none rounded-xl border border-[#E5E7F0] bg-[#F5F6FF] px-4 py-3 pr-10 text-sm text-[#11152F] outline-none transition focus:border-[#6045F5] focus:ring-2 focus:ring-[#6045F5]/10"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#687086]"
      />
    </div>
  )
}

export default AssetInventory