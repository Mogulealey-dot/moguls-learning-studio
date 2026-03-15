import { useState, useMemo } from 'react'
import styles from './FinancialCalculator.module.css'

/* ── Math helpers ── */
const pv   = (r, n, pmt, fv = 0) => r === 0 ? -(pmt * n + fv) : -(pmt * (1 - Math.pow(1+r,-n))/r + fv / Math.pow(1+r,n))
const fv_  = (r, n, pmt, pv_ = 0) => r === 0 ? -(pmt * n + pv_) : -(pmt * (Math.pow(1+r,n)-1)/r + pv_ * Math.pow(1+r,n))
const pmt_ = (r, n, pv_, fv_ = 0) => r === 0 ? -(pv_ + fv_)/n : -(r*(pv_*Math.pow(1+r,n)+fv_))/(Math.pow(1+r,n)-1)
const npv  = (r, cashflows) => cashflows.reduce((acc, cf, i) => acc + cf / Math.pow(1+r, i+1), 0)
const irr  = (cfs) => {
  let r = 0.1
  for (let i = 0; i < 1000; i++) {
    const f  = cfs.reduce((a, c, i) => a + c / Math.pow(1+r, i), 0)
    const df = cfs.reduce((a, c, i) => a - i*c / Math.pow(1+r, i+1), 0)
    if (Math.abs(df) < 1e-12) break
    const nr = r - f / df
    if (Math.abs(nr - r) < 1e-8) { r = nr; break }
    r = nr
  }
  return r
}
const pvifaTable = (r, n) => r === 0 ? n : (1 - Math.pow(1+r,-n))/r
const pvifTable  = (r, n) => Math.pow(1+r,-n)
const fvifTable  = (r, n) => Math.pow(1+r,n)
const fviafTable = (r, n) => r === 0 ? n : (Math.pow(1+r,n)-1)/r

/* ── Input helper ── */
function CalcInput({ label, value, onChange, placeholder, hint }) {
  return (
    <div className={styles.inputGroup}>
      <label className={styles.inputLabel}>{label}</label>
      <input
        className={styles.input}
        type="number" step="any"
        value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || '0'}
      />
      {hint && <span className={styles.hint}>{hint}</span>}
    </div>
  )
}

function ResultBox({ label, value, sub }) {
  return (
    <div className={styles.resultBox}>
      <div className={styles.resultLabel}>{label}</div>
      <div className={styles.resultValue}>{value}</div>
      {sub && <div className={styles.resultSub}>{sub}</div>}
    </div>
  )
}

/* ────────────────────────────────
   1. PRESENT VALUE / FUTURE VALUE
──────────────────────────────── */
function TVMCalc() {
  const [rate, setRate]   = useState('')
  const [nper, setNper]   = useState('')
  const [pmt,  setPmt]    = useState('')
  const [pv_v, setPv]     = useState('')
  const [fv_v, setFv]     = useState('')
  const [solve, setSolve] = useState('PV')

  const r = Number(rate) / 100
  const n = Number(nper)
  const p = Number(pmt)
  const pvVal = Number(pv_v)
  const fvVal = Number(fv_v)

  const result = useMemo(() => {
    try {
      if (solve === 'PV') return { label: 'Present Value', val: pv(r, n, p, fvVal) }
      if (solve === 'FV') return { label: 'Future Value',  val: fv_(r, n, p, pvVal) }
      if (solve === 'PMT') return { label: 'Payment',      val: pmt_(r, n, pvVal, fvVal) }
    } catch { return null }
    return null
  }, [rate, nper, pmt, pv_v, fv_v, solve])

  const fmt = (v) => isNaN(v) || !isFinite(v) ? '—' : `$${Math.abs(v).toLocaleString('en',{minimumFractionDigits:2,maximumFractionDigits:2})}`

  return (
    <div className={styles.calcPanel}>
      <h3 className={styles.calcTitle}>⏱ Time Value of Money</h3>
      <p className={styles.calcDesc}>Calculate PV, FV, or Payment for ordinary annuities and lump sums.</p>

      <div className={styles.solveRow}>
        <span className={styles.solveLabel}>Solve for:</span>
        {['PV','FV','PMT'].map((s) => (
          <button key={s} className={`${styles.solveBtn} ${solve===s ? styles.solveBtnActive : ''}`} onClick={() => setSolve(s)}>{s}</button>
        ))}
      </div>

      <div className={styles.inputGrid}>
        <CalcInput label="Interest Rate (% per period)" value={rate} onChange={setRate} placeholder="e.g. 10" hint="Annual rate ÷ periods" />
        <CalcInput label="Number of Periods (N)" value={nper} onChange={setNper} placeholder="e.g. 5" />
        {solve !== 'PMT' && <CalcInput label="Payment (PMT)" value={pmt} onChange={setPmt} placeholder="0 for lump sum" />}
        {solve !== 'PV'  && <CalcInput label="Present Value (PV)" value={pv_v} onChange={setPv} placeholder="e.g. -1000" hint="Outflows are negative" />}
        {solve !== 'FV'  && <CalcInput label="Future Value (FV)" value={fv_v} onChange={setFv} placeholder="0 if annuity only" />}
      </div>

      {result && (
        <div className={styles.resultsRow}>
          <ResultBox label={result.label} value={fmt(result.val)} sub={result.val < 0 ? 'Cash outflow' : 'Cash inflow'} />
          {solve === 'PV' && Number(rate) > 0 && Number(nper) > 0 && (
            <ResultBox label="PVIF Factor" value={pvifTable(r,n).toFixed(6)} sub={`at ${rate}% for ${nper} periods`} />
          )}
          {solve === 'PV' && Number(pmt) !== 0 && Number(rate) > 0 && (
            <ResultBox label="PVIFA Factor" value={pvifaTable(r,n).toFixed(6)} sub="Annuity factor" />
          )}
        </div>
      )}
    </div>
  )
}

/* ────────────────
   2. NPV & IRR
──────────────── */
function NPVIRRCalc() {
  const [rate, setRate]       = useState('')
  const [initial, setInitial] = useState('')
  const [cfInput, setCfInput] = useState('10000, 15000, 20000, 18000, 12000')

  const parseCFs = (str) => str.split(',').map((s) => Number(s.trim())).filter((n) => !isNaN(n))

  const cashflows = useMemo(() => {
    const cfs = parseCFs(cfInput)
    return [-Math.abs(Number(initial)), ...cfs]
  }, [initial, cfInput])

  const r = Number(rate) / 100
  const npvVal = useMemo(() => {
    if (!rate || cashflows.length < 2) return null
    return cashflows.slice(1).reduce((a, cf, i) => a + cf / Math.pow(1+r, i+1), 0) + cashflows[0]
  }, [rate, cashflows])

  const irrVal = useMemo(() => {
    if (cashflows.length < 2 || !initial) return null
    try { return irr(cashflows) } catch { return null }
  }, [cashflows])

  const fmt = (v) => isNaN(v) || !isFinite(v) ? '—' : `$${v.toLocaleString('en',{minimumFractionDigits:2,maximumFractionDigits:2})}`
  const fmtPct = (v) => isNaN(v) || !isFinite(v) ? '—' : `${(v*100).toFixed(2)}%`

  return (
    <div className={styles.calcPanel}>
      <h3 className={styles.calcTitle}>📊 NPV & IRR</h3>
      <p className={styles.calcDesc}>Evaluate investment projects with Net Present Value and Internal Rate of Return.</p>

      <div className={styles.inputGrid}>
        <CalcInput label="Discount Rate (%)" value={rate} onChange={setRate} placeholder="e.g. 12" />
        <CalcInput label="Initial Investment ($)" value={initial} onChange={setInitial} placeholder="e.g. 50000" hint="Enter as positive number" />
      </div>

      <div className={styles.inputGroup} style={{ marginBottom: 20 }}>
        <label className={styles.inputLabel}>Cash Inflows by Year (comma-separated)</label>
        <input
          className={styles.input}
          value={cfInput}
          onChange={(e) => setCfInput(e.target.value)}
          placeholder="e.g. 15000, 20000, 18000, 22000"
        />
        <span className={styles.hint}>Year 1, Year 2, Year 3… (separated by commas)</span>
      </div>

      {/* CF Table */}
      {initial && parseCFs(cfInput).length > 0 && (
        <div className={styles.cfTable}>
          <table className={styles.table}>
            <thead>
              <tr><th>Year</th><th>Cash Flow</th><th>PV Factor ({rate || '?'}%)</th><th>Present Value</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>0</td>
                <td className={styles.redCell}>({fmt(Math.abs(Number(initial)))})</td>
                <td>1.000000</td>
                <td className={styles.redCell}>({fmt(Math.abs(Number(initial)))})</td>
              </tr>
              {parseCFs(cfInput).map((cf, i) => {
                const factor = r > 0 ? pvifTable(r, i+1) : 1
                const pvCF   = cf * factor
                return (
                  <tr key={i}>
                    <td>{i+1}</td>
                    <td className={styles.greenCell}>{fmt(cf)}</td>
                    <td>{r > 0 ? factor.toFixed(6) : '1.000000'}</td>
                    <td className={styles.greenCell}>{r > 0 ? fmt(pvCF) : fmt(cf)}</td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className={styles.totalLabel}>NPV</td>
                <td className={npvVal >= 0 ? styles.greenCell : styles.redCell} style={{ fontWeight: 700 }}>
                  {npvVal !== null ? fmt(npvVal) : '—'}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {(npvVal !== null || irrVal !== null) && (
        <div className={styles.resultsRow}>
          {npvVal !== null && (
            <ResultBox
              label="Net Present Value (NPV)"
              value={fmt(npvVal)}
              sub={npvVal >= 0 ? '✓ Accept — positive NPV' : '✗ Reject — negative NPV'}
            />
          )}
          {irrVal !== null && (
            <ResultBox
              label="Internal Rate of Return (IRR)"
              value={fmtPct(irrVal)}
              sub={rate ? (irrVal*100 > Number(rate) ? `✓ IRR > cost of capital (${rate}%)` : `✗ IRR < cost of capital (${rate}%)`) : 'Compare to your discount rate'}
            />
          )}
          {npvVal !== null && irrVal !== null && (
            <ResultBox
              label="Decision"
              value={npvVal >= 0 && irrVal * 100 >= Number(rate) ? '✓ ACCEPT' : '✗ REJECT'}
              sub="Based on NPV & IRR"
            />
          )}
        </div>
      )}
    </div>
  )
}

/* ──────────────────────────────────────
   3. PV / FV / PVIFA / FVIFA FACTOR TABLES
────────────────────────────────────── */
const TABLE_RATES = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,18,20,25]
const TABLE_PERIODS = [1,2,3,4,5,6,7,8,9,10,12,15,20,25,30]

function FactorTable({ type }) {
  const fn = {
    PVIF:  pvifTable,
    PVIFA: pvifaTable,
    FVIF:  fvifTable,
    FVIFA: fviafTable,
  }[type]

  const titles = {
    PVIF:  'Present Value Interest Factor (PVIF) — Lump Sum',
    PVIFA: 'Present Value Interest Factor of Annuity (PVIFA)',
    FVIF:  'Future Value Interest Factor (FVIF) — Lump Sum',
    FVIFA: 'Future Value Interest Factor of Annuity (FVIFA)',
  }

  return (
    <div className={styles.factorTable}>
      <h4 className={styles.tableTitle}>{titles[type]}</h4>
      <div className={styles.tableScroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>n \ r</th>
              {TABLE_RATES.map((r) => <th key={r}>{r}%</th>)}
            </tr>
          </thead>
          <tbody>
            {TABLE_PERIODS.map((n) => (
              <tr key={n}>
                <td className={styles.nCol}>{n}</td>
                {TABLE_RATES.map((r) => (
                  <td key={r} className={styles.factorCell}>{fn(r/100, n).toFixed(4)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ──────────────────────
   4. DEPRECIATION
────────────────────── */
function DepreciationCalc() {
  const [cost,     setCost]     = useState('')
  const [salvage,  setSalvage]  = useState('')
  const [life,     setLife]     = useState('')
  const [method,   setMethod]   = useState('SL')

  const C = Number(cost)
  const S = Number(salvage)
  const N = Number(life)

  const schedule = useMemo(() => {
    if (!C || !N || N <= 0) return []
    const rows = []
    let book = C
    for (let yr = 1; yr <= N; yr++) {
      let dep = 0
      if (method === 'SL') {
        dep = (C - S) / N
      } else if (method === 'DDB') {
        dep = Math.min(book - S, (2/N) * book)
      } else if (method === 'SYD') {
        const sydigits = N * (N+1) / 2
        dep = ((N - yr + 1) / sydigits) * (C - S)
      }
      dep = Math.max(0, dep)
      book = Math.max(S, book - dep)
      rows.push({ year: yr, dep, accDep: C - book - (yr === 1 ? 0 : rows[yr-2].book - book + dep), book })
    }
    // recalculate accDep cleanly
    let acc = 0
    return rows.map((r) => { acc += r.dep; return { ...r, accDep: acc } })
  }, [cost, salvage, life, method])

  const fmt = (v) => `$${Number(v).toLocaleString('en',{minimumFractionDigits:2,maximumFractionDigits:2})}`

  return (
    <div className={styles.calcPanel}>
      <h3 className={styles.calcTitle}>🏭 Depreciation Schedule</h3>
      <p className={styles.calcDesc}>Generate full depreciation schedules — Straight-Line, Double-Declining Balance, or Sum-of-Years-Digits.</p>

      <div className={styles.inputGrid}>
        <CalcInput label="Asset Cost ($)" value={cost} onChange={setCost} placeholder="e.g. 100000" />
        <CalcInput label="Salvage Value ($)" value={salvage} onChange={setSalvage} placeholder="e.g. 10000" />
        <CalcInput label="Useful Life (years)" value={life} onChange={setLife} placeholder="e.g. 5" />
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>Depreciation Method</label>
          <select className={styles.select} value={method} onChange={(e) => setMethod(e.target.value)}>
            <option value="SL">Straight-Line (SL)</option>
            <option value="DDB">Double-Declining Balance (DDB)</option>
            <option value="SYD">Sum-of-Years-Digits (SYD)</option>
          </select>
        </div>
      </div>

      {schedule.length > 0 && (
        <div className={styles.cfTable}>
          <table className={styles.table}>
            <thead>
              <tr><th>Year</th><th>Depreciation</th><th>Accumulated Dep.</th><th>Book Value</th></tr>
            </thead>
            <tbody>
              {schedule.map((r) => (
                <tr key={r.year}>
                  <td>{r.year}</td>
                  <td className={styles.goldCell}>{fmt(r.dep)}</td>
                  <td>{fmt(r.accDep)}</td>
                  <td className={styles.greenCell}>{fmt(r.book)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td className={styles.totalLabel}>Total</td>
                <td className={styles.goldCell} style={{ fontWeight: 700 }}>{fmt(schedule.reduce((a,r)=>a+r.dep,0))}</td>
                <td></td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  )
}

/* ──────────────────────
   5. LOAN AMORTIZATION
────────────────────── */
function LoanCalc() {
  const [principal, setPrincipal] = useState('')
  const [rate,      setRate]      = useState('')
  const [years,     setYears]     = useState('')
  const [showFull,  setShowFull]  = useState(false)

  const P = Number(principal)
  const r = Number(rate) / 100 / 12
  const n = Number(years) * 12

  const monthlyPmt = useMemo(() => {
    if (!P || !n || !rate) return null
    if (r === 0) return P / n
    return P * r * Math.pow(1+r,n) / (Math.pow(1+r,n)-1)
  }, [P, r, n, rate])

  const schedule = useMemo(() => {
    if (!monthlyPmt) return []
    const rows = []
    let bal = P
    for (let mo = 1; mo <= n; mo++) {
      const interest = bal * r
      const principal_ = monthlyPmt - interest
      bal = Math.max(0, bal - principal_)
      rows.push({ mo, payment: monthlyPmt, interest, principal: principal_, balance: bal })
      if (bal < 0.01) break
    }
    return rows
  }, [monthlyPmt, P, r, n])

  const totalPaid     = monthlyPmt ? monthlyPmt * n : 0
  const totalInterest = totalPaid - P
  const fmt = (v) => `$${Number(v).toLocaleString('en',{minimumFractionDigits:2,maximumFractionDigits:2})}`
  const displayRows = showFull ? schedule : schedule.slice(0, 12)

  return (
    <div className={styles.calcPanel}>
      <h3 className={styles.calcTitle}>🏦 Loan Amortization</h3>
      <p className={styles.calcDesc}>Full amortization schedule showing interest vs principal breakdown each month.</p>

      <div className={styles.inputGrid}>
        <CalcInput label="Loan Principal ($)" value={principal} onChange={setPrincipal} placeholder="e.g. 500000" />
        <CalcInput label="Annual Interest Rate (%)" value={rate} onChange={setRate} placeholder="e.g. 8.5" />
        <CalcInput label="Loan Term (years)" value={years} onChange={setYears} placeholder="e.g. 10" />
      </div>

      {monthlyPmt && (
        <>
          <div className={styles.resultsRow}>
            <ResultBox label="Monthly Payment" value={fmt(monthlyPmt)} />
            <ResultBox label="Total Amount Paid" value={fmt(totalPaid)} />
            <ResultBox label="Total Interest Paid" value={fmt(totalInterest)} sub={`${((totalInterest/P)*100).toFixed(1)}% of principal`} />
          </div>

          <div className={styles.cfTable}>
            <table className={styles.table}>
              <thead>
                <tr><th>Month</th><th>Payment</th><th>Interest</th><th>Principal</th><th>Balance</th></tr>
              </thead>
              <tbody>
                {displayRows.map((r) => (
                  <tr key={r.mo}>
                    <td>{r.mo}</td>
                    <td className={styles.goldCell}>{fmt(r.payment)}</td>
                    <td className={styles.redCell}>{fmt(r.interest)}</td>
                    <td className={styles.greenCell}>{fmt(r.principal)}</td>
                    <td>{fmt(r.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {schedule.length > 12 && (
            <button className={styles.showMoreBtn} onClick={() => setShowFull((v) => !v)}>
              {showFull ? 'Show less ↑' : `Show all ${schedule.length} months ↓`}
            </button>
          )}
        </>
      )}
    </div>
  )
}

/* ──────────────────────────────────
   MAIN FINANCIAL CALCULATOR PAGE
────────────────────────────────── */
const CALC_TABS = [
  { id: 'tvm',   label: 'TVM',          icon: '⏱' },
  { id: 'npvirr',label: 'NPV & IRR',    icon: '📊' },
  { id: 'loan',  label: 'Loan',         icon: '🏦' },
  { id: 'dep',   label: 'Depreciation', icon: '🏭' },
  { id: 'pvif',  label: 'PVIF Table',   icon: '📋' },
  { id: 'pvifa', label: 'PVIFA Table',  icon: '📋' },
  { id: 'fvif',  label: 'FVIF Table',   icon: '📋' },
  { id: 'fvifa', label: 'FVIFA Table',  icon: '📋' },
]

export default function FinancialCalculator() {
  const [tab, setTab] = useState('tvm')

  return (
    <section id="calculator" className="section" style={{ background: 'rgba(26,107,74,0.04)', borderTop: '1px solid rgba(26,107,74,0.15)' }}>
      <div className="section-header">
        <p className="section-eyebrow">✦ Finance & Accounting</p>
        <h2 className="section-title">Financial <em>Calculator</em></h2>
        <div className="divider" />
        <p style={{ marginTop: 16, fontSize: 14, color: 'var(--mist)' }}>
          TVM, NPV, IRR, Depreciation, Loan Amortization, and complete factor tables — all in one place.
        </p>
      </div>

      <div className={styles.tabs}>
        {CALC_TABS.map((t) => (
          <button key={t.id} className={`${styles.tabBtn} ${tab === t.id ? styles.tabActive : ''}`} onClick={() => setTab(t.id)}>
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      <div className={styles.content}>
        {tab === 'tvm'    && <TVMCalc />}
        {tab === 'npvirr' && <NPVIRRCalc />}
        {tab === 'loan'   && <LoanCalc />}
        {tab === 'dep'    && <DepreciationCalc />}
        {tab === 'pvif'   && <FactorTable type="PVIF" />}
        {tab === 'pvifa'  && <FactorTable type="PVIFA" />}
        {tab === 'fvif'   && <FactorTable type="FVIF" />}
        {tab === 'fvifa'  && <FactorTable type="FVIFA" />}
      </div>
    </section>
  )
}
