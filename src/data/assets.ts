
import type { Asset } from '../types/asset'
import { calculateRisk } from '../utils/riskEngine'

const assetInputs = [
  {
    id: 'AST-001',
    name: 'ICU Patient Monitor 07',
    assetType: 'Medical Monitor',
    department: 'Intensive Care',
    status: 'Online' as const,
    simulatedIp: '10.10.1.7',
    riskFactors: {
      anomaly: 90,
      criticality: 95,
      vulnerability: 70,
      exposure: 80,
    },
  },
  {
    id: 'AST-002',
    name: 'Authentication Server',
    assetType: 'Server',
    department: 'Infrastructure',
    status: 'Online' as const,
    simulatedIp: '10.10.0.10',
    riskFactors: {
      anomaly: 85,
      criticality: 98,
      vulnerability: 90,
      exposure: 85,
    },
  },
  {
    id: 'AST-003',
    name: 'Pharmacy Gateway',
    assetType: 'Gateway',
    department: 'Pharmacy',
    status: 'Online' as const,
    simulatedIp: '10.10.3.2',
    riskFactors: {
      anomaly: 75,
      criticality: 90,
      vulnerability: 65,
      exposure: 80,
    },
  },
  {
    id: 'AST-004',
    name: 'Laboratory Gateway 02',
    assetType: 'Gateway',
    department: 'Laboratory',
    status: 'Online' as const,
    simulatedIp: '10.10.4.2',
    riskFactors: {
      anomaly: 60,
      criticality: 78,
      vulnerability: 55,
      exposure: 65,
    },
  },
  {
    id: 'AST-005',
    name: 'ICU Patient Monitor 03',
    assetType: 'Medical Monitor',
    department: 'Intensive Care',
    status: 'Online' as const,
    simulatedIp: '10.10.1.3',
    riskFactors: {
      anomaly: 40,
      criticality: 88,
      vulnerability: 35,
      exposure: 45,
    },
  },
  {
    id: 'AST-006',
    name: 'Hospital Core Router',
    assetType: 'Network Device',
    department: 'Infrastructure',
    status: 'Online' as const,
    simulatedIp: '10.10.0.1',
    riskFactors: {
      anomaly: 30,
      criticality: 99,
      vulnerability: 30,
      exposure: 50,
    },
  },
  {
    id: 'AST-007',
    name: 'Nurse Station Workstation 02',
    assetType: 'Workstation',
    department: 'Nursing',
    status: 'Online' as const,
    simulatedIp: '10.10.2.12',
    riskFactors: {
      anomaly: 20,
      criticality: 65,
      vulnerability: 25,
      exposure: 30,
    },
  },
]

export const assets: Asset[] = assetInputs.map((asset) => {
  const riskAssessment = calculateRisk(asset.riskFactors)

  return {
    ...asset,
    riskScore: riskAssessment.score,
    riskLevel: riskAssessment.level,
  }
})
