import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import { adverseEventsApi } from '../api/endpoints'
import Badge from '../components/ui/Badge'
import Table from '../components/ui/Table'
import PageHeader from '../components/ui/PageHeader'

// ── types ──────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AdverseEvent = Record<string, any>

// ── helpers ────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full border-2 border-blue-600 border-t-transparent w-8 h-8" />
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

// ── summary card ───────────────────────────────────────────────────────────

interface CountCardProps {
  label: string
  count: number
  accent: string
}

function CountCard({ label, count, accent }: CountCardProps) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 p-4 flex flex-col gap-1 ${accent}`}>
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
      <span className="text-2xl font-bold text-slate-800">{count}</span>
    </div>
  )
}

// ── component ──────────────────────────────────────────────────────────────

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

  // Summary counts (all events, not just filtered)
  const totalCount: number    = allEvents.length
  const mildCount: number     = allEvents.filter((e) => e.severity === 'MILD').length
  const moderateCount: number = allEvents.filter((e) => e.severity === 'MODERATE').length
  const criticalCount: number = allEvents.filter((e) => CRITICAL_SEVERITIES.has(e.severity)).length

  const columns = [
    {
      header: 'Participant',
      cell:   (e: AdverseEvent) => {
        const p = e.participant
        return p ? (
          <span className="font-medium text-slate-800">{p.firstName} {p.lastName}</span>
        ) : (
          <span className="text-slate-400 text-xs">—</span>
        )
      },
    },
    {
      header: 'Severity',
      width:  '150px',
      cell:   (e: AdverseEvent) =>
        e.severity ? <Badge value={e.severity} /> : <span className="text-slate-400 text-xs">—</span>,
    },
    {
      header: 'Status',
      width:  '130px',
      cell:   (e: AdverseEvent) =>
        e.status ? <Badge value={e.status} /> : <span className="text-slate-400 text-xs">—</span>,
    },
    {
      header: 'Event Date',
      width:  '130px',
      cell:   (e: AdverseEvent) =>
        e.eventDate ? (
          <span className="text-slate-600 text-sm">{fmt(e.eventDate)}</span>
        ) : (
          <span className="text-slate-400 text-xs">—</span>
        ),
    },
    {
      header: 'Description',
      cell:   (e: AdverseEvent) => (
        <span className="text-slate-600 text-sm">
          {truncate(e.description ?? '', 60)}
        </span>
      ),
    },
    {
      header: 'Reported to Sponsor',
      width:  '160px',
      cell:   (e: AdverseEvent) =>
        e.reportedToSponsor === true ? (
          <span className="text-green-600 font-bold text-base">✓</span>
        ) : (
          <span className="text-slate-400 text-sm">—</span>
        ),
    },
    {
      header: 'Resolved At',
      width:  '130px',
      cell:   (e: AdverseEvent) =>
        e.resolvedAt ? (
          <span className="text-slate-600 text-sm">{fmt(e.resolvedAt)}</span>
        ) : (
          <span className="text-slate-400 text-xs italic">Ongoing</span>
        ),
    },
  ]

  return (
    <div className="min-h-screen" style={{ background: '#f1f5f9' }}>
      <div className="px-8 pt-8 pb-10 space-y-6">
        <PageHeader
          title="Adverse Events"
          subtitle="Safety incident monitoring and reporting"
          action={
            <span className="text-sm text-slate-500">
              {filtered.length} event{filtered.length !== 1 ? 's' : ''}
            </span>
          }
        />
        {/* ── summary cards ── */}
        <div className="grid grid-cols-4 gap-4">
          <CountCard label="Total Events" count={totalCount}    accent="border-l-4 border-l-slate-400" />
          <CountCard label="Mild"         count={mildCount}     accent="border-l-4 border-l-yellow-400" />
          <CountCard label="Moderate"     count={moderateCount} accent="border-l-4 border-l-orange-400" />
          <CountCard label="Critical"     count={criticalCount} accent="border-l-4 border-l-red-500" />
        </div>

        {/* ── filters ── */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="py-2 pl-3 pr-8 text-sm border border-slate-200 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-700"
          >
            {SEVERITY_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s === 'All' ? 'All Severities' : s.replace(/_/g, ' ')}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 pl-3 pr-8 text-sm border border-slate-200 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-700"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s === 'All' ? 'All Statuses' : s.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>

        {/* ── table ── */}
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
    </div>
  )
}
