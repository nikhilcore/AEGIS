import {
  X,
  Shield,
  Activity,
  Server,
  Network,
  Monitor,
  AlertTriangle,
  CheckCircle2,
  Power,
} from 'lucide-react'

import type {
  TwinAsset,
  TwinRiskLevel,
} from '../../types/digitalTwin'

interface TwinDetailsPanelProps {
  asset: TwinAsset
  onClose: () => void
  onIsolate: (assetId: string) => void
  onRestore: (assetId: string) => void
}

const riskStyles: Record<TwinRiskLevel, string> = {
  Low: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  Medium: 'text-blue-700 bg-blue-50 border-blue-200',
  High: 'text-amber-700 bg-amber-50 border-amber-200',
  Critical: 'text-red-700 bg-red-50 border-red-200',
}

const statusStyles: Record<TwinAsset['status'], string> = {
  Online: 'text-emerald-700',
  Offline: 'text-slate-500',
  Isolated: 'text-red-700',
  Maintenance: 'text-amber-700',
}

function TwinDetailsPanel({
  asset,
  onClose,
  onIsolate,
  onRestore,
}: TwinDetailsPanelProps) {
  const isIsolated = asset.status === 'Isolated'

  return (
    <div className="overflow-hidden rounded-2xl border border-[#E5E7F0] bg-white shadow-xl">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-[#E5E7F0] bg-[#F5F6FF] p-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#E5E7F0] bg-white text-[#6045F5]">
            {asset.type === 'Medical Device' ? (
              <Monitor size={20} />
            ) : asset.type === 'Network' ? (
              <Network size={20} />
            ) : (
              <Server size={20} />
            )}
          </div>

          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-widest text-[#6045F5]">
              Asset Inspection
            </p>
            <h2 className="mt-1 break-words text-sm font-bold text-[#11152F]">
              {asset.name}
            </h2>
            <p className="mt-1 text-xs text-[#687086]">{asset.id}</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="shrink-0 rounded-lg border border-[#E5E7F0] bg-white p-2 text-[#687086] transition hover:bg-[#F5F6FF] hover:text-[#11152F]"
          aria-label="Close asset details"
        >
          <X size={18} />
        </button>
      </div>

      {/* Status */}
      <div className="p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-[#687086]">Operational Status</span>
          <div className={`flex items-center gap-2 text-xs font-semibold ${statusStyles[asset.status]}`}>
            <span className={`h-2 w-2 rounded-full ${
              isIsolated ? 'bg-red-500' :
              asset.status === 'Online' ? 'bg-emerald-500' :
              asset.status === 'Offline' ? 'bg-slate-400' :
              'bg-amber-500'
            }`} />
            {asset.status}
          </div>
        </div>

        {/* Risk Score */}
        <div className="mt-5 rounded-xl border border-[#E5E7F0] bg-[#F5F6FF] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-[#687086]">Simulated Risk Score</p>
              <p className="mt-1 text-3xl font-bold text-[#11152F]">
                {asset.riskScore}
                <span className="text-sm text-[#687086]">/100</span>
              </p>
            </div>
            <div className={`rounded-lg border px-3 py-2 text-xs font-semibold ${riskStyles[asset.riskLevel]}`}>
              {asset.riskLevel}
            </div>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#E5E7F0]">
            <div
              className={`h-full rounded-full ${
                asset.riskLevel === 'Critical'
                  ? 'bg-red-500'
                  : asset.riskLevel === 'High'
                  ? 'bg-amber-500'
                  : asset.riskLevel === 'Medium'
                  ? 'bg-blue-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${asset.riskScore}%` }}
            />
          </div>

          <p className="mt-2 text-[10px] text-[#687086]">
            Risk values are simulated for demonstration purposes.
          </p>
        </div>

        {/* Asset information */}
        <div className="mt-5 space-y-4">
          <InfoRow icon={<Shield size={15} />} label="Asset Type" value={asset.type} />
          <InfoRow icon={<Activity size={15} />} label="Department" value={asset.department} />
          <InfoRow icon={<Network size={15} />} label="Simulated IP" value={asset.simulatedIp} />
          <InfoRow icon={<Shield size={15} />} label="Criticality" value={`${asset.criticality}/10`} />
        </div>

        {/* Description */}
        <div className="mt-5">
          <p className="mb-2 text-xs font-semibold text-[#11152F]">Asset Description</p>
          <div className="rounded-xl border border-[#E5E7F0] bg-white p-3">
            <p className="text-xs leading-6 text-[#687086]">{asset.description}</p>
          </div>
        </div>

        {/* Isolation notice */}
        {isIsolated && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle size={16} className="mt-0.5 shrink-0 text-red-600" />
              <div>
                <p className="text-xs font-semibold text-red-700">Asset Isolated</p>
                <p className="mt-1 text-xs leading-5 text-red-700/80">
                  This asset has been isolated in the AEGIS simulation. Its simulated connectivity will be updated.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Simulation controls */}
        <div className="mt-5 border-t border-[#E5E7F0] pt-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#687086]">
            Simulation Actions
          </p>

          {isIsolated ? (
            <button
              onClick={() => onRestore(asset.id)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
            >
              <CheckCircle2 size={17} />
              Restore Connectivity
            </button>
          ) : (
            <button
              onClick={() => onIsolate(asset.id)}
              disabled={asset.status === 'Offline'}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Power size={17} />
              Isolate Asset
            </button>
          )}

          <p className="mt-3 text-center text-[10px] leading-5 text-[#687086]">
            Simulation only. No real devices or network connections are affected.
          </p>
        </div>
      </div>
    </div>
  )
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex shrink-0 items-center gap-2 text-[#687086]">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <span className="max-w-[60%] truncate text-right text-xs font-medium text-[#11152F]">
        {value}
      </span>
    </div>
  )
}

export default TwinDetailsPanel
