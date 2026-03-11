import { useState, useMemo } from 'react'
import s from './StudioTools.module.css'

/* ── Periodic Elements (first 36) ── */
const ELEMENTS = [
  { n:1,  sym:'H',  name:'Hydrogen',    mass:1.008,   cat:'Nonmetal',         config:'1s¹' },
  { n:2,  sym:'He', name:'Helium',      mass:4.003,   cat:'Noble Gas',        config:'1s²' },
  { n:3,  sym:'Li', name:'Lithium',     mass:6.941,   cat:'Alkali Metal',     config:'[He] 2s¹' },
  { n:4,  sym:'Be', name:'Beryllium',   mass:9.012,   cat:'Alkaline Earth',   config:'[He] 2s²' },
  { n:5,  sym:'B',  name:'Boron',       mass:10.81,   cat:'Metalloid',        config:'[He] 2s² 2p¹' },
  { n:6,  sym:'C',  name:'Carbon',      mass:12.011,  cat:'Nonmetal',         config:'[He] 2s² 2p²' },
  { n:7,  sym:'N',  name:'Nitrogen',    mass:14.007,  cat:'Nonmetal',         config:'[He] 2s² 2p³' },
  { n:8,  sym:'O',  name:'Oxygen',      mass:15.999,  cat:'Nonmetal',         config:'[He] 2s² 2p⁴' },
  { n:9,  sym:'F',  name:'Fluorine',    mass:18.998,  cat:'Halogen',          config:'[He] 2s² 2p⁵' },
  { n:10, sym:'Ne', name:'Neon',        mass:20.180,  cat:'Noble Gas',        config:'[He] 2s² 2p⁶' },
  { n:11, sym:'Na', name:'Sodium',      mass:22.990,  cat:'Alkali Metal',     config:'[Ne] 3s¹' },
  { n:12, sym:'Mg', name:'Magnesium',   mass:24.305,  cat:'Alkaline Earth',   config:'[Ne] 3s²' },
  { n:13, sym:'Al', name:'Aluminium',   mass:26.982,  cat:'Post-Trans. Metal',config:'[Ne] 3s² 3p¹' },
  { n:14, sym:'Si', name:'Silicon',     mass:28.086,  cat:'Metalloid',        config:'[Ne] 3s² 3p²' },
  { n:15, sym:'P',  name:'Phosphorus',  mass:30.974,  cat:'Nonmetal',         config:'[Ne] 3s² 3p³' },
  { n:16, sym:'S',  name:'Sulfur',      mass:32.06,   cat:'Nonmetal',         config:'[Ne] 3s² 3p⁴' },
  { n:17, sym:'Cl', name:'Chlorine',    mass:35.45,   cat:'Halogen',          config:'[Ne] 3s² 3p⁵' },
  { n:18, sym:'Ar', name:'Argon',       mass:39.948,  cat:'Noble Gas',        config:'[Ne] 3s² 3p⁶' },
  { n:19, sym:'K',  name:'Potassium',   mass:39.098,  cat:'Alkali Metal',     config:'[Ar] 4s¹' },
  { n:20, sym:'Ca', name:'Calcium',     mass:40.078,  cat:'Alkaline Earth',   config:'[Ar] 4s²' },
  { n:21, sym:'Sc', name:'Scandium',    mass:44.956,  cat:'Transition Metal', config:'[Ar] 3d¹ 4s²' },
  { n:22, sym:'Ti', name:'Titanium',    mass:47.867,  cat:'Transition Metal', config:'[Ar] 3d² 4s²' },
  { n:23, sym:'V',  name:'Vanadium',    mass:50.942,  cat:'Transition Metal', config:'[Ar] 3d³ 4s²' },
  { n:24, sym:'Cr', name:'Chromium',    mass:51.996,  cat:'Transition Metal', config:'[Ar] 3d⁵ 4s¹' },
  { n:25, sym:'Mn', name:'Manganese',   mass:54.938,  cat:'Transition Metal', config:'[Ar] 3d⁵ 4s²' },
  { n:26, sym:'Fe', name:'Iron',        mass:55.845,  cat:'Transition Metal', config:'[Ar] 3d⁶ 4s²' },
  { n:27, sym:'Co', name:'Cobalt',      mass:58.933,  cat:'Transition Metal', config:'[Ar] 3d⁷ 4s²' },
  { n:28, sym:'Ni', name:'Nickel',      mass:58.693,  cat:'Transition Metal', config:'[Ar] 3d⁸ 4s²' },
  { n:29, sym:'Cu', name:'Copper',      mass:63.546,  cat:'Transition Metal', config:'[Ar] 3d¹⁰ 4s¹' },
  { n:30, sym:'Zn', name:'Zinc',        mass:65.38,   cat:'Transition Metal', config:'[Ar] 3d¹⁰ 4s²' },
  { n:31, sym:'Ga', name:'Gallium',     mass:69.723,  cat:'Post-Trans. Metal',config:'[Ar] 3d¹⁰ 4s² 4p¹' },
  { n:32, sym:'Ge', name:'Germanium',   mass:72.630,  cat:'Metalloid',        config:'[Ar] 3d¹⁰ 4s² 4p²' },
  { n:33, sym:'As', name:'Arsenic',     mass:74.922,  cat:'Metalloid',        config:'[Ar] 3d¹⁰ 4s² 4p³' },
  { n:34, sym:'Se', name:'Selenium',    mass:78.971,  cat:'Nonmetal',         config:'[Ar] 3d¹⁰ 4s² 4p⁴' },
  { n:35, sym:'Br', name:'Bromine',     mass:79.904,  cat:'Halogen',          config:'[Ar] 3d¹⁰ 4s² 4p⁵' },
  { n:36, sym:'Kr', name:'Krypton',     mass:83.798,  cat:'Noble Gas',        config:'[Ar] 3d¹⁰ 4s² 4p⁶' },
]

const ELEM_COLORS = {
  'Nonmetal':          '#4a9eca',
  'Noble Gas':         '#9b7fd4',
  'Alkali Metal':      '#cd6155',
  'Alkaline Earth':    '#e8a84c',
  'Metalloid':         '#2ecc71',
  'Halogen':           '#e74c8b',
  'Transition Metal':  '#c9a84c',
  'Post-Trans. Metal': '#6e8efb',
}

/* ── SI Unit Converter ── */
const SI_CATEGORIES = {
  Energy: {
    units: ['J','kJ','MJ','cal','kcal','Wh','kWh','eV'],
    toBase: { J:1, kJ:1e3, MJ:1e6, cal:4.184, kcal:4184, Wh:3600, kWh:3.6e6, eV:1.602e-19 },
  },
  Force: {
    units: ['N','kN','MN','dyne','lbf','kgf'],
    toBase: { N:1, kN:1e3, MN:1e6, dyne:1e-5, lbf:4.44822, kgf:9.80665 },
  },
  Pressure: {
    units: ['Pa','kPa','MPa','bar','atm','mmHg','psi'],
    toBase: { Pa:1, kPa:1e3, MPa:1e6, bar:1e5, atm:101325, mmHg:133.322, psi:6894.76 },
  },
  Power: {
    units: ['W','kW','MW','hp','BTU/h','cal/s'],
    toBase: { W:1, kW:1e3, MW:1e6, hp:745.7, 'BTU/h':0.29307, 'cal/s':4.184 },
  },
  Frequency: {
    units: ['Hz','kHz','MHz','GHz','rpm'],
    toBase: { Hz:1, kHz:1e3, MHz:1e6, GHz:1e9, rpm:1/60 },
  },
}

function SIConverter() {
  const [cat, setCat] = useState('Energy')
  const [from, setFrom] = useState('J')
  const [to, setTo] = useState('kJ')
  const [val, setVal] = useState('')

  const category = SI_CATEGORIES[cat]
  const result = useMemo(() => {
    const v = parseFloat(val)
    if (isNaN(v)) return null
    return v * category.toBase[from] / category.toBase[to]
  }, [val, from, to, cat, category])

  const handleCat = (c) => {
    setCat(c)
    setFrom(SI_CATEGORIES[c].units[0])
    setTo(SI_CATEGORIES[c].units[1])
    setVal('')
  }

  const fmt = (n) => {
    if (n === null) return '—'
    if (Math.abs(n) < 0.001 || Math.abs(n) > 1e9) return n.toExponential(4)
    return parseFloat(n.toFixed(6)).toString()
  }

  return (
    <div>
      <div className={s.filterRow}>
        {Object.keys(SI_CATEGORIES).map((c) => (
          <button key={c} className={`${s.filterBtn} ${cat === c ? s.filterBtnActive : ''}`} onClick={() => handleCat(c)}>{c}</button>
        ))}
      </div>
      <div className={s.converterGrid}>
        <div className={s.inputGroup}>
          <label className={s.inputLabel}>From</label>
          <select className={s.select} value={from} onChange={(e) => setFrom(e.target.value)}>
            {category.units.map((u) => <option key={u}>{u}</option>)}
          </select>
          <input className={s.input} type="number" placeholder="Enter value…" value={val} onChange={(e) => setVal(e.target.value)} />
        </div>
        <div className={s.converterArrow}>→</div>
        <div className={s.inputGroup}>
          <label className={s.inputLabel}>To</label>
          <select className={s.select} value={to} onChange={(e) => setTo(e.target.value)}>
            {category.units.map((u) => <option key={u}>{u}</option>)}
          </select>
          <div className={s.converterResult}>
            <div className={s.resultLabel}>Result</div>
            <div className={s.resultValue}>{fmt(result)} <span style={{ fontSize: 16, color: 'var(--mist)' }}>{to}</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ScienceTools() {
  const [tab, setTab] = useState('elements')
  const [catFilter, setCatFilter] = useState('All')
  const [search, setSearch] = useState('')

  const cats = ['All', ...Object.keys(ELEM_COLORS)]
  const shown = ELEMENTS.filter((el) => {
    const matchCat = catFilter === 'All' || el.cat === catFilter
    const matchSearch = !search.trim() || el.name.toLowerCase().includes(search.toLowerCase()) || el.sym.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div>
      <div className={s.tabs}>
        {[['elements','⚗ Elements'], ['units','📐 SI Units']].map(([id, label]) => (
          <button key={id} className={`${s.tab} ${tab === id ? s.tabActive : ''}`} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>

      {tab === 'elements' && (
        <div className={s.panel}>
          <input className={s.searchBar} placeholder="Search by name or symbol…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <div className={s.filterRow} style={{ flexWrap: 'wrap' }}>
            {cats.map((c) => (
              <button key={c} className={`${s.filterBtn} ${catFilter === c ? s.filterBtnActive : ''}`}
                onClick={() => setCatFilter(c)} style={{ whiteSpace: 'nowrap' }}>{c}</button>
            ))}
          </div>
          <div className={s.tableWrap}>
            <table className={s.dataTable}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Symbol</th>
                  <th>Name</th>
                  <th>Atomic Mass</th>
                  <th>Category</th>
                  <th>Electron Config</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((el) => (
                  <tr key={el.n}>
                    <td style={{ color: 'var(--mist)', fontSize: 12 }}>{el.n}</td>
                    <td>
                      <span className={s.mono} style={{ fontSize: 16, fontWeight: 700, color: ELEM_COLORS[el.cat] || 'var(--gold)' }}>
                        {el.sym}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--cream)' }}>{el.name}</td>
                    <td className={s.mono}>{el.mass}</td>
                    <td>
                      <span style={{ fontSize: 10, color: ELEM_COLORS[el.cat] || 'var(--gold)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        {el.cat}
                      </span>
                    </td>
                    <td className={s.mono} style={{ fontSize: 12 }}>{el.config}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'units' && (
        <div className={s.panel}>
          <SIConverter />
        </div>
      )}
    </div>
  )
}
