import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, FlaskConical, Building2, Users, CalendarCheck,
  CreditCard, MessageSquare, AlertTriangle, MapPin, LogOut,
  Activity, BarChart3, ChevronRight
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
    <aside className="flex flex-col w-64 min-h-screen shrink-0" style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%)' }}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg shadow-blue-500/30">
          <Activity size={17} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-white leading-none tracking-wide">MDGroup</p>
          <p className="text-xs text-blue-300/70 mt-0.5 font-medium">CTMS Platform</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {groups.map(({ key, label }) => {
          const items = nav.filter(n => n.group === key)
          return (
            <div key={key}>
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-3 mb-1.5">{label}</p>
              <div className="space-y-0.5">
                {items.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={to === '/'}
                    className={({ isActive }) =>
                      clsx(
                        'group flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                        isActive
                          ? 'bg-white/15 text-white shadow-sm'
                          : 'text-white/50 hover:bg-white/8 hover:text-white/80'
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center gap-3">
                          <Icon size={16} className={isActive ? 'text-blue-300' : ''} />
                          {label}
                        </div>
                        {isActive && <ChevronRight size={13} className="text-blue-300" />}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          )
        })}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-white/10 bg-white/5">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 text-xs font-bold text-white shrink-0 shadow">
            {user?.firstName[0]}{user?.lastName[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-white/40 truncate">{user?.role?.replace(/_/g, ' ')}</p>
          </div>
          <button onClick={logout} className="text-white/30 hover:text-white/80 transition-colors p-1 rounded-lg hover:bg-white/10" title="Logout">
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  )
}
