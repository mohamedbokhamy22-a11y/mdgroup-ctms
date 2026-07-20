import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useAuth } from '../../context/AuthContext'
import { Bell, Search } from 'lucide-react'

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/':               { title: 'Dashboard',      subtitle: 'Clinical trial operations overview' },
  '/studies':        { title: 'Studies',         subtitle: 'Manage protocols and trial phases' },
  '/sponsors':       { title: 'Sponsors',        subtitle: 'Pharmaceutical and biotech partners' },
  '/sites':          { title: 'Sites',           subtitle: 'Research sites and investigator locations' },
  '/participants':   { title: 'Participants',    subtitle: 'Enrolled patients and contact information' },
  '/visits':         { title: 'Visits',          subtitle: 'Scheduled and completed clinical visits' },
  '/payments':       { title: 'Payments',        subtitle: 'Participant stipends and reimbursements' },
  '/messages':       { title: 'Messages',        subtitle: 'Participant and coordinator communications' },
  '/adverse-events': { title: 'Adverse Events',  subtitle: 'Safety monitoring and reporting' },
  '/reports':        { title: 'Reports',         subtitle: 'Analytics and operational insights' },
}

export default function AppShell() {
  const { user } = useAuth()
  const location = useLocation()
  const page = pageTitles[location.pathname] ?? { title: 'MDGroup CTMS', subtitle: '' }

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--color-background)' }}>
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header
          className="flex items-center justify-between px-6 shrink-0"
          style={{
            height: 'var(--header-height)',
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          {/* Page info */}
          <div>
            <h1 className="text-[14px] font-bold text-slate-900 leading-none">{page.title}</h1>
            {page.subtitle && (
              <p className="text-[11px] text-slate-400 mt-0.5 font-medium">{page.subtitle}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-slate-400 cursor-pointer transition-colors hover:bg-slate-100"
              style={{ border: '1px solid var(--color-border)', background: 'var(--color-muted)' }}
            >
              <Search size={13} />
              <span className="text-[12px] hidden sm:block">Search…</span>
              <kbd className="hidden sm:block text-[10px] px-1 py-0.5 rounded bg-white text-slate-400 font-mono border border-slate-200">⌘K</kbd>
            </div>

            {/* Bell */}
            <button
              className="relative flex items-center justify-center w-8 h-8 rounded-lg transition-colors hover:bg-slate-100 cursor-pointer"
              style={{ border: '1px solid var(--color-border)' }}
            >
              <Bell size={14} className="text-slate-500" />
              <span
                className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full border border-white"
                style={{ background: 'var(--color-accent)' }}
              />
            </button>

            {/* Divider */}
            <div className="w-px h-5 bg-slate-200 mx-1" />

            {/* Avatar */}
            <div className="flex items-center gap-2 cursor-pointer">
              <div
                className="flex items-center justify-center w-7 h-7 rounded-full text-[10px] font-bold text-white"
                style={{
                  background: 'linear-gradient(135deg, #1E40AF 0%, #0369A1 100%)',
                  boxShadow: '0 0 0 2px rgba(30,64,175,0.2)',
                }}
              >
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <div className="hidden sm:block">
                <p className="text-[12px] font-semibold text-slate-800 leading-none">{user?.firstName} {user?.lastName}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{user?.role?.replace(/_/g, ' ')}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
