import { createContext, useContext, useState } from 'react'
import { jwtDecode } from 'jwt-decode'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token') || null)
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('token')
    try {
      return stored ? jwtDecode(stored) : null
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
