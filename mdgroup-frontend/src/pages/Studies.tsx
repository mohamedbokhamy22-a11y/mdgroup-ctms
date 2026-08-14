import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, FlaskConical, Users, Calendar, ChevronRight } from 'lucide-react'

import { studiesApi } from '../api/endpoints'
import Badge from '../components/ui/Badge'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Study = Record<string, any>

function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full border-2 border-blue-600 border-t-transparent w-7 h-7" />
    </div>
  )
}

const STATUS_OPTIONS = ['All', 'DRAFT', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'TERMINATED']
const PHASE_OPTIONS  = ['All', 'PHASE_1', 'PHASE_2', 'PHASE_3', 'PHASE_4', 'OBSERVATIONAL']

const phaseColor: Record<string, string> = {
  PHASE_1: '#7c3aed',
  PHASE_2: '#2563eb',
  PHASE_3: '#0d9488',
  PHASE_4: '#059669',
  OBSERVATIONAL: '#4f46e5',
}

function StudyCard({ study, onClick }: { study: Study; onClick: () => void }) {
  const color = phaseColor[study.phase] ?? '#003087'
  const enrolled = study._count?.enrollments ?? 0
  const target = study.targetEnrollment ?? 0
  const progress = target > 0 ? Math.min(100, Math.round((enrolled / target) * 100)) : 0

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 group"
      style={{ border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}
    >
      {/* Top accent */}
      <div className="h-1 rounded-t-xl" style={{ background: color }} />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <p className="text-[17px] font-mono text-gray-400 mb-1">{study.protocolNumber ?? '—'}</p>
            <h3 className="text-[16px] font-semibold text-gray-900 leading-snug line-clamp-2">
              {study.title ?? '—'}
            </h3>
          </div>
          <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500 shrink-0 mt-1 transition-colors" />
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap mb-4">
          {study.phase && <Badge value={study.phase} />}
          {study.status && <Badge value={study.status} />}
        </div>

        {/* Sponsor */}
        {study.sponsor?.name && (
          <p className="text-[16px] text-gray-500 mb-4 truncate">
            <span className="text-gray-400">Sponsor: </span>
            {study.sponsor.name}
          </p>
        )}

        {/* Enrollment progress */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-[16px] text-gray-500">
              <Users size={11} />
              <span>Enrollment</span>
            </div>
            <span className="text-[16px] font-semibold text-gray-700">
              {enrolled} / {target > 0 ? target : '—'}
            </span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${progress}%`, background: color }}
            />
          </div>
        </div>

        {/* Footer */}
        {(study.startDate || study.indication) && (
          <div className="flex items-center gap-3 mt-4 pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
            {study.startDate && (
              <div className="flex items-center gap-1.5 text-[17px] text-gray-400">
                <Calendar size={11} />
                <span>{new Date(study.startDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</span>
              </div>
            )}
            {study.indication && (
              <p className="text-[17px] text-gray-400 truncate">{study.indication}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function Studies() {
  const navigate = useNavigate()

  const [search, setSearch]       = useState('')
  const [statusFilter, setStatus] = useState('All')
  const [phaseFilter, setPhase]   = useState('All')

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

  return (
    <div className="p-6 space-y-5" style={{ background: 'var(--color-background)' }}>

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[24px] font-bold text-gray-900">Studies</h2>
          <p className="text-[17px] text-gray-500 mt-0.5">Clinical trial protocol management</p>
        </div>
        <div className="flex items-center gap-2 text-[17px] font-medium text-gray-500 px-3 py-1.5 rounded-lg bg-white" style={{ border: '1px solid var(--color-border)' }}>
          <FlaskConical size={13} className="text-gray-400" />
          {filtered.length} {filtered.length === 1 ? 'study' : 'studies'}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search title or protocol…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-[17px] border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatus(e.target.value)}
          className="py-2.5 pl-3 pr-8 text-[17px] border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s.replace(/_/g, ' ')}</option>
          ))}
        </select>

        <select
          value={phaseFilter}
          onChange={(e) => setPhase(e.target.value)}
          className="py-2.5 pl-3 pr-8 text-[17px] border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
        >
          {PHASE_OPTIONS.map((p) => (
            <option key={p} value={p}>{p === 'All' ? 'All Phases' : p.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>

      {/* Grid */}
      {isLoading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <FlaskConical size={32} className="mb-3 text-gray-300" />
          <p className="text-[16px] font-medium">No studies match your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((s) => (
            <StudyCard
              key={s.id}
              study={s}
              onClick={() => navigate(`/studies/${s.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
