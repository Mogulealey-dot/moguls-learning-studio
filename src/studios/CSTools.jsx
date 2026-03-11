import { useState } from 'react'
import s from './StudioTools.module.css'

/* ── Big-O Data ── */
const COMPLEXITY = [
  { name: 'Binary Search',      best: 'O(1)', avg: 'O(log n)', worst: 'O(log n)', space: 'O(1)',     type: 'Search' },
  { name: 'Linear Search',      best: 'O(1)', avg: 'O(n)',     worst: 'O(n)',     space: 'O(1)',     type: 'Search' },
  { name: 'Bubble Sort',        best: 'O(n)', avg: 'O(n²)',    worst: 'O(n²)',    space: 'O(1)',     type: 'Sort' },
  { name: 'Selection Sort',     best: 'O(n²)',avg: 'O(n²)',    worst: 'O(n²)',    space: 'O(1)',     type: 'Sort' },
  { name: 'Insertion Sort',     best: 'O(n)', avg: 'O(n²)',    worst: 'O(n²)',    space: 'O(1)',     type: 'Sort' },
  { name: 'Merge Sort',         best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)', space: 'O(n)', type: 'Sort' },
  { name: 'Quick Sort',         best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n²)',      space: 'O(log n)', type: 'Sort' },
  { name: 'Heap Sort',          best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)', space: 'O(1)', type: 'Sort' },
  { name: 'BFS',                best: 'O(V+E)', avg: 'O(V+E)', worst: 'O(V+E)',  space: 'O(V)',    type: 'Graph' },
  { name: 'DFS',                best: 'O(V+E)', avg: 'O(V+E)', worst: 'O(V+E)',  space: 'O(V)',    type: 'Graph' },
  { name: "Dijkstra's",         best: 'O(E log V)', avg: 'O(E log V)', worst: 'O(E log V)', space: 'O(V)', type: 'Graph' },
  { name: 'Dynamic Programming',best: 'O(n)',  avg: 'O(n)',    worst: 'O(n²)',    space: 'O(n)',    type: 'Technique' },
]

const DATA_STRUCTURES = [
  { name: 'Array',        access: 'O(1)',     search: 'O(n)',     insert: 'O(n)',     delete: 'O(n)',     space: 'O(n)',    desc: 'Contiguous block of memory. Fast access by index.' },
  { name: 'Linked List',  access: 'O(n)',     search: 'O(n)',     insert: 'O(1)',     delete: 'O(1)',     space: 'O(n)',    desc: 'Nodes with pointers. Fast insert/delete at head.' },
  { name: 'Stack',        access: 'O(n)',     search: 'O(n)',     insert: 'O(1)',     delete: 'O(1)',     space: 'O(n)',    desc: 'LIFO structure. Push and pop from the top.' },
  { name: 'Queue',        access: 'O(n)',     search: 'O(n)',     insert: 'O(1)',     delete: 'O(1)',     space: 'O(n)',    desc: 'FIFO structure. Enqueue at back, dequeue at front.' },
  { name: 'Hash Table',   access: 'O(1)*',    search: 'O(1)*',    insert: 'O(1)*',    delete: 'O(1)*',    space: 'O(n)',    desc: 'Key-value store. O(n) worst case with collisions.' },
  { name: 'Binary Tree',  access: 'O(log n)*',search: 'O(log n)*',insert: 'O(log n)*',delete: 'O(log n)*',space: 'O(n)',   desc: 'Hierarchical structure. O(n) worst on unbalanced tree.' },
  { name: 'Heap',         access: 'O(n)',     search: 'O(n)',     insert: 'O(log n)', delete: 'O(log n)', space: 'O(n)',    desc: 'Priority queue. Min/max at root in O(1).' },
  { name: 'Trie',         access: 'O(k)',     search: 'O(k)',     insert: 'O(k)',     delete: 'O(k)',     space: 'O(n·k)', desc: 'k = key length. Excellent for prefix searches.' },
  { name: 'Graph',        access: 'O(1)',     search: 'O(V+E)',   insert: 'O(1)',     delete: 'O(E)',     space: 'O(V+E)', desc: 'Vertices + edges. Flexible structure for networks.' },
]

/* ── Base Converter ── */
function BaseConverter() {
  const [input, setInput] = useState('')
  const [fromBase, setFromBase] = useState('10')

  const decimal = (() => {
    const v = input.trim()
    if (!v) return null
    try {
      const n = parseInt(v, parseInt(fromBase))
      return isNaN(n) ? null : n
    } catch { return null }
  })()

  const bases = [
    { label: 'Decimal (10)',  base: 10, prefix: '' },
    { label: 'Binary (2)',    base: 2,  prefix: '0b' },
    { label: 'Octal (8)',     base: 8,  prefix: '0o' },
    { label: 'Hexadecimal (16)', base: 16, prefix: '0x' },
  ]

  function colorClass(c) {
    if (c === 'O(1)') return s.badgeGreen
    if (c.includes('log')) return s.badgeYellow
    return s.badgeRed
  }

  return (
    <div>
      <div className={s.converterGrid} style={{ gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className={s.inputGroup}>
          <label className={s.inputLabel}>Input Value</label>
          <input className={s.input} placeholder="Enter a number…" value={input} onChange={(e) => setInput(e.target.value)} />
        </div>
        <div className={s.inputGroup}>
          <label className={s.inputLabel}>From Base</label>
          <select className={s.select} value={fromBase} onChange={(e) => { setFromBase(e.target.value); setInput('') }}>
            {bases.map((b) => <option key={b.base} value={b.base}>{b.label}</option>)}
          </select>
        </div>
      </div>
      {decimal !== null && (
        <div className={s.refGrid} style={{ marginTop: 16 }}>
          {bases.map((b) => (
            <div key={b.base} className={s.refCard} style={{ textAlign: 'center' }}>
              <div className={s.refCardDesc}>{b.label}</div>
              <div className={s.refCardFormula} style={{ fontSize: 18, marginTop: 8 }}>
                {b.prefix}{decimal.toString(b.base).toUpperCase()}
              </div>
            </div>
          ))}
        </div>
      )}
      {decimal === null && input.trim() && (
        <div className={s.empty} style={{ padding: 24 }}>Invalid number for base {fromBase}</div>
      )}
    </div>
  )

  void colorClass // suppress unused warning
}

export default function CSTools() {
  const [tab, setTab] = useState('complexity')
  const [filter, setFilter] = useState('All')
  const types = ['All', 'Sort', 'Search', 'Graph', 'Technique']

  function colorClass(c) {
    if (c === 'O(1)') return s.badgeGreen
    if (c.includes('log')) return s.badgeYellow
    return s.badgeRed
  }

  const shown = filter === 'All' ? COMPLEXITY : COMPLEXITY.filter((r) => r.type === filter)

  return (
    <div>
      <div className={s.tabs}>
        {[['complexity','⏱ Complexity'], ['structures','🗃 Data Structures'], ['converter','🔢 Base Converter']].map(([id, label]) => (
          <button key={id} className={`${s.tab} ${tab === id ? s.tabActive : ''}`} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>

      {tab === 'complexity' && (
        <div className={s.panel}>
          <div className={s.filterRow}>
            {types.map((t) => (
              <button key={t} className={`${s.filterBtn} ${filter === t ? s.filterBtnActive : ''}`} onClick={() => setFilter(t)}>{t}</button>
            ))}
          </div>
          <div className={s.tableWrap}>
            <table className={s.dataTable}>
              <thead>
                <tr>
                  <th>Algorithm</th>
                  <th>Type</th>
                  <th>Best</th>
                  <th>Average</th>
                  <th>Worst</th>
                  <th>Space</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((r, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600, color: 'var(--cream)' }}>{r.name}</td>
                    <td style={{ fontSize: 11, color: 'var(--mist)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{r.type}</td>
                    <td className={`${s.mono} ${colorClass(r.best)}`}>{r.best}</td>
                    <td className={`${s.mono} ${colorClass(r.avg)}`}>{r.avg}</td>
                    <td className={`${s.mono} ${colorClass(r.worst)}`}>{r.worst}</td>
                    <td className={s.mono}>{r.space}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 11, color: 'var(--mist)', marginTop: 12, lineHeight: 1.6 }}>
            <span className={s.badgeGreen}>■</span> Excellent &nbsp;
            <span className={s.badgeYellow}>■</span> Good &nbsp;
            <span className={s.badgeRed}>■</span> Poor &nbsp; · V = vertices, E = edges, k = key length
          </p>
        </div>
      )}

      {tab === 'structures' && (
        <div className={s.panel}>
          <div className={s.tableWrap}>
            <table className={s.dataTable}>
              <thead>
                <tr>
                  <th>Structure</th>
                  <th>Access</th>
                  <th>Search</th>
                  <th>Insert</th>
                  <th>Delete</th>
                  <th>Space</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {DATA_STRUCTURES.map((d, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600, color: 'var(--cream)', whiteSpace: 'nowrap' }}>{d.name}</td>
                    <td className={`${s.mono} ${colorClass(d.access)}`}>{d.access}</td>
                    <td className={`${s.mono} ${colorClass(d.search)}`}>{d.search}</td>
                    <td className={`${s.mono} ${colorClass(d.insert)}`}>{d.insert}</td>
                    <td className={`${s.mono} ${colorClass(d.delete)}`}>{d.delete}</td>
                    <td className={s.mono}>{d.space}</td>
                    <td style={{ fontSize: 12, color: 'var(--mist)', maxWidth: 200 }}>{d.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 11, color: 'var(--mist)', marginTop: 12 }}>* Average case. Worst case may differ.</p>
        </div>
      )}

      {tab === 'converter' && (
        <div className={s.panel}>
          <BaseConverter />
        </div>
      )}
    </div>
  )
}
