import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, Users } from 'lucide-react'

import { participantsApi } from '../api/endpoints'
import Badge from '../components/ui/Badge'
import Table from '../components/ui/Table'
import PageHeader from '../components/ui/PageHeader'

// ── types ──────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Participant = Record<string, any>

// ── helpers ────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="animate-spin rounded-full border-2 border-blue-600 border-t-transparent w-6 h-6" />
    </div>
  )
}

// ── component ──────────────────────────────────────────────────────────────

export default function Participants() {
  const navigate = useNavigate()

  const [search, setSearch]             = useState('')
  const [assistanceOnly, setAssistance] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['participants'],
    queryFn:  () => participantsApi.list({ limit: 100 }),
  })

  const allParticipants: Participant[] = data?.data ?? []

  const filtered = allParticipants.filter((p) => {
    const q = search.toLowerCase()
    const matchesSearch =
      !q ||
      (p.firstName ?? '').toLowerCase().includes(q) ||
      (p.lastName ?? '').toLowerCase().includes(q) ||
      (p.externalRef ?? '').toLowerCase().includes(q)

    const matchesAssistance = !assistanceOnly || p.requiresAssistance === true

    return matchesSearch && matchesAssistance
  })

  const columns = [
    {
      header: 'Ref',
      width:  '130px',
      cell:   (p: Participant) => (
        <span className="font-mono text-xs text-slate-600">
          {p.externalRef ?? '—'}
        </span>
      ),
    },
    {
      header: 'Name',
      cell:   (p: Participant) => (
        <span className="text-slate-800 font-medium">
          {[p.firstName, p.lastName].filter(Boolean).join(' ') || '—'}
        </span>
      ),
    },
    {
      header: 'Country',
      width:  '120px',
      cell:   (p: Participant) => (
        <span className="text-slate-600 text-sm">{p.country ?? '—'}</span>
      ),
    },
    {
      header: 'Language',
      width:  '110px',
      cell:   (p: Participant) => (
        <span className="text-slate-600 text-sm">{p.preferredLanguage ?? p.language ?? '—'}</span>
      ),
    },
    {
      header: 'Phone',
      width:  '140px',
      cell:   (p: Participant) => (
        <span className="text-slate-600 text-sm">{p.phone ?? p.phoneNumber ?? '—'}</span>
      ),
    },
    {
      header: 'Enrollments',
      width:  '100px',
      cell:   (p: Participant) => (
        <span className="text-slate-700 font-medium text-sm">
          {p._count?.enrollments ?? '—'}
        </span>
      ),
    },
    {
      header: 'Assistance',
      width:  '100px',
      cell:   (p: Participant) =>
        p.requiresAssistance ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-red-100 text-red-700">
            Yes
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-600">
            No
          </span>
        ),
    },
  ]

  return (
    <div className="min-h-screen" style={{ background: '#f1f5f9' }}>
      <div className="px-8 pt-8 pb-10 space-y-4">
        <PageHeader
          title="Participants"
          subtitle="Patient records and enrollment tracking"
          action={
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Users className="w-4 h-4" />
              <span>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
            </div>
          }
        />
        {/* ── filters ── */}
        <div className="flex flex-wrap items-center gap-3">
          {/* search */}
          <div className="relative flex-1 min-w-[220px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search name or ref…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-400"
            />
          </div>

          {/* assistance toggle */}
          <button
            onClick={() => setAssistance((v) => !v)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
              assistanceOnly
                ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                assistanceOnly ? 'bg-red-500' : 'bg-slate-300'
              }`}
            />
            Requires Assistance
          </button>
        </div>

        {/* ── table ── */}
        {isLoading ? (
          <Spinner />
        ) : (
          <Table<Participant>
            columns={columns}
            data={filtered}
            onRowClick={(p) => navigate(`/participants/${p.id}`)}
            emptyMessage="No participants match your filters."
          />
        )}
      </div>
    </div>
  )
}
