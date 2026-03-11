import { useState } from 'react'
import { useUserData } from '../hooks/useUserData'
import styles from './NotesApp.module.css'
import jsPDF from 'jspdf'

function Toast({ msg, onDone }) {
  useState(() => { const t = setTimeout(onDone, 2800); return () => clearTimeout(t) })
  return <div className="toast">✓ {msg}</div>
}

export default function NotesApp({ storageKey }) {
  const key = storageKey || 'mls_notes'
  const [notes, setNotes]       = useUserData(key, [])
  const [activeId, setActiveId] = useState(null)
  const [title, setTitle]       = useState('')
  const [body, setBody]         = useState('')
  const [toast, setToast]       = useState('')

  const newNote = () => {
    const n = { id: Date.now(), title: 'Untitled Note', body: '', date: new Date().toLocaleDateString() }
    setNotes([n, ...notes])
    setActiveId(n.id); setTitle(n.title); setBody(n.body)
  }

  const selectNote = (n) => { setActiveId(n.id); setTitle(n.title); setBody(n.body) }

  const save = () => {
    const updated = notes.map((n) =>
      n.id === activeId ? { ...n, title: title || 'Untitled', body, date: new Date().toLocaleDateString() } : n
    )
    setNotes(updated)
    setToast('Note saved!')
  }

  const deleteNote = () => {
    setNotes(notes.filter((n) => n.id !== activeId))
    setActiveId(null); setTitle(''); setBody('')
  }

  const exportPDF = () => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' })
    const margin = 60
    const pageWidth = doc.internal.pageSize.getWidth()
    const maxWidth = pageWidth - margin * 2

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(20)
    doc.text(title || 'Untitled Note', margin, 80)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(120, 120, 120)
    doc.text(`Mogul's Learning Studio  ·  ${new Date().toLocaleDateString()}`, margin, 104)

    doc.setDrawColor(180, 140, 60)
    doc.line(margin, 116, margin + 60, 116)

    doc.setFontSize(12)
    doc.setTextColor(30, 30, 30)
    const lines = doc.splitTextToSize(body || '', maxWidth)
    doc.text(lines, margin, 140)
    doc.save(`${(title || 'note').replace(/[^a-z0-9]/gi, '_')}.pdf`)
    setToast('PDF exported!')
  }

  return (
    <section id="notes" className={`section ${styles.section}`}>
      {toast && <Toast msg={toast} onDone={() => setToast('')} />}
      <div className="section-header">
        <p className="section-eyebrow">✦ Think. Write. Remember.</p>
        <h2 className="section-title">My <em>Notepad</em></h2>
        <div className="divider" />
        <p style={{ marginTop: 16, fontSize: 14, color: 'var(--mist)' }}>
          Notes are saved to the cloud — access them from any device.
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
                <button className={styles.exportBtn} onClick={exportPDF} title="Export as PDF">↓ PDF</button>
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
