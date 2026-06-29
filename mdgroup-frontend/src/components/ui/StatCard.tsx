import { type FC } from 'react'
import clsx from 'clsx'

interface Props {
  label: string
  value: string | number
  icon: FC<{ size?: number }>
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red'
  sub?: string
}

const colors = {
  blue:   { bg: 'bg-blue-50',   icon: 'bg-blue-600 text-white',   text: 'text-blue-600' },
  green:  { bg: 'bg-green-50',  icon: 'bg-green-600 text-white',  text: 'text-green-600' },
  purple: { bg: 'bg-purple-50', icon: 'bg-purple-600 text-white', text: 'text-purple-600' },
  orange: { bg: 'bg-orange-50', icon: 'bg-orange-500 text-white', text: 'text-orange-500' },
  red:    { bg: 'bg-red-50',    icon: 'bg-red-600 text-white',    text: 'text-red-600' },
}

export default function StatCard({ label, value, icon: Icon, color = 'blue', sub }: Props) {
  const c = colors[color]
  return (
    <div className={clsx('rounded-xl p-5 flex items-start gap-4', c.bg)}>
      <div className={clsx('flex items-center justify-center w-11 h-11 rounded-lg shrink-0', c.icon)}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-sm text-slate-500 font-medium">{label}</p>
        <p className={clsx('text-3xl font-bold mt-0.5', c.text)}>{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
      </div>
    </div>
  )
}
