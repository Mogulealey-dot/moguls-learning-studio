import { useState } from 'react'
import { useUserData } from '../hooks/useUserData'
import styles from './AttendanceTracker.module.css'

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

function getLast84Days() {
  const days = []
  for (let i = 83; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().split('T')[0])
  }
  return days
}

function exportReport(subjects) {
  const lines = subjects.map((s) => {
    const total = s.sessions.length
    const attended = s.sessions.filter((sess) => sess.attended).length
    const pct = total > 0 ? Math.round((attended / total) * 100) : 0
    return `${s.name} — ${attended}/${total} sessions (${pct}%) | Target: ${s.targetPercent}%`
  })
  const text = `Attendance Report — Generated ${new Date().toLocaleDateString()}\n\n${lines.join('\n')}`
  const blob = new Blob([text], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = 'attendance.txt'; a.click()
  URL.revokeObjectURL(url)
}

export default function AttendanceTracker({ storageKey }) {
  const key = `${storageKey}_attendance`
  const [data, setData] = useUserData(key, { subjects: [] })
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', targetPercent: 75 })
  const [logInputs, setLogInputs] = useState({}) // subjectId -> { date, note }

  const subjects = data.subjects || []
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const addSubject = () => {
    if (!form.name.trim()) return
    const newSubj = { id: Date.now(), name: form.name.trim(), targetPercent: Number(form.targetPercent) || 75, sessions: [] }
    setData({ subjects: [...subjects, newSubj] })
    setForm({ name: '', targetPercent: 75 }); setShowForm(false)
  }

  const deleteSubject = (id) => setData({ subjects: subjects.filter((s) => s.id !== id) })

  const logSession = (subjId, attended) => {
    const inputs = logInputs[subjId] || {}
    const date = inputs.date || todayStr()
    const note = inputs.note || ''
    setData({
      subjects: subjects.map((s) => s.id !== subjId ? s : {
        ...s,
        sessions: [...s.sessions, { id: Date.now(), date, attended, note }],
      }),
    })
    setLogInputs((prev) => ({ ...prev, [subjId]: { ...prev[subjId], note: '' } }))
  }

  const deleteSession = (subjId, sessId) => {
    setData({
      subjects: subjects.map((s) => s.id !== subjId ? s : {
        ...s,
        sessions: s.sessions.filter((sess) => sess.id !== sessId),
      }),
    })
  }

  const markTodayAll = () => {
    const today = todayStr()
    setData({
      subjects: subjects.map((s) => ({
        ...s,
        sessions: s.sessions.some((sess) => sess.date === today)
          ? s.sessions
          : [...s.sessions, { id: Date.now(), date: today, attended: true, note: 'Bulk mark' }],
      })),
    })
  }

  const last84 = getLast84Days()

  return (
    <section id="attendance" className="section">
      <div className="section-header">
        <p className="section-eyebrow">✦ Stay Consistent</p>
        <h2 className="section-title">Attendance <em>Tracker</em></h2>
        <div className="divider" />
      </div>

      <div className={styles.controls}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {subjects.length > 0 && (
            <>
              <button className={styles.markTodayBtn} onClick={markTodayAll}>Mark Today for All</button>
              <button className={styles.exportBtn} onClick={() => exportReport(subjects)}>Export Report</button>
            </>
          )}
        </div>
        <button className={styles.addBtn} onClick={() => setShowForm((v) => !v)}>
          {showForm ? '✕ Cancel' : '+ Add Subject'}
        </button>
      </div>

      {showForm && (
        <div className={styles.form}>
          <div className={styles.formGrid}>
            <div className="field-group">
              <label>Subject Name</label>
              <input type="text" placeholder="e.g. Mathematics" value={form.name} onChange={set('name')} />
            </div>
            <div className="field-group">
              <label>Attendance Target (%)</label>
              <input type="number" min="0" max="100" value={form.targetPercent} onChange={set('targetPercent')} />
            </div>
          </div>
          <div className={styles.formActions}>
            <button className="btn-primary" onClick={addSubject}>Add Subject →</button>
            <button className={styles.cancelBtn} onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {subjects.length === 0 ? (
        <div className={styles.empty}>
          <span style={{ fontSize: 40 }}>✅</span>
          <p>No subjects yet. Add a subject to start tracking attendance!</p>
        </div>
      ) : (
        <div className={styles.subjects}>
          {subjects.map((subj) => {
            const total = subj.sessions.length
            const attended = subj.sessions.filter((s) => s.attended).length
            const pct = total > 0 ? Math.round((attended / total) * 100) : 0
            const belowTarget = total > 0 && pct < subj.targetPercent
            const inputs = logInputs[subj.id] || {}
            const sessionMap = new Map(subj.sessions.map((s) => [s.date, s]))
            const recentSessions = [...subj.sessions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10)

            return (
              <div key={subj.id} className={styles.subjectBlock}>
                <div className={styles.subjectHeader}>
                  <span className={styles.subjectName}>{subj.name}</span>
                  {belowTarget && <span className={styles.warningBadge} title="Below attendance target">⚠️</span>}
                  <span className={`${styles.pctBadge} ${belowTarget ? styles.pctRed : styles.pctGreen}`}>{pct}%</span>
                  <span style={{ fontSize: 12, color: 'var(--mist)' }}>({attended}/{total}) target: {subj.targetPercent}%</span>
                  <button className={styles.deleteSubjectBtn} onClick={() => deleteSubject(subj.id)}>✕</button>
                </div>

                <div className={styles.progressRow}>
                  <div className={styles.progressFill} style={{ width: `${pct}%`, background: belowTarget ? 'var(--crimson)' : 'var(--emerald-light)' }} />
                </div>

                {/* Log a session */}
                <div className={styles.logRow}>
                  <div className={styles.logInput}>
                    <input
                      type="date"
                      value={inputs.date || todayStr()}
                      onChange={(e) => setLogInputs((prev) => ({ ...prev, [subj.id]: { ...prev[subj.id], date: e.target.value } }))}
                    />
                  </div>
                  <div className={styles.noteInput}>
                    <input
                      type="text"
                      placeholder="Note (optional)"
                      value={inputs.note || ''}
                      onChange={(e) => setLogInputs((prev) => ({ ...prev, [subj.id]: { ...prev[subj.id], note: e.target.value } }))}
                    />
                  </div>
                  <button className={styles.presentBtn} onClick={() => logSession(subj.id, true)}>✓ Present</button>
                  <button className={styles.absentBtn} onClick={() => logSession(subj.id, false)}>✗ Absent</button>
                </div>

                {/* Calendar grid */}
                <div className={styles.calTitle}>Last 12 Weeks</div>
                <div className={styles.calendar}>
                  {last84.map((day) => {
                    const sess = sessionMap.get(day)
                    let cls = styles.calEmpty
                    if (sess) cls = sess.attended ? styles.calPresent : styles.calAbsent
                    return <div key={day} className={`${styles.calCell} ${cls}`} title={`${day}${sess ? (sess.attended ? ' — Present' : ' — Absent') : ''}`} />
                  })}
                </div>

                {/* Recent sessions */}
                {recentSessions.length > 0 && (
                  <div className={styles.sessionList}>
                    {recentSessions.map((sess) => (
                      <div key={sess.id} className={styles.sessionItem}>
                        <div className={`${styles.dot} ${sess.attended ? styles.dotPresent : styles.dotAbsent}`} />
                        <span>{new Date(sess.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                        <span>{sess.attended ? 'Present' : 'Absent'}</span>
                        {sess.note && <span style={{ fontStyle: 'italic' }}>{sess.note}</span>}
                        <button className={styles.deleteSessionBtn} onClick={() => deleteSession(subj.id, sess.id)}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
