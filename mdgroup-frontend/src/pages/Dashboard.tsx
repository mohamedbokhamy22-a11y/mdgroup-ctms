import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  FlaskConical, Users, CalendarCheck, CreditCard, AlertTriangle,
  ArrowRight, Clock, Activity, BarChart3
} from 'lucide-react'

import { studiesApi, participantsApi, visitsApi, paymentsApi, adverseEventsApi } from '../api/endpoints'
import StatCard from '../components/ui/StatCard'
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
    <div className="animate-pulse space-y-2 px-4 py-4">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="h-8 rounded-lg bg-slate-100" />
      ))}
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { dateFrom, dateTo } = getWeekRange()

  const { data: studiesData,        isLoading: studiesLoading }        = useQuery({ queryKey: ['dashboard-studies'],          queryFn: () => studiesApi.list({ limit: 100 }) })
  const { data: participantsData,   isLoading: participantsLoading }   = useQuery({ queryKey: ['dashboard-participants'],      queryFn: () => participantsApi.list({ limit: 1 }) })
  const { data: visitsData,         isLoading: visitsLoading }         = useQuery({ queryKey: ['dashboard-visits-week'],       queryFn: () => visitsApi.list({ dateFrom, dateTo, limit: 100 }) })
  const { data: paymentsData,       isLoading: paymentsLoading }       = useQuery({ queryKey: ['dashboard-payments-pending'],  queryFn: () => paymentsApi.list({ status: 'PENDING', limit: 100 }) })
  const { data: adverseData,        isLoading: adverseLoading }        = useQuery({ queryKey: ['dashboard-adverse-events'],    queryFn: () => adverseEventsApi.list({ limit: 100 }) })
  const { data: recentStudiesData,  isLoading: recentStudiesLoading }  = useQuery({ queryKey: ['dashboard-recent-studies'],   queryFn: () => studiesApi.list({ limit: 6, sortBy: 'createdAt', order: 'DESC' }) })
  const { data: upcomingVisitsData, isLoading: upcomingVisitsLoading } = useQuery({ queryKey: ['dashboard-upcoming-visits'],  queryFn: () => visitsApi.list({ dateFrom: new Date().toISOString().split('T')[0], limit: 6, sortBy: 'scheduledDate', order: 'ASC' }) })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allStudies: any[]     = studiesData?.data ?? []
  const activeStudiesCount    = allStudies.filter(s => s.status === 'ACTIVE').length
  const participantCount: number = participantsData?.meta?.total ?? participantsData?.data?.length ?? 0
  const visitsThisWeek        = visitsData?.data?.length ?? 0
  const pendingPayments       = paymentsData?.data?.length ?? 0
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allAdverse: any[]     = adverseData?.data ?? []
  const openAdverseCount      = allAdverse.filter(ae => ae.status === 'REPORTED' || ae.status === 'UNDER_REVIEW').length
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recentStudies: any[]  = recentStudiesData?.data ?? []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const upcomingVisits: any[] = upcomingVisitsData?.data ?? []

  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-background)' }}>

      {/* Hero banner — professional navy, no purple */}
      <div
        className="relative overflow-hidden px-6 py-5"
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 60%, #0F172A 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-16 -left-16 w-56 h-56 rounded-full" style={{ background: 'radial-gradient(circle, rgba(3,105,161,0.18) 0%, transparent 70%)' }} />
          <div className="absolute top-0 right-0 w-64 h-32" style={{ background: 'radial-gradient(ellipse at 80% 0%, rgba(30,64,175,0.12) 0%, transparent 60%)' }} />
        </div>

        <div className="relative flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 5px rgba(52,211,153,0.8)' }} />
              <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest">System Active</span>
            </div>
            <h1 className="text-[18px] font-bold text-white tracking-tight leading-none">
              {greeting}, {user?.firstName}
            </h1>
            <p className="text-slate-500 text-[12px] mt-1">
              {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => navigate('/reports')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-semibold text-slate-300 transition-all hover:text-white cursor-pointer"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <BarChart3 size={13} />
              Reports
            </button>
            <button
              onClick={() => navigate('/studies')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-semibold text-white transition-all cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #1E40AF 0%, #0369A1 100%)',
                boxShadow: '0 2px 10px rgba(30,64,175,0.35)',
              }}
            >
              <Activity size={13} />
              New Study
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 py-5 space-y-5">

        {/* KPI cards */}
        <div className="grid grid-cols-2 xl:grid-cols-5 gap-3">
          <StatCard label="Active Studies"    value={studiesLoading      ? '—' : activeStudiesCount}  icon={FlaskConical}  color="blue"  sub="Running protocols"    />
          <StatCard label="Participants"      value={participantsLoading ? '—' : participantCount}    icon={Users}         color="green" sub="Total enrolled"       trend="+12% MTD" />
          <StatCard label="Visits This Week"  value={visitsLoading       ? '—' : visitsThisWeek}      icon={CalendarCheck} color="sky"   sub={`${dateFrom} – ${dateTo}`} />
          <StatCard label="Pending Payments"  value={paymentsLoading     ? '—' : pendingPayments}     icon={CreditCard}    color="amber" sub="Awaiting approval"   />
          <StatCard label="Open AEs"          value={adverseLoading      ? '—' : openAdverseCount}    icon={AlertTriangle} color="red"   sub="Reported or in review" />
        </div>

        {/* Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Recent Studies */}
          <div
            className="overflow-hidden rounded-xl"
            style={{ background: '#FFFFFF', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-md)' }}
          >
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: '1px solid var(--color-border)' }}
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'rgba(30,64,175,0.1)' }}>
                  <FlaskConical size={12} style={{ color: '#1E40AF' }} />
                </div>
                <h2 className="text-[13px] font-bold text-slate-800">Recent Studies</h2>
              </div>
              <button
                onClick={() => navigate('/studies')}
                className="flex items-center gap-1 text-[11px] font-semibold transition-colors cursor-pointer hover:opacity-80"
                style={{ color: '#0369A1' }}
              >
                View all <ArrowRight size={11} />
              </button>
            </div>

            {recentStudiesLoading ? <Shimmer /> : recentStudies.length === 0 ? (
              <p className="text-slate-400 text-[12px] text-center py-8">No studies found.</p>
            ) : (
              <div className="divide-y divide-slate-50">
                {recentStudies.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => navigate(`/studies/${s.id}`)}
                    className="flex items-center gap-3 px-4 cursor-pointer transition-colors hover:bg-blue-50/40"
                    style={{ height: 'var(--table-row-height)', minHeight: '44px' }}
                  >
                    <div
                      className="w-6 h-6 rounded-md shrink-0 flex items-center justify-center text-[9px] font-black text-white"
                      style={{ background: 'linear-gradient(135deg, #1E40AF, #0369A1)' }}
                    >
                      {(s.phase ?? 'N/A').replace('PHASE_', 'P')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-slate-800 truncate leading-none">{truncate(s.title ?? '', 42)}</p>
                      <p className="font-mono text-[10px] text-slate-400 mt-0.5">{s.protocolNumber ?? '—'}</p>
                    </div>
                    {s.status && <Badge value={s.status} />}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Visits */}
          <div
            className="overflow-hidden rounded-xl"
            style={{ background: '#FFFFFF', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-md)' }}
          >
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: '1px solid var(--color-border)' }}
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'rgba(3,105,161,0.1)' }}>
                  <Clock size={12} style={{ color: '#0369A1' }} />
                </div>
                <h2 className="text-[13px] font-bold text-slate-800">Upcoming Visits</h2>
              </div>
              <button
                onClick={() => navigate('/visits')}
                className="flex items-center gap-1 text-[11px] font-semibold transition-colors cursor-pointer hover:opacity-80"
                style={{ color: '#0369A1' }}
              >
                View all <ArrowRight size={11} />
              </button>
            </div>

            {upcomingVisitsLoading ? <Shimmer /> : upcomingVisits.length === 0 ? (
              <p className="text-slate-400 text-[12px] text-center py-8">No upcoming visits.</p>
            ) : (
              <div className="divide-y divide-slate-50">
                {upcomingVisits.map((v) => {
                  const participant = v.enrollment?.participant ?? v.participant ?? null
                  const participantName = participant
                    ? `${participant.firstName ?? ''} ${participant.lastName ?? ''}`.trim()
                    : '—'
                  return (
                    <div
                      key={v.id}
                      className="flex items-center gap-3 px-4 transition-colors hover:bg-sky-50/40"
                      style={{ height: 'var(--table-row-height)', minHeight: '44px' }}
                    >
                      <div
                        className="w-6 h-6 rounded-md shrink-0 flex flex-col items-center justify-center text-white"
                        style={{ background: 'linear-gradient(135deg, #0369A1, #1E40AF)' }}
                      >
                        {v.scheduledDate ? (
                          <>
                            <span className="text-[7px] font-bold leading-none uppercase">
                              {new Date(v.scheduledDate).toLocaleDateString('en-US', { month: 'short' })}
                            </span>
                            <span className="font-mono text-[11px] font-bold leading-none">
                              {new Date(v.scheduledDate).getDate()}
                            </span>
                          </>
                        ) : <CalendarCheck size={11} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold text-slate-800 truncate leading-none">{v.visitName ?? v.name ?? '—'}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{participantName}</p>
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
    </div>
  )
}
