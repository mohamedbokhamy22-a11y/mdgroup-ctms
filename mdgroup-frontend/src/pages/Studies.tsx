import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, FlaskConical } from 'lucide-react'

import { studiesApi } from '../api/endpoints'
import Badge from '../components/ui/Badge'
import Table from '../components/ui/Table'
import PageHeader from '../components/ui/PageHeader'

// ── types ──────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Study = Record<string, any>

// ── helpers ────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="animate-spin rounded-full border-2 border-blue-600 border-t-transparent w-6 h-6" />
    </div>
  )
}

function truncate(str: string, max: number) {
  return str.length > max ? str.slice(0, max) + '…' : str
}

const STATUS_OPTIONS = ['All', 'DRAFT', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'TERMINATED']
const PHASE_OPTIONS  = ['All', 'PHASE_1', 'PHASE_2', 'PHASE_3', 'PHASE_4', 'OBSERVATIONAL']

// ── component ──────────────────────────────────────────────────────────────

export default function Studies() {
  const navigate = useNavigate()

  const [search, setSearch]         = useState('')
  const [statusFilter, setStatus]   = useState('All')
  const [phaseFilter, setPhase]     = useState('All')

  const { data, isLoading } = useQuery({
    queryKey: ['studies'],
    queryFn:  () => studiesApi.list({ limit: 100 }),
  })

  const allStudies: Study[] = data?.data ?? []

  const filtered = allStudies.filter((s) => {
    const q = search.toLowerCase()
    const matchesSearch =
      !q ||
      (s.title ?? '').toLowerCase().includes(q) ||
      (s.protocolNumber ?? '').toLowerCase().includes(q)

    const matchesStatus = statusFilter === 'All' || s.status === statusFilter
    const matchesPhase  = phaseFilter  === 'All' || s.phase  === phaseFilter

    return matchesSearch && matchesStatus && matchesPhase
  })

  const columns = [
    {
      header: 'Protocol #',
      width:  '140px',
      cell:   (s: Study) => (
        <span className="font-mono text-xs text-slate-600 whitespace-nowrap">
          {s.protocolNumber ?? '—'}
        </span>
      ),
    },
    {
      header: 'Title',
      cell:   (s: Study) => (
        <span className="text-slate-800">{truncate(s.title ?? '—', 50)}</span>
      ),
    },
    {
      header: 'Phase',
      width:  '120px',
      cell:   (s: Study) =>
        s.phase ? <Badge value={s.phase} /> : <span className="text-slate-400 text-xs">—</span>,
    },
    {
      header: 'Status',
      width:  '120px',
      cell:   (s: Study) =>
        s.status ? <Badge value={s.status} /> : <span className="text-slate-400 text-xs">—</span>,
    },
    {
      header: 'Sponsor',
      width:  '160px',
      cell:   (s: Study) => (
        <span className="text-slate-600 text-sm">
          {s.sponsor?.name ?? s.sponsorName ?? '—'}
        </span>
      ),
    },
    {
      header: 'Target',
      width:  '80px',
      cell:   (s: Study) => (
        <span className="text-slate-600 text-sm">
          {s.targetEnrollment != null ? `${s.targetEnrollment} pts` : '—'}
        </span>
      ),
    },
    {
      header: 'Enrolled',
      width:  '80px',
      cell:   (s: Study) => (
        <span className="text-slate-700 font-medium text-sm">
          {s._count?.enrollments ?? '—'}
        </span>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Studies"
        subtitle="Clinical trial protocol management"
        action={
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <FlaskConical className="w-4 h-4" />
            <span>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
          </div>
        }
      />

      <div className="px-8 pb-10 space-y-4">
        {/* ── filters ── */}
        <div className="flex flex-wrap items-center gap-3">
          {/* search */}
          <div className="relative flex-1 min-w-[220px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search title or protocol…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-400"
            />
          </div>

          {/* status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatus(e.target.value)}
            className="py-2 pl-3 pr-8 text-sm border border-slate-200 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-700"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s === 'All' ? 'All Statuses' : s.replace(/_/g, ' ')}
              </option>
            ))}
          </select>

          {/* phase */}
          <select
            value={phaseFilter}
            onChange={(e) => setPhase(e.target.value)}
            className="py-2 pl-3 pr-8 text-sm border border-slate-200 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-700"
          >
            {PHASE_OPTIONS.map((p) => (
              <option key={p} value={p}>
                {p === 'All' ? 'All Phases' : p.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>

        {/* ── table ── */}
        {isLoading ? (
          <Spinner />
        ) : (
          <Table<Study>
            columns={columns}
            data={filtered}
            onRowClick={(s) => navigate(`/studies/${s.id}`)}
            emptyMessage="No studies match your filters."
          />
        )}
      </div>
    </div>
  )
}
