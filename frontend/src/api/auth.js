import axios from 'axios'

const BASE_URL = 'http://localhost:5000'

export function register(email, password) {
  return axios.post(`${BASE_URL}/api/auth/register`, { email, password })
}

export function login(email, password) {
  return axios.post(`${BASE_URL}/api/auth/login`, { email, password })
}
