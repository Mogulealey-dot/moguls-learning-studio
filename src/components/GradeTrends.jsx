import { useState, useMemo } from 'react'
import { useUserData } from '../hooks/useUserData'
import styles from './GradeTrends.module.css'

const SUBJECT_COLORS = ['#4a9eca','#e8a84c','#2a9b6e','#e74c8b','#9b7fd4','#cd6155','#27ae60','#f39c12']

const ASSESSMENT_TYPES = ['test', 'assignment', 'exam', 'quiz']

function letterGrade(pct) {
  if (pct >= 90) return { letter: 'A+', gpa: 4.0 }
  if (pct >= 85) return { letter: 'A',  gpa: 4.0 }
  if (pct >= 80) return { letter: 'A-', gpa: 3.7 }
  if (pct >= 77) return { letter: 'B+', gpa: 3.3 }
  if (pct >= 73) return { letter: 'B',  gpa: 3.0 }
  if (pct >= 70) return { letter: 'B-', gpa: 2.7 }
  if (pct >= 67) return { letter: 'C+', gpa: 2.3 }
  if (pct >= 63) return { letter: 'C',  gpa: 2.0 }
  if (pct >= 60) return { letter: 'C-', gpa: 1.7 }
  if (pct >= 50) return { letter: 'D',  gpa: 1.0 }
  return { letter: 'F', gpa: 0.0 }
}

function LineChart({ entries, subjects, subjectColors }) {
  if (entries.length < 2) return <div style={{ fontSize: 13, color: 'var(--mist)', padding: 20, textAlign: 'center' }}>Add at least 2 entries to see the chart.</div>

  const W = 700, H = 260, PAD = { top: 20, right: 20, bottom: 40, left: 48 }
  const sorted = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date))
  const dates = sorted.map((e) => new Date(e.date).getTime())
  const minDate = Math.min(...dates), maxDate = Math.max(...dates)
  const dateRange = maxDate - minDate || 1

  const xScale = (d) => PAD.left + ((new Date(d).getTime() - minDate) / dateRange) * (W - PAD.left - PAD.right)
  const yScale = (v) => PAD.top + (1 - v / 100) * (H - PAD.top - PAD.bottom)

  const yLines = [0, 25, 50, 75, 100]
  const uniqueDates = [...new Set(sorted.map((e) => e.date))].slice(0, 8)

  return (
    <svg className={styles.chart} width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      {/* Grid lines */}
      {yLines.map((v) => (
        <g key={v}>
          <line x1={PAD.left} y1={yScale(v)} x2={W - PAD.right} y2={yScale(v)} stroke="rgba(245,240,232,0.06)" strokeWidth={1} />
          <text x={PAD.left - 8} y={yScale(v) + 4} textAnchor="end" fontSize={10} fill="rgba(245,240,232,0.3)">{v}</text>
        </g>
      ))}
      {/* Date labels */}
      {uniqueDates.map((d) => (
        <text key={d} x={xScale(d)} y={H - 6} textAnchor="middle" fontSize={9} fill="rgba(245,240,232,0.35)">
          {new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </text>
      ))}
      {/* Lines per subject */}
      {subjects.map((subj, si) => {
        const pts = sorted.filter((e) => e.subject === subj)
        if (pts.length < 2) return null
        const path = pts.map((e, i) => `${i === 0 ? 'M' : 'L'} ${xScale(e.date)} ${yScale(e.grade)}`).join(' ')
        return (
          <g key={subj}>
            <path d={path} stroke={subjectColors[si % subjectColors.length]} strokeWidth={2} fill="none" strokeLinejoin="round" />
            {pts.map((e, i) => (
              <circle key={i} cx={xScale(e.date)} cy={yScale(e.grade)} r={4} fill={subjectColors[si % subjectColors.length]} />
            ))}
          </g>
        )
      })}
    </svg>
  )
}

export default function GradeTrends({ storageKey }) {
  const key = `${storageKey}_grade_history`
  const [entries, setEntries] = useUserData(key, [])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ subject: '', grade: '', date: '', type: 'test', notes: '' })
  const [filterSubject, setFilterSubject] = useState('all')

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const addEntry = () => {
    if (!form.subject.trim() || !form.grade || !form.date) return
    const g = Math.min(100, Math.max(0, Number(form.grade)))
    setEntries([...entries, { id: Date.now(), subject: form.subject.trim(), grade: g, date: form.date, type: form.type, notes: form.notes }])
    setForm((f) => ({ ...f, grade: '', notes: '' }))
  }

  const deleteEntry = (id) => setEntries(entries.filter((e) => e.id !== id))

  const subjects = useMemo(() => [...new Set(entries.map((e) => e.subject))], [entries])

  const filtered = filterSubject === 'all' ? entries : entries.filter((e) => e.subject === filterSubject)

  const summary = subjects.map((subj, si) => {
    const subEntries = entries.filter((e) => e.subject === subj)
    const grades = subEntries.map((e) => e.grade)
    const avg = grades.length ? grades.reduce((a, b) => a + b, 0) / grades.length : 0
    const sorted = [...subEntries].sort((a, b) => new Date(a.date) - new Date(b.date))
    const trend = sorted.length >= 2
      ? sorted[sorted.length - 1].grade - sorted[0].grade
      : 0
    return {
      subject: subj,
      avg: avg.toFixed(1),
      high: Math.max(...grades).toFixed(1),
      low: Math.min(...grades).toFixed(1),
      trend,
      color: SUBJECT_COLORS[si % SUBJECT_COLORS.length],
    }
  })

  const overallGpa = summary.length
    ? (summary.reduce((a, s) => a + letterGrade(Number(s.avg)).gpa, 0) / summary.length).toFixed(2)
    : null

  return (
    <section id="trends" className="section">
      <div className="section-header">
        <p className="section-eyebrow">✦ Track Your Progress</p>
        <h2 className="section-title">Grade <em>Trends</em></h2>
        <div className="divider" />
      </div>

      {overallGpa && (
        <div className={styles.gpaBox}>
          <div className={styles.gpaNum}>{overallGpa}</div>
          <div>
            <div className={styles.gpaLabel}>Overall GPA (4.0 scale)</div>
            <div style={{ fontSize: 12, color: 'var(--mist)', marginTop: 4 }}>{summary.length} subject{summary.length !== 1 ? 's' : ''} tracked</div>
          </div>
        </div>
      )}

      <div className={styles.controls}>
        <div className={styles.filters}>
          <button className={`${styles.filterBtn} ${filterSubject === 'all' ? styles.activeFilter : ''}`} onClick={() => setFilterSubject('all')}>All Subjects</button>
          {subjects.map((s) => (
            <button key={s} className={`${styles.filterBtn} ${filterSubject === s ? styles.activeFilter : ''}`} onClick={() => setFilterSubject(s)}>{s}</button>
          ))}
        </div>
        <button className={styles.addBtn} onClick={() => setShowForm((v) => !v)}>
          {showForm ? '✕ Cancel' : '+ Add Grade'}
        </button>
      </div>

      {showForm && (
        <div className={styles.form}>
          <div className={styles.formGrid}>
            <div className="field-group">
              <label>Subject</label>
              <input type="text" placeholder="e.g. Mathematics" value={form.subject} onChange={set('subject')} list="subj-list" />
              {subjects.length > 0 && <datalist id="subj-list">{subjects.map((s) => <option key={s} value={s} />)}</datalist>}
            </div>
            <div className="field-group">
              <label>Score (%)</label>
              <input type="number" min="0" max="100" placeholder="e.g. 78" value={form.grade} onChange={set('grade')} />
            </div>
            <div className="field-group">
              <label>Date</label>
              <input type="date" value={form.date} onChange={set('date')} />
            </div>
            <div className="field-group">
              <label>Type</label>
              <select className={styles.select} value={form.type} onChange={set('type')}>
                {ASSESSMENT_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
            <div className="field-group" style={{ gridColumn: '1/-1' }}>
              <label>Notes (optional)</label>
              <input type="text" placeholder="Any notes..." value={form.notes} onChange={set('notes')} />
            </div>
          </div>
          <div className={styles.formActions}>
            <button className="btn-primary" onClick={addEntry}>Add Entry →</button>
            <button className={styles.cancelBtn} onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {entries.length === 0 ? (
        <div className={styles.empty}>
          <span style={{ fontSize: 40 }}>📈</span>
          <p>No grade entries yet. Add your first grade above!</p>
        </div>
      ) : (
        <>
          {/* Legend */}
          <div className={styles.legend}>
            {summary.map((s) => (
              <div key={s.subject} className={styles.legendItem}>
                <div className={styles.legendDot} style={{ background: s.color }} />
                {s.subject}
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className={styles.chartWrap}>
            <LineChart entries={filtered} subjects={filterSubject === 'all' ? subjects : [filterSubject]} subjectColors={SUBJECT_COLORS} />
          </div>

          {/* Summary table */}
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Subject</th>
                <th>Average</th>
                <th>Highest</th>
                <th>Lowest</th>
                <th>Trend</th>
                <th>GPA</th>
              </tr>
            </thead>
            <tbody>
              {summary.map((s) => (
                <tr key={s.subject}>
                  <td><span style={{ color: s.color }}>●</span> {s.subject}</td>
                  <td>{s.avg}%</td>
                  <td>{s.high}%</td>
                  <td>{s.low}%</td>
                  <td>
                    {s.trend > 0
                      ? <span className={styles.trendUp}>↑ +{s.trend.toFixed(1)}</span>
                      : s.trend < 0
                        ? <span className={styles.trendDown}>↓ {s.trend.toFixed(1)}</span>
                        : <span className={styles.trendFlat}>→ stable</span>
                    }
                  </td>
                  <td>{letterGrade(Number(s.avg)).letter} ({letterGrade(Number(s.avg)).gpa.toFixed(1)})</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Entries */}
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Subject</th>
                <th>Score</th>
                <th>Type</th>
                <th>Date</th>
                <th>Notes</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {[...filtered].sort((a, b) => new Date(b.date) - new Date(a.date)).map((e) => (
                <tr key={e.id}>
                  <td>{e.subject}</td>
                  <td style={{ color: e.grade >= 70 ? 'var(--emerald-light)' : 'var(--crimson)', fontWeight: 600 }}>{e.grade}%</td>
                  <td style={{ color: 'var(--mist)' }}>{e.type}</td>
                  <td style={{ fontFamily: 'DM Mono, monospace', fontSize: 12 }}>{new Date(e.date).toLocaleDateString()}</td>
                  <td style={{ color: 'var(--mist)', fontSize: 13 }}>{e.notes}</td>
                  <td><button className={styles.deleteRowBtn} onClick={() => deleteEntry(e.id)}>✕</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </section>
  )
}
