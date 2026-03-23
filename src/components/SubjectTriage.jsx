import { useState } from 'react'
import { useUserData } from '../hooks/useUserData'
import styles from './SubjectTriage.module.css'

const BUCKETS = [
  {
    id: 'a',
    title: 'High Yield × Low Mastery',
    subtitle: 'You\'re weak here AND it\'s tested constantly',
    action: '🔴 Maximum Time',
    hint: 'This is your priority war zone. Spend the most hours here.',
    timeAlloc: 60,
    cardClass: 'bucketRed',
  },
  {
    id: 'b',
    title: 'High Yield × High Mastery',
    subtitle: 'Strong here AND tested frequently',
    action: '🟡 Maintenance Only',
    hint: 'Don\'t neglect it — but light review sessions are enough to stay sharp.',
    timeAlloc: 30,
    cardClass: 'bucketAmber',
  },
  {
    id: 'c',
    title: 'Low Yield × Any Mastery',
    subtitle: 'Rarely or never tested',
    action: '⬛ Skip / Minimal',
    hint: 'Brutal but necessary. Zero or near-zero time. Do not let this eat your schedule.',
    timeAlloc: 10,
    cardClass: 'bucketGrey',
  },
]

const emptyForm = { topic: '', notes: '' }

export default function SubjectTriage({ storageKey }) {
  const [triage, setTriage] = useUserData(`${storageKey}_triage`, { a: [], b: [], c: [] })
  const [activeBucket, setActiveBucket] = useState(null)
  const [form, setForm] = useState(emptyForm)

  const addTopic = () => {
    if (!form.topic.trim() || !activeBucket) return
    setTriage((prev) => ({
      ...prev,
      [activeBucket]: [...(prev[activeBucket] || []), { id: Date.now(), topic: form.topic.trim(), notes: form.notes.trim() }],
    }))
    setForm(emptyForm)
  }

  const removeTopic = (bucketId, topicId) => {
    setTriage((prev) => ({ ...prev, [bucketId]: prev[bucketId].filter((t) => t.id !== topicId) }))
  }

  const moveTopic = (fromBucket, topicId, toBucket) => {
    const topic = (triage[fromBucket] || []).find((t) => t.id === topicId)
    if (!topic) return
    setTriage((prev) => ({
      ...prev,
      [fromBucket]: prev[fromBucket].filter((t) => t.id !== topicId),
      [toBucket]: [...(prev[toBucket] || []), topic],
    }))
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const totalTopics = BUCKETS.reduce((s, b) => s + (triage[b.id] || []).length, 0)

  return (
    <section id="triage" className="section">
      <div className="section-header">
        <p className="section-eyebrow">✦ Phase 1 — Strategic Architecture</p>
        <h2 className="section-title">Subject <em>Triage</em></h2>
        <div className="divider" />
        <p className={styles.subtitle}>
          Ruthlessly sort every topic into three buckets. Most students study everything equally — you will not. Maximise marks per hour.
        </p>
      </div>

      {totalTopics > 0 && (
        <div className={styles.allocBar}>
          <span className={styles.allocLabel}>Recommended time split:</span>
          {BUCKETS.map((b) => (
            <div key={b.id} className={`${styles.allocPill} ${styles[b.cardClass]}`}>
              {b.timeAlloc}% → Bucket {b.id.toUpperCase()}
            </div>
          ))}
        </div>
      )}

      <div className={styles.grid}>
        {BUCKETS.map((bucket) => {
          const items = triage[bucket.id] || []
          const isActive = activeBucket === bucket.id
          const otherBuckets = BUCKETS.filter((b) => b.id !== bucket.id)
          return (
            <div key={bucket.id} className={`${styles.bucket} ${styles[bucket.cardClass]} ${isActive ? styles.bucketActive : ''}`}>
              <div className={styles.bucketHeader}>
                <div className={styles.bucketAction}>{bucket.action}</div>
                <div className={styles.bucketTitle}>{bucket.title}</div>
                <div className={styles.bucketSubtitle}>{bucket.subtitle}</div>
                <div className={styles.bucketHint}>{bucket.hint}</div>
                <div className={styles.bucketCount}>{items.length} topic{items.length !== 1 ? 's' : ''}</div>
              </div>

              <div className={styles.topicList}>
                {items.length === 0 ? (
                  <div className={styles.empty}>Drop topics here</div>
                ) : (
                  items.map((t) => (
                    <div key={t.id} className={styles.topicItem}>
                      <div className={styles.topicContent}>
                        <div className={styles.topicName}>{t.topic}</div>
                        {t.notes && <div className={styles.topicNotes}>{t.notes}</div>}
                      </div>
                      <div className={styles.topicActions}>
                        <div className={styles.moveMenu}>
                          <span className={styles.moveLabel}>Move →</span>
                          {otherBuckets.map((ob) => (
                            <button key={ob.id} className={styles.moveBtn} onClick={() => moveTopic(bucket.id, t.id, ob.id)}>
                              {ob.id.toUpperCase()}
                            </button>
                          ))}
                        </div>
                        <button className={styles.removeBtn} onClick={() => removeTopic(bucket.id, t.id)}>✕</button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className={styles.addRow}>
                {isActive ? (
                  <div className={styles.inlineForm}>
                    <input
                      type="text"
                      className={styles.inlineInput}
                      placeholder="Topic name..."
                      value={form.topic}
                      onChange={set('topic')}
                      autoFocus
                      onKeyDown={(e) => e.key === 'Enter' && addTopic()}
                    />
                    <input
                      type="text"
                      className={styles.inlineInput}
                      placeholder="Notes (optional)"
                      value={form.notes}
                      onChange={set('notes')}
                      onKeyDown={(e) => e.key === 'Enter' && addTopic()}
                    />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className={styles.saveBtn} onClick={addTopic}>Add</button>
                      <button className={styles.cancelBtn} onClick={() => { setActiveBucket(null); setForm(emptyForm) }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button className={styles.addTopicBtn} onClick={() => { setActiveBucket(bucket.id); setForm(emptyForm) }}>
                    + Add Topic
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
