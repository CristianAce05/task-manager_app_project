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
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const theme = {
    background: darkMode ? '#1a202c' : '#f7fafc',
    color: darkMode ? '#e2e8f0' : '#1a202c',
    cardBg: darkMode ? '#2d3748' : '#fff',
    inputBg: darkMode ? '#4a5568' : '#fff',
    inputColor: darkMode ? '#e2e8f0' : '#1a202c',
    inputBorder: darkMode ? '#4a5568' : '#e2e8f0',
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

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter
    return matchesSearch && matchesStatus
  })

  function clearFilters() {
    setSearchQuery('')
    setStatusFilter('all')
  }

  function handleLogout() {
    logout()
    navigate('/')
  }

  const cardStyle = {
    background: theme.cardBg,
    borderRadius: 12,
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    padding: '24px',
    marginBottom: 24,
  }

  const inputStyle = {
    width: '100%',
    padding: '12px',
    fontSize: 14,
    background: theme.inputBg,
    color: theme.inputColor,
    border: `1px solid ${theme.inputBorder}`,
    borderRadius: 8,
    boxSizing: 'border-box',
    outline: 'none',
  }

  const gradientBtn = {
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '12px 24px',
    fontSize: 14,
    fontWeight: 'bold',
    cursor: 'pointer',
  }

  const statusBadge = {
    pending:     { background: '#ed8936', color: '#fff' },
    in_progress: { background: '#4299e1', color: '#fff' },
    completed:   { background: '#48bb78', color: '#fff' },
  }

  return (
    <div style={{ minHeight: '100vh', background: theme.background, color: theme.color }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        padding: '20px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32,
      }}>
        <span style={{ color: '#fff', fontSize: 22, fontWeight: 800 }}>TaskManager</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setDarkMode(d => !d)}
            style={{ padding: '8px 16px', cursor: 'pointer', background: 'transparent', color: '#fff', border: '1px solid #fff', borderRadius: 8, fontSize: 14 }}
          >
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button
            onClick={handleLogout}
            style={{ padding: '8px 16px', cursor: 'pointer', background: 'transparent', color: '#fff', border: '1px solid #fff', borderRadius: 8, fontSize: 14 }}
          >
            Log Out
          </button>
        </div>
      </div>

      <div style={{ padding: '0 32px 32px' }}>
        {error && <p style={{ color: '#e53e3e', marginBottom: 16 }}>{error}</p>}

        {/* Search and Filter Controls */}
        <div style={{ ...cardStyle, padding: 20 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Search by title..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ ...inputStyle, flex: '1 1 200px' }}
            />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{ ...inputStyle, flex: '0 1 160px' }}
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <button
              onClick={clearFilters}
              style={{ padding: '12px 20px', cursor: 'pointer', borderRadius: 8, border: `1px solid ${theme.inputBorder}`, background: theme.cardBg, color: theme.color, fontSize: 14 }}
            >
              Clear filters
            </button>
          </div>
        </div>

        {/* Task Form */}
        <div style={cardStyle}>
          <h3 style={{ marginTop: 0, marginBottom: 16, fontSize: 18, fontWeight: 700 }}>
            {editingId ? 'Edit Task' : 'New Task'}
          </h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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
              <button type="submit" style={gradientBtn}>
                {editingId ? 'Update Task' : 'Add Task'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  style={{ ...gradientBtn, background: 'transparent', color: theme.color, border: `1px solid ${theme.inputBorder}` }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Task List */}
        {filteredTasks.length === 0 ? (
          <p style={{ color: theme.color }}>{tasks.length === 0 ? 'No tasks yet. Create one above.' : 'No tasks match your filters.'}</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filteredTasks.map(task => (
              <div
                key={task.id}
                style={{
                  background: theme.cardBg,
                  borderRadius: 12,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  padding: 20,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 12,
                }}
              >
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: 16, color: theme.color }}>{task.title}</strong>
                  {task.description && (
                    <p style={{ margin: '6px 0', fontSize: 14, color: theme.color, opacity: 0.8 }}>{task.description}</p>
                  )}
                  <div style={{ marginTop: 8, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{
                      ...(statusBadge[task.status] || { background: '#718096', color: '#fff' }),
                      padding: '3px 10px',
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 600,
                    }}>
                      {task.status.replace('_', ' ')}
                    </span>
                    {task.due_date && (
                      <span style={{ fontSize: 13, color: theme.color, opacity: 0.7 }}>
                        Due: {task.due_date.slice(0, 10)}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button
                    onClick={() => handleEdit(task)}
                    style={{ padding: '6px 14px', cursor: 'pointer', background: 'transparent', color: '#667eea', border: '1px solid #667eea', borderRadius: 8, fontSize: 13, fontWeight: 600 }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    style={{ padding: '6px 14px', cursor: 'pointer', background: '#e53e3e', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600 }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
