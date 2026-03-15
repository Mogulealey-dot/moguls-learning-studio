import { useState, useEffect, useRef } from 'react'
import { useUserData } from '../hooks/useUserData'
import styles from './GlobalSearch.module.css'

const STUDIO_KEYS = [
  { label: 'Finance',             prefix: 'mls' },
  { label: 'Mathematics',         prefix: 'mls_math' },
  { label: 'Computer Science',    prefix: 'mls_cs' },
  { label: 'Philosophy',          prefix: 'mls_phil' },
  { label: 'Natural Sciences',    prefix: 'mls_sci' },
  { label: 'Literature',          prefix: 'mls_lit' },
  { label: 'History & Politics',  prefix: 'mls_hist' },
  { label: 'Arts & Design',       prefix: 'mls_arts' },
  { label: 'Accounting',          prefix: 'mls_acct' },
  { label: 'Economics',           prefix: 'mls_econ' },
  { label: 'Math Calculator',     prefix: 'mls_calc' },
  { label: 'Accounting Formulas', prefix: 'mls_acctf' },
]

function NoteResults({ prefix, label, query }) {
  const [notes] = useUserData(`${prefix}_notes`, [])
  const results = notes.filter((n) =>
    (n.title || '').toLowerCase().includes(query) || (n.body || '').toLowerCase().includes(query)
  )
  if (results.length === 0) return null
  return (
    <>
      {results.map((n) => (
        <div key={n.id} className={styles.result}>
          <div className={styles.resultStudio}>{label} · Note</div>
          <div className={styles.resultTitle}>{n.title}</div>
          <div className={styles.resultPreview}>{(n.body || '').slice(0, 100)}{(n.body || '').length > 100 ? '…' : ''}</div>
        </div>
      ))}
    </>
  )
}

function TaskResults({ prefix, label, query }) {
  const [tasks] = useUserData(`${prefix}_tasks`, [])
  const results = tasks.filter((t) =>
    (t.title || '').toLowerCase().includes(query) ||
    (t.notes || '').toLowerCase().includes(query) ||
    (t.subject || '').toLowerCase().includes(query)
  )
  if (results.length === 0) return null
  return (
    <>
      {results.map((t) => (
        <div key={t.id} className={styles.result}>
          <div className={styles.resultStudio}>{label} · Task</div>
          <div className={styles.resultTitle}>{t.title}</div>
          <div className={styles.resultPreview}>{t.subject}{t.due ? ` · Due ${new Date(t.due).toLocaleDateString()}` : ''}{t.done ? ' · Done' : ''}</div>
        </div>
      ))}
    </>
  )
}

function FlashcardResults({ prefix, label, query }) {
  const [cards] = useUserData(`${prefix}_flashcards`, [])
  const results = cards.filter((c) =>
    (c.front || '').toLowerCase().includes(query) ||
    (c.back || '').toLowerCase().includes(query) ||
    (c.subject || '').toLowerCase().includes(query)
  )
  if (results.length === 0) return null
  return (
    <>
      {results.map((c) => (
        <div key={c.id} className={styles.result}>
          <div className={styles.resultStudio}>{label} · Flashcard</div>
          <div className={styles.resultTitle}>{c.front}</div>
          <div className={styles.resultPreview}>{c.subject} · {(c.back || '').slice(0, 80)}{(c.back || '').length > 80 ? '…' : ''}</div>
        </div>
      ))}
    </>
  )
}

function ReadingResults({ prefix, label, query }) {
  const [items] = useUserData(`${prefix}_reading`, [])
  const results = items.filter((i) =>
    (i.title || '').toLowerCase().includes(query) ||
    (i.author || '').toLowerCase().includes(query) ||
    (i.notes || '').toLowerCase().includes(query)
  )
  if (results.length === 0) return null
  return (
    <>
      {results.map((i) => (
        <div key={i.id} className={styles.result}>
          <div className={styles.resultStudio}>{label} · Reading</div>
          <div className={styles.resultTitle}>{i.title}</div>
          <div className={styles.resultPreview}>{i.author ? `by ${i.author} · ` : ''}{i.status} · {i.type}</div>
        </div>
      ))}
    </>
  )
}

export default function GlobalSearch({ open, onClose }) {
  const [query, setQuery] = useState('')
  const [activeType, setActiveType] = useState('all')
  const inputRef = useRef()

  useEffect(() => {
    if (open) { setQuery(''); setTimeout(() => inputRef.current?.focus(), 50) }
  }, [open])

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    if (open) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null
  const q = query.trim().toLowerCase()

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.searchRow}>
          <span className={styles.icon}>🔍</span>
          <input
            ref={inputRef}
            className={styles.input}
            placeholder="Search notes, tasks, flashcards, reading list…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <kbd className={styles.esc} onClick={onClose}>Esc</kbd>
        </div>

        {q.length >= 2 && (
          <div style={{ display: 'flex', gap: 8, padding: '8px 16px', borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
            {['all', 'notes', 'tasks', 'flashcards', 'reading'].map((t) => (
              <button
                key={t}
                onClick={() => setActiveType(t)}
                style={{
                  background: activeType === t ? 'rgba(201,168,76,0.12)' : 'transparent',
                  border: `1px solid ${activeType === t ? 'rgba(201,168,76,0.4)' : 'rgba(201,168,76,0.15)'}`,
                  color: activeType === t ? 'var(--gold)' : 'var(--mist)',
                  padding: '4px 12px', borderRadius: 20, fontSize: 12, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif'
                }}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        )}

        <div className={styles.results}>
          {q.length < 2 ? (
            <div className={styles.hint}>Type at least 2 characters to search across all studios.</div>
          ) : (
            <>
              {(activeType === 'all' || activeType === 'notes') && STUDIO_KEYS.map((s) => (
                <NoteResults key={`n-${s.prefix}`} prefix={s.prefix} label={s.label} query={q} />
              ))}
              {(activeType === 'all' || activeType === 'tasks') && STUDIO_KEYS.map((s) => (
                <TaskResults key={`t-${s.prefix}`} prefix={s.prefix} label={s.label} query={q} />
              ))}
              {(activeType === 'all' || activeType === 'flashcards') && STUDIO_KEYS.map((s) => (
                <FlashcardResults key={`f-${s.prefix}`} prefix={s.prefix} label={s.label} query={q} />
              ))}
              {(activeType === 'all' || activeType === 'reading') && STUDIO_KEYS.map((s) => (
                <ReadingResults key={`r-${s.prefix}`} prefix={s.prefix} label={s.label} query={q} />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
