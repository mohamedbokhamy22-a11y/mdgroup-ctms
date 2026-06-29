import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { MapPin, Search } from 'lucide-react'
import { sitesApi } from '../api/endpoints'
import Table from '../components/ui/Table'
import PageHeader from '../components/ui/PageHeader'

const fmt = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

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
    <div className="px-8 py-8">
      <PageHeader title="Sites" subtitle="Global research site network" action={
        <span className="text-sm text-slate-500">{sites.length} sites</span>
      } />

      {/* Country Overview */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <MapPin size={16} className="text-slate-500" />
          <span className="text-sm font-semibold text-slate-700">Active Countries</span>
        </div>
        <div className="flex flex-wrap gap-3">
          {countryDots.map(({ country, color }) => (
            <div key={country} className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg">
              <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
              <span className="text-sm text-slate-700">{country}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, city or country…"
          className="w-full max-w-sm pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full border-2 border-blue-600 border-t-transparent w-8 h-8" />
        </div>
      ) : (
        <Table<Site>
          columns={[
            { header: 'Code', cell: s => <span className="font-mono text-xs text-slate-600">{s.siteCode}</span>, width: '110px' },
            { header: 'Site Name', cell: s => <span className="font-medium text-slate-800">{s.name}</span> },
            { header: 'City', cell: s => s.city },
            { header: 'Country', cell: s => s.country },
            { header: 'Principal Investigator', cell: s => s.principalInvestigator ?? '—' },
            { header: 'Contact', cell: s => s.contactEmail ? <a href={`mailto:${s.contactEmail}`} className="text-blue-600 hover:underline text-xs">{s.contactEmail}</a> : '—' },
            { header: 'Enrollments', cell: s => <span className="font-semibold text-slate-700">{s._count?.enrollments ?? 0}</span> },
          ]}
          data={sites}
        />
      )}
    </div>
  )
}
