import { useState } from 'react'
import { useUserData } from '../hooks/useUserData'
import s from './StudioTools.module.css'

/* ── Philosophers Reference ── */
const PHILOSOPHERS = [
  { name: 'Socrates',       era: '470–399 BC', school: 'Classical Greek', ideas: 'The Socratic method, self-knowledge ("know thyself"), the examined life. Argued virtue is knowledge.', quote: '"The unexamined life is not worth living."' },
  { name: 'Plato',          era: '428–348 BC', school: 'Platonism',       ideas: 'Theory of Forms, philosopher-kings, the allegory of the cave. Reality is a shadow of ideal Forms.', quote: '"Courage is knowing what not to fear."' },
  { name: 'Aristotle',      era: '384–322 BC', school: 'Peripatetic',     ideas: 'Logic, ethics (eudaimonia), metaphysics, politics. Virtue as the golden mean between extremes.', quote: '"We are what we repeatedly do."' },
  { name: 'Epicurus',       era: '341–270 BC', school: 'Epicureanism',    ideas: 'Pleasure as the highest good; ataraxia (tranquility) and aponia (freedom from pain) as ideals.', quote: '"Death is nothing to us."' },
  { name: 'Marcus Aurelius',era: '121–180 AD', school: 'Stoicism',        ideas: "Stoic duty, logos, living according to nature and reason. Emperor-philosopher's meditations.", quote: '"You have power over your mind, not outside events."' },
  { name: 'René Descartes', era: '1596–1650',  school: 'Rationalism',     ideas: 'Cogito ergo sum. Dualism of mind and body. Methodological doubt as the path to certain knowledge.', quote: '"I think, therefore I am."' },
  { name: 'John Locke',     era: '1632–1704',  school: 'Empiricism',      ideas: 'Tabula rasa — mind as blank slate. Social contract, natural rights, and the origin of government.', quote: `"No man's knowledge can go beyond his experience."` },
  { name: 'David Hume',     era: '1711–1776',  school: 'Empiricism',      ideas: 'Scepticism about causation and induction. Emotions, not reason, drive human behaviour.', quote: '"Reason is the slave of the passions."' },
  { name: 'Immanuel Kant',  era: '1724–1804',  school: 'Critical Philosophy', ideas: 'Categorical imperative: act only by maxims you could universalise. Space/time as mental constructs.', quote: '"Act only according to that maxim by which you can also will that it become universal law."' },
  { name: 'G.W.F. Hegel',   era: '1770–1831',  school: 'German Idealism', ideas: 'Dialectic (thesis/antithesis/synthesis). History as the self-unfolding of Absolute Spirit.', quote: '"What is rational is real; what is real is rational."' },
  { name: 'Karl Marx',      era: '1818–1883',  school: 'Marxism',         ideas: 'Historical materialism, class struggle, alienation. Religion as the opium of the masses.', quote: '"Philosophers have only interpreted the world; the point is to change it."' },
  { name: 'Friedrich Nietzsche', era: '1844–1900', school: 'Existentialism', ideas: 'Will to power, the Übermensch, eternal recurrence. "God is dead" — a call to create new values.', quote: '"That which does not kill us makes us stronger."' },
  { name: 'Jean-Paul Sartre',era: '1905–1980', school: 'Existentialism',  ideas: 'Existence precedes essence — we create our own meaning. Radical freedom and radical responsibility.', quote: '"Man is condemned to be free."' },
  { name: 'Simone de Beauvoir', era: '1908–1986', school: 'Feminist Philosophy', ideas: 'One is not born, but becomes, a woman. Situated freedom; oppression as social construction.', quote: '"One is not born a woman, but becomes one."' },
]

const SCHOOLS = ['All', 'Classical Greek', 'Platonism', 'Peripatetic', 'Stoicism', 'Epicureanism', 'Rationalism', 'Empiricism', 'Critical Philosophy', 'German Idealism', 'Marxism', 'Existentialism', 'Feminist Philosophy']

/* ── Argument Builder ── */
function ArgumentBuilder({ storageKey }) {
  const key = storageKey || 'mls_arguments'
  const [args, setArgs] = useUserData(key, [])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', premises: ['', ''], conclusion: '' })

  const addArg = () => {
    if (!form.title || !form.conclusion) return
    const a = { id: Date.now(), ...form, premises: form.premises.filter((p) => p.trim()) }
    setArgs([a, ...args])
    setForm({ title: '', premises: ['', ''], conclusion: '' })
    setShowForm(false)
  }

  const setPremise = (i, val) => setForm((f) => {
    const p = [...f.premises]
    p[i] = val
    return { ...f, premises: p }
  })

  return (
    <div>
      <button className={s.addBtn} onClick={() => setShowForm((v) => !v)}>
        {showForm ? '✕ Cancel' : '+ New Argument'}
      </button>

      {showForm && (
        <div className={s.addForm}>
          <div className={s.formGrid}>
            <div className={s.formGridFull}>
              <label className={s.inputLabel}>Argument Title</label>
              <input className={s.input} placeholder="e.g. The Problem of Evil" value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label className={s.inputLabel} style={{ display: 'block', marginBottom: 8 }}>Premises</label>
            {form.premises.map((p, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                <span className={s.premiseNum}>{i + 1}.</span>
                <input className={s.input} placeholder={`Premise ${i + 1}…`} value={p} onChange={(e) => setPremise(i, e.target.value)} />
                {form.premises.length > 2 && (
                  <button className={s.btnSmall} onClick={() => setForm((f) => ({ ...f, premises: f.premises.filter((_, pi) => pi !== i) }))}>✕</button>
                )}
              </div>
            ))}
            <button className={s.filterBtn} style={{ marginTop: 4 }}
              onClick={() => setForm((f) => ({ ...f, premises: [...f.premises, ''] }))}>+ Add Premise</button>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label className={s.inputLabel} style={{ display: 'block', marginBottom: 6 }}>Conclusion</label>
            <input className={s.input} placeholder="Therefore…" value={form.conclusion}
              onChange={(e) => setForm((f) => ({ ...f, conclusion: e.target.value }))} />
          </div>
          <button className={s.btnPrimary} onClick={addArg}>Save Argument</button>
        </div>
      )}

      <div className={s.itemList}>
        {args.length === 0 && (
          <div className={s.empty}>
            <div className={s.emptyIcon}>⚖</div>
            <p>No arguments yet. Build your first logical argument above.</p>
          </div>
        )}
        {args.map((a) => (
          <div key={a.id} className={s.argCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--cream)' }}>{a.title}</div>
              <button className={s.btnSmall} onClick={() => setArgs(args.filter((x) => x.id !== a.id))}>✕</button>
            </div>
            <div className={s.premiseList}>
              {a.premises.map((p, i) => (
                <div key={i} className={s.premiseItem}>
                  <span className={s.premiseNum}>P{i + 1}.</span>
                  <span>{p}</span>
                </div>
              ))}
            </div>
            <div className={s.conclusion}>∴ {a.conclusion}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function PhilosophyTools({ storageKey }) {
  const [tab, setTab] = useState('philosophers')
  const [school, setSchool] = useState('All')
  const [search, setSearch] = useState('')

  const filtered = PHILOSOPHERS.filter((p) => {
    const matchSchool = school === 'All' || p.school === school
    const matchSearch = !search.trim() || p.name.toLowerCase().includes(search.toLowerCase()) || p.ideas.toLowerCase().includes(search.toLowerCase())
    return matchSchool && matchSearch
  })

  return (
    <div>
      <div className={s.tabs}>
        {[['philosophers','🏛 Philosophers'], ['arguments','⚖ Argument Builder']].map(([id, label]) => (
          <button key={id} className={`${s.tab} ${tab === id ? s.tabActive : ''}`} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>

      {tab === 'philosophers' && (
        <div className={s.panel}>
          <input className={s.searchBar} placeholder="Search philosophers or ideas…" value={search}
            onChange={(e) => setSearch(e.target.value)} />
          <div className={s.filterRow} style={{ overflowX: 'auto', flexWrap: 'nowrap', paddingBottom: 4 }}>
            {SCHOOLS.map((sc) => (
              <button key={sc} className={`${s.filterBtn} ${school === sc ? s.filterBtnActive : ''}`}
                onClick={() => setSchool(sc)} style={{ whiteSpace: 'nowrap' }}>{sc}</button>
            ))}
          </div>
          <div className={s.refGrid}>
            {filtered.map((p, i) => (
              <div key={i} className={s.refCard}>
                <div className={s.refCardTitle}>{p.name}</div>
                <div style={{ fontSize: 11, color: 'var(--accent, var(--gold))', marginBottom: 6, letterSpacing: '0.05em' }}>
                  {p.era} · {p.school}
                </div>
                <div className={s.refCardDesc} style={{ marginBottom: 10 }}>{p.ideas}</div>
                <div style={{ fontSize: 12, fontStyle: 'italic', color: 'var(--mist)', borderLeft: '2px solid var(--accent, var(--gold))', paddingLeft: 10 }}>
                  {p.quote}
                </div>
              </div>
            ))}
            {filtered.length === 0 && <div className={s.empty}>No philosophers match your search.</div>}
          </div>
        </div>
      )}

      {tab === 'arguments' && (
        <div className={s.panel}>
          <ArgumentBuilder storageKey={storageKey ? `${storageKey}_arguments` : undefined} />
        </div>
      )}
    </div>
  )
}
