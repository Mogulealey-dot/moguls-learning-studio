import { useState, useMemo } from 'react'
import s from './StudioTools.module.css'

/* ── Formula Data ── */
const FORMULAS = {
  Algebra: [
    { name: 'Quadratic Formula', formula: 'x = (-b ± √(b²-4ac)) / 2a', desc: 'Roots of ax² + bx + c = 0' },
    { name: 'Sum of AP', formula: 'Sₙ = n/2 × (2a + (n-1)d)', desc: 'Arithmetic progression with first term a, common difference d' },
    { name: 'Sum of GP', formula: 'Sₙ = a(1-rⁿ)/(1-r)', desc: 'Geometric progression with ratio r ≠ 1' },
    { name: 'Binomial Theorem', formula: '(a+b)ⁿ = Σ C(n,k) aⁿ⁻ᵏ bᵏ', desc: 'k from 0 to n' },
    { name: 'Logarithm Product', formula: 'log(ab) = log(a) + log(b)', desc: 'Logarithm of a product' },
    { name: 'Logarithm Quotient', formula: 'log(a/b) = log(a) - log(b)', desc: 'Logarithm of a quotient' },
    { name: 'Change of Base', formula: 'logₐ(b) = log(b) / log(a)', desc: 'Convert between logarithm bases' },
    { name: 'Exponent Power Rule', formula: '(aᵐ)ⁿ = aᵐⁿ', desc: 'Power of a power' },
  ],
  Calculus: [
    { name: 'Power Rule', formula: 'd/dx[xⁿ] = nxⁿ⁻¹', desc: 'Derivative of a power function' },
    { name: 'Chain Rule', formula: 'd/dx[f(g(x))] = f\'(g(x)) × g\'(x)', desc: 'Derivative of composite functions' },
    { name: 'Product Rule', formula: 'd/dx[fg] = f\'g + fg\'', desc: 'Derivative of a product' },
    { name: 'Quotient Rule', formula: 'd/dx[f/g] = (f\'g - fg\')/g²', desc: 'Derivative of a quotient' },
    { name: 'Fundamental Theorem', formula: '∫[a→b] f(x)dx = F(b) - F(a)', desc: 'Links integration and differentiation' },
    { name: 'Power Integral', formula: '∫xⁿdx = xⁿ⁺¹/(n+1) + C', desc: 'n ≠ -1' },
    { name: 'L\'Hôpital\'s Rule', formula: 'lim f/g = lim f\'/g\' (0/0 or ∞/∞)', desc: 'Evaluate indeterminate limits' },
    { name: 'Taylor Series', formula: 'f(x) = Σ f⁽ⁿ⁾(a)(x-a)ⁿ/n!', desc: 'Approximation of a function at point a' },
  ],
  Trigonometry: [
    { name: 'Pythagorean Identity', formula: 'sin²θ + cos²θ = 1', desc: 'Fundamental trig identity' },
    { name: 'Tangent', formula: 'tan(θ) = sin(θ)/cos(θ)', desc: 'Definition of tangent' },
    { name: 'Double Angle Sine', formula: 'sin(2θ) = 2sin(θ)cos(θ)', desc: 'Double angle formula for sine' },
    { name: 'Double Angle Cosine', formula: 'cos(2θ) = cos²θ - sin²θ', desc: 'Also = 1-2sin²θ = 2cos²θ-1' },
    { name: 'Sine Rule', formula: 'a/sin(A) = b/sin(B) = c/sin(C)', desc: 'For any triangle' },
    { name: 'Cosine Rule', formula: 'a² = b² + c² - 2bc·cos(A)', desc: 'For any triangle' },
    { name: 'Sum of Angles Sine', formula: 'sin(A+B) = sinAcosB + cosAsinB', desc: 'Compound angle formula' },
    { name: 'Sum of Angles Cosine', formula: 'cos(A+B) = cosAcosB - sinAsinB', desc: 'Compound angle formula' },
  ],
  Statistics: [
    { name: 'Mean', formula: 'x̄ = (Σxᵢ) / n', desc: 'Average of all values' },
    { name: 'Variance (Population)', formula: 'σ² = Σ(xᵢ-μ)² / N', desc: 'Average squared deviation from mean' },
    { name: 'Standard Deviation', formula: 'σ = √(Σ(xᵢ-μ)² / N)', desc: 'Square root of variance' },
    { name: 'Z-Score', formula: 'z = (x - μ) / σ', desc: 'Standardised distance from mean' },
    { name: 'Binomial Probability', formula: 'P(X=k) = C(n,k) pᵏ(1-p)ⁿ⁻ᵏ', desc: 'Probability of k successes in n trials' },
    { name: 'Correlation Coefficient', formula: 'r = Σ[(xᵢ-x̄)(yᵢ-ȳ)] / (nσxσy)', desc: 'Pearson\'s r, range [-1, 1]' },
    { name: 'Confidence Interval', formula: 'CI = x̄ ± z*(σ/√n)', desc: '95% CI uses z*=1.96' },
    { name: 'Regression Slope', formula: 'b = Σ(xᵢ-x̄)(yᵢ-ȳ) / Σ(xᵢ-x̄)²', desc: 'Least squares linear regression' },
  ],
  Geometry: [
    { name: 'Circle Area', formula: 'A = πr²', desc: 'Area of a circle with radius r' },
    { name: 'Circle Circumference', formula: 'C = 2πr', desc: 'Perimeter of a circle' },
    { name: 'Triangle Area', formula: 'A = ½bh', desc: 'Base × height ÷ 2' },
    { name: 'Pythagorean Theorem', formula: 'a² + b² = c²', desc: 'Right triangle with hypotenuse c' },
    { name: 'Sphere Volume', formula: 'V = (4/3)πr³', desc: 'Volume of a sphere' },
    { name: 'Sphere Surface Area', formula: 'SA = 4πr²', desc: 'Surface area of a sphere' },
    { name: 'Cylinder Volume', formula: 'V = πr²h', desc: 'Volume of a cylinder' },
    { name: 'Cone Volume', formula: 'V = (1/3)πr²h', desc: 'Volume of a cone' },
  ],
}

/* ── Unit Converter ── */
const UNIT_CATEGORIES = {
  Length: {
    units: ['mm','cm','m','km','in','ft','yd','mi'],
    toBase: { mm:0.001, cm:0.01, m:1, km:1000, in:0.0254, ft:0.3048, yd:0.9144, mi:1609.34 },
  },
  Mass: {
    units: ['mg','g','kg','tonne','oz','lb'],
    toBase: { mg:0.000001, g:0.001, kg:1, tonne:1000, oz:0.0283495, lb:0.453592 },
  },
  Area: {
    units: ['mm²','cm²','m²','km²','in²','ft²','acre'],
    toBase: { 'mm²':0.000001,'cm²':0.0001,'m²':1,'km²':1e6,'in²':0.00064516,'ft²':0.0929,'acre':4046.86 },
  },
  Volume: {
    units: ['ml','L','m³','tsp','tbsp','cup','gal'],
    toBase: { ml:0.001, L:1, 'm³':1000, tsp:0.00492892, tbsp:0.0147868, cup:0.236588, gal:3.78541 },
  },
  Speed: {
    units: ['m/s','km/h','mph','knots','ft/s'],
    toBase: { 'm/s':1,'km/h':0.277778,'mph':0.44704,'knots':0.514444,'ft/s':0.3048 },
  },
  Temperature: { units: ['°C','°F','K'], toBase: null }, // special case
}

function convertTemp(val, from, to) {
  let c
  if (from === '°C') c = val
  else if (from === '°F') c = (val - 32) * 5/9
  else c = val - 273.15
  if (to === '°C') return c
  if (to === '°F') return c * 9/5 + 32
  return c + 273.15
}

function UnitConverter() {
  const [category, setCategory] = useState('Length')
  const [fromUnit, setFromUnit] = useState('m')
  const [toUnit, setToUnit] = useState('ft')
  const [value, setValue] = useState('')

  const cat = UNIT_CATEGORIES[category]
  const result = useMemo(() => {
    const v = parseFloat(value)
    if (isNaN(v)) return null
    if (category === 'Temperature') return convertTemp(v, fromUnit, toUnit)
    return v * cat.toBase[fromUnit] / cat.toBase[toUnit]
  }, [value, fromUnit, toUnit, category])

  const handleCategoryChange = (c) => {
    setCategory(c)
    setFromUnit(UNIT_CATEGORIES[c].units[0])
    setToUnit(UNIT_CATEGORIES[c].units[1])
    setValue('')
  }

  const fmt = (n) => {
    if (n === null) return '—'
    if (Math.abs(n) < 0.001 || Math.abs(n) > 1e9) return n.toExponential(4)
    return parseFloat(n.toFixed(6)).toString()
  }

  return (
    <div>
      <div className={s.filterRow}>
        {Object.keys(UNIT_CATEGORIES).map((c) => (
          <button key={c} className={`${s.filterBtn} ${category === c ? s.filterBtnActive : ''}`} onClick={() => handleCategoryChange(c)}>{c}</button>
        ))}
      </div>
      <div className={s.converterGrid}>
        <div className={s.inputGroup}>
          <label className={s.inputLabel}>From</label>
          <select className={s.select} value={fromUnit} onChange={(e) => setFromUnit(e.target.value)}>
            {cat.units.map((u) => <option key={u}>{u}</option>)}
          </select>
          <input className={s.input} type="number" placeholder="Enter value…" value={value} onChange={(e) => setValue(e.target.value)} />
        </div>
        <div className={s.converterArrow}>→</div>
        <div className={s.inputGroup}>
          <label className={s.inputLabel}>To</label>
          <select className={s.select} value={toUnit} onChange={(e) => setToUnit(e.target.value)}>
            {cat.units.map((u) => <option key={u}>{u}</option>)}
          </select>
          <div className={s.converterResult}>
            <div className={s.resultLabel}>Result</div>
            <div className={s.resultValue}>{fmt(result)} <span style={{ fontSize: 16, color: 'var(--mist)' }}>{toUnit}</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Main Component ── */
export default function MathTools() {
  const [tab, setTab] = useState('formulas')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Algebra')

  const allFormulas = Object.entries(FORMULAS).flatMap(([cat, items]) => items.map(f => ({ ...f, cat })))
  const filtered = search.trim()
    ? allFormulas.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()) || f.formula.toLowerCase().includes(search.toLowerCase()))
    : null

  return (
    <div>
      <div className={s.tabs}>
        {[['formulas','📐 Formula Library'], ['converter','⚖ Unit Converter']].map(([id, label]) => (
          <button key={id} className={`${s.tab} ${tab === id ? s.tabActive : ''}`} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>

      {tab === 'formulas' && (
        <div className={s.panel}>
          <input className={s.searchBar} placeholder="Search formulas…" value={search} onChange={(e) => setSearch(e.target.value)} />
          {search.trim() ? (
            <div className={s.refGrid}>
              {filtered.map((f, i) => (
                <div key={i} className={s.refCard}>
                  <div className={s.refCardTitle}>{f.name} <span style={{ fontSize: 10, color: 'var(--mist)', marginLeft: 4 }}>{f.cat}</span></div>
                  <div className={s.refCardFormula}>{f.formula}</div>
                  <div className={s.refCardDesc}>{f.desc}</div>
                </div>
              ))}
              {filtered.length === 0 && <div className={s.empty}>No formulas found for "{search}"</div>}
            </div>
          ) : (
            <>
              <div className={s.filterRow}>
                {Object.keys(FORMULAS).map((cat) => (
                  <button key={cat} className={`${s.filterBtn} ${category === cat ? s.filterBtnActive : ''}`} onClick={() => setCategory(cat)}>{cat}</button>
                ))}
              </div>
              <div className={s.refGrid}>
                {FORMULAS[category].map((f, i) => (
                  <div key={i} className={s.refCard}>
                    <div className={s.refCardTitle}>{f.name}</div>
                    <div className={s.refCardFormula}>{f.formula}</div>
                    <div className={s.refCardDesc}>{f.desc}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {tab === 'converter' && (
        <div className={s.panel}>
          <UnitConverter />
        </div>
      )}
    </div>
  )
}
