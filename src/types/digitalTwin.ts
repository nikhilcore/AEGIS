export type TwinAssetType =
  | 'Medical Device'
  | 'Server'
  | 'Network'
  | 'Application'
  | 'Gateway'

export type TwinAssetStatus =
  | 'Online'
  | 'Offline'
  | 'Isolated'
  | 'Maintenance'

export type TwinRiskLevel =
  | 'Low'
  | 'Medium'
  | 'High'
  | 'Critical'

export interface TwinAsset {
  id: string
  name: string
  type: TwinAssetType
  department: string
  status: TwinAssetStatus
  riskScore: number
  riskLevel: TwinRiskLevel
  criticality: number
  simulatedIp: string
  description: string
}

export interface TwinConnection {
  id: string
  source: string
  target: string
  label?: string
}

export interface TwinGraphData {
  assets: TwinAsset[]
  connections: TwinConnection[]
}