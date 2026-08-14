import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useAuth } from '../../context/AuthContext'
import { Bell, Search, Menu } from 'lucide-react'

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
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--color-background)' }}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <header
          className="flex items-center justify-between px-5 shrink-0 z-10"
          style={{
            height: 'var(--header-height)',
            background: '#FFFFFF',
            borderBottom: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-xs)',
          }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(v => !v)}
              className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <Menu size={18} />
            </button>

            <div>
              <h1 className="text-[16px] font-semibold text-gray-900 leading-none">{page.title}</h1>
              {page.subtitle && (
                <p className="text-[13px] text-gray-400 mt-0.5">{page.subtitle}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-400 cursor-pointer transition-colors hover:bg-gray-50"
              style={{ border: '1px solid var(--color-border)' }}
            >
              <Search size={14} />
              <span className="text-[14px] hidden sm:block text-gray-500">Search…</span>
              <kbd className="hidden sm:block text-[11px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-400 font-sans border border-gray-200">⌘K</kbd>
            </div>

            <button
              className="relative flex items-center justify-center w-9 h-9 rounded-lg transition-colors hover:bg-gray-50 cursor-pointer"
              style={{ border: '1px solid var(--color-border)' }}
            >
              <Bell size={15} className="text-gray-500" />
              <span
                className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full border border-white"
                style={{ background: 'var(--color-accent)' }}
              />
            </button>

            <div className="w-px h-6 bg-gray-200 mx-1" />

            <div className="flex items-center gap-2.5 cursor-pointer">
              <div
                className="flex items-center justify-center w-8 h-8 rounded-full text-[12px] font-bold text-white shrink-0"
                style={{ background: 'var(--color-primary)' }}
              >
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <div className="hidden sm:block">
                <p className="text-[14px] font-semibold text-gray-800 leading-none">{user?.firstName} {user?.lastName}</p>
                <p className="text-[12px] text-gray-400 mt-0.5">{user?.role?.replace(/_/g, ' ')}</p>
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
