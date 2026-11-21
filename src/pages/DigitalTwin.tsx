import { useEffect, useState } from 'react'

import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type NodeMouseHandler,
} from '@xyflow/react'

import '@xyflow/react/dist/style.css'

import {
  Activity,
  Network,
  Shield,
  Server,
} from 'lucide-react'

import AssetNode from '../components/digital-twin/AssetNode'
import TwinDetailsPanel from '../components/digital-twin/TwinDetailsPanel'

import { twinGraphData } from '../data/twinGraph'

import type { TwinAsset } from '../types/digitalTwin'

// React Flow-compatible asset data
type AssetNodeData = TwinAsset & Record<string, unknown>

type AssetFlowNode = Node<AssetNodeData>

const nodeTypes = {
  asset: AssetNode,
}

// Simulated hospital infrastructure positions
const positions: Record<string, { x: number; y: number }> = {
  'AST-001': { x: 100, y: 100 },
  'AST-002': { x: 400, y: 100 },
  'AST-003': { x: 700, y: 100 },
  'AST-004': { x: 1000, y: 100 },
  'AST-005': { x: 1300, y: 100 },
  'AST-006': { x: 1000, y: 400 },
  'AST-007': { x: 700, y: 400 },
  'AST-008': { x: 400, y: 400 },
}

const initialNodes: AssetFlowNode[] = twinGraphData.assets.map(
  (asset) => ({
    id: asset.id,
    type: 'asset',
    position: positions[asset.id] ?? { x: 0, y: 0 },
    data: {
      ...asset,
    },
  })
)

const initialEdges: Edge[] = twinGraphData.connections.map(
  (connection) => ({
    id: connection.id,
    source: connection.source,
    target: connection.target,
    label: connection.label,
    animated: false,
    style: {
      stroke: '#A79BFA',
      strokeWidth: 1.5,
    },
    labelStyle: { fill: '#687086', fontSize: 10, fontWeight: 500 },
    labelBgStyle: { fill: '#FFFFFF', fillOpacity: 0.9 },
    labelBgPadding: [4, 3],
  })
)

function DigitalTwin() {
  const [nodes, setNodes, onNodesChange] =
    useNodesState<AssetFlowNode>(initialNodes)

  const [edges, setEdges, onEdgesChange] =
    useEdgesState(initialEdges)

  const [backendLoading, setBackendLoading] = useState(true)
  const [backendError, setBackendError] = useState('')

  // Refresh asset details from the backend while retaining the graph topology.
  useEffect(() => {
    let cancelled = false

    const loadAssets = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/assets')
        if (!response.ok) throw new Error('Asset request failed')
        const payload = await response.json()
        const rows = payload.assets ?? []

        const updatedNodes: AssetFlowNode[] = twinGraphData.assets.map((template) => {
          const row = rows.find((asset: any) =>
            String(asset.external_id ?? asset.asset_code ?? asset.id) === template.id ||
            String(asset.name ?? '').toLowerCase() === template.name.toLowerCase()
          )

          if (!row) {
            return {
              id: template.id,
              type: 'asset',
              position: positions[template.id] ?? { x: 0, y: 0 },
              data: { ...template },
            }
          }

          const riskLevel = row.risk_level ?? row.riskLevel ?? template.riskLevel
          const status = row.status ?? template.status

          const merged: TwinAsset = {
            ...template,
            name: row.name ?? template.name,
            department: row.department ?? template.department,
            riskLevel,
            riskScore: Number(row.risk_score ?? row.riskScore ?? template.riskScore ?? 0),
            status,
          }

          return {
            id: template.id,
            type: 'asset',
            position: positions[template.id] ?? { x: 0, y: 0 },
            data: { ...merged },
          }
        })

        if (!cancelled) {
          setNodes(updatedNodes)
          setBackendError('')
        }
      } catch (error) {
        console.error('Digital Twin asset fetch error:', error)
        if (!cancelled) {
          setBackendError('Backend asset data is unavailable. Showing the simulated graph data.')
        }
      } finally {
        if (!cancelled) setBackendLoading(false)
      }
    }

    loadAssets()
    const timer = setInterval(loadAssets, 10000)

    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [setNodes])

  const [selectedAsset, setSelectedAsset] =
    useState<TwinAsset | null>(null)

  // Select an asset
  const handleNodeClick: NodeMouseHandler<AssetFlowNode> = (
    _event,
    node
  ) => {
    setSelectedAsset(node.data as TwinAsset)
  }

  // Simulated asset isolation
  // Simulated asset isolation
const handleIsolate = (assetId: string) => {
  setNodes((currentNodes) =>
    currentNodes.map((node) =>
      node.id === assetId
        ? {
            ...node,
            data: {
              ...node.data,
              status: 'Isolated',
            },
          }
        : node
    )
  )

  // Make connections to the isolated asset disappear
  setEdges((currentEdges) =>
    currentEdges.map((edge) =>
      edge.source === assetId || edge.target === assetId
        ? {
            ...edge,
            hidden: true,
          }
        : edge
    )
  )

  setSelectedAsset((current) =>
    current?.id === assetId
      ? {
          ...current,
          status: 'Isolated',
        }
      : current
  )
}

// Restore simulated asset connectivity
const handleRestore = (assetId: string) => {
  setNodes((currentNodes) =>
    currentNodes.map((node) =>
      node.id === assetId
        ? {
            ...node,
            data: {
              ...node.data,
              status: 'Online',
            },
          }
        : node
    )
  )

  // Make the asset's connections visible again
  setEdges((currentEdges) =>
    currentEdges.map((edge) =>
      edge.source === assetId || edge.target === assetId
        ? {
            ...edge,
            hidden: false,
          }
        : edge
    )
  )

  setSelectedAsset((current) =>
    current?.id === assetId
      ? {
          ...current,
          status: 'Online',
        }
      : current
  )
}

  const totalAssets = nodes.length

  const criticalAssets = nodes.filter(
    (node) => node.data.riskLevel === 'Critical'
  ).length

  const highRiskAssets = nodes.filter(
    (node) => node.data.riskLevel === 'High'
  ).length

  const isolatedAssets = nodes.filter(
    (node) => node.data.status === 'Isolated'
  ).length

  const connections = edges.length

  return (
    <div className="flex h-full min-h-[calc(100vh-80px)] min-w-0 max-w-full flex-col overflow-hidden bg-[#F5F6FF] text-[#11152F]">

      {/* Header */}
      <div className="border-b border-[#E5E7F0] bg-white px-4 py-5 sm:px-6">

        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">

          <div>
            <div className="mb-2 flex items-center gap-2">
              <Network size={18} className="text-[#6045F5]" />

              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6045F5]">
                Infrastructure Intelligence
              </span>
            </div>

            <h1 className="text-2xl font-bold text-[#11152F]">
              Hospital Digital Twin
            </h1>

            <p className="mt-1 text-sm text-[#687086]">
              Interactive simulation of hospital infrastructure,
              assets and network dependencies.
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2">
              <Activity size={16} className="text-emerald-600" />

              <span className="text-xs font-medium text-emerald-600">
                Simulation Active
              </span>
            </div>
            <span className="text-[11px] text-[#687086]">
              {backendLoading ? 'Syncing assets...' : backendError ? 'Fallback graph data' : 'Backend assets synced · refreshes every 10s'}
            </span>
          </div>

        </div>

        {/* Statistics */}
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">

          <StatCard
            icon={<Network size={18} />}
            title="Total Assets"
            value={totalAssets}
            color="text-[#6045F5]"
          />

          <StatCard
            icon={<Shield size={18} />}
            title="Critical Assets"
            value={criticalAssets}
            color="text-red-500"
          />

          <StatCard
            icon={<Activity size={18} />}
            title="High Risk Assets"
            value={highRiskAssets}
            color="text-amber-600"
          />

          <StatCard
            icon={<Shield size={18} />}
            title="Isolated Assets"
            value={isolatedAssets}
            color="text-red-500"
          />

          <StatCard
            icon={<Server size={18} />}
            title="Connections"
            value={connections}
            color="text-[#6045F5]"
          />

        </div>
      </div>

      {backendError && (
        <div className="mx-4 mt-3 sm:mx-6 rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-2 text-xs text-amber-700">
          {backendError}
        </div>
      )}

      {/* Network Canvas */}
      <div className="relative min-h-[520px] min-w-0 flex-1 overflow-hidden rounded-xl border border-[#E5E7F0] bg-white shadow-sm">

        <div className="absolute inset-0 min-w-0">

          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={handleNodeClick}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.2}
            maxZoom={2}
            className="bg-[#F5F6FF] min-w-0"
          >

            <Background
              color="#DDE1F2"
              gap={20}
              size={1}
            />

            <Controls position="top-right" />

            <MiniMap
              nodeColor={(node) => {
                const data = node.data as unknown as TwinAsset

                switch (data.riskLevel) {
                  case 'Critical':
                    return '#ef4444'

                  case 'High':
                    return '#f59e0b'

                  case 'Medium':
                    return '#38bdf8'

                  case 'Low':
                    return '#10b981'

                  default:
                    return '#64748b'
                }
              }}
              maskColor="rgba(245, 246, 255, 0.55)"
              position="bottom-right"
              className="!border !border-[#E5E7F0] !bg-white !rounded-xl !shadow-md"
            />

          </ReactFlow>
        </div>

        {/* Legend */}
        <div className="absolute bottom-3 left-3 z-10 max-w-[calc(100%-24px)] rounded-xl border border-[#E5E7F0] bg-white/95 p-3 shadow-lg backdrop-blur sm:bottom-4 sm:left-4 sm:p-4">

          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#687086]">
            Risk Legend
          </p>

          <div className="space-y-2">
            <LegendItem color="bg-emerald-500" label="Low Risk" />
            <LegendItem color="bg-sky-500" label="Medium Risk" />
            <LegendItem color="bg-amber-500" label="High Risk" />
            <LegendItem color="bg-red-500" label="Critical Risk" />
          </div>

          <div className="mt-3 border-t border-[#E5E7F0] pt-3">
            <p className="text-[10px] text-[#687086]">
              All assets and risk values are simulated.
            </p>
          </div>
        </div>

        {/* Asset Details */}
        {selectedAsset && (
          <div className="absolute right-2 top-2 z-20 w-[350px] max-w-[calc(100%-16px)] sm:right-4 sm:top-4">

            <TwinDetailsPanel
              asset={selectedAsset}
              onClose={() => setSelectedAsset(null)}
              onIsolate={handleIsolate}
              onRestore={handleRestore}
            />

          </div>
        )}

      </div>
    </div>
  )
}

function StatCard({
  icon,
  title,
  value,
  color,
}: {
  icon: React.ReactNode
  title: string
  value: number
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

function LegendItem({
  color,
  label,
}: {
  color: string
  label: string
}) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />

      <span className="text-xs text-[#687086]">
        {label}
      </span>
    </div>
  )
}

export default DigitalTwin