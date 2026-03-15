import { useState } from 'react'
import { useUserData } from '../hooks/useUserData'
import styles from './ReadingList.module.css'

const TYPE_ICONS = { book: '📕', paper: '📄', article: '🌐', textbook: '📚' }
const TYPES = ['book', 'paper', 'article', 'textbook']
const STATUSES = ['to-read', 'reading', 'completed']

const emptyForm = { title: '', author: '', type: 'book', status: 'to-read', pages: '', currentPage: '', notes: '' }

export default function ReadingList({ storageKey }) {
  const key = `${storageKey}_reading`
  const [items, setItems] = useUserData(key, [])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [activeTab, setActiveTab] = useState('to-read')
  const [sort, setSort] = useState('date')

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const addItem = () => {
    if (!form.title.trim()) return
    const item = {
      id: Date.now(),
      ...form,
      pages: form.pages ? Number(form.pages) : null,
      currentPage: form.currentPage ? Number(form.currentPage) : 0,
      rating: 0,
      addedAt: new Date().toISOString(),
      completedAt: form.status === 'completed' ? new Date().toISOString() : null,
    }
    setItems([...items, item])
    setForm(emptyForm); setShowForm(false)
  }

  const deleteItem = (id) => setItems(items.filter((i) => i.id !== id))

  const updateStatus = (id, status) => {
    setItems(items.map((i) => i.id === id ? { ...i, status, completedAt: status === 'completed' ? new Date().toISOString() : i.completedAt } : i))
  }

  const updatePage = (id, page) => {
    setItems(items.map((i) => i.id === id ? { ...i, currentPage: Number(page) } : i))
  }

  const setRating = (id, rating) => {
    setItems(items.map((i) => i.id === id ? { ...i, rating } : i))
  }

  const tabItems = items.filter((i) => i.status === activeTab)
  const sorted = [...tabItems].sort((a, b) => {
    if (sort === 'title') return a.title.localeCompare(b.title)
    if (sort === 'rating') return (b.rating || 0) - (a.rating || 0)
    return new Date(b.addedAt) - new Date(a.addedAt)
  })

  const totalRead = items.filter((i) => i.status === 'completed').length
  const inProgress = items.filter((i) => i.status === 'reading').length
  const totalPages = items.filter((i) => i.status === 'completed' && i.pages).reduce((a, i) => a + i.pages, 0)

  return (
    <section id="reading" className="section">
      <div className="section-header">
        <p className="section-eyebrow">✦ Your Reading Journey</p>
        <h2 className="section-title">Reading <em>List</em></h2>
        <div className="divider" />
      </div>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <div className={styles.statNum}>{totalRead}</div>
          <div className={styles.statLabel}>Books Read</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNum} style={{ color: 'var(--gold)' }}>{inProgress}</div>
          <div className={styles.statLabel}>In Progress</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNum} style={{ color: 'var(--mist)' }}>{totalPages.toLocaleString()}</div>
          <div className={styles.statLabel}>Pages Read</div>
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.tabs}>
          {STATUSES.map((s) => (
            <button key={s} className={`${styles.tab} ${activeTab === s ? styles.tabActive : ''}`} onClick={() => setActiveTab(s)}>
              {s === 'to-read' ? 'To Read' : s === 'reading' ? 'Reading' : 'Completed'}
              <span style={{ marginLeft: 6, fontSize: 11, opacity: 0.7 }}>({items.filter((i) => i.status === s).length})</span>
            </button>
          ))}
        </div>
        <div className={styles.btnRow}>
          <select className={styles.sortSelect} value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="date">Sort: Date Added</option>
            <option value="title">Sort: Title</option>
            <option value="rating">Sort: Rating</option>
          </select>
          <button className={styles.addBtn} onClick={() => setShowForm((v) => !v)}>
            {showForm ? '✕ Cancel' : '+ Add Book'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className={styles.form}>
          <div className={styles.formGrid}>
            <div className="field-group" style={{ gridColumn: '1/-1' }}>
              <label>Title</label>
              <input type="text" placeholder="Book or paper title" value={form.title} onChange={set('title')} />
            </div>
            <div className="field-group">
              <label>Author</label>
              <input type="text" placeholder="Author name" value={form.author} onChange={set('author')} />
            </div>
            <div className="field-group">
              <label>Type</label>
              <select className={styles.select} value={form.type} onChange={set('type')}>
                {TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
            <div className="field-group">
              <label>Status</label>
              <select className={styles.select} value={form.status} onChange={set('status')}>
                <option value="to-read">To Read</option>
                <option value="reading">Reading</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="field-group">
              <label>Total Pages (optional)</label>
              <input type="number" min="1" placeholder="e.g. 320" value={form.pages} onChange={set('pages')} />
            </div>
            <div className="field-group" style={{ gridColumn: '1/-1' }}>
              <label>Notes (optional)</label>
              <input type="text" placeholder="Any notes about this book..." value={form.notes} onChange={set('notes')} />
            </div>
          </div>
          <div className={styles.formActions}>
            <button className="btn-primary" onClick={addItem}>Add to List →</button>
            <button className={styles.cancelBtn} onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {sorted.length === 0 ? (
        <div className={styles.empty}>
          <span style={{ fontSize: 40 }}>📖</span>
          <p>Nothing in {activeTab === 'to-read' ? 'your reading queue' : activeTab === 'reading' ? 'progress' : 'your completed list'} yet.</p>
        </div>
      ) : (
        <div className={styles.list}>
          {sorted.map((item) => {
            const progress = item.pages && item.currentPage ? Math.round((item.currentPage / item.pages) * 100) : null
            return (
              <div key={item.id} className={styles.item}>
                <div className={styles.itemIcon}>{TYPE_ICONS[item.type] || '📄'}</div>
                <div className={styles.itemBody}>
                  <div className={styles.itemTitle}>{item.title}</div>
                  {item.author && <div className={styles.itemAuthor}>by {item.author}</div>}
                  <div className={styles.itemMeta}>
                    <span className={styles.tag}>{item.type}</span>
                    {item.status === 'reading' && item.pages && (
                      <>
                        <input
                          className={styles.pageInput}
                          type="number"
                          min="0"
                          max={item.pages}
                          value={item.currentPage || 0}
                          onChange={(e) => updatePage(item.id, e.target.value)}
                          title="Current page"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span style={{ fontSize: 12, color: 'var(--mist)' }}>/ {item.pages}</span>
                        {progress !== null && (
                          <div className={styles.progressWrap}>
                            <div className={styles.progressFill} style={{ width: `${progress}%` }} />
                          </div>
                        )}
                        <span style={{ fontSize: 12, color: 'var(--mist)' }}>{progress}%</span>
                      </>
                    )}
                    {item.status === 'completed' && (
                      <span className={styles.stars}>
                        {[1,2,3,4,5].map((n) => (
                          <button
                            key={n}
                            className={`${styles.starBtn} ${n <= item.rating ? styles.starBtnActive : ''}`}
                            onClick={() => setRating(item.id, n)}
                            title={`Rate ${n}`}
                          >
                            {n <= item.rating ? '★' : '☆'}
                          </button>
                        ))}
                      </span>
                    )}
                  </div>
                  {item.notes && <div className={styles.itemNotes}>{item.notes}</div>}
                </div>
                <div className={styles.itemActions}>
                  <select
                    className={styles.statusSelect}
                    value={item.status}
                    onChange={(e) => updateStatus(item.id, e.target.value)}
                  >
                    <option value="to-read">To Read</option>
                    <option value="reading">Reading</option>
                    <option value="completed">Completed</option>
                  </select>
                  <button className={styles.deleteBtn} onClick={() => deleteItem(item.id)}>✕</button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
