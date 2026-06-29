import clsx from 'clsx'

const variants: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  COMPLETED: 'bg-blue-100 text-blue-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  PROCESSING: 'bg-purple-100 text-purple-700',
  PAID: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-slate-100 text-slate-600',
  SCHEDULED: 'bg-blue-100 text-blue-700',
  ENROLLED: 'bg-teal-100 text-teal-700',
  SCREENING: 'bg-orange-100 text-orange-700',
  WITHDRAWN: 'bg-red-100 text-red-700',
  SCREEN_FAILED: 'bg-red-100 text-red-700',
  DRAFT: 'bg-slate-100 text-slate-600',
  ON_HOLD: 'bg-orange-100 text-orange-700',
  TERMINATED: 'bg-red-100 text-red-700',
  PHASE_1: 'bg-violet-100 text-violet-700',
  PHASE_2: 'bg-blue-100 text-blue-700',
  PHASE_3: 'bg-teal-100 text-teal-700',
  PHASE_4: 'bg-green-100 text-green-700',
  MILD: 'bg-yellow-100 text-yellow-700',
  MODERATE: 'bg-orange-100 text-orange-700',
  SEVERE: 'bg-red-100 text-red-700',
  LIFE_THREATENING: 'bg-red-200 text-red-800 font-bold',
  FATAL: 'bg-red-900 text-white font-bold',
  REPORTED: 'bg-yellow-100 text-yellow-700',
  UNDER_REVIEW: 'bg-blue-100 text-blue-700',
  RESOLVED: 'bg-green-100 text-green-700',
  ONGOING: 'bg-orange-100 text-orange-700',
  SITE_BASED: 'bg-slate-100 text-slate-700',
  HOME_VISIT: 'bg-purple-100 text-purple-700',
  TELEHEALTH: 'bg-cyan-100 text-cyan-700',
  REMOTE_MONITORING: 'bg-indigo-100 text-indigo-700',
  DISPATCHED: 'bg-blue-100 text-blue-700',
  DELIVERED: 'bg-green-100 text-green-700',
  IN_USE: 'bg-teal-100 text-teal-700',
  RETURNED: 'bg-slate-100 text-slate-600',
  CONFIRMED: 'bg-green-100 text-green-700',
  BOOKED: 'bg-blue-100 text-blue-700',
}

export default function Badge({ value }: { value: string }) {
  return (
    <span className={clsx('inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium', variants[value] ?? 'bg-slate-100 text-slate-600')}>
      {value.replace(/_/g, ' ')}
    </span>
  )
}
