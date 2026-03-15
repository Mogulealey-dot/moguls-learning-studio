import { useState } from 'react'
import { useUserData } from '../hooks/useUserData'
import styles from './CitationGenerator.module.css'

const SOURCE_TYPES = ['book', 'journal', 'website', 'other']

const emptyForm = {
  type: 'book',
  authors: '',
  title: '',
  year: '',
  publisher: '',
  journal: '',
  volume: '',
  issue: '',
  pages: '',
  url: '',
  accessDate: '',
  doi: '',
}

function formatAuthorsAPA(authors) {
  const parts = authors.split(',').map((a) => a.trim()).filter(Boolean)
  if (parts.length === 0) return 'Author, A.'
  return parts.join(', ')
}

function formatAuthorsMLA(authors) {
  const parts = authors.split(',').map((a) => a.trim()).filter(Boolean)
  if (parts.length === 0) return 'Author'
  return parts.join(', ')
}

function buildAPA(c) {
  const auth = formatAuthorsAPA(c.authors)
  const year = c.year ? `(${c.year})` : '(n.d.)'
  const title = c.title || 'Untitled'
  if (c.type === 'journal') {
    const vol = c.volume ? `, ${c.volume}` : ''
    const iss = c.issue ? `(${c.issue})` : ''
    const pgs = c.pages ? `, ${c.pages}` : ''
    const doi = c.doi ? ` https://doi.org/${c.doi}` : (c.url ? ` ${c.url}` : '')
    return `${auth} ${year}. ${title}. ${c.journal || 'Journal'}${vol}${iss}${pgs}.${doi}`
  }
  if (c.type === 'website') {
    const accessed = c.accessDate ? ` Retrieved ${new Date(c.accessDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} from` : ''
    return `${auth} ${year}. ${title}.${accessed} ${c.url || ''}`
  }
  const pub = c.publisher || 'Publisher'
  return `${auth} ${year}. ${title}. ${pub}.`
}

function buildMLA(c) {
  const auth = formatAuthorsMLA(c.authors)
  const title = c.title ? `"${c.title}"` : '"Untitled"'
  const year = c.year || 'n.d.'
  if (c.type === 'journal') {
    const vol = c.volume ? `, vol. ${c.volume}` : ''
    const iss = c.issue ? `, no. ${c.issue}` : ''
    const pgs = c.pages ? `, pp. ${c.pages}` : ''
    return `${auth}. ${title}. ${c.journal || 'Journal'}${vol}${iss}${pgs}. ${year}.`
  }
  if (c.type === 'website') {
    return `${auth}. ${title}. ${c.url || ''}, ${year}.`
  }
  return `${auth}. ${title}. ${c.publisher || 'Publisher'}, ${year}.`
}

function buildHarvard(c) {
  const auth = formatAuthorsMLA(c.authors)
  const year = c.year || 'n.d.'
  const title = c.title || 'Untitled'
  if (c.type === 'journal') {
    const vol = c.volume ? `, ${c.volume}` : ''
    const iss = c.issue ? `(${c.issue})` : ''
    const pgs = c.pages ? `, pp. ${c.pages}` : ''
    return `${auth} (${year}) '${title}', ${c.journal || 'Journal'}${vol}${iss}${pgs}.`
  }
  if (c.type === 'website') {
    return `${auth} (${year}) ${title}. Available at: ${c.url || ''}.`
  }
  return `${auth} (${year}) ${title}. ${c.publisher || 'Publisher'}.`
}

function copyText(text) {
  navigator.clipboard.writeText(text).catch(() => {
    const el = document.createElement('textarea')
    el.value = text; document.body.appendChild(el); el.select(); document.execCommand('copy'); document.body.removeChild(el)
  })
}

function exportAll(citations) {
  const lines = citations.map((c, i) =>
    `[${i + 1}] APA: ${buildAPA(c)}\n    MLA: ${buildMLA(c)}\n    Harvard: ${buildHarvard(c)}\n`
  ).join('\n')
  const blob = new Blob([lines], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = 'citations.txt'; a.click()
  URL.revokeObjectURL(url)
}

export default function CitationGenerator({ storageKey }) {
  const key = `${storageKey}_citations`
  const [citations, setCitations] = useUserData(key, [])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [copied, setCopied] = useState(null)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleCopy = (text, id) => {
    copyText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 1500)
  }

  const saveCitation = () => {
    if (!form.title.trim()) return
    setCitations([...citations, { id: Date.now(), ...form }])
    setForm(emptyForm); setShowForm(false)
  }

  const deleteCitation = (id) => setCitations(citations.filter((c) => c.id !== id))

  const previewAPA = buildAPA(form)
  const previewMLA = buildMLA(form)
  const previewHarvard = buildHarvard(form)

  return (
    <section id="citations" className="section">
      <div className="section-header">
        <p className="section-eyebrow">✦ Reference with Confidence</p>
        <h2 className="section-title">Citation <em>Generator</em></h2>
        <div className="divider" />
      </div>

      <div className={styles.controls}>
        <span style={{ fontSize: 14, color: 'var(--mist)' }}>{citations.length} citation{citations.length !== 1 ? 's' : ''} saved</span>
        <div style={{ display: 'flex', gap: 10 }}>
          {citations.length > 0 && (
            <button className={styles.exportBtn} onClick={() => exportAll(citations)}>Export All</button>
          )}
          <button className={styles.addBtn} onClick={() => setShowForm((v) => !v)}>
            {showForm ? '✕ Cancel' : '+ Add Source'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className={styles.form}>
          <div className={styles.formGrid}>
            <div className="field-group">
              <label>Source Type</label>
              <select className={styles.select} value={form.type} onChange={set('type')}>
                {SOURCE_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
            <div className="field-group">
              <label>Year</label>
              <input type="text" placeholder="e.g. 2023" value={form.year} onChange={set('year')} />
            </div>
            <div className="field-group" style={{ gridColumn: '1/-1' }}>
              <label>Author(s) — comma separated (Surname, First)</label>
              <input type="text" placeholder="e.g. Smith, John, Doe, Jane" value={form.authors} onChange={set('authors')} />
            </div>
            <div className="field-group" style={{ gridColumn: '1/-1' }}>
              <label>Title</label>
              <input type="text" placeholder="Title of the work" value={form.title} onChange={set('title')} />
            </div>
            {(form.type === 'book' || form.type === 'other') && (
              <div className="field-group" style={{ gridColumn: '1/-1' }}>
                <label>Publisher</label>
                <input type="text" placeholder="e.g. Oxford University Press" value={form.publisher} onChange={set('publisher')} />
              </div>
            )}
            {form.type === 'journal' && (
              <>
                <div className="field-group">
                  <label>Journal Name</label>
                  <input type="text" placeholder="e.g. Nature" value={form.journal} onChange={set('journal')} />
                </div>
                <div className="field-group">
                  <label>Volume</label>
                  <input type="text" placeholder="e.g. 12" value={form.volume} onChange={set('volume')} />
                </div>
                <div className="field-group">
                  <label>Issue</label>
                  <input type="text" placeholder="e.g. 3" value={form.issue} onChange={set('issue')} />
                </div>
                <div className="field-group">
                  <label>Pages</label>
                  <input type="text" placeholder="e.g. 45-60" value={form.pages} onChange={set('pages')} />
                </div>
                <div className="field-group">
                  <label>DOI (optional)</label>
                  <input type="text" placeholder="e.g. 10.1234/nature.2023.01" value={form.doi} onChange={set('doi')} />
                </div>
              </>
            )}
            {form.type === 'website' && (
              <>
                <div className="field-group" style={{ gridColumn: '1/-1' }}>
                  <label>URL</label>
                  <input type="text" placeholder="https://..." value={form.url} onChange={set('url')} />
                </div>
                <div className="field-group">
                  <label>Access Date</label>
                  <input type="date" value={form.accessDate} onChange={set('accessDate')} />
                </div>
              </>
            )}
          </div>

          {form.title && (
            <div className={styles.previewBlock}>
              <div className={styles.previewTitle}>Preview</div>
              {[['APA', previewAPA], ['MLA', previewMLA], ['Harvard', previewHarvard]].map(([fmt, text]) => (
                <div key={fmt} className={styles.previewRow}>
                  <span className={styles.previewLabel}>{fmt}</span>
                  <span className={styles.previewText}>{text}</span>
                  <button className={styles.copyBtn} onClick={() => handleCopy(text, `preview-${fmt}`)}>
                    {copied === `preview-${fmt}` ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className={styles.formActions}>
            <button className="btn-primary" onClick={saveCitation}>Save Citation →</button>
            <button className={styles.cancelBtn} onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {citations.length === 0 ? (
        <div className={styles.empty}>
          <span style={{ fontSize: 40 }}>🔖</span>
          <p>No citations yet. Add your first source above!</p>
        </div>
      ) : (
        <div className={styles.library}>
          {citations.map((c) => {
            const apa = buildAPA(c)
            const mla = buildMLA(c)
            const harvard = buildHarvard(c)
            return (
              <div key={c.id} className={styles.citItem}>
                <div className={styles.citHeader}>
                  <div>
                    <div className={styles.citTitle}>{c.title}</div>
                    {c.authors && <div style={{ fontSize: 13, color: 'var(--mist)', marginTop: 2 }}>{c.authors} · {c.year}</div>}
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span className={styles.citType}>{c.type}</span>
                    <button className={styles.deleteBtn} onClick={() => deleteCitation(c.id)}>✕</button>
                  </div>
                </div>
                <div className={styles.citFormats}>
                  {[['APA', apa], ['MLA', mla], ['Harvard', harvard]].map(([fmt, text]) => (
                    <div key={fmt} className={styles.formatRow}>
                      <span className={styles.formatLabel}>{fmt}</span>
                      <span className={styles.formatText}>{text}</span>
                      <button className={styles.copyBtn} onClick={() => handleCopy(text, `${c.id}-${fmt}`)}>
                        {copied === `${c.id}-${fmt}` ? '✓' : 'Copy'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
