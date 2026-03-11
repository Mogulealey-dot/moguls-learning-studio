import { useState } from 'react'
import { LS } from '../utils'
import s from './StudioTools.module.css'

/* ── Key Historical Figures ── */
const FIGURES = [
  { name: 'Julius Caesar',     era: '100–44 BC',  region: 'Rome',      role: 'Statesman & General',  impact: 'Transformed the Roman Republic into an empire. His assassination triggered civil wars and the rise of Augustus.' },
  { name: 'Alexander the Great', era: '356–323 BC', region: 'Greece/Persia', role: 'King & Conqueror', impact: 'Created one of the largest empires in history, spreading Greek culture from Egypt to India (Hellenism).' },
  { name: 'Cleopatra VII',      era: '69–30 BC',   region: 'Egypt',     role: 'Pharaoh & Diplomat',   impact: 'Last active ruler of the Ptolemaic Kingdom. Used political alliances with Caesar and Antony to preserve Egyptian sovereignty.' },
  { name: 'Genghis Khan',       era: '1162–1227',  region: 'Mongolia',  role: 'Conqueror',            impact: 'United Mongol tribes and founded the largest contiguous land empire in history. Enabled Silk Road trade and cultural exchange.' },
  { name: 'Leonardo da Vinci',  era: '1452–1519',  region: 'Italy',     role: 'Artist & Polymath',    impact: 'Epitomised the Renaissance ideal. Pioneered anatomy, engineering, and art, leaving an unmatched intellectual legacy.' },
  { name: 'Christopher Columbus',era:'1451–1506',  region: 'Spain/Americas', role: 'Explorer',        impact: 'Initiated sustained contact between Europe and the Americas in 1492, triggering the Columbian Exchange and colonialism.' },
  { name: 'Martin Luther',      era: '1483–1546',  region: 'Germany',   role: 'Theologian',           impact: 'Challenged papal authority with his 95 Theses, sparking the Protestant Reformation and reshaping Western Christianity.' },
  { name: 'Isaac Newton',       era: '1643–1727',  region: 'England',   role: 'Scientist & Philosopher', impact: 'Formulated laws of motion and universal gravitation. Co-invented calculus. Founded modern physics.' },
  { name: 'Napoleon Bonaparte', era: '1769–1821',  region: 'France',    role: 'Emperor & General',    impact: 'Modernised French law (Napoleonic Code), redrew European borders, and spread revolutionary ideals across the continent.' },
  { name: 'Abraham Lincoln',    era: '1809–1865',  region: 'USA',       role: 'President',            impact: 'Led the Union through the Civil War, abolished slavery with the Emancipation Proclamation, and preserved the United States.' },
  { name: 'Karl Marx',          era: '1818–1883',  region: 'Germany',   role: 'Philosopher & Economist', impact: 'Co-authored The Communist Manifesto. His analysis of capitalism and class struggle shaped 20th-century socialist movements.' },
  { name: 'Charles Darwin',     era: '1809–1882',  region: 'England',   role: 'Naturalist',           impact: 'Proposed the theory of evolution by natural selection in "On the Origin of Species" (1859), revolutionising biology.' },
  { name: 'Mahatma Gandhi',     era: '1869–1948',  region: 'India',     role: 'Independence Leader',  impact: 'Led India to independence through nonviolent civil disobedience, inspiring movements for civil rights worldwide.' },
  { name: 'Winston Churchill',  era: '1874–1965',  region: 'UK',        role: 'Prime Minister',       impact: 'Led Britain during WWII. His speeches and determination were pivotal in the Allied victory against Nazi Germany.' },
  { name: 'Nelson Mandela',     era: '1918–2013',  region: 'S. Africa', role: 'President & Activist',  impact: 'Spent 27 years imprisoned for opposing apartheid, then led South Africa\'s first multiracial elections in 1994.' },
  { name: 'Mao Zedong',         era: '1893–1976',  region: 'China',     role: 'Revolutionary Leader', impact: 'Founded the People\'s Republic of China in 1949. His policies, including the Cultural Revolution, had vast and complex impacts.' },
]

const REGIONS = ['All', 'Rome', 'Greece/Persia', 'Egypt', 'Mongolia', 'Italy', 'Spain/Americas', 'Germany', 'England', 'France', 'USA', 'India', 'UK', 'S. Africa', 'China']

/* ── Timeline Builder ── */
function TimelineBuilder({ storageKey }) {
  const key = storageKey || 'mls_timeline'
  const [events, setEvents] = useState(() => LS.get(key, []))
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ year: '', title: '', desc: '', category: 'Political' })
  const [catFilter, setCatFilter] = useState('All')

  const cats = ['All', 'Political', 'Military', 'Scientific', 'Cultural', 'Economic', 'Social']
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const save = (updated) => { setEvents(updated); LS.set(key, updated) }

  const add = () => {
    if (!form.year || !form.title) return
    save([...events, { id: Date.now(), ...form }].sort((a, b) => parseInt(a.year) - parseInt(b.year)))
    setForm({ year: '', title: '', desc: '', category: 'Political' })
    setShowForm(false)
  }

  const catColors = { Political: '#cd6155', Military: '#c9a84c', Scientific: '#4a9eca', Cultural: '#9b7fd4', Economic: '#2ecc71', Social: '#e74c8b' }
  const shown = catFilter === 'All' ? events : events.filter((e) => e.category === catFilter)

  return (
    <div>
      <div className={s.filterRow}>
        {cats.map((c) => (
          <button key={c} className={`${s.filterBtn} ${catFilter === c ? s.filterBtnActive : ''}`} onClick={() => setCatFilter(c)}>{c}</button>
        ))}
      </div>

      <button className={s.addBtn} onClick={() => setShowForm((v) => !v)}>
        {showForm ? '✕ Cancel' : '+ Add Event'}
      </button>

      {showForm && (
        <div className={s.addForm}>
          <div className={s.formGrid}>
            <div>
              <label className={s.inputLabel}>Year / Date</label>
              <input className={s.input} placeholder="e.g. 1776 or 1945–09–02" value={form.year} onChange={set('year')} />
            </div>
            <div>
              <label className={s.inputLabel}>Category</label>
              <select className={s.select} value={form.category} onChange={set('category')}>
                {['Political','Military','Scientific','Cultural','Economic','Social'].map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className={s.formGridFull}>
              <label className={s.inputLabel}>Event Title</label>
              <input className={s.input} placeholder="e.g. American Declaration of Independence" value={form.title} onChange={set('title')} />
            </div>
            <div className={s.formGridFull}>
              <label className={s.inputLabel}>Description</label>
              <textarea className={s.textarea} placeholder="Key details, causes, consequences…" value={form.desc} onChange={set('desc')} />
            </div>
          </div>
          <button className={s.btnPrimary} onClick={add}>Add to Timeline</button>
        </div>
      )}

      {shown.length === 0 ? (
        <div className={s.empty}>
          <div className={s.emptyIcon}>🌍</div>
          <p>{catFilter === 'All' ? 'No events yet. Add your first historical event above.' : `No ${catFilter} events in your timeline.`}</p>
        </div>
      ) : (
        <div className={s.timeline} style={{ marginTop: 24 }}>
          {shown.map((ev) => (
            <div key={ev.id} className={s.timelineItem}>
              <div className={s.timelineDot} style={{ borderColor: catColors[ev.category] || 'var(--gold)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div className={s.timelineYear}>{ev.year}</div>
                  <div className={s.timelineTitle}>{ev.title}</div>
                  {ev.desc && <div className={s.timelineDesc}>{ev.desc}</div>}
                  <span className={s.timelineCat} style={{ color: catColors[ev.category] || 'var(--gold)' }}>{ev.category}</span>
                </div>
                <button className={s.btnSmall} style={{ flexShrink: 0, marginLeft: 12 }}
                  onClick={() => save(events.filter((x) => x.id !== ev.id))}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function HistoryTools({ storageKey }) {
  const [tab, setTab] = useState('timeline')
  const [region, setRegion] = useState('All')
  const [search, setSearch] = useState('')

  const shown = FIGURES.filter((f) => {
    const matchRegion = region === 'All' || f.region === region
    const matchSearch = !search.trim() || f.name.toLowerCase().includes(search.toLowerCase()) || f.impact.toLowerCase().includes(search.toLowerCase())
    return matchRegion && matchSearch
  })

  return (
    <div>
      <div className={s.tabs}>
        {[['timeline','📅 Timeline Builder'], ['figures','🌍 Key Figures']].map(([id, label]) => (
          <button key={id} className={`${s.tab} ${tab === id ? s.tabActive : ''}`} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>

      {tab === 'timeline' && (
        <div className={s.panel}>
          <TimelineBuilder storageKey={storageKey ? `${storageKey}_timeline` : undefined} />
        </div>
      )}

      {tab === 'figures' && (
        <div className={s.panel}>
          <input className={s.searchBar} placeholder="Search figures or their impact…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <div className={s.filterRow} style={{ flexWrap: 'wrap' }}>
            {REGIONS.map((r) => (
              <button key={r} className={`${s.filterBtn} ${region === r ? s.filterBtnActive : ''}`}
                onClick={() => setRegion(r)} style={{ whiteSpace: 'nowrap' }}>{r}</button>
            ))}
          </div>
          <div className={s.refGrid}>
            {shown.map((f, i) => (
              <div key={i} className={s.refCard}>
                <div className={s.refCardTitle}>{f.name}</div>
                <div style={{ fontSize: 11, color: 'var(--accent, var(--gold))', marginBottom: 6, letterSpacing: '0.05em' }}>
                  {f.era} · {f.region} · {f.role}
                </div>
                <div className={s.refCardDesc}>{f.impact}</div>
              </div>
            ))}
            {shown.length === 0 && <div className={s.empty}>No figures match your search.</div>}
          </div>
        </div>
      )}
    </div>
  )
}
