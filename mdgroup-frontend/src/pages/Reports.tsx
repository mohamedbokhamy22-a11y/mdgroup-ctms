import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { studiesApi, participantsApi, visitsApi, paymentsApi, adverseEventsApi, enrollmentsApi } from '../api/endpoints'
import PageHeader from '../components/ui/PageHeader'
import { Download, TrendingUp, Users, DollarSign, AlertTriangle, CalendarCheck } from 'lucide-react'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']


function SectionCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <div className="mb-5">
        <h3 className="text-base font-bold text-slate-800">{title}</h3>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

function KpiPill({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: React.FC<{size?: number; className?: string}>; color: string }) {
  return (
    <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
      <div className={`flex items-center justify-center w-9 h-9 rounded-xl ${color}`}>
        <Icon size={16} className="text-white" />
      </div>
      <div>
        <p className="text-xs text-slate-400 font-medium">{label}</p>
        <p className="text-lg font-extrabold text-slate-800">{value}</p>
      </div>
    </div>
  )
}

export default function Reports() {
  const [exportMsg, setExportMsg] = useState('')

  const { data: studiesData } = useQuery({ queryKey: ['reports-studies'], queryFn: () => studiesApi.list({ limit: 100 }) })
  const { data: participantsData } = useQuery({ queryKey: ['reports-participants'], queryFn: () => participantsApi.list({ limit: 100 }) })
  const { data: visitsData } = useQuery({ queryKey: ['reports-visits'], queryFn: () => visitsApi.list({ limit: 100 }) })
  const { data: paymentsData } = useQuery({ queryKey: ['reports-payments'], queryFn: () => paymentsApi.list({ limit: 100 }) })
  const { data: aeData } = useQuery({ queryKey: ['reports-ae'], queryFn: () => adverseEventsApi.list({ limit: 100 }) })
  const { data: enrollmentsData } = useQuery({ queryKey: ['reports-enrollments'], queryFn: () => enrollmentsApi.list({ limit: 100 }) })

  const studies = studiesData?.data ?? []
  const participants = participantsData?.data ?? []
  const visits = visitsData?.data ?? []
  const payments = paymentsData?.data ?? []
  const aes = aeData?.data ?? []
  const enrollments = enrollmentsData?.data ?? []

  // Studies by phase
  const byPhase = ['PHASE_1','PHASE_2','PHASE_3','PHASE_4','OBSERVATIONAL'].map(p => ({
    name: p.replace('_', ' '),
    count: studies.filter((s: { phase: string }) => s.phase === p).length
  })).filter(x => x.count > 0)

  // Studies by status
  const byStatus = ['DRAFT','ACTIVE','ON_HOLD','COMPLETED','TERMINATED'].map(s => ({
    name: s.replace('_', ' '),
    value: studies.filter((st: { status: string }) => st.status === s).length
  })).filter(x => x.value > 0)

  // Visit status breakdown
  const visitByStatus = ['SCHEDULED','IN_PROGRESS','COMPLETED','MISSED','CANCELLED'].map(s => ({
    name: s.replace('_', ' '),
    count: visits.filter((v: { status: string }) => v.status === s).length
  })).filter(x => x.count > 0)

  // Visit type breakdown
  const visitByType = ['SITE_BASED','HOME_VISIT','TELEHEALTH','REMOTE_MONITORING'].map(t => ({
    name: t.replace(/_/g, ' '),
    value: visits.filter((v: { visitType: string }) => v.visitType === t).length
  })).filter(x => x.value > 0)

  // Payment totals
  const totalPaid = payments.filter((p: { status: string }) => p.status === 'PAID').reduce((sum: number, p: { amount: number }) => sum + p.amount, 0)
  const totalPending = payments.filter((p: { status: string }) => p.status === 'PENDING').reduce((sum: number, p: { amount: number }) => sum + p.amount, 0)
  const payByType = ['STIPEND','TRAVEL_REIMBURSEMENT','MEAL_ALLOWANCE','ACCOMMODATION','OTHER_EXPENSE'].map(t => ({
    name: t.replace(/_/g, ' ').replace('REIMBURSEMENT', 'REIMB.'),
    amount: payments.filter((p: { paymentType: string }) => p.paymentType === t).reduce((s: number, p: { amount: number }) => s + p.amount, 0)
  })).filter(x => x.amount > 0)

  // Adverse events by severity
  const aeBySeverity = ['MILD','MODERATE','SEVERE','LIFE_THREATENING','FATAL'].map(s => ({
    name: s.replace('_', ' '),
    value: aes.filter((a: { severity: string }) => a.severity === s).length
  })).filter(x => x.value > 0)

  // Enrollment status
  const enrollByStatus = ['SCREENING','ENROLLED','ACTIVE','COMPLETED','WITHDRAWN','SCREEN_FAILED'].map(s => ({
    name: s.replace('_', ' '),
    count: enrollments.filter((e: { status: string }) => e.status === s).length
  })).filter(x => x.count > 0)

  const exportCSV = (data: object[], filename: string) => {
    if (!data.length) return
    const headers = Object.keys(data[0])
    const rows = data.map(row => headers.map(h => (row as Record<string,unknown>)[h]).join(','))
    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `${filename}.csv`; a.click()
    URL.revokeObjectURL(url)
    setExportMsg(`${filename}.csv downloaded`)
    setTimeout(() => setExportMsg(''), 3000)
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Reports"
          subtitle="Central reporting platform — aggregated data from all modules"
        />
        <div className="flex items-center gap-2">
          {exportMsg && <span className="text-xs text-emerald-600 font-medium">{exportMsg}</span>}
        </div>
      </div>

      {/* KPI Summary Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <KpiPill label="Total Studies"      value={studies.length}      icon={TrendingUp}    color="bg-blue-500" />
        <KpiPill label="Participants"        value={participants.length}  icon={Users}         color="bg-emerald-500" />
        <KpiPill label="Total Visits"        value={visits.length}        icon={CalendarCheck} color="bg-purple-500" />
        <KpiPill label="Paid Out"            value={`$${totalPaid.toLocaleString()}`} icon={DollarSign} color="bg-orange-500" />
        <KpiPill label="Adverse Events"      value={aes.length}           icon={AlertTriangle} color="bg-red-500" />
      </div>

      {/* Row 1: Studies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Studies by Phase" subtitle="Distribution across trial phases">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={byPhase} barSize={36}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }} />
              <Bar dataKey="count" fill="#3b82f6" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Study Status" subtitle="Active vs completed vs other">
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="55%" height={220}>
              <PieChart>
                <Pie data={byStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} innerRadius={45} paddingAngle={3}>
                  {byStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {byStatus.map((s, i) => (
                <div key={s.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-xs text-slate-500">{s.name}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-700">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Row 2: Enrollments & Visits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Enrollment Pipeline" subtitle="Participants by enrollment status">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={enrollByStatus} layout="vertical" barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={90} />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }} />
              <Bar dataKey="count" fill="#10b981" radius={[0,6,6,0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Visit Completion" subtitle="Visit outcomes across all studies">
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="55%" height={220}>
              <PieChart>
                <Pie data={visitByStatus} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={85} innerRadius={45} paddingAngle={3}>
                  {visitByStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {visitByStatus.map((v, i) => (
                <div key={v.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-xs text-slate-500">{v.name}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-700">{v.count}</span>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Row 3: Payments & Adverse Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Payment Breakdown by Type" subtitle={`$${totalPaid.toLocaleString()} paid · $${totalPending.toLocaleString()} pending`}>
          <div className="flex items-center justify-end mb-3">
            <button onClick={() => exportCSV(payByType, 'payments-by-type')}
              className="flex items-center gap-1.5 text-xs text-blue-600 font-medium hover:text-blue-700 transition-colors">
              <Download size={12} /> Export CSV
            </button>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={payByType} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => [`$${Number(v).toLocaleString()}`, 'Amount']} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }} />
              <Bar dataKey="amount" fill="#f59e0b" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Adverse Events by Severity" subtitle="Safety profile across all active studies">
          <div className="flex items-center justify-end mb-3">
            <button onClick={() => exportCSV(aeBySeverity, 'adverse-events-severity')}
              className="flex items-center gap-1.5 text-xs text-blue-600 font-medium hover:text-blue-700 transition-colors">
              <Download size={12} /> Export CSV
            </button>
          </div>
          {aeBySeverity.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-slate-300 text-sm">No adverse events recorded</div>
          ) : (
            <div className="space-y-3">
              {aeBySeverity.map((a, i) => {
                const pct = Math.round((a.value / aes.length) * 100)
                const barColors = ['bg-yellow-400','bg-orange-400','bg-red-400','bg-red-600','bg-red-900']
                return (
                  <div key={a.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-slate-600">{a.name}</span>
                      <span className="text-xs font-bold text-slate-700">{a.value} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${barColors[i]}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </SectionCard>
      </div>

      {/* Row 4: Visit Types & Data Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Visit Types" subtitle="Decentralized vs site-based delivery model">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={visitByType} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={4}
                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                labelLine={false}>
                {visitByType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Studies Summary Table" subtitle="All studies with key metrics">
          <div className="flex items-center justify-end mb-3">
            <button onClick={() => exportCSV(studies.map((s: { protocolNumber: string; title: string; phase: string; status: string; targetEnrollment: number }) => ({
              Protocol: s.protocolNumber, Title: s.title, Phase: s.phase, Status: s.status, 'Target Enrollment': s.targetEnrollment
            })), 'studies-summary')}
              className="flex items-center gap-1.5 text-xs text-blue-600 font-medium hover:text-blue-700 transition-colors">
              <Download size={12} /> Export CSV
            </button>
          </div>
          <div className="overflow-auto max-h-52">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-2 px-2 text-slate-400 font-semibold uppercase tracking-wide text-[10px]">Protocol</th>
                  <th className="text-left py-2 px-2 text-slate-400 font-semibold uppercase tracking-wide text-[10px]">Phase</th>
                  <th className="text-left py-2 px-2 text-slate-400 font-semibold uppercase tracking-wide text-[10px]">Status</th>
                  <th className="text-right py-2 px-2 text-slate-400 font-semibold uppercase tracking-wide text-[10px]">Target</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {studies.map((s: { id: string; protocolNumber: string; phase: string; status: string; targetEnrollment: number }) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="py-2 px-2 font-mono text-slate-700">{s.protocolNumber}</td>
                    <td className="py-2 px-2 text-slate-500">{s.phase.replace('_', ' ')}</td>
                    <td className="py-2 px-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${s.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-right font-semibold text-slate-700">{s.targetEnrollment}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
