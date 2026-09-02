import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { getTasks, createTask, updateTask, deleteTask } from '../api/tasks'

const EMPTY_FORM = { title: '', description: '', status: 'pending', due_date: '' }

const QUOTES = [
  "The secret of getting ahead is getting started.",
  "Focus on being productive instead of busy.",
  "Small progress is still progress.",
  "Done is better than perfect.",
  "One task at a time.",
]

const STATUS_LABEL = { pending: 'Pending', in_progress: 'In Progress', completed: 'Completed' }
const STATUS_BADGE_CLASS = { pending: 'badge-pending', in_progress: 'badge-progress', completed: 'badge-completed' }
const STATUS_DOT_VAR = { pending: 'var(--pending)', in_progress: 'var(--progress)', completed: 'var(--completed)' }

function parseLocalDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function Dashboard() {
  const { token, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const [tasks, setTasks] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)])

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

  const pendingCount = tasks.filter(t => t.status === 'pending').length
  const inProgressCount = tasks.filter(t => t.status === 'in_progress').length
  const completedCount = tasks.filter(t => t.status === 'completed').length

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--ink)' }}>
      {/* Header */}
      <div
        style={{
          background: 'var(--primary)',
          padding: '20px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 32,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <svg width="30" height="30" viewBox="0 0 32 32" fill="none" style={{ marginRight: 10 }}>
            <circle cx="16" cy="16" r="14" stroke="var(--primary-ink)" strokeWidth="2.5" />
            <polyline points="9,16 14,21 23,11" stroke="var(--primary-ink)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ color: 'var(--primary-ink)', fontSize: 21, fontWeight: 800 }}>TaskManager</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={toggleTheme}
            className="btn btn-sm"
            style={{ background: 'transparent', color: 'var(--primary-ink)', border: '1.5px solid var(--primary-ink)' }}
          >
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button
            onClick={handleLogout}
            className="btn btn-sm"
            style={{ background: 'transparent', color: 'var(--primary-ink)', border: '1.5px solid var(--primary-ink)' }}
          >
            Log Out
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px 32px' }}>
        {error && <p style={{ color: 'var(--danger)', marginBottom: 16 }}>{error}</p>}

        {/* Stats Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
          {[
            { label: 'Total Tasks', value: tasks.length, color: 'var(--primary)' },
            { label: 'Pending', value: pendingCount, color: 'var(--pending)' },
            { label: 'In Progress', value: inProgressCount, color: 'var(--progress)' },
            { label: 'Completed', value: completedCount, color: 'var(--completed)' },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className="card anim-fade-up"
              style={{ padding: 20, animationDelay: `${i * 0.06}s` }}
            >
              <div style={{ fontSize: 32, fontWeight: 800, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 6 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Two-column grid: left = quote + search + form, right = donut + deadlines + calendar */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'stretch', marginBottom: 24 }}>

          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>

            {/* Motivational Quote Banner */}
            <div
              className="anim-fade-up"
              style={{
                background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                borderRadius: 'var(--radius)',
                padding: '20px 28px',
                marginBottom: 24,
                color: '#fff',
              }}
            >
              <p style={{ margin: '0 0 6px', fontSize: 16, fontStyle: 'italic' }}>&ldquo;{quote}&rdquo;</p>
              <p style={{ margin: 0, fontSize: 13, opacity: 0.85 }}>— TaskManager</p>
            </div>

            {/* Search and Filter Controls */}
            <div className="card anim-fade-up" style={{ padding: 20, marginBottom: 24 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Search by title..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="field"
                  style={{ flex: '1 1 200px' }}
                />
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="field"
                  style={{ flex: '0 1 160px' }}
                >
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
                <button onClick={clearFilters} className="btn btn-ghost">
                  Clear filters
                </button>
              </div>
            </div>

            {/* Task Form */}
            <div className="card anim-fade-up" style={{ flex: 1 }}>
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
                  className="field"
                />
                <textarea
                  placeholder="Description"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="field"
                  style={{ resize: 'vertical' }}
                />
                <select
                  value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  className="field"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
                <input
                  type="date"
                  value={form.due_date}
                  onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
                  className="field"
                />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="submit" className="btn btn-accent">
                    {editingId ? 'Update Task' : 'Add Task'}
                  </button>
                  {editingId && (
                    <button type="button" onClick={handleCancelEdit} className="btn btn-ghost">
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

              const pendingLen = total ? (pendingCount / total) * circumference : 0
              const inProgressLen = total ? (inProgressCount / total) * circumference : 0
              const completedLen = total ? (completedCount / total) * circumference : 0

              const completedOffset = 0
              const inProgressOffset = -(completedLen)
              const pendingOffset = -(completedLen + inProgressLen)

              const legend = [
                { label: 'Pending', count: pendingCount, color: 'var(--pending)' },
                { label: 'In Progress', count: inProgressCount, color: 'var(--progress)' },
                { label: 'Completed', count: completedCount, color: 'var(--completed)' },
              ]

              return (
                <div className="card anim-fade-up">
                  <p style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 700 }}>Task Overview</p>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <svg width="160" height="160" viewBox="0 0 160 160">
                      <circle cx="80" cy="80" r="60" fill="none" stroke="var(--border)" strokeWidth="20" />
                      {total === 0 ? (
                        <text x="80" y="86" textAnchor="middle" fontSize="13" fill="var(--muted)">No data yet</text>
                      ) : (
                        <>
                          <circle cx="80" cy="80" r="60" fill="none"
                            stroke="var(--completed)" strokeWidth="20"
                            strokeDasharray={`${completedLen} ${circumference}`}
                            strokeDashoffset={completedOffset}
                            strokeLinecap="butt"
                            transform="rotate(-90 80 80)"
                          />
                          <circle cx="80" cy="80" r="60" fill="none"
                            stroke="var(--progress)" strokeWidth="20"
                            strokeDasharray={`${inProgressLen} ${circumference}`}
                            strokeDashoffset={inProgressOffset}
                            strokeLinecap="butt"
                            transform="rotate(-90 80 80)"
                          />
                          <circle cx="80" cy="80" r="60" fill="none"
                            stroke="var(--pending)" strokeWidth="20"
                            strokeDasharray={`${pendingLen} ${circumference}`}
                            strokeDashoffset={pendingOffset}
                            strokeLinecap="butt"
                            transform="rotate(-90 80 80)"
                          />
                          <text x="80" y="76" textAnchor="middle" fontSize="26" fontWeight="bold" fill="var(--ink)">{total}</text>
                          <text x="80" y="94" textAnchor="middle" fontSize="12" fill="var(--muted)">tasks</text>
                        </>
                      )}
                    </svg>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20, width: '100%' }}>
                      {legend.map(item => (
                        <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 12, height: 12, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                            <span style={{ fontSize: 14 }}>{item.label}</span>
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
                  const urgencyColor = daysLeft <= 2 ? 'var(--danger)' : daysLeft <= 5 ? 'var(--pending)' : 'var(--progress)'
                  return { ...t, daysLeft, urgencyColor, dueObj: due }
                })
                .sort((a, b) => a.dueObj - b.dueObj)
                .slice(0, 4)

              const FULL_MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
              const DAY_LABELS = ['Su','Mo','Tu','We','Th','Fr','Sa']
              const now = new Date()
              const todayNum = now.getDate()
              const thisMonth = now.getMonth()
              const thisYear = now.getFullYear()

              const dueDays = new Set(
                tasks
                  .filter(t => {
                    if (!t.due_date) return false
                    const d = parseLocalDate(t.due_date)
                    return d.getMonth() === thisMonth && d.getFullYear() === thisYear
                  })
                  .map(t => parseLocalDate(t.due_date).getDate())
              )

              const firstDow = new Date(thisYear, thisMonth, 1).getDay()
              const daysInMonth = new Date(thisYear, thisMonth + 1, 0).getDate()
              const cells = [
                ...Array(firstDow).fill(null),
                ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
              ]

              return (
                <div className="card anim-fade-up" style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700 }}>Upcoming Deadlines</p>
                  {upcoming.length === 0 ? (
                    <p style={{ margin: 0, fontSize: 14, color: 'var(--muted)' }}>No upcoming deadlines</p>
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
                              <p style={{ margin: '0 0 2px', fontSize: 14, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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

                  <div style={{ borderTop: '1px solid var(--border)', margin: '20px 0' }} />

                  <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700, textAlign: 'center' }}>
                    {FULL_MONTHS[thisMonth]} {thisYear}
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px 0', textAlign: 'center' }}>
                    {DAY_LABELS.map(d => (
                      <span key={d} style={{ fontSize: 11, fontWeight: 700, opacity: 0.45, paddingBottom: 4 }}>{d}</span>
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
                              background: day === todayNum ? 'var(--primary)' : 'transparent',
                              color: day === todayNum ? 'var(--primary-ink)' : 'var(--ink)',
                            }}>
                              {day}
                            </span>
                            {dueDays.has(day) && (
                              <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--pending)', marginTop: 1 }} />
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
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style={{ marginBottom: 16 }}>
                <rect x="12" y="8" width="40" height="48" rx="4" stroke="var(--muted)" strokeWidth="2.5" fill="none" />
                <line x1="20" y1="22" x2="44" y2="22" stroke="var(--muted)" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="20" y1="30" x2="44" y2="30" stroke="var(--muted)" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="20" y1="38" x2="34" y2="38" stroke="var(--muted)" strokeWidth="2.5" strokeLinecap="round" />
                <rect x="24" y="4" width="16" height="8" rx="2" stroke="var(--muted)" strokeWidth="2.5" fill="none" />
              </svg>
              <p style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700 }}>No tasks yet</p>
              <p style={{ margin: 0, fontSize: 14, color: 'var(--muted)' }}>Create your first task above</p>
            </div>
          ) : (
            <p>No tasks match your filters.</p>
          )
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
            {filteredTasks.map((task, index) => (
              <div
                key={task.id}
                className="card card-interactive anim-fade-in"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 12,
                  padding: 20,
                  animationDelay: `${index * 0.06}s`,
                  borderLeft: `4px solid ${STATUS_DOT_VAR[task.status] || 'var(--border)'}`,
                }}
              >
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: 16 }}>{task.title}</strong>
                  {task.description && (
                    <p style={{ margin: '6px 0', fontSize: 14, color: 'var(--muted)' }}>{task.description}</p>
                  )}
                  <div style={{ marginTop: 8, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span className={`badge ${STATUS_BADGE_CLASS[task.status] || ''}`}>
                      {STATUS_LABEL[task.status] || task.status}
                    </span>
                    {task.due_date && (
                      <span style={{ fontSize: 13, color: 'var(--muted)' }}>
                        Due: {task.due_date.slice(0, 10)}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button onClick={() => handleEdit(task)} className="btn btn-outline btn-sm">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(task.id)} className="btn btn-danger btn-sm">
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
