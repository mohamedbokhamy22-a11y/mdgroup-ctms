import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Activity, CheckCircle } from 'lucide-react'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Invalid credentials. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl flex rounded-2xl overflow-hidden shadow-2xl">

        {/* Left — Branding */}
        <div className="hidden md:flex flex-col justify-between w-1/2 bg-gradient-to-br from-slate-800 to-slate-900 p-10 border-r border-slate-700">
          <div>
            {/* Logo */}
            <div className="flex items-center gap-3 mb-10">
              <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-blue-600">
                <Activity size={22} className="text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-lg leading-none">MDGroup</p>
                <p className="text-blue-400 text-xs mt-0.5 tracking-wide uppercase">Research Network</p>
              </div>
            </div>

            {/* Headline */}
            <h2 className="text-3xl font-bold text-white leading-snug">
              Clinical Trial<br />Management System
            </h2>
            <p className="text-slate-400 mt-3 text-sm leading-relaxed">
              A unified platform for coordinating every stage of your clinical research operations.
            </p>

            {/* Feature bullets */}
            <ul className="mt-8 space-y-4">
              {[
                {
                  title: 'Patient Coordination',
                  desc: 'Schedule visits, track enrollments, and manage participant communications in one place.',
                },
                {
                  title: 'Study Management',
                  desc: 'Oversee multi-site protocols, arms, and milestones with real-time status visibility.',
                },
                {
                  title: 'Compliance Tracking',
                  desc: 'Monitor adverse events, audit trails, and regulatory deadlines to stay inspection-ready.',
                },
              ].map(({ title, desc }) => (
                <li key={title} className="flex items-start gap-3">
                  <CheckCircle size={18} className="text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white text-sm font-semibold">{title}</p>
                    <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Footer note */}
          <p className="text-slate-600 text-xs mt-10">
            &copy; {new Date().getFullYear()} MDGroup Clinical Research. All rights reserved.
          </p>
        </div>

        {/* Right — Login form */}
        <div className="flex flex-col justify-center w-full md:w-1/2 bg-white p-10">
          {/* Mobile logo */}
          <div className="flex md:hidden items-center gap-2 mb-8">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-600">
              <Activity size={18} className="text-white" />
            </div>
            <p className="text-slate-800 font-bold text-lg">MDGroup CTMS</p>
          </div>

          <h3 className="text-2xl font-bold text-slate-900">Sign in to your account</h3>
          <p className="text-slate-500 text-sm mt-1">Enter your credentials to access the platform.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {/* Error alert */}
            {error && (
              <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
                <svg
                  className="w-4 h-4 text-red-500 shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.75-11.25a.75.75 0 011.5 0v4.5a.75.75 0 01-1.5 0v-4.5zm.75 7.5a.75.75 0 100-1.5.75.75 0 000 1.5z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@mdgroup.com"
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold text-sm py-2.5 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in…
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-8 rounded-lg bg-slate-50 border border-slate-200 px-4 py-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
              Demo credentials
            </p>
            <p className="text-xs text-slate-600 font-mono">
              admin@mdgroup.com&nbsp;/&nbsp;Password123!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
