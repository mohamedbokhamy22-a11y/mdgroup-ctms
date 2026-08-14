import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CalendarCheck } from 'lucide-react'

import { visitsApi } from '../api/endpoints'
import Badge from '../components/ui/Badge'
import Table from '../components/ui/Table'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Visit = Record<string, any>

function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="animate-spin rounded-full border-2 border-blue-600 border-t-transparent w-6 h-6" />
    </div>
  )
}

const fmt = (d: string) =>
  new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

const STATUS_OPTIONS = ['All', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'MISSED', 'CANCELLED']
const TYPE_OPTIONS   = ['All', 'SITE_BASED', 'HOME_VISIT', 'TELEHEALTH', 'REMOTE_MONITORING']

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
        <span className="font-medium text-gray-800">{v.name ?? v.visitName ?? '—'}</span>
      ),
    },
    {
      header: 'Type',
      width:  '160px',
      cell:   (v: Visit) =>
        v.visitType ? <Badge value={v.visitType} /> : <span className="text-gray-400 text-xs">—</span>,
    },
    {
      header: 'Status',
      width:  '130px',
      cell:   (v: Visit) =>
        v.status ? <Badge value={v.status} /> : <span className="text-gray-400 text-xs">—</span>,
    },
    {
      header: 'Scheduled Date',
      width:  '150px',
      cell:   (v: Visit) =>
        v.scheduledDate ? (
          <span className="text-gray-600">{fmt(v.scheduledDate)}</span>
        ) : (
          <span className="text-gray-400 text-xs">—</span>
        ),
    },
    {
      header: 'Participant',
      cell:   (v: Visit) => {
        const p = v.enrollment?.participant
        return p ? (
          <span className="text-gray-700">{p.firstName} {p.lastName}</span>
        ) : (
          <span className="text-gray-400 text-xs">—</span>
        )
      },
    },
    {
      header: 'Site',
      cell:   (v: Visit) => <span className="text-gray-600">{v.site?.name ?? '—'}</span>,
    },
    {
      header: 'Duration',
      width:  '100px',
      cell:   (v: Visit) =>
        v.duration != null ? (
          <span className="text-gray-600">{v.duration} min</span>
        ) : (
          <span className="text-gray-400 text-xs">—</span>
        ),
    },
  ]

  return (
    <div className="p-6 space-y-5" style={{ background: 'var(--color-background)' }}>

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[24px] font-bold text-gray-900">Visits</h2>
          <p className="text-[17px] text-gray-500 mt-0.5">Scheduled and completed trial visits</p>
        </div>
        <div className="flex items-center gap-2 text-[17px] font-medium text-gray-500 px-3 py-1.5 rounded-lg bg-white" style={{ border: '1px solid var(--color-border)' }}>
          <CalendarCheck size={13} className="text-gray-400" />
          {filtered.length} {filtered.length === 1 ? 'visit' : 'visits'}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="py-2.5 pl-3 pr-8 text-[17px] border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
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
          className="py-2.5 pl-3 pr-8 text-[17px] border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
        >
          {TYPE_OPTIONS.map((t) => (
            <option key={t} value={t}>
              {t === 'All' ? 'All Types' : t.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
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
  )
}
