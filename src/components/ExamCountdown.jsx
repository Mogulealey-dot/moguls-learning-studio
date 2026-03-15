import { useState, useEffect } from 'react'
import { useUserData } from '../hooks/useUserData'
import styles from './ExamCountdown.module.css'

function getCountdown(dateStr, timeStr) {
  const target = new Date(`${dateStr}T${timeStr || '09:00'}`)
  const now = new Date()
  const diff = target - now
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, past: true }
  const totalSecs = Math.floor(diff / 1000)
  const days = Math.floor(totalSecs / 86400)
  const hours = Math.floor((totalSecs % 86400) / 3600)
  const minutes = Math.floor((totalSecs % 3600) / 60)
  return { days, hours, minutes, past: false }
}

function colorClass(days, past) {
  if (past) return { card: styles.cardGrey, text: styles.colorGrey }
  if (days < 3) return { card: styles.cardRed, text: styles.colorRed }
  if (days < 7) return { card: styles.cardAmber, text: styles.colorAmber }
  return { card: styles.cardGreen, text: styles.colorGreen }
}

const emptyForm = { subject: '', examName: '', date: '', time: '09:00', location: '', notes: '' }

export default function ExamCountdown({ storageKey }) {
  const key = `${storageKey}_exams`
  const [exams, setExams] = useUserData(key, [])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 60000)
    return () => clearInterval(t)
  }, [])

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const saveExam = () => {
    if (!form.subject.trim() || !form.date) return
    if (editId) {
      setExams(exams.map((e) => e.id === editId ? { ...e, ...form } : e))
      setEditId(null)
    } else {
      setExams([...exams, { id: Date.now(), ...form }])
    }
    setForm(emptyForm); setShowForm(false)
  }

  const deleteExam = (id) => setExams(exams.filter((e) => e.id !== id))
  const startEdit = (exam) => { setForm({ ...emptyForm, ...exam }); setEditId(exam.id); setShowForm(true) }

  const sorted = [...exams].sort((a, b) => new Date(a.date) - new Date(b.date))
  const upcoming = sorted.filter((e) => !getCountdown(e.date, e.time).past)
  const past = sorted.filter((e) => getCountdown(e.date, e.time).past)

  return (
    <section id="exams" className="section">
      <div className="section-header">
        <p className="section-eyebrow">✦ Never Miss a Date</p>
        <h2 className="section-title">Exam <em>Countdown</em></h2>
        <div className="divider" />
      </div>

      <div className={styles.controls}>
        <span style={{ fontSize: 14, color: 'var(--mist)' }}>{upcoming.length} upcoming exam{upcoming.length !== 1 ? 's' : ''}</span>
        <button className={styles.addBtn} onClick={() => { setShowForm((v) => !v); setEditId(null); setForm(emptyForm) }}>
          {showForm ? '✕ Cancel' : '+ Add Exam'}
        </button>
      </div>

      {showForm && (
        <div className={styles.form}>
          <div className={styles.formGrid}>
            <div className="field-group">
              <label>Subject</label>
              <input type="text" placeholder="e.g. Mathematics" value={form.subject} onChange={set('subject')} />
            </div>
            <div className="field-group">
              <label>Exam Name</label>
              <input type="text" placeholder="e.g. Final Exam" value={form.examName} onChange={set('examName')} />
            </div>
            <div className="field-group">
              <label>Date</label>
              <input type="date" value={form.date} onChange={set('date')} />
            </div>
            <div className="field-group">
              <label>Time</label>
              <input type="time" value={form.time} onChange={set('time')} />
            </div>
            <div className="field-group">
              <label>Location (optional)</label>
              <input type="text" placeholder="e.g. Hall A, Room 204" value={form.location} onChange={set('location')} />
            </div>
            <div className="field-group">
              <label>Notes (optional)</label>
              <input type="text" placeholder="Any special notes..." value={form.notes} onChange={set('notes')} />
            </div>
          </div>
          <div className={styles.formActions}>
            <button className="btn-primary" onClick={saveExam}>{editId ? 'Update Exam →' : 'Add Exam →'}</button>
            <button className={styles.cancelBtn} onClick={() => { setShowForm(false); setEditId(null) }}>Cancel</button>
          </div>
        </div>
      )}

      {upcoming.length === 0 && past.length === 0 ? (
        <div className={styles.empty}>
          <span style={{ fontSize: 40 }}>📅</span>
          <p>No exams added yet. Add your first exam above!</p>
        </div>
      ) : (
        <>
          <div className={styles.grid}>
            {upcoming.map((exam) => {
              const { days, hours, minutes } = getCountdown(exam.date, exam.time)
              const { card, text } = colorClass(days, false)
              return (
                <div key={exam.id} className={`${styles.card} ${card}`}>
                  <div className={styles.cardSubject}>{exam.subject}</div>
                  <div className={styles.cardName}>{exam.examName || 'Exam'}</div>
                  <div className={styles.countdown}>
                    <div className={styles.unit}>
                      <div className={`${styles.unitNum} ${text}`}>{days}</div>
                      <div className={styles.unitLabel}>days</div>
                    </div>
                    <div className={styles.unit}>
                      <div className={`${styles.unitNum} ${text}`}>{hours}</div>
                      <div className={styles.unitLabel}>hrs</div>
                    </div>
                    <div className={styles.unit}>
                      <div className={`${styles.unitNum} ${text}`}>{minutes}</div>
                      <div className={styles.unitLabel}>min</div>
                    </div>
                  </div>
                  <div className={styles.cardMeta}>
                    {new Date(`${exam.date}T${exam.time || '09:00'}`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                    {exam.location && <div>{exam.location}</div>}
                    {exam.notes && <div style={{ fontStyle: 'italic' }}>{exam.notes}</div>}
                  </div>
                  <div className={styles.cardActions}>
                    <button className={styles.editBtn} onClick={() => startEdit(exam)}>Edit</button>
                    <button className={styles.deleteBtn} onClick={() => deleteExam(exam.id)}>✕</button>
                  </div>
                </div>
              )
            })}
          </div>

          {past.length > 0 && (
            <div className={styles.pastSection}>
              <div className={styles.pastTitle}>Past Exams</div>
              <div className={styles.grid}>
                {past.map((exam) => {
                  const { card } = colorClass(0, true)
                  return (
                    <div key={exam.id} className={`${styles.card} ${card}`}>
                      <div className={styles.cardSubject}>{exam.subject}</div>
                      <div className={styles.cardName}>{exam.examName || 'Exam'}</div>
                      <div className={styles.cardMeta}>
                        {new Date(`${exam.date}T${exam.time || '09:00'}`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                        {exam.location && <div>{exam.location}</div>}
                      </div>
                      <div className={styles.cardActions}>
                        <button className={styles.deleteBtn} onClick={() => deleteExam(exam.id)}>✕</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  )
}
