import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, Building2 } from 'lucide-react'

import { sponsorsApi } from '../api/endpoints'
import Table from '../components/ui/Table'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Sponsor = Record<string, any>

function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="animate-spin rounded-full border-2 border-blue-600 border-t-transparent w-6 h-6" />
    </div>
  )
}

const fmt = (d: string) =>
  new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

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
        <span className="font-semibold text-gray-800">{s.name ?? '—'}</span>
      ),
    },
    {
      header: 'Country',
      width:  '150px',
      cell:   (s: Sponsor) => <span className="text-gray-600">{s.country ?? '—'}</span>,
    },
    {
      header: 'Contact Email',
      cell:   (s: Sponsor) =>
        s.contactEmail ? (
          <a
            href={`mailto:${s.contactEmail}`}
            onClick={(e) => e.stopPropagation()}
            className="text-blue-600 hover:underline"
          >
            {s.contactEmail}
          </a>
        ) : (
          <span className="text-gray-400 text-xs">—</span>
        ),
    },
    {
      header: 'Phone',
      width:  '160px',
      cell:   (s: Sponsor) => <span className="text-gray-600">{s.phone ?? s.contactPhone ?? '—'}</span>,
    },
    {
      header: 'Active Studies',
      width:  '130px',
      cell:   (s: Sponsor) => (
        <span className="font-semibold text-gray-800">{s._count?.studies ?? 0}</span>
      ),
    },
    {
      header: 'Created',
      width:  '130px',
      cell:   (s: Sponsor) =>
        s.createdAt ? (
          <span className="text-gray-500">{fmt(s.createdAt)}</span>
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
          <h2 className="text-[18px] font-bold text-gray-900">Sponsors</h2>
          <p className="text-[13px] text-gray-500 mt-0.5">Pharmaceutical and biotech partners</p>
        </div>
        <div className="flex items-center gap-2 text-[13px] font-medium text-gray-500 px-3 py-1.5 rounded-lg bg-white" style={{ border: '1px solid var(--color-border)' }}>
          <Building2 size={13} className="text-gray-400" />
          {filtered.length} {filtered.length === 1 ? 'sponsor' : 'sponsors'}
        </div>
      </div>

      {/* Search */}
      <div className="relative flex-1 min-w-[220px] max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search by name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-[13px] border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
        />
      </div>

      {/* Table */}
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
  )
}
