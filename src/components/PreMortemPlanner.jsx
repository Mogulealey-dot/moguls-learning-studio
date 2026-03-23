import { useState } from 'react'
import { useUserData } from '../hooks/useUserData'
import styles from './PreMortemPlanner.module.css'

const SEVERITIES = {
  critical: { label: 'Critical', color: '#e05c6e', bg: 'rgba(224,92,110,0.1)', border: 'rgba(224,92,110,0.3)' },
  high:     { label: 'High',     color: '#e8a84c', bg: 'rgba(232,168,76,0.1)',  border: 'rgba(232,168,76,0.3)' },
  medium:   { label: 'Medium',   color: 'var(--gold)', bg: 'rgba(201,168,76,0.08)', border: 'rgba(201,168,76,0.2)' },
  low:      { label: 'Low',      color: 'var(--mist)', bg: 'rgba(138,155,176,0.06)', border: 'rgba(138,155,176,0.15)' },
}

const STATUSES = {
  'at-risk':    { label: '⚠ At Risk',     color: '#e05c6e' },
  'in-progress':{ label: '🔄 In Progress', color: 'var(--gold)' },
  'solved':     { label: '✅ Solved',       color: 'var(--emerald-light)' },
}

const emptyForm = { failure: '', mitigation: '', severity: 'high', status: 'at-risk' }

export default function PreMortemPlanner({ storageKey }) {
  const [risks, setRisks] = useUserData(`${storageKey}_premortem`, [])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)
  const [filter, setFilter] = useState('all')

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const saveRisk = () => {
    if (!form.failure.trim()) return
    if (editId) {
      setRisks(risks.map((r) => r.id === editId ? { ...r, ...form } : r))
      setEditId(null)
    } else {
      setRisks([...risks, { id: Date.now(), ...form }])
    }
    setForm(emptyForm); setShowForm(false)
  }

  const deleteRisk = (id) => setRisks(risks.filter((r) => r.id !== id))
  const startEdit = (r) => { setForm({ ...emptyForm, ...r }); setEditId(r.id); setShowForm(true) }
  const cycleStatus = (id) => {
    const order = ['at-risk', 'in-progress', 'solved']
    setRisks(risks.map((r) => {
      if (r.id !== id) return r
      const next = order[(order.indexOf(r.status) + 1) % order.length]
      return { ...r, status: next }
    }))
  }

  const sorted = [...risks].sort((a, b) => {
    const sev = ['critical','high','medium','low']
    return sev.indexOf(a.severity) - sev.indexOf(b.severity)
  })

  const filtered = filter === 'all' ? sorted : sorted.filter((r) => r.status === filter)

  const critCount    = risks.filter((r) => r.severity === 'critical').length
  const solvedCount  = risks.filter((r) => r.status === 'solved').length
  const atRiskCount  = risks.filter((r) => r.status === 'at-risk').length

  return (
    <section id="premortem" className="section">
      <div className="section-header">
        <p className="section-eyebrow">✦ Phase 5 — Pre-Mortem Analysis</p>
        <h2 className="section-title">Pre-Mortem <em>Planner</em></h2>
        <div className="divider" />
        <p className={styles.subtitle}>
          Imagine you have already failed your exam. What caused it? List every possible reason, then build a solution for each one.
          You have now pre-solved every foreseeable failure.
        </p>
      </div>

      {risks.length > 0 && (
        <div className={styles.statsRow}>
          <div className={styles.statBox}>
            <div className={styles.statNum}>{risks.length}</div>
            <div className={styles.statLabel}>Risks Identified</div>
          </div>
          <div className={styles.statBox}>
            <div className={styles.statNum} style={{ color: SEVERITIES.critical.color }}>{critCount}</div>
            <div className={styles.statLabel}>Critical Risks</div>
          </div>
          <div className={styles.statBox}>
            <div className={styles.statNum} style={{ color: '#e05c6e' }}>{atRiskCount}</div>
            <div className={styles.statLabel}>Still At Risk</div>
          </div>
          <div className={styles.statBox}>
            <div className={styles.statNum} style={{ color: 'var(--emerald-light)' }}>{solvedCount}</div>
            <div className={styles.statLabel}>Pre-Solved</div>
          </div>
        </div>
      )}

      <div className={styles.controls}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['all', 'at-risk', 'in-progress', 'solved'].map((f) => (
            <button key={f} className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ''}`} onClick={() => setFilter(f)}>
              {f === 'all' ? 'All Risks' : STATUSES[f]?.label}
            </button>
          ))}
        </div>
        <button className={styles.addBtn} onClick={() => { setShowForm((v) => !v); setEditId(null); setForm(emptyForm) }}>
          {showForm ? '✕ Cancel' : '+ Add Risk'}
        </button>
      </div>

      {showForm && (
        <div className={styles.form}>
          <div className={styles.formGrid}>
            <div className="field-group" style={{ gridColumn: '1 / -1' }}>
              <label>Failure Scenario — "I failed because..."</label>
              <input type="text" placeholder="e.g. I ran out of time in Section B and couldn't attempt Q4" value={form.failure} onChange={set('failure')} autoFocus />
            </div>
            <div className="field-group" style={{ gridColumn: '1 / -1' }}>
              <label>Mitigation / Pre-Solution</label>
              <textarea rows={2} placeholder="e.g. Practice timed past papers weekly. Strict 25-min max per question. Skip and return." value={form.mitigation} onChange={set('mitigation')} style={{ resize: 'vertical' }} />
            </div>
            <div className="field-group">
              <label>Severity</label>
              <select value={form.severity} onChange={set('severity')}>
                <option value="critical">Critical — would cause definite failure</option>
                <option value="high">High — would significantly hurt grade</option>
                <option value="medium">Medium — meaningful but manageable</option>
                <option value="low">Low — minor impact</option>
              </select>
            </div>
            <div className="field-group">
              <label>Current Status</label>
              <select value={form.status} onChange={set('status')}>
                <option value="at-risk">At Risk — not yet addressed</option>
                <option value="in-progress">In Progress — working on it</option>
                <option value="solved">Solved — mitigation in place</option>
              </select>
            </div>
          </div>
          <div className={styles.formActions}>
            <button className="btn-primary" onClick={saveRisk}>{editId ? 'Update Risk →' : 'Add Risk →'}</button>
            <button className={styles.cancelBtn} onClick={() => { setShowForm(false); setEditId(null) }}>Cancel</button>
          </div>
        </div>
      )}

      {risks.length === 0 ? (
        <div className={styles.empty}>
          <span style={{ fontSize: 40 }}>🔮</span>
          <p>No risks identified yet.</p>
          <p style={{ fontSize: 13, maxWidth: 480 }}>
            Close your eyes. Imagine exam day. You open the results — you failed. <br />
            Now work backwards: what happened? Add every scenario here and build a solution for each.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}><p>No risks in this category.</p></div>
      ) : (
        <div className={styles.list}>
          {filtered.map((r) => {
            const sev = SEVERITIES[r.severity]
            const st = STATUSES[r.status]
            return (
              <div key={r.id} className={styles.row} style={{ borderLeftColor: sev.color }}>
                <div className={styles.rowTop}>
                  <div className={styles.rowLeft}>
                    <span className={styles.sevBadge} style={{ background: sev.bg, color: sev.color, borderColor: sev.border }}>
                      {sev.label}
                    </span>
                    <span className={styles.failure}>{r.failure}</span>
                  </div>
                  <div className={styles.rowRight}>
                    <button className={styles.statusBtn} style={{ color: st.color }} onClick={() => cycleStatus(r.id)} title="Click to cycle status">
                      {st.label}
                    </button>
                    <button className={styles.editBtn} onClick={() => startEdit(r)}>Edit</button>
                    <button className={styles.deleteBtn} onClick={() => deleteRisk(r.id)}>✕</button>
                  </div>
                </div>
                {r.mitigation && (
                  <div className={styles.mitigation}>
                    <span className={styles.mitigationLabel}>Solution: </span>{r.mitigation}
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
