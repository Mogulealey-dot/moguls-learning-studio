import { useState } from 'react'
import { useUserData } from '../hooks/useUserData'
import styles from './SyllabusTracker.module.css'

export default function SyllabusTracker({ storageKey }) {
  const key = `${storageKey}_syllabus`
  const [data, setData] = useUserData(key, [])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ subject: '', bulkTopics: '' })
  const [open, setOpen] = useState({}) // accordion open state
  const [filter, setFilter] = useState('all')
  const [addTopicInputs, setAddTopicInputs] = useState({}) // subject id -> input val

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const addSubject = () => {
    if (!form.subject.trim()) return
    const topicLines = form.bulkTopics.trim().split('\n').filter((l) => l.trim())
    const topics = topicLines.map((line, i) => ({
      id: Date.now() + i,
      title: line.trim(),
      covered: false,
      week: '',
      notes: '',
    }))
    const newSubject = {
      id: Date.now(),
      subject: form.subject.trim(),
      totalTopics: topics.length,
      topics,
    }
    setData([...data, newSubject])
    setForm({ subject: '', bulkTopics: '' }); setShowForm(false)
  }

  const deleteSubject = (id) => setData(data.filter((s) => s.id !== id))

  const toggleTopic = (subjectId, topicId) => {
    setData(data.map((s) => s.id !== subjectId ? s : {
      ...s,
      topics: s.topics.map((t) => t.id === topicId ? { ...t, covered: !t.covered } : t),
    }))
  }

  const deleteTopic = (subjectId, topicId) => {
    setData(data.map((s) => s.id !== subjectId ? s : {
      ...s,
      topics: s.topics.filter((t) => t.id !== topicId),
      totalTopics: s.topics.length - 1,
    }))
  }

  const addTopic = (subjectId) => {
    const val = (addTopicInputs[subjectId] || '').trim()
    if (!val) return
    setData(data.map((s) => s.id !== subjectId ? s : {
      ...s,
      topics: [...s.topics, { id: Date.now(), title: val, covered: false, week: '', notes: '' }],
      totalTopics: s.topics.length + 1,
    }))
    setAddTopicInputs((prev) => ({ ...prev, [subjectId]: '' }))
  }

  const totalTopics = data.reduce((a, s) => a + s.topics.length, 0)
  const coveredTopics = data.reduce((a, s) => a + s.topics.filter((t) => t.covered).length, 0)
  const overallPct = totalTopics > 0 ? Math.round((coveredTopics / totalTopics) * 100) : 0

  const filteredSubjects = data.map((s) => ({
    ...s,
    topics: s.topics.filter((t) => {
      if (filter === 'covered') return t.covered
      if (filter === 'remaining') return !t.covered
      return true
    }),
  }))

  return (
    <section id="syllabus" className="section">
      <div className="section-header">
        <p className="section-eyebrow">✦ Track Your Curriculum</p>
        <h2 className="section-title">Syllabus <em>Tracker</em></h2>
        <div className="divider" />
      </div>

      {totalTopics > 0 && (
        <div className={styles.overallBar}>
          <span className={styles.overallLabel}>Overall Progress</span>
          <div className={styles.overallProgress}>
            <div className={styles.overallFill} style={{ width: `${overallPct}%` }} />
          </div>
          <span className={styles.overallPct}>{overallPct}%</span>
        </div>
      )}

      <div className={styles.controls}>
        <div className={styles.filters}>
          {['all', 'covered', 'remaining'].map((f) => (
            <button key={f} className={`${styles.filterBtn} ${filter === f ? styles.activeFilter : ''}`} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <button className={styles.addBtn} onClick={() => setShowForm((v) => !v)}>
          {showForm ? '✕ Cancel' : '+ Add Subject'}
        </button>
      </div>

      {showForm && (
        <div className={styles.form}>
          <div className={styles.formGrid}>
            <div className="field-group" style={{ gridColumn: '1/-1' }}>
              <label>Subject Name</label>
              <input type="text" placeholder="e.g. Calculus, Biology, History" value={form.subject} onChange={set('subject')} />
            </div>
            <div className="field-group" style={{ gridColumn: '1/-1' }}>
              <label>Topics (one per line, optional)</label>
              <textarea rows={6} placeholder={'Introduction to Derivatives\nChain Rule\nIntegration by Parts\n...'} value={form.bulkTopics} onChange={set('bulkTopics')} style={{ width: '100%', resize: 'vertical' }} />
            </div>
          </div>
          <div className={styles.formActions}>
            <button className="btn-primary" onClick={addSubject}>Add Subject →</button>
            <button className={styles.cancelBtn} onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {data.length === 0 ? (
        <div className={styles.empty}>
          <span style={{ fontSize: 40 }}>📋</span>
          <p>No subjects added yet. Add your first subject above!</p>
        </div>
      ) : (
        <div className={styles.subjects}>
          {filteredSubjects.map((subject) => {
            const covered = subject.topics.filter((t) => t.covered).length
            const total = subject.topics.length
            const pct = total > 0 ? Math.round((covered / total) * 100) : 0
            const isOpen = !!open[subject.id]
            return (
              <div key={subject.id} className={styles.accordion}>
                <div className={styles.accordionHeader} onClick={() => setOpen((o) => ({ ...o, [subject.id]: !o[subject.id] }))}>
                  <span className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}>▶</span>
                  <span className={styles.subjectName}>{subject.subject}</span>
                  <div className={styles.subjectProgress}>
                    <div className={styles.subjectBar}>
                      <div className={styles.subjectFill} style={{ width: `${pct}%` }} />
                    </div>
                    <span className={styles.subjectPct}>{pct}%</span>
                    <span style={{ fontSize: 12, color: 'var(--mist)' }}>({covered}/{total})</span>
                  </div>
                  <button className={styles.deleteSubjectBtn} onClick={(e) => { e.stopPropagation(); deleteSubject(subject.id) }}>✕</button>
                </div>

                {isOpen && (
                  <div className={styles.topicList}>
                    {subject.topics.length === 0 && (
                      <p style={{ fontSize: 13, color: 'var(--mist)', padding: '8px 0' }}>No topics. Add one below.</p>
                    )}
                    {subject.topics.map((topic) => (
                      <div key={topic.id} className={styles.topicItem}>
                        <button
                          className={`${styles.topicCheck} ${topic.covered ? styles.topicChecked : ''}`}
                          onClick={() => toggleTopic(subject.id, topic.id)}
                        >
                          {topic.covered ? '✓' : ''}
                        </button>
                        <div className={styles.topicBody}>
                          <div className={`${styles.topicTitle} ${topic.covered ? styles.topicTitleDone : ''}`}>{topic.title}</div>
                          {topic.week && <div className={styles.topicMeta}>Week {topic.week}</div>}
                        </div>
                        <button className={styles.topicDeleteBtn} onClick={() => deleteTopic(subject.id, topic.id)}>✕</button>
                      </div>
                    ))}
                    <div className={styles.addTopicRow}>
                      <input
                        type="text"
                        className={styles.addTopicInput}
                        placeholder="Add a topic..."
                        value={addTopicInputs[subject.id] || ''}
                        onChange={(e) => setAddTopicInputs((prev) => ({ ...prev, [subject.id]: e.target.value }))}
                        onKeyDown={(e) => e.key === 'Enter' && addTopic(subject.id)}
                      />
                      <button className={styles.addTopicBtn} onClick={() => addTopic(subject.id)}>+ Add</button>
                    </div>
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
