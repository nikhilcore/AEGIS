
import { useState } from 'react'

import Sidebar from './Sidebar'
import Topbar from './Topbar'

import CommandCenter from '../../pages/CommandCenter'
import AssetInventory from '../../pages/AssetInventory'
import DigitalTwin from '../../pages/DigitalTwin'
import ThreatIntelligence from '../../pages/ThreatIntelligence'
import IncidentInvestigation from '../../pages/IncidentInvestigation'
import DeviceMonitoring from '../../pages/DeviceMonitoring'
import AIIntelligence from '../../pages/AIIntelligence'
import SimulationLab from '../../pages/SimulationLab'
import Analytics from '../../pages/Analytics'
import Reports from '../../pages/Reports'
import Settings from '../../pages/Settings'

function MainLayout() {
  const [activePage, setActivePage] = useState('Command Center')

  const renderPage = () => {
    switch (activePage) {
      case 'Command Center':
        return <CommandCenter />

      case 'Asset Inventory':
        return <AssetInventory />

      case 'Digital Twin':
        return <DigitalTwin />

      case 'Threat Intelligence':
        return <ThreatIntelligence />

      case 'Incident Investigation':
        return <IncidentInvestigation />

      case 'Device Monitoring':
        return <DeviceMonitoring />

      case 'AI Intelligence':
        return <AIIntelligence />

      case 'Simulation Lab':
        return <SimulationLab />

      case 'Analytics':
        return <Analytics />

      case 'Reports':
        return <Reports />

      case 'Settings':
        return <Settings />

      default:
        return <CommandCenter />
    }
  }

  return (
    <div className="flex min-h-screen bg-white text-[#11152F]">
      {/* Sidebar */}
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
      />

      {/* Main Application Area */}
      <div className="flex min-w-0 flex-1 flex-col bg-[#F5F6FF]">

        {/* Top Navigation */}
        <Topbar />

        {/* Page Content */}
        <main className="min-h-0 flex-1 overflow-y-auto bg-[#F5F6FF]">
          <div className="min-h-full p-4 sm:p-6 lg:p-8">
            {renderPage()}
          </div>
        </main>

      </div>
    </div>
  )
}

export default MainLayout
  