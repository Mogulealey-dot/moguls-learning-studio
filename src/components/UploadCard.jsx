import { useState, useRef } from 'react'
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from '../firebase'
import { useAuth } from '../contexts/AuthContext'
import { useUserData } from '../hooks/useUserData'
import styles from './UploadCard.module.css'

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
  const { currentUser } = useAuth()
  const [files, setFiles]         = useUserData(storageKey, [])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress]   = useState(0)
  const [dragging, setDragging]   = useState(false)
  const inputRef = useRef()

  const addFiles = async (fileList) => {
    if (!currentUser || uploading) return
    setUploading(true)

    const uploaded = []
    for (const f of Array.from(fileList)) {
      const id = `${Date.now()}_${Math.random().toString(36).slice(2)}`
      const storagePath = `users/${currentUser.uid}/${storageKey}/${id}_${f.name}`
      const task = uploadBytesResumable(ref(storage, storagePath), f)

      await new Promise((resolve, reject) => {
        task.on(
          'state_changed',
          (snap) => setProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
          reject,
          async () => {
            const url = await getDownloadURL(task.snapshot.ref)
            uploaded.push({ id, name: f.name, size: f.size, type: f.type, date: new Date().toLocaleDateString(), url, storagePath })
            resolve()
          }
        )
      }).catch((err) => console.error('Upload failed:', err))
    }

    if (uploaded.length > 0) setFiles([...files, ...uploaded])
    setUploading(false)
    setProgress(0)
  }

  const removeFile = async (file) => {
    try { await deleteObject(ref(storage, file.storagePath)) } catch { /* already deleted */ }
    setFiles(files.filter((f) => f.id !== file.id))
  }

  return (
    <div className={styles.card}>
      <div className={styles.icon}>{icon}</div>
      <div className={styles.title}>{title}</div>
      <div className={styles.desc}>{desc}</div>

      <div
        className={`${styles.dropzone} ${dragging ? styles.dragging : ''}`}
        onClick={() => !uploading && inputRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files) }}
        style={{ cursor: uploading ? 'default' : 'pointer' }}
      >
        {uploading ? (
          <div className={styles.dropText}>
            <div className={styles.dropPlus}>⬆</div>
            <strong>Uploading… {progress}%</strong>
            <div style={{ marginTop: 10, height: 4, background: 'rgba(245,240,232,0.1)', borderRadius: 2, width: '80%', margin: '10px auto 0' }}>
              <div style={{ height: '100%', width: `${progress}%`, background: 'var(--accent, var(--gold))', borderRadius: 2, transition: 'width 0.3s' }} />
            </div>
          </div>
        ) : (
          <div className={styles.dropText}>
            <div className={styles.dropPlus}>⊕</div>
            <strong>Click to upload</strong> or drag & drop
            <br /><span className={styles.dropHint}>PDF, DOC, images, etc. — stored in the cloud ☁</span>
          </div>
        )}
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
                onClick={() => f.url && window.open(f.url, '_blank')}
                title="Open file"
              >↗</button>
              <button className={styles.deleteBtn} onClick={() => removeFile(f)} title="Remove">✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
