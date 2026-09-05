import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login as loginRequest } from '../api/auth'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

const DEMO_EMAIL = 'demo@taskmanager.app'
const DEMO_PASSWORD = 'DemoPass2026!'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [demoLoading, setDemoLoading] = useState(false)
  const { login, token } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  useEffect(() => {
    if (token) { navigate('/dashboard'); return }
  }, [token, navigate])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      const res = await loginRequest(email, password)
      login(res.data.token)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.')
    }
  }

  async function handleTryDemo() {
    setError('')
    setDemoLoading(true)
    try {
      const res = await loginRequest(DEMO_EMAIL, DEMO_PASSWORD)
      login(res.data.token)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Demo login failed. Please try again.')
      setDemoLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg)' }}>
      {/* Brand panel — hidden on narrow screens */}
      <div
        className="login-brand-panel"
        style={{
          flex: '1 1 45%',
          background: 'linear-gradient(155deg, var(--primary), #2a1a4a 65%)',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '48px 56px',
          color: '#fff',
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', top: '-80px', right: '-60px',
            width: 320, height: 320, borderRadius: '50%',
            background: 'var(--accent)', filter: 'blur(90px)', opacity: 0.45,
            animation: 'floatGlow 11s ease-in-out infinite',
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', bottom: '-100px', left: '-40px',
            width: 260, height: 260, borderRadius: '50%',
            background: 'var(--gold)', filter: 'blur(90px)', opacity: 0.3,
            animation: 'floatGlow 14s ease-in-out infinite reverse',
          }}
        />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="30" height="30" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="14" stroke="#fff" strokeWidth="2.5" />
            <polyline points="9,16 14,21 23,11" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800 }}>TaskManager</span>
        </div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 380 }}>
          <h1 style={{ fontSize: 40, fontWeight: 800, lineHeight: 1.1, marginBottom: 16 }}>
            Organize the work that actually matters.
          </h1>
          <p style={{ fontSize: 16, opacity: 0.85, lineHeight: 1.6, fontFamily: 'var(--font-body)' }}>
            Track tasks, deadlines, and progress in one place — built for
            teams who'd rather ship than manage spreadsheets.
          </p>
        </div>

        <p style={{ position: 'relative', zIndex: 1, fontSize: 13, opacity: 0.6, fontFamily: 'var(--font-body)' }}>
          © 2026 TaskManager
        </p>
      </div>

      {/* Form panel */}
      <div
        style={{
          flex: '1 1 55%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          position: 'relative',
        }}
      >
        <button
          type="button"
          onClick={toggleTheme}
          className="btn btn-ghost btn-sm"
          style={{ position: 'absolute', top: 24, right: 24 }}
          aria-label="Toggle dark mode"
        >
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>

        <div className="anim-fade-up" style={{ maxWidth: 380, width: '100%' }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Welcome back</h2>
          <p style={{ margin: '0 0 24px', fontSize: 15, color: 'var(--muted)', fontFamily: 'var(--font-body)' }}>
            Sign in to keep your work moving.
          </p>

          <button
            type="button"
            onClick={handleTryDemo}
            disabled={demoLoading}
            className="btn btn-accent btn-block"
          >
            {demoLoading ? 'Loading demo…' : 'Try the Demo — no signup needed'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>or sign in</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="field"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="field"
            />
            {error && <p style={{ color: 'var(--danger)', margin: 0, fontSize: 14 }}>{error}</p>}
            <button type="submit" className="btn btn-primary btn-block">
              Log In
            </button>
          </form>

          <p style={{ marginTop: 20, textAlign: 'center', fontSize: 14, color: 'var(--muted)' }}>
            Don&apos;t have an account?{' '}
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
              Register
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .login-brand-panel { display: none; }
        }
      `}</style>
    </div>
  )
}

export default Login
