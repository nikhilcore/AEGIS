
import type { RiskLevel } from './asset'

export interface RiskFactors {
  anomaly: number
  criticality: number
  vulnerability: number
  exposure: number
}

export interface RiskWeights {
  anomaly: number
  criticality: number
  vulnerability: number
  exposure: number
}

export interface RiskAssessment {
  score: number
  level: RiskLevel
  factors: RiskFactors
}
