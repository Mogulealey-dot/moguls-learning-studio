import { useState, useRef } from 'react'
import { LS } from '../utils'
import styles from './UploadCard.module.css'

// Blob URLs live for the session only — browser security limitation
const blobRegistry = {}

function fileIcon(type) {
  if (type.includes('pdf'))   return '📄'
  if (type.includes('image')) return '🖼'
  if (type.includes('word') || type.includes('document')) return '📝'
  return '📎'
}
function fmtSize(b) {
  return b > 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${(b / 1024).toFixed(0)} KB`
}

export default function UploadCard({ icon, title, desc, storageKey }) {
  const [files, setFiles]     = useState(() => LS.get(storageKey, []))
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef()

  const addFiles = (fileList) => {
    const newFiles = Array.from(fileList).map((f) => {
      const id = Date.now() + Math.random()
      blobRegistry[id] = URL.createObjectURL(f)
      return { id, name: f.name, size: f.size, type: f.type, date: new Date().toLocaleDateString() }
    })
    const updated = [...files, ...newFiles]
    setFiles(updated)
    LS.set(storageKey, updated)
  }

  const openFile = (id) => {
    const url = blobRegistry[id]
    if (url) window.open(url, '_blank')
    else alert('⚠ Re-upload this file to open it. Browser security prevents opening files from a previous session.')
  }

  const removeFile = (id) => {
    if (blobRegistry[id]) { URL.revokeObjectURL(blobRegistry[id]); delete blobRegistry[id] }
    const updated = files.filter((f) => f.id !== id)
    setFiles(updated)
    LS.set(storageKey, updated)
  }

  return (
    <div className={styles.card}>
      <div className={styles.icon}>{icon}</div>
      <div className={styles.title}>{title}</div>
      <div className={styles.desc}>{desc}</div>

      <div
        className={`${styles.dropzone} ${dragging ? styles.dragging : ''}`}
        onClick={() => inputRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files) }}
      >
        <div className={styles.dropText}>
          <div className={styles.dropPlus}>⊕</div>
          <strong>Click to upload</strong> or drag & drop
          <br /><span className={styles.dropHint}>PDF, DOC, images, etc.</span>
        </div>
        <input ref={inputRef} type="file" multiple style={{ display: 'none' }} onChange={(e) => addFiles(e.target.files)} />
      </div>

      {files.length > 0 && (
        <div className={styles.fileList}>
          {files.map((f) => (
            <div key={f.id} className={styles.fileItem}>
              <span className={styles.fileIcon}>{fileIcon(f.type)}</span>
              <span className={styles.fileName} title={f.name}>{f.name}</span>
              <span className={styles.fileSize}>{fmtSize(f.size)}</span>
              <button
                className={styles.openBtn}
                onClick={() => openFile(f.id)}
                title={blobRegistry[f.id] ? 'Open in new tab' : 'Re-upload to open'}
              >
                {blobRegistry[f.id] ? '↗' : '⚠'}
              </button>
              <button className={styles.deleteBtn} onClick={() => removeFile(f.id)} title="Remove">✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
