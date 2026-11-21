
import type { TwinGraphData } from '../types/digitalTwin'

export const twinGraphData: TwinGraphData = {
  assets: [
    {
      id: 'AST-001',
      name: 'ICU Patient Monitor 07',
      type: 'Medical Device',
      department: 'Intensive Care',
      status: 'Online',
      riskScore: 86,
      riskLevel: 'Critical',
      criticality: 95,
      simulatedIp: '10.10.1.7',
      description:
        'Simulated patient monitoring device connected to the ICU infrastructure.',
    },
    {
      id: 'AST-002',
      name: 'ICU Network Gateway',
      type: 'Gateway',
      department: 'Intensive Care',
      status: 'Online',
      riskScore: 72,
      riskLevel: 'High',
      criticality: 90,
      simulatedIp: '10.10.1.1',
      description:
        'Simulated gateway responsible for connecting ICU devices to internal services.',
    },
    {
      id: 'AST-003',
      name: 'Hospital Core Router',
      type: 'Network',
      department: 'IT Infrastructure',
      status: 'Online',
      riskScore: 45,
      riskLevel: 'Medium',
      criticality: 98,
      simulatedIp: '10.10.0.1',
      description:
        'Simulated central network routing infrastructure.',
    },
    {
      id: 'AST-004',
      name: 'Hospital Application Server',
      type: 'Server',
      department: 'IT Infrastructure',
      status: 'Online',
      riskScore: 61,
      riskLevel: 'High',
      criticality: 90,
      simulatedIp: '10.10.2.10',
      description:
        'Simulated server supporting hospital internal applications.',
    },
    {
      id: 'AST-005',
      name: 'Authentication Server',
      type: 'Server',
      department: 'IT Infrastructure',
      status: 'Online',
      riskScore: 78,
      riskLevel: 'High',
      criticality: 100,
      simulatedIp: '10.10.2.15',
      description:
        'Simulated authentication service for internal hospital systems.',
    },
    {
      id: 'AST-006',
      name: 'Pharmacy Management System',
      type: 'Application',
      department: 'Pharmacy',
      status: 'Online',
      riskScore: 34,
      riskLevel: 'Medium',
      criticality: 85,
      simulatedIp: '10.10.3.20',
      description:
        'Simulated pharmacy application used for operational workflows.',
    },
    {
      id: 'AST-007',
      name: 'Laboratory Information Server',
      type: 'Server',
      department: 'Laboratory',
      status: 'Online',
      riskScore: 22,
      riskLevel: 'Low',
      criticality: 80,
      simulatedIp: '10.10.4.10',
      description:
        'Simulated laboratory information processing server.',
    },
    {
      id: 'AST-008',
      name: 'Emergency Department Monitor 03',
      type: 'Medical Device',
      department: 'Emergency',
      status: 'Online',
      riskScore: 53,
      riskLevel: 'High',
      criticality: 92,
      simulatedIp: '10.10.5.3',
      description:
        'Simulated monitoring device used in the emergency department.',
    },
  ],

  connections: [
    {
      id: 'CON-001',
      source: 'AST-001',
      target: 'AST-002',
      label: 'Device connection',
    },
    {
      id: 'CON-002',
      source: 'AST-002',
      target: 'AST-003',
      label: 'Network link',
    },
    {
      id: 'CON-003',
      source: 'AST-003',
      target: 'AST-004',
      label: 'Infrastructure',
    },
    {
      id: 'CON-004',
      source: 'AST-004',
      target: 'AST-005',
      label: 'Authentication',
    },
    {
      id: 'CON-005',
      source: 'AST-004',
      target: 'AST-006',
      label: 'Application service',
    },
    {
      id: 'CON-006',
      source: 'AST-003',
      target: 'AST-007',
      label: 'Network link',
    },
    {
      id: 'CON-007',
      source: 'AST-008',
      target: 'AST-003',
      label: 'Network link',
    },
    {
      id: 'CON-008',
      source: 'AST-002',
      target: 'AST-004',
      label: 'Service dependency',
    },
  ],
}
    