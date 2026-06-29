import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import { visitsApi } from '../api/endpoints'
import Badge from '../components/ui/Badge'
import Table from '../components/ui/Table'
import PageHeader from '../components/ui/PageHeader'

// ── types ──────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Visit = Record<string, any>

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

const STATUS_OPTIONS = ['All', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'MISSED', 'CANCELLED']
const TYPE_OPTIONS   = ['All', 'SITE_BASED', 'HOME_VISIT', 'TELEHEALTH', 'REMOTE_MONITORING']

// ── component ──────────────────────────────────────────────────────────────

export default function Visits() {
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [typeFilter, setTypeFilter]     = useState<string>('All')

  const { data, isLoading } = useQuery({
    queryKey: ['visits'],
    queryFn:  () => visitsApi.list({ limit: 100 }),
  })

  const allVisits: Visit[] = data?.data ?? []

  const filtered: Visit[] = allVisits.filter((v) => {
    const matchesStatus = statusFilter === 'All' || v.status === statusFilter
    const matchesType   = typeFilter   === 'All' || v.visitType === typeFilter
    return matchesStatus && matchesType
  })

  const columns = [
    {
      header: 'Visit Name',
      cell:   (v: Visit) => (
        <span className="font-medium text-slate-800">{v.name ?? v.visitName ?? '—'}</span>
      ),
    },
    {
      header: 'Type',
      width:  '160px',
      cell:   (v: Visit) =>
        v.visitType ? <Badge value={v.visitType} /> : <span className="text-slate-400 text-xs">—</span>,
    },
    {
      header: 'Status',
      width:  '130px',
      cell:   (v: Visit) =>
        v.status ? <Badge value={v.status} /> : <span className="text-slate-400 text-xs">—</span>,
    },
    {
      header: 'Scheduled Date',
      width:  '150px',
      cell:   (v: Visit) =>
        v.scheduledDate ? (
          <span className="text-slate-600 text-sm">{fmt(v.scheduledDate)}</span>
        ) : (
          <span className="text-slate-400 text-xs">—</span>
        ),
    },
    {
      header: 'Participant',
      cell:   (v: Visit) => {
        const p = v.enrollment?.participant
        return p ? (
          <span className="text-slate-700">{p.firstName} {p.lastName}</span>
        ) : (
          <span className="text-slate-400 text-xs">—</span>
        )
      },
    },
    {
      header: 'Site',
      cell:   (v: Visit) => (
        <span className="text-slate-600 text-sm">{v.site?.name ?? '—'}</span>
      ),
    },
    {
      header: 'Duration',
      width:  '100px',
      cell:   (v: Visit) =>
        v.duration != null ? (
          <span className="text-slate-600 text-sm">{v.duration} min</span>
        ) : (
          <span className="text-slate-400 text-xs">—</span>
        ),
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Visits"
        subtitle="Scheduled and completed trial visits"
        action={
          <span className="text-sm text-slate-500">
            {filtered.length} visit{filtered.length !== 1 ? 's' : ''}
          </span>
        }
      />

      <div className="px-8 pb-10 space-y-4">
        {/* ── filters ── */}
        <div className="flex flex-wrap items-center gap-3">
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

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="py-2 pl-3 pr-8 text-sm border border-slate-200 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-700"
          >
            {TYPE_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t === 'All' ? 'All Types' : t.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>

        {/* ── table ── */}
        {isLoading ? (
          <Spinner />
        ) : (
          <Table<Visit>
            columns={columns}
            data={filtered}
            emptyMessage="No visits match your filters."
          />
        )}
      </div>
    </div>
  )
}
