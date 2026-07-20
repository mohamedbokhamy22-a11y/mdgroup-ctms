import { type FC } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface Props {
  label: string
  value: string | number
  icon: FC<{ size?: number; className?: string }>
  color?: 'blue' | 'green' | 'amber' | 'red' | 'sky' | 'slate'
  sub?: string
  trend?: string
  trendDown?: boolean
}

const palette = {
  blue:  { from: '#1E40AF', to: '#1D4ED8', glow: 'rgba(30,64,175,0.2)',  soft: 'rgba(30,64,175,0.06)',  text: '#1E40AF', label: '#3B82F6' },
  green: { from: '#15803D', to: '#16A34A', glow: 'rgba(21,128,61,0.2)',  soft: 'rgba(21,128,61,0.06)',  text: '#15803D', label: '#22C55E' },
  amber: { from: '#B45309', to: '#D97706', glow: 'rgba(217,119,6,0.2)',  soft: 'rgba(217,119,6,0.06)',  text: '#B45309', label: '#F59E0B' },
  red:   { from: '#B91C1C', to: '#DC2626', glow: 'rgba(185,28,28,0.2)',  soft: 'rgba(185,28,28,0.06)',  text: '#B91C1C', label: '#EF4444' },
  sky:   { from: '#0369A1', to: '#0284C7', glow: 'rgba(3,105,161,0.2)',  soft: 'rgba(3,105,161,0.06)',  text: '#0369A1', label: '#38BDF8' },
  slate: { from: '#334155', to: '#475569', glow: 'rgba(51,65,85,0.2)',   soft: 'rgba(51,65,85,0.05)',   text: '#334155', label: '#94A3B8' },
}

export default function StatCard({ label, value, icon: Icon, color = 'blue', sub, trend, trendDown }: Props) {
  const c = palette[color]

  return (
    <div
      className="relative overflow-hidden rounded-xl transition-all duration-200 hover:-translate-y-px"
      style={{
        background: '#FFFFFF',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-md)',
        padding: 'var(--card-padding)',
      }}
    >
      {/* Accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5"
        style={{ background: `linear-gradient(90deg, ${c.from}, ${c.to})` }}
      />

      {/* Soft bg tint */}
      <div
        className="absolute top-0 right-0 w-24 h-24 rounded-full pointer-events-none"
        style={{ background: c.soft, transform: 'translate(30%, -30%)' }}
      />

      <div className="relative">
        {/* Icon */}
        <div
          className="inline-flex items-center justify-center w-8 h-8 rounded-lg mb-3"
          style={{
            background: `linear-gradient(135deg, ${c.from}, ${c.to})`,
            boxShadow: `0 2px 8px ${c.glow}`,
          }}
        >
          <Icon size={15} className="text-white" />
        </div>

        {/* Value — Fira Code for data precision */}
        <p
          className="font-mono text-2xl font-bold tracking-tight leading-none"
          style={{ color: c.text }}
        >
          {value}
        </p>

        {/* Label */}
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mt-1.5">{label}</p>

        {/* Sub / trend */}
        {(trend || sub) && (
          <div className="mt-2.5 flex items-center gap-2 flex-wrap">
            {trend && (
              <span
                className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
                style={{
                  background: trendDown ? 'rgba(185,28,28,0.08)' : 'rgba(21,128,61,0.08)',
                  color: trendDown ? '#B91C1C' : '#15803D',
                }}
              >
                {trendDown ? <TrendingDown size={9} /> : <TrendingUp size={9} />}
                {trend}
              </span>
            )}
            {sub && <p className="text-[11px] text-slate-400 truncate">{sub}</p>}
          </div>
        )}
      </div>
    </div>
  )
}
