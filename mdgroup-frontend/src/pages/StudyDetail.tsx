import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, FlaskConical, Users, Calendar } from 'lucide-react'

import { studiesApi, enrollmentsApi } from '../api/endpoints'
import Badge from '../components/ui/Badge'
import Table from '../components/ui/Table'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Enrollment = Record<string, any>

function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="animate-spin rounded-full border-2 border-blue-600 border-t-transparent w-6 h-6" />
    </div>
  )
}

function formatDate(value: string | null | undefined): string {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <div className="text-[13.5px] text-gray-800 font-medium leading-snug">{children}</div>
    </div>
  )
}

export default function StudyDetail() {
  const { id } = useParams<{ id: string }>()

  const { data: study, isLoading: studyLoading } = useQuery({
    queryKey: ['study', id],
    queryFn:  () => studiesApi.get(id!),
    enabled:  !!id,
  })

  const { data: enrollmentsData, isLoading: enrollmentsLoading } = useQuery({
    queryKey: ['study-enrollments', id],
    queryFn:  () => enrollmentsApi.list({ studyId: id, limit: 50 }),
    enabled:  !!id,
  })

  const enrollments: Enrollment[] = enrollmentsData?.data ?? []

  const enrollmentColumns = [
    {
      header: 'Subject #',
      width:  '120px',
      cell:   (e: Enrollment) => (
        <span className="font-mono text-xs text-gray-600">{e.subjectNumber ?? e.subjectId ?? '—'}</span>
      ),
    },
    {
      header: 'Participant',
      cell:   (e: Enrollment) => {
        const p = e.participant
        if (!p) return <span className="text-gray-400">—</span>
        return <span className="text-gray-800">{[p.firstName, p.lastName].filter(Boolean).join(' ') || '—'}</span>
      },
    },
    {
      header: 'Site',
      width:  '160px',
      cell:   (e: Enrollment) => <span className="text-gray-600">{e.site?.name ?? '—'}</span>,
    },
    {
      header: 'Status',
      width:  '130px',
      cell:   (e: Enrollment) => e.status ? <Badge value={e.status} /> : <span className="text-gray-400 text-xs">—</span>,
    },
    {
      header: 'Enrolled',
      width:  '140px',
      cell:   (e: Enrollment) => (
        <span className="text-gray-600">{formatDate(e.enrollmentDate ?? e.createdAt)}</span>
      ),
    },
  ]

  if (studyLoading) return <Spinner />

  if (!study) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        <p className="text-[14px]">Study not found.</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-5" style={{ background: 'var(--color-background)' }}>

      {/* Back link */}
      <Link
        to="/studies"
        className="inline-flex items-center gap-1.5 text-[13px] text-gray-500 hover:text-gray-800 transition-colors"
      >
        <ArrowLeft size={14} />
        Back to Studies
      </Link>

      {/* Page header */}
      <div className="flex items-start gap-4">
        <div
          className="flex items-center justify-center w-12 h-12 rounded-xl shrink-0"
          style={{ background: 'var(--color-primary)' }}
        >
          <FlaskConical size={20} className="text-white" />
        </div>
        <div>
          <h2 className="text-[20px] font-bold text-gray-900 leading-tight">{study.title ?? 'Untitled Study'}</h2>
          {study.protocolNumber && (
            <p className="text-[13px] font-mono text-gray-400 mt-0.5">{study.protocolNumber}</p>
          )}
        </div>
      </div>

      {/* Detail fields */}
      <div
        className="bg-white rounded-xl p-6"
        style={{ border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}
      >
        <p className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider mb-5">Study Details</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
          <Field label="Phase">
            {study.phase ? <Badge value={study.phase} /> : '—'}
          </Field>

          <Field label="Status">
            {study.status ? <Badge value={study.status} /> : '—'}
          </Field>

          <Field label="Sponsor">
            {study.sponsor?.name ?? study.sponsorName ?? '—'}
          </Field>

          <Field label="Indication">
            {study.indication ?? '—'}
          </Field>

          <Field label="Therapeutic Area">
            {study.therapeuticArea ?? '—'}
          </Field>

          <Field label="Target Enrollment">
            {study.targetEnrollment != null ? `${study.targetEnrollment} participants` : '—'}
          </Field>

          <Field label="Start Date">
            <span className="inline-flex items-center gap-1.5">
              <Calendar size={13} className="text-gray-400 shrink-0" />
              {formatDate(study.startDate)}
            </span>
          </Field>

          <Field label="End Date">
            <span className="inline-flex items-center gap-1.5">
              <Calendar size={13} className="text-gray-400 shrink-0" />
              {formatDate(study.endDate)}
            </span>
          </Field>
        </div>
      </div>

      {/* Description */}
      {study.description && (
        <div
          className="bg-white rounded-xl p-6"
          style={{ border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}
        >
          <p className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider mb-3">Description</p>
          <p className="text-[13.5px] text-gray-600 leading-relaxed whitespace-pre-line">{study.description}</p>
        </div>
      )}

      {/* Enrollments */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Users size={15} className="text-gray-400" />
          <h3 className="text-[14px] font-semibold text-gray-800">Enrollments</h3>
          {!enrollmentsLoading && (
            <span className="text-[12px] text-gray-400">({enrollments.length})</span>
          )}
        </div>

        {enrollmentsLoading ? (
          <Spinner />
        ) : (
          <Table<Enrollment>
            columns={enrollmentColumns}
            data={enrollments}
            emptyMessage="No enrollments found for this study."
          />
        )}
      </div>
    </div>
  )
}
