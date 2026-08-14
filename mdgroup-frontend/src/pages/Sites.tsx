import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { MapPin, Search } from 'lucide-react'
import { sitesApi } from '../api/endpoints'
import Table from '../components/ui/Table'

interface Site {
  id: string; siteCode: string; name: string; city: string; country: string
  principalInvestigator?: string; contactEmail?: string; createdAt: string
  _count?: { enrollments: number }
}

const countryDots: { country: string; color: string }[] = [
  { country: 'United States', color: 'bg-blue-500' },
  { country: 'United Kingdom', color: 'bg-red-500' },
  { country: 'Germany', color: 'bg-yellow-500' },
  { country: 'Switzerland', color: 'bg-red-400' },
]

export default function Sites() {
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['sites'],
    queryFn: () => sitesApi.list({ limit: 100 }),
  })

  const sites: Site[] = (data?.data ?? []).filter((s: Site) =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.country.toLowerCase().includes(search.toLowerCase()) ||
    s.city.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 space-y-5" style={{ background: 'var(--color-background)' }}>

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[18px] font-bold text-gray-900">Sites</h2>
          <p className="text-[13px] text-gray-500 mt-0.5">Global research site network</p>
        </div>
        <div className="flex items-center gap-2 text-[13px] font-medium text-gray-500 px-3 py-1.5 rounded-lg bg-white" style={{ border: '1px solid var(--color-border)' }}>
          <MapPin size={13} className="text-gray-400" />
          {sites.length} {sites.length === 1 ? 'site' : 'sites'}
        </div>
      </div>

      {/* Country overview */}
      <div
        className="bg-white rounded-xl p-4"
        style={{ border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}
      >
        <div className="flex items-center gap-2 mb-3">
          <MapPin size={14} className="text-gray-400" />
          <span className="text-[13px] font-semibold text-gray-700">Active Countries</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {countryDots.map(({ country, color }) => (
            <div key={country} className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg" style={{ border: '1px solid var(--color-border)' }}>
              <div className={`w-2 h-2 rounded-full ${color}`} />
              <span className="text-[13px] text-gray-700">{country}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="relative min-w-[220px] max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, city or country…"
          className="w-full pl-9 pr-4 py-2.5 text-[13px] border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full border-2 border-blue-600 border-t-transparent w-6 h-6" />
        </div>
      ) : (
        <Table<Site>
          columns={[
            { header: 'Code', width: '110px', cell: s => <span className="font-mono text-xs text-gray-500">{s.siteCode}</span> },
            { header: 'Site Name', cell: s => <span className="font-medium text-gray-800">{s.name}</span> },
            { header: 'City', cell: s => <span className="text-gray-600">{s.city}</span> },
            { header: 'Country', cell: s => <span className="text-gray-600">{s.country}</span> },
            { header: 'Principal Investigator', cell: s => <span className="text-gray-600">{s.principalInvestigator ?? '—'}</span> },
            { header: 'Contact', cell: s => s.contactEmail ? <a href={`mailto:${s.contactEmail}`} className="text-blue-600 hover:underline text-xs">{s.contactEmail}</a> : <span className="text-gray-400 text-xs">—</span> },
            { header: 'Enrollments', cell: s => <span className="font-semibold text-gray-700">{s._count?.enrollments ?? 0}</span> },
          ]}
          data={sites}
          emptyMessage="No sites match your search."
        />
      )}
    </div>
  )
}
