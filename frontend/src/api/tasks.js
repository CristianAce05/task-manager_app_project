import axios from 'axios'

function authHeaders(token) {
  return { headers: { Authorization: `Bearer ${token}` } }
}

export function getTasks(token) {
  return axios.get('/api/tasks', authHeaders(token))
}

export function createTask(token, taskData) {
  return axios.post('/api/tasks', taskData, authHeaders(token))
}

export function updateTask(token, id, taskData) {
  return axios.put(`/api/tasks/${id}`, taskData, authHeaders(token))
}

export function deleteTask(token, id) {
  return axios.delete(`/api/tasks/${id}`, authHeaders(token))
}
