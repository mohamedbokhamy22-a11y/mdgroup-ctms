import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Activity, Shield, Zap, Globe } from 'lucide-react'

const features = [
  { icon: Shield, label: 'GCP Compliant',    desc: 'FDA 21 CFR Part 11 audit-ready workflows and electronic records' },
  { icon: Zap,    label: 'Real-time Ops',    desc: 'Live visit scheduling, payment processing, and AE monitoring' },
  { icon: Globe,  label: 'Multi-site Ready', desc: 'Coordinate participants across global investigator networks' },
]

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#070D1C', fontFamily: "'Fira Sans', system-ui, sans-serif" }}>

      {/* ── Left panel ── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[52%] relative overflow-hidden p-10"
        style={{
          background: 'linear-gradient(160deg, #0F172A 0%, #1E293B 60%, #0F172A 100%)',
          borderRight: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        {/* Ambient */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full" style={{ background: 'radial-gradient(circle, rgba(3,105,161,0.15) 0%, transparent 65%)' }} />
          <div className="absolute bottom-0 right-0 w-64 h-64" style={{ background: 'radial-gradient(circle, rgba(30,64,175,0.12) 0%, transparent 65%)', transform: 'translate(30%,30%)' }} />
        </div>

        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div
              className="flex items-center justify-center w-10 h-10 rounded-xl"
              style={{
                background: 'linear-gradient(135deg, #1E40AF 0%, #0369A1 100%)',
                boxShadow: '0 0 0 1px rgba(3,105,161,0.4), 0 6px 20px rgba(3,105,161,0.35)',
              }}
            >
              <Activity size={18} className="text-white" />
            </div>
            <div>
              <p className="text-white font-black text-[24px] leading-none tracking-tight">MDGroup</p>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.15em] mt-0.5">Research Network</p>
            </div>
          </div>

          {/* Headline */}
          <h2 className="text-[32px] font-black text-white leading-[1.15] tracking-tight">
            Clinical Trial<br />
            <span style={{ color: '#38BDF8' }}>Management</span><br />
            Platform
          </h2>
          <p className="text-slate-400 text-[17px] mt-4 leading-relaxed max-w-xs">
            The unified operations platform for coordinating MDGroup's global clinical research programs.
          </p>

          {/* Feature cards */}
          <div className="mt-8 space-y-2.5">
            {features.map(({ icon: Icon, label, desc }) => (
              <div
                key={label}
                className="flex items-start gap-3 p-3.5 rounded-xl"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div
                  className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
                  style={{ background: 'rgba(3,105,161,0.18)', border: '1px solid rgba(3,105,161,0.25)' }}
                >
                  <Icon size={14} style={{ color: '#38BDF8' }} />
                </div>
                <div>
                  <p className="text-white text-[16px] font-bold leading-none">{label}</p>
                  <p className="text-slate-500 text-[17px] mt-1 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-slate-700 text-[17px]">
          &copy; {new Date().getFullYear()} MDGroup Clinical Research. All rights reserved.
        </p>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-14">

        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl" style={{ background: 'linear-gradient(135deg, #1E40AF, #0369A1)', boxShadow: '0 4px 14px rgba(30,64,175,0.4)' }}>
            <Activity size={16} className="text-white" />
          </div>
          <p className="text-white font-black text-[24px]">MDGroup CTMS</p>
        </div>

        <div className="w-full max-w-[380px]">
          {/* Card */}
          <div
            className="rounded-2xl p-7"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)',
            }}
          >
            <div className="mb-6">
              <h3 className="text-[24px] font-black text-white tracking-tight">Sign in</h3>
              <p className="text-slate-500 text-[16px] mt-1">Enter your credentials to access the platform</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2.5"
                  style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)' }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                  <p className="text-red-400 text-[16px]">{error}</p>
                </div>
              )}

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-[17px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@mdgroup.com"
                  className="w-full rounded-lg px-3.5 py-2.5 text-[17px] text-white placeholder-slate-600"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    outline: 'none',
                  }}
                  onFocus={e => { e.target.style.border = '1px solid rgba(3,105,161,0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(3,105,161,0.15)' }}
                  onBlur={e => { e.target.style.border = '1px solid rgba(255,255,255,0.1)'; e.target.style.boxShadow = '' }}
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-[17px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg px-3.5 py-2.5 text-[17px] text-white placeholder-slate-600"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    outline: 'none',
                  }}
                  onFocus={e => { e.target.style.border = '1px solid rgba(3,105,161,0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(3,105,161,0.15)' }}
                  onBlur={e => { e.target.style.border = '1px solid rgba(255,255,255,0.1)'; e.target.style.boxShadow = '' }}
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-[17px] font-bold text-white transition-all mt-1 cursor-pointer disabled:opacity-60"
                style={{
                  background: loading ? 'rgba(30,64,175,0.5)' : 'linear-gradient(135deg, #1E40AF 0%, #0369A1 100%)',
                  boxShadow: loading ? 'none' : '0 4px 16px rgba(30,64,175,0.4)',
                }}
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Signing in…
                  </>
                ) : 'Sign in to MDGroup'}
              </button>
            </form>
          </div>

          {/* Demo credentials */}
          <div
            className="mt-3 rounded-xl px-4 py-3"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1.5">Demo credentials</p>
            <p className="font-mono text-[16px] text-slate-500">admin@mdgroup.com</p>
            <p className="font-mono text-[16px] text-slate-500">Password123!</p>
          </div>
        </div>
      </div>
    </div>
  )
}
