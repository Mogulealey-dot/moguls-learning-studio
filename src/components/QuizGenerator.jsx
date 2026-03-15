import { useState } from 'react'
import { useUserData } from '../hooks/useUserData'
import styles from './QuizGenerator.module.css'

const emptyQuestion = () => ({ q: '', options: ['', '', '', ''], correct: 0, explanation: '' })

export default function QuizGenerator({ storageKey }) {
  const key = `${storageKey}_quizzes`
  const [quizzes, setQuizzes] = useUserData(key, [])
  const [showForm, setShowForm] = useState(false)
  const [formTitle, setFormTitle] = useState('')
  const [formSubject, setFormSubject] = useState('')
  const [questions, setQuestions] = useState([emptyQuestion()])

  // Taking state
  const [activeQuiz, setActiveQuiz] = useState(null)
  const [qIdx, setQIdx] = useState(0)
  const [selected, setSelected] = useState(null)
  const [answers, setAnswers] = useState([])
  const [showResult, setShowResult] = useState(false)

  // Form helpers
  const updateQ = (i, field, val) => {
    setQuestions((qs) => qs.map((q, qi) => qi === i ? { ...q, [field]: val } : q))
  }
  const updateOption = (qi, oi, val) => {
    setQuestions((qs) => qs.map((q, i) => i === qi ? { ...q, options: q.options.map((o, j) => j === oi ? val : o) } : q))
  }
  const addQuestion = () => setQuestions((qs) => [...qs, emptyQuestion()])
  const removeQuestion = (i) => setQuestions((qs) => qs.filter((_, qi) => qi !== i))

  const saveQuiz = () => {
    if (!formTitle.trim() || questions.length === 0) return
    const valid = questions.filter((q) => q.q.trim() && q.options.every((o) => o.trim()))
    if (valid.length === 0) return
    const quiz = {
      id: Date.now(),
      title: formTitle.trim(),
      subject: formSubject.trim(),
      questions: valid,
      createdAt: new Date().toISOString(),
      scores: [],
    }
    setQuizzes([...quizzes, quiz])
    setFormTitle(''); setFormSubject(''); setQuestions([emptyQuestion()]); setShowForm(false)
  }

  const deleteQuiz = (id) => setQuizzes(quizzes.filter((q) => q.id !== id))

  const startQuiz = (quiz) => {
    setActiveQuiz(quiz); setQIdx(0); setSelected(null); setAnswers([]); setShowResult(false)
  }

  const pickOption = (idx) => {
    if (selected !== null) return
    setSelected(idx)
  }

  const nextQuestion = () => {
    const newAnswers = [...answers, selected]
    setAnswers(newAnswers)
    if (qIdx + 1 >= activeQuiz.questions.length) {
      const score = newAnswers.filter((a, i) => a === activeQuiz.questions[i].correct).length
      setQuizzes(quizzes.map((q) => q.id === activeQuiz.id
        ? { ...q, scores: [...(q.scores || []), { score, total: activeQuiz.questions.length, date: new Date().toLocaleDateString() }] }
        : q
      ))
      setShowResult(true)
    } else {
      setQIdx((i) => i + 1); setSelected(null)
    }
  }

  const exitQuiz = () => { setActiveQuiz(null); setShowResult(false) }

  if (activeQuiz && !showResult) {
    const q = activeQuiz.questions[qIdx]
    return (
      <section id="quiz" className="section">
        <div className="section-header">
          <p className="section-eyebrow">✦ Test Your Knowledge</p>
          <h2 className="section-title">Quiz <em>Generator</em></h2>
          <div className="divider" />
        </div>
        <div className={styles.takeMode}>
          <div className={styles.qProgress}>
            <span>{activeQuiz.title}</span>
            <span>Q{qIdx + 1} / {activeQuiz.questions.length}</span>
            <button className={styles.backBtn} onClick={exitQuiz}>Exit</button>
          </div>
          <div className={styles.qCard}>
            <div className={styles.qText}>{q.q}</div>
            {q.options.map((opt, i) => {
              let cls = styles.optionBtn
              if (selected !== null) {
                if (i === q.correct) cls += ' ' + styles.optionCorrect
                else if (i === selected && i !== q.correct) cls += ' ' + styles.optionWrong
              }
              return (
                <button key={i} className={cls} onClick={() => pickOption(i)} disabled={selected !== null}>
                  <strong>{String.fromCharCode(65 + i)}.</strong> {opt}
                </button>
              )
            })}
            {selected !== null && q.explanation && (
              <div className={styles.explanation}>💡 {q.explanation}</div>
            )}
          </div>
          {selected !== null && (
            <button className={styles.nextBtn} onClick={nextQuestion}>
              {qIdx + 1 < activeQuiz.questions.length ? 'Next →' : 'Finish Quiz'}
            </button>
          )}
        </div>
      </section>
    )
  }

  if (activeQuiz && showResult) {
    const correct = answers.filter((a, i) => a === activeQuiz.questions[i].correct).length
    const pct = Math.round((correct / activeQuiz.questions.length) * 100)
    return (
      <section id="quiz" className="section">
        <div className="section-header">
          <p className="section-eyebrow">✦ Test Your Knowledge</p>
          <h2 className="section-title">Quiz <em>Results</em></h2>
          <div className="divider" />
        </div>
        <div className={styles.takeMode}>
          <div className={styles.results}>
            <div className={styles.scoreBig}>{pct}%</div>
            <div className={styles.scoreLabel}>{correct} / {activeQuiz.questions.length} correct — {activeQuiz.title}</div>
            <div className={styles.breakdown}>
              {activeQuiz.questions.map((q, i) => (
                <div key={i} className={styles.breakItem}>
                  <span className={answers[i] === q.correct ? styles.tick : styles.cross}>
                    {answers[i] === q.correct ? '✓' : '✗'}
                  </span>
                  <div>
                    <div>{q.q}</div>
                    {answers[i] !== q.correct && <div style={{ fontSize: 12, color: 'var(--mist)', marginTop: 4 }}>Correct: {q.options[q.correct]}</div>}
                  </div>
                </div>
              ))}
            </div>
            <button className={styles.backBtn} onClick={exitQuiz}>Back to Quizzes</button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="quiz" className="section">
      <div className="section-header">
        <p className="section-eyebrow">✦ Test Your Knowledge</p>
        <h2 className="section-title">Quiz <em>Generator</em></h2>
        <div className="divider" />
      </div>

      <div className={styles.controls}>
        <span style={{ fontSize: 14, color: 'var(--mist)' }}>{quizzes.length} quiz{quizzes.length !== 1 ? 'zes' : ''} saved</span>
        <button className={styles.addBtn} onClick={() => setShowForm((v) => !v)}>
          {showForm ? '✕ Cancel' : '+ Create Quiz'}
        </button>
      </div>

      {showForm && (
        <div className={styles.form}>
          <div className={styles.formGrid}>
            <div className="field-group">
              <label>Quiz Title</label>
              <input type="text" placeholder="e.g. Chapter 5 Review" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} />
            </div>
            <div className="field-group">
              <label>Subject</label>
              <input type="text" placeholder="e.g. Biology" value={formSubject} onChange={(e) => setFormSubject(e.target.value)} />
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <p style={{ fontSize: 13, color: 'var(--mist)', marginBottom: 12 }}>Questions — mark the correct answer with the radio button:</p>
            {questions.map((q, qi) => (
              <div key={qi} className={styles.questionBlock}>
                <div className={styles.qLabel}>Question {qi + 1}</div>
                <button className={styles.removeQBtn} onClick={() => removeQuestion(qi)}>✕</button>
                <div className="field-group" style={{ marginBottom: 12 }}>
                  <textarea rows={2} placeholder="Enter the question..." value={q.q} onChange={(e) => updateQ(qi, 'q', e.target.value)} style={{ width: '100%', resize: 'vertical' }} />
                </div>
                {q.options.map((opt, oi) => (
                  <div key={oi} className={styles.optionRow}>
                    <input
                      type="radio"
                      className={styles.correctRadio}
                      name={`correct-${qi}`}
                      checked={q.correct === oi}
                      onChange={() => updateQ(qi, 'correct', oi)}
                      title="Mark as correct"
                    />
                    <input
                      type="text"
                      className={styles.optionInput}
                      placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                      value={opt}
                      onChange={(e) => updateOption(qi, oi, e.target.value)}
                    />
                  </div>
                ))}
                <div className="field-group" style={{ marginTop: 8 }}>
                  <input type="text" placeholder="Explanation (optional)..." value={q.explanation} onChange={(e) => updateQ(qi, 'explanation', e.target.value)} />
                </div>
              </div>
            ))}
            <button className={styles.addQBtn} onClick={addQuestion}>+ Add Question</button>
          </div>

          <div className={styles.formActions}>
            <button className="btn-primary" onClick={saveQuiz}>Save Quiz →</button>
            <button className={styles.cancelBtn} onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {quizzes.length === 0 ? (
        <div className={styles.empty}>
          <span style={{ fontSize: 40 }}>📝</span>
          <p>No quizzes yet. Create your first quiz above!</p>
        </div>
      ) : (
        <div className={styles.quizList}>
          {quizzes.map((quiz) => {
            const best = quiz.scores && quiz.scores.length > 0
              ? Math.max(...quiz.scores.map((s) => Math.round((s.score / s.total) * 100)))
              : null
            return (
              <div key={quiz.id} className={styles.quizCard} onClick={() => startQuiz(quiz)}>
                <div className={styles.quizTitle}>{quiz.title}</div>
                <div className={styles.quizMeta}>{quiz.subject && `${quiz.subject} · `}{quiz.questions.length} question{quiz.questions.length !== 1 ? 's' : ''}</div>
                {best !== null && <div className={styles.bestScore}>Best score: {best}%</div>}
                <button className={styles.quizDelete} onClick={(e) => { e.stopPropagation(); deleteQuiz(quiz.id) }}>✕</button>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
