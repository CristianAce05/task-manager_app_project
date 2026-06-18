import axios from 'axios'

const BASE_URL = 'http://localhost:5000'

function authHeaders(token) {
  return { headers: { Authorization: `Bearer ${token}` } }
}

export function getTasks(token) {
  return axios.get(`${BASE_URL}/api/tasks`, authHeaders(token))
}

export function createTask(token, taskData) {
  return axios.post(`${BASE_URL}/api/tasks`, taskData, authHeaders(token))
}

export function updateTask(token, id, taskData) {
  return axios.put(`${BASE_URL}/api/tasks/${id}`, taskData, authHeaders(token))
}

export function deleteTask(token, id) {
  return axios.delete(`${BASE_URL}/api/tasks/${id}`, authHeaders(token))
}
