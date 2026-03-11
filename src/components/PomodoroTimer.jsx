import { useState, useEffect, useRef } from 'react'
import { LS } from '../utils'
import styles from './PomodoroTimer.module.css'

const MODES = [
  { label: 'Focus',       minutes: 25, color: 'var(--gold)' },
  { label: 'Short Break', minutes: 5,  color: 'var(--emerald-light)' },
  { label: 'Long Break',  minutes: 15, color: 'var(--mist)' },
]

export default function PomodoroTimer({ storageKey }) {
  const key = storageKey || 'mls_pomodoro_sessions'
  const [modeIdx, setModeIdx]   = useState(0)
  const [seconds, setSeconds]   = useState(MODES[0].minutes * 60)
  const [running, setRunning]   = useState(false)
  const [sessions, setSessions] = useState(() => LS.get(key, []))
  const intervalRef = useRef(null)
  const mode = MODES[modeIdx]

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) {
            clearInterval(intervalRef.current)
            setRunning(false)
            if (modeIdx === 0) {
              // Log completed focus session
              const session = { date: new Date().toLocaleDateString(), time: new Date().toLocaleTimeString(), duration: mode.minutes }
              const updated = [session, ...LS.get(key, [])].slice(0, 50)
              setSessions(updated)
              LS.set(key, updated)
            }
            return 0
          }
          return s - 1
        })
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [running])

  const switchMode = (idx) => {
    setModeIdx(idx)
    setSeconds(MODES[idx].minutes * 60)
    setRunning(false)
  }

  const reset = () => { setSeconds(mode.minutes * 60); setRunning(false) }

  const mins = String(Math.floor(seconds / 60)).padStart(2, '0')
  const secs = String(seconds % 60).padStart(2, '0')
  const progress = 1 - seconds / (mode.minutes * 60)
  const circumference = 2 * Math.PI * 90
  const strokeDash = circumference * progress

  const todaySessions = sessions.filter((s) => s.date === new Date().toLocaleDateString()).length
  const totalMins = sessions.reduce((a, s) => a + s.duration, 0)

  return (
    <section id="pomodoro" className="section" style={{ background: 'rgba(245,240,232,0.01)', borderTop: '1px solid rgba(201,168,76,0.08)' }}>
      <div className="section-header">
        <p className="section-eyebrow">✦ Stay Focused</p>
        <h2 className="section-title">Study <em>Timer</em></h2>
        <div className="divider" />
        <p style={{ marginTop: 16, fontSize: 14, color: 'var(--mist)' }}>
          The Pomodoro Technique: 25 min focus → 5 min break. Repeat. Get things done.
        </p>
      </div>

      <div className={styles.layout}>
        <div className={styles.timerCard}>
          {/* Mode tabs */}
          <div className={styles.modeTabs}>
            {MODES.map((m, i) => (
              <button key={i} className={`${styles.modeTab} ${modeIdx === i ? styles.activeMode : ''}`}
                style={modeIdx === i ? { borderColor: m.color, color: m.color } : {}}
                onClick={() => switchMode(i)}>{m.label}</button>
            ))}
          </div>

          {/* SVG circle timer */}
          <div className={styles.clockWrap}>
            <svg width="220" height="220" viewBox="0 0 220 220">
              <circle cx="110" cy="110" r="90" fill="none" stroke="rgba(245,240,232,0.05)" strokeWidth="8" />
              <circle
                cx="110" cy="110" r="90" fill="none"
                stroke={mode.color} strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${strokeDash} ${circumference}`}
                strokeDashoffset="0"
                transform="rotate(-90 110 110)"
                style={{ transition: 'stroke-dasharray 1s linear' }}
              />
            </svg>
            <div className={styles.clockCenter}>
              <div className={styles.timeDisplay} style={{ color: mode.color }}>{mins}:{secs}</div>
              <div className={styles.modeLabel}>{mode.label}</div>
            </div>
          </div>

          {/* Controls */}
          <div className={styles.controls}>
            <button className={styles.ctrlBtn} onClick={reset}>↺ Reset</button>
            <button className={styles.playBtn} style={{ background: mode.color }} onClick={() => setRunning((r) => !r)}>
              {running ? '⏸ Pause' : '▶ Start'}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className={styles.statsPanel}>
          <div className={styles.statGrid}>
            <div className={styles.statBox}>
              <div className={styles.statNum} style={{ color: 'var(--gold)' }}>{todaySessions}</div>
              <div className={styles.statLbl}>Sessions Today</div>
            </div>
            <div className={styles.statBox}>
              <div className={styles.statNum} style={{ color: 'var(--emerald-light)' }}>{sessions.length}</div>
              <div className={styles.statLbl}>Total Sessions</div>
            </div>
            <div className={styles.statBox}>
              <div className={styles.statNum} style={{ color: 'var(--mist)' }}>{totalMins}</div>
              <div className={styles.statLbl}>Total Minutes</div>
            </div>
            <div className={styles.statBox}>
              <div className={styles.statNum} style={{ color: 'var(--gold)' }}>{Math.round(totalMins / 60 * 10) / 10}</div>
              <div className={styles.statLbl}>Total Hours</div>
            </div>
          </div>

          <div className={styles.sessionLog}>
            <div className={styles.logTitle}>Recent Sessions</div>
            {sessions.length === 0 && <p className={styles.logEmpty}>No sessions yet. Start your first focus session!</p>}
            {sessions.slice(0, 8).map((s, i) => (
              <div key={i} className={styles.logItem}>
                <span className={styles.logIcon}>🍅</span>
                <span className={styles.logDate}>{s.date}</span>
                <span className={styles.logTime}>{s.time}</span>
                <span className={styles.logDur}>{s.duration} min</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
