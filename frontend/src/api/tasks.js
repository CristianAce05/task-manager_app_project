import api from './client'

function authHeaders(token) {
  return { headers: { Authorization: `Bearer ${token}` } }
}

export function getTasks(token) {
  return api.get('/api/tasks', authHeaders(token))
}

export function createTask(token, taskData) {
  return api.post('/api/tasks', taskData, authHeaders(token))
}

export function updateTask(token, id, taskData) {
  return api.put(`/api/tasks/${id}`, taskData, authHeaders(token))
}

export function deleteTask(token, id) {
  return api.delete(`/api/tasks/${id}`, authHeaders(token))
}
