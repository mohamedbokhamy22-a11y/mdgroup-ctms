import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Users, Calendar, MapPin } from 'lucide-react'

import { participantsApi, enrollmentsApi } from '../api/endpoints'
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

// ── info card ───────────────────────────────────────────────────────────────

function InfoCard({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-1">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
      <div className="text-sm text-slate-800 font-medium">{children}</div>
    </div>
  )
}

// ── component ──────────────────────────────────────────────────────────────

export default function ParticipantDetail() {
  const { id } = useParams<{ id: string }>()

  const { data: participant, isLoading: participantLoading } = useQuery({
    queryKey: ['participant', id],
    queryFn:  () => participantsApi.get(id!),
    enabled:  !!id,
  })

  const { data: enrollmentsData, isLoading: enrollmentsLoading } = useQuery({
    queryKey: ['participant-enrollments', id],
    queryFn:  () => enrollmentsApi.list({ participantId: id, limit: 50 }),
    enabled:  !!id,
  })

  const enrollments: Enrollment[] = enrollmentsData?.data ?? []

  // message count from participant record if included
  const messageCount: number | null =
    participant?._count?.messages ?? participant?.messages?.length ?? null

  const enrollmentColumns = [
    {
      header: 'Study',
      cell:   (e: Enrollment) => (
        <span className="text-slate-800 font-medium">
          {e.study?.title ?? e.studyId ?? '—'}
        </span>
      ),
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
      header: 'Subject #',
      width:  '120px',
      cell:   (e: Enrollment) => (
        <span className="font-mono text-xs text-slate-600">
          {e.subjectNumber ?? e.subjectId ?? '—'}
        </span>
      ),
    },
    {
      header: 'Enrollment Date',
      width:  '150px',
      cell:   (e: Enrollment) => (
        <span className="text-slate-600 text-sm">
          {formatDate(e.enrollmentDate ?? e.createdAt)}
        </span>
      ),
    },
  ]

  if (participantLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Spinner />
      </div>
    )
  }

  if (!participant) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-400">Participant not found.</p>
      </div>
    )
  }

  const fullName =
    [participant.firstName, participant.lastName].filter(Boolean).join(' ') || 'Unknown Participant'

  const emergencyContact = participant.emergencyContact
  const emergencyDisplay =
    typeof emergencyContact === 'string'
      ? emergencyContact
      : emergencyContact
      ? [emergencyContact.name, emergencyContact.phone, emergencyContact.relationship]
          .filter(Boolean)
          .join(' · ')
      : null

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── back link ── */}
      <div className="px-8 pt-6">
        <Link
          to="/participants"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Participants
        </Link>
      </div>

      <PageHeader
        title={fullName}
        subtitle={participant.externalRef ?? ''}
      />

      <div className="px-8 pb-10 space-y-8">

        {/* ── info cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <InfoCard label="Date of Birth">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {formatDate(participant.dateOfBirth ?? participant.dob)}
            </span>
          </InfoCard>

          <InfoCard label="Country">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {participant.country ?? '—'}
            </span>
          </InfoCard>

          <InfoCard label="Language">
            {participant.preferredLanguage ?? participant.language ?? '—'}
          </InfoCard>

          <InfoCard label="Phone">
            {participant.phone ?? participant.phoneNumber ?? '—'}
          </InfoCard>

          <InfoCard label="Email">
            {participant.email ? (
              <a
                href={`mailto:${participant.email}`}
                className="text-blue-600 hover:underline"
              >
                {participant.email}
              </a>
            ) : (
              '—'
            )}
          </InfoCard>

          <InfoCard label="Requires Assistance">
            {participant.requiresAssistance ? (
              <Badge value="ACTIVE" />
            ) : (
              <span className="text-slate-500 font-normal">No</span>
            )}
          </InfoCard>

          <InfoCard label="Emergency Contact">
            {emergencyDisplay ?? '—'}
          </InfoCard>
        </div>

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
              emptyMessage="No enrollments found for this participant."
            />
          )}
        </div>

        {/* ── messages ── */}
        {messageCount !== null && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-2">
              Messages
            </h2>
            <p className="text-sm text-slate-600">
              {messageCount === 0
                ? 'No messages on record.'
                : `${messageCount} message${messageCount !== 1 ? 's' : ''} on record.`}
            </p>
          </div>
        )}

      </div>
    </div>
  )
}
