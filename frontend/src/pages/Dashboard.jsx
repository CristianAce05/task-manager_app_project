import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getTasks, createTask, updateTask, deleteTask } from '../api/tasks'

const EMPTY_FORM = { title: '', description: '', status: 'pending', due_date: '' }

const QUOTES = [
  "The secret of getting ahead is getting started.",
  "Focus on being productive instead of busy.",
  "Small progress is still progress.",
  "Done is better than perfect.",
  "One task at a time.",
]

function parseLocalDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

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
  const [hoveredBtn, setHoveredBtn] = useState(null)

  const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)])

  function hoverProps(key) {
    return {
      onMouseEnter: () => setHoveredBtn(key),
      onMouseLeave: () => setHoveredBtn(null),
    }
  }

  function hoverStyle(key) {
    return hoveredBtn === key
      ? { transform: 'scale(1.03)', transition: 'all 0.2s ease' }
      : { transform: 'scale(1)', transition: 'all 0.2s ease' }
  }

  const theme = {
    background: darkMode ? '#1a202c' : '#f7fafc',
    color: darkMode ? '#e2e8f0' : '#1a202c',
    cardBg: darkMode ? '#2d3748' : '#fff',
    inputBg: darkMode ? '#4a5568' : '#fff',
    inputColor: darkMode ? '#e2e8f0' : '#1a202c',
    inputBorder: darkMode ? '#4a5568' : '#e2e8f0',
  }

  const fetchTasks = useCallback(async () => {
    try {
      const res = await getTasks(token)
      setTasks(res.data.tasks)
    } catch {
      setError('Failed to load tasks.')
    }
  }, [token])

  useEffect(() => {
    if (!token) { navigate('/'); return }
    fetchTasks()
  }, [token, navigate, fetchTasks])

  useEffect(() => {
    const style = document.createElement('style')
    style.id = 'dashboard-animations'
    style.textContent = `
      @keyframes fadeSlideIn {
        from { opacity: 0; transform: translateX(-20px); }
        to   { opacity: 1; transform: translateX(0); }
      }
      @keyframes floatAnim {
        0%   { transform: translateY(0px); }
        50%  { transform: translateY(-12px); }
        100% { transform: translateY(0px); }
      }
    `
    if (!document.getElementById('dashboard-animations')) {
      document.head.appendChild(style)
    }
    return () => {
      const existing = document.getElementById('dashboard-animations')
      if (existing) existing.remove()
    }
  }, [])

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
    setError('')
    try {
      await deleteTask(token, id)
      setTasks(prev => prev.filter(t => t.id !== id))
    } catch {
      setError('Failed to delete task.')
    }
  }

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = (task.title || '').toLowerCase().includes(searchQuery.toLowerCase())
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
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: 10 }}>
            <circle cx="16" cy="16" r="14" stroke="#fff" strokeWidth="2.5" />
            <polyline points="9,16 14,21 23,11" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ color: '#fff', fontSize: 22, fontWeight: 800 }}>TaskManager</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setDarkMode(d => !d)}
            style={{ padding: '8px 16px', cursor: 'pointer', background: 'transparent', color: '#fff', border: '1px solid #fff', borderRadius: 8, fontSize: 14, ...hoverStyle('darkMode') }}
            {...hoverProps('darkMode')}
          >
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button
            onClick={handleLogout}
            style={{ padding: '8px 16px', cursor: 'pointer', background: 'transparent', color: '#fff', border: '1px solid #fff', borderRadius: 8, fontSize: 14, ...hoverStyle('logout') }}
            {...hoverProps('logout')}
          >
            Log Out
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px 32px' }}>
        {error && <p style={{ color: '#e53e3e', marginBottom: 16 }}>{error}</p>}

        {/* Stats Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
          {[
            { label: 'Total Tasks',  value: tasks.length,                                         color: '#667eea' },
            { label: 'Pending',      value: tasks.filter(t => t.status === 'pending').length,     color: '#ed8936' },
            { label: 'In Progress',  value: tasks.filter(t => t.status === 'in_progress').length, color: '#4299e1' },
            { label: 'Completed',    value: tasks.filter(t => t.status === 'completed').length,   color: '#48bb78' },
          ].map(stat => (
            <div key={stat.label} style={{ background: theme.cardBg, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', padding: 20 }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: 13, color: theme.color, opacity: 0.7, marginTop: 6 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Two-column grid: left = quote + search + form, right = donut + deadlines + calendar */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'stretch', marginBottom: 24 }}>

          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>

            {/* Motivational Quote Banner */}
            <div style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', borderRadius: 12, padding: '20px 28px', marginBottom: 24, color: '#fff' }}>
              <p style={{ margin: '0 0 6px', fontSize: 16, fontStyle: 'italic' }}>&ldquo;{quote}&rdquo;</p>
              <p style={{ margin: 0, fontSize: 13, opacity: 0.8 }}>— TaskManager</p>
            </div>

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
                  style={{ padding: '12px 20px', cursor: 'pointer', borderRadius: 8, border: `1px solid ${theme.inputBorder}`, background: theme.cardBg, color: theme.color, fontSize: 14, ...hoverStyle('clearFilters') }}
                  {...hoverProps('clearFilters')}
                >
                  Clear filters
                </button>
              </div>
            </div>

            {/* Task Form */}
            <div style={{ ...cardStyle, marginBottom: 0, flex: 1 }}>
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
                  <button type="submit" style={{ ...gradientBtn, ...hoverStyle('submit') }} {...hoverProps('submit')}>
                    {editingId ? 'Update Task' : 'Add Task'}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      style={{ ...gradientBtn, background: 'transparent', color: theme.color, border: `1px solid ${theme.inputBorder}`, ...hoverStyle('cancel') }}
                      {...hoverProps('cancel')}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

          </div>{/* end left column */}

          {/* Right column: donut chart + deadlines + calendar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Task Overview donut chart */}
            {(() => {
              const circumference = 2 * Math.PI * 60
              const total = tasks.length
              const pendingCount    = tasks.filter(t => t.status === 'pending').length
              const inProgressCount = tasks.filter(t => t.status === 'in_progress').length
              const completedCount  = tasks.filter(t => t.status === 'completed').length

              const pendingLen    = total ? (pendingCount    / total) * circumference : 0
              const inProgressLen = total ? (inProgressCount / total) * circumference : 0
              const completedLen  = total ? (completedCount  / total) * circumference : 0

              const completedOffset  = 0
              const inProgressOffset = -(completedLen)
              const pendingOffset    = -(completedLen + inProgressLen)

              const legend = [
                { label: 'Pending',     count: pendingCount,    color: '#ed8936' },
                { label: 'In Progress', count: inProgressCount, color: '#4299e1' },
                { label: 'Completed',   count: completedCount,  color: '#48bb78' },
              ]

              return (
                <div style={{ ...cardStyle, marginBottom: 0 }}>
                  <p style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 700, color: theme.color }}>Task Overview</p>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <svg width="160" height="160" viewBox="0 0 160 160">
                      <circle cx="80" cy="80" r="60" fill="none" stroke={darkMode ? '#4a5568' : '#e2e8f0'} strokeWidth="20" />
                      {total === 0 ? (
                        <text x="80" y="86" textAnchor="middle" fontSize="13" fill={darkMode ? '#718096' : '#a0aec0'}>No data yet</text>
                      ) : (
                        <>
                          <circle cx="80" cy="80" r="60" fill="none"
                            stroke="#48bb78" strokeWidth="20"
                            strokeDasharray={`${completedLen} ${circumference}`}
                            strokeDashoffset={completedOffset}
                            strokeLinecap="butt"
                            transform="rotate(-90 80 80)"
                          />
                          <circle cx="80" cy="80" r="60" fill="none"
                            stroke="#4299e1" strokeWidth="20"
                            strokeDasharray={`${inProgressLen} ${circumference}`}
                            strokeDashoffset={inProgressOffset}
                            strokeLinecap="butt"
                            transform="rotate(-90 80 80)"
                          />
                          <circle cx="80" cy="80" r="60" fill="none"
                            stroke="#ed8936" strokeWidth="20"
                            strokeDasharray={`${pendingLen} ${circumference}`}
                            strokeDashoffset={pendingOffset}
                            strokeLinecap="butt"
                            transform="rotate(-90 80 80)"
                          />
                          <text x="80" y="76" textAnchor="middle" fontSize="26" fontWeight="bold" fill={theme.color}>{total}</text>
                          <text x="80" y="94" textAnchor="middle" fontSize="12" fill={darkMode ? '#718096' : '#a0aec0'}>tasks</text>
                        </>
                      )}
                    </svg>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20, width: '100%' }}>
                      {legend.map(item => (
                        <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 12, height: 12, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                            <span style={{ fontSize: 14, color: theme.color }}>{item.label}</span>
                          </div>
                          <span style={{ fontSize: 14, fontWeight: 700, color: item.color }}>{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })()}

            {/* Upcoming Deadlines + Mini Calendar */}
            {(() => {
              const today = new Date()
              today.setHours(0, 0, 0, 0)
              const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

              const upcoming = tasks
                .filter(t => {
                  if (!t.due_date) return false
                  const due = parseLocalDate(t.due_date)
                  const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24))
                  return diff >= 0 && diff <= 7
                })
                .map(t => {
                  const due = parseLocalDate(t.due_date)
                  const daysLeft = Math.ceil((due - today) / (1000 * 60 * 60 * 24))
                  const urgencyColor = daysLeft <= 2 ? '#e53e3e' : daysLeft <= 5 ? '#ed8936' : '#4299e1'
                  return { ...t, daysLeft, urgencyColor, dueObj: due }
                })
                .sort((a, b) => a.dueObj - b.dueObj)
                .slice(0, 4)

              const FULL_MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
              const DAY_LABELS  = ['Su','Mo','Tu','We','Th','Fr','Sa']
              const now         = new Date()
              const todayNum    = now.getDate()
              const thisMonth   = now.getMonth()
              const thisYear    = now.getFullYear()

              const dueDays = new Set(
                tasks
                  .filter(t => {
                    if (!t.due_date) return false
                    const d = parseLocalDate(t.due_date)
                    return d.getMonth() === thisMonth && d.getFullYear() === thisYear
                  })
                  .map(t => parseLocalDate(t.due_date).getDate())
              )

              const firstDow    = new Date(thisYear, thisMonth, 1).getDay()
              const daysInMonth = new Date(thisYear, thisMonth + 1, 0).getDate()
              const cells = [
                ...Array(firstDow).fill(null),
                ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
              ]

              return (
                <div style={{ ...cardStyle, marginBottom: 0, flex: 1 }}>
                  <p style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: theme.color }}>Upcoming Deadlines</p>
                  {upcoming.length === 0 ? (
                    <p style={{ margin: 0, fontSize: 14, color: theme.color, opacity: 0.5 }}>No upcoming deadlines</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {upcoming.map(task => {
                        const d = task.dueObj
                        return (
                          <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{
                              background: task.urgencyColor,
                              borderRadius: 8,
                              padding: '6px 10px',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              flexShrink: 0,
                              minWidth: 44,
                            }}>
                              <span style={{ color: '#fff', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', lineHeight: 1 }}>
                                {MONTHS[d.getMonth()]}
                              </span>
                              <span style={{ color: '#fff', fontSize: 18, fontWeight: 800, lineHeight: 1.2 }}>
                                {d.getDate()}
                              </span>
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ margin: '0 0 2px', fontSize: 14, fontWeight: 700, color: theme.color, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {task.title}
                              </p>
                              <p style={{ margin: 0, fontSize: 12, color: task.urgencyColor, fontWeight: 600 }}>
                                {task.daysLeft === 0 ? 'Due today' : `${task.daysLeft} day${task.daysLeft === 1 ? '' : 's'} left`}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Divider */}
                  <div style={{ borderTop: `1px solid ${theme.inputBorder}`, margin: '20px 0' }} />

                  {/* Mini Calendar */}
                  <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700, color: theme.color, textAlign: 'center' }}>
                    {FULL_MONTHS[thisMonth]} {thisYear}
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px 0', textAlign: 'center' }}>
                    {DAY_LABELS.map(d => (
                      <span key={d} style={{ fontSize: 11, fontWeight: 700, color: theme.color, opacity: 0.45, paddingBottom: 4 }}>{d}</span>
                    ))}
                    {cells.map((day, i) => (
                      <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: 2 }}>
                        {day !== null ? (
                          <>
                            <span style={{
                              width: 26, height: 26,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              borderRadius: '50%',
                              fontSize: 12,
                              fontWeight: day === todayNum ? 700 : 400,
                              background: day === todayNum ? '#667eea' : 'transparent',
                              color: day === todayNum ? '#fff' : theme.color,
                            }}>
                              {day}
                            </span>
                            {dueDays.has(day) && (
                              <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#ed8936', marginTop: 1 }} />
                            )}
                          </>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}

          </div>{/* end right column */}
        </div>{/* end two-column grid */}

        {/* Task List */}
        {filteredTasks.length === 0 ? (
          tasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: 16 }}>
                <rect x="12" y="8" width="40" height="48" rx="4" stroke="#a0aec0" strokeWidth="2.5" fill="none" />
                <line x1="20" y1="22" x2="44" y2="22" stroke="#a0aec0" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="20" y1="30" x2="44" y2="30" stroke="#a0aec0" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="20" y1="38" x2="34" y2="38" stroke="#a0aec0" strokeWidth="2.5" strokeLinecap="round" />
                <rect x="24" y="4" width="16" height="8" rx="2" stroke="#a0aec0" strokeWidth="2.5" fill="none" />
              </svg>
              <p style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: theme.color }}>No tasks yet</p>
              <p style={{ margin: 0, fontSize: 14, color: theme.color, opacity: 0.6 }}>Create your first task above</p>
            </div>
          ) : (
            <p style={{ color: theme.color }}>No tasks match your filters.</p>
          )
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
            {filteredTasks.map((task, index) => (
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
                  animation: 'fadeSlideIn 0.4s ease-out both',
                  animationDelay: `${index * 0.08}s`,
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
                      {(task.status || '').replace('_', ' ')}
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
                    style={{ padding: '6px 14px', cursor: 'pointer', background: 'transparent', color: '#667eea', border: '1px solid #667eea', borderRadius: 8, fontSize: 13, fontWeight: 600, ...hoverStyle(`edit-${task.id}`) }}
                    {...hoverProps(`edit-${task.id}`)}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    style={{ padding: '6px 14px', cursor: 'pointer', background: '#e53e3e', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, ...hoverStyle(`delete-${task.id}`) }}
                    {...hoverProps(`delete-${task.id}`)}
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
