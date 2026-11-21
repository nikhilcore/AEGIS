import { create } from 'zustand'

export type SimulatedEvent = {
  id: string
  title: string
  description: string
  severity: 'Low' | 'Medium' | 'High' | 'Critical'
  assetId: string
  scenarioId: string
  scenarioName: string
  status: 'New' | 'Investigating' | 'Resolved'
  timestamp: string
  source: 'Simulation'
}

export type SimulationRecord = {
  id: string
  scenarioId: string
  scenarioName: string
  targetAsset: string
  severity: 'Low' | 'Medium' | 'High' | 'Critical'
  status: 'Running' | 'Stopped'
  startedAt: string
  stoppedAt?: string
}

type SimulationStore = {
  events: SimulatedEvent[]
  simulations: SimulationRecord[]
  activeSimulation: SimulationRecord | null
  completedCount: number

  startSimulation: (simulation: SimulationRecord, event: SimulatedEvent) => void
  stopSimulation: () => void
  updateEventStatus: (
    eventId: string,
    status: SimulatedEvent['status']
  ) => void
  clearSimulationEvents: () => void
}

export const useSimulationStore = create<SimulationStore>((set, get) => ({
  events: [],
  simulations: [],
  activeSimulation: null,
  completedCount: 0,

  startSimulation: (simulation, event) => {
    if (get().activeSimulation) return

    set((state) => ({
      activeSimulation: simulation,
      simulations: [simulation, ...state.simulations],
      events: [event, ...state.events],
    }))
  },

  stopSimulation: () => {
    const active = get().activeSimulation

    if (!active) return

    const stoppedSimulation: SimulationRecord = {
      ...active,
      status: 'Stopped',
      stoppedAt: new Date().toISOString(),
    }

    set((state) => ({
      activeSimulation: null,
      completedCount: state.completedCount + 1,
      simulations: state.simulations.map((simulation) =>
        simulation.id === active.id
          ? stoppedSimulation
          : simulation
      ),
    }))
  },

  updateEventStatus: (eventId, status) => {
    set((state) => ({
      events: state.events.map((event) =>
        event.id === eventId
          ? { ...event, status }
          : event
      ),
    }))
  },

  clearSimulationEvents: () => {
    set({ events: [] })
  },
}))