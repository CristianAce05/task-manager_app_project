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
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      {/* Ambient glow blobs — brand color, static-safe under reduced motion */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '-120px',
          left: '-100px',
          width: 340,
          height: 340,
          borderRadius: '50%',
          background: 'var(--primary)',
          filter: 'blur(90px)',
          opacity: 0.22,
          animation: 'floatGlow 10s ease-in-out infinite',
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: '-140px',
          right: '-100px',
          width: 380,
          height: 380,
          borderRadius: '50%',
          background: 'var(--accent)',
          filter: 'blur(100px)',
          opacity: 0.18,
          animation: 'floatGlow 12s ease-in-out infinite reverse',
          pointerEvents: 'none',
        }}
      />

      <button
        type="button"
        onClick={toggleTheme}
        className="btn btn-ghost btn-sm"
        style={{ position: 'absolute', top: 20, right: 20 }}
        aria-label="Toggle dark mode"
      >
        {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
      </button>

      <div
        className="card anim-fade-up"
        style={{ maxWidth: 420, width: '100%', position: 'relative', zIndex: 1 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <svg width="30" height="30" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="14" stroke="var(--primary)" strokeWidth="2.5" />
            <polyline points="9,16 14,21 23,11" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: 'var(--ink)' }}>
            Welcome back
          </h1>
        </div>
        <p style={{ margin: '0 0 24px', fontSize: 15, color: 'var(--muted)' }}>
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
  )
}

export default Login
