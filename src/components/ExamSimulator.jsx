import { useState, useEffect, useRef } from 'react'
import { useUserData } from '../hooks/useUserData'
import styles from './ExamSimulator.module.css'

const emptySession = { name: '', subject: '', duration: '90', totalMarks: '100', notes: '' }

function fmt(secs) {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function ExamSimulator({ storageKey }) {
  const [history, setHistory] = useUserData(`${storageKey}_exam_sims`, [])
  const [view, setView] = useState('home') // home | setup | active | score | log
  const [session, setSession] = useState(emptySession)
  const [activeSession, setActiveSession] = useState(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const [running, setRunning] = useState(false)
  const [paused, setPaused] = useState(false)
  const [marksObtained, setMarksObtained] = useState('')
  const [selfNotes, setSelfNotes] = useState('')
  const intervalRef = useRef(null)

  useEffect(() => {
    if (running && !paused) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) { clearInterval(intervalRef.current); setRunning(false); setView('score'); return 0 }
          return t - 1
        })
      }, 1000)
    }
    return () => clearInterval(intervalRef.current)
  }, [running, paused])

  const set = (k) => (e) => setSession((f) => ({ ...f, [k]: e.target.value }))

  const startSession = () => {
    if (!session.name.trim()) return
    const dur = parseInt(session.duration) || 60
    setActiveSession({ ...session, startedAt: Date.now(), durationSecs: dur * 60 })
    setTimeLeft(dur * 60)
    setRunning(true); setPaused(false)
    setMarksObtained(''); setSelfNotes('')
    setView('active')
  }

  const endEarly = () => {
    clearInterval(intervalRef.current); setRunning(false); setView('score')
  }

  const saveResult = () => {
    const marks = parseFloat(marksObtained)
    const total = parseFloat(activeSession.totalMarks) || 100
    const pct = isNaN(marks) ? null : Math.round((marks / total) * 100)
    const elapsed = activeSession.durationSecs - timeLeft
    setHistory([{
      id: Date.now(),
      name: activeSession.name,
      subject: activeSession.subject,
      date: new Date().toLocaleDateString(),
      totalMarks: total,
      marksObtained: isNaN(marks) ? null : marks,
      pct,
      timeTaken: elapsed,
      notes: selfNotes.trim(),
    }, ...history])
    setView('log'); setActiveSession(null); setSession(emptySession)
  }

  const deleteEntry = (id) => setHistory(history.filter((h) => h.id !== id))

  const pctColor = (p) => p >= 70 ? 'var(--emerald-light)' : p >= 50 ? 'var(--gold)' : '#e05c6e'
  const avgScore = history.filter((h) => h.pct !== null).reduce((acc, h, _, a) => acc + h.pct / a.length, 0)
  const trend = history.length >= 2 ? (history[0].pct - history[1].pct) : null

  if (view === 'active' && activeSession) {
    const totalSecs = activeSession.durationSecs
    const pctLeft = (timeLeft / totalSecs) * 100
    const urgent = timeLeft < 600
    return (
      <section id="simulator" className="section">
        <div className="section-header">
          <p className="section-eyebrow">✦ Pressure Inoculation — Active Session</p>
          <h2 className="section-title">Exam <em>Simulation</em></h2>
          <div className="divider" />
        </div>
        <div className={styles.activeCard}>
          <div className={styles.sessionName}>{activeSession.name}</div>
          {activeSession.subject && <div className={styles.sessionSubject}>{activeSession.subject}</div>}
          <div className={`${styles.timer} ${urgent ? styles.timerUrgent : ''}`}>{fmt(timeLeft)}</div>
          <div className={styles.timerLabel}>{urgent ? '⚠ Final stretch!' : 'Time remaining'}</div>
          <div className={styles.progressTrack}>
            <div className={styles.progressFill} style={{ width: `${pctLeft}%`, background: urgent ? '#e05c6e' : 'var(--emerald-light)' }} />
          </div>
          <div className={styles.sessionMeta}>
            Total marks: <strong>{activeSession.totalMarks}</strong> · Target: <strong>{Math.ceil(activeSession.totalMarks * 0.7)}+</strong> to pass
          </div>
          <div className={styles.activeActions}>
            <button className={styles.pauseBtn} onClick={() => setPaused((p) => !p)}>
              {paused ? '▶ Resume' : '⏸ Pause'}
            </button>
            <button className={styles.endBtn} onClick={endEarly}>End Exam Early</button>
          </div>
          {activeSession.notes && (
            <div className={styles.sessionNotesBox}><strong>Exam Notes:</strong> {activeSession.notes}</div>
          )}
        </div>
      </section>
    )
  }

  if (view === 'score') {
    return (
      <section id="simulator" className="section">
        <div className="section-header">
          <p className="section-eyebrow">✦ Simulation Complete</p>
          <h2 className="section-title">Mark <em>Your Paper</em></h2>
          <div className="divider" />
        </div>
        <div className={styles.scoreCard}>
          <div className={styles.scoreTitle}>{activeSession?.name}</div>
          <div className={styles.scoreRow}>
            <div className="field-group" style={{ flex: 1 }}>
              <label>Marks Obtained (out of {activeSession?.totalMarks})</label>
              <input type="number" min="0" max={activeSession?.totalMarks} placeholder="e.g. 72" value={marksObtained} onChange={(e) => setMarksObtained(e.target.value)} autoFocus />
            </div>
          </div>
          {marksObtained && (
            <div className={styles.scorePreview}>
              <div className={styles.scorePct} style={{ color: pctColor(Math.round(parseFloat(marksObtained) / parseFloat(activeSession?.totalMarks || 100) * 100)) }}>
                {Math.round(parseFloat(marksObtained) / parseFloat(activeSession?.totalMarks || 100) * 100)}%
              </div>
              <div className={styles.scoreLabel}>Your Score</div>
            </div>
          )}
          <div className="field-group">
            <label>Reflection Notes (optional)</label>
            <textarea placeholder="What went well? What topics cost you marks? What to revise before the real exam?" rows={3} value={selfNotes} onChange={(e) => setSelfNotes(e.target.value)} style={{ resize: 'vertical' }} />
          </div>
          <div className={styles.scoreActions}>
            <button className="btn-primary" onClick={saveResult}>Save Result →</button>
            <button className={styles.skipBtn} onClick={saveResult}>Skip Scoring</button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="simulator" className="section">
      <div className="section-header">
        <p className="section-eyebrow">✦ Phase 5 — Pressure Inoculation</p>
        <h2 className="section-title">Exam <em>Simulator</em></h2>
        <div className="divider" />
        <p className={styles.subtitle}>
          Every past paper you do must be done under exam conditions — timed, alone, pen only. Make the real exam feel like the tenth time you've been there.
        </p>
      </div>

      {history.length > 0 && (
        <div className={styles.statsRow}>
          <div className={styles.statBox}>
            <div className={styles.statNum}>{history.length}</div>
            <div className={styles.statLabel}>Simulations Completed</div>
          </div>
          <div className={styles.statBox}>
            <div className={styles.statNum} style={{ color: pctColor(avgScore) }}>
              {isNaN(avgScore) || history.filter((h) => h.pct !== null).length === 0 ? '—' : `${Math.round(avgScore)}%`}
            </div>
            <div className={styles.statLabel}>Average Score</div>
          </div>
          <div className={styles.statBox}>
            <div className={styles.statNum} style={{ color: trend === null ? 'var(--mist)' : trend >= 0 ? 'var(--emerald-light)' : '#e05c6e' }}>
              {trend === null ? '—' : `${trend >= 0 ? '+' : ''}${trend}%`}
            </div>
            <div className={styles.statLabel}>Latest Trend</div>
          </div>
        </div>
      )}

      <div className={styles.controls}>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className={`${styles.tabBtn} ${view === 'home' ? styles.tabActive : ''}`} onClick={() => setView('home')}>+ New Simulation</button>
          {history.length > 0 && <button className={`${styles.tabBtn} ${view === 'log' ? styles.tabActive : ''}`} onClick={() => setView('log')}>History ({history.length})</button>}
        </div>
      </div>

      {view === 'home' && (
        <div className={styles.setupCard}>
          <div className={styles.setupTitle}>Configure Your Simulation</div>
          <div className={styles.formGrid}>
            <div className="field-group">
              <label>Exam / Paper Name</label>
              <input type="text" placeholder="e.g. Corporate Finance Final 2024" value={session.name} onChange={set('name')} />
            </div>
            <div className="field-group">
              <label>Subject / Module</label>
              <input type="text" placeholder="e.g. Financial Management" value={session.subject} onChange={set('subject')} />
            </div>
            <div className="field-group">
              <label>Duration (minutes)</label>
              <input type="number" min="5" max="300" value={session.duration} onChange={set('duration')} />
            </div>
            <div className="field-group">
              <label>Total Marks Available</label>
              <input type="number" min="1" value={session.totalMarks} onChange={set('totalMarks')} />
            </div>
            <div className="field-group" style={{ gridColumn: '1 / -1' }}>
              <label>Notes (optional — shown during exam)</label>
              <input type="text" placeholder="e.g. Attempt Q1 first. Show all workings. Watch time on Section B." value={session.notes} onChange={set('notes')} />
            </div>
          </div>
          <button className={`btn-primary ${styles.startBtn}`} onClick={startSession}>🎯 Start Simulation →</button>
        </div>
      )}

      {view === 'log' && (
        <div>
          {history.length === 0 ? (
            <div className={styles.empty}><span style={{ fontSize: 40 }}>🎯</span><p>No simulations yet. Start your first one above.</p></div>
          ) : (
            <div className={styles.logList}>
              {history.map((h) => (
                <div key={h.id} className={styles.logRow}>
                  <div className={styles.logLeft}>
                    <div className={styles.logName}>{h.name}</div>
                    {h.subject && <div className={styles.logSubject}>{h.subject}</div>}
                    <div className={styles.logMeta}>{h.date} · {Math.floor(h.timeTaken / 60)}min taken</div>
                    {h.notes && <div className={styles.logNotes}>💬 {h.notes}</div>}
                  </div>
                  <div className={styles.logRight}>
                    {h.pct !== null ? (
                      <>
                        <div className={styles.logPct} style={{ color: pctColor(h.pct) }}>{h.pct}%</div>
                        <div className={styles.logMarks}>{h.marksObtained}/{h.totalMarks}</div>
                      </>
                    ) : (
                      <div className={styles.logPct} style={{ color: 'var(--mist)' }}>—</div>
                    )}
                    <button className={styles.deleteBtn} onClick={() => deleteEntry(h.id)}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  )
}
