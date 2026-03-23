import { useState, useMemo } from 'react'
import { useUserData } from '../hooks/useUserData'
import styles from './TopicFrequencyMap.module.css'

const PRIORITIES = {
  p1: { label: 'Priority 1 — High Yield', color: '#e05c6e', bg: 'rgba(224,92,110,0.1)', border: 'rgba(224,92,110,0.3)' },
  p2: { label: 'Priority 2 — Medium Yield', color: 'var(--gold)', bg: 'rgba(201,168,76,0.1)', border: 'rgba(201,168,76,0.3)' },
  p3: { label: 'Priority 3 — Low Yield', color: 'var(--mist)', bg: 'rgba(138,155,176,0.06)', border: 'rgba(138,155,176,0.15)' },
}

const emptyForm = { topic: '', category: '', appearances: '1', priority: 'p1', notes: '' }

export default function TopicFrequencyMap({ storageKey }) {
  const [topics, setTopics] = useUserData(`${storageKey}_topic_freq`, [])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('freq')

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const saveTopic = () => {
    if (!form.topic.trim()) return
    const entry = { ...form, appearances: parseInt(form.appearances) || 1 }
    if (editId) {
      setTopics(topics.map((t) => t.id === editId ? { ...t, ...entry } : t))
      setEditId(null)
    } else {
      setTopics([...topics, { id: Date.now(), ...entry }])
    }
    setForm(emptyForm); setShowForm(false)
  }

  const deleteTopic = (id) => setTopics(topics.filter((t) => t.id !== id))
  const startEdit = (t) => { setForm({ ...emptyForm, ...t, appearances: String(t.appearances) }); setEditId(t.id); setShowForm(true) }

  const applyPareto = () => {
    if (topics.length === 0) return
    const sorted = [...topics].sort((a, b) => b.appearances - a.appearances)
    const top20 = Math.max(1, Math.ceil(sorted.length * 0.2))
    const ids20 = new Set(sorted.slice(0, top20).map((t) => t.id))
    const ids60 = new Set(sorted.slice(top20, top20 + Math.ceil(sorted.length * 0.6)).map((t) => t.id))
    setTopics(topics.map((t) => ({
      ...t,
      priority: ids20.has(t.id) ? 'p1' : ids60.has(t.id) ? 'p2' : 'p3',
    })))
  }

  const categories = useMemo(() => ['all', ...new Set(topics.map((t) => t.category).filter(Boolean))], [topics])
  const maxAppearances = useMemo(() => Math.max(1, ...topics.map((t) => t.appearances)), [topics])

  const filtered = useMemo(() => {
    let arr = filter === 'all' ? topics : topics.filter((t) => t.category === filter)
    if (sortBy === 'freq') return [...arr].sort((a, b) => b.appearances - a.appearances)
    if (sortBy === 'priority') return [...arr].sort((a, b) => a.priority.localeCompare(b.priority))
    return [...arr].sort((a, b) => a.topic.localeCompare(b.topic))
  }, [topics, filter, sortBy])

  const p1Count = topics.filter((t) => t.priority === 'p1').length
  const totalApps = topics.reduce((s, t) => s + t.appearances, 0)
  const p1Apps = topics.filter((t) => t.priority === 'p1').reduce((s, t) => s + t.appearances, 0)

  return (
    <section id="topicmap" className="section">
      <div className="section-header">
        <p className="section-eyebrow">✦ Phase 0 — Intelligence Gathering</p>
        <h2 className="section-title">Topic <em>Frequency Map</em></h2>
        <div className="divider" />
        <p className={styles.subtitle}>
          Track how often each topic appears across past papers. Identify your Pareto 20% — the topics that will win you 80% of marks.
        </p>
      </div>

      {topics.length > 0 && (
        <div className={styles.statsRow}>
          <div className={styles.statBox}>
            <div className={styles.statNum}>{topics.length}</div>
            <div className={styles.statLabel}>Topics Mapped</div>
          </div>
          <div className={styles.statBox}>
            <div className={styles.statNum} style={{ color: PRIORITIES.p1.color }}>{p1Count}</div>
            <div className={styles.statLabel}>Priority 1 (Top {Math.round(p1Count / Math.max(1, topics.length) * 100)}%)</div>
          </div>
          <div className={styles.statBox}>
            <div className={styles.statNum} style={{ color: 'var(--gold)' }}>
              {totalApps > 0 ? Math.round(p1Apps / totalApps * 100) : 0}%
            </div>
            <div className={styles.statLabel}>Exam Coverage (P1)</div>
          </div>
        </div>
      )}

      <div className={styles.controls}>
        <div className={styles.controlsLeft}>
          <select className={styles.select} value={filter} onChange={(e) => setFilter(e.target.value)}>
            {categories.map((c) => <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>)}
          </select>
          <select className={styles.select} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="freq">Sort: Frequency</option>
            <option value="priority">Sort: Priority</option>
            <option value="alpha">Sort: A–Z</option>
          </select>
        </div>
        <div className={styles.controlsRight}>
          {topics.length >= 3 && (
            <button className={styles.paretoBtn} onClick={applyPareto} title="Auto-assign priorities using the 80/20 Pareto rule">
              ⚡ Auto-Pareto
            </button>
          )}
          <button className={styles.addBtn} onClick={() => { setShowForm((v) => !v); setEditId(null); setForm(emptyForm) }}>
            {showForm ? '✕ Cancel' : '+ Add Topic'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className={styles.form}>
          <div className={styles.formGrid}>
            <div className="field-group">
              <label>Topic Name</label>
              <input type="text" placeholder="e.g. Capital Structure" value={form.topic} onChange={set('topic')} autoFocus />
            </div>
            <div className="field-group">
              <label>Module / Category</label>
              <input type="text" placeholder="e.g. Corporate Finance" value={form.category} onChange={set('category')} />
            </div>
            <div className="field-group">
              <label>Times Appeared in Past Papers</label>
              <input type="number" min="1" max="99" placeholder="1" value={form.appearances} onChange={set('appearances')} />
            </div>
            <div className="field-group">
              <label>Priority</label>
              <select value={form.priority} onChange={set('priority')}>
                <option value="p1">Priority 1 — High Yield (study hard)</option>
                <option value="p2">Priority 2 — Medium Yield</option>
                <option value="p3">Priority 3 — Low Yield (minimal time)</option>
              </select>
            </div>
            <div className="field-group" style={{ gridColumn: '1 / -1' }}>
              <label>Examiner Notes (optional)</label>
              <input type="text" placeholder="e.g. Always tested as an essay question. Examiner rewards application of WACC." value={form.notes} onChange={set('notes')} />
            </div>
          </div>
          <div className={styles.formActions}>
            <button className="btn-primary" onClick={saveTopic}>{editId ? 'Update Topic →' : 'Add Topic →'}</button>
            <button className={styles.cancelBtn} onClick={() => { setShowForm(false); setEditId(null) }}>Cancel</button>
          </div>
        </div>
      )}

      {topics.length === 0 ? (
        <div className={styles.empty}>
          <span style={{ fontSize: 40 }}>🗺</span>
          <p>No topics mapped yet.</p>
          <p style={{ fontSize: 13, maxWidth: 480 }}>
            Add every topic from your past papers and track how often each appears. Then use <strong>Auto-Pareto</strong> to instantly identify your Priority 1 topics.
          </p>
        </div>
      ) : (
        <div className={styles.list}>
          {filtered.map((t) => {
            const p = PRIORITIES[t.priority]
            const barWidth = Math.max(4, Math.round((t.appearances / maxAppearances) * 100))
            return (
              <div key={t.id} className={styles.row} style={{ borderLeftColor: p.color }}>
                <div className={styles.rowLeft}>
                  <div className={styles.rowTopic}>{t.topic}</div>
                  {t.category && <div className={styles.rowCategory}>{t.category}</div>}
                  {t.notes && <div className={styles.rowNotes}>{t.notes}</div>}
                </div>
                <div className={styles.rowBar}>
                  <div className={styles.barTrack}>
                    <div className={styles.barFill} style={{ width: `${barWidth}%`, background: p.color }} />
                  </div>
                  <span className={styles.barLabel} style={{ color: p.color }}>
                    {t.appearances}× paper{t.appearances !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className={styles.rowRight}>
                  <span className={styles.priorityBadge} style={{ background: p.bg, color: p.color, borderColor: p.border }}>
                    {t.priority.toUpperCase()}
                  </span>
                  <button className={styles.editBtn} onClick={() => startEdit(t)}>Edit</button>
                  <button className={styles.deleteBtn} onClick={() => deleteTopic(t.id)}>✕</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {topics.length > 0 && (
        <div className={styles.legend}>
          {Object.entries(PRIORITIES).map(([k, p]) => (
            <div key={k} className={styles.legendItem}>
              <div className={styles.legendDot} style={{ background: p.color }} />
              <span>{p.label}: {topics.filter((t) => t.priority === k).length} topics</span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
