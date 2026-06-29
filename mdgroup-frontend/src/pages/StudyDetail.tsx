import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, FlaskConical, Users, Calendar, MapPin } from 'lucide-react'

import { studiesApi, enrollmentsApi } from '../api/endpoints'
import Badge from '../components/ui/Badge'
import Table from '../components/ui/Table'
import PageHeader from '../components/ui/PageHeader'

// ── types ──────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Enrollment = Record<string, any>

// ── helpers ────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="animate-spin rounded-full border-2 border-blue-600 border-t-transparent w-6 h-6" />
    </div>
  )
}

function formatDate(value: string | null | undefined): string {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-GB', {
    day:   '2-digit',
    month: 'short',
    year:  'numeric',
  })
}

// ── info grid item ──────────────────────────────────────────────────────────

function InfoItem({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
      <div className="text-sm text-slate-800">{children}</div>
    </div>
  )
}

// ── component ──────────────────────────────────────────────────────────────

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
        <span className="font-mono text-xs text-slate-600">
          {e.subjectNumber ?? e.subjectId ?? '—'}
        </span>
      ),
    },
    {
      header: 'Participant',
      cell:   (e: Enrollment) => {
        const p = e.participant
        if (!p) return <span className="text-slate-400">—</span>
        return (
          <span className="text-slate-800">
            {[p.firstName, p.lastName].filter(Boolean).join(' ') || '—'}
          </span>
        )
      },
    },
    {
      header: 'Site',
      width:  '160px',
      cell:   (e: Enrollment) => (
        <span className="text-slate-600 text-sm">{e.site?.name ?? '—'}</span>
      ),
    },
    {
      header: 'Status',
      width:  '130px',
      cell:   (e: Enrollment) =>
        e.status ? (
          <Badge value={e.status} />
        ) : (
          <span className="text-slate-400 text-xs">—</span>
        ),
    },
    {
      header: 'Enrolled Date',
      width:  '140px',
      cell:   (e: Enrollment) => (
        <span className="text-slate-600 text-sm">
          {formatDate(e.enrollmentDate ?? e.createdAt)}
        </span>
      ),
    },
  ]

  if (studyLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Spinner />
      </div>
    )
  }

  if (!study) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-400">Study not found.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── back link ── */}
      <div className="px-8 pt-6">
        <Link
          to="/studies"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Studies
        </Link>
      </div>

      <PageHeader
        title={study.title ?? 'Untitled Study'}
        subtitle={study.protocolNumber ?? ''}
      />

      <div className="px-8 pb-10 space-y-8">

        {/* ── info grid ── */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <FlaskConical className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
              Study Details
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-5">
            <InfoItem label="Phase">
              {study.phase ? <Badge value={study.phase} /> : '—'}
            </InfoItem>

            <InfoItem label="Status">
              {study.status ? <Badge value={study.status} /> : '—'}
            </InfoItem>

            <InfoItem label="Indication">
              {study.indication ?? '—'}
            </InfoItem>

            <InfoItem label="Therapeutic Area">
              {study.therapeuticArea ?? '—'}
            </InfoItem>

            <InfoItem label="Sponsor">
              {study.sponsor?.name ?? study.sponsorName ?? '—'}
            </InfoItem>

            <InfoItem label="Target Enrollment">
              {study.targetEnrollment != null
                ? `${study.targetEnrollment} participants`
                : '—'}
            </InfoItem>

            <InfoItem label="Start Date">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {formatDate(study.startDate)}
              </span>
            </InfoItem>

            <InfoItem label="End Date">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {formatDate(study.endDate)}
              </span>
            </InfoItem>
          </div>
        </div>

        {/* ── description ── */}
        {study.description && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">
              Description
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {study.description}
            </p>
          </div>
        )}

        {/* ── enrollments ── */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <h2 className="text-base font-semibold text-slate-800">Enrollments</h2>
            {!enrollmentsLoading && (
              <span className="text-xs text-slate-400 font-normal">
                ({enrollments.length})
              </span>
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
    </div>
  )
}
