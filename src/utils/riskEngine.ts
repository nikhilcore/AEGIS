
import type {
  RiskFactors,
  RiskWeights,
  RiskAssessment,
} from '../types/risk'

const DEFAULT_WEIGHTS: RiskWeights = {
  anomaly: 0.35,
  criticality: 0.30,
  vulnerability: 0.20,
  exposure: 0.15,
}

function validateFactors(factors: RiskFactors): void {
  const values = Object.values(factors)

  for (const value of values) {
    if (!Number.isFinite(value) || value < 0 || value > 100) {
      throw new Error(
        'Risk factors must be finite numbers between 0 and 100.',
      )
    }
  }
}

function validateWeights(weights: RiskWeights): void {
  const values = Object.values(weights)

  for (const value of values) {
    if (!Number.isFinite(value) || value < 0) {
      throw new Error(
        'Risk weights must be finite non-negative numbers.',
      )
    }
  }

  const totalWeight = values.reduce(
    (total, weight) => total + weight,
    0,
  )

  if (Math.abs(totalWeight - 1) > 1e-9) {
    throw new Error('Risk weights must add up to 1.')
  }
}

export function calculateRisk(
  factors: RiskFactors,
  weights: RiskWeights = DEFAULT_WEIGHTS,
): RiskAssessment {
  validateFactors(factors)
  validateWeights(weights)

  const weightedScore =
    factors.anomaly * weights.anomaly +
    factors.criticality * weights.criticality +
    factors.vulnerability * weights.vulnerability +
    factors.exposure * weights.exposure

  const score = Math.round(weightedScore)

  let level: RiskAssessment['level']

  if (score >= 75) {
    level = 'Critical'
  } else if (score >= 50) {
    level = 'High'
  } else if (score >= 25) {
    level = 'Medium'
  } else {
    level = 'Low'
  }

  return {
    score,
    level,
    factors: { ...factors },
  }
}

export function getDefaultRiskWeights(): RiskWeights {
  return { ...DEFAULT_WEIGHTS }
}
