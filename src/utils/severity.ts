
import type { RiskLevel } from '../types/asset'
import type { EventSeverity } from '../types/securityEvent'

type Severity = RiskLevel | EventSeverity

export function getSeverityClass(severity: Severity): string {
  switch (severity) {
    case 'Critical':
      return 'border-red-500/20 bg-red-500/10 text-red-400'

    case 'High':
      return 'border-amber-500/20 bg-amber-500/10 text-amber-400'

    case 'Medium':
      return 'border-sky-500/20 bg-sky-500/10 text-sky-400'

    case 'Low':
      return 'border-slate-500/20 bg-slate-500/10 text-slate-400'
  }
}

export function getRiskBarClass(score: number): string {
  if (score >= 75) return 'bg-red-500'
  if (score >= 50) return 'bg-amber-400'
  if (score >= 25) return 'bg-sky-400'
  return 'bg-slate-400'
}
