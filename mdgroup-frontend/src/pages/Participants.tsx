import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, Users } from 'lucide-react'

import { participantsApi } from '../api/endpoints'
import Table from '../components/ui/Table'
import Badge from '../components/ui/Badge'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Participant = Record<string, any>

function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="animate-spin rounded-full border-2 border-blue-600 border-t-transparent w-6 h-6" />
    </div>
  )
}

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
        <span className="font-mono text-xs text-gray-500">{p.externalRef ?? '—'}</span>
      ),
    },
    {
      header: 'Name',
      cell:   (p: Participant) => (
        <span className="text-gray-800 font-medium">
          {[p.firstName, p.lastName].filter(Boolean).join(' ') || '—'}
        </span>
      ),
    },
    {
      header: 'Country',
      width:  '120px',
      cell:   (p: Participant) => <span className="text-gray-600">{p.country ?? '—'}</span>,
    },
    {
      header: 'Language',
      width:  '110px',
      cell:   (p: Participant) => <span className="text-gray-600">{p.preferredLanguage ?? p.language ?? '—'}</span>,
    },
    {
      header: 'Phone',
      width:  '145px',
      cell:   (p: Participant) => <span className="text-gray-600">{p.phone ?? p.phoneNumber ?? '—'}</span>,
    },
    {
      header: 'Enrollments',
      width:  '110px',
      cell:   (p: Participant) => (
        <span className="font-semibold text-gray-700">{p._count?.enrollments ?? '—'}</span>
      ),
    },
    {
      header: 'Assistance',
      width:  '110px',
      cell:   (p: Participant) =>
        p.requiresAssistance ? (
          <Badge value="ACTIVE" />
        ) : (
          <span className="text-gray-400 text-[16px]">No</span>
        ),
    },
  ]

  return (
    <div className="p-6 space-y-5" style={{ background: 'var(--color-background)' }}>

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[24px] font-bold text-gray-900">Participants</h2>
          <p className="text-[17px] text-gray-500 mt-0.5">Patient records and enrollment tracking</p>
        </div>
        <div className="flex items-center gap-2 text-[17px] font-medium text-gray-500 px-3 py-1.5 rounded-lg bg-white" style={{ border: '1px solid var(--color-border)' }}>
          <Users size={13} className="text-gray-400" />
          {filtered.length} {filtered.length === 1 ? 'participant' : 'participants'}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search name or ref…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-[17px] border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
          />
        </div>

        <button
          onClick={() => setAssistance((v) => !v)}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-[17px] font-medium border transition-colors cursor-pointer ${
            assistanceOnly
              ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${assistanceOnly ? 'bg-red-500' : 'bg-gray-300'}`} />
          Requires Assistance
        </button>
      </div>

      {/* Table */}
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
  )
}
