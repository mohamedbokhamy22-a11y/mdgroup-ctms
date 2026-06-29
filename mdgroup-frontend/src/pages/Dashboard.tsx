import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  FlaskConical,
  Users,
  CalendarCheck,
  CreditCard,
  AlertTriangle,
} from 'lucide-react'

import { studiesApi, participantsApi, visitsApi, paymentsApi, adverseEventsApi } from '../api/endpoints'
import StatCard from '../components/ui/StatCard'
import PageHeader from '../components/ui/PageHeader'
import Badge from '../components/ui/Badge'

// ── helpers ────────────────────────────────────────────────────────────────

function getWeekRange() {
  const now = new Date()
  const day = now.getDay() // 0 = Sun
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

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function truncate(str: string, max: number) {
  return str.length > max ? str.slice(0, max) + '…' : str
}

function Spinner() {
  return (
    <div className="flex items-center justify-center py-10">
      <div className="w-7 h-7 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
    </div>
  )
}

// ── component ──────────────────────────────────────────────────────────────

export default function Dashboard() {
  const navigate = useNavigate()
  const { dateFrom, dateTo } = getWeekRange()

  // ── queries ──────────────────────────────────────────────────────────────

  const { data: studiesData, isLoading: studiesLoading } = useQuery({
    queryKey: ['dashboard-studies'],
    queryFn: () => studiesApi.list({ limit: 100 }),
  })

  const { data: participantsData, isLoading: participantsLoading } = useQuery({
    queryKey: ['dashboard-participants'],
    queryFn: () => participantsApi.list({ limit: 1 }),
  })

  const { data: visitsData, isLoading: visitsLoading } = useQuery({
    queryKey: ['dashboard-visits-week'],
    queryFn: () => visitsApi.list({ dateFrom, dateTo, limit: 100 }),
  })

  const { data: paymentsData, isLoading: paymentsLoading } = useQuery({
    queryKey: ['dashboard-payments-pending'],
    queryFn: () => paymentsApi.list({ status: 'PENDING', limit: 100 }),
  })

  const { data: adverseData, isLoading: adverseLoading } = useQuery({
    queryKey: ['dashboard-adverse-events'],
    queryFn: () => adverseEventsApi.list({ limit: 100 }),
  })

  const { data: recentStudiesData, isLoading: recentStudiesLoading } = useQuery({
    queryKey: ['dashboard-recent-studies'],
    queryFn: () => studiesApi.list({ limit: 5, sortBy: 'createdAt', order: 'DESC' }),
  })

  const { data: upcomingVisitsData, isLoading: upcomingVisitsLoading } = useQuery({
    queryKey: ['dashboard-upcoming-visits'],
    queryFn: () =>
      visitsApi.list({
        dateFrom: new Date().toISOString().split('T')[0],
        limit: 5,
        sortBy: 'scheduledDate',
        order: 'ASC',
      }),
  })

  // ── derived counts ────────────────────────────────────────────────────────

  const allStudies: Record<string, unknown>[] = studiesData?.data ?? []
  const activeStudiesCount = allStudies.filter(
    (s) => (s as { status: string }).status === 'ACTIVE'
  ).length

  const participantCount: number =
    participantsData?.meta?.total ?? participantsData?.data?.length ?? 0

  const visitsThisWeek: number = visitsData?.data?.length ?? 0

  const pendingPayments: number = paymentsData?.data?.length ?? 0

  const allAdverse: Record<string, unknown>[] = adverseData?.data ?? []
  const openAdverseCount = allAdverse.filter((ae) => {
    const status = (ae as { status: string }).status
    return status === 'REPORTED' || status === 'UNDER_REVIEW'
  }).length

  const recentStudies: Record<string, unknown>[] = recentStudiesData?.data ?? []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const upcomingVisits: any[] = upcomingVisitsData?.data ?? []

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Dashboard"
        subtitle="MDGroup Clinical Trial Operations Overview"
      />

      <div className="px-8 pb-10 space-y-8">

        {/* ── KPI row ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
          <StatCard
            label="Active Studies"
            value={studiesLoading ? '—' : activeStudiesCount}
            icon={FlaskConical}
            color="blue"
            sub="Currently running protocols"
          />
          <StatCard
            label="Participants"
            value={participantsLoading ? '—' : participantCount}
            icon={Users}
            color="green"
            sub="Total enrolled"
          />
          <StatCard
            label="Visits This Week"
            value={visitsLoading ? '—' : visitsThisWeek}
            icon={CalendarCheck}
            color="purple"
            sub={`${dateFrom} – ${dateTo}`}
          />
          <StatCard
            label="Pending Payments"
            value={paymentsLoading ? '—' : pendingPayments}
            icon={CreditCard}
            color="orange"
            sub="Awaiting approval"
          />
          <StatCard
            label="Open Adverse Events"
            value={adverseLoading ? '—' : openAdverseCount}
            icon={AlertTriangle}
            color="red"
            sub="Reported or under review"
          />
        </div>

        {/* ── Lower panels ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Recent Studies */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-800">Recent Studies</h2>
              <button
                onClick={() => navigate('/studies')}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium transition"
              >
                View all
              </button>
            </div>

            {recentStudiesLoading ? (
              <Spinner />
            ) : recentStudies.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-10">No studies found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-left">
                      <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Protocol
                      </th>
                      <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Title
                      </th>
                      <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Phase
                      </th>
                      <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Status
                      </th>
                      <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Sponsor
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentStudies.map((study) => {
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      const s = study as any
                      return (
                        <tr
                          key={s.id}
                          onClick={() => navigate(`/studies/${s.id}`)}
                          className="hover:bg-slate-50 cursor-pointer transition"
                        >
                          <td className="px-5 py-3 font-mono text-xs text-slate-600 whitespace-nowrap">
                            {s.protocolNumber ?? '—'}
                          </td>
                          <td className="px-5 py-3 text-slate-800 max-w-[180px]">
                            {truncate(s.title ?? '', 40)}
                          </td>
                          <td className="px-5 py-3 whitespace-nowrap">
                            {s.phase ? <Badge value={s.phase} /> : <span className="text-slate-400">—</span>}
                          </td>
                          <td className="px-5 py-3 whitespace-nowrap">
                            {s.status ? <Badge value={s.status} /> : <span className="text-slate-400">—</span>}
                          </td>
                          <td className="px-5 py-3 text-slate-600 whitespace-nowrap">
                            {s.sponsor?.name ?? s.sponsorName ?? '—'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Upcoming Visits */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-800">Upcoming Visits</h2>
              <button
                onClick={() => navigate('/visits')}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium transition"
              >
                View all
              </button>
            </div>

            {upcomingVisitsLoading ? (
              <Spinner />
            ) : upcomingVisits.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-10">No upcoming visits.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-left">
                      <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Visit
                      </th>
                      <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Type
                      </th>
                      <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Date
                      </th>
                      <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Status
                      </th>
                      <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Participant
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {upcomingVisits.map((visit) => {
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      const v = visit as any
                      const participant =
                        v.enrollment?.participant ?? v.participant ?? null
                      const participantName = participant
                        ? `${participant.firstName ?? ''} ${participant.lastName ?? ''}`.trim()
                        : '—'
                      return (
                        <tr key={v.id} className="hover:bg-slate-50 transition">
                          <td className="px-5 py-3 text-slate-800 font-medium whitespace-nowrap">
                            {v.visitName ?? v.name ?? '—'}
                          </td>
                          <td className="px-5 py-3 whitespace-nowrap">
                            {v.visitType ? (
                              <Badge value={v.visitType} />
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                          <td className="px-5 py-3 text-slate-600 whitespace-nowrap">
                            {v.scheduledDate ? formatDate(v.scheduledDate) : '—'}
                          </td>
                          <td className="px-5 py-3 whitespace-nowrap">
                            {v.status ? (
                              <Badge value={v.status} />
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                          <td className="px-5 py-3 text-slate-600 whitespace-nowrap">
                            {participantName}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
