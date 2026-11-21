import { useEffect, useMemo, useState } from 'react'
import { useSimulationStore } from '../store/simulationStore'
import {
  AlertTriangle, Clock, Shield, Activity, Search, ChevronRight,
  FileText, MessageSquare, CheckCircle2, CircleDot,
} from 'lucide-react'

type IncidentSeverity = 'Critical' | 'High' | 'Medium' | 'Low'
type IncidentStatus = 'Open' | 'Investigating' | 'Contained' | 'Resolved'

interface Incident {
  id: string
  apiId?: string
  title: string
  severity: IncidentSeverity
  status: IncidentStatus
  affectedAssets: string[]
  category: string
  description: string
  assignedTo: string
  createdAt: string
  events: string[]
  notes: string[]
}

const API = 'http://localhost:5000/api/incidents'

const initialIncidents: Incident[] = [
  { id:'INC-001', title:'Suspicious Authentication Behaviour', severity:'Critical', status:'Investigating', affectedAssets:['AST-005','AST-004'], category:'Authentication', description:'Multiple simulated authentication anomalies detected around the hospital authentication server.', assignedTo:'Security Team Alpha', createdAt:'09:42 AM', events:['EVT-1001','EVT-1007'], notes:['Initial review indicates an unusual authentication pattern.'] },
  { id:'INC-002', title:'Network Traffic Anomaly', severity:'High', status:'Open', affectedAssets:['AST-003','AST-002'], category:'Network Security', description:'A simulated network traffic pattern exceeded the configured monitoring threshold.', assignedTo:'Security Team Beta', createdAt:'10:15 AM', events:['EVT-1002','EVT-1006'], notes:[] },
  { id:'INC-003', title:'Medical Device Configuration Alert', severity:'High', status:'Open', affectedAssets:['AST-001'], category:'Device Security', description:'A simulated configuration change was flagged on an ICU patient monitoring asset.', assignedTo:'Device Security Team', createdAt:'10:32 AM', events:['EVT-1003'], notes:[] },
  { id:'INC-004', title:'Application Access Spike', severity:'Medium', status:'Contained', affectedAssets:['AST-006'], category:'Application Security', description:'An application access spike was detected in the simulated pharmacy system.', assignedTo:'Security Team Alpha', createdAt:'11:05 AM', events:['EVT-1004'], notes:['Monitoring activity after simulated containment.'] },
  { id:'INC-005', title:'Laboratory Service Availability', severity:'Medium', status:'Resolved', affectedAssets:['AST-007'], category:'Availability', description:'A simulated availability alert affecting the laboratory information server.', assignedTo:'Security Team Beta', createdAt:'11:28 AM', events:['EVT-1005'], notes:['Simulated availability restored.'] },
]

const severityStyles: Record<IncidentSeverity,string> = {
  Critical:'bg-red-50 text-red-600 border-red-200',
  High:'bg-orange-50 text-orange-600 border-orange-200',
  Medium:'bg-amber-50 text-amber-700 border-yellow-500/30',
  Low:'bg-[#F0F2FF] text-[#6045F5] border-[#6045F5]/30',
}
const statusStyles: Record<IncidentStatus,string> = {
  Open:'bg-[#F0F2FF] text-[#6045F5]',
  Investigating:'bg-[#F0F2FF] text-[#6045F5]',
  Contained:'bg-orange-50 text-orange-600',
  Resolved:'bg-green-50 text-green-600',
}

function normalise(raw:any):Incident {
  const external = raw.external_id ?? raw.externalId ?? raw.incident_id
  return {
    id: String(external ?? raw.id),
    apiId: raw.id != null ? String(raw.id) : undefined,
    title: raw.title ?? raw.name ?? 'Untitled incident',
    severity: raw.severity ?? 'Medium',
    status: raw.status ?? 'Open',
    affectedAssets: Array.isArray(raw.affected_assets) ? raw.affected_assets : Array.isArray(raw.affectedAssets) ? raw.affectedAssets : raw.asset_id ? [String(raw.asset_id)] : [],
    category: raw.category ?? 'Security',
    description: raw.description ?? '',
    assignedTo: raw.assigned_to ?? raw.assignedTo ?? 'Unassigned',
    createdAt: raw.created_at ? new Date(raw.created_at).toLocaleString() : raw.createdAt ?? 'Unknown',
    events: Array.isArray(raw.events) ? raw.events.map((e:any)=> typeof e==='string' ? e : e.external_id ?? e.id) : [],
    notes: Array.isArray(raw.notes) ? raw.notes.map((n:any)=>typeof n==='string'?n:n.note ?? n.content ?? '') : [],
  }
}

function IncidentInvestigation() {
  const [incidents,setIncidents] = useState<Incident[]>(initialIncidents)
  const [selectedIncidentId,setSelectedIncidentId] = useState('INC-001')
  const [search,setSearch] = useState('')
  const [severityFilter,setSeverityFilter] = useState('All')
  const [statusFilter,setStatusFilter] = useState('All')
  const [newNote,setNewNote] = useState('')
  const [loading,setLoading] = useState(true)
  const [apiError,setApiError] = useState('')
  const simulatedEvents = useSimulationStore((state)=>state.events)

  useEffect(()=>{
    let cancelled=false
    async function load(){
      try{
        const response=await fetch(API)
        if(!response.ok) throw new Error(`Request failed (${response.status})`)
        const payload=await response.json()
        const rawList=Array.isArray(payload)?payload:payload.incidents ?? payload.data ?? []
        const mapped:Incident[]=rawList.map(normalise)
        // Fetch notes and correlated events for each database incident.
        const enriched=await Promise.all(mapped.map(async incident=>{
          if(!incident.apiId) return incident
          try{
            const [notesRes,eventsRes]=await Promise.all([
              fetch(`${API}/${incident.apiId}/notes`),
              fetch(`${API}/${incident.apiId}/events`)
            ])
            const notesPayload=notesRes.ok?await notesRes.json():[]
            const eventsPayload=eventsRes.ok?await eventsRes.json():[]
            const notesList=Array.isArray(notesPayload)?notesPayload:notesPayload.notes ?? []
            const eventList=Array.isArray(eventsPayload)?eventsPayload:eventsPayload.events ?? []
            return {...incident,
              notes:notesList.map((n:any)=>typeof n==='string'?n:n.note ?? n.content ?? ''),
              events:eventList.map((e:any)=>typeof e==='string'?e:e.external_id ?? e.event_id ?? e.id)
            }
          }catch{return incident}
        }))
        if(!cancelled){
          setIncidents(enriched)
          setSelectedIncidentId(enriched[0]?.id ?? '')
          setApiError('')
        }
      }catch{
        if(!cancelled){setIncidents(initialIncidents);setApiError('Backend unavailable. Showing sample incidents instead.')}
      }finally{if(!cancelled)setLoading(false)}
    }
    load()
    return ()=>{cancelled=true}
  },[])

  // Add simulation-generated records to the view only; these are not fabricated database incidents.
  const simRecords:Incident[]=simulatedEvents.map(event=>({
    id:`INC-SIM-${event.id}`, title:event.title, severity:event.severity,
    status:event.status==='Resolved'?'Resolved':event.status==='Investigating'?'Investigating':'Open',
    affectedAssets:[event.assetId],category:'Simulation-generated',description:event.description,
    assignedTo:'Simulation Analyst',createdAt:new Date(event.timestamp).toLocaleString(),
    events:[event.id],notes:[],
  }))
  const combined=[...simRecords,...incidents]
  const selectedIncident=combined.find(i=>i.id===selectedIncidentId)

  const filteredIncidents=useMemo(()=>combined.filter(incident=>{
    const matchesSearch=incident.title.toLowerCase().includes(search.toLowerCase())||incident.id.toLowerCase().includes(search.toLowerCase())||incident.category.toLowerCase().includes(search.toLowerCase())
    return matchesSearch&&(severityFilter==='All'||incident.severity===severityFilter)&&(statusFilter==='All'||incident.status===statusFilter)
  }),[incidents,simRecords,search,severityFilter,statusFilter])

  const updateStatus=async(status:IncidentStatus)=>{
    if(!selectedIncident)return
    const incident=selectedIncident
    const simulationOnly=incident.id.startsWith('INC-SIM-')
    if(!simulationOnly&&incident.apiId){
      try{
        const response=await fetch(`${API}/${incident.apiId}/status`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({status})})
        if(!response.ok)throw new Error()
      }catch{setApiError('Could not save incident status.');return}
    }
    setIncidents(prev=>prev.map(item=>item.id===incident.id?{...item,status}:item))
    if(simulationOnly){
      const eventStatus=status==='Open'?'New':status==='Resolved'?'Resolved':'Investigating'
      incident.events.forEach(eventId=>useSimulationStore.getState().updateEventStatus(eventId,eventStatus as any))
    }
    setApiError('')
  }

  const addNote=async()=>{
    if(!newNote.trim()||!selectedIncident)return
    const note=newNote.trim()
    if(!selectedIncident.id.startsWith('INC-SIM-')&&selectedIncident.apiId){
      try{
        const response=await fetch(`${API}/${selectedIncident.apiId}/notes`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({note})})
        if(!response.ok)throw new Error()
      }catch{setApiError('Could not save the note to the backend.');return}
    }
    setIncidents(prev=>prev.map(item=>item.id===selectedIncident.id?{...item,notes:[...item.notes,note]}:item))
    setNewNote('')
    setApiError('')
  }

  const totalIncidents=combined.length
  const criticalIncidents=combined.filter(i=>i.severity==='Critical').length
  const investigatingIncidents=combined.filter(i=>i.status==='Investigating').length
  const resolvedIncidents=combined.filter(i=>i.status==='Resolved').length

  return (
    <div className="space-y-6 p-6 text-[#11152F]">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div><div className="flex items-center gap-2 text-sm text-[#687086]"><Shield size={16}/>AEGIS / Incident Management</div>
          <h1 className="mt-2 text-2xl font-bold text-[#11152F]">Incident Investigation</h1>
          <p className="mt-1 text-sm text-[#687086]">Investigate, track and manage simulated security incidents.</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-[#D9D2FF] bg-[#F0F2FF] px-3 py-2 text-xs text-[#6045F5]"><Activity size={14}/>SIMULATION ENVIRONMENT</div>
      </div>
      {apiError&&<div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">{apiError}</div>}
      {loading&&<div className="text-sm text-[#8991A5]">Loading incidents...</div>}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Incidents" value={totalIncidents} icon={<FileText size={18}/>} color="blue"/>
        <StatCard title="Critical Incidents" value={criticalIncidents} icon={<AlertTriangle size={18}/>} color="red"/>
        <StatCard title="Investigating" value={investigatingIncidents} icon={<Activity size={18}/>} color="purple"/>
        <StatCard title="Resolved" value={resolvedIncidents} icon={<CheckCircle2 size={18}/>} color="green"/>
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <div className="rounded-xl border border-[#E5E7F0] bg-white">
          <div className="border-b border-[#E5E7F0] p-4"><h2 className="font-semibold text-[#11152F]">Incident Queue</h2><p className="mt-1 text-xs text-[#687086]">Select an incident to investigate</p>
            <div className="relative mt-4"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8991A5]"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search incidents..." className="w-full rounded-lg border border-[#E5E7F0] bg-[#F5F6FF] py-2 pl-9 pr-3 text-sm outline-none focus:border-[#6045F5]"/></div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <select value={severityFilter} onChange={e=>setSeverityFilter(e.target.value)} className="rounded-lg border border-[#E5E7F0] bg-[#F5F6FF] p-2 text-sm outline-none"><option value="All">All Severity</option>{['Critical','High','Medium','Low'].map(s=><option key={s}>{s}</option>)}</select>
              <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="rounded-lg border border-[#E5E7F0] bg-[#F5F6FF] p-2 text-sm outline-none"><option value="All">All Status</option>{['Open','Investigating','Contained','Resolved'].map(s=><option key={s}>{s}</option>)}</select>
            </div>
          </div>
          <div className="space-y-2 p-3">{filteredIncidents.map(incident=><button key={incident.id} onClick={()=>{setSelectedIncidentId(incident.id);setNewNote('')}} className={`w-full rounded-xl border p-3 text-left transition ${selectedIncidentId===incident.id?'border-[#6045F5] bg-[#F0F2FF]':'border-[#E5E7F0] bg-[#F5F6FF] hover:border-[#E5E7F0]'}`}>
            <div className="flex items-start justify-between gap-2"><div><p className="text-xs text-[#8991A5]">{incident.id}</p><h3 className="mt-1 text-sm font-medium text-[#11152F]">{incident.title}</h3></div><ChevronRight size={16} className="mt-1 text-[#8991A5]"/></div>
            <div className="mt-3 flex flex-wrap gap-2"><span className={`rounded-md border px-2 py-1 text-xs ${severityStyles[incident.severity]}`}>{incident.severity}</span><span className={`rounded-md px-2 py-1 text-xs ${statusStyles[incident.status]}`}>{incident.status}</span></div>
            <div className="mt-3 flex items-center justify-between text-xs text-[#8991A5]"><span>{incident.category}</span><span>{incident.createdAt}</span></div>
          </button>)}
            {filteredIncidents.length===0&&<div className="p-6 text-center text-sm text-[#8991A5]">No incidents match the selected filters.</div>}
          </div>
        </div>
        <div className="min-w-0 space-y-5">{selectedIncident?<>
          <div className="rounded-xl border border-[#E5E7F0] bg-white p-5"><div className="flex flex-col justify-between gap-4 md:flex-row"><div><p className="text-sm text-[#8991A5]">{selectedIncident.id}</p><h2 className="mt-1 text-xl font-semibold text-[#11152F]">{selectedIncident.title}</h2></div><span className={`h-fit w-fit rounded-md border px-3 py-1.5 text-sm ${severityStyles[selectedIncident.severity]}`}>{selectedIncident.severity} Severity</span></div>
            <p className="mt-4 text-sm leading-6 text-[#687086]">{selectedIncident.description}</p><div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2"><DetailItem label="Category" value={selectedIncident.category}/><DetailItem label="Assigned Team" value={selectedIncident.assignedTo}/><DetailItem label="Created" value={selectedIncident.createdAt}/><DetailItem label="Affected Assets" value={selectedIncident.affectedAssets.join(', ')||'Not specified'}/></div>
          </div>
          <div className="rounded-xl border border-[#E5E7F0] bg-white p-5"><h3 className="font-semibold text-[#11152F]">Incident Lifecycle</h3><p className="mt-1 text-xs text-[#687086]">Update the simulated incident state</p><div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">{(['Open','Investigating','Contained','Resolved'] as IncidentStatus[]).map(status=><button key={status} onClick={()=>updateStatus(status)} className={`rounded-lg border p-3 text-sm transition ${selectedIncident.status===status?'border-[#6045F5] bg-[#F0F2FF] text-[#6045F5]':'border-[#E5E7F0] bg-[#F5F6FF] text-[#687086] hover:border-[#E5E7F0]'}`}>{status}</button>)}</div></div>
          <div className="rounded-xl border border-[#E5E7F0] bg-white p-5"><div className="flex items-center gap-2"><AlertTriangle size={18} className="text-orange-600"/><h3 className="font-semibold text-[#11152F]">Correlated Events</h3></div><div className="mt-4 space-y-3">{selectedIncident.events.length?selectedIncident.events.map((eventId,index)=><div key={eventId} className="flex items-center justify-between rounded-lg border border-[#E5E7F0] bg-[#F5F6FF] p-3"><div className="flex items-center gap-3"><div className="rounded-lg bg-orange-50 p-2 text-orange-600"><CircleDot size={16}/></div><div><p className="text-sm font-medium text-[#11152F]">{eventId}</p><p className="text-xs text-[#8991A5]">Simulated security event {index+1}</p></div></div><span className="text-xs text-[#8991A5]">Correlated</span></div>):<p className="text-sm text-[#8991A5]">No correlated events.</p>}</div></div>
          <div className="rounded-xl border border-[#E5E7F0] bg-white p-5"><div className="flex items-center gap-2"><MessageSquare size={18} className="text-[#6045F5]"/><h3 className="font-semibold text-[#11152F]">Investigation Notes</h3></div><div className="mt-4 space-y-3">{selectedIncident.notes.length?selectedIncident.notes.map((note,index)=><div key={index} className="rounded-lg border border-[#E5E7F0] bg-[#F5F6FF] p-3"><p className="text-sm text-[#343B55]">{note}</p><p className="mt-2 text-xs text-[#8991A5]">Analyst Note • Simulated</p></div>):<p className="rounded-lg border border-dashed border-[#D5D9E8] p-4 text-sm text-[#8991A5]">No investigation notes have been added.</p>}</div><div className="mt-4 space-y-3"><textarea value={newNote} onChange={e=>setNewNote(e.target.value)} placeholder="Add an investigation note..." rows={3} className="w-full resize-none rounded-lg border border-[#E5E7F0] bg-[#F5F6FF] p-3 text-sm text-[#11152F] outline-none focus:border-[#6045F5]"/><button onClick={addNote} disabled={!newNote.trim()} className="rounded-lg bg-[#6045F5] px-4 py-2 text-sm font-medium text-[#11152F] transition hover:bg-[#5035E8] disabled:cursor-not-allowed disabled:opacity-40">Add Investigation Note</button></div></div>
          <div className="rounded-xl border border-[#E5E7F0] bg-white p-5"><div className="flex items-center gap-2"><Clock size={18} className="text-[#6045F5]"/><h3 className="font-semibold text-[#11152F]">Incident Timeline</h3></div><div className="mt-5 space-y-4"><TimelineItem title="Incident created" description="Incident added to the AEGIS incident queue." time={selectedIncident.createdAt}/><TimelineItem title="Events correlated" description={`${selectedIncident.events.length} simulated events associated with this incident.`} time="System"/><TimelineItem title="Status updated" description={`Current incident status: ${selectedIncident.status}`} time="Current"/>{selectedIncident.notes.map((note,index)=><TimelineItem key={index} title="Analyst note added" description={note} time="Analyst"/>)}</div></div>
        </>:<div className="flex min-h-[400px] items-center justify-center rounded-xl border border-[#E5E7F0] bg-white text-[#8991A5]">Select an incident to begin investigation.</div>}</div>
      </div>
      <div className="rounded-lg border border-[#E5E7F0] bg-white p-3 text-xs leading-5 text-[#8991A5]">AEGIS Simulation: Incident statuses, correlated events, notes and response workflows are illustrative and do not represent real hospital incidents or operational security actions.</div>
    </div>
  )
}

function StatCard({title,value,icon,color}:{title:string;value:number;icon:React.ReactNode;color:string}) {
  const colorMap:Record<string,string>={blue:'text-[#6045F5] bg-[#F0F2FF]',red:'text-red-600 bg-red-50',purple:'text-[#6045F5] bg-[#F0F2FF]',green:'text-green-600 bg-green-500/10'}
  return <div className="rounded-xl border border-[#E5E7F0] bg-white p-5"><div className="flex items-center justify-between"><div><p className="text-sm text-[#687086]">{title}</p><p className="mt-2 text-2xl font-bold text-[#11152F]">{value}</p></div><div className={`rounded-lg p-3 ${colorMap[color]}`}>{icon}</div></div></div>
}
function DetailItem({label,value}:{label:string;value:string}){return <div><p className="text-xs text-[#8991A5]">{label}</p><p className="mt-1 text-sm text-[#11152F]">{value}</p></div>}
function TimelineItem({title,description,time}:{title:string;description:string;time:string}){return <div className="flex gap-3"><div className="mt-1"><div className="h-2.5 w-2.5 rounded-full bg-blue-500"/></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-medium text-[#11152F]">{title}</p><span className="text-xs text-[#8991A5]">{time}</span></div><p className="mt-1 text-sm leading-5 text-[#687086]">{description}</p></div></div>}
export default IncidentInvestigation
