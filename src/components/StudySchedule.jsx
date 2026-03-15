import { useState } from 'react'
import { useUserData } from '../hooks/useUserData'
import styles from './StudySchedule.module.css'

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
const DAY_LABELS = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' }
const TYPES = ['study', 'revision', 'practice', 'break']
const TYPE_COLORS = {
  study:    '#2a6e4a',
  revision: '#7a5a1a',
  practice: '#1a4e7a',
  break:    '#4a2a6e',
}

const emptyWeek = () => ({ mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] })

function parseMins(timeStr) {
  const [h, m] = timeStr.split(':').map(Number)
  return h * 60 + m
}

function calcHours(blocks) {
  return blocks.reduce((acc, b) => {
    const mins = parseMins(b.end) - parseMins(b.start)
    return acc + (mins > 0 ? mins / 60 : 0)
  }, 0)
}

export default function StudySchedule({ storageKey }) {
  const thisKey = `${storageKey}_schedule_this`
  const nextKey = `${storageKey}_schedule_next`
  const [thisWeek, setThisWeek] = useUserData(thisKey, emptyWeek())
  const [nextWeek, setNextWeek] = useUserData(nextKey, emptyWeek())
  const [viewWeek, setViewWeek] = useState('this')

  const schedule = viewWeek === 'this' ? thisWeek : nextWeek
  const setSchedule = viewWeek === 'this' ? setThisWeek : setNextWeek

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ day: 'mon', subject: '', start: '09:00', end: '11:00', type: 'study' })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const addBlock = () => {
    if (!form.subject.trim() || !form.start || !form.end) return
    if (parseMins(form.end) <= parseMins(form.start)) return
    const block = { id: Date.now(), subject: form.subject.trim(), start: form.start, end: form.end, type: form.type }
    const day = form.day
    const updated = {
      ...schedule,
      [day]: [...(schedule[day] || []), block].sort((a, b) => parseMins(a.start) - parseMins(b.start)),
    }
    setSchedule(updated)
    setForm((f) => ({ ...f, subject: '' }))
  }

  const deleteBlock = (day, id) => {
    setSchedule({ ...schedule, [day]: (schedule[day] || []).filter((b) => b.id !== id) })
  }

  const totalHours = DAYS.reduce((acc, d) => acc + calcHours(schedule[d] || []), 0)

  return (
    <section id="schedule" className="section">
      <div className="section-header">
        <p className="section-eyebrow">✦ Plan Your Week</p>
        <h2 className="section-title">Study <em>Schedule</em></h2>
        <div className="divider" />
      </div>

      <div className={styles.controls}>
        <div>
          <div className={styles.weekTotal}>{totalHours.toFixed(1)}h</div>
          <div className={styles.weekTotalLabel}>Total study hours this week</div>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className={styles.weekToggle}>
            <button className={`${styles.weekBtn} ${viewWeek === 'this' ? styles.weekBtnActive : ''}`} onClick={() => setViewWeek('this')}>This Week</button>
            <button className={`${styles.weekBtn} ${viewWeek === 'next' ? styles.weekBtnActive : ''}`} onClick={() => setViewWeek('next')}>Next Week</button>
          </div>
          <button className={styles.addBtn} onClick={() => setShowForm((v) => !v)}>
            {showForm ? '✕ Cancel' : '+ Add Block'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className={styles.form}>
          <div className={styles.formGrid}>
            <div className="field-group">
              <label>Day</label>
              <select className={styles.select} value={form.day} onChange={set('day')}>
                {DAYS.map((d) => <option key={d} value={d}>{DAY_LABELS[d]}</option>)}
              </select>
            </div>
            <div className="field-group">
              <label>Subject</label>
              <input type="text" placeholder="e.g. Mathematics" value={form.subject} onChange={set('subject')} />
            </div>
            <div className="field-group">
              <label>Type</label>
              <select className={styles.select} value={form.type} onChange={set('type')}>
                {TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
            <div className="field-group">
              <label>Start Time</label>
              <input type="time" value={form.start} onChange={set('start')} />
            </div>
            <div className="field-group">
              <label>End Time</label>
              <input type="time" value={form.end} onChange={set('end')} />
            </div>
          </div>
          <div className={styles.formActions}>
            <button className="btn-primary" onClick={addBlock}>Add Block →</button>
            <button className={styles.cancelBtn} onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className={styles.grid}>
        {DAYS.map((day) => {
          const blocks = (schedule[day] || [])
          const dayHours = calcHours(blocks)
          return (
            <div key={day} className={styles.dayCol}>
              <div className={styles.dayHeader}>
                <div className={styles.dayName}>{DAY_LABELS[day]}</div>
                <div className={styles.dayHours}>{dayHours > 0 ? `${dayHours.toFixed(1)}h` : '—'}</div>
              </div>
              {blocks.length === 0 && (
                <div style={{ fontSize: 12, color: 'var(--mist)', textAlign: 'center', padding: '12px 4px', opacity: 0.5 }}>Free</div>
              )}
              {blocks.map((b) => (
                <div key={b.id} className={styles.block} style={{ background: TYPE_COLORS[b.type] || '#333' }}>
                  <div className={styles.blockSubject}>{b.subject}</div>
                  <div className={styles.blockTime}>{b.start}–{b.end}</div>
                  <div className={styles.blockType}>{b.type}</div>
                  <button className={styles.blockDelete} onClick={() => deleteBlock(day, b.id)}>✕</button>
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </section>
  )
}
