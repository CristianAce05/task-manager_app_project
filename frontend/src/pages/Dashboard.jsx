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

const FILTERS = [
  { key: 'all', label: 'All Tasks', icon: 'grid' },
  { key: 'pending', label: 'Pending', icon: 'clock' },
  { key: 'in_progress', label: 'In Progress', icon: 'bolt' },
  { key: 'completed', label: 'Completed', icon: 'check' },
]

function NavIcon({ name }) {
  const common = { width: 17, height: 17, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }
  if (name === 'grid') return <svg {...common}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>
  if (name === 'clock') return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
  if (name === 'bolt') return <svg {...common}><path d="M13 2 4 14h6l-1 8 9-12h-6z" /></svg>
  if (name === 'check') return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M8 12l3 3 5-6" /></svg>
  return null
}

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

  function handleLogout() {
    logout()
    navigate('/')
  }

  const pendingCount = tasks.filter(t => t.status === 'pending').length
  const inProgressCount = tasks.filter(t => t.status === 'in_progress').length
  const completedCount = tasks.filter(t => t.status === 'completed').length

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="14" stroke="var(--primary)" strokeWidth="2.5" />
            <polyline points="9,16 14,21 23,11" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800 }}>TaskManager</span>
        </div>

        <nav className="sidebar-nav">
          <p className="sidebar-nav-label" style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '0 12px', marginBottom: 6 }}>
            Filter
          </p>
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={`sidebar-link ${statusFilter === f.key ? 'active' : ''}`}
            >
              <NavIcon name={f.icon} />
              {f.label}
            </button>
          ))}
        </nav>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button onClick={toggleTheme} className="btn btn-outline btn-sm btn-block">
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button onClick={handleLogout} className="btn btn-ghost btn-sm btn-block">
            Log Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="main-area">
        {error && <p style={{ color: 'var(--danger)', marginBottom: 16 }}>{error}</p>}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800 }}>Overview</h1>
            <p style={{ margin: '4px 0 0', color: 'var(--muted)', fontFamily: 'var(--font-body)' }}>
              &ldquo;{quote}&rdquo;
            </p>
          </div>
          <input
            type="text"
            placeholder="Search by title..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="field"
            style={{ maxWidth: 260 }}
          />
        </div>

        {/* Bento grid */}
        <div className="bento-grid" style={{ marginBottom: 28 }}>
          {[
            { label: 'Total Tasks', value: tasks.length, color: 'var(--primary)' },
            { label: 'Pending', value: pendingCount, color: 'var(--pending)' },
            { label: 'In Progress', value: inProgressCount, color: 'var(--progress)' },
            { label: 'Completed', value: completedCount, color: 'var(--completed)' },
          ].map((stat, i) => (
            <div key={stat.label} className="card anim-fade-up" style={{ animationDelay: `${i * 0.06}s` }}>
              <div style={{ fontSize: 34, fontWeight: 800, color: stat.color, lineHeight: 1, fontFamily: 'var(--font-display)' }}>{stat.value}</div>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 6 }}>{stat.label}</div>
            </div>
          ))}

          {/* Donut chart — wide tile */}
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
              <div className="card bento-span-2 anim-fade-up split-row" style={{ alignItems: 'center' }}>
                <svg width="130" height="130" viewBox="0 0 160 160" style={{ flexShrink: 0 }}>
                  <circle cx="80" cy="80" r="60" fill="none" stroke="var(--border)" strokeWidth="20" />
                  {total === 0 ? (
                    <text x="80" y="86" textAnchor="middle" fontSize="13" fill="var(--muted)">No data</text>
                  ) : (
                    <>
                      <circle cx="80" cy="80" r="60" fill="none" stroke="var(--completed)" strokeWidth="20"
                        strokeDasharray={`${completedLen} ${circumference}`} strokeDashoffset={completedOffset}
                        strokeLinecap="butt" transform="rotate(-90 80 80)" />
                      <circle cx="80" cy="80" r="60" fill="none" stroke="var(--progress)" strokeWidth="20"
                        strokeDasharray={`${inProgressLen} ${circumference}`} strokeDashoffset={inProgressOffset}
                        strokeLinecap="butt" transform="rotate(-90 80 80)" />
                      <circle cx="80" cy="80" r="60" fill="none" stroke="var(--pending)" strokeWidth="20"
                        strokeDasharray={`${pendingLen} ${circumference}`} strokeDashoffset={pendingOffset}
                        strokeLinecap="butt" transform="rotate(-90 80 80)" />
                      <text x="80" y="76" textAnchor="middle" fontSize="26" fontWeight="bold" fill="var(--ink)">{total}</text>
                      <text x="80" y="94" textAnchor="middle" fontSize="12" fill="var(--muted)">tasks</text>
                    </>
                  )}
                </svg>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700 }}>Task Overview</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {legend.map(item => (
                      <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                          <span style={{ fontSize: 13 }}>{item.label}</span>
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: item.color }}>{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })()}

          {/* Deadlines + calendar — wide tile */}
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
              .slice(0, 3)

            const FULL_MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
            const DAY_LABELS = ['S','M','T','W','T','F','S']
            const now = new Date()
            const todayNum = now.getDate()
            const thisMonth = now.getMonth()
            const thisYear = now.getFullYear()
            const dueDays = new Set(
              tasks.filter(t => {
                if (!t.due_date) return false
                const d = parseLocalDate(t.due_date)
                return d.getMonth() === thisMonth && d.getFullYear() === thisYear
              }).map(t => parseLocalDate(t.due_date).getDate())
            )
            const firstDow = new Date(thisYear, thisMonth, 1).getDay()
            const daysInMonth = new Date(thisYear, thisMonth + 1, 0).getDate()
            const cells = [...Array(firstDow).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]

            return (
              <div className="card bento-span-2 anim-fade-up split-row">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700 }}>Upcoming Deadlines</p>
                  {upcoming.length === 0 ? (
                    <p style={{ margin: 0, fontSize: 13, color: 'var(--muted)' }}>Nothing due soon</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {upcoming.map(task => (
                        <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ background: task.urgencyColor, borderRadius: 7, padding: '4px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, minWidth: 38 }}>
                            <span style={{ color: '#fff', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', lineHeight: 1 }}>{MONTHS[task.dueObj.getMonth()]}</span>
                            <span style={{ color: '#fff', fontSize: 15, fontWeight: 800, lineHeight: 1.2 }}>{task.dueObj.getDate()}</span>
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title}</p>
                            <p style={{ margin: 0, fontSize: 11, color: task.urgencyColor, fontWeight: 600 }}>
                              {task.daysLeft === 0 ? 'Due today' : `${task.daysLeft}d left`}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ width: 1, background: 'var(--border)' }} />
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700, textAlign: 'center' }}>{FULL_MONTHS[thisMonth]} {thisYear}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px 0', textAlign: 'center' }}>
                    {DAY_LABELS.map((d, i) => (
                      <span key={i} style={{ fontSize: 10, fontWeight: 700, opacity: 0.4 }}>{d}</span>
                    ))}
                    {cells.map((day, i) => (
                      <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: 2 }}>
                        {day !== null ? (
                          <>
                            <span style={{
                              width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
                              borderRadius: '50%', fontSize: 11,
                              fontWeight: day === todayNum ? 700 : 400,
                              background: day === todayNum ? 'var(--primary)' : 'transparent',
                              color: day === todayNum ? 'var(--primary-ink)' : 'var(--ink)',
                            }}>{day}</span>
                            {dueDays.has(day) && <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--pending)', marginTop: 1 }} />}
                          </>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })()}
        </div>

        {/* New Task form */}
        <div className="card anim-fade-up" style={{ marginBottom: 28 }}>
          <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16 }}>
            {editingId ? 'Edit Task' : 'New Task'}
          </h3>
          <form onSubmit={handleSubmit} className="task-form-grid">
            <input type="text" placeholder="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required className="field" />
            <input type="text" placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="field" />
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="field">
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} className="field" />
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" className="btn btn-accent">{editingId ? 'Update' : 'Add'}</button>
              {editingId && <button type="button" onClick={handleCancelEdit} className="btn btn-ghost">Cancel</button>}
            </div>
          </form>
        </div>

        {/* Task list */}
        {filteredTasks.length === 0 ? (
          tasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <p style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700 }}>No tasks yet</p>
              <p style={{ margin: 0, fontSize: 14, color: 'var(--muted)' }}>Create your first task above</p>
            </div>
          ) : (
            <p style={{ color: 'var(--muted)' }}>No tasks match your filters.</p>
          )
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
            {filteredTasks.map((task, index) => (
              <div
                key={task.id}
                className="card card-interactive anim-fade-in"
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12,
                  animationDelay: `${index * 0.05}s`,
                  borderLeft: `4px solid ${STATUS_DOT_VAR[task.status] || 'var(--border)'}`,
                }}
              >
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: 15 }}>{task.title}</strong>
                  {task.description && <p style={{ margin: '5px 0', fontSize: 13, color: 'var(--muted)' }}>{task.description}</p>}
                  <div style={{ marginTop: 8, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span className={`badge ${STATUS_BADGE_CLASS[task.status] || ''}`}>{STATUS_LABEL[task.status] || task.status}</span>
                    {task.due_date && <span style={{ fontSize: 12, color: 'var(--muted)' }}>Due {task.due_date.slice(0, 10)}</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button onClick={() => handleEdit(task)} className="btn btn-outline btn-sm">Edit</button>
                  <button onClick={() => handleDelete(task.id)} className="btn btn-danger btn-sm">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default Dashboard
