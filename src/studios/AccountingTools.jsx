import { useState, useMemo } from 'react'
import s from './StudioTools.module.css'

/* ── Ratio Calculator ── */
function RatioCalculator() {
  const [vals, setVals] = useState({})
  const set = (k) => (e) => setVals(v => ({ ...v, [k]: e.target.value }))
  const n = (k) => parseFloat(vals[k]) || 0
  const safe = (a, b) => b ? a / b : NaN
  const fmt = (v, pct) => isNaN(v) || !isFinite(v) ? '—' : pct ? `${(v * 100).toFixed(2)}%` : v.toFixed(3)

  const fields = [
    ['revenue','Revenue'], ['cogs','COGS'], ['grossProfit','Gross Profit'],
    ['ebit','EBIT'], ['interestExpense','Interest Expense'], ['netIncome','Net Income'],
    ['currentAssets','Current Assets'], ['inventory','Inventory'], ['cash','Cash'],
    ['currentLiabilities','Current Liabilities'], ['totalAssets','Total Assets'],
    ['totalLiabilities','Total Liabilities'], ['equity','Shareholders\' Equity'],
    ['operatingCashFlow','Operating Cash Flow'], ['receivables','Receivables'],
  ]

  const groups = [
    { name: 'Liquidity', items: [
      { name: 'Current Ratio',   v: safe(n('currentAssets'), n('currentLiabilities')), bench: '≥ 2.0' },
      { name: 'Quick Ratio',     v: safe(n('currentAssets') - n('inventory'), n('currentLiabilities')), bench: '≥ 1.0' },
      { name: 'Cash Ratio',      v: safe(n('cash'), n('currentLiabilities')), bench: '≥ 0.5' },
      { name: 'OCF Ratio',       v: safe(n('operatingCashFlow'), n('currentLiabilities')), bench: '≥ 1.0' },
    ]},
    { name: 'Profitability', items: [
      { name: 'Gross Margin',    v: safe(n('grossProfit'), n('revenue')), pct: true, bench: 'Higher = better' },
      { name: 'Operating Margin',v: safe(n('ebit'), n('revenue')), pct: true, bench: '> 10%' },
      { name: 'Net Margin',      v: safe(n('netIncome'), n('revenue')), pct: true, bench: '> 5%' },
      { name: 'ROA',             v: safe(n('netIncome'), n('totalAssets')), pct: true, bench: '> 5%' },
      { name: 'ROE',             v: safe(n('netIncome'), n('equity')), pct: true, bench: '> 15%' },
    ]},
    { name: 'Leverage', items: [
      { name: 'Debt-to-Equity',  v: safe(n('totalLiabilities'), n('equity')), bench: '< 1.0' },
      { name: 'Debt Ratio',      v: safe(n('totalLiabilities'), n('totalAssets')), bench: '< 0.5' },
      { name: 'Equity Ratio',    v: safe(n('equity'), n('totalAssets')), bench: '> 0.5' },
      { name: 'Interest Coverage',v: safe(n('ebit'), n('interestExpense')), bench: '> 3×' },
    ]},
    { name: 'Efficiency', items: [
      { name: 'Asset Turnover',  v: safe(n('revenue'), n('totalAssets')), bench: 'Higher = better' },
      { name: 'Inv. Turnover',   v: safe(n('cogs'), n('inventory')), bench: 'Higher = better' },
      { name: 'DSO (days)',      v: safe(n('receivables') * 365, n('revenue')), bench: 'Lower = better' },
      { name: 'DIO (days)',      v: safe(n('inventory') * 365, n('cogs')), bench: 'Lower = better' },
    ]},
  ]

  return (
    <div>
      <div className={s.addForm}>
        <div className={s.formGrid} style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
          {fields.map(([k, label]) => (
            <div key={k} className={s.inputGroup}>
              <label className={s.inputLabel}>{label}</label>
              <input className={s.input} type="number" placeholder="0" value={vals[k] || ''} onChange={set(k)} />
            </div>
          ))}
        </div>
      </div>
      {groups.map(g => (
        <div key={g.name}>
          <div className={s.categoryLabel}>{g.name}</div>
          <div className={s.refGrid}>
            {g.items.map((r, i) => (
              <div key={i} className={s.refCard}>
                <div className={s.refCardTitle}>{r.name}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent,var(--gold))', margin: '8px 0 4px' }}>
                  {fmt(r.v, r.pct)}
                </div>
                <div className={s.refCardDesc}>Benchmark: {r.bench}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Depreciation ── */
function DepreciationCalc() {
  const [method, setMethod] = useState('sl')
  const [cost, setCost] = useState('')
  const [salvage, setSalvage] = useState('')
  const [life, setLife] = useState('')
  const [rate, setRate] = useState('')

  const schedule = useMemo(() => {
    const cost_ = parseFloat(cost) || 0
    const salvage_ = parseFloat(salvage) || 0
    const life_ = parseInt(life) || 0
    const rate_ = parseFloat(rate) / 100 || 0
    if (!cost_ || !life_) return []
    const rows = []
    let bv = cost_
    for (let yr = 1; yr <= life_; yr++) {
      let dep = 0
      if (method === 'sl') dep = (cost_ - salvage_) / life_
      else if (method === 'ddb') dep = Math.min(bv * (rate_ || 2 / life_), bv - salvage_)
      else if (method === 'syd') { const syd = (life_ * (life_ + 1)) / 2; dep = (cost_ - salvage_) * (life_ - yr + 1) / syd }
      dep = Math.max(0, dep)
      bv = Math.max(salvage_, bv - dep)
      rows.push({ yr, dep: dep.toFixed(2), accum: (cost_ - bv).toFixed(2), bv: bv.toFixed(2) })
    }
    return rows
  }, [method, cost, salvage, life, rate])

  return (
    <div>
      <div className={s.filterRow}>
        {[['sl','Straight-Line'],['ddb','Declining Balance'],['syd','Sum-of-Years\' Digits']].map(([id, label]) => (
          <button key={id} className={`${s.filterBtn} ${method === id ? s.filterBtnActive : ''}`} onClick={() => setMethod(id)}>{label}</button>
        ))}
      </div>
      <div className={s.addForm}>
        <div className={s.formGrid}>
          <div className={s.inputGroup}><label className={s.inputLabel}>Asset Cost ($)</label><input className={s.input} type="number" placeholder="100000" value={cost} onChange={e => setCost(e.target.value)} /></div>
          <div className={s.inputGroup}><label className={s.inputLabel}>Salvage Value ($)</label><input className={s.input} type="number" placeholder="10000" value={salvage} onChange={e => setSalvage(e.target.value)} /></div>
          <div className={s.inputGroup}><label className={s.inputLabel}>Useful Life (years)</label><input className={s.input} type="number" placeholder="5" value={life} onChange={e => setLife(e.target.value)} /></div>
          {method === 'ddb' && <div className={s.inputGroup}><label className={s.inputLabel}>Rate % (blank = 2/n)</label><input className={s.input} type="number" placeholder="auto" value={rate} onChange={e => setRate(e.target.value)} /></div>}
        </div>
      </div>
      {schedule.length > 0 ? (
        <div className={s.tableWrap}>
          <table className={s.dataTable}>
            <thead><tr><th>Year</th><th>Depreciation ($)</th><th>Accumulated ($)</th><th>Book Value ($)</th></tr></thead>
            <tbody>
              {schedule.map(r => (
                <tr key={r.yr}><td>{r.yr}</td><td className={s.mono}>{r.dep}</td><td className={s.mono}>{r.accum}</td><td className={s.mono}>{r.bv}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={s.empty}><div className={s.emptyIcon}>📉</div>Enter asset details above to generate a schedule.</div>
      )}
    </div>
  )
}

/* ── Break-even ── */
function BreakEven() {
  const [fc, setFc] = useState('')
  const [vc, setVc] = useState('')
  const [p, setP] = useState('')
  const [tp, setTp] = useState('')

  const fc_ = parseFloat(fc) || 0
  const vc_ = parseFloat(vc) || 0
  const p_ = parseFloat(p) || 0
  const tp_ = parseFloat(tp) || 0
  const cm = p_ - vc_
  const cmRatio = p_ > 0 ? cm / p_ : null
  const beUnits = cm > 0 ? fc_ / cm : null
  const beRevenue = cm > 0 && cmRatio ? fc_ / cmRatio : null
  const targetUnits = cm > 0 ? (fc_ + tp_) / cm : null
  const fmt = (v) => v === null || isNaN(v) || !isFinite(v) ? '—' : v.toFixed(2)

  const cards = [
    { label: 'Contribution Margin/Unit', value: fmt(cm), note: 'Price − Variable Cost' },
    { label: 'CM Ratio', value: cmRatio !== null ? `${(cmRatio * 100).toFixed(1)}%` : '—', note: 'CM ÷ Selling Price' },
    { label: 'Break-even Units', value: fmt(beUnits), note: 'Fixed Costs ÷ CM per Unit' },
    { label: 'Break-even Revenue', value: beRevenue !== null ? `$${fmt(beRevenue)}` : '—', note: 'Fixed Costs ÷ CM Ratio' },
    { label: 'Units for Target Profit', value: fmt(targetUnits), note: '(Fixed Costs + Target) ÷ CM' },
    { label: 'Revenue for Target Profit', value: targetUnits !== null ? `$${fmt(targetUnits * p_)}` : '—', note: 'Target Units × Price' },
  ]

  return (
    <div>
      <div className={s.addForm}>
        <div className={s.formGrid}>
          <div className={s.inputGroup}><label className={s.inputLabel}>Fixed Costs ($)</label><input className={s.input} type="number" placeholder="50000" value={fc} onChange={e => setFc(e.target.value)} /></div>
          <div className={s.inputGroup}><label className={s.inputLabel}>Variable Cost/Unit ($)</label><input className={s.input} type="number" placeholder="15" value={vc} onChange={e => setVc(e.target.value)} /></div>
          <div className={s.inputGroup}><label className={s.inputLabel}>Selling Price/Unit ($)</label><input className={s.input} type="number" placeholder="25" value={p} onChange={e => setP(e.target.value)} /></div>
          <div className={s.inputGroup}><label className={s.inputLabel}>Target Profit ($)</label><input className={s.input} type="number" placeholder="20000" value={tp} onChange={e => setTp(e.target.value)} /></div>
        </div>
      </div>
      <div className={s.refGrid}>
        {cards.map((c, i) => (
          <div key={i} className={s.refCard}>
            <div className={s.refCardTitle}>{c.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent,var(--gold))', margin: '8px 0 4px' }}>{c.value}</div>
            <div className={s.refCardDesc}>{c.note}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Journal Entry Builder ── */
function JournalBuilder() {
  const [entries, setEntries] = useState([{ account: '', type: 'debit', amount: '' }])
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [desc, setDesc] = useState('')
  const [saved, setSaved] = useState([])

  const addLine = () => setEntries(e => [...e, { account: '', type: 'debit', amount: '' }])
  const updateLine = (i, k, v) => setEntries(e => e.map((line, idx) => idx === i ? { ...line, [k]: v } : line))
  const removeLine = (i) => setEntries(e => e.filter((_, idx) => idx !== i))

  const totalDR = entries.filter(e => e.type === 'debit').reduce((s, e) => s + (parseFloat(e.amount) || 0), 0)
  const totalCR = entries.filter(e => e.type === 'credit').reduce((s, e) => s + (parseFloat(e.amount) || 0), 0)
  const balanced = Math.abs(totalDR - totalCR) < 0.01

  const save = () => {
    if (!desc.trim() || !balanced) return
    setSaved(s => [{ date, desc, entries: [...entries], totalDR, totalCR }, ...s])
    setEntries([{ account: '', type: 'debit', amount: '' }])
    setDesc('')
  }

  return (
    <div>
      <div className={s.addForm}>
        <div className={s.formGrid}>
          <div className={s.inputGroup}><label className={s.inputLabel}>Date</label><input className={s.input} type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
          <div className={s.inputGroup} style={{ gridColumn: '1/-1' }}><label className={s.inputLabel}>Narration</label><input className={s.input} placeholder="e.g. Purchase of equipment on credit" value={desc} onChange={e => setDesc(e.target.value)} /></div>
        </div>
        {entries.map((line, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 120px auto', gap: 8, marginBottom: 8, alignItems: 'center' }}>
            <input className={s.input} placeholder="Account name…" value={line.account} onChange={e => updateLine(i, 'account', e.target.value)} style={{ paddingLeft: line.type === 'credit' ? 28 : 12 }} />
            <select className={s.select} value={line.type} onChange={e => updateLine(i, 'type', e.target.value)}>
              <option value="debit">DR</option>
              <option value="credit">CR</option>
            </select>
            <input className={s.input} type="number" placeholder="0.00" value={line.amount} onChange={e => updateLine(i, 'amount', e.target.value)} />
            {entries.length > 1 && <button className={s.btnSmall} onClick={() => removeLine(i)}>✕</button>}
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginTop: 8 }}>
          <button className={s.addBtn} style={{ width: 'auto' }} onClick={addLine}>+ Add Line</button>
          <div style={{ fontSize: 13, color: balanced ? 'var(--emerald-light)' : '#e05c6e' }}>
            DR: {totalDR.toFixed(2)} | CR: {totalCR.toFixed(2)} {balanced ? '✓ Balanced' : '✗ Unbalanced'}
          </div>
          <button className={s.btnPrimary} onClick={save} disabled={!balanced || !desc.trim()}>Save Entry</button>
        </div>
      </div>
      {saved.map((e, i) => (
        <div key={i} className={s.item} style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <div style={{ marginBottom: 10 }}><span style={{ color: 'var(--accent,var(--gold))', fontWeight: 600 }}>{e.date}</span> — {e.desc}</div>
          <table className={s.dataTable}>
            <thead><tr><th>Account</th><th>Debit ($)</th><th>Credit ($)</th></tr></thead>
            <tbody>
              {e.entries.map((line, j) => (
                <tr key={j}>
                  <td style={{ paddingLeft: line.type === 'credit' ? 32 : 14 }}>{line.account}</td>
                  <td className={s.mono}>{line.type === 'debit' ? parseFloat(line.amount).toFixed(2) : ''}</td>
                  <td className={s.mono}>{line.type === 'credit' ? parseFloat(line.amount).toFixed(2) : ''}</td>
                </tr>
              ))}
              <tr style={{ borderTop: '1px solid rgba(245,240,232,0.15)' }}>
                <td style={{ fontWeight: 700 }}>Total</td>
                <td className={s.mono} style={{ fontWeight: 700 }}>{e.totalDR.toFixed(2)}</td>
                <td className={s.mono} style={{ fontWeight: 700 }}>{e.totalCR.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      ))}
    </div>
  )
}

export default function AccountingTools() {
  const [tab, setTab] = useState('ratios')
  const TABS = [['ratios','📊 Ratio Analysis'],['depreciation','📉 Depreciation'],['breakeven','⚖ Break-even'],['journal','📋 Journal Entries']]
  return (
    <div>
      <div className={s.tabs}>
        {TABS.map(([id, label]) => (
          <button key={id} className={`${s.tab} ${tab === id ? s.tabActive : ''}`} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>
      <div className={s.panel}>
        {tab === 'ratios' && <RatioCalculator />}
        {tab === 'depreciation' && <DepreciationCalc />}
        {tab === 'breakeven' && <BreakEven />}
        {tab === 'journal' && <JournalBuilder />}
      </div>
    </div>
  )
}
