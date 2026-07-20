import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search } from 'lucide-react'

import { sponsorsApi } from '../api/endpoints'
import Table from '../components/ui/Table'
import PageHeader from '../components/ui/PageHeader'

// ── types ──────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Sponsor = Record<string, any>

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

// ── component ──────────────────────────────────────────────────────────────

export default function Sponsors() {
  const [search, setSearch] = useState<string>('')

  const { data, isLoading } = useQuery({
    queryKey: ['sponsors'],
    queryFn:  () => sponsorsApi.list({ limit: 100 }),
  })

  const allSponsors: Sponsor[] = data?.data ?? []

  const filtered: Sponsor[] = allSponsors.filter((s) => {
    const q = search.toLowerCase()
    return !q || (s.name ?? '').toLowerCase().includes(q)
  })

  const columns = [
    {
      header: 'Name',
      cell:   (s: Sponsor) => (
        <span className="font-semibold text-slate-800">{s.name ?? '—'}</span>
      ),
    },
    {
      header: 'Country',
      width:  '150px',
      cell:   (s: Sponsor) => (
        <span className="text-slate-600 text-sm">{s.country ?? '—'}</span>
      ),
    },
    {
      header: 'Contact Email',
      cell:   (s: Sponsor) =>
        s.contactEmail ? (
          <a
            href={`mailto:${s.contactEmail}`}
            onClick={(e) => e.stopPropagation()}
            className="text-blue-600 hover:underline text-sm"
          >
            {s.contactEmail}
          </a>
        ) : (
          <span className="text-slate-400 text-xs">—</span>
        ),
    },
    {
      header: 'Phone',
      width:  '160px',
      cell:   (s: Sponsor) => (
        <span className="text-slate-600 text-sm">{s.phone ?? s.contactPhone ?? '—'}</span>
      ),
    },
    {
      header: 'Active Studies',
      width:  '130px',
      cell:   (s: Sponsor) => (
        <span className="font-semibold text-slate-800">
          {s._count?.studies ?? 0}
        </span>
      ),
    },
    {
      header: 'Created',
      width:  '130px',
      cell:   (s: Sponsor) =>
        s.createdAt ? (
          <span className="text-slate-500 text-sm">{fmt(s.createdAt)}</span>
        ) : (
          <span className="text-slate-400 text-xs">—</span>
        ),
    },
  ]

  return (
    <div className="min-h-screen" style={{ background: '#f1f5f9' }}>
      <div className="px-8 pt-8 pb-10 space-y-4">
        <PageHeader
          title="Sponsors"
          subtitle="Pharmaceutical company partners"
          action={
            <span className="text-sm text-slate-500">
              {filtered.length} sponsor{filtered.length !== 1 ? 's' : ''}
            </span>
          }
        />
        {/* ── search ── */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 min-w-[220px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-400"
            />
          </div>
        </div>

        {/* ── table ── */}
        {isLoading ? (
          <Spinner />
        ) : (
          <Table<Sponsor>
            columns={columns}
            data={filtered}
            emptyMessage="No sponsors match your search."
          />
        )}
      </div>
    </div>
  )
}
