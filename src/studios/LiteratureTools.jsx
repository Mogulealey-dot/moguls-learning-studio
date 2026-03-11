import { useState } from 'react'
import { LS } from '../utils'
import s from './StudioTools.module.css'

/* ── Literary Devices ── */
const DEVICES = [
  { name: 'Alliteration',   def: 'Repetition of the same consonant sound at the beginning of nearby words.', example: '"Peter Piper picked a peck of pickled peppers."' },
  { name: 'Allusion',       def: 'An indirect reference to a person, place, event, or literary work.', example: '"He was a real Romeo with the ladies."' },
  { name: 'Anachronism',    def: 'Something placed in the wrong historical or chronological period.', example: 'A character using a smartphone in a Victorian novel.' },
  { name: 'Anaphora',       def: 'Repetition of a word or phrase at the beginning of successive clauses.', example: '"We shall fight on the beaches, we shall fight on the landing grounds…"' },
  { name: 'Antithesis',     def: 'Juxtaposition of contrasting ideas in parallel structure.', example: '"It was the best of times, it was the worst of times."' },
  { name: 'Archetype',      def: 'A recurring symbol, character, theme, or setting that embodies universal patterns.', example: 'The Hero, the Shadow, the Trickster.' },
  { name: 'Chiasmus',       def: 'A rhetorical device where the second half of an expression reverses the structure of the first.', example: '"Ask not what your country can do for you, but what you can do for your country."' },
  { name: 'Dramatic Irony', def: 'When the audience knows something that a character does not.', example: "Romeo does not know Juliet is alive when he drinks the poison." },
  { name: 'Enjambment',     def: 'The continuation of a sentence across a line break without a pause.', example: '"I think that I shall never see / A poem lovely as a tree."' },
  { name: 'Euphemism',      def: 'A mild or indirect expression used in place of a harsh or blunt one.', example: '"Passed away" instead of "died".' },
  { name: 'Foil',           def: 'A character who contrasts with another character to highlight particular qualities.', example: 'Draco Malfoy as a foil to Harry Potter.' },
  { name: 'Hyperbole',      def: 'Extreme exaggeration used for emphasis or effect.', example: '"I\'ve told you a million times."' },
  { name: 'Imagery',        def: 'Vivid descriptive language that appeals to the senses.', example: '"The golden sun melted into the horizon like butter on warm toast."' },
  { name: 'Irony',          def: 'A contrast between expectation and reality.', example: '"A fire station burning down."' },
  { name: 'Juxtaposition',  def: 'Placing two elements side by side to highlight their differences.', example: '"It was the best of times, it was the worst of times."' },
  { name: 'Metaphor',       def: 'A direct comparison between two unlike things without using "like" or "as".', example: '"Life is a journey."' },
  { name: 'Motif',          def: 'A recurring element that has symbolic significance in a story.', example: 'The green light in The Great Gatsby representing Gatsby\'s dreams.' },
  { name: 'Onomatopoeia',   def: 'A word that phonetically imitates the sound it describes.', example: '"Buzz", "crash", "sizzle", "hiss".' },
  { name: 'Oxymoron',       def: 'A figure of speech that combines two contradictory terms.', example: '"Deafening silence", "bittersweet".' },
  { name: 'Paradox',        def: 'A statement that seems self-contradictory but contains a truth.', example: '"The more you know, the more you realise you don\'t know."' },
  { name: 'Personification',def: 'Giving human qualities to non-human things.', example: '"The wind howled through the night."' },
  { name: 'Satire',         def: 'The use of humour, irony, or exaggeration to critique society or individuals.', example: 'Jonathan Swift\'s A Modest Proposal.' },
  { name: 'Simile',         def: 'A comparison using "like" or "as".', example: '"He fought like a lion."' },
  { name: 'Soliloquy',      def: 'A dramatic device where a character speaks their thoughts aloud to the audience.', example: '"To be, or not to be, that is the question." (Hamlet)' },
  { name: 'Symbolism',      def: 'The use of symbols to represent ideas or qualities beyond their literal meaning.', example: 'The dove as a symbol of peace; the colour red for passion or danger.' },
  { name: 'Synecdoche',     def: 'A part of something used to represent the whole (or vice versa).', example: '"All hands on deck" — hands representing sailors.' },
  { name: 'Tone',           def: 'The author\'s attitude toward the subject or audience, conveyed through word choice and style.', example: 'A satirical, melancholic, or celebratory tone.' },
]

/* ── Book Tracker ── */
function BookTracker({ storageKey }) {
  const key = storageKey || 'mls_books'
  const [books, setBooks] = useState(() => LS.get(key, []))
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', author: '', status: 'Reading', genre: '', rating: '5', notes: '' })
  const [statusFilter, setStatusFilter] = useState('All')

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const save = (updated) => { setBooks(updated); LS.set(key, updated) }

  const add = () => {
    if (!form.title) return
    save([{ id: Date.now(), ...form, added: new Date().toLocaleDateString() }, ...books])
    setForm({ title: '', author: '', status: 'Reading', genre: '', rating: '5', notes: '' })
    setShowForm(false)
  }

  const statuses = ['All', 'Reading', 'Completed', 'To Read', 'Abandoned']
  const shown = statusFilter === 'All' ? books : books.filter((b) => b.status === statusFilter)

  const statusColor = { Reading: 'var(--gold)', Completed: '#2a9b6e', 'To Read': 'var(--mist)', Abandoned: 'var(--crimson)' }

  return (
    <div>
      <div className={s.filterRow}>
        {statuses.map((st) => (
          <button key={st} className={`${s.filterBtn} ${statusFilter === st ? s.filterBtnActive : ''}`} onClick={() => setStatusFilter(st)}>{st}</button>
        ))}
      </div>

      <button className={s.addBtn} onClick={() => setShowForm((v) => !v)}>
        {showForm ? '✕ Cancel' : '+ Add Book'}
      </button>

      {showForm && (
        <div className={s.addForm}>
          <div className={s.formGrid}>
            <div style={{ gridColumn: '1/-1' }}>
              <label className={s.inputLabel}>Title *</label>
              <input className={s.input} placeholder="Book title…" value={form.title} onChange={set('title')} />
            </div>
            <div>
              <label className={s.inputLabel}>Author</label>
              <input className={s.input} placeholder="Author name…" value={form.author} onChange={set('author')} />
            </div>
            <div>
              <label className={s.inputLabel}>Genre</label>
              <input className={s.input} placeholder="e.g. Literary Fiction…" value={form.genre} onChange={set('genre')} />
            </div>
            <div>
              <label className={s.inputLabel}>Status</label>
              <select className={s.select} value={form.status} onChange={set('status')}>
                {['Reading','Completed','To Read','Abandoned'].map((st) => <option key={st}>{st}</option>)}
              </select>
            </div>
            <div>
              <label className={s.inputLabel}>Rating (1–5)</label>
              <select className={s.select} value={form.rating} onChange={set('rating')}>
                {['1','2','3','4','5'].map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <label className={s.inputLabel}>Notes</label>
              <textarea className={s.textarea} placeholder="Thoughts, key themes, quotes…" value={form.notes} onChange={set('notes')} />
            </div>
          </div>
          <button className={s.btnPrimary} onClick={add}>Add Book</button>
        </div>
      )}

      <div className={s.itemList}>
        {shown.length === 0 && (
          <div className={s.empty}>
            <div className={s.emptyIcon}>📖</div>
            <p>{statusFilter === 'All' ? 'No books yet. Add your first book above.' : `No books with status "${statusFilter}".`}</p>
          </div>
        )}
        {shown.map((b) => (
          <div key={b.id} className={s.item}>
            <div className={s.itemBody}>
              <div className={s.itemTitle}>{b.title}</div>
              <div className={s.itemMeta}>
                {b.author && <span>{b.author}</span>}
                {b.genre && <span style={{ marginLeft: 8, opacity: 0.7 }}>{b.genre}</span>}
                <span className={s.stars} style={{ marginLeft: 8 }}>{'★'.repeat(parseInt(b.rating))}{'☆'.repeat(5 - parseInt(b.rating))}</span>
              </div>
              {b.notes && <div style={{ fontSize: 12, color: 'var(--mist)', marginTop: 6, lineHeight: 1.5 }}>{b.notes}</div>}
            </div>
            <div className={s.itemActions} style={{ flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
              <span className={s.badge} style={{ color: statusColor[b.status], borderColor: statusColor[b.status] }}>{b.status}</span>
              <button className={s.btnSmall} onClick={() => save(books.filter((x) => x.id !== b.id))}>✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Essay Outline ── */
function EssayOutline() {
  const [title, setTitle] = useState('')
  const [thesis, setThesis] = useState('')
  const [body, setBody] = useState([
    { point: '', evidence: '', analysis: '' },
    { point: '', evidence: '', analysis: '' },
    { point: '', evidence: '', analysis: '' },
  ])
  const [conclusion, setConclusion] = useState('')

  const update = (i, k, v) => setBody((b) => b.map((row, ri) => ri === i ? { ...row, [k]: v } : row))

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <label className={s.inputLabel} style={{ display: 'block', marginBottom: 6 }}>Essay Title</label>
        <input className={s.input} placeholder="Enter essay title…" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div style={{ marginBottom: 20 }}>
        <label className={s.inputLabel} style={{ display: 'block', marginBottom: 6 }}>Thesis Statement</label>
        <textarea className={s.textarea} placeholder="Your central argument or claim…" value={thesis} onChange={(e) => setThesis(e.target.value)} />
      </div>
      <div className={s.categoryLabel}>Body Paragraphs</div>
      {body.map((row, i) => (
        <div key={i} className={s.refCard} style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: 'var(--accent, var(--gold))', marginBottom: 10 }}>Paragraph {i + 1}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div>
              <label className={s.inputLabel}>Topic Sentence / Main Point</label>
              <input className={s.input} style={{ marginTop: 4 }} placeholder="Main argument of this paragraph…" value={row.point} onChange={(e) => update(i, 'point', e.target.value)} />
            </div>
            <div>
              <label className={s.inputLabel}>Evidence / Quotation</label>
              <input className={s.input} style={{ marginTop: 4 }} placeholder="Supporting evidence or quote…" value={row.evidence} onChange={(e) => update(i, 'evidence', e.target.value)} />
            </div>
            <div>
              <label className={s.inputLabel}>Analysis / Commentary</label>
              <textarea className={s.textarea} style={{ minHeight: 60, marginTop: 4 }} placeholder="Explain how the evidence supports your point…" value={row.analysis} onChange={(e) => update(i, 'analysis', e.target.value)} />
            </div>
          </div>
        </div>
      ))}
      <button className={s.filterBtn} style={{ marginBottom: 20 }}
        onClick={() => setBody((b) => [...b, { point: '', evidence: '', analysis: '' }])}>+ Add Paragraph</button>
      <div>
        <label className={s.inputLabel} style={{ display: 'block', marginBottom: 6 }}>Conclusion</label>
        <textarea className={s.textarea} placeholder="Restate thesis, summarise main points, broader significance…" value={conclusion} onChange={(e) => setConclusion(e.target.value)} />
      </div>
    </div>
  )
}

export default function LiteratureTools({ storageKey }) {
  const [tab, setTab] = useState('books')
  const [search, setSearch] = useState('')

  const shown = search.trim()
    ? DEVICES.filter((d) => d.name.toLowerCase().includes(search.toLowerCase()) || d.def.toLowerCase().includes(search.toLowerCase()))
    : DEVICES

  return (
    <div>
      <div className={s.tabs}>
        {[['books','📚 Book Tracker'], ['devices','✍ Literary Devices'], ['essay','📝 Essay Outline']].map(([id, label]) => (
          <button key={id} className={`${s.tab} ${tab === id ? s.tabActive : ''}`} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>

      {tab === 'books' && (
        <div className={s.panel}>
          <BookTracker storageKey={storageKey ? `${storageKey}_books` : undefined} />
        </div>
      )}

      {tab === 'devices' && (
        <div className={s.panel}>
          <input className={s.searchBar} placeholder="Search literary devices…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <div className={s.refGrid}>
            {shown.map((d, i) => (
              <div key={i} className={s.refCard}>
                <div className={s.refCardTitle}>{d.name}</div>
                <div className={s.refCardDesc} style={{ marginBottom: 8 }}>{d.def}</div>
                <div style={{ fontSize: 12, fontStyle: 'italic', color: 'var(--accent, var(--gold))', borderLeft: '2px solid var(--accent, var(--gold))', paddingLeft: 8 }}>
                  {d.example}
                </div>
              </div>
            ))}
            {shown.length === 0 && <div className={s.empty}>No devices match "{search}".</div>}
          </div>
        </div>
      )}

      {tab === 'essay' && (
        <div className={s.panel}>
          <EssayOutline />
        </div>
      )}
    </div>
  )
}
