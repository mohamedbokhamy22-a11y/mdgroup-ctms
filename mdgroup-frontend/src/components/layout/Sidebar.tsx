import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, FlaskConical, Building2, Users, CalendarCheck,
  CreditCard, MessageSquare, AlertTriangle, MapPin, LogOut,
  Activity, BarChart3
} from 'lucide-react'
import clsx from 'clsx'

const nav = [
  { to: '/',               label: 'Dashboard',      icon: LayoutDashboard, group: 'main' },
  { to: '/studies',        label: 'Studies',         icon: FlaskConical,    group: 'main' },
  { to: '/sponsors',       label: 'Sponsors',        icon: Building2,       group: 'main' },
  { to: '/sites',          label: 'Sites',           icon: MapPin,          group: 'main' },
  { to: '/participants',   label: 'Participants',    icon: Users,           group: 'clinical' },
  { to: '/visits',         label: 'Visits',          icon: CalendarCheck,   group: 'clinical' },
  { to: '/payments',       label: 'Payments',        icon: CreditCard,      group: 'clinical' },
  { to: '/messages',       label: 'Messages',        icon: MessageSquare,   group: 'clinical' },
  { to: '/adverse-events', label: 'Adverse Events',  icon: AlertTriangle,   group: 'clinical' },
  { to: '/reports',        label: 'Reports',         icon: BarChart3,       group: 'insights' },
]

const groups = [
  { key: 'main',     label: 'Platform' },
  { key: 'clinical', label: 'Clinical Ops' },
  { key: 'insights', label: 'Insights' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()

  return (
    <aside
      className="flex flex-col shrink-0 relative"
      style={{
        width: 'var(--sidebar-width)',
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0F172A 0%, #1E293B 100%)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Top glow */}
      <div
        className="absolute top-0 inset-x-0 h-32 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% -10%, rgba(3,105,161,0.2) 0%, transparent 70%)' }}
      />

      {/* Logo */}
      <div className="relative flex items-center gap-3 px-5 pt-5 pb-4">
        <div
          className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
          style={{
            background: 'linear-gradient(135deg, #1E40AF 0%, #0369A1 100%)',
            boxShadow: '0 0 0 1px rgba(3,105,161,0.5), 0 3px 10px rgba(3,105,161,0.3)',
          }}
        >
          <Activity size={15} className="text-white" />
        </div>
        <div>
          <p className="text-white font-bold text-[13px] leading-none tracking-wide">MDGroup</p>
          <p className="text-[10px] text-slate-500 mt-0.5 font-medium tracking-widest uppercase">CTMS</p>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-white/5" />

      {/* Nav */}
      <nav className="relative flex-1 px-3 py-4 overflow-y-auto space-y-5">
        {groups.map(({ key, label }) => {
          const items = nav.filter(n => n.group === key)
          return (
            <div key={key}>
              <p className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.16em] px-3 mb-1.5">{label}</p>
              <div className="space-y-0.5">
                {items.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={to === '/'}
                    className={({ isActive }) =>
                      clsx(
                        'group relative flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12.5px] font-medium transition-all',
                        isActive
                          ? 'text-white'
                          : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <div
                            className="absolute inset-0 rounded-lg"
                            style={{
                              background: 'linear-gradient(135deg, rgba(3,105,161,0.3) 0%, rgba(30,64,175,0.15) 100%)',
                              border: '1px solid rgba(3,105,161,0.3)',
                            }}
                          />
                        )}
                        {/* Left accent bar */}
                        {isActive && (
                          <div
                            className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full"
                            style={{ background: '#0369A1' }}
                          />
                        )}
                        <Icon
                          size={14}
                          className="relative shrink-0"
                          style={{ color: isActive ? '#38BDF8' : undefined }}
                        />
                        <span className="relative flex-1 leading-none">{label}</span>
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          )
        })}
      </nav>

      {/* Divider */}
      <div className="mx-4 h-px bg-white/5" />

      {/* User */}
      <div className="px-3 py-3">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <div
            className="flex items-center justify-center w-7 h-7 rounded-full text-[10px] font-bold text-white shrink-0"
            style={{ background: 'linear-gradient(135deg, #1E40AF 0%, #0369A1 100%)' }}
          >
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-white/80 truncate leading-none">{user?.firstName} {user?.lastName}</p>
            <p className="text-[10px] text-slate-600 truncate mt-0.5">{user?.role?.replace(/_/g, ' ')}</p>
          </div>
          <button
            onClick={logout}
            title="Logout"
            className="text-slate-600 hover:text-slate-400 transition-colors p-1 rounded cursor-pointer"
          >
            <LogOut size={13} />
          </button>
        </div>
      </div>
    </aside>
  )
}
