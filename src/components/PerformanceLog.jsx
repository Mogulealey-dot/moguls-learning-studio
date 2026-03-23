import { useState, useMemo } from 'react'
import { useUserData } from '../hooks/useUserData'
import styles from './PerformanceLog.module.css'

const today = () => new Date().toISOString().split('T')[0]

const emptyEntry = {
  date: today(),
  sleep: '7',
  exercise: 'no',
  exerciseMins: '',
  caffeine: '1',
  coldShower: 'no',
  studyQuality: '7',
  focusRating: '7',
  mood: '7',
  notes: '',
}

const CAFFEINE_LABELS = { '0': 'None', '1': '1 cup', '2': '2 cups', '3': '3+ cups' }

function Bar({ value, max = 10, color }) {
  return (
    <div className={styles.miniBarTrack}>
      <div className={styles.miniBarFill} style={{ width: `${(value / max) * 100}%`, background: color }} />
    </div>
  )
}

function avg(arr, key) {
  const vals = arr.map((e) => parseFloat(e[key])).filter((v) => !isNaN(v))
  if (vals.length === 0) return null
  return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)
}

export default function PerformanceLog({ storageKey }) {
  const [entries, setEntries] = useUserData(`${storageKey}_perf_log`, [])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyEntry)
  const [editId, setEditId] = useState(null)
  const [view, setView] = useState('log') // log | insights

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const setVal = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const saveEntry = () => {
    if (editId) {
      setEntries(entries.map((e) => e.id === editId ? { ...e, ...form } : e))
      setEditId(null)
    } else {
      const existing = entries.find((e) => e.date === form.date)
      if (existing) {
        setEntries(entries.map((e) => e.id === existing.id ? { ...e, ...form } : e))
      } else {
        setEntries([{ id: Date.now(), ...form }, ...entries])
      }
    }
    setShowForm(false); setForm({ ...emptyEntry, date: today() })
  }

  const deleteEntry = (id) => setEntries(entries.filter((e) => e.id !== id))
  const startEdit = (e) => { setForm({ ...emptyEntry, ...e }); setEditId(e.id); setShowForm(true) }

  const recent7 = useMemo(() => [...entries].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 7), [entries])
  const avgSleep = avg(entries, 'sleep')
  const avgQuality = avg(entries, 'studyQuality')
  const avgFocus = avg(entries, 'focusRating')
  const exerciseDays = entries.filter((e) => e.exercise === 'yes').length
  const coldDays = entries.filter((e) => e.coldShower === 'yes').length

  const qualityColor = (v) => v >= 8 ? 'var(--emerald-light)' : v >= 6 ? 'var(--gold)' : '#e05c6e'

  return (
    <section id="perflog" className="section">
      <div className="section-header">
        <p className="section-eyebrow">✦ Phase 4 — Biohacking & Peak Performance</p>
        <h2 className="section-title">Performance <em>Log</em></h2>
        <div className="divider" />
        <p className={styles.subtitle}>
          Your brain is an organ. Track the inputs — sleep, exercise, caffeine, cold exposure — and correlate them with your study output. Data beats willpower.
        </p>
      </div>

      {entries.length > 0 && (
        <div className={styles.statsRow}>
          <div className={styles.statBox}>
            <div className={styles.statNum}>{entries.length}</div>
            <div className={styles.statLabel}>Days Logged</div>
          </div>
          <div className={styles.statBox}>
            <div className={styles.statNum} style={{ color: parseFloat(avgSleep) >= 7.5 ? 'var(--emerald-light)' : 'var(--gold)' }}>{avgSleep ?? '—'}h</div>
            <div className={styles.statLabel}>Avg Sleep</div>
          </div>
          <div className={styles.statBox}>
            <div className={styles.statNum} style={{ color: qualityColor(parseFloat(avgQuality)) }}>{avgQuality ?? '—'}</div>
            <div className={styles.statLabel}>Avg Study Quality</div>
          </div>
          <div className={styles.statBox}>
            <div className={styles.statNum} style={{ color: 'var(--emerald-light)' }}>{exerciseDays}</div>
            <div className={styles.statLabel}>Exercise Days</div>
          </div>
          <div className={styles.statBox}>
            <div className={styles.statNum} style={{ color: '#6bcfff' }}>{coldDays}</div>
            <div className={styles.statLabel}>Cold Showers</div>
          </div>
        </div>
      )}

      <div className={styles.controls}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className={`${styles.tabBtn} ${view === 'log' ? styles.tabActive : ''}`} onClick={() => setView('log')}>Log</button>
          {entries.length >= 3 && <button className={`${styles.tabBtn} ${view === 'insights' ? styles.tabActive : ''}`} onClick={() => setView('insights')}>Insights</button>}
        </div>
        <button className={styles.addBtn} onClick={() => { setShowForm((v) => !v); setEditId(null); setForm({ ...emptyEntry, date: today() }) }}>
          {showForm ? '✕ Cancel' : '+ Log Today'}
        </button>
      </div>

      {showForm && (
        <div className={styles.form}>
          <div className={styles.formTitle}>{editId ? 'Edit Entry' : `Log: ${form.date}`}</div>
          <div className={styles.formGrid}>
            <div className="field-group">
              <label>Date</label>
              <input type="date" value={form.date} onChange={set('date')} />
            </div>
            <div className="field-group">
              <label>Sleep — {form.sleep}h</label>
              <input type="range" min="3" max="12" step="0.5" value={form.sleep} onChange={set('sleep')} className={styles.rangeInput} />
              <div className={styles.rangeLabels}><span>3h</span><span>12h</span></div>
            </div>
            <div className="field-group">
              <label>Exercise</label>
              <div className={styles.toggleRow}>
                {['no', 'yes'].map((v) => (
                  <button key={v} className={`${styles.toggleBtn} ${form.exercise === v ? styles.toggleActive : ''}`} onClick={() => setVal('exercise', v)}>
                    {v === 'yes' ? '✅ Yes' : '⬜ No'}
                  </button>
                ))}
                {form.exercise === 'yes' && (
                  <input type="number" className={styles.smallInput} placeholder="mins" min="0" max="300" value={form.exerciseMins} onChange={set('exerciseMins')} />
                )}
              </div>
            </div>
            <div className="field-group">
              <label>Caffeine</label>
              <div className={styles.toggleRow}>
                {Object.entries(CAFFEINE_LABELS).map(([v, l]) => (
                  <button key={v} className={`${styles.toggleBtn} ${form.caffeine === v ? styles.toggleActive : ''}`} onClick={() => setVal('caffeine', v)}>{l}</button>
                ))}
              </div>
            </div>
            <div className="field-group">
              <label>Cold Shower / Cold Exposure</label>
              <div className={styles.toggleRow}>
                {['no', 'yes'].map((v) => (
                  <button key={v} className={`${styles.toggleBtn} ${form.coldShower === v ? styles.toggleActive : ''}`} onClick={() => setVal('coldShower', v)}>
                    {v === 'yes' ? '🧊 Yes' : '⬜ No'}
                  </button>
                ))}
              </div>
            </div>
            <div className="field-group">
              <label>Study Quality — {form.studyQuality}/10</label>
              <input type="range" min="1" max="10" value={form.studyQuality} onChange={set('studyQuality')} className={styles.rangeInput} />
              <div className={styles.rangeLabels}><span>1 (poor)</span><span>10 (peak)</span></div>
            </div>
            <div className="field-group">
              <label>Focus Rating — {form.focusRating}/10</label>
              <input type="range" min="1" max="10" value={form.focusRating} onChange={set('focusRating')} className={styles.rangeInput} />
              <div className={styles.rangeLabels}><span>1</span><span>10</span></div>
            </div>
            <div className="field-group">
              <label>Mood — {form.mood}/10</label>
              <input type="range" min="1" max="10" value={form.mood} onChange={set('mood')} className={styles.rangeInput} />
              <div className={styles.rangeLabels}><span>1</span><span>10</span></div>
            </div>
            <div className="field-group" style={{ gridColumn: '1 / -1' }}>
              <label>Notes (optional)</label>
              <input type="text" placeholder="e.g. Great session on derivatives. Slept badly, showed in focus." value={form.notes} onChange={set('notes')} />
            </div>
          </div>
          <div className={styles.formActions}>
            <button className="btn-primary" onClick={saveEntry}>{editId ? 'Update →' : 'Save Entry →'}</button>
            <button className={styles.cancelBtn} onClick={() => { setShowForm(false); setEditId(null) }}>Cancel</button>
          </div>
        </div>
      )}

      {entries.length === 0 ? (
        <div className={styles.empty}>
          <span style={{ fontSize: 40 }}>📊</span>
          <p>No days logged yet. Start tracking today.</p>
          <p style={{ fontSize: 13, maxWidth: 500 }}>
            Log sleep, exercise, caffeine, and cold exposure daily. After a week you'll see clear patterns between your inputs and study quality.
          </p>
        </div>
      ) : view === 'log' ? (
        <div className={styles.list}>
          {[...entries].sort((a, b) => b.date.localeCompare(a.date)).map((e) => (
            <div key={e.id} className={styles.row}>
              <div className={styles.rowDate}>
                <div className={styles.dateStr}>{new Date(e.date + 'T12:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                <div className={styles.dateActions}>
                  <button className={styles.editBtn} onClick={() => startEdit(e)}>Edit</button>
                  <button className={styles.deleteBtn} onClick={() => deleteEntry(e.id)}>✕</button>
                </div>
              </div>
              <div className={styles.rowMetrics}>
                <div className={styles.metric}>
                  <div className={styles.metricLabel}>Sleep</div>
                  <div className={styles.metricVal} style={{ color: parseFloat(e.sleep) >= 7.5 ? 'var(--emerald-light)' : 'var(--gold)' }}>{e.sleep}h</div>
                  <Bar value={parseFloat(e.sleep)} max={12} color={parseFloat(e.sleep) >= 7.5 ? 'var(--emerald-light)' : 'var(--gold)'} />
                </div>
                <div className={styles.metric}>
                  <div className={styles.metricLabel}>Study Quality</div>
                  <div className={styles.metricVal} style={{ color: qualityColor(parseFloat(e.studyQuality)) }}>{e.studyQuality}/10</div>
                  <Bar value={parseFloat(e.studyQuality)} max={10} color={qualityColor(parseFloat(e.studyQuality))} />
                </div>
                <div className={styles.metric}>
                  <div className={styles.metricLabel}>Focus</div>
                  <div className={styles.metricVal} style={{ color: qualityColor(parseFloat(e.focusRating)) }}>{e.focusRating}/10</div>
                  <Bar value={parseFloat(e.focusRating)} max={10} color={qualityColor(parseFloat(e.focusRating))} />
                </div>
                <div className={styles.metric}>
                  <div className={styles.metricLabel}>Mood</div>
                  <div className={styles.metricVal} style={{ color: qualityColor(parseFloat(e.mood)) }}>{e.mood}/10</div>
                  <Bar value={parseFloat(e.mood)} max={10} color={qualityColor(parseFloat(e.mood))} />
                </div>
                <div className={styles.badges}>
                  {e.exercise === 'yes' && <span className={styles.badge} style={{ color: 'var(--emerald-light)', borderColor: 'var(--emerald)' }}>🏃 {e.exerciseMins ? `${e.exerciseMins}min` : 'Exercise'}</span>}
                  <span className={styles.badge} style={{ color: 'var(--gold)', borderColor: 'rgba(201,168,76,0.3)' }}>☕ {CAFFEINE_LABELS[e.caffeine] ?? e.caffeine}</span>
                  {e.coldShower === 'yes' && <span className={styles.badge} style={{ color: '#6bcfff', borderColor: 'rgba(107,207,255,0.3)' }}>🧊 Cold</span>}
                </div>
              </div>
              {e.notes && <div className={styles.rowNotes}>{e.notes}</div>}
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.insights}>
          <div className={styles.insightTitle}>Last 7 Days — Performance Trend</div>
          <div className={styles.chart}>
            {recent7.reverse().map((e, i) => (
              <div key={e.id} className={styles.chartCol}>
                <div className={styles.chartBars}>
                  <div className={styles.chartBar} style={{ height: `${parseFloat(e.studyQuality) * 10}%`, background: qualityColor(parseFloat(e.studyQuality)) }} title={`Study Quality: ${e.studyQuality}`} />
                  <div className={styles.chartBar} style={{ height: `${(parseFloat(e.sleep) / 12) * 100}%`, background: '#6bcfff' }} title={`Sleep: ${e.sleep}h`} />
                </div>
                <div className={styles.chartLabel}>{new Date(e.date + 'T12:00').toLocaleDateString('en-US', { weekday: 'short' })}</div>
              </div>
            ))}
          </div>
          <div className={styles.chartLegend}>
            <span className={styles.legendItem}><span style={{ background: 'var(--emerald-light)', display: 'inline-block', width: 10, height: 10, borderRadius: 2 }} /> Study Quality</span>
            <span className={styles.legendItem}><span style={{ background: '#6bcfff', display: 'inline-block', width: 10, height: 10, borderRadius: 2 }} /> Sleep</span>
          </div>
          <div className={styles.insightCards}>
            <div className={styles.insightCard}>
              <div className={styles.insightCardTitle}>Sleep Protocol</div>
              <div className={styles.insightCardValue} style={{ color: parseFloat(avgSleep) >= 7.5 ? 'var(--emerald-light)' : '#e05c6e' }}>{avgSleep ?? '—'}h avg</div>
              <div className={styles.insightCardNote}>{parseFloat(avgSleep) >= 7.5 ? '✅ On target (7.5–9h)' : '⚠ Below optimal — memory consolidation is impaired below 7.5h'}</div>
            </div>
            <div className={styles.insightCard}>
              <div className={styles.insightCardTitle}>Exercise Frequency</div>
              <div className={styles.insightCardValue} style={{ color: 'var(--emerald-light)' }}>{exerciseDays}/{entries.length} days</div>
              <div className={styles.insightCardNote}>30–40min aerobic exercise raises BDNF — your brain's growth hormone. Post-workout is your peak study window.</div>
            </div>
            <div className={styles.insightCard}>
              <div className={styles.insightCardTitle}>Cold Exposure</div>
              <div className={styles.insightCardValue} style={{ color: '#6bcfff' }}>{coldDays}/{entries.length} days</div>
              <div className={styles.insightCardNote}>Cold shower before study: 200–300% norepinephrine surge. Free, fast, potent. Focus on demand.</div>
            </div>
            <div className={styles.insightCard}>
              <div className={styles.insightCardTitle}>Avg Study Quality</div>
              <div className={styles.insightCardValue} style={{ color: qualityColor(parseFloat(avgQuality)) }}>{avgQuality ?? '—'}/10</div>
              <div className={styles.insightCardNote}>{parseFloat(avgQuality) >= 7 ? '✅ Strong output. Maintain the system.' : '⚠ Review sleep + exercise. Eliminate phone during sessions.'}</div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
