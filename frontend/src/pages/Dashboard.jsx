import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getTasks, createTask, updateTask, deleteTask } from '../api/tasks'

const EMPTY_FORM = { title: '', description: '', status: 'pending', due_date: '' }

function Dashboard() {
  const { token, logout } = useAuth()
  const navigate = useNavigate()

  const [tasks, setTasks] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [darkMode, setDarkMode] = useState(false)

  const theme = {
    background: darkMode ? '#1a1a2e' : '#f5f5f5',
    color: darkMode ? '#e0e0e0' : '#111',
    cardBg: darkMode ? '#16213e' : '#fff',
    border: darkMode ? '#0f3460' : '#ddd',
    inputBg: darkMode ? '#0f3460' : '#fff',
    inputColor: darkMode ? '#e0e0e0' : '#111',
  }

  useEffect(() => {
    if (!token) { navigate('/'); return }
    fetchTasks()
  }, [token])

  async function fetchTasks() {
    try {
      const res = await getTasks(token)
      setTasks(res.data.tasks)
    } catch {
      setError('Failed to load tasks.')
    }
  }

  function handleEdit(task) {
    setEditingId(task.id)
    setForm({
      title: task.title || '',
      description: task.description || '',
      status: task.status || 'pending',
      due_date: task.due_date ? task.due_date.slice(0, 10) : '',
    })
  }

  function handleCancelEdit() {
    setEditingId(null)
    setForm(EMPTY_FORM)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      if (editingId) {
        const res = await updateTask(token, editingId, form)
        setTasks(prev => prev.map(t => t.id === editingId ? res.data.task : t))
        setEditingId(null)
      } else {
        const res = await createTask(token, form)
        setTasks(prev => [...prev, res.data.task])
      }
      setForm(EMPTY_FORM)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save task.')
    }
  }

  async function handleDelete(id) {
    try {
      await deleteTask(token, id)
      setTasks(prev => prev.filter(t => t.id !== id))
    } catch {
      setError('Failed to delete task.')
    }
  }

  function handleLogout() {
    logout()
    navigate('/')
  }

  const inputStyle = {
    padding: '8px 12px',
    fontSize: 14,
    background: theme.inputBg,
    color: theme.inputColor,
    border: `1px solid ${theme.border}`,
    borderRadius: 4,
  }

  return (
    <div style={{ minHeight: '100vh', background: theme.background, color: theme.color, padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>My Tasks</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setDarkMode(d => !d)} style={{ padding: '6px 14px', cursor: 'pointer' }}>
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button onClick={handleLogout} style={{ padding: '6px 14px', cursor: 'pointer' }}>
            Log Out
          </button>
        </div>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Task Form */}
      <div style={{ background: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: 8, padding: 20, marginBottom: 32 }}>
        <h3 style={{ marginTop: 0 }}>{editingId ? 'Edit Task' : 'New Task'}</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input
            type="text"
            placeholder="Title"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            required
            style={inputStyle}
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            rows={3}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
          <select
            value={form.status}
            onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
            style={inputStyle}
          >
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <input
            type="date"
            value={form.due_date}
            onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
            style={inputStyle}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" style={{ padding: '8px 20px', cursor: 'pointer' }}>
              {editingId ? 'Update Task' : 'Add Task'}
            </button>
            {editingId && (
              <button type="button" onClick={handleCancelEdit} style={{ padding: '8px 20px', cursor: 'pointer' }}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Task List */}
      {tasks.length === 0 ? (
        <p>No tasks yet. Create one above.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {tasks.map(task => (
            <div
              key={task.id}
              style={{
                background: theme.cardBg,
                border: `1px solid ${theme.border}`,
                borderRadius: 8,
                padding: 16,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: 12,
              }}
            >
              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: 16 }}>{task.title}</strong>
                {task.description && <p style={{ margin: '4px 0', fontSize: 14 }}>{task.description}</p>}
                <div style={{ fontSize: 13, marginTop: 4, display: 'flex', gap: 16 }}>
                  <span>Status: <em>{task.status}</em></span>
                  {task.due_date && <span>Due: {task.due_date.slice(0, 10)}</span>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button onClick={() => handleEdit(task)} style={{ padding: '4px 12px', cursor: 'pointer' }}>
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(task.id)}
                  style={{ padding: '4px 12px', cursor: 'pointer', color: '#fff', background: '#c0392b', border: 'none', borderRadius: 4 }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Dashboard
