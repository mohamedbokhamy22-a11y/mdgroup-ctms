import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, FlaskConical, Building2, Users, CalendarCheck,
  CreditCard, MessageSquare, AlertTriangle, MapPin, LogOut, Activity
} from 'lucide-react'
import clsx from 'clsx'

const nav = [
  { to: '/',               label: 'Dashboard',      icon: LayoutDashboard },
  { to: '/studies',        label: 'Studies',         icon: FlaskConical },
  { to: '/sponsors',       label: 'Sponsors',        icon: Building2 },
  { to: '/sites',          label: 'Sites',           icon: MapPin },
  { to: '/participants',   label: 'Participants',    icon: Users },
  { to: '/visits',         label: 'Visits',          icon: CalendarCheck },
  { to: '/payments',       label: 'Payments',        icon: CreditCard },
  { to: '/messages',       label: 'Messages',        icon: MessageSquare },
  { to: '/adverse-events', label: 'Adverse Events',  icon: AlertTriangle },
]

export default function Sidebar() {
  const { user, logout } = useAuth()

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-slate-900 text-white shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-600">
          <Activity size={18} />
        </div>
        <div>
          <p className="text-sm font-bold leading-none">MDGroup</p>
          <p className="text-xs text-slate-400 mt-0.5">CTMS Platform</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-slate-700">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-xs font-bold shrink-0">
            {user?.firstName[0]}{user?.lastName[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-slate-400 truncate">{user?.role}</p>
          </div>
          <button onClick={logout} className="text-slate-400 hover:text-white transition-colors" title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  )
}
