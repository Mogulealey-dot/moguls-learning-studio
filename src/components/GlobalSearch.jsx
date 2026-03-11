import { useState, useEffect, useRef } from 'react'
import { useUserData } from '../hooks/useUserData'
import styles from './GlobalSearch.module.css'

const STUDIO_KEYS = [
  { label: 'Finance',    prefix: 'mls_finance' },
  { label: 'Math',       prefix: 'mls_math' },
  { label: 'CS',         prefix: 'mls_cs' },
  { label: 'Philosophy', prefix: 'mls_phil' },
  { label: 'Sciences',   prefix: 'mls_sci' },
  { label: 'Literature', prefix: 'mls_lit' },
  { label: 'History',    prefix: 'mls_hist' },
  { label: 'Arts',       prefix: 'mls_arts' },
]

function NoteResults({ prefix, label, query }) {
  const [notes] = useUserData(`${prefix}_notes`, [])
  const results = notes.filter((n) =>
    n.title.toLowerCase().includes(query) || n.body.toLowerCase().includes(query)
  )
  if (results.length === 0) return null
  return (
    <>
      {results.map((n) => (
        <div key={n.id} className={styles.result}>
          <div className={styles.resultStudio}>{label}</div>
          <div className={styles.resultTitle}>{n.title}</div>
          <div className={styles.resultPreview}>{n.body.slice(0, 100)}{n.body.length > 100 ? '…' : ''}</div>
        </div>
      ))}
    </>
  )
}

export default function GlobalSearch({ open, onClose }) {
  const [query, setQuery] = useState('')
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
            placeholder="Search all notes across every studio…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <kbd className={styles.esc} onClick={onClose}>Esc</kbd>
        </div>
        <div className={styles.results}>
          {q.length < 2 ? (
            <div className={styles.hint}>Type at least 2 characters to search your notes.</div>
          ) : (
            <>
              {STUDIO_KEYS.map((s) => (
                <NoteResults key={s.prefix} prefix={s.prefix} label={s.label} query={q} />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
