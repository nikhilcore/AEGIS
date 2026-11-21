
import type { SecurityEvent } from '../types/securityEvent'

export const events: SecurityEvent[] = [
  {
    id: 'EVT-1042',
    title: 'Unusual network traffic detected',
    assetId: 'AST-001',
    severity: 'Critical',
    timestamp: '2026-11-21T00:10:00',
    description:
      'Simulated medical device network traffic exceeded its baseline.',
    status: 'New',
    anomalyScore: 96,
  },
  {
    id: 'EVT-1041',
    title: 'Multiple authentication attempts',
    assetId: 'AST-002',
    severity: 'High',
    timestamp: '2026-11-21T00:04:00',
    description:
      'Several unsuccessful authentication attempts were observed.',
    status: 'Under Review',
    anomalyScore: 88,
  },
  {
    id: 'EVT-1040',
    title: 'Device configuration changed',
    assetId: 'AST-004',
    severity: 'Medium',
    timestamp: '2026-11-20T23:58:00',
    description:
      'A simulated configuration change was detected.',
    status: 'New',
    anomalyScore: 65,
  },
  {
    id: 'EVT-1039',
    title: 'Connection timeout detected',
    assetId: 'AST-003',
    severity: 'Low',
    timestamp: '2026-11-20T23:50:00',
    description:
      'A temporary simulated connection timeout occurred.',
    status: 'Resolved',
    anomalyScore: 32,
  },
  {
    id: 'EVT-1038',
    title: 'Anomalous data transmission',
    assetId: 'AST-005',
    severity: 'High',
    timestamp: '2026-11-20T23:40:00',
    description:
      'Data transmission volume exceeded the simulated baseline.',
    status: 'Under Review',
    anomalyScore: 82,
  },
]
