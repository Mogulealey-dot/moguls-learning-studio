import { useState } from 'react'
import { LS } from '../utils'
import styles from './NotesApp.module.css'

function Toast({ msg, onDone }) {
  useState(() => { const t = setTimeout(onDone, 2800); return () => clearTimeout(t) })
  return <div className="toast">✓ {msg}</div>
}

export default function NotesApp() {
  const [notes, setNotes]     = useState(() => LS.get('mls_notes', []))
  const [activeId, setActiveId] = useState(null)
  const [title, setTitle]     = useState('')
  const [body, setBody]       = useState('')
  const [toast, setToast]     = useState('')

  const newNote = () => {
    const n = { id: Date.now(), title: 'Untitled Note', body: '', date: new Date().toLocaleDateString() }
    const updated = [n, ...notes]
    setNotes(updated); LS.set('mls_notes', updated)
    setActiveId(n.id); setTitle(n.title); setBody(n.body)
  }

  const selectNote = (n) => { setActiveId(n.id); setTitle(n.title); setBody(n.body) }

  const save = () => {
    const updated = notes.map((n) =>
      n.id === activeId ? { ...n, title: title || 'Untitled', body, date: new Date().toLocaleDateString() } : n
    )
    setNotes(updated); LS.set('mls_notes', updated); setToast('Note saved!')
  }

  const deleteNote = () => {
    const updated = notes.filter((n) => n.id !== activeId)
    setNotes(updated); LS.set('mls_notes', updated)
    setActiveId(null); setTitle(''); setBody('')
  }

  return (
    <section id="notes" className={`section ${styles.section}`}>
      {toast && <Toast msg={toast} onDone={() => setToast('')} />}
      <div className="section-header">
        <p className="section-eyebrow">✦ Think. Write. Remember.</p>
        <h2 className="section-title">My <em>Notepad</em></h2>
        <div className="divider" />
        <p style={{ marginTop: 16, fontSize: 14, color: 'var(--mist)' }}>
          Notes are saved in your browser — they persist between sessions.
        </p>
      </div>
      <div className={styles.layout}>
        <div className={styles.sidebar}>
          <button className={styles.newBtn} onClick={newNote}>+ New Note</button>
          <div className={styles.list}>
            {notes.length === 0 && (
              <p className={styles.empty}>No notes yet. Create your first!</p>
            )}
            {notes.map((n) => (
              <div
                key={n.id}
                className={`${styles.item} ${n.id === activeId ? styles.activeItem : ''}`}
                onClick={() => selectNote(n)}
              >
                <div className={styles.itemTitle}>{n.title}</div>
                <div className={styles.itemPreview}>{n.body.slice(0, 60) || 'Empty note…'}</div>
                <div className={styles.itemDate}>{n.date}</div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.editor}>
          {activeId ? (
            <>
              <div className={styles.toolbar}>
                <input
                  className={styles.titleInput}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Note title…"
                />
              </div>
              <div className={styles.body}>
                <textarea
                  className={styles.textarea}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder={'Start writing your note here…\n\nJot down lecture notes, ideas, summaries, or anything you need to remember.'}
                />
              </div>
              <div className={styles.actions}>
                <button className={styles.deleteBtn} onClick={deleteNote}>Delete</button>
                <button className={styles.saveBtn} onClick={save}>Save Note</button>
              </div>
            </>
          ) : (
            <div className={styles.emptyEditor}>
              <div className={styles.emptyIcon}>📓</div>
              <p>Select a note to edit, or create a new one.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
