import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Check, X, CreditCard } from 'lucide-react'

import { paymentsApi } from '../api/endpoints'
import Badge from '../components/ui/Badge'
import Table from '../components/ui/Table'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Payment = Record<string, any>

function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="animate-spin rounded-full border-2 border-blue-600 border-t-transparent w-6 h-6" />
    </div>
  )
}

const fmt = (d: string) =>
  new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

function formatAmount(amount: number, currency: string): string {
  const symbols: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', CHF: 'CHF' }
  return `${symbols[currency] ?? currency} ${Number(amount).toFixed(2)}`
}

function truncate(str: string, max: number): string {
  return str && str.length > max ? str.slice(0, max) + '…' : str ?? ''
}

const STATUS_OPTIONS = ['All', 'PENDING', 'APPROVED', 'PROCESSING', 'PAID', 'REJECTED']
const TYPE_OPTIONS   = ['All', 'STIPEND', 'TRAVEL_REIMBURSEMENT', 'MEAL_ALLOWANCE', 'ACCOMMODATION', 'OTHER_EXPENSE']

interface SummaryCardProps {
  label: string
  amount: number
  accent: string
}

function SummaryCard({ label, amount, accent }: SummaryCardProps) {
  return (
    <div
      className={`bg-white rounded-xl p-4 flex flex-col gap-1 ${accent}`}
      style={{ border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}
    >
      <span className="text-[17px] font-semibold text-gray-400 uppercase tracking-wider">{label}</span>
      <span className="text-[24px] font-bold text-gray-800">$ {amount.toFixed(2)}</span>
    </div>
  )
}

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
          return <span className="text-gray-800 font-medium">{participant.firstName} {participant.lastName}</span>
        }
        const createdBy = p.createdBy
        if (createdBy) {
          return <span className="text-gray-800 font-medium">{createdBy.firstName ?? ''} {createdBy.lastName ?? ''}</span>
        }
        return <span className="text-gray-400 text-xs">—</span>
      },
    },
    {
      header: 'Type',
      width:  '175px',
      cell:   (p: Payment) =>
        p.paymentType ? <Badge value={p.paymentType} /> : <span className="text-gray-400 text-xs">—</span>,
    },
    {
      header: 'Amount',
      width:  '120px',
      cell:   (p: Payment) => (
        <span className="font-semibold text-gray-800 tabular-nums">
          {p.amount != null ? formatAmount(Number(p.amount), p.currency ?? 'USD') : '—'}
        </span>
      ),
    },
    {
      header: 'Status',
      width:  '120px',
      cell:   (p: Payment) =>
        p.status ? <Badge value={p.status} /> : <span className="text-gray-400 text-xs">—</span>,
    },
    {
      header: 'Description',
      cell:   (p: Payment) => (
        <span className="text-gray-600">{truncate(p.description ?? '', 40)}</span>
      ),
    },
    {
      header: 'Date',
      width:  '130px',
      cell:   (p: Payment) =>
        p.createdAt ? (
          <span className="text-gray-500">{fmt(p.createdAt)}</span>
        ) : (
          <span className="text-gray-400 text-xs">—</span>
        ),
    },
    {
      header: 'Actions',
      width:  '90px',
      cell:   (p: Payment) => {
        if (p.status !== 'PENDING') return null
        const pending = approveMutation.isPending && approveMutation.variables?.id === p.id
        return (
          <div className="flex items-center gap-1">
            <button
              disabled={pending}
              onClick={(e) => {
                e.stopPropagation()
                approveMutation.mutate({ id: p.id, status: 'APPROVED' })
              }}
              title="Approve"
              className="p-1.5 rounded-md text-green-600 hover:bg-green-50 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              disabled={pending}
              onClick={(e) => {
                e.stopPropagation()
                approveMutation.mutate({ id: p.id, status: 'REJECTED' })
              }}
              title="Reject"
              className="p-1.5 rounded-md text-red-600 hover:bg-red-50 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )
      },
    },
  ]

  return (
    <div className="p-6 space-y-5" style={{ background: 'var(--color-background)' }}>

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[24px] font-bold text-gray-900">Payments</h2>
          <p className="text-[17px] text-gray-500 mt-0.5">Stipends, reimbursements and expense claims</p>
        </div>
        <div className="flex items-center gap-2 text-[17px] font-medium text-gray-500 px-3 py-1.5 rounded-lg bg-white" style={{ border: '1px solid var(--color-border)' }}>
          <CreditCard size={13} className="text-gray-400" />
          {filtered.length} {filtered.length === 1 ? 'payment' : 'payments'}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <SummaryCard label="Total Paid"     amount={totalPaid}       accent="border-l-4 border-l-green-400" />
        <SummaryCard label="Pending Amount" amount={totalPending}    accent="border-l-4 border-l-yellow-400" />
        <SummaryCard label="Processing"     amount={totalProcessing} accent="border-l-4 border-l-purple-400" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="py-2.5 pl-3 pr-8 text-[17px] border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s.replace(/_/g, ' ')}</option>
          ))}
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="py-2.5 pl-3 pr-8 text-[17px] border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
        >
          {TYPE_OPTIONS.map((t) => (
            <option key={t} value={t}>{t === 'All' ? 'All Types' : t.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>

      {/* Table */}
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
  )
}
