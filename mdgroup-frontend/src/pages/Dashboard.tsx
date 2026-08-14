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

function Shimmer({ rows = 4 }: { rows?: number }) {
  return (
    <div className="animate-pulse space-y-3 p-5">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 rounded-lg bg-gray-100" />
      ))}
    </div>
  )
}

interface KpiCardProps {
  label: string
  value: string | number
  icon: React.FC<{ size?: number; className?: string }>
  accentColor: string
  sub: string
  loading: boolean
}

function KpiCard({ label, value, icon: Icon, accentColor, sub, loading }: KpiCardProps) {
  return (
    <div
      className="bg-white rounded-xl flex overflow-hidden"
      style={{ border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}
    >
      {/* color accent bar */}
      <div className="w-1 shrink-0" style={{ background: accentColor }} />

      <div className="flex-1 px-5 py-4 flex items-start gap-4 min-w-0">
        <div
          className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0 mt-0.5"
          style={{ background: accentColor + '18', color: accentColor }}
        >
          <Icon size={18} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 leading-none mb-1.5">{label}</p>
          {loading ? (
            <div className="h-9 w-16 rounded bg-gray-100 animate-pulse" />
          ) : (
            <p
              className="font-black leading-none tabular-nums"
              style={{ fontSize: '2.6rem', color: accentColor, lineHeight: 1 }}
            >
              {value}
            </p>
          )}
          <p className="text-[12px] text-gray-400 mt-1.5">{sub}</p>
        </div>
      </div>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function EnrollmentBar({ study }: { study: any }) {
  const enrolled = study.enrolledCount ?? study._count?.enrollments ?? 0
  const target   = study.targetEnrollment ?? study.enrollmentTarget ?? 0
  const pct      = target > 0 ? Math.min(100, Math.round((enrolled / target) * 100)) : 0
  const phase    = (study.phase ?? 'N/A').replace('PHASE_', 'P')

  return (
    <div
      onClick={() => {}}
      className="px-5 py-3.5 flex items-center gap-4 transition-colors hover:bg-gray-50 cursor-pointer"
      style={{ borderTop: '1px solid var(--color-border)' }}
    >
      <div
        className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-[10px] font-black text-white"
        style={{ background: 'var(--color-primary)' }}
      >
        {phase}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <p className="text-[14px] font-semibold text-gray-900 truncate">{truncate(study.title ?? '', 36)}</p>
          <span className="text-[12px] font-bold text-gray-500 shrink-0 tabular-nums">
            {enrolled}{target > 0 ? `/${target}` : ''}
          </span>
        </div>

        {target > 0 ? (
          <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: '#E5E7EB' }}>
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${pct}%`,
                background: pct >= 80 ? '#059669' : pct >= 40 ? 'var(--color-primary-mid)' : '#D97706',
              }}
            />
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            {study.status && <Badge value={study.status} />}
          </div>
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
  const { data: upcomingVisitsData, isLoading: upcomingVisitsLoading } = useQuery({ queryKey: ['dashboard-upcoming-visits'], queryFn: () => visitsApi.list({ dateFrom: new Date().toISOString().split('T')[0], limit: 4, sortBy: 'scheduledDate', order: 'ASC' }) })

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const openAEs: any[] = allAdverse.filter(ae => ae.status === 'REPORTED' || ae.status === 'UNDER_REVIEW').slice(0, 3)

  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="p-6 space-y-5" style={{ background: 'var(--color-background)' }}>

      {/* Welcome bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[22px] font-bold text-gray-900 leading-none">{greeting}, {user?.firstName}</h2>
          <p className="text-[14px] text-gray-400 mt-1.5">
            {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/reports')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[14px] font-semibold text-gray-600 bg-white transition-colors hover:bg-gray-50 cursor-pointer"
            style={{ border: '1px solid var(--color-border)' }}
          >
            <TrendingUp size={14} />
            Reports
          </button>
          <button
            onClick={() => navigate('/studies')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[14px] font-semibold text-white cursor-pointer transition-opacity hover:opacity-90"
            style={{ background: 'var(--color-primary)' }}
          >
            <Activity size={14} />
            New Study
          </button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
        <KpiCard label="Active Studies"   value={activeStudiesCount} icon={FlaskConical}  accentColor="#003087" sub="Running protocols"     loading={studiesLoading} />
        <KpiCard label="Participants"     value={participantCount}   icon={Users}         accentColor="#0E7490" sub="Total enrolled"        loading={participantsLoading} />
        <KpiCard label="Visits This Week" value={visitsThisWeek}     icon={CalendarCheck} accentColor="#2563EB" sub={`${dateFrom} – ${dateTo}`} loading={visitsLoading} />
        <KpiCard label="Pending Payments" value={pendingPayments}    icon={CreditCard}    accentColor="#B45309" sub="Awaiting approval"     loading={paymentsLoading} />
        <KpiCard label="Open AEs"         value={openAdverseCount}   icon={AlertTriangle} accentColor="#B91C1C" sub="Reported or in review" loading={adverseLoading} />
      </div>

      {/* Main panels — 60 / 40 split */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Left: Recent Studies with enrollment progress bars — 3/5 */}
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
              className="flex items-center gap-1.5 text-[13px] font-semibold transition-colors cursor-pointer hover:opacity-70"
              style={{ color: 'var(--color-primary)' }}
            >
              View all <ArrowRight size={12} />
            </button>
          </div>

          {recentStudiesLoading ? <Shimmer /> : recentStudies.length === 0 ? (
            <p className="text-gray-400 text-[14px] text-center py-12">No studies found.</p>
          ) : (
            <div>
              {recentStudies.map((s) => (
                <div key={s.id} onClick={() => navigate(`/studies/${s.id}`)}>
                  <EnrollmentBar study={s} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column — 2/5 */}
        <div className="lg:col-span-2 flex flex-col gap-4">

          {/* Upcoming Visits */}
          <div
            className="bg-white rounded-xl overflow-hidden flex-1"
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
                className="flex items-center gap-1.5 text-[13px] font-semibold transition-colors cursor-pointer hover:opacity-70"
                style={{ color: 'var(--color-primary)' }}
              >
                All <ArrowRight size={12} />
              </button>
            </div>

            {upcomingVisitsLoading ? <Shimmer rows={3} /> : upcomingVisits.length === 0 ? (
              <p className="text-gray-400 text-[13px] text-center py-8">No upcoming visits.</p>
            ) : (
              <div>
                {upcomingVisits.map((v, i) => {
                  const participant = v.enrollment?.participant ?? v.participant ?? null
                  const participantName = participant
                    ? `${participant.firstName ?? ''} ${participant.lastName ?? ''}`.trim()
                    : '—'
                  const d = v.scheduledDate ? new Date(v.scheduledDate) : null

                  return (
                    <div
                      key={v.id}
                      className="flex items-center gap-3.5 px-5 py-3 transition-colors hover:bg-gray-50"
                      style={{ borderTop: i > 0 ? '1px solid var(--color-border)' : undefined }}
                    >
                      {d ? (
                        <div
                          className="w-10 h-10 rounded-lg shrink-0 flex flex-col items-center justify-center text-white"
                          style={{ background: 'var(--color-primary-mid)' }}
                        >
                          <span className="text-[9px] font-bold uppercase leading-none">
                            {d.toLocaleDateString('en-US', { month: 'short' })}
                          </span>
                          <span className="text-[16px] font-black leading-tight tabular-nums">
                            {d.getDate()}
                          </span>
                        </div>
                      ) : (
                        <div
                          className="w-10 h-10 rounded-lg shrink-0 flex items-center justify-center"
                          style={{ background: '#F3F4F6' }}
                        >
                          <CalendarCheck size={14} className="text-gray-400" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-semibold text-gray-900 truncate leading-none">{v.visitName ?? v.name ?? '—'}</p>
                        <p className="text-[12px] text-gray-400 mt-1 truncate">{participantName}</p>
                      </div>
                      {v.status && <Badge value={v.status} />}
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
                <h3 className="text-[15px] font-bold text-gray-900">Open AEs</h3>
              </div>
              <button
                onClick={() => navigate('/adverse-events')}
                className="flex items-center gap-1.5 text-[13px] font-semibold transition-colors cursor-pointer hover:opacity-70"
                style={{ color: 'var(--color-primary)' }}
              >
                All <ArrowRight size={12} />
              </button>
            </div>

            {adverseLoading ? <Shimmer rows={2} /> : openAEs.length === 0 ? (
              <p className="text-gray-400 text-[13px] text-center py-8">No open adverse events.</p>
            ) : (
              <div>
                {openAEs.map((ae, i) => (
                  <div
                    key={ae.id}
                    onClick={() => navigate('/adverse-events')}
                    className="flex items-center gap-3.5 px-5 py-3 transition-colors hover:bg-gray-50 cursor-pointer"
                    style={{ borderTop: i > 0 ? '1px solid var(--color-border)' : undefined }}
                  >
                    <div
                      className="w-2 h-10 rounded-full shrink-0"
                      style={{
                        background: ae.severity === 'SEVERE' || ae.severity === 'LIFE_THREATENING' || ae.severity === 'FATAL'
                          ? '#B91C1C'
                          : ae.severity === 'MODERATE'
                          ? '#D97706'
                          : '#6B7280',
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-gray-900 truncate leading-none">{truncate(ae.description ?? ae.eventName ?? '—', 30)}</p>
                      <p className="text-[12px] text-gray-400 mt-1">{ae.severity?.replace(/_/g, ' ') ?? '—'}</p>
                    </div>
                    <Badge value={ae.status} />
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
