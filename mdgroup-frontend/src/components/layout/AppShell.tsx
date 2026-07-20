import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useAuth } from '../../context/AuthContext'
import { Bell } from 'lucide-react'

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/studies': 'Studies',
  '/sponsors': 'Sponsors',
  '/sites': 'Sites',
  '/participants': 'Participants',
  '/visits': 'Visits',
  '/payments': 'Payments',
  '/messages': 'Messages',
  '/adverse-events': 'Adverse Events',
  '/reports': 'Reports',
}

export default function AppShell() {
  const { user } = useAuth()
  const location = useLocation()
  const title = pageTitles[location.pathname] ?? 'MDGroup CTMS'

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-slate-200 shrink-0">
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">MDGroup CTMS</p>
            <h1 className="text-lg font-bold text-slate-800 leading-tight">{title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors">
              <Bell size={17} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500" />
            </button>
            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 text-xs font-bold text-white">
                {user?.firstName[0]}{user?.lastName[0]}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-slate-700 leading-none">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-slate-400 mt-0.5">{user?.role?.replace(/_/g, ' ')}</p>
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
