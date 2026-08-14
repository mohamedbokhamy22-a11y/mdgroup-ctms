import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, FlaskConical, Building2, Users, CalendarCheck,
  CreditCard, MessageSquare, AlertTriangle, MapPin, LogOut,
  Activity, BarChart3, X
} from 'lucide-react'

const nav = [
  { to: '/',               label: 'Dashboard',      icon: LayoutDashboard, group: 'platform' },
  { to: '/studies',        label: 'Studies',         icon: FlaskConical,    group: 'platform' },
  { to: '/sponsors',       label: 'Sponsors',        icon: Building2,       group: 'platform' },
  { to: '/sites',          label: 'Sites',           icon: MapPin,          group: 'platform' },
  { to: '/participants',   label: 'Participants',    icon: Users,           group: 'clinical' },
  { to: '/visits',         label: 'Visits',          icon: CalendarCheck,   group: 'clinical' },
  { to: '/payments',       label: 'Payments',        icon: CreditCard,      group: 'clinical' },
  { to: '/messages',       label: 'Messages',        icon: MessageSquare,   group: 'clinical' },
  { to: '/adverse-events', label: 'Adverse Events',  icon: AlertTriangle,   group: 'clinical' },
  { to: '/reports',        label: 'Reports',         icon: BarChart3,       group: 'insights' },
]

const groups = [
  { key: 'platform', label: 'Platform' },
  { key: 'clinical', label: 'Clinical Ops' },
  { key: 'insights', label: 'Insights' },
]

interface Props {
  open: boolean
  onClose: () => void
}

export default function Sidebar({ open, onClose }: Props) {
  const { user, logout } = useAuth()

  return (
    <>
      {/* Sidebar panel */}
      <aside
        className="flex flex-col shrink-0 transition-all duration-200 ease-in-out"
        style={{
          width: open ? 'var(--sidebar-width)' : '0px',
          minHeight: '100vh',
          background: '#FFFFFF',
          borderRight: open ? '1px solid var(--color-border)' : 'none',
          overflow: 'hidden',
        }}
      >
        <div style={{ width: 'var(--sidebar-width)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

          {/* Logo */}
          <div className="flex items-center justify-between px-5 py-5" style={{ borderBottom: '1px solid var(--color-border)' }}>
            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0"
                style={{ background: 'var(--color-primary)' }}
              >
                <Activity size={16} className="text-white" />
              </div>
              <div>
                <p className="font-bold text-[15px] leading-none" style={{ color: 'var(--color-primary)' }}>MDGroup</p>
                <p className="text-[11px] text-gray-400 mt-0.5 font-medium tracking-wider uppercase">CTMS</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex items-center justify-center w-7 h-7 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-6">
            {groups.map(({ key, label }) => {
              const items = nav.filter(n => n.group === key)
              return (
                <div key={key}>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest px-3 mb-2">{label}</p>
                  <div className="space-y-0.5">
                    {items.map(({ to, label: itemLabel, icon: Icon }) => (
                      <NavLink
                        key={to}
                        to={to}
                        end={to === '/'}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] font-medium transition-all whitespace-nowrap ${
                            isActive
                              ? 'text-white'
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                          }`
                        }
                        style={({ isActive }) => isActive ? { background: 'var(--color-primary)' } : {}}
                      >
                        {({ isActive }) => (
                          <>
                            <Icon size={15} className={isActive ? 'text-white shrink-0' : 'text-gray-400 shrink-0'} />
                            <span className="truncate">{itemLabel}</span>
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
          <div className="px-3 py-4" style={{ borderTop: '1px solid var(--color-border)' }}>
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gray-50">
              <div
                className="flex items-center justify-center w-8 h-8 rounded-full text-[12px] font-bold text-white shrink-0"
                style={{ background: 'var(--color-primary)' }}
              >
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-gray-800 truncate leading-none">{user?.firstName} {user?.lastName}</p>
                <p className="text-[11px] text-gray-400 truncate mt-0.5">{user?.role?.replace(/_/g, ' ')}</p>
              </div>
              <button
                onClick={logout}
                title="Logout"
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded cursor-pointer shrink-0"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
