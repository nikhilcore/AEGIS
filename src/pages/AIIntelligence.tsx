
import { useEffect, useState } from 'react'
import { useSimulationStore } from '../store/simulationStore'
import {
  BrainCircuit,
  Sparkles,
  ShieldAlert,
  Network,
  Activity,
  Search,
  Send,
  Lightbulb,
  FileText,
  RefreshCw,
  User,
} from 'lucide-react'

type AnalysisType = 'Incident Analysis' | 'Event Correlation' | 'Risk Assessment'

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

const analysisOptions: AnalysisType[] = [
  'Incident Analysis',
  'Event Correlation',
  'Risk Assessment',
]

const prompts = [
  {
    title: 'Analyse a simulated incident',
    description: 'Review incident indicators and suggest investigation steps.',
    icon: ShieldAlert,
    prompt:
      'Analyse a simulated suspicious authentication incident and suggest investigation steps.',
  },
  {
    title: 'Correlate security events',
    description: 'Identify relationships between simulated events and assets.',
    icon: Network,
    prompt:
      'Correlate the simulated authentication, gateway and network events.',
  },
  {
    title: 'Explain asset risk',
    description: 'Explain why an asset may have a higher risk score.',
    icon: Activity,
    prompt:
      'Explain the risk associated with a critical hospital network asset.',
  },
  {
    title: 'Generate recommendations',
    description: 'Produce a prioritised defensive action plan.',
    icon: Lightbulb,
    prompt:
      'Generate a prioritised defensive recommendation plan for the simulated hospital environment.',
  },
]

function AIIntelligence() {
  const [analysisType, setAnalysisType] = useState<AnalysisType>(
    'Incident Analysis'
  )

  const [prompt, setPrompt] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Shared context from the AEGIS Simulation Lab
  const simulatedEvents = useSimulationStore((state) => state.events)
  const simulations = useSimulationStore((state) => state.simulations)
  const activeSimulation = useSimulationStore((state) => state.activeSimulation)

  const [backendContext, setBackendContext] = useState({
    assets: [] as any[],
    events: [] as any[],
    incidents: [] as any[],
  })
  const [contextLoading, setContextLoading] = useState(true)
  const [contextError, setContextError] = useState('')

  useEffect(() => {
    let cancelled = false

    const loadContext = async () => {
      try {
        const [assetsRes, eventsRes, incidentsRes] = await Promise.all([
          fetch('http://localhost:5000/api/assets'),
          fetch('http://localhost:5000/api/events'),
          fetch('http://localhost:5000/api/incidents'),
        ])

        if (!assetsRes.ok || !eventsRes.ok || !incidentsRes.ok) {
          throw new Error('One or more context endpoints failed.')
        }

        const [assetsData, eventsData, incidentsData] = await Promise.all([
          assetsRes.json(),
          eventsRes.json(),
          incidentsRes.json(),
        ])

        if (!cancelled) {
          setBackendContext({
            assets: assetsData.assets ?? [],
            events: eventsData.events ?? [],
            incidents: incidentsData.incidents ?? [],
          })
          setContextError('')
        }
      } catch (err) {
        console.error('AI context fetch error:', err)
        if (!cancelled) {
          setContextError('Backend context could not be loaded. AI chat remains available with local simulation context.')
        }
      } finally {
        if (!cancelled) setContextLoading(false)
      }
    }

    loadContext()
    const timer = setInterval(loadContext, 15000)
    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [])

  const simulationContext = {
    activeSimulation,
    simulations,
    simulatedEvents,
    assets: backendContext.assets,
    events: backendContext.events,
    incidents: backendContext.incidents,
    contextSource: 'AEGIS synthetic educational simulation and backend data',
  }

  const sendMessage = async (input: string) => {
    if (!input.trim() || loading) return

    const userMessage: ChatMessage = {
      role: 'user',
      content: `[Analysis Mode: ${analysisType}]\n${input.trim()}`,
    }

    const updatedMessages = [...messages, userMessage]

    setMessages(updatedMessages)
    setPrompt('')
    setLoading(true)
    setError('')

    try {
      const response = await fetch('http://localhost:5000/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: updatedMessages,
          context: simulationContext,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to receive AI response.')
      }

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.reply,
      }

      setMessages((previous) => [...previous, assistantMessage])
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Unable to connect to the AEGIS AI backend.'

      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const resetWorkspace = () => {
    setMessages([])
    setPrompt('')
    setError('')
  }

  return (
    <div className="min-h-full space-y-6 bg-[#F5F6FF] p-4 sm:p-6 lg:p-8 text-[#11152F]">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#E5E7F0] bg-[#EEF0FF]">
            <BrainCircuit className="h-6 w-6 text-[#6045F5]" />
          </div>

          <div>
            <h1 className="text-2xl font-semibold text-[#11152F]">
              AI Intelligence
            </h1>

            <p className="mt-1 text-sm text-[#687086]">
              AI-powered security intelligence and analytical assistance
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-[#BDE8D0] bg-[#E8F8F0] px-3 py-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
          <span className="text-sm text-[#16A36A]">
            AI Connected
          </span>
        </div>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <OverviewCard
          title="AI Engine"
          value="OpenAI"
          description="API-powered intelligence"
          icon={BrainCircuit}
          color="text-[#6045F5]"
        />

        <OverviewCard
          title="Analysis Modes"
          value="3"
          description="Incident · Correlation · Risk"
          icon={Search}
          color="text-[#477BFF]"
        />

        <OverviewCard
          title="Messages"
          value={messages.length.toString()}
          description="Current conversation"
          icon={FileText}
          color="text-[#16A36A]"
        />

        <OverviewCard
          title="Environment"
          value="Simulation"
          description="Educational AEGIS environment"
          icon={ShieldAlert}
          color="text-[#B7791F]"
        />
      </div>

      {/* Analysis Mode */}
      <div className="rounded-xl border border-[#E5E7F0] bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-[#11152F]">
          Analysis Mode
        </h2>

        <p className="mt-1 text-sm text-[#687086]">
          Select the analytical focus for your conversation.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          {analysisOptions.map((option) => (
            <button
              key={option}
              onClick={() => setAnalysisType(option)}
              className={`rounded-xl border p-4 text-left transition ${
                analysisType === option
                  ? 'border-[#C7C9F8] bg-[#EEF0FF]'
                  : 'border-[#E5E7F0] bg-[#F5F6FF] hover:border-[#E5E7F0]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`font-medium ${
                    analysisType === option
                      ? 'text-[#6045F5]'
                      : 'text-[#687086]'
                  }`}
                >
                  {option}
                </span>

                {analysisType === option && (
                  <span className="h-2 w-2 rounded-full bg-violet-400" />
                )}
              </div>

              <p className="mt-2 text-xs leading-5 text-[#687086]">
                {option === 'Incident Analysis'
                  ? 'Investigate and understand simulated incidents.'
                  : option === 'Event Correlation'
                    ? 'Explore potential relationships between events.'
                    : 'Examine asset exposure and security risk.'}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Workspace */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

        {/* Chat */}
        <div className="xl:col-span-2">
          <div className="flex min-h-[650px] flex-col rounded-xl border border-[#E5E7F0] bg-white">

            {/* Chat Header */}
            <div className="flex items-center justify-between border-b border-[#E5E7F0] p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[#EEF0FF] p-2">
                  <Sparkles className="h-5 w-5 text-[#6045F5]" />
                </div>

                <div>
                  <h2 className="font-semibold text-[#11152F]">
                    AEGIS AI Assistant
                  </h2>

                  <p className="text-xs text-[#687086]">
                    Powered by OpenAI
                  </p>
                </div>
              </div>

              <button
                onClick={resetWorkspace}
                className="flex items-center gap-2 rounded-lg border border-[#E5E7F0] px-3 py-2 text-sm text-[#687086] transition hover:bg-[#F5F6FF]"
              >
                <RefreshCw size={15} />
                New Chat
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-5 overflow-y-auto p-5">

              {messages.length === 0 && (
                <div className="flex min-h-[350px] flex-col items-center justify-center text-center">
                  <div className="rounded-2xl border border-[#E5E7F0] bg-[#F5F6FF] p-5">
                    <BrainCircuit className="h-10 w-10 text-[#6045F5]" />
                  </div>

                  <h3 className="mt-5 text-lg font-medium text-[#11152F]">
                    Intelligence at your fingertips
                  </h3>

                  <p className="mt-2 max-w-md text-sm leading-6 text-[#687086]">
                    Ask questions about cybersecurity, incident investigation,
                    simulated hospital infrastructure, risk analysis or
                    defensive security strategies.
                  </p>
                </div>
              )}

              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${
                    message.role === 'user'
                      ? 'justify-end'
                      : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EEF0FF]">
                      <BrainCircuit className="h-5 w-5 text-[#6045F5]" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-xl border p-4 ${
                      message.role === 'user'
                        ? 'border-[#C7C9F8] bg-[#EEF0FF]'
                        : 'border-[#E5E7F0] bg-[#F5F6FF]'
                    }`}
                  >
                    <div className="mb-2 flex items-center gap-2">
                      {message.role === 'user' ? (
                        <User className="h-4 w-4 text-[#477BFF]" />
                      ) : (
                        <Sparkles className="h-4 w-4 text-[#6045F5]" />
                      )}

                      <span
                        className={`text-xs font-medium ${
                          message.role === 'user'
                            ? 'text-[#477BFF]'
                            : 'text-[#6045F5]'
                        }`}
                      >
                        {message.role === 'user'
                          ? 'Analyst'
                          : 'AEGIS AI'}
                      </span>
                    </div>

                    <div className="whitespace-pre-wrap break-words text-sm leading-7 text-[#687086]">
                      {message.content}
                    </div>
                  </div>

                  {message.role === 'user' && (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EEF0FF]">
                      <User className="h-5 w-5 text-[#477BFF]" />
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EEF0FF]">
                    <BrainCircuit className="h-5 w-5 text-[#6045F5]" />
                  </div>

                  <div className="flex items-center gap-3 rounded-xl border border-[#E5E7F0] bg-[#F5F6FF] p-4">
                    <RefreshCw className="h-4 w-4 animate-spin text-[#6045F5]" />

                    <span className="text-sm text-[#687086]">
                      AI is thinking...
                    </span>
                  </div>
                </div>
              )}

              {error && (
                <div className="rounded-lg border border-[#FECACA] bg-[#FFF0F0] p-4">
                  <p className="text-sm text-[#EF4444]">
                    {error}
                  </p>

                  <p className="mt-2 text-xs text-[#687086]">
                    Check that the backend is running and your API
                    configuration is correct.
                  </p>
                </div>
              )}

            </div>

            {/* Input */}
            <div className="border-t border-[#E5E7F0] p-5">
              <div className="rounded-xl border border-[#E5E7F0] bg-[#F5F6FF] p-3 focus-within:border-[#6045F5]">

                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      sendMessage(prompt)
                    }
                  }}
                  rows={3}
                  placeholder="Ask AEGIS AI a question... (Enter to send, Shift+Enter for a new line)"
                  className="w-full resize-none bg-transparent text-sm text-[#11152F] outline-none placeholder:text-[#9AA1B5]"
                />

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-[#9AA1B5]">
                    {analysisType}
                  </span>

                  <button
                    onClick={() => sendMessage(prompt)}
                    disabled={!prompt.trim() || loading}
                    className="flex items-center gap-2 rounded-lg bg-[#6045F5] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#5035DB] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Send size={16} />
                    Send
                  </button>
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* Right Panel */}
        <div className="space-y-6">

          {/* Suggested prompts */}
          <div className="rounded-xl border border-[#E5E7F0] bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-[#B7791F]" />

              <h2 className="font-semibold text-[#11152F]">
                Suggested Prompts
              </h2>
            </div>

            <div className="space-y-3">
              {prompts.map((item) => {
                const Icon = item.icon

                return (
                  <button
                    key={item.title}
                    onClick={() => setPrompt(item.prompt)}
                    className="w-full rounded-lg border border-[#E5E7F0] bg-[#F5F6FF] p-3 text-left transition hover:border-[#E5E7F0]"
                  >
                    <div className="flex gap-3">
                      <Icon className="mt-1 h-4 w-4 shrink-0 text-[#6045F5]" />

                      <div>
                        <p className="text-sm font-medium text-[#687086]">
                          {item.title}
                        </p>

                        <p className="mt-1 text-xs leading-5 text-[#687086]">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Capabilities */}
          <div className="rounded-xl border border-[#E5E7F0] bg-[#F5F6FF] p-5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#6045F5]" />

              <h2 className="font-semibold text-[#11152F]">
                AI Capabilities
              </h2>
            </div>

            <div className="mt-4 space-y-3">
              {[
                'Incident analysis',
                'Event correlation reasoning',
                'Risk assessment',
                'Defensive recommendations',
                'Cybersecurity explanations',
                'Conversational follow-up',
              ].map((capability) => (
                <div
                  key={capability}
                  className="flex items-center gap-2 text-sm text-[#687086]"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                  {capability}
                </div>
              ))}
            </div>
          </div>

          {/* Context limitations */}
          <div className="rounded-xl border border-[#E5E7F0] bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-[#B7791F]" />

              <h2 className="font-semibold text-[#11152F]">
                Current AI Context
              </h2>
            </div>

            <p className="mt-3 text-sm leading-6 text-[#687086]">
Simulation Lab data and backend asset, event and incident records are
              included with AI requests when available. All context is synthetic
              and intended for this educational environment.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-[#E5E7F0] bg-[#F5F6FF] p-3">
                <p className="text-xs text-[#687086]">Generated Events</p>
                <p className="mt-1 text-lg font-semibold text-[#11152F]">{simulatedEvents.length}</p>
              </div>
              <div className="rounded-lg border border-[#E5E7F0] bg-[#F5F6FF] p-3">
                <p className="text-xs text-[#687086]">Simulations</p>
                <p className="mt-1 text-lg font-semibold text-[#11152F]">{simulations.length}</p>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-3">
              <div className="rounded-lg border border-[#E5E7F0] bg-[#F5F6FF] p-3">
                <p className="text-xs text-[#687086]">Assets</p>
                <p className="mt-1 text-lg font-semibold text-[#11152F]">{backendContext.assets.length}</p>
              </div>
              <div className="rounded-lg border border-[#E5E7F0] bg-[#F5F6FF] p-3">
                <p className="text-xs text-[#687086]">Backend Events</p>
                <p className="mt-1 text-lg font-semibold text-[#11152F]">{backendContext.events.length}</p>
              </div>
              <div className="rounded-lg border border-[#E5E7F0] bg-[#F5F6FF] p-3">
                <p className="text-xs text-[#687086]">Incidents</p>
                <p className="mt-1 text-lg font-semibold text-[#11152F]">{backendContext.incidents.length}</p>
              </div>
            </div>

            {contextLoading && (
              <p className="mt-3 text-xs text-[#687086]">Syncing backend context...</p>
            )}
            {contextError && (
              <p className="mt-3 text-xs text-[#B7791F]">{contextError}</p>
            )}

            <div className="mt-3 rounded-lg border border-[#E5E7F0] bg-[#F5F6FF] p-3">
              <p className="text-xs text-[#687086]">Active Scenario</p>
              <p className="mt-1 text-sm font-medium text-[#11152F]">
                {activeSimulation?.scenarioName ?? 'No active simulation'}
              </p>
            </div>

            <p className="mt-3 text-xs leading-5 text-[#687086]">
              The backend must accept the context payload to use these details
              in its response. Context contains synthetic simulation data only.
            </p>
          </div>

        </div>
      </div>

      {/* Disclaimer */}
      <div className="rounded-lg border border-[#E5E7F0] bg-white p-4">
        <p className="text-xs leading-6 text-[#687086]">
          AEGIS is an educational cybersecurity simulation. AI responses
          are generated using an external AI API and should not be treated
          as verified security findings, clinical advice or instructions
          for real hospital infrastructure.
        </p>
      </div>

    </div>
  )
}

function OverviewCard({
  title,
  value,
  description,
  icon: Icon,
  color,
}: {
  title: string
  value: string
  description: string
  icon: React.ElementType
  color: string
}) {
  return (
    <div className="rounded-xl border border-[#E5E7F0] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#687086]">{title}</p>
        <Icon className={`h-5 w-5 ${color}`} />
      </div>

      <p className="mt-3 text-xl font-semibold text-[#11152F]">{value}</p>

      <p className="mt-1 text-xs text-[#687086]">{description}</p>
    </div>
  )
}

export default AIIntelligence
