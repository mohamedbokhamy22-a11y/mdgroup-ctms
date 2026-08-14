const variants: Record<string, { bg: string; color: string; dot?: string }> = {
  ACTIVE:           { bg: 'rgba(16,185,129,0.1)',  color: '#059669', dot: '#10b981' },
  COMPLETED:        { bg: 'rgba(59,130,246,0.1)',  color: '#2563eb', dot: '#3b82f6' },
  PENDING:          { bg: 'rgba(245,158,11,0.12)', color: '#d97706', dot: '#f59e0b' },
  APPROVED:         { bg: 'rgba(16,185,129,0.1)',  color: '#059669', dot: '#10b981' },
  PROCESSING:       { bg: 'rgba(139,92,246,0.1)',  color: '#7c3aed', dot: '#8b5cf6' },
  PAID:             { bg: 'rgba(16,185,129,0.1)',  color: '#059669', dot: '#10b981' },
  REJECTED:         { bg: 'rgba(239,68,68,0.1)',   color: '#dc2626', dot: '#ef4444' },
  CANCELLED:        { bg: 'rgba(100,116,139,0.1)', color: '#64748b', dot: '#94a3b8' },
  SCHEDULED:        { bg: 'rgba(59,130,246,0.1)',  color: '#2563eb', dot: '#3b82f6' },
  ENROLLED:         { bg: 'rgba(20,184,166,0.1)',  color: '#0d9488', dot: '#14b8a6' },
  SCREENING:        { bg: 'rgba(249,115,22,0.1)',  color: '#ea580c', dot: '#f97316' },
  WITHDRAWN:        { bg: 'rgba(239,68,68,0.1)',   color: '#dc2626', dot: '#ef4444' },
  SCREEN_FAILED:    { bg: 'rgba(239,68,68,0.1)',   color: '#dc2626', dot: '#ef4444' },
  DRAFT:            { bg: 'rgba(100,116,139,0.1)', color: '#64748b', dot: '#94a3b8' },
  ON_HOLD:          { bg: 'rgba(249,115,22,0.1)',  color: '#ea580c', dot: '#f97316' },
  TERMINATED:       { bg: 'rgba(239,68,68,0.1)',   color: '#dc2626', dot: '#ef4444' },
  PHASE_1:          { bg: 'rgba(139,92,246,0.1)',  color: '#7c3aed', dot: '#8b5cf6' },
  PHASE_2:          { bg: 'rgba(59,130,246,0.1)',  color: '#2563eb', dot: '#3b82f6' },
  PHASE_3:          { bg: 'rgba(20,184,166,0.1)',  color: '#0d9488', dot: '#14b8a6' },
  PHASE_4:          { bg: 'rgba(16,185,129,0.1)',  color: '#059669', dot: '#10b981' },
  OBSERVATIONAL:    { bg: 'rgba(99,102,241,0.1)',  color: '#4f46e5', dot: '#6366f1' },
  MILD:             { bg: 'rgba(245,158,11,0.12)', color: '#d97706', dot: '#f59e0b' },
  MODERATE:         { bg: 'rgba(249,115,22,0.1)',  color: '#ea580c', dot: '#f97316' },
  SEVERE:           { bg: 'rgba(239,68,68,0.1)',   color: '#dc2626', dot: '#ef4444' },
  LIFE_THREATENING: { bg: 'rgba(239,68,68,0.15)',  color: '#b91c1c', dot: '#ef4444' },
  FATAL:            { bg: 'rgba(127,29,29,0.9)',   color: '#fca5a5', dot: '#f87171' },
  REPORTED:         { bg: 'rgba(245,158,11,0.12)', color: '#d97706', dot: '#f59e0b' },
  UNDER_REVIEW:     { bg: 'rgba(59,130,246,0.1)',  color: '#2563eb', dot: '#3b82f6' },
  RESOLVED:         { bg: 'rgba(16,185,129,0.1)',  color: '#059669', dot: '#10b981' },
  ONGOING:          { bg: 'rgba(249,115,22,0.1)',  color: '#ea580c', dot: '#f97316' },
  SITE_BASED:       { bg: 'rgba(100,116,139,0.1)', color: '#475569', dot: '#94a3b8' },
  HOME_VISIT:       { bg: 'rgba(139,92,246,0.1)',  color: '#7c3aed', dot: '#8b5cf6' },
  TELEHEALTH:       { bg: 'rgba(6,182,212,0.1)',   color: '#0891b2', dot: '#06b6d4' },
  REMOTE_MONITORING:{ bg: 'rgba(99,102,241,0.1)',  color: '#4f46e5', dot: '#6366f1' },
  DISPATCHED:       { bg: 'rgba(59,130,246,0.1)',  color: '#2563eb', dot: '#3b82f6' },
  DELIVERED:        { bg: 'rgba(16,185,129,0.1)',  color: '#059669', dot: '#10b981' },
  IN_USE:           { bg: 'rgba(20,184,166,0.1)',  color: '#0d9488', dot: '#14b8a6' },
  RETURNED:         { bg: 'rgba(100,116,139,0.1)', color: '#64748b', dot: '#94a3b8' },
  CONFIRMED:        { bg: 'rgba(16,185,129,0.1)',  color: '#059669', dot: '#10b981' },
  BOOKED:           { bg: 'rgba(59,130,246,0.1)',  color: '#2563eb', dot: '#3b82f6' },
}

const fallback = { bg: 'rgba(100,116,139,0.08)', color: '#64748b', dot: '#94a3b8' }

export default function Badge({ value }: { value: string }) {
  const v = variants[value] ?? fallback
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[13px] font-semibold whitespace-nowrap"
      style={{ background: v.bg, color: v.color }}
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: v.dot }} />
      {value.replace(/_/g, ' ')}
    </span>
  )
}
