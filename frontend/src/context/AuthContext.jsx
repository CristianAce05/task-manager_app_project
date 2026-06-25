import { createContext, useContext, useState } from 'react'
import { jwtDecode } from 'jwt-decode'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    const stored = localStorage.getItem('token')
    if (!stored) return null
    try {
      const decoded = jwtDecode(stored)
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem('token')
        return null
      }
      return stored
    } catch {
      localStorage.removeItem('token')
      return null
    }
  })
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('token')
    if (!stored) return null
    try {
      const decoded = jwtDecode(stored)
      if (decoded.exp && decoded.exp * 1000 < Date.now()) return null
      return decoded
    } catch {
      return null
    }
  })

  function login(newToken) {
    localStorage.setItem('token', newToken)
    setToken(newToken)
    try {
      setUser(jwtDecode(newToken))
    } catch {
      setUser(null)
    }
  }

  function logout() {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
