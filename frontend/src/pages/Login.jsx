import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login as loginRequest } from '../api/auth'
import { useAuth } from '../context/AuthContext'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const style = document.createElement('style')
    style.id = 'login-animations'
    style.textContent = `
      @keyframes gradientShift {
        0%   { background-position: 0% 50%; }
        50%  { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      @keyframes fadeSlideUp {
        from { opacity: 0; transform: translateY(30px); }
        to   { opacity: 1; transform: translateY(0); }
      }
    `
    if (!document.getElementById('login-animations')) {
      document.head.appendChild(style)
    }
    return () => {
      const existing = document.getElementById('login-animations')
      if (existing) existing.remove()
    }
  }, [])

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

  const inputStyle = {
    width: '100%',
    padding: '14px',
    borderRadius: 8,
    border: '1px solid #e2e8f0',
    fontSize: 15,
    outline: 'none',
    boxSizing: 'border-box',
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(-45deg, #667eea, #764ba2, #f64f59, #667eea)',
      backgroundSize: '400% 400%',
      animation: 'gradientShift 8s ease infinite',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background blobs */}
      <div style={{
        position: 'absolute',
        top: '-60px',
        left: '-60px',
        width: 300,
        height: 300,
        borderRadius: '50%',
        background: '#764ba2',
        filter: 'blur(80px)',
        opacity: 0.3,
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-60px',
        right: '-60px',
        width: 300,
        height: 300,
        borderRadius: '50%',
        background: '#667eea',
        filter: 'blur(80px)',
        opacity: 0.3,
        pointerEvents: 'none',
      }} />

      <div style={{
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        padding: '40px',
        maxWidth: 420,
        width: '100%',
        position: 'relative',
        animation: 'fadeSlideUp 0.6s ease-out both',
      }}>
        <h2 style={{ margin: '0 0 4px', fontSize: 28, fontWeight: 800, color: '#1a202c' }}>
          Welcome Back
        </h2>
        <p style={{ margin: '0 0 28px', fontSize: 15, color: '#718096' }}>
          Sign in to your account
        </p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={inputStyle}
          />
          {error && <p style={{ color: '#e53e3e', margin: 0, fontSize: 14 }}>{error}</p>}
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: 8,
              border: 'none',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: '#fff',
              fontSize: 16,
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            Log In
          </button>
        </form>
        <p style={{ marginTop: 20, textAlign: 'center', fontSize: 14, color: '#718096' }}>
          Don&apos;t have an account?{' '}
          <Link to="/register" style={{ color: '#667eea', fontWeight: 600, textDecoration: 'none' }}>
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login
