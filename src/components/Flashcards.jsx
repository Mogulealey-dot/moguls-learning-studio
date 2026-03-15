import { useState, useMemo } from 'react'
import { useUserData } from '../hooks/useUserData'
import styles from './Flashcards.module.css'

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

function addDays(dateStr, days) {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

function sm2(card, rating) {
  let { interval, easeFactor } = card
  if (!interval) interval = 1
  if (!easeFactor) easeFactor = 2.5

  let newInterval, newEF

  if (rating < 3) {
    newInterval = 1
    newEF = Math.max(1.3, easeFactor - 0.2)
  } else {
    if (interval === 1) {
      newInterval = 6
    } else {
      newInterval = Math.round(interval * easeFactor)
    }
    newEF = easeFactor + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02))
    newEF = Math.max(1.3, newEF)
  }

  return {
    interval: newInterval,
    easeFactor: newEF,
    nextReview: addDays(todayStr(), newInterval),
    reviewCount: (card.reviewCount || 0) + 1,
    lapses: rating < 3 ? (card.lapses || 0) + 1 : (card.lapses || 0),
  }
}

export default function Flashcards({ storageKey }) {
  const key = `${storageKey}_flashcards`
  const [cards, setCards] = useUserData(key, [])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ front: '', back: '', subject: '' })
  const [studyDeck, setStudyDeck] = useState(null) // subject string or 'all'
  const [studyIdx, setStudyIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const addCard = () => {
    if (!form.front.trim() || !form.back.trim() || !form.subject.trim()) return
    const card = {
      id: Date.now(),
      front: form.front.trim(),
      back: form.back.trim(),
      subject: form.subject.trim(),
      interval: 1,
      easeFactor: 2.5,
      nextReview: todayStr(),
      reviewCount: 0,
      lapses: 0,
    }
    setCards([...cards, card])
    setForm({ front: '', back: '', subject: form.subject })
  }

  const deleteCard = (id) => setCards(cards.filter((c) => c.id !== id))

  const subjects = useMemo(() => {
    const s = new Set(cards.map((c) => c.subject))
    return Array.from(s)
  }, [cards])

  const dueCards = useMemo(() => {
    const today = todayStr()
    return cards.filter((c) => !c.nextReview || c.nextReview <= today)
  }, [cards])

  const deckDue = (subject) => dueCards.filter((c) => c.subject === subject).length

  const studyQueue = useMemo(() => {
    if (!studyDeck) return []
    const today = todayStr()
    return cards.filter((c) => {
      if (studyDeck !== 'all' && c.subject !== studyDeck) return false
      return !c.nextReview || c.nextReview <= today
    })
  }, [studyDeck, cards])

  const currentCard = studyQueue[studyIdx]

  const rate = (rating) => {
    if (!currentCard) return
    const updates = sm2(currentCard, rating)
    setCards(cards.map((c) => c.id === currentCard.id ? { ...c, ...updates } : c))
    setFlipped(false)
    setStudyIdx((i) => i + 1)
  }

  const exitStudy = () => { setStudyDeck(null); setStudyIdx(0); setFlipped(false) }

  const mastered = cards.filter((c) => c.interval > 21).length
  const totalCards = cards.length
  const dueToday = dueCards.length

  if (studyDeck !== null) {
    if (studyIdx >= studyQueue.length || studyQueue.length === 0) {
      return (
        <section id="flashcards" className="section">
          <div className="section-header">
            <p className="section-eyebrow">✦ Space Your Learning</p>
            <h2 className="section-title">Flash<em>cards</em></h2>
            <div className="divider" />
          </div>
          <div className={styles.studyMode}>
            <div className={styles.studyDone}>
              <div className={styles.studyDoneIcon}>🎉</div>
              <div className={styles.studyDoneTitle}>Session Complete!</div>
              <div className={styles.studyDoneSub}>
                {studyQueue.length === 0
                  ? 'No cards due in this deck right now.'
                  : `You reviewed ${studyQueue.length} card${studyQueue.length !== 1 ? 's' : ''}. Great work!`}
              </div>
              <button className={styles.backBtn} onClick={exitStudy}>Back to Decks</button>
            </div>
          </div>
        </section>
      )
    }

    return (
      <section id="flashcards" className="section">
        <div className="section-header">
          <p className="section-eyebrow">✦ Space Your Learning</p>
          <h2 className="section-title">Flash<em>cards</em></h2>
          <div className="divider" />
        </div>
        <div className={styles.studyMode}>
          <div className={styles.studyProgress}>
            <span>{studyIdx} / {studyQueue.length}</span>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${(studyIdx / studyQueue.length) * 100}%` }} />
            </div>
            <button className={styles.backBtn} onClick={exitStudy}>Exit</button>
          </div>

          <div className={styles.cardScene} onClick={() => setFlipped((f) => !f)}>
            <div className={`${styles.cardInner} ${flipped ? styles.flipped : ''}`}>
              <div className={styles.cardFace + ' ' + styles.cardFront}>
                <div className={styles.cardSubject}>{currentCard.subject}</div>
                <div className={styles.cardText}>{currentCard.front}</div>
                <div className={styles.cardHint}>Click to reveal answer</div>
              </div>
              <div className={styles.cardFace + ' ' + styles.cardBack}>
                <div className={styles.cardSubject}>{currentCard.subject}</div>
                <div className={styles.cardText}>{currentCard.back}</div>
              </div>
            </div>
          </div>

          {flipped && (
            <div className={styles.ratingRow}>
              <button className={`${styles.ratingBtn} ${styles.ratingAgain}`} onClick={() => rate(1)}>
                Again<br /><small>1</small>
              </button>
              <button className={`${styles.ratingBtn} ${styles.ratingHard}`} onClick={() => rate(2)}>
                Hard<br /><small>2</small>
              </button>
              <button className={`${styles.ratingBtn} ${styles.ratingGood}`} onClick={() => rate(3)}>
                Good<br /><small>3</small>
              </button>
              <button className={`${styles.ratingBtn} ${styles.ratingEasy}`} onClick={() => rate(4)}>
                Easy<br /><small>4</small>
              </button>
            </div>
          )}
        </div>
      </section>
    )
  }

  return (
    <section id="flashcards" className="section">
      <div className="section-header">
        <p className="section-eyebrow">✦ Space Your Learning</p>
        <h2 className="section-title">Flash<em>cards</em></h2>
        <div className="divider" />
      </div>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <div className={styles.statNum}>{totalCards}</div>
          <div className={styles.statLabel}>Total Cards</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNum} style={{ color: dueToday > 0 ? 'var(--crimson)' : 'var(--emerald-light)' }}>{dueToday}</div>
          <div className={styles.statLabel}>Due Today</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNum} style={{ color: 'var(--emerald-light)' }}>{mastered}</div>
          <div className={styles.statLabel}>Mastered</div>
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.btnRow}>
          {dueToday > 0 && (
            <button className={styles.studyBtn} onClick={() => { setStudyDeck('all'); setStudyIdx(0); setFlipped(false) }}>
              Study Now ({dueToday} due)
            </button>
          )}
        </div>
        <button className={styles.addBtn} onClick={() => setShowForm((v) => !v)}>
          {showForm ? '✕ Cancel' : '+ Add Card'}
        </button>
      </div>

      {showForm && (
        <div className={styles.form}>
          <div className={styles.formGrid}>
            <div className="field-group" style={{ gridColumn: '1/-1' }}>
              <label>Front (Question)</label>
              <textarea rows={3} placeholder="What is the question or term?" value={form.front} onChange={set('front')} style={{ width: '100%', resize: 'vertical' }} />
            </div>
            <div className="field-group" style={{ gridColumn: '1/-1' }}>
              <label>Back (Answer)</label>
              <textarea rows={3} placeholder="What is the answer or definition?" value={form.back} onChange={set('back')} style={{ width: '100%', resize: 'vertical' }} />
            </div>
            <div className="field-group" style={{ gridColumn: '1/-1' }}>
              <label>Deck / Subject</label>
              <input type="text" placeholder="e.g. Accounting, Biology, History..." value={form.subject} onChange={set('subject')} list="deck-list" />
              {subjects.length > 0 && (
                <datalist id="deck-list">
                  {subjects.map((s) => <option key={s} value={s} />)}
                </datalist>
              )}
            </div>
          </div>
          <div className={styles.formActions}>
            <button className="btn-primary" onClick={addCard}>Add Card →</button>
            <button className={styles.cancelBtn} onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {subjects.length === 0 ? (
        <div className={styles.empty}>
          <span style={{ fontSize: 40 }}>🃏</span>
          <p>No flashcard decks yet. Add your first card above!</p>
        </div>
      ) : (
        <div className={styles.decks}>
          {subjects.map((subject) => {
            const deckCards = cards.filter((c) => c.subject === subject)
            const due = deckDue(subject)
            return (
              <div key={subject} className={styles.deckCard} onClick={() => { setStudyDeck(subject); setStudyIdx(0); setFlipped(false) }}>
                <div className={styles.deckName}>
                  {subject}
                  {due > 0 && <span className={styles.dueBadge}>{due} due</span>}
                </div>
                <div className={styles.deckMeta}>
                  {deckCards.length} card{deckCards.length !== 1 ? 's' : ''} · {deckCards.filter((c) => c.interval > 21).length} mastered
                </div>
                <button
                  className={styles.deckDelete}
                  onClick={(e) => { e.stopPropagation(); setCards(cards.filter((c) => c.subject !== subject)) }}
                  title="Delete deck"
                >
                  ✕
                </button>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
