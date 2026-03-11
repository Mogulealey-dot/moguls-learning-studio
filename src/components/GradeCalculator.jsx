import { useState } from 'react'
import { useUserData } from '../hooks/useUserData'
import styles from './GradeCalculator.module.css'

const DEFAULT_COMPONENTS = [
  { name: 'Assignments', weight: 30, score: '' },
  { name: 'Midterm Exam', weight: 30, score: '' },
  { name: 'Final Exam',   weight: 40, score: '' },
]

function letterGrade(pct) {
  if (pct >= 90) return { letter: 'A+', gpa: 4.0, color: '#2a9b6e' }
  if (pct >= 85) return { letter: 'A',  gpa: 4.0, color: '#2a9b6e' }
  if (pct >= 80) return { letter: 'A-', gpa: 3.7, color: '#2a9b6e' }
  if (pct >= 77) return { letter: 'B+', gpa: 3.3, color: 'var(--gold)' }
  if (pct >= 73) return { letter: 'B',  gpa: 3.0, color: 'var(--gold)' }
  if (pct >= 70) return { letter: 'B-', gpa: 2.7, color: 'var(--gold)' }
  if (pct >= 67) return { letter: 'C+', gpa: 2.3, color: '#e8a84c' }
  if (pct >= 63) return { letter: 'C',  gpa: 2.0, color: '#e8a84c' }
  if (pct >= 60) return { letter: 'C-', gpa: 1.7, color: '#e8a84c' }
  if (pct >= 50) return { letter: 'D',  gpa: 1.0, color: 'var(--crimson)' }
  return { letter: 'F', gpa: 0.0, color: 'var(--crimson)' }
}

function SubjectGrader({ subject, components, onChange, onRemove }) {
  const update = (i, key, val) => {
    const updated = components.map((c, ci) => ci === i ? { ...c, [key]: val } : c)
    onChange(updated)
  }
  const addRow  = () => onChange([...components, { name: '', weight: 0, score: '' }])
  const remRow  = (i) => onChange(components.filter((_, ci) => ci !== i))

  const totalWeight = components.reduce((a, c) => a + Number(c.weight || 0), 0)
  const weighted    = components.reduce((a, c) => {
    const s = Number(c.score)
    const w = Number(c.weight)
    return a + (isNaN(s) || c.score === '' ? 0 : s * w / 100)
  }, 0)
  const finalPct = totalWeight > 0 ? (weighted / totalWeight) * 100 : 0
  const hasScores = components.some((c) => c.score !== '')
  const grade = letterGrade(finalPct)

  return (
    <div className={styles.subjectCard}>
      <div className={styles.subjectHeader}>
        <h3 className={styles.subjectName}>{subject}</h3>
        <button className={styles.removeSubject} onClick={onRemove}>✕ Remove</button>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Component</th>
            <th>Weight (%)</th>
            <th>Score (%)</th>
            <th>Weighted</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {components.map((c, i) => {
            const w = (Number(c.score) * Number(c.weight)) / 100
            return (
              <tr key={i}>
                <td><input className={styles.cellInput} value={c.name} onChange={(e) => update(i, 'name', e.target.value)} placeholder="Component name" /></td>
                <td><input className={styles.cellInput} type="number" min="0" max="100" value={c.weight} onChange={(e) => update(i, 'weight', e.target.value)} /></td>
                <td><input className={styles.cellInput} type="number" min="0" max="100" value={c.score} onChange={(e) => update(i, 'score', e.target.value)} placeholder="—" /></td>
                <td className={styles.weighted}>{c.score !== '' ? w.toFixed(1) : '—'}</td>
                <td><button className={styles.removeRow} onClick={() => remRow(i)}>✕</button></td>
              </tr>
            )
          })}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={2}>
              <span className={totalWeight !== 100 ? styles.weightWarn : styles.weightOk}>
                Total weight: {totalWeight}% {totalWeight !== 100 ? '⚠ Should be 100%' : '✓'}
              </span>
            </td>
            <td className={styles.finalLabel}>Final Score:</td>
            <td className={styles.finalScore} style={{ color: grade.color }}>
              {hasScores ? `${finalPct.toFixed(1)}%` : '—'}
            </td>
            <td></td>
          </tr>
        </tfoot>
      </table>

      <button className={styles.addRowBtn} onClick={addRow}>+ Add Component</button>

      {hasScores && (
        <div className={styles.gradeResult}>
          <div className={styles.gradeLetter} style={{ color: grade.color }}>{grade.letter}</div>
          <div className={styles.gradeInfo}>
            <div style={{ fontSize: 14, color: 'var(--cream)' }}>GPA Points: <strong style={{ color: grade.color }}>{grade.gpa.toFixed(1)}</strong></div>
            <div style={{ fontSize: 13, color: 'var(--mist)', marginTop: 4 }}>
              {finalPct >= 70 ? '✓ Passing' : '✗ Below passing grade'}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function GradeCalculator({ defaultSubjects, storageKey }) {
  const key = storageKey || 'mls_grades'
  const [gradeData, setGradeData] = useUserData(key, { subjects: [], componentData: {} })
  const [newSubject, setNewSubject] = useState('')

  // subjects list — use saved or fall back to defaultSubjects
  const subjects = gradeData.subjects && gradeData.subjects.length > 0
    ? gradeData.subjects
    : (defaultSubjects || ['Subject 1', 'Subject 2'])

  const componentData = gradeData.componentData || {}

  const getComponents = (subject) =>
    componentData[subject] || DEFAULT_COMPONENTS.map((c) => ({ ...c }))

  const updateComponents = (subject, updated) => {
    setGradeData({
      subjects,
      componentData: { ...componentData, [subject]: updated },
    })
  }

  const addSubject = () => {
    const s = newSubject.trim() || `Subject ${subjects.length + 1}`
    setGradeData({ subjects: [...subjects, s], componentData })
    setNewSubject('')
  }

  const removeSubject = (idx) => {
    const updated = subjects.filter((_, i) => i !== idx)
    const updatedData = { ...componentData }
    delete updatedData[subjects[idx]]
    setGradeData({ subjects: updated, componentData: updatedData })
  }

  return (
    <section id="grades" className="section" style={{ background: 'rgba(201,168,76,0.02)', borderTop: '1px solid rgba(201,168,76,0.08)' }}>
      <div className="section-header">
        <p className="section-eyebrow">✦ Know Your Standing</p>
        <h2 className="section-title">Grade <em>Calculator</em></h2>
        <div className="divider" />
        <p style={{ marginTop: 16, fontSize: 14, color: 'var(--mist)' }}>
          Enter your assessment weights and scores. Grades are saved automatically.
        </p>
      </div>

      <div className={styles.addSubjectRow}>
        <input
          className={styles.subjectInput}
          placeholder="Add a subject (e.g. Corporate Finance)…"
          value={newSubject}
          onChange={(e) => setNewSubject(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addSubject()}
        />
        <button className={styles.addSubjectBtn} onClick={addSubject}>+ Add Subject</button>
      </div>

      <div className={styles.subjectList}>
        {subjects.map((s, i) => (
          <SubjectGrader
            key={s}
            subject={s}
            components={getComponents(s)}
            onChange={(updated) => updateComponents(s, updated)}
            onRemove={() => removeSubject(i)}
          />
        ))}
      </div>
    </section>
  )
}
