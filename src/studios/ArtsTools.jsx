import { useState } from 'react'
import { LS } from '../utils'
import s from './StudioTools.module.css'

/* ── Color Theory ── */
const COLOR_THEORY = [
  { name: 'Primary Colours',     desc: 'The building blocks of all colour: Red, Yellow, Blue (RYB) in traditional art; Red, Green, Blue (RGB) in digital work.' },
  { name: 'Secondary Colours',   desc: 'Created by mixing two primaries: Orange (red + yellow), Green (yellow + blue), Violet (blue + red).' },
  { name: 'Tertiary Colours',    desc: 'Mixing a primary with an adjacent secondary: red-orange, yellow-green, blue-violet, etc.' },
  { name: 'Complementary',       desc: 'Colours directly opposite on the colour wheel (e.g. red & green). High contrast, vibrant when placed together.' },
  { name: 'Analogous',           desc: 'Three colours adjacent on the wheel (e.g. blue, blue-green, green). Creates harmony and cohesion.' },
  { name: 'Triadic',             desc: 'Three colours evenly spaced on the wheel. Balanced and vibrant; one colour should dominate.' },
  { name: 'Split-Complementary', desc: 'A colour plus the two neighbours of its complement. Less tension than complementary, more interest than analogous.' },
  { name: 'Hue',                 desc: 'The pure colour itself — the name we give it (red, blue, yellow). The 360° spectrum of the colour wheel.' },
  { name: 'Saturation / Chroma', desc: 'The intensity or purity of a colour. High saturation = vivid; low saturation = muted or grey.' },
  { name: 'Value / Brightness',  desc: 'The lightness or darkness of a colour. Adding white creates a tint; adding black creates a shade.' },
  { name: 'Warm vs Cool',        desc: 'Warm colours (red, orange, yellow) feel energetic and advance. Cool colours (blue, green, violet) feel calm and recede.' },
  { name: 'Colour Temperature',  desc: 'In photography/lighting, measured in Kelvin. ~6500K = daylight (cool blue); ~3000K = candlelight (warm orange).' },
]

/* ── Design Principles ── */
const DESIGN_PRINCIPLES = [
  { name: 'Balance',         icon: '⚖', desc: 'Visual weight distributed evenly — symmetrical (mirror-like), asymmetrical (different weights balancing each other), or radial (from a centre point).' },
  { name: 'Contrast',        icon: '◑', desc: 'The juxtaposition of opposing elements (dark/light, large/small, rough/smooth) to create visual interest and direct attention.' },
  { name: 'Emphasis',        icon: '★', desc: 'Creating a focal point that draws the viewer\'s eye first. Achieved through size, colour, contrast, or placement.' },
  { name: 'Movement',        icon: '→', desc: 'Guiding the viewer\'s eye through the composition via line, shape, colour progression, or implied direction.' },
  { name: 'Pattern',         icon: '⊞', desc: 'Repetition of an element (shape, line, colour) to create rhythm, texture, and visual cohesion.' },
  { name: 'Rhythm',          icon: '♫', desc: 'A sense of organised movement created by repeating elements with deliberate variation — regular, alternating, or progressive.' },
  { name: 'Unity / Harmony', icon: '○', desc: 'A sense of wholeness where all elements feel they belong together. Achieved through repetition, proximity, and consistent style.' },
  { name: 'Proportion',      icon: '📐', desc: 'The size relationship between elements or parts of a composition. The Golden Ratio (1:1.618) is a classical guide.' },
  { name: 'White Space',     icon: '□', desc: 'Negative or empty space that allows elements to breathe. Essential for clarity, elegance, and directing attention.' },
  { name: 'Hierarchy',       icon: '≡', desc: 'Visual organisation showing the relative importance of elements — achieved through size, weight, colour, and position.' },
  { name: 'Texture',         icon: '▦', desc: 'The surface quality of an element — actual (tactile) or implied (visual). Adds depth, richness, and realism.' },
  { name: 'Gestalt Principles', icon: '◉', desc: 'How the brain perceives whole forms: Proximity, Similarity, Closure, Continuity, Figure/Ground, and Common Fate.' },
]

/* ── Project Tracker ── */
function ProjectTracker({ storageKey }) {
  const key = storageKey || 'mls_art_projects'
  const [projects, setProjects] = useState(() => LS.get(key, []))
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', medium: '', status: 'In Progress', deadline: '', notes: '' })
  const [statusFilter, setStatusFilter] = useState('All')

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const save = (updated) => { setProjects(updated); LS.set(key, updated) }

  const add = () => {
    if (!form.title) return
    save([{ id: Date.now(), ...form, created: new Date().toLocaleDateString() }, ...projects])
    setForm({ title: '', medium: '', status: 'In Progress', deadline: '', notes: '' })
    setShowForm(false)
  }

  const statuses = ['All', 'Concept', 'In Progress', 'Review', 'Completed', 'On Hold']
  const statusColors = { Concept: 'var(--mist)', 'In Progress': 'var(--gold)', Review: '#4a9eca', Completed: '#2a9b6e', 'On Hold': '#cd6155' }
  const shown = statusFilter === 'All' ? projects : projects.filter((p) => p.status === statusFilter)

  return (
    <div>
      <div className={s.filterRow}>
        {statuses.map((st) => (
          <button key={st} className={`${s.filterBtn} ${statusFilter === st ? s.filterBtnActive : ''}`} onClick={() => setStatusFilter(st)}>{st}</button>
        ))}
      </div>

      <button className={s.addBtn} onClick={() => setShowForm((v) => !v)}>
        {showForm ? '✕ Cancel' : '+ New Project'}
      </button>

      {showForm && (
        <div className={s.addForm}>
          <div className={s.formGrid}>
            <div className={s.formGridFull}>
              <label className={s.inputLabel}>Project Title *</label>
              <input className={s.input} placeholder="e.g. Abstract Oil Study No. 3" value={form.title} onChange={set('title')} />
            </div>
            <div>
              <label className={s.inputLabel}>Medium / Discipline</label>
              <input className={s.input} placeholder="e.g. Oil on Canvas, UX Design…" value={form.medium} onChange={set('medium')} />
            </div>
            <div>
              <label className={s.inputLabel}>Status</label>
              <select className={s.select} value={form.status} onChange={set('status')}>
                {['Concept','In Progress','Review','Completed','On Hold'].map((st) => <option key={st}>{st}</option>)}
              </select>
            </div>
            <div>
              <label className={s.inputLabel}>Deadline (optional)</label>
              <input className={s.input} type="date" value={form.deadline} onChange={set('deadline')} />
            </div>
            <div className={s.formGridFull}>
              <label className={s.inputLabel}>Notes / Concept</label>
              <textarea className={s.textarea} placeholder="Concept, inspiration, materials needed…" value={form.notes} onChange={set('notes')} />
            </div>
          </div>
          <button className={s.btnPrimary} onClick={add}>Add Project</button>
        </div>
      )}

      <div className={s.itemList}>
        {shown.length === 0 && (
          <div className={s.empty}>
            <div className={s.emptyIcon}>🎨</div>
            <p>{statusFilter === 'All' ? 'No projects yet. Start tracking your creative work above.' : `No projects with status "${statusFilter}".`}</p>
          </div>
        )}
        {shown.map((p) => (
          <div key={p.id} className={s.item}>
            <div className={s.itemBody}>
              <div className={s.itemTitle}>{p.title}</div>
              <div className={s.itemMeta}>
                {p.medium && <span>{p.medium}</span>}
                {p.deadline && <span style={{ marginLeft: 8 }}>Due: {new Date(p.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>}
              </div>
              {p.notes && <div style={{ fontSize: 12, color: 'var(--mist)', marginTop: 6, lineHeight: 1.5 }}>{p.notes}</div>}
            </div>
            <div className={s.itemActions} style={{ flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
              <span className={s.badge} style={{ color: statusColors[p.status], borderColor: statusColors[p.status], whiteSpace: 'nowrap' }}>{p.status}</span>
              <button className={s.btnSmall} onClick={() => save(projects.filter((x) => x.id !== p.id))}>✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ArtsTools({ storageKey }) {
  const [tab, setTab] = useState('projects')

  return (
    <div>
      <div className={s.tabs}>
        {[['projects','🎨 Projects'], ['color','🎨 Colour Theory'], ['design','📐 Design Principles']].map(([id, label]) => (
          <button key={id} className={`${s.tab} ${tab === id ? s.tabActive : ''}`} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>

      {tab === 'projects' && (
        <div className={s.panel}>
          <ProjectTracker storageKey={storageKey ? `${storageKey}_projects` : undefined} />
        </div>
      )}

      {tab === 'color' && (
        <div className={s.panel}>
          <div className={s.refGrid}>
            {COLOR_THEORY.map((c, i) => (
              <div key={i} className={s.refCard}>
                <div className={s.refCardTitle}>{c.name}</div>
                <div className={s.refCardDesc}>{c.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'design' && (
        <div className={s.panel}>
          <div className={s.refGrid}>
            {DESIGN_PRINCIPLES.map((d, i) => (
              <div key={i} className={s.refCard}>
                <div className={s.refCardTitle}>
                  <span style={{ marginRight: 8 }}>{d.icon}</span>{d.name}
                </div>
                <div className={s.refCardDesc}>{d.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
