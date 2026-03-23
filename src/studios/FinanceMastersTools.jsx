import { useState } from 'react'
import s from './StudioTools.module.css'

/* ─────────────────────────────────────────
   Time Value of Money
───────────────────────────────────────── */
const TVM_MODES = {
  fv:  { label: 'Future Value (FV)', formula: 'FV = PV × (1 + r)ⁿ  or  FV = PMT × [((1+r)ⁿ−1)/r]', fields: [['pv','Present Value (PV)'],['pmt','Annuity Payment (PMT, 0 if lump sum)'],['r','Rate per Period (e.g. 0.05)'],['n','Number of Periods (n)']], calc: ({pv,pmt,r,n}) => { const rn = Math.pow(1+r,n); return pv*rn + (r ? pmt*((rn-1)/r) : pmt*n) }, unit: 'FV ($)' },
  pv:  { label: 'Present Value (PV)', formula: 'PV = FV / (1 + r)ⁿ  or  PV = PMT × [1−(1+r)⁻ⁿ]/r', fields: [['fv','Future Value (FV, 0 if annuity only)'],['pmt','Annuity Payment (PMT, 0 if lump sum)'],['r','Rate per Period'],['n','Number of Periods']], calc: ({fv,pmt,r,n}) => { const rn = Math.pow(1+r,n); return fv/rn + (r ? pmt*((1-1/rn)/r) : pmt*n) }, unit: 'PV ($)' },
  r:   { label: 'Rate of Return (r)', formula: 'r = (FV/PV)^(1/n) − 1', fields: [['pv','Present Value (PV)'],['fv','Future Value (FV)'],['n','Number of Periods']], calc: ({pv,fv,n}) => pv&&n ? Math.pow(fv/pv,1/n)-1 : NaN, unit: 'r (decimal)' },
  n:   { label: 'Number of Periods (n)', formula: 'n = ln(FV/PV) / ln(1 + r)', fields: [['pv','Present Value (PV)'],['fv','Future Value (FV)'],['r','Rate per Period']], calc: ({pv,fv,r}) => pv&&r ? Math.log(fv/pv)/Math.log(1+r) : NaN, unit: 'periods' },
  nper:{ label: 'NPER — Annuity Payoff Periods', formula: 'n = ln(PMT/(PMT−PV×r)) / ln(1+r)', fields: [['pv','Loan / PV ($)'],['pmt','Payment per Period (PMT)'],['r','Rate per Period']], calc: ({pv,pmt,r}) => r&&pmt>(pv*r) ? Math.log(pmt/(pmt-pv*r))/Math.log(1+r) : NaN, unit: 'periods' },
}

function TVMCalc() {
  const [mode, setMode] = useState('fv')
  const [vals, setVals] = useState({})
  const set = (k) => (e) => setVals(v => ({ ...v, [k]: e.target.value }))
  const n = (k) => parseFloat(vals[k]) || 0
  const current = TVM_MODES[mode]
  const params = Object.fromEntries(current.fields.map(([k]) => [k, n(k)]))
  const result = current.calc(params)
  const fmt = (v) => isNaN(v)||!isFinite(v) ? '—' : parseFloat(v.toFixed(6)).toLocaleString()
  return (
    <div>
      <div className={s.filterRow}>
        {Object.entries(TVM_MODES).map(([id, c]) => (
          <button key={id} className={`${s.filterBtn} ${mode===id?s.filterBtnActive:''}`} onClick={() => { setMode(id); setVals({}) }}>{c.label}</button>
        ))}
      </div>
      <div className={s.addForm}>
        <div className={s.categoryLabel}>{current.formula}</div>
        <div className={s.formGrid}>
          {current.fields.map(([k, label]) => (
            <div key={k} className={s.inputGroup}>
              <label className={s.inputLabel}>{label}</label>
              <input className={s.input} type="number" step="any" placeholder="0" value={vals[k]||''} onChange={set(k)} />
            </div>
          ))}
        </div>
      </div>
      <div className={s.converterResult}>
        <div className={s.resultLabel}>{current.label}</div>
        <div className={s.resultValue}>{fmt(result)} <span style={{ fontSize:16, color:'var(--mist)' }}>{current.unit}</span></div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   Bond Pricing
───────────────────────────────────────── */
function BondCalc() {
  const [face, setFace] = useState('')
  const [coupon, setCoupon] = useState('')
  const [ytm, setYtm] = useState('')
  const [periods, setPeriods] = useState('')
  const [freq, setFreq] = useState('2') // semi-annual default

  const f = parseFloat(face) || 0
  const c = parseFloat(coupon) / 100 || 0
  const y = parseFloat(ytm) / 100 || 0
  const n = parseInt(periods) || 0
  const m = parseInt(freq) || 2
  const couponPmt = (c * f) / m
  const yPerPeriod = y / m
  const nPeriods = n * m
  const pvCoupons = yPerPeriod ? couponPmt * (1 - Math.pow(1+yPerPeriod,-nPeriods)) / yPerPeriod : couponPmt * nPeriods
  const pvFace = f / Math.pow(1+yPerPeriod, nPeriods)
  const price = pvCoupons + pvFace
  const premium = price > f ? 'Trading at PREMIUM (YTM < Coupon Rate)' : price < f ? 'Trading at DISCOUNT (YTM > Coupon Rate)' : 'Trading at PAR'
  const currentYield = f && price ? (couponPmt * m / price * 100).toFixed(4) : null
  const fmt = (v) => isNaN(v)||!isFinite(v)||!f||!n ? '—' : v.toFixed(4)

  return (
    <div>
      <div className={s.addForm}>
        <div className={s.categoryLabel}>Price = Σ [C/(1+y/m)ᵗ] + F/(1+y/m)ⁿ</div>
        <div className={s.formGrid}>
          <div className={s.inputGroup}><label className={s.inputLabel}>Face Value / Par ($)</label><input className={s.input} type="number" placeholder="1000" value={face} onChange={e=>setFace(e.target.value)} /></div>
          <div className={s.inputGroup}><label className={s.inputLabel}>Annual Coupon Rate (%)</label><input className={s.input} type="number" placeholder="6" value={coupon} onChange={e=>setCoupon(e.target.value)} /></div>
          <div className={s.inputGroup}><label className={s.inputLabel}>Yield to Maturity / YTM (%)</label><input className={s.input} type="number" step="any" placeholder="5" value={ytm} onChange={e=>setYtm(e.target.value)} /></div>
          <div className={s.inputGroup}><label className={s.inputLabel}>Years to Maturity</label><input className={s.input} type="number" placeholder="10" value={periods} onChange={e=>setPeriods(e.target.value)} /></div>
          <div className={s.inputGroup}>
            <label className={s.inputLabel}>Coupon Frequency</label>
            <div className={s.filterRow} style={{ margin: 0, gap: 6 }}>
              {[['1','Annual'],['2','Semi-Annual'],['4','Quarterly']].map(([v,l]) => (
                <button key={v} className={`${s.filterBtn} ${freq===v?s.filterBtnActive:''}`} style={{ fontSize:12, padding:'5px 10px' }} onClick={() => setFreq(v)}>{l}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
      {f && n && y ? (
        <div className={s.converterResult}>
          <div className={s.resultLabel}>Bond Price</div>
          <div className={s.resultValue}>${fmt(price)}</div>
          <div style={{ fontSize:13, color:'var(--mist)', marginTop:8 }}>{premium}</div>
          <div style={{ fontSize:13, color:'var(--mist)', marginTop:4 }}>PV of Coupons: ${fmt(pvCoupons)} · PV of Face: ${fmt(pvFace)}</div>
          {currentYield && <div style={{ fontSize:13, color:'var(--gold)', marginTop:4 }}>Current Yield: {currentYield}%</div>}
        </div>
      ) : null}
    </div>
  )
}

/* ─────────────────────────────────────────
   CAPM & Portfolio
───────────────────────────────────────── */
const CAPM_CALCS = {
  capm:  { label: 'CAPM — Expected Return', formula: 'E(R) = Rf + β × (Rm − Rf)', fields: [['rf','Risk-Free Rate Rf (%)'],['beta','Beta (β)'],['rm','Market Return Rm (%)']], calc: ({rf,beta,rm}) => rf + beta*(rm-rf), unit: '% expected return' },
  beta:  { label: 'Beta (β)', formula: 'β = Cov(Ri, Rm) / Var(Rm)', fields: [['cov','Cov(Asset, Market)'],['varM','Var(Market)']], calc: ({cov,varM}) => varM ? cov/varM : NaN, unit: 'β' },
  alpha: { label: 'Jensen\'s Alpha', formula: 'α = Rp − [Rf + β(Rm − Rf)]', fields: [['rp','Portfolio Return Rp (%)'],['rf','Risk-Free Rate Rf (%)'],['beta','Beta (β)'],['rm','Market Return Rm (%)']], calc: ({rp,rf,beta,rm}) => rp-(rf+beta*(rm-rf)), unit: '% alpha' },
  sharpe:{ label: 'Sharpe Ratio', formula: 'S = (Rp − Rf) / σp', fields: [['rp','Portfolio Return Rp (%)'],['rf','Risk-Free Rate Rf (%)'],['sigma','Std Dev σp (%)']], calc: ({rp,rf,sigma}) => sigma ? (rp-rf)/sigma : NaN, unit: 'Sharpe ratio' },
  treynor:{ label: 'Treynor Ratio', formula: 'T = (Rp − Rf) / β', fields: [['rp','Portfolio Return Rp (%)'],['rf','Risk-Free Rate Rf (%)'],['beta','Beta (β)']], calc: ({rp,rf,beta}) => beta ? (rp-rf)/beta : NaN, unit: 'Treynor ratio' },
  sml:   { label: 'Security Market Line — Fair Price', formula: 'If E(R) > CAPM → Underpriced; < CAPM → Overpriced', fields: [['actualR','Actual Return (%)'],['rf','Risk-Free Rate Rf (%)'],['beta','Beta (β)'],['rm','Market Return Rm (%)']], calc: ({actualR,rf,beta,rm}) => actualR-(rf+beta*(rm-rf)), unit: '% above/below SML' },
}

function CAPMCalc() {
  const [mode, setMode] = useState('capm')
  const [vals, setVals] = useState({})
  const set = (k) => (e) => setVals(v => ({ ...v, [k]: e.target.value }))
  const n = (k) => parseFloat(vals[k]) || 0
  const current = CAPM_CALCS[mode]
  const params = Object.fromEntries(current.fields.map(([k]) => [k, n(k)]))
  const result = current.calc(params)
  const fmt = (v) => isNaN(v)||!isFinite(v) ? '—' : parseFloat(v.toFixed(4)).toLocaleString()
  const interpret = () => {
    if (isNaN(result)||!isFinite(result)) return null
    if (mode==='sml') return result > 0 ? `✅ +${result.toFixed(2)}% → Underpriced — plots ABOVE SML. Buy signal.` : result < 0 ? `⚠ ${result.toFixed(2)}% → Overpriced — plots BELOW SML. Avoid / Sell.` : '⚖ Fairly priced — on the SML.'
    if (mode==='sharpe') return result > 1 ? '✅ Excellent (>1)' : result > 0.5 ? '🟡 Good (0.5–1)' : '⚠ Poor (<0.5)'
    if (mode==='alpha') return result > 0 ? `✅ Positive alpha: outperforming by ${result.toFixed(2)}%` : `⚠ Negative alpha: underperforming by ${Math.abs(result).toFixed(2)}%`
    return null
  }
  return (
    <div>
      <div className={s.filterRow}>
        {Object.entries(CAPM_CALCS).map(([id, c]) => (
          <button key={id} className={`${s.filterBtn} ${mode===id?s.filterBtnActive:''}`} onClick={() => { setMode(id); setVals({}) }}>{c.label}</button>
        ))}
      </div>
      <div className={s.addForm}>
        <div className={s.categoryLabel}>{current.formula}</div>
        <div className={s.formGrid}>
          {current.fields.map(([k, label]) => (
            <div key={k} className={s.inputGroup}>
              <label className={s.inputLabel}>{label}</label>
              <input className={s.input} type="number" step="any" placeholder="0" value={vals[k]||''} onChange={set(k)} />
            </div>
          ))}
        </div>
      </div>
      <div className={s.converterResult}>
        <div className={s.resultLabel}>{current.label}</div>
        <div className={s.resultValue}>{fmt(result)} <span style={{ fontSize:16, color:'var(--mist)' }}>{current.unit}</span></div>
        {interpret() && <div style={{ fontSize:13, color:'var(--mist)', marginTop:8 }}>{interpret()}</div>}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   WACC
───────────────────────────────────────── */
function WACCCalc() {
  const [e, setE] = useState('')    // equity value
  const [d, setD] = useState('')    // debt value
  const [re, setRe] = useState('')  // cost of equity %
  const [rd, setRd] = useState('')  // pre-tax cost of debt %
  const [tax, setTax] = useState('')// tax rate %

  const ev = parseFloat(e)||0, dv = parseFloat(d)||0
  const rev = parseFloat(re)/100||0, rdv = parseFloat(rd)/100||0, tv = parseFloat(tax)/100||0
  const v = ev + dv
  const wacc = v ? (ev/v)*rev + (dv/v)*rdv*(1-tv) : NaN
  const fmt = (v) => isNaN(v)||!isFinite(v) ? '—' : (v*100).toFixed(4)
  const wE = v ? ((ev/v)*100).toFixed(1) : 0
  const wD = v ? ((dv/v)*100).toFixed(1) : 0
  return (
    <div>
      <div className={s.addForm}>
        <div className={s.categoryLabel}>WACC = (E/V)×Re + (D/V)×Rd×(1−T)     where V = E + D</div>
        <div className={s.formGrid}>
          <div className={s.inputGroup}><label className={s.inputLabel}>Market Value of Equity E ($)</label><input className={s.input} type="number" placeholder="6000000" value={e} onChange={ev=>setE(ev.target.value)} /></div>
          <div className={s.inputGroup}><label className={s.inputLabel}>Market Value of Debt D ($)</label><input className={s.input} type="number" placeholder="4000000" value={d} onChange={ev=>setD(ev.target.value)} /></div>
          <div className={s.inputGroup}><label className={s.inputLabel}>Cost of Equity Re (%)</label><input className={s.input} type="number" step="any" placeholder="12" value={re} onChange={ev=>setRe(ev.target.value)} /></div>
          <div className={s.inputGroup}><label className={s.inputLabel}>Pre-Tax Cost of Debt Rd (%)</label><input className={s.input} type="number" step="any" placeholder="6" value={rd} onChange={ev=>setRd(ev.target.value)} /></div>
          <div className={s.inputGroup}><label className={s.inputLabel}>Corporate Tax Rate (%)</label><input className={s.input} type="number" step="any" placeholder="25" value={tax} onChange={ev=>setTax(ev.target.value)} /></div>
        </div>
      </div>
      {ev && dv ? (
        <div className={s.converterResult}>
          <div className={s.resultLabel}>WACC</div>
          <div className={s.resultValue}>{fmt(wacc)}%</div>
          <div style={{ fontSize:13, color:'var(--mist)', marginTop:8 }}>
            Weight of Equity: {wE}% · Weight of Debt: {wD}% · After-tax Rd: {fmt(rdv*(1-tv))}%
          </div>
          <div style={{ fontSize:12, color:'var(--mist)', marginTop:4 }}>
            WACC = ({wE}% × {fmt(rev)}%) + ({wD}% × {fmt(rdv*(1-tv))}%) = {fmt(wacc)}%
          </div>
          <div style={{ fontSize:12, color: wacc>0.15?'#e05c6e':wacc>0.08?'var(--gold)':'var(--emerald-light)', marginTop:6 }}>
            {wacc>0.15 ? '⚠ High cost of capital — hard hurdle rate for investments.' : wacc>0.08 ? '🟡 Moderate WACC — typical for leveraged firms.' : '✅ Low WACC — strong, low-cost capital structure.'}
          </div>
        </div>
      ) : null}
    </div>
  )
}

/* ─────────────────────────────────────────
   Valuation Models
───────────────────────────────────────── */
const VAL_MODELS = {
  ddm: { label: 'Gordon Growth Model (DDM)', formula: 'P = D₁ / (Ke − g)', fields: [['d1','Next Dividend D₁ ($)'],['ke','Cost of Equity Ke (%)'],['g','Constant Growth Rate g (%)']], calc: ({d1,ke,g}) => (ke>g) ? d1/(((ke-g)/100)) : NaN, unit: '$ fair value', note: 'Assumes Ke > g (sustainable growth). For stable, dividend-paying firms.' },
  peg: { label: 'PEG Ratio', formula: 'PEG = P/E ÷ EPS Growth Rate', fields: [['pe','Price-to-Earnings (P/E) Ratio'],['g','EPS Growth Rate (%)']], calc: ({pe,g}) => g ? pe/g : NaN, unit: 'PEG ratio', note: 'PEG < 1 → potentially undervalued relative to growth. PEG > 2 → possibly overpriced.' },
  dcf1: { label: 'Simple DCF (1-stage)', formula: 'V = FCF₁ / (WACC − g)', fields: [['fcf','Next Year FCF ($)'],['wacc','WACC (%)'],['g','Perpetual Growth g (%)']], calc: ({fcf,wacc,g}) => (wacc>g) ? fcf/((wacc-g)/100) : NaN, unit: '$ intrinsic value', note: 'Gordon Growth applied to Free Cash Flow. Requires WACC > g.' },
  ev:   { label: 'EV / EBITDA Multiple', formula: 'EV = EBITDA × Multiple', fields: [['ebitda','EBITDA ($)'],['multiple','Industry EV/EBITDA Multiple'],['netDebt','Net Debt ($)']], calc: ({ebitda,multiple,netDebt}) => ebitda*multiple-netDebt, unit: '$ equity value', note: 'Subtract net debt from EV to get equity value. Multiple from comparable firms.' },
}

function ValuationCalc() {
  const [mode, setMode] = useState('ddm')
  const [vals, setVals] = useState({})
  const set = (k) => (e) => setVals(v => ({ ...v, [k]: e.target.value }))
  const n = (k) => parseFloat(vals[k]) || 0
  const current = VAL_MODELS[mode]
  const params = Object.fromEntries(current.fields.map(([k]) => [k, n(k)]))
  const result = current.calc(params)
  const fmt = (v) => isNaN(v)||!isFinite(v) ? 'N/A (check inputs)' : parseFloat(v.toFixed(4)).toLocaleString()
  const interpret = () => {
    if (isNaN(result)||!isFinite(result)) return null
    if (mode==='peg') return result<1 ? '✅ PEG < 1 — potentially undervalued relative to growth.' : result<2 ? '🟡 PEG 1–2 — fair valued.' : '⚠ PEG > 2 — potentially overvalued.'
    return null
  }
  return (
    <div>
      <div className={s.filterRow}>
        {Object.entries(VAL_MODELS).map(([id, c]) => (
          <button key={id} className={`${s.filterBtn} ${mode===id?s.filterBtnActive:''}`} onClick={() => { setMode(id); setVals({}) }}>{c.label}</button>
        ))}
      </div>
      <div className={s.addForm}>
        <div className={s.categoryLabel}>{current.formula}</div>
        <div className={s.formGrid}>
          {current.fields.map(([k, label]) => (
            <div key={k} className={s.inputGroup}>
              <label className={s.inputLabel}>{label}</label>
              <input className={s.input} type="number" step="any" placeholder="0" value={vals[k]||''} onChange={set(k)} />
            </div>
          ))}
        </div>
        <div style={{ fontSize:12, color:'var(--mist)', marginTop:8, fontStyle:'italic' }}>{current.note}</div>
      </div>
      <div className={s.converterResult}>
        <div className={s.resultLabel}>{current.label}</div>
        <div className={s.resultValue}>{fmt(result)} <span style={{ fontSize:16, color:'var(--mist)' }}>{current.unit}</span></div>
        {interpret() && <div style={{ fontSize:13, color:'var(--mist)', marginTop:8 }}>{interpret()}</div>}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   Duration & Convexity
───────────────────────────────────────── */
function DurationCalc() {
  const [face, setFace] = useState('')
  const [coupon, setCoupon] = useState('')
  const [ytm, setYtm] = useState('')
  const [years, setYears] = useState('')
  const [freq, setFreq] = useState('2')

  const f = parseFloat(face)||0, c = parseFloat(coupon)/100||0, y = parseFloat(ytm)/100||0
  const n = parseInt(years)||0, m = parseInt(freq)||2
  const cpmt = (c*f)/m, yp = y/m, nTot = n*m

  let md=NaN, convex=NaN, price=NaN
  if (f&&n&&y) {
    let pv=0, wtSum=0, convSum=0
    for (let t=1; t<=nTot; t++) {
      const cf = t===nTot ? cpmt+f : cpmt
      const pvt = cf/Math.pow(1+yp,t)
      pv += pvt
      wtSum += t*pvt
      convSum += t*(t+1)*pvt
    }
    price = pv
    const macD = wtSum/pv/m // in years
    md = macD/(1+yp)
    convex = convSum / (pv * Math.pow(1+yp,2) * m*m)
  }
  const fmt = (v,dp=4) => isNaN(v)||!isFinite(v) ? '—' : v.toFixed(dp)

  return (
    <div>
      <div className={s.addForm}>
        <div className={s.categoryLabel}>Modified Duration = Macaulay Duration / (1 + y/m)  |  Convexity adjusts for curvature</div>
        <div className={s.formGrid}>
          <div className={s.inputGroup}><label className={s.inputLabel}>Face Value ($)</label><input className={s.input} type="number" placeholder="1000" value={face} onChange={e=>setFace(e.target.value)} /></div>
          <div className={s.inputGroup}><label className={s.inputLabel}>Annual Coupon Rate (%)</label><input className={s.input} type="number" placeholder="5" value={coupon} onChange={e=>setCoupon(e.target.value)} /></div>
          <div className={s.inputGroup}><label className={s.inputLabel}>YTM (%)</label><input className={s.input} type="number" step="any" placeholder="6" value={ytm} onChange={e=>setYtm(e.target.value)} /></div>
          <div className={s.inputGroup}><label className={s.inputLabel}>Years to Maturity</label><input className={s.input} type="number" placeholder="10" value={years} onChange={e=>setYears(e.target.value)} /></div>
          <div className={s.inputGroup}>
            <label className={s.inputLabel}>Coupon Frequency</label>
            <div className={s.filterRow} style={{ margin:0, gap:6 }}>
              {[['1','Annual'],['2','Semi-Annual']].map(([v,l]) => (
                <button key={v} className={`${s.filterBtn} ${freq===v?s.filterBtnActive:''}`} style={{ fontSize:12, padding:'5px 10px' }} onClick={() => setFreq(v)}>{l}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
      {!isNaN(md) && (
        <div className={s.converterResult}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:20 }}>
            <div><div className={s.resultLabel}>Bond Price</div><div className={s.resultValue}>${fmt(price,2)}</div></div>
            <div><div className={s.resultLabel}>Modified Duration</div><div className={s.resultValue}>{fmt(md)} yrs</div></div>
            <div><div className={s.resultLabel}>Convexity</div><div className={s.resultValue}>{fmt(convex)}</div></div>
          </div>
          <div style={{ fontSize:12, color:'var(--mist)', marginTop:12 }}>
            A 1% rise in yields → price change ≈ −{fmt(md)} × 1% + ½ × {fmt(convex)} × (1%)² = <strong>{fmt(-md*0.01*100 + 0.5*convex*0.0001*100, 3)}%</strong>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────
   Formula Reference
───────────────────────────────────────── */
const FORMULAS = [
  { cat: 'Capital Structure', items: [
    { name: 'Debt-to-Equity', f: 'D/E = Total Debt / Total Equity' },
    { name: 'Interest Coverage', f: 'ICR = EBIT / Interest Expense' },
    { name: 'Leverage Ratio', f: 'Total Assets / Total Equity' },
    { name: 'Degree of Financial Leverage', f: 'DFL = % ΔE P S / % ΔE B I T' },
  ]},
  { cat: 'Working Capital', items: [
    { name: 'Current Ratio', f: 'Current Assets / Current Liabilities' },
    { name: 'Quick Ratio', f: '(CA − Inventory) / CL' },
    { name: 'Cash Conversion Cycle', f: 'DIO + DSO − DPO' },
    { name: 'Net Working Capital', f: 'Current Assets − Current Liabilities' },
  ]},
  { cat: 'Derivatives & Options', items: [
    { name: 'Black-Scholes (Call)', f: 'C = S·N(d₁) − K·e^(−rT)·N(d₂)' },
    { name: 'd₁', f: '[ln(S/K) + (r + σ²/2)T] / (σ√T)' },
    { name: 'd₂', f: 'd₁ − σ√T' },
    { name: 'Put-Call Parity', f: 'C − P = S − K·e^(−rT)' },
    { name: 'Forward Price', f: 'F = S·e^(r−q)T' },
  ]},
  { cat: 'Risk Measures', items: [
    { name: 'Value at Risk (VaR)', f: 'VaR = μ − z·σ  (parametric)' },
    { name: 'Portfolio Variance (2 assets)', f: 'σ²p = w₁²σ₁² + w₂²σ₂² + 2w₁w₂σ₁σ₂ρ' },
    { name: 'Portfolio Std Dev', f: 'σp = √(σ²p)' },
    { name: 'Coefficient of Variation', f: 'CV = σ / E(R)' },
  ]},
  { cat: 'Corporate Finance', items: [
    { name: 'Net Present Value', f: 'NPV = Σ [CFt / (1+r)ᵗ] − C₀' },
    { name: 'IRR', f: 'NPV = 0 → solve for r' },
    { name: 'Payback Period', f: 'Years until Σ CF = C₀' },
    { name: 'EVA', f: 'EVA = NOPAT − (WACC × Invested Capital)' },
    { name: 'Free Cash Flow', f: 'FCF = EBIT(1−T) + D&A − ΔNWC − CapEx' },
  ]},
]

function FormulaRef() {
  const [open, setOpen] = useState(null)
  return (
    <div>
      {FORMULAS.map((group) => (
        <div key={group.cat} style={{ marginBottom:16 }}>
          <button className={`${s.filterBtn} ${open===group.cat?s.filterBtnActive:''}`} style={{ marginBottom:10, width:'100%', textAlign:'left' }} onClick={() => setOpen(open===group.cat?null:group.cat)}>
            {open===group.cat?'▼':'▶'} {group.cat}
          </button>
          {open===group.cat && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px,1fr))', gap:10 }}>
              {group.items.map((item) => (
                <div key={item.name} className={s.addForm} style={{ padding:'14px 18px', margin:0 }}>
                  <div style={{ fontSize:12, color:'var(--gold)', fontWeight:600, marginBottom:6 }}>{item.name}</div>
                  <div style={{ fontFamily:"'DM Mono',monospace", fontSize:13, color:'var(--cream)', lineHeight:1.5 }}>{item.f}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

/* ─────────────────────────────────────────
   Main Export
───────────────────────────────────────── */
const TABS = ['TVM', 'Bond Pricing', 'CAPM & Portfolio', 'WACC', 'Valuation', 'Duration', 'Formula Reference']

export default function FinanceMastersTools() {
  const [tab, setTab] = useState('TVM')
  return (
    <div className={s.root}>
      <div className={s.filterRow} style={{ flexWrap:'wrap', marginBottom:24 }}>
        {TABS.map((t) => (
          <button key={t} className={`${s.filterBtn} ${tab===t?s.filterBtnActive:''}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>
      {tab==='TVM'               && <TVMCalc />}
      {tab==='Bond Pricing'      && <BondCalc />}
      {tab==='CAPM & Portfolio'  && <CAPMCalc />}
      {tab==='WACC'              && <WACCCalc />}
      {tab==='Valuation'         && <ValuationCalc />}
      {tab==='Duration'          && <DurationCalc />}
      {tab==='Formula Reference' && <FormulaRef />}
    </div>
  )
}
