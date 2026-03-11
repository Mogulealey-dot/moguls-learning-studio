import { useState, useMemo } from 'react'
import s from './StudioTools.module.css'

/* ── Macroeconomics Calculators ── */
const MACRO_CALCS = {
  gdp: {
    name: 'GDP (Expenditure Approach)',
    formula: 'GDP = C + I + G + (X − M)',
    fields: [['c','Consumption (C)'],['i','Investment (I)'],['g','Gov. Spending (G)'],['x','Exports (X)'],['m','Imports (M)']],
    calc: (n) => n('c') + n('i') + n('g') + n('x') - n('m'),
    unit: '$',
  },
  inflation: {
    name: 'Inflation Rate (CPI)',
    formula: 'Inflation = ((CPI₂ − CPI₁) / CPI₁) × 100',
    fields: [['cpi1','CPI Base Period'],['cpi2','CPI Current Period']],
    calc: (n) => n('cpi1') ? ((n('cpi2') - n('cpi1')) / n('cpi1')) * 100 : NaN,
    unit: '%',
  },
  realGdp: {
    name: 'Real GDP',
    formula: 'Real GDP = Nominal GDP / Deflator × 100',
    fields: [['nominal','Nominal GDP'],['deflator','GDP Deflator']],
    calc: (n) => n('deflator') ? (n('nominal') / n('deflator')) * 100 : NaN,
    unit: '$',
  },
  multiplier: {
    name: 'Fiscal Multiplier Effect',
    formula: 'k = 1/(1−MPC) → Impact = Injection × k',
    fields: [['mpc','MPC (0 to 1)'],['injection','Government Injection ($)']],
    calc: (n) => n('mpc') < 1 ? n('injection') / (1 - n('mpc')) : NaN,
    unit: '$ total GDP impact',
  },
  unemployment: {
    name: 'Unemployment Rate',
    formula: 'UR = (Unemployed / Labour Force) × 100',
    fields: [['unemployed','Unemployed'],['labourForce','Total Labour Force']],
    calc: (n) => n('labourForce') ? (n('unemployed') / n('labourForce')) * 100 : NaN,
    unit: '%',
  },
  cagr: {
    name: 'Economic Growth (CAGR)',
    formula: 'CAGR = (End/Start)^(1/n) − 1',
    fields: [['start','Start Value / GDP'],['end','End Value / GDP'],['years','Years (n)']],
    calc: (n) => n('start') && n('years') ? (Math.pow(n('end') / n('start'), 1 / n('years')) - 1) * 100 : NaN,
    unit: '%',
  },
  rule70: {
    name: 'Rule of 70 (Doubling Time)',
    formula: 'Doubling Time = 70 / Growth Rate (%)',
    fields: [['growthRate','Annual Growth Rate (%)']],
    calc: (n) => n('growthRate') ? 70 / n('growthRate') : NaN,
    unit: 'years',
  },
  moneyMult: {
    name: 'Money Multiplier',
    formula: 'm = 1 / Reserve Requirement Ratio',
    fields: [['rrr','Reserve Requirement Ratio (e.g. 0.1)'],['deposits','Initial Deposits ($)']],
    calc: (n) => n('rrr') ? n('deposits') / n('rrr') : NaN,
    unit: '$ total money created',
  },
}

function MacroCalc() {
  const [calc, setCalc] = useState('gdp')
  const [vals, setVals] = useState({})
  const set = (k) => (e) => setVals(v => ({ ...v, [k]: e.target.value }))
  const n = (k) => parseFloat(vals[k]) || 0

  const current = MACRO_CALCS[calc]
  const result = current.calc(n)
  const fmt = (v) => isNaN(v) || !isFinite(v) ? '—' : parseFloat(v.toFixed(4)).toLocaleString()

  return (
    <div>
      <div className={s.filterRow}>
        {Object.entries(MACRO_CALCS).map(([id, c]) => (
          <button key={id} className={`${s.filterBtn} ${calc === id ? s.filterBtnActive : ''}`}
            onClick={() => { setCalc(id); setVals({}) }}>{c.name}</button>
        ))}
      </div>
      <div className={s.addForm}>
        <div className={s.categoryLabel}>{current.formula}</div>
        <div className={s.formGrid}>
          {current.fields.map(([k, label]) => (
            <div key={k} className={s.inputGroup}>
              <label className={s.inputLabel}>{label}</label>
              <input className={s.input} type="number" placeholder="0" value={vals[k] || ''} onChange={set(k)} />
            </div>
          ))}
        </div>
      </div>
      <div className={s.converterResult}>
        <div className={s.resultLabel}>{current.name}</div>
        <div className={s.resultValue}>{fmt(result)} <span style={{ fontSize: 16, color: 'var(--mist)' }}>{current.unit}</span></div>
      </div>
    </div>
  )
}

/* ── Elasticity Calculator ── */
function ElasticityCalc() {
  const [type, setType] = useState('ped')
  const [q1, setQ1] = useState('')
  const [q2, setQ2] = useState('')
  const [p1, setP1] = useState('')
  const [p2, setP2] = useState('')
  const [y1, setY1] = useState('')
  const [y2, setY2] = useState('')

  const pct = (a, b) => ((parseFloat(b) - parseFloat(a)) / Math.abs(parseFloat(a))) * 100

  const value = useMemo(() => {
    const qPct = pct(q1, q2)
    if (type === 'ped') { const pPct = pct(p1, p2); return pPct !== 0 ? qPct / pPct : null }
    if (type === 'yed') { const yPct = pct(y1, y2); return yPct !== 0 ? qPct / yPct : null }
    if (type === 'xed') { const pPct = pct(p1, p2); return pPct !== 0 ? qPct / pPct : null }
    return null
  }, [type, q1, q2, p1, p2, y1, y2])

  const interpret = () => {
    if (value === null || isNaN(value) || !isFinite(value)) return ''
    if (type === 'ped') {
      if (Math.abs(value) > 1) return '📉 Elastic — demand is price-sensitive. A price rise will reduce total revenue.'
      if (Math.abs(value) === 1) return '⚖ Unit elastic — % change in price = % change in demand.'
      return '📈 Inelastic — demand is price-insensitive. A price rise will increase total revenue.'
    }
    if (type === 'yed') {
      if (value > 1) return '✅ Luxury good — demand rises faster than income.'
      if (value > 0) return '✅ Normal good — demand rises with income.'
      return '⚠ Inferior good — demand falls as income rises.'
    }
    if (type === 'xed') {
      if (value > 0) return '🔄 Substitutes — goods are in competition with each other.'
      if (value < 0) return '🔗 Complements — goods are used together.'
      return '⚖ Unrelated goods — no cross-price relationship.'
    }
  }

  return (
    <div>
      <div className={s.filterRow}>
        {[['ped','Price Elasticity (PED)'],['yed','Income Elasticity (YED)'],['xed','Cross Elasticity (XED)']].map(([id, label]) => (
          <button key={id} className={`${s.filterBtn} ${type === id ? s.filterBtnActive : ''}`} onClick={() => setType(id)}>{label}</button>
        ))}
      </div>
      <div className={s.addForm}>
        <div className={s.formGrid}>
          <div className={s.inputGroup}><label className={s.inputLabel}>Quantity Demanded Q₁</label><input className={s.input} type="number" value={q1} onChange={e => setQ1(e.target.value)} placeholder="100" /></div>
          <div className={s.inputGroup}><label className={s.inputLabel}>Quantity Demanded Q₂</label><input className={s.input} type="number" value={q2} onChange={e => setQ2(e.target.value)} placeholder="80" /></div>
          {(type === 'ped' || type === 'xed') && <>
            <div className={s.inputGroup}><label className={s.inputLabel}>{type === 'xed' ? 'Price of Related Good P₁' : 'Price P₁'}</label><input className={s.input} type="number" value={p1} onChange={e => setP1(e.target.value)} placeholder="10" /></div>
            <div className={s.inputGroup}><label className={s.inputLabel}>{type === 'xed' ? 'Price of Related Good P₂' : 'Price P₂'}</label><input className={s.input} type="number" value={p2} onChange={e => setP2(e.target.value)} placeholder="12" /></div>
          </>}
          {type === 'yed' && <>
            <div className={s.inputGroup}><label className={s.inputLabel}>Income Y₁</label><input className={s.input} type="number" value={y1} onChange={e => setY1(e.target.value)} placeholder="50000" /></div>
            <div className={s.inputGroup}><label className={s.inputLabel}>Income Y₂</label><input className={s.input} type="number" value={y2} onChange={e => setY2(e.target.value)} placeholder="55000" /></div>
          </>}
        </div>
      </div>
      <div className={s.converterResult}>
        <div className={s.resultLabel}>{type.toUpperCase()} Value</div>
        <div className={s.resultValue}>{value !== null && isFinite(value) ? value.toFixed(4) : '—'}</div>
        {interpret() && <div style={{ fontSize: 13, color: 'var(--cream)', marginTop: 10, lineHeight: 1.6 }}>{interpret()}</div>}
      </div>
    </div>
  )
}

/* ── Market Equilibrium ── */
function MarketEquilibrium() {
  const [si, setSi] = useState('')
  const [ss, setSs] = useState('')
  const [di, setDi] = useState('')
  const [ds, setDs] = useState('')
  const [tax, setTax] = useState('')
  const [subsidy, setSubsidy] = useState('')

  const si_ = parseFloat(si) || 0
  const ss_ = parseFloat(ss) || 0
  const di_ = parseFloat(di) || 0
  const ds_ = parseFloat(ds) || 0
  const t_ = parseFloat(tax) || 0
  const sub_ = parseFloat(subsidy) || 0

  // Supply: P = si + ss*Q,  Demand: P = di + ds*Q (ds < 0)
  // Equilibrium: si + ss*Q = di + ds*Q → Q = (di-si)/(ss-ds)
  const denom = ss_ - ds_
  const qEq = denom !== 0 ? (di_ - si_) / denom : null
  const pEq = qEq !== null ? si_ + ss_ * qEq : null

  // After tax (shifts supply up by tax amount)
  const siTax = si_ + t_ - sub_
  const denomTax = ss_ - ds_
  const qTax = denomTax !== 0 ? (di_ - siTax) / denomTax : null
  const pTax = qTax !== null ? siTax + ss_ * qTax : null

  const fmt = (v) => v === null || isNaN(v) || !isFinite(v) || v < 0 ? '—' : v.toFixed(4)

  return (
    <div>
      <div className={s.addForm}>
        <div className={s.categoryLabel}>Supply Function: P = a + b·Q</div>
        <div className={s.formGrid}>
          <div className={s.inputGroup}><label className={s.inputLabel}>Intercept (a)</label><input className={s.input} type="number" placeholder="2" value={si} onChange={e => setSi(e.target.value)} /></div>
          <div className={s.inputGroup}><label className={s.inputLabel}>Slope (b, positive)</label><input className={s.input} type="number" placeholder="0.5" value={ss} onChange={e => setSs(e.target.value)} /></div>
        </div>
        <div className={s.categoryLabel}>Demand Function: P = c + d·Q (d must be negative)</div>
        <div className={s.formGrid}>
          <div className={s.inputGroup}><label className={s.inputLabel}>Intercept (c)</label><input className={s.input} type="number" placeholder="20" value={di} onChange={e => setDi(e.target.value)} /></div>
          <div className={s.inputGroup}><label className={s.inputLabel}>Slope (d, negative)</label><input className={s.input} type="number" placeholder="-2" value={ds} onChange={e => setDs(e.target.value)} /></div>
        </div>
        <div className={s.categoryLabel}>Government Intervention (optional)</div>
        <div className={s.formGrid}>
          <div className={s.inputGroup}><label className={s.inputLabel}>Per-unit Tax ($)</label><input className={s.input} type="number" placeholder="0" value={tax} onChange={e => setTax(e.target.value)} /></div>
          <div className={s.inputGroup}><label className={s.inputLabel}>Per-unit Subsidy ($)</label><input className={s.input} type="number" placeholder="0" value={subsidy} onChange={e => setSubsidy(e.target.value)} /></div>
        </div>
      </div>
      <div className={s.refGrid}>
        <div className={s.refCard}><div className={s.refCardTitle}>Equilibrium Quantity (Q*)</div><div style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent,var(--gold))', margin: '8px 0' }}>{fmt(qEq)}</div></div>
        <div className={s.refCard}><div className={s.refCardTitle}>Equilibrium Price (P*)</div><div style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent,var(--gold))', margin: '8px 0' }}>${fmt(pEq)}</div></div>
        {(t_ > 0 || sub_ > 0) && <>
          <div className={s.refCard}><div className={s.refCardTitle}>Q* After Intervention</div><div style={{ fontSize: 24, fontWeight: 700, color: '#4a9eca', margin: '8px 0' }}>{fmt(qTax)}</div><div className={s.refCardDesc}>Change: {qTax && qEq ? (qTax - qEq).toFixed(4) : '—'}</div></div>
          <div className={s.refCard}><div className={s.refCardTitle}>P* After Intervention</div><div style={{ fontSize: 24, fontWeight: 700, color: '#4a9eca', margin: '8px 0' }}>${fmt(pTax)}</div><div className={s.refCardDesc}>Change: {pTax && pEq ? `$${(pTax - pEq).toFixed(4)}` : '—'}</div></div>
        </>}
      </div>
    </div>
  )
}

/* ── Formula Library ── */
const ECO_FORMULAS = {
  Microeconomics: [
    { name: 'Total Revenue',       formula: 'TR = P × Q',                           desc: 'Price × quantity sold' },
    { name: 'Marginal Revenue',    formula: 'MR = ΔTR / ΔQ',                        desc: 'Extra revenue from one more unit' },
    { name: 'Profit',              formula: 'π = TR − TC',                          desc: 'Total revenue minus total cost' },
    { name: 'Profit Max Condition',formula: 'MR = MC',                              desc: 'Produce where marginal revenue = marginal cost' },
    { name: 'ATC',                 formula: 'ATC = TC / Q',                         desc: 'Average total cost per unit' },
    { name: 'AFC',                 formula: 'AFC = TFC / Q',                        desc: 'Average fixed cost per unit' },
    { name: 'AVC',                 formula: 'AVC = TVC / Q',                        desc: 'Average variable cost per unit' },
    { name: 'Consumer Surplus',    formula: 'CS = ½ × Q* × (Pmax − P*)',            desc: 'Area under demand curve above equilibrium price' },
    { name: 'Producer Surplus',    formula: 'PS = ½ × Q* × (P* − Pmin)',            desc: 'Area above supply curve below equilibrium price' },
  ],
  Macroeconomics: [
    { name: 'GDP Expenditure',     formula: 'GDP = C + I + G + (X−M)',             desc: 'Consumption + Investment + Government + Net Exports' },
    { name: 'GDP Income',          formula: 'GDP = W + R + I + P + T',             desc: 'Wages + Rent + Interest + Profit + Taxes' },
    { name: 'Fiscal Multiplier',   formula: 'k = 1 / (1 − MPC)',                   desc: 'Impact of a change in government spending on GDP' },
    { name: 'Money Multiplier',    formula: 'm = 1 / RRR',                          desc: 'Maximum money created from deposits' },
    { name: 'Quantity Theory',     formula: 'MV = PQ',                             desc: 'Money supply × Velocity = Price level × Output' },
    { name: 'Real Interest Rate',  formula: 'r = i − π',                           desc: 'Nominal rate minus inflation rate (Fisher equation)' },
    { name: 'Real GDP',            formula: 'Real GDP = Nominal GDP / Deflator × 100', desc: 'GDP adjusted for price level changes' },
    { name: 'Balance of Payments', formula: 'CA + KA + FA = 0',                    desc: 'Current account + Capital account + Financial account' },
  ],
  Growth: [
    { name: 'Economic Growth Rate',formula: 'g = (GDP₂ − GDP₁) / GDP₁ × 100',     desc: 'Percentage change in real GDP' },
    { name: 'Rule of 70',          formula: 'Doubling Time ≈ 70 / g',               desc: 'Approximate years to double GDP at growth rate g%' },
    { name: 'CAGR',                formula: 'CAGR = (Vend/Vstart)^(1/n) − 1',      desc: 'Compound annual growth rate over n years' },
    { name: 'Solow Residual (TFP)',formula: 'TFP = Output / (K^α × L^(1−α))',      desc: 'Total factor productivity — the residual of growth unexplained by capital & labour' },
  ],
  'International Trade': [
    { name: 'Terms of Trade',      formula: 'ToT = (Export Prices / Import Prices) × 100', desc: 'Index measuring export purchasing power' },
    { name: 'Current Account',     formula: 'CA = X − M + Net Income + Transfers', desc: 'Trade balance plus net factor income and transfers' },
    { name: 'J-Curve Effect',      formula: 'Depreciation → short-run CA worsens, then improves', desc: 'Marshall-Lerner condition: PED_X + PED_M > 1' },
    { name: 'Exchange Rate Effect',formula: 'Depreciation → exports cheaper, imports dearer', desc: 'Competitiveness channel of monetary policy' },
  ],
}

function FormulaLibrary() {
  const [cat, setCat] = useState('Microeconomics')
  const [search, setSearch] = useState('')
  const all = Object.entries(ECO_FORMULAS).flatMap(([c, items]) => items.map(f => ({ ...f, cat: c })))
  const filtered = search.trim() ? all.filter(f => f.name.toLowerCase().includes(search.toLowerCase())) : null

  return (
    <div>
      <input className={s.searchBar} placeholder="Search economics formulas…" value={search} onChange={e => setSearch(e.target.value)} />
      {search.trim() ? (
        <div className={s.refGrid}>
          {filtered.map((f, i) => (
            <div key={i} className={s.refCard}>
              <div className={s.refCardTitle}>{f.name} <span style={{ fontSize: 10, color: 'var(--mist)', marginLeft: 4 }}>{f.cat}</span></div>
              <div className={s.refCardFormula}>{f.formula}</div>
              <div className={s.refCardDesc}>{f.desc}</div>
            </div>
          ))}
          {!filtered.length && <div className={s.empty}>No formulas match your search.</div>}
        </div>
      ) : (
        <>
          <div className={s.filterRow}>
            {Object.keys(ECO_FORMULAS).map(c => (
              <button key={c} className={`${s.filterBtn} ${cat === c ? s.filterBtnActive : ''}`} onClick={() => setCat(c)}>{c}</button>
            ))}
          </div>
          <div className={s.refGrid}>
            {ECO_FORMULAS[cat].map((f, i) => (
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
  )
}

export default function EconomicsTools() {
  const [tab, setTab] = useState('macro')
  const TABS = [['macro','🌍 Macro Calculators'],['elasticity','⚖ Elasticity'],['market','📈 Market Equilibrium'],['formulas','📚 Formula Library']]
  return (
    <div>
      <div className={s.tabs}>
        {TABS.map(([id, label]) => (
          <button key={id} className={`${s.tab} ${tab === id ? s.tabActive : ''}`} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>
      <div className={s.panel}>
        {tab === 'macro' && <MacroCalc />}
        {tab === 'elasticity' && <ElasticityCalc />}
        {tab === 'market' && <MarketEquilibrium />}
        {tab === 'formulas' && <FormulaLibrary />}
      </div>
    </div>
  )
}
