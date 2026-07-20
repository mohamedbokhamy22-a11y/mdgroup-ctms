import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Check, X } from 'lucide-react'

import { paymentsApi } from '../api/endpoints'
import Badge from '../components/ui/Badge'
import Table from '../components/ui/Table'
import PageHeader from '../components/ui/PageHeader'

// ── types ──────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Payment = Record<string, any>

// ── helpers ────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full border-2 border-blue-600 border-t-transparent w-8 h-8" />
    </div>
  )
}

const fmt = (d: string) =>
  new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

function formatAmount(amount: number, currency: string): string {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    CHF: 'CHF',
  }
  const symbol = symbols[currency] ?? currency
  return `${symbol} ${Number(amount).toFixed(2)}`
}

function truncate(str: string, max: number): string {
  return str && str.length > max ? str.slice(0, max) + '…' : str ?? ''
}

const STATUS_OPTIONS = ['All', 'PENDING', 'APPROVED', 'PROCESSING', 'PAID', 'REJECTED']
const TYPE_OPTIONS   = ['All', 'STIPEND', 'TRAVEL_REIMBURSEMENT', 'MEAL_ALLOWANCE', 'ACCOMMODATION', 'OTHER_EXPENSE']

// ── summary card ───────────────────────────────────────────────────────────

interface SummaryCardProps {
  label: string
  amount: number
  currency?: string
  accent: string
}

function SummaryCard({ label, amount, accent }: SummaryCardProps) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 p-4 flex flex-col gap-1 ${accent}`}>
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
      <span className="text-2xl font-bold text-slate-800">$ {amount.toFixed(2)}</span>
    </div>
  )
}

// ── component ──────────────────────────────────────────────────────────────

export default function Payments() {
  const queryClient                     = useQueryClient()
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [typeFilter, setTypeFilter]     = useState<string>('All')

  const { data, isLoading } = useQuery({
    queryKey: ['payments'],
    queryFn:  () => paymentsApi.list({ limit: 100 }),
  })

  const approveMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'APPROVED' | 'REJECTED' }) =>
      paymentsApi.approve(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
    },
  })

  const allPayments: Payment[] = data?.data ?? []

  const filtered: Payment[] = allPayments.filter((p) => {
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter
    const matchesType   = typeFilter   === 'All' || p.paymentType === typeFilter
    return matchesStatus && matchesType
  })

  // Summary totals (across all payments, not just filtered)
  const totalPaid: number = allPayments
    .filter((p) => p.status === 'PAID')
    .reduce((sum: number, p) => sum + Number(p.amount ?? 0), 0)

  const totalPending: number = allPayments
    .filter((p) => p.status === 'PENDING')
    .reduce((sum: number, p) => sum + Number(p.amount ?? 0), 0)

  const totalProcessing: number = allPayments
    .filter((p) => p.status === 'PROCESSING')
    .reduce((sum: number, p) => sum + Number(p.amount ?? 0), 0)

  const columns = [
    {
      header: 'Participant',
      cell:   (p: Payment) => {
        const participant = p.participant
        if (participant) {
          return <span className="text-slate-800">{participant.firstName} {participant.lastName}</span>
        }
        const createdBy = p.createdBy
        if (createdBy) {
          return <span className="text-slate-800">{createdBy.firstName ?? ''} {createdBy.lastName ?? ''}</span>
        }
        return <span className="text-slate-400 text-xs">—</span>
      },
    },
    {
      header: 'Type',
      width:  '170px',
      cell:   (p: Payment) =>
        p.paymentType ? <Badge value={p.paymentType} /> : <span className="text-slate-400 text-xs">—</span>,
    },
    {
      header: 'Amount',
      width:  '120px',
      cell:   (p: Payment) => (
        <span className="font-semibold text-slate-800 tabular-nums">
          {p.amount != null ? formatAmount(Number(p.amount), p.currency ?? 'USD') : '—'}
        </span>
      ),
    },
    {
      header: 'Status',
      width:  '120px',
      cell:   (p: Payment) =>
        p.status ? <Badge value={p.status} /> : <span className="text-slate-400 text-xs">—</span>,
    },
    {
      header: 'Description',
      cell:   (p: Payment) => (
        <span className="text-slate-600 text-sm">{truncate(p.description ?? '', 40)}</span>
      ),
    },
    {
      header: 'Date',
      width:  '130px',
      cell:   (p: Payment) =>
        p.createdAt ? (
          <span className="text-slate-500 text-sm">{fmt(p.createdAt)}</span>
        ) : (
          <span className="text-slate-400 text-xs">—</span>
        ),
    },
    {
      header: 'Actions',
      width:  '90px',
      cell:   (p: Payment) => {
        if (p.status !== 'PENDING') return null
        const isLoading = approveMutation.isPending && approveMutation.variables?.id === p.id
        return (
          <div className="flex items-center gap-1">
            <button
              disabled={isLoading}
              onClick={(e) => {
                e.stopPropagation()
                approveMutation.mutate({ id: p.id, status: 'APPROVED' })
              }}
              title="Approve"
              className="p-1.5 rounded-md text-green-600 hover:bg-green-50 disabled:opacity-40 transition-colors"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              disabled={isLoading}
              onClick={(e) => {
                e.stopPropagation()
                approveMutation.mutate({ id: p.id, status: 'REJECTED' })
              }}
              title="Reject"
              className="p-1.5 rounded-md text-red-600 hover:bg-red-50 disabled:opacity-40 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )
      },
    },
  ]

  return (
    <div className="min-h-screen" style={{ background: '#f1f5f9' }}>
      <div className="px-8 pt-8 pb-10 space-y-6">
        <PageHeader
          title="Payments"
          subtitle="Stipends, reimbursements and expense claims"
          action={
            <span className="text-sm text-slate-500">
              {filtered.length} payment{filtered.length !== 1 ? 's' : ''}
            </span>
          }
        />
        {/* ── summary cards ── */}
        <div className="grid grid-cols-3 gap-4">
          <SummaryCard label="Total Paid"      amount={totalPaid}       accent="border-l-4 border-l-green-400" />
          <SummaryCard label="Pending Amount"  amount={totalPending}    accent="border-l-4 border-l-yellow-400" />
          <SummaryCard label="Processing"      amount={totalProcessing} accent="border-l-4 border-l-purple-400" />
        </div>

        {/* ── filters ── */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 pl-3 pr-8 text-sm border border-slate-200 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-700"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s === 'All' ? 'All Statuses' : s.replace(/_/g, ' ')}
              </option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="py-2 pl-3 pr-8 text-sm border border-slate-200 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-700"
          >
            {TYPE_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t === 'All' ? 'All Types' : t.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>

        {/* ── table ── */}
        {isLoading ? (
          <Spinner />
        ) : (
          <Table<Payment>
            columns={columns}
            data={filtered}
            emptyMessage="No payments match your filters."
          />
        )}
      </div>
    </div>
  )
}
