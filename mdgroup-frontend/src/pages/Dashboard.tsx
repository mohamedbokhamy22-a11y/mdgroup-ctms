import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  FlaskConical, Users, CalendarCheck, CreditCard, AlertTriangle,
  ArrowRight, Clock, Activity
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

function Shimmer() {
  return (
    <div className="animate-pulse space-y-3 p-4">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="h-10 rounded-lg bg-gray-100" />
      ))}
    </div>
  )
}

interface StatCardProps {
  label: string
  value: string | number
  icon: React.FC<{ size?: number; className?: string }>
  color: string
  sub: string
}

function StatCard({ label, value, icon: Icon, color, sub }: StatCardProps) {
  return (
    <div
      className="bg-white rounded-xl p-5 flex items-start gap-4"
      style={{ border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}
    >
      <div
        className="flex items-center justify-center w-11 h-11 rounded-lg shrink-0"
        style={{ background: color + '15' }}
      >
        <Icon size={20} style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-gray-900 leading-none">{value}</p>
        <p className="text-[13px] font-medium text-gray-700 mt-1">{label}</p>
        <p className="text-[12px] text-gray-400 mt-0.5">{sub}</p>
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
  const { data: recentStudiesData,  isLoading: recentStudiesLoading }  = useQuery({ queryKey: ['dashboard-recent-studies'],  queryFn: () => studiesApi.list({ limit: 5, sortBy: 'createdAt', order: 'DESC' }) })
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

  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="p-6 space-y-6" style={{ background: 'var(--color-background)' }}>

      {/* Welcome bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{greeting}, {user?.firstName}</h2>
          <p className="text-[13px] text-gray-500 mt-0.5">
            {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/reports')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium text-gray-600 bg-white transition-colors hover:bg-gray-50 cursor-pointer"
            style={{ border: '1px solid var(--color-border)' }}
          >
            Reports
          </button>
          <button
            onClick={() => navigate('/studies')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium text-white cursor-pointer transition-opacity hover:opacity-90"
            style={{ background: 'var(--color-primary)' }}
          >
            <Activity size={14} />
            New Study
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
        <StatCard label="Active Studies"   value={studiesLoading      ? '—' : activeStudiesCount} icon={FlaskConical}  color="#003087" sub="Running protocols" />
        <StatCard label="Participants"     value={participantsLoading ? '—' : participantCount}   icon={Users}         color="#16a34a" sub="Total enrolled" />
        <StatCard label="Visits This Week" value={visitsLoading       ? '—' : visitsThisWeek}     icon={CalendarCheck} color="#0369a1" sub={`${dateFrom} – ${dateTo}`} />
        <StatCard label="Pending Payments" value={paymentsLoading     ? '—' : pendingPayments}    icon={CreditCard}    color="#d97706" sub="Awaiting approval" />
        <StatCard label="Open AEs"         value={adverseLoading      ? '—' : openAdverseCount}   icon={AlertTriangle} color="#dc2626" sub="Reported or in review" />
      </div>

      {/* Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Recent Studies */}
        <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
            <div className="flex items-center gap-2.5">
              <FlaskConical size={15} className="text-gray-400" />
              <h3 className="text-[14px] font-semibold text-gray-900">Recent Studies</h3>
            </div>
            <button
              onClick={() => navigate('/studies')}
              className="flex items-center gap-1 text-[12px] font-medium transition-colors cursor-pointer hover:opacity-70"
              style={{ color: 'var(--color-primary)' }}
            >
              View all <ArrowRight size={12} />
            </button>
          </div>

          {recentStudiesLoading ? <Shimmer /> : recentStudies.length === 0 ? (
            <p className="text-gray-400 text-[13px] text-center py-10">No studies found.</p>
          ) : (
            <div>
              {recentStudies.map((s, i) => (
                <div
                  key={s.id}
                  onClick={() => navigate(`/studies/${s.id}`)}
                  className="flex items-center gap-4 px-5 cursor-pointer transition-colors hover:bg-gray-50"
                  style={{
                    height: '56px',
                    borderTop: i > 0 ? '1px solid var(--color-border)' : undefined,
                  }}
                >
                  <div
                    className="w-7 h-7 rounded-md shrink-0 flex items-center justify-center text-[10px] font-bold text-white"
                    style={{ background: 'var(--color-primary)' }}
                  >
                    {(s.phase ?? 'N/A').replace('PHASE_', 'P')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-gray-900 truncate">{truncate(s.title ?? '', 40)}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{s.protocolNumber ?? '—'}</p>
                  </div>
                  {s.status && <Badge value={s.status} />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Visits */}
        <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
            <div className="flex items-center gap-2.5">
              <Clock size={15} className="text-gray-400" />
              <h3 className="text-[14px] font-semibold text-gray-900">Upcoming Visits</h3>
            </div>
            <button
              onClick={() => navigate('/visits')}
              className="flex items-center gap-1 text-[12px] font-medium transition-colors cursor-pointer hover:opacity-70"
              style={{ color: 'var(--color-primary)' }}
            >
              View all <ArrowRight size={12} />
            </button>
          </div>

          {upcomingVisitsLoading ? <Shimmer /> : upcomingVisits.length === 0 ? (
            <p className="text-gray-400 text-[13px] text-center py-10">No upcoming visits.</p>
          ) : (
            <div>
              {upcomingVisits.map((v, i) => {
                const participant = v.enrollment?.participant ?? v.participant ?? null
                const participantName = participant
                  ? `${participant.firstName ?? ''} ${participant.lastName ?? ''}`.trim()
                  : '—'
                return (
                  <div
                    key={v.id}
                    className="flex items-center gap-4 px-5 transition-colors hover:bg-gray-50"
                    style={{
                      height: '56px',
                      borderTop: i > 0 ? '1px solid var(--color-border)' : undefined,
                    }}
                  >
                    <div
                      className="w-7 h-7 rounded-md shrink-0 flex flex-col items-center justify-center text-white"
                      style={{ background: 'var(--color-primary-mid)' }}
                    >
                      {v.scheduledDate ? (
                        <>
                          <span className="text-[7px] font-bold leading-none uppercase">
                            {new Date(v.scheduledDate).toLocaleDateString('en-US', { month: 'short' })}
                          </span>
                          <span className="text-[11px] font-bold leading-none">
                            {new Date(v.scheduledDate).getDate()}
                          </span>
                        </>
                      ) : <CalendarCheck size={11} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-gray-900 truncate">{v.visitName ?? v.name ?? '—'}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5 truncate">{participantName}</p>
                    </div>
                    {v.status && <Badge value={v.status} />}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
