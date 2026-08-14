import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, FlaskConical, Building2, Users, CalendarCheck,
  CreditCard, MessageSquare, AlertTriangle, MapPin, LogOut,
  Activity, BarChart3
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

export default function Sidebar({ open, onClose: onToggle }: Props) {
  const { user, logout } = useAuth()

  return (
    <aside
      className="flex flex-col shrink-0 relative z-30"
      style={{
        width: open ? 'var(--sidebar-width)' : 'var(--sidebar-mini)',
        minHeight: '100vh',
        background: '#FFFFFF',
        borderRight: '1px solid var(--color-border)',
        transition: 'width 220ms cubic-bezier(0.4,0,0.2,1)',
        overflow: 'hidden',
      }}
    >
      {/* fixed-width inner so content doesn't reflow during animation */}
      <div
        className="flex flex-col"
        style={{ width: 'var(--sidebar-width)', minHeight: '100vh' }}
      >

        {/* Logo row */}
        <div
          className="flex items-center px-4 shrink-0"
          style={{
            height: 'var(--header-height)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          {/* Icon — always visible, acts as toggle */}
          <button
            onClick={onToggle}
            className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0 cursor-pointer transition-opacity hover:opacity-80"
            style={{ background: 'var(--color-primary)' }}
            title={open ? 'Collapse menu' : 'Expand menu'}
          >
            <Activity size={18} className="text-white" />
          </button>

          {/* Brand name — visible only when expanded */}
          <div
            className="ml-3 overflow-hidden"
            style={{
              opacity: open ? 1 : 0,
              width: open ? '140px' : '0px',
              transition: 'opacity 180ms ease, width 220ms ease',
              whiteSpace: 'nowrap',
            }}
          >
            <p className="font-bold text-[17px] leading-none" style={{ color: 'var(--color-primary)' }}>MDGroup</p>
            <p className="text-[11px] text-gray-400 mt-0.5 font-medium tracking-wider uppercase">CTMS</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
          {groups.map(({ key, label }) => {
            const items = nav.filter(n => n.group === key)
            return (
              <div key={key} className="mb-5">
                {/* Group label — hidden when collapsed */}
                <div
                  className="overflow-hidden"
                  style={{
                    height: open ? '24px' : '0px',
                    opacity: open ? 1 : 0,
                    transition: 'height 200ms ease, opacity 160ms ease',
                  }}
                >
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest px-4 mb-1">
                    {label}
                  </p>
                </div>

                <div className="space-y-0.5 px-2">
                  {items.map(({ to, label: itemLabel, icon: Icon }) => (
                    <NavLink
                      key={to}
                      to={to}
                      end={to === '/'}
                      title={!open ? itemLabel : undefined}
                      className={({ isActive }) =>
                        `flex items-center rounded-lg text-[15px] font-medium transition-all ${
                          open ? 'gap-3 px-3 py-2.5' : 'justify-center py-2.5'
                        } ${
                          isActive
                            ? 'text-white'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`
                      }
                      style={({ isActive }) =>
                        isActive ? { background: 'var(--color-primary)' } : {}
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon
                            size={18}
                            className={isActive ? 'text-white shrink-0' : 'text-gray-400 shrink-0'}
                          />
                          {/* Label — slides in when expanded */}
                          <span
                            className="truncate overflow-hidden"
                            style={{
                              opacity: open ? 1 : 0,
                              maxWidth: open ? '160px' : '0px',
                              transition: 'opacity 160ms ease, max-width 200ms ease',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {itemLabel}
                          </span>
                        </>
                      )}
                    </NavLink>
                  ))}
                </div>
              </div>
            )
          })}
        </nav>

        {/* User footer */}
        <div className="px-2 py-3 shrink-0" style={{ borderTop: '1px solid var(--color-border)' }}>
          <div
            className={`flex items-center rounded-lg bg-gray-50 transition-all ${
              open ? 'gap-3 px-3 py-2.5' : 'justify-center py-2.5'
            }`}
            title={!open ? `${user?.firstName} ${user?.lastName}` : undefined}
          >
            <div
              className="flex items-center justify-center w-8 h-8 rounded-full text-[13px] font-bold text-white shrink-0"
              style={{ background: 'var(--color-primary)' }}
            >
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>

            <div
              className="flex-1 min-w-0 overflow-hidden"
              style={{
                opacity: open ? 1 : 0,
                maxWidth: open ? '140px' : '0px',
                transition: 'opacity 160ms ease, max-width 200ms ease',
              }}
            >
              <p className="text-[14px] font-semibold text-gray-800 truncate leading-none whitespace-nowrap">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-[12px] text-gray-400 truncate mt-0.5 whitespace-nowrap">
                {user?.role?.replace(/_/g, ' ')}
              </p>
            </div>

            <button
              onClick={logout}
              title="Logout"
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded cursor-pointer shrink-0"
              style={{
                opacity: open ? 1 : 0,
                width: open ? 'auto' : '0px',
                overflow: 'hidden',
                transition: 'opacity 160ms ease, width 200ms ease',
              }}
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
