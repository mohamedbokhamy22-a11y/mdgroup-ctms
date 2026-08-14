import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Users, Calendar, MapPin, Mail, Phone, AlertCircle } from 'lucide-react'

import { participantsApi, enrollmentsApi } from '../api/endpoints'
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

  const enrollmentColumns = [
    {
      header: 'Study',
      cell:   (e: Enrollment) => (
        <span className="text-gray-800 font-medium">{e.study?.title ?? e.studyId ?? '—'}</span>
      ),
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
      header: 'Subject #',
      width:  '120px',
      cell:   (e: Enrollment) => (
        <span className="font-mono text-xs text-gray-600">{e.subjectNumber ?? e.subjectId ?? '—'}</span>
      ),
    },
    {
      header: 'Enrolled',
      width:  '140px',
      cell:   (e: Enrollment) => <span className="text-gray-600">{formatDate(e.enrollmentDate ?? e.createdAt)}</span>,
    },
  ]

  if (participantLoading) return <Spinner />

  if (!participant) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        <p className="text-[14px]">Participant not found.</p>
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
    <div className="p-6 space-y-5" style={{ background: 'var(--color-background)' }}>

      {/* Back link */}
      <Link
        to="/participants"
        className="inline-flex items-center gap-1.5 text-[13px] text-gray-500 hover:text-gray-800 transition-colors"
      >
        <ArrowLeft size={14} />
        Back to Participants
      </Link>

      {/* Page header */}
      <div className="flex items-start gap-4">
        <div
          className="flex items-center justify-center w-12 h-12 rounded-xl text-[16px] font-bold text-white shrink-0"
          style={{ background: 'var(--color-primary)' }}
        >
          {(participant.firstName?.[0] ?? '') + (participant.lastName?.[0] ?? '')}
        </div>
        <div>
          <h2 className="text-[20px] font-bold text-gray-900 leading-tight">{fullName}</h2>
          {participant.externalRef && (
            <p className="text-[13px] font-mono text-gray-400 mt-0.5">{participant.externalRef}</p>
          )}
        </div>
      </div>

      {/* Detail fields */}
      <div
        className="bg-white rounded-xl p-6"
        style={{ border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}
      >
        <p className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider mb-5">Personal Information</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
          <Field label="Date of Birth">
            <span className="inline-flex items-center gap-1.5">
              <Calendar size={13} className="text-gray-400 shrink-0" />
              {formatDate(participant.dateOfBirth ?? participant.dob)}
            </span>
          </Field>

          <Field label="Country">
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={13} className="text-gray-400 shrink-0" />
              {participant.country ?? '—'}
            </span>
          </Field>

          <Field label="Language">
            {participant.preferredLanguage ?? participant.language ?? '—'}
          </Field>

          <Field label="Phone">
            <span className="inline-flex items-center gap-1.5">
              <Phone size={13} className="text-gray-400 shrink-0" />
              {participant.phone ?? participant.phoneNumber ?? '—'}
            </span>
          </Field>

          <Field label="Email">
            {participant.email ? (
              <a
                href={`mailto:${participant.email}`}
                className="inline-flex items-center gap-1.5 text-blue-600 hover:underline"
              >
                <Mail size={13} className="shrink-0" />
                {participant.email}
              </a>
            ) : (
              '—'
            )}
          </Field>

          <Field label="Requires Assistance">
            <span className="inline-flex items-center gap-1.5">
              <AlertCircle size={13} className={participant.requiresAssistance ? 'text-red-500 shrink-0' : 'text-gray-300 shrink-0'} />
              {participant.requiresAssistance ? 'Yes' : 'No'}
            </span>
          </Field>

          {emergencyDisplay && (
            <Field label="Emergency Contact">
              <span className="text-gray-700">{emergencyDisplay}</span>
            </Field>
          )}
        </div>
      </div>

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
            emptyMessage="No enrollments found for this participant."
          />
        )}
      </div>
    </div>
  )
}
