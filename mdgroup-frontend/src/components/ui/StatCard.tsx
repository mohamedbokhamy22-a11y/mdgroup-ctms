import { type FC } from 'react'
import clsx from 'clsx'
import { TrendingUp } from 'lucide-react'

interface Props {
  label: string
  value: string | number
  icon: FC<{ size?: number; className?: string }>
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'indigo'
  sub?: string
  trend?: string
}

const colors = {
  blue:   { bg: 'from-blue-500 to-blue-600',     light: 'bg-blue-50',   text: 'text-blue-600',   ring: 'ring-blue-100' },
  green:  { bg: 'from-emerald-500 to-green-600', light: 'bg-green-50',  text: 'text-emerald-600', ring: 'ring-green-100' },
  purple: { bg: 'from-purple-500 to-violet-600', light: 'bg-purple-50', text: 'text-purple-600', ring: 'ring-purple-100' },
  orange: { bg: 'from-orange-400 to-orange-500', light: 'bg-orange-50', text: 'text-orange-500', ring: 'ring-orange-100' },
  red:    { bg: 'from-red-500 to-rose-600',      light: 'bg-red-50',    text: 'text-red-600',    ring: 'ring-red-100' },
  indigo: { bg: 'from-indigo-500 to-indigo-600', light: 'bg-indigo-50', text: 'text-indigo-600', ring: 'ring-indigo-100' },
}

export default function StatCard({ label, value, icon: Icon, color = 'blue', sub, trend }: Props) {
  const c = colors[color]
  return (
    <div className={clsx('relative bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-200 overflow-hidden')}>
      {/* Soft background tint */}
      <div className={clsx('absolute inset-0 opacity-[0.03] bg-gradient-to-br', c.bg)} />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{label}</p>
          <p className={clsx('text-3xl font-extrabold mt-2 tracking-tight', c.text)}>{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-1.5">{sub}</p>}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp size={12} className="text-emerald-500" />
              <span className="text-xs font-medium text-emerald-600">{trend}</span>
            </div>
          )}
        </div>
        <div className={clsx('flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br shadow-sm ring-4', c.bg, c.ring)}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
    </div>
  )
}
