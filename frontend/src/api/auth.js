import axios from 'axios'

export function register(email, password) {
  return axios.post('/api/auth/register', { email, password })
}

export function login(email, password) {
  return axios.post('/api/auth/login', { email, password })
}
