
import type { RiskFactors } from './risk'

export type AssetStatus =
  | 'Online'
  | 'Offline'
  | 'Isolated'
  | 'Maintenance'

export type RiskLevel = 'Critical' | 'High' | 'Medium' | 'Low'

export interface Asset {
  id: string
  name: string
  assetType: string
  department: string
  status: AssetStatus
  simulatedIp: string
  riskFactors: RiskFactors
  riskScore: number
  riskLevel: RiskLevel
}
