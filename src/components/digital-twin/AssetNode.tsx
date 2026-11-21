import {
  Handle,
  Position,
  type Node,
  type NodeProps,
} from '@xyflow/react'

import {
  Monitor,
  Server,
  Network,
  Workflow,
  AppWindow,
  Shield,
} from 'lucide-react'

import type {
  TwinAsset,
  TwinRiskLevel,
} from '../../types/digitalTwin'

type AssetNodeData = TwinAsset & Record<string, unknown>

type AssetFlowNode = Node<AssetNodeData>

const riskStyles: Record<TwinRiskLevel, string> = {
  Low: 'border-emerald-200 bg-white',
  Medium: 'border-sky-200 bg-white',
  High: 'border-amber-200 bg-white',
  Critical: 'border-red-200 bg-white',
}

const riskBadgeStyles: Record<TwinRiskLevel, string> = {
  Low: 'bg-emerald-50 text-emerald-700',
  Medium: 'bg-sky-50 text-sky-700',
  High: 'bg-amber-50 text-amber-700',
  Critical: 'bg-red-50 text-red-700',
}

const statusStyles: Record<TwinAsset['status'], string> = {
  Online: 'bg-emerald-500',
  Offline: 'bg-slate-400',
  Isolated: 'bg-red-500',
  Maintenance: 'bg-amber-500',
}

function getAssetIcon(type: TwinAsset['type']) {
  switch (type) {
    case 'Medical Device':
      return Monitor
    case 'Server':
      return Server
    case 'Network':
      return Network
    case 'Gateway':
      return Shield
    case 'Application':
      return AppWindow
    default:
      return Workflow
  }
}

function getRiskBarColor(riskLevel: TwinRiskLevel) {
  switch (riskLevel) {
    case 'Critical':
      return 'bg-red-500'
    case 'High':
      return 'bg-amber-500'
    case 'Medium':
      return 'bg-sky-500'
    case 'Low':
      return 'bg-emerald-500'
    default:
      return 'bg-slate-400'
  }
}

function AssetNode({ data, selected }: NodeProps<AssetFlowNode>) {
  const Icon = getAssetIcon(data.type)

  return (
    <div
      className={`w-[230px] overflow-visible rounded-xl border shadow-md transition-all ${riskStyles[data.riskLevel]} ${
        selected ? 'ring-2 ring-[#6045F5] ring-offset-2 ring-offset-[#F5F6FF]' : ''
      }`}
    >
      {/* Incoming connection */}
      <Handle
        type="target"
        position={Position.Top}
        className="!h-2.5 !w-2.5 !border-2 !border-white !bg-slate-500"
      />

      {/* Asset header */}
      <div className="flex items-start gap-3 p-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#E5E7F0] bg-[#F5F6FF] text-[#6045F5]">
          <Icon size={19} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-medium uppercase tracking-wider text-[#687086]">
            {data.type}
          </p>
          <h3 className="mt-1 break-words text-sm font-semibold leading-5 text-[#11152F]">
            {data.name}
          </h3>
        </div>
      </div>

      {/* Status and risk */}
      <div className="flex items-center justify-between border-t border-[#E5E7F0] px-3 py-2">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${statusStyles[data.status]}`} />
          <span className="text-xs text-[#687086]">{data.status}</span>
        </div>
        <span
          className={`rounded-md px-2 py-1 text-[10px] font-semibold ${riskBadgeStyles[data.riskLevel]}`}
        >
          {data.riskLevel}
        </span>
      </div>

      {/* Risk score */}
      <div className="border-t border-[#E5E7F0] px-3 py-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="text-xs text-[#687086]">Simulated Risk</span>
          <span className="text-sm font-bold text-[#11152F]">
            {data.riskScore}/100
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-[#E5E7F0]">
          <div
            className={`h-full rounded-full ${getRiskBarColor(data.riskLevel)}`}
            style={{ width: `${Math.max(0, Math.min(100, data.riskScore))}%` }}
          />
        </div>
      </div>

      {/* Department */}
      <div className="border-t border-[#E5E7F0] px-3 py-2">
        <p className="truncate text-[11px] text-[#687086]">{data.department}</p>
      </div>

      {/* Outgoing connection */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-2.5 !w-2.5 !border-2 !border-white !bg-slate-500"
      />
    </div>
  )
}

export default AssetNode
