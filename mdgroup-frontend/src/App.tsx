import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import AppShell from './components/layout/AppShell'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Studies from './pages/Studies'
import StudyDetail from './pages/StudyDetail'
import Participants from './pages/Participants'
import ParticipantDetail from './pages/ParticipantDetail'
import Visits from './pages/Visits'
import Payments from './pages/Payments'
import Messages from './pages/Messages'
import AdverseEvents from './pages/AdverseEvents'
import Sponsors from './pages/Sponsors'
import Sites from './pages/Sites'
import Reports from './pages/Reports'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full border-2 border-blue-600 border-t-transparent w-10 h-10" />
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="studies" element={<Studies />} />
        <Route path="studies/:id" element={<StudyDetail />} />
        <Route path="sponsors" element={<Sponsors />} />
        <Route path="sites" element={<Sites />} />
        <Route path="participants" element={<Participants />} />
        <Route path="participants/:id" element={<ParticipantDetail />} />
        <Route path="visits" element={<Visits />} />
        <Route path="payments" element={<Payments />} />
        <Route path="messages" element={<Messages />} />
        <Route path="adverse-events" element={<AdverseEvents />} />
        <Route path="reports" element={<Reports />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
