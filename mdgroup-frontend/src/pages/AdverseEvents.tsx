import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AlertTriangle } from 'lucide-react'

import { adverseEventsApi } from '../api/endpoints'
import Badge from '../components/ui/Badge'
import Table from '../components/ui/Table'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AdverseEvent = Record<string, any>

function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="animate-spin rounded-full border-2 border-blue-600 border-t-transparent w-6 h-6" />
    </div>
  )
}

const fmt = (d: string) =>
  new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

function truncate(str: string, max: number): string {
  return str && str.length > max ? str.slice(0, max) + '…' : str ?? ''
}

const SEVERITY_OPTIONS = ['All', 'MILD', 'MODERATE', 'SEVERE', 'LIFE_THREATENING', 'FATAL']
const STATUS_OPTIONS   = ['All', 'REPORTED', 'UNDER_REVIEW', 'RESOLVED', 'ONGOING']
const CRITICAL_SEVERITIES = new Set(['SEVERE', 'LIFE_THREATENING', 'FATAL'])

interface CountCardProps {
  label: string
  count: number
  accent: string
}

function CountCard({ label, count, accent }: CountCardProps) {
  return (
    <div
      className={`bg-white rounded-xl p-4 flex flex-col gap-1 ${accent}`}
      style={{ border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}
    >
      <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{label}</span>
      <span className="text-[22px] font-bold text-gray-800">{count}</span>
    </div>
  )
}

export default function AdverseEvents() {
  const [severityFilter, setSeverityFilter] = useState<string>('All')
  const [statusFilter, setStatusFilter]     = useState<string>('All')

  const { data, isLoading } = useQuery({
    queryKey: ['adverseEvents'],
    queryFn:  () => adverseEventsApi.list({ limit: 100 }),
  })

  const allEvents: AdverseEvent[] = data?.data ?? []

  const filtered: AdverseEvent[] = allEvents.filter((e) => {
    const matchesSeverity = severityFilter === 'All' || e.severity === severityFilter
    const matchesStatus   = statusFilter   === 'All' || e.status   === statusFilter
    return matchesSeverity && matchesStatus
  })

  const totalCount    = allEvents.length
  const mildCount     = allEvents.filter((e) => e.severity === 'MILD').length
  const moderateCount = allEvents.filter((e) => e.severity === 'MODERATE').length
  const criticalCount = allEvents.filter((e) => CRITICAL_SEVERITIES.has(e.severity)).length

  const columns = [
    {
      header: 'Participant',
      cell:   (e: AdverseEvent) => {
        const p = e.participant
        return p ? (
          <span className="font-medium text-gray-800">{p.firstName} {p.lastName}</span>
        ) : (
          <span className="text-gray-400 text-xs">—</span>
        )
      },
    },
    {
      header: 'Severity',
      width:  '150px',
      cell:   (e: AdverseEvent) =>
        e.severity ? <Badge value={e.severity} /> : <span className="text-gray-400 text-xs">—</span>,
    },
    {
      header: 'Status',
      width:  '130px',
      cell:   (e: AdverseEvent) =>
        e.status ? <Badge value={e.status} /> : <span className="text-gray-400 text-xs">—</span>,
    },
    {
      header: 'Event Date',
      width:  '130px',
      cell:   (e: AdverseEvent) =>
        e.eventDate ? (
          <span className="text-gray-600">{fmt(e.eventDate)}</span>
        ) : (
          <span className="text-gray-400 text-xs">—</span>
        ),
    },
    {
      header: 'Description',
      cell:   (e: AdverseEvent) => (
        <span className="text-gray-600">{truncate(e.description ?? '', 60)}</span>
      ),
    },
    {
      header: 'Reported to Sponsor',
      width:  '160px',
      cell:   (e: AdverseEvent) =>
        e.reportedToSponsor === true ? (
          <span className="text-green-600 font-bold">✓</span>
        ) : (
          <span className="text-gray-400 text-sm">—</span>
        ),
    },
    {
      header: 'Resolved At',
      width:  '130px',
      cell:   (e: AdverseEvent) =>
        e.resolvedAt ? (
          <span className="text-gray-600">{fmt(e.resolvedAt)}</span>
        ) : (
          <span className="text-gray-400 text-xs italic">Ongoing</span>
        ),
    },
  ]

  return (
    <div className="p-6 space-y-5" style={{ background: 'var(--color-background)' }}>

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[18px] font-bold text-gray-900">Adverse Events</h2>
          <p className="text-[13px] text-gray-500 mt-0.5">Safety incident monitoring and reporting</p>
        </div>
        <div className="flex items-center gap-2 text-[13px] font-medium text-gray-500 px-3 py-1.5 rounded-lg bg-white" style={{ border: '1px solid var(--color-border)' }}>
          <AlertTriangle size={13} className="text-gray-400" />
          {filtered.length} {filtered.length === 1 ? 'event' : 'events'}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <CountCard label="Total Events" count={totalCount}    accent="border-l-4 border-l-gray-400" />
        <CountCard label="Mild"         count={mildCount}     accent="border-l-4 border-l-yellow-400" />
        <CountCard label="Moderate"     count={moderateCount} accent="border-l-4 border-l-orange-400" />
        <CountCard label="Critical"     count={criticalCount} accent="border-l-4 border-l-red-500" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="py-2.5 pl-3 pr-8 text-[13px] border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
        >
          {SEVERITY_OPTIONS.map((s) => (
            <option key={s} value={s}>{s === 'All' ? 'All Severities' : s.replace(/_/g, ' ')}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="py-2.5 pl-3 pr-8 text-[13px] border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {isLoading ? (
        <Spinner />
      ) : (
        <Table<AdverseEvent>
          columns={columns}
          data={filtered}
          emptyMessage="No adverse events match your filters."
        />
      )}
    </div>
  )
}
