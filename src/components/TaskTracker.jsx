import { useState, useEffect, useRef } from 'react'
import { useUserData } from '../hooks/useUserData'
import styles from './TaskTracker.module.css'

function fmtDuration(ms) {
  const s = Math.floor(Math.abs(ms) / 1000)
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (d > 0) return `${d}d ${h}h ${m}m`
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${sec}s`
  return `${sec}s`
}

function LiveTimer({ createdAt, done, completedAt }) {
  const [now, setNow] = useState(Date.now())
  const ref = useRef(null)

  useEffect(() => {
    if (done) return
    ref.current = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(ref.current)
  }, [done])

  if (!createdAt) return null
  const elapsed = done ? (completedAt - createdAt) : (now - createdAt)
  return done
    ? <span className={styles.timerDone}>✓ {fmtDuration(elapsed)}</span>
    : <span className={styles.timer}>⏱ {fmtDuration(elapsed)}</span>
}

const PRIORITIES = ['High', 'Medium', 'Low']
const SUBJECTS_DEFAULT = ['Advanced Financial Management', 'Marketing', 'Economics', 'Statistics', 'Management', 'Other']

function priorityColor(p) {
  if (p === 'High')   return 'var(--crimson)'
  if (p === 'Medium') return 'var(--gold)'
  return 'var(--emerald-light)'
}

function daysLeft(due) {
  const diff = new Date(due) - new Date()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission()
  }
}

function checkDueReminders(tasks) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  const today = new Date().toLocaleDateString()
  const dueTodayOrOverdue = tasks.filter((t) => !t.done && (daysLeft(t.due) <= 0))
  if (dueTodayOrOverdue.length > 0) {
    new Notification('📋 Mogul\'s Learning Studio', {
      body: `You have ${dueTodayOrOverdue.length} task(s) due today or overdue: ${dueTodayOrOverdue.slice(0, 2).map((t) => t.title).join(', ')}${dueTodayOrOverdue.length > 2 ? '…' : ''}`,
      icon: '/vite.svg',
    })
  }
}

export default function TaskTracker({ storageKey, subjects }) {
  const key      = storageKey || 'mls_tasks'
  const SUBJECTS = subjects || SUBJECTS_DEFAULT
  const [tasks, setTasks]       = useUserData(key, [])
  const [showForm, setShowForm] = useState(false)
  const [notifRequested, setNotifRequested] = useState(false)

  useEffect(() => {
    if (tasks.length > 0 && !notifRequested) {
      setNotifRequested(true)
      requestNotificationPermission()
    }
  }, [tasks.length]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (tasks.length > 0 && Notification.permission === 'granted') {
      checkDueReminders(tasks)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  const [filter, setFilter]     = useState('all')
  const [form, setForm]         = useState({ title: '', subject: SUBJECTS[0], due: '', priority: 'Medium', notes: '', progress: 0 })

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const addTask = () => {
    if (!form.title || !form.due) return
    const t = { id: Date.now(), ...form, done: false, created: new Date().toLocaleDateString(), createdAt: Date.now() }
    setTasks([t, ...tasks])
    setForm({ title: '', subject: SUBJECTS[0], due: '', priority: 'Medium', notes: '', progress: 0 })
    setShowForm(false)
  }

  const toggle = (id) => setTasks(tasks.map((t) =>
    t.id === id ? { ...t, done: !t.done, completedAt: !t.done ? Date.now() : null } : t
  ))
  const remove = (id) => setTasks(tasks.filter((t) => t.id !== id))

  const updateProgress = (id, progress) => {
    setTasks(tasks.map((t) => t.id === id ? { ...t, progress: Number(progress) } : t))
  }

  const filtered = tasks.filter((t) => {
    if (filter === 'active')   return !t.done
    if (filter === 'done')     return t.done
    if (filter === 'overdue')  return !t.done && daysLeft(t.due) < 0
    return true
  }).sort((a, b) => new Date(a.due) - new Date(b.due))

  const overdue  = tasks.filter((t) => !t.done && daysLeft(t.due) < 0).length
  const upcoming = tasks.filter((t) => !t.done && daysLeft(t.due) >= 0).length
  const done     = tasks.filter((t) => t.done).length

  return (
    <section id="tasks" className="section">
      <div className="section-header">
        <p className="section-eyebrow">✦ Stay on Track</p>
        <h2 className="section-title">Assignment <em>Tracker</em></h2>
        <div className="divider" />
      </div>

      {/* Summary */}
      <div className={styles.summary}>
        {[
          { label: 'Upcoming', value: upcoming, color: 'var(--gold)' },
          { label: 'Overdue',  value: overdue,  color: 'var(--crimson)' },
          { label: 'Completed',value: done,     color: 'var(--emerald-light)' },
          { label: 'Total',    value: tasks.length, color: 'var(--mist)' },
        ].map((s) => (
          <div key={s.label} className={styles.summaryCard}>
            <div className={styles.summaryNum} style={{ color: s.color }}>{s.value}</div>
            <div className={styles.summaryLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.filters}>
          {['all','active','overdue','done'].map((f) => (
            <button key={f} className={`${styles.filterBtn} ${filter === f ? styles.activeFilter : ''}`} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div className={styles.controlRight}>
          {done > 0 && (
            <button className={styles.clearBtn} onClick={() => setTasks(tasks.filter((t) => !t.done))}>
              🗑 Clear Completed ({done})
            </button>
          )}
          <button className={styles.addBtn} onClick={() => setShowForm((v) => !v)}>
            {showForm ? '✕ Cancel' : '+ Add Assignment'}
          </button>
        </div>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className={styles.form}>
          <div className={styles.formGrid}>
            <div className="field-group" style={{ gridColumn: '1/-1' }}>
              <label>Assignment Title *</label>
              <input type="text" placeholder="e.g. Chapter 3 Capital Budgeting Assignment" value={form.title} onChange={set('title')} />
            </div>
            <div className="field-group">
              <label>Subject</label>
              <select className={styles.select} value={form.subject} onChange={set('subject')}>
                {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="field-group">
              <label>Due Date *</label>
              <input type="date" value={form.due} onChange={set('due')} />
            </div>
            <div className="field-group">
              <label>Priority</label>
              <select className={styles.select} value={form.priority} onChange={set('priority')}>
                {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="field-group">
              <label>Notes (optional)</label>
              <input type="text" placeholder="Any extra details…" value={form.notes} onChange={set('notes')} />
            </div>
            <div className="field-group" style={{ gridColumn: '1/-1' }}>
              <label>Progress: {form.progress}%</label>
              <input type="range" min="0" max="100" step="5" value={form.progress} onChange={set('progress')} className={styles.progressSlider} />
            </div>
          </div>
          <button className="btn-primary" onClick={addTask} style={{ marginTop: 8 }}>Add Assignment →</button>
        </div>
      )}

      {/* Task List */}
      <div className={styles.list}>
        {filtered.length === 0 && (
          <div className={styles.empty}>
            <span style={{ fontSize: 40 }}>📋</span>
            <p>No assignments here. {filter === 'all' ? 'Add one above!' : 'Try a different filter.'}</p>
          </div>
        )}
        {filtered.map((t) => {
          const dl   = daysLeft(t.due)
          const over = dl < 0 && !t.done
          const soon = dl >= 0 && dl <= 3 && !t.done
          return (
            <div key={t.id} className={`${styles.task} ${t.done ? styles.taskDone : ''} ${over ? styles.taskOverdue : ''}`}>
              <button className={styles.checkbox} onClick={() => toggle(t.id)}>
                {t.done ? '✓' : ''}
              </button>
              <div className={styles.taskBody}>
                <div className={styles.taskTitle}>{t.title}</div>
                <div className={styles.taskMeta}>
                  <span className={styles.subject}>{t.subject}</span>
                  <span className={styles.priority} style={{ color: priorityColor(t.priority) }}>● {t.priority}</span>
                  {t.notes && <span className={styles.taskNotes}>{t.notes}</span>}
                </div>
                <div className={styles.progressBarWrap} title={`${t.progress || 0}% complete`}>
                  <div className={styles.progressBarFill} style={{ width: `${t.progress || 0}%`, background: t.done ? 'var(--emerald-light)' : 'var(--accent, var(--gold))' }} />
                  <span className={styles.progressPct}>{t.progress || 0}%</span>
                </div>
                <input
                  type="range" min="0" max="100" step="5"
                  value={t.progress || 0}
                  onChange={(e) => updateProgress(t.id, e.target.value)}
                  className={styles.progressSlider}
                  onClick={(e) => e.stopPropagation()}
                  style={{ display: t.done ? 'none' : undefined }}
                />
              </div>
              <div className={styles.taskRight}>
                <div className={`${styles.dueTag} ${over ? styles.overTag : soon ? styles.soonTag : ''}`}>
                  {t.done ? '✓ Done' : over ? `${Math.abs(dl)}d overdue` : dl === 0 ? 'Due today!' : `${dl}d left`}
                </div>
                <div className={styles.dueDate}>{new Date(t.due).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</div>
                <LiveTimer createdAt={t.createdAt} done={t.done} completedAt={t.completedAt} />
                <button className={styles.removeBtn} onClick={() => remove(t.id)}>✕</button>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
