
export type EventSeverity = 'Critical' | 'High' | 'Medium' | 'Low'

export type EventStatus = 'New' | 'Under Review' | 'Resolved'

export interface SecurityEvent {
  id: string
  title: string
  assetId: string
  severity: EventSeverity
  timestamp: string
  description: string
  status: EventStatus
  anomalyScore: number
}
