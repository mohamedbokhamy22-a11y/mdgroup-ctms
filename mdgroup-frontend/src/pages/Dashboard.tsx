import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  FlaskConical, Users, CalendarCheck, CreditCard, AlertTriangle,
  ArrowRight, Clock, Activity, TrendingUp
} from 'lucide-react'

import { studiesApi, participantsApi, visitsApi, paymentsApi, adverseEventsApi } from '../api/endpoints'
import Badge from '../components/ui/Badge'
import { useAuth } from '../context/AuthContext'

function getWeekRange() {
  const now = new Date()
  const day = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((day + 6) % 7))
  monday.setHours(0, 0, 0, 0)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)
  return {
    dateFrom: monday.toISOString().split('T')[0],
    dateTo: sunday.toISOString().split('T')[0],
  }
}

function truncate(str: string, max: number) {
  return str.length > max ? str.slice(0, max) + '…' : str
}

function SkeletonRow({ rows = 4 }: { rows?: number }) {
  return (
    <div className="animate-pulse space-y-3 p-5">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-11 rounded-lg bg-gray-100" />
      ))}
    </div>
  )
}

interface KpiCardProps {
  label: string
  value: string | number
  icon: React.FC<{ size?: number; className?: string }>
  accent: string
  sub: string
  loading: boolean
}

function KpiCard({ label, value, icon: Icon, accent, sub, loading }: KpiCardProps) {
  return (
    <div
      className="bg-white rounded-xl p-5 flex flex-col gap-3 overflow-hidden"
      style={{ border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}
    >
      {/* Top row: icon bubble + label */}
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: accent + '18', color: accent }}
        >
          <Icon size={16} />
        </div>
        <p
          className="text-[12px] font-bold uppercase tracking-wider leading-none"
          style={{ color: accent }}
        >
          {label}
        </p>
      </div>

      {/* Big number */}
      {loading ? (
        <div className="h-10 w-16 rounded-lg bg-gray-100 animate-pulse" />
      ) : (
        <p
          className="font-black tabular-nums leading-none"
          style={{ fontSize: '2.25rem', color: accent }}
        >
          {value}
        </p>
      )}

      {/* Sub label */}
      <p className="text-[12px] text-gray-400 leading-snug truncate">{sub}</p>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function StudyRow({ study, onClick }: { study: any; onClick: () => void }) {
  const enrolled = study.enrolledCount ?? study._count?.enrollments ?? 0
  const target   = study.targetEnrollment ?? study.enrollmentTarget ?? 0
  const pct      = target > 0 ? Math.min(100, Math.round((enrolled / target) * 100)) : 0
  const phase    = (study.phase ?? 'N/A').replace('PHASE_', 'P')

  const barColor = pct >= 80 ? '#059669' : pct >= 40 ? '#2563EB' : '#D97706'

  return (
    <div
      onClick={onClick}
      className="flex items-start gap-3.5 px-5 py-4 cursor-pointer transition-colors hover:bg-gray-50"
      style={{ borderTop: '1px solid var(--color-border)' }}
    >
      <div
        className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-[10px] font-black text-white mt-0.5"
        style={{ background: 'var(--color-primary)' }}
      >
        {phase}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-2">
          <p className="text-[14px] font-semibold text-gray-900 leading-snug">
            {truncate(study.title ?? '—', 42)}
          </p>
          {study.status && (
            <div className="shrink-0">
              <Badge value={study.status} />
            </div>
          )}
        </div>

        {target > 0 ? (
          <div className="space-y-1">
            <div className="w-full h-1.5 rounded-full overflow-hidden bg-gray-100">
              <div
                className="h-full rounded-full"
                style={{ width: `${pct}%`, background: barColor }}
              />
            </div>
            <p className="text-[11px] text-gray-400">
              {enrolled} / {target} enrolled &nbsp;·&nbsp; {pct}%
            </p>
          </div>
        ) : (
          <p className="text-[12px] text-gray-400">{study.protocolNumber ?? '—'}</p>
        )}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { dateFrom, dateTo } = getWeekRange()

  const { data: studiesData,        isLoading: studiesLoading }        = useQuery({ queryKey: ['dashboard-studies'],         queryFn: () => studiesApi.list({ limit: 100 }) })
  const { data: participantsData,   isLoading: participantsLoading }   = useQuery({ queryKey: ['dashboard-participants'],     queryFn: () => participantsApi.list({ limit: 1 }) })
  const { data: visitsData,         isLoading: visitsLoading }         = useQuery({ queryKey: ['dashboard-visits-week'],      queryFn: () => visitsApi.list({ dateFrom, dateTo, limit: 100 }) })
  const { data: paymentsData,       isLoading: paymentsLoading }       = useQuery({ queryKey: ['dashboard-payments-pending'], queryFn: () => paymentsApi.list({ status: 'PENDING', limit: 100 }) })
  const { data: adverseData,        isLoading: adverseLoading }        = useQuery({ queryKey: ['dashboard-adverse-events'],   queryFn: () => adverseEventsApi.list({ limit: 100 }) })
  const { data: recentStudiesData,  isLoading: recentStudiesLoading }  = useQuery({ queryKey: ['dashboard-recent-studies'],  queryFn: () => studiesApi.list({ limit: 6, sortBy: 'createdAt', order: 'DESC' }) })
  const { data: upcomingVisitsData, isLoading: upcomingVisitsLoading } = useQuery({ queryKey: ['dashboard-upcoming-visits'], queryFn: () => visitsApi.list({ dateFrom: new Date().toISOString().split('T')[0], limit: 5, sortBy: 'scheduledDate', order: 'ASC' }) })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allStudies: any[]  = studiesData?.data ?? []
  const activeStudiesCount = allStudies.filter(s => s.status === 'ACTIVE').length
  const participantCount: number = participantsData?.meta?.total ?? participantsData?.data?.length ?? 0
  const visitsThisWeek     = visitsData?.data?.length ?? 0
  const pendingPayments    = paymentsData?.data?.length ?? 0
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allAdverse: any[]  = adverseData?.data ?? []
  const openAdverseCount   = allAdverse.filter(ae => ae.status === 'REPORTED' || ae.status === 'UNDER_REVIEW').length
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recentStudies: any[]  = recentStudiesData?.data ?? []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const upcomingVisits: any[] = upcomingVisitsData?.data ?? []
  const openAEs = allAdverse
    .filter(ae => ae.status === 'REPORTED' || ae.status === 'UNDER_REVIEW')
    .slice(0, 4)

  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="p-6 space-y-6 min-w-0" style={{ background: 'var(--color-background)' }}>

      {/* Welcome bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-[20px] font-bold text-gray-900 leading-none">
            {greeting}, {user?.firstName}
          </h2>
          <p className="text-[13px] text-gray-400 mt-1.5">
            {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/reports')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold text-gray-600 bg-white transition-colors hover:bg-gray-50"
            style={{ border: '1px solid var(--color-border)' }}
          >
            <TrendingUp size={14} />
            Reports
          </button>
          <button
            onClick={() => navigate('/studies')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: 'var(--color-primary)' }}
          >
            <Activity size={14} />
            New Study
          </button>
        </div>
      </div>

      {/* KPI cards — 2 cols on mobile, 3 on md, 5 on xl */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
        <KpiCard label="Active Studies"   value={activeStudiesCount} icon={FlaskConical}  accent="#003087" sub="Running protocols"          loading={studiesLoading} />
        <KpiCard label="Participants"     value={participantCount}   icon={Users}         accent="#0E7490" sub="Total enrolled"             loading={participantsLoading} />
        <KpiCard label="Visits This Week" value={visitsThisWeek}     icon={CalendarCheck} accent="#2563EB" sub={`${dateFrom} – ${dateTo}`}  loading={visitsLoading} />
        <KpiCard label="Pending Payments" value={pendingPayments}    icon={CreditCard}    accent="#B45309" sub="Awaiting approval"          loading={paymentsLoading} />
        <KpiCard label="Open AEs"         value={openAdverseCount}   icon={AlertTriangle} accent="#B91C1C" sub="Reported or in review"      loading={adverseLoading} />
      </div>

      {/* Main panels — 3/5 + 2/5 split */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-start">

        {/* Left — Recent Studies */}
        <div
          className="lg:col-span-3 bg-white rounded-xl overflow-hidden"
          style={{ border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}
        >
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: '1px solid var(--color-border)' }}
          >
            <div className="flex items-center gap-2.5">
              <FlaskConical size={15} className="text-gray-400" />
              <div>
                <h3 className="text-[15px] font-bold text-gray-900 leading-none">Recent Studies</h3>
                <p className="text-[12px] text-gray-400 mt-0.5">Enrollment progress</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/studies')}
              className="flex items-center gap-1.5 text-[13px] font-semibold cursor-pointer hover:opacity-70 transition-opacity"
              style={{ color: 'var(--color-primary)' }}
            >
              View all <ArrowRight size={12} />
            </button>
          </div>

          {recentStudiesLoading ? (
            <SkeletonRow />
          ) : recentStudies.length === 0 ? (
            <p className="text-gray-400 text-[14px] text-center py-12">No studies yet.</p>
          ) : (
            <div>
              {recentStudies.map(s => (
                <StudyRow key={s.id} study={s} onClick={() => navigate(`/studies/${s.id}`)} />
              ))}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 flex flex-col gap-4">

          {/* Upcoming Visits */}
          <div
            className="bg-white rounded-xl overflow-hidden"
            style={{ border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}
          >
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: '1px solid var(--color-border)' }}
            >
              <div className="flex items-center gap-2.5">
                <Clock size={15} className="text-gray-400" />
                <h3 className="text-[15px] font-bold text-gray-900">Upcoming Visits</h3>
              </div>
              <button
                onClick={() => navigate('/visits')}
                className="flex items-center gap-1.5 text-[13px] font-semibold cursor-pointer hover:opacity-70 transition-opacity"
                style={{ color: 'var(--color-primary)' }}
              >
                View all <ArrowRight size={12} />
              </button>
            </div>

            {upcomingVisitsLoading ? (
              <SkeletonRow rows={3} />
            ) : upcomingVisits.length === 0 ? (
              <p className="text-gray-400 text-[13px] text-center py-8">No upcoming visits.</p>
            ) : (
              <div>
                {upcomingVisits.map((v, i) => {
                  const participant = v.enrollment?.participant ?? v.participant ?? null
                  const name = participant
                    ? `${participant.firstName ?? ''} ${participant.lastName ?? ''}`.trim()
                    : '—'
                  const d = v.scheduledDate ? new Date(v.scheduledDate) : null

                  return (
                    <div
                      key={v.id}
                      className="flex items-center gap-3.5 px-5 py-3.5 transition-colors hover:bg-gray-50"
                      style={{ borderTop: i > 0 ? '1px solid var(--color-border)' : undefined }}
                    >
                      {/* Date tile */}
                      {d ? (
                        <div
                          className="w-10 h-10 rounded-lg shrink-0 flex flex-col items-center justify-center text-white"
                          style={{ background: 'var(--color-primary-mid)' }}
                        >
                          <span className="text-[9px] font-bold uppercase leading-none">
                            {d.toLocaleDateString('en-US', { month: 'short' })}
                          </span>
                          <span className="text-[17px] font-black leading-tight tabular-nums">
                            {d.getDate()}
                          </span>
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-lg shrink-0 bg-gray-100 flex items-center justify-center">
                          <CalendarCheck size={14} className="text-gray-400" />
                        </div>
                      )}

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-semibold text-gray-900 truncate leading-none">
                          {v.visitName ?? v.name ?? '—'}
                        </p>
                        <p className="text-[12px] text-gray-400 mt-1 truncate">{name}</p>
                      </div>

                      <div className="shrink-0">
                        {v.status && <Badge value={v.status} />}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Open Adverse Events */}
          <div
            className="bg-white rounded-xl overflow-hidden"
            style={{ border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}
          >
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: '1px solid var(--color-border)' }}
            >
              <div className="flex items-center gap-2.5">
                <AlertTriangle size={15} style={{ color: '#B91C1C' }} />
                <h3 className="text-[15px] font-bold text-gray-900">Open Adverse Events</h3>
              </div>
              <button
                onClick={() => navigate('/adverse-events')}
                className="flex items-center gap-1.5 text-[13px] font-semibold cursor-pointer hover:opacity-70 transition-opacity"
                style={{ color: 'var(--color-primary)' }}
              >
                View all <ArrowRight size={12} />
              </button>
            </div>

            {adverseLoading ? (
              <SkeletonRow rows={2} />
            ) : openAEs.length === 0 ? (
              <p className="text-gray-400 text-[13px] text-center py-8">No open adverse events.</p>
            ) : (
              <div>
                {openAEs.map((ae, i) => {
                  const sevColor =
                    ae.severity === 'SEVERE' || ae.severity === 'LIFE_THREATENING' || ae.severity === 'FATAL'
                      ? '#B91C1C'
                      : ae.severity === 'MODERATE'
                      ? '#D97706'
                      : '#6B7280'

                  return (
                    <div
                      key={ae.id}
                      onClick={() => navigate('/adverse-events')}
                      className="flex items-center gap-3.5 px-5 py-3.5 cursor-pointer transition-colors hover:bg-gray-50"
                      style={{ borderTop: i > 0 ? '1px solid var(--color-border)' : undefined }}
                    >
                      {/* Severity dot */}
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ background: sevColor }}
                      />

                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-semibold text-gray-900 truncate leading-none">
                          {truncate(ae.description ?? ae.eventName ?? '—', 32)}
                        </p>
                        <p className="text-[12px] mt-1" style={{ color: sevColor }}>
                          {ae.severity?.replace(/_/g, ' ') ?? '—'}
                        </p>
                      </div>

                      <div className="shrink-0">
                        <Badge value={ae.status} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
