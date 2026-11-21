import { useEffect, useState } from 'react'
import {
  Settings as SettingsIcon,
  Shield,
  Database,
  BrainCircuit,
  Activity,
  Info,
} from 'lucide-react'

const SETTINGS_STORAGE_KEY = 'aegis-settings'

type Preferences = {
  notifications: boolean
  simulationAlerts: boolean
  aiContext: boolean
}

const DEFAULT_PREFERENCES: Preferences = {
  notifications: true,
  simulationAlerts: true,
  aiContext: true,
}

function loadPreferences(): Preferences {
  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (!stored) return DEFAULT_PREFERENCES

    const parsed = JSON.parse(stored) as Partial<Preferences>
    return {
      notifications: parsed.notifications ?? DEFAULT_PREFERENCES.notifications,
      simulationAlerts:
        parsed.simulationAlerts ?? DEFAULT_PREFERENCES.simulationAlerts,
      aiContext: parsed.aiContext ?? DEFAULT_PREFERENCES.aiContext,
    }
  } catch {
    return DEFAULT_PREFERENCES
  }
}

function Settings() {
  const [preferences, setPreferences] = useState<Preferences>(loadPreferences)

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(preferences))
    } catch {
      // Preferences still work for the current session if storage is unavailable.
    }
  }, [preferences])

  const updatePreference = (key: keyof Preferences, value: boolean) => {
    setPreferences((current) => ({ ...current, [key]: value }))
  }

  return (
    <div className="space-y-6 p-6 text-[#11152F]">
      <div>
        <h1 className="text-2xl font-semibold text-[#11152F]">Settings</h1>
        <p className="mt-1 text-sm text-[#687086]">
          AEGIS platform configuration and system information
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <InfoCard
          title="Platform"
          value="AEGIS"
          description="Adaptive Emergency & Governance Intelligence System"
          icon={SettingsIcon}
        />
        <InfoCard
          title="Environment"
          value="Simulation"
          description="Educational synthetic-data environment"
          icon={Shield}
        />
        <InfoCard
          title="Version"
          value="0.1.0"
          description="Development build"
          icon={Activity}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Section title="Notification Preferences" icon={Activity}>
          <ToggleRow
            label="System Notifications"
            description="Enable dashboard notification preferences"
            enabled={preferences.notifications}
            onChange={(value) => updatePreference('notifications', value)}
          />
          <ToggleRow
            label="Simulation Alerts"
            description="Enable alerts for simulation activity"
            enabled={preferences.simulationAlerts}
            onChange={(value) => updatePreference('simulationAlerts', value)}
          />
        </Section>

        <Section title="AI Intelligence" icon={BrainCircuit}>
          <ToggleRow
            label="Simulation Context"
            description="Include simulation data in AI requests"
            enabled={preferences.aiContext}
            onChange={(value) => updatePreference('aiContext', value)}
          />
          <div className="mt-4 rounded-xl border border-[#E5E7F0] bg-[#F5F6FF] p-4">
            <p className="text-sm leading-6 text-[#687086]">
              AI Intelligence uses the configured backend and AI provider.
              Context inclusion is stored as a local prototype preference and
              must be applied by the AI request logic to affect requests.
            </p>
          </div>
        </Section>

        <Section title="Data & Environment" icon={Database}>
          <InfoRow label="Data Source" value="Synthetic Data" />
          <InfoRow label="Storage" value="Backend database + local prototype state" />
          <InfoRow label="Preferences" value="Saved in browser localStorage" />
          <InfoRow label="Real Patient Data" value="Not used" />
        </Section>

        <Section title="Security & Scope" icon={Shield}>
          <InfoRow label="System Type" value="Educational Prototype" />
          <InfoRow label="Device Control" value="Not connected" />
          <InfoRow label="Clinical Decisions" value="Not supported" />
          <InfoRow label="Live Hospital Systems" value="Not connected" />
        </Section>
      </div>

      <div className="rounded-2xl border border-[#E5E7F0] bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-[#F5F6FF] p-2">
            <Info className="text-[#6045F5]" size={20} />
          </div>
          <h2 className="font-semibold text-[#11152F]">System Information</h2>
        </div>
        <div className="mt-5 space-y-3">
          <InfoRow label="Application" value="AEGIS" />
          <InfoRow
            label="Full Name"
            value="Adaptive Emergency & Governance Intelligence System"
          />
          <InfoRow label="Frontend" value="React + TypeScript + Vite" />
          <InfoRow label="Visualisation" value="Recharts + React Flow" />
          <InfoRow label="State Management" value="Zustand" />
          <InfoRow label="AI Integration" value="Gemini API via Express Backend" />
        </div>
      </div>

      <div className="rounded-xl border border-[#F3D6A0] bg-[#FFF9ED] p-4">
        <p className="text-xs leading-6 text-[#8A611C]">
          AEGIS is an educational cybersecurity resilience and digital-twin
          simulation. It does not connect to real hospital infrastructure,
          control medical devices, process real patient data or make clinical
          decisions. Preference controls on this page are prototype-level
          frontend controls and are stored locally in this browser only.
        </p>
      </div>
    </div>
  )
}

function InfoCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string
  value: string
  description: string
  icon: React.ElementType
}) {
  return (
    <div className="rounded-2xl border border-[#E5E7F0] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#687086]">{title}</p>
        <div className="rounded-lg bg-[#F5F6FF] p-2">
          <Icon className="h-5 w-5 text-[#6045F5]" />
        </div>
      </div>
      <h2 className="mt-3 text-lg font-semibold text-[#11152F]">{value}</h2>
      <p className="mt-2 text-xs leading-5 text-[#687086]">{description}</p>
    </div>
  )
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: React.ElementType
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-[#E5E7F0] bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-lg bg-[#F5F6FF] p-2">
          <Icon size={20} className="text-[#6045F5]" />
        </div>
        <h2 className="font-semibold text-[#11152F]">{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

function ToggleRow({
  label,
  description,
  enabled,
  onChange,
}: {
  label: string
  description: string
  enabled: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl p-2 transition hover:bg-[#F5F6FF]">
      <div>
        <p className="text-sm font-medium text-[#11152F]">{label}</p>
        <p className="mt-1 text-xs leading-5 text-[#687086]">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!enabled)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          enabled ? 'bg-[#6045F5]' : 'bg-[#C7CBD8]'
        }`}
        aria-pressed={enabled}
        aria-label={label}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${
            enabled ? 'left-6' : 'left-1'
          }`}
        />
      </button>
    </div>
  )
}

function InfoRow({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-[#E5E7F0] pb-3 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <span className="text-sm text-[#687086]">{label}</span>
      <span className="text-sm font-medium text-[#11152F] sm:text-right">{value}</span>
    </div>
  )
}

export default Settings
