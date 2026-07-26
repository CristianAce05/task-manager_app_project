import api from './client'

export function register(email, password) {
  return api.post('/api/auth/register', { email, password })
}

export function login(email, password) {
  return api.post('/api/auth/login', { email, password })
}
