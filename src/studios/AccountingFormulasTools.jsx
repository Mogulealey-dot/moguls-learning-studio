import { useState, useMemo } from 'react'
import s from './StudioTools.module.css'

// ── Formula Library Data ──────────────────────────────────────────────────────
const FORMULA_LIBRARY = [
  // Balance Sheet
  { category: 'Balance Sheet', name: 'Accounting Equation', formula: 'Assets = Liabilities + Equity', desc: 'Foundation of double-entry bookkeeping.' },
  { category: 'Balance Sheet', name: 'Net Assets / Equity', formula: 'Net Assets = Total Assets − Total Liabilities', desc: 'Owner\'s residual interest in the business.' },
  { category: 'Balance Sheet', name: 'Working Capital', formula: 'Working Capital = Current Assets − Current Liabilities', desc: 'Short-term liquidity buffer.' },
  { category: 'Balance Sheet', name: 'Net Working Capital Ratio', formula: 'NWC Ratio = Working Capital ÷ Total Assets', desc: 'Proportion of assets funded by working capital.' },
  { category: 'Balance Sheet', name: 'Book Value per Share', formula: 'BVPS = (Total Equity − Preferred Equity) ÷ Shares Outstanding', desc: 'Equity attributable to each common share.' },
  // Income Statement
  { category: 'Income Statement', name: 'Gross Profit', formula: 'Gross Profit = Revenue − COGS', desc: 'Profit after direct production costs.' },
  { category: 'Income Statement', name: 'Gross Profit Margin', formula: 'GPM = Gross Profit ÷ Revenue × 100', desc: 'Percentage of revenue retained after COGS.' },
  { category: 'Income Statement', name: 'EBIT', formula: 'EBIT = Revenue − COGS − Operating Expenses', desc: 'Earnings before interest and taxes.' },
  { category: 'Income Statement', name: 'EBITDA', formula: 'EBITDA = EBIT + Depreciation + Amortisation', desc: 'Proxy for operating cash flow.' },
  { category: 'Income Statement', name: 'Net Profit Margin', formula: 'NPM = Net Income ÷ Revenue × 100', desc: 'Bottom-line profitability percentage.' },
  { category: 'Income Statement', name: 'Operating Profit Margin', formula: 'OPM = EBIT ÷ Revenue × 100', desc: 'Profit from core operations as % of revenue.' },
  { category: 'Income Statement', name: 'EPS (Basic)', formula: 'EPS = (Net Income − Preferred Dividends) ÷ Weighted Avg. Shares', desc: 'Earnings allocated to each common share.' },
  // Cash Flow
  { category: 'Cash Flow', name: 'Free Cash Flow', formula: 'FCF = Operating Cash Flow − Capital Expenditure', desc: 'Cash available after maintaining/growing asset base.' },
  { category: 'Cash Flow', name: 'Operating Cash Flow', formula: 'OCF = Net Income + Non-cash Items + Changes in Working Capital', desc: 'Cash generated from core business operations.' },
  { category: 'Cash Flow', name: 'Cash Conversion Cycle', formula: 'CCC = DIO + DSO − DPO', desc: 'Days to convert investments into cash flows.' },
  { category: 'Cash Flow', name: 'Dividend Payout Ratio', formula: 'DPR = Dividends Paid ÷ Net Income × 100', desc: 'Proportion of earnings distributed as dividends.' },
  // Depreciation
  { category: 'Depreciation', name: 'Straight-Line', formula: 'Annual Dep. = (Cost − Salvage) ÷ Useful Life', desc: 'Equal depreciation charge each year.' },
  { category: 'Depreciation', name: 'Declining Balance Rate', formula: 'Rate = 1 − (Salvage ÷ Cost)^(1 ÷ Life)', desc: 'Constant percentage applied to book value.' },
  { category: 'Depreciation', name: 'Sum-of-Years\' Digits', formula: 'Dep.ₜ = (Life − t + 1) ÷ SYD × (Cost − Salvage)', desc: 'Accelerated method; SYD = n(n+1)/2.' },
  { category: 'Depreciation', name: 'Units of Production', formula: 'Dep. = (Cost − Salvage) ÷ Total Units × Units Produced', desc: 'Based on actual usage rather than time.' },
  // Valuation
  { category: 'Valuation', name: 'P/E Ratio', formula: 'P/E = Market Price per Share ÷ EPS', desc: 'Market premium for each dollar of earnings.' },
  { category: 'Valuation', name: 'Price-to-Book', formula: 'P/B = Market Price per Share ÷ BVPS', desc: 'Market value relative to book value.' },
  { category: 'Valuation', name: 'EV/EBITDA', formula: 'EV/EBITDA = (Market Cap + Debt − Cash) ÷ EBITDA', desc: 'Capital-structure-neutral valuation multiple.' },
  { category: 'Valuation', name: 'Discounted Cash Flow', formula: 'DCF = Σ CFₜ ÷ (1 + r)ᵗ', desc: 'Present value of future free cash flows.' },
  { category: 'Valuation', name: 'Gordon Growth Model', formula: 'P = D₁ ÷ (r − g)', desc: 'Intrinsic value of a stock paying growing dividends.' },
  // Inventory
  { category: 'Inventory', name: 'COGS (Periodic)', formula: 'COGS = Opening Inventory + Purchases − Closing Inventory', desc: 'Cost of goods sold during the period.' },
  { category: 'Inventory', name: 'Inventory Turnover', formula: 'IT = COGS ÷ Average Inventory', desc: 'How many times inventory is sold per year.' },
  { category: 'Inventory', name: 'Days Inventory Outstanding', formula: 'DIO = 365 ÷ Inventory Turnover', desc: 'Average days inventory is held.' },
  { category: 'Inventory', name: 'Economic Order Quantity', formula: 'EOQ = √(2DS ÷ H)', desc: 'Optimal order quantity to minimise total cost; D=demand, S=order cost, H=holding cost.' },
  { category: 'Inventory', name: 'Reorder Point', formula: 'ROP = Lead-Time Demand + Safety Stock', desc: 'Inventory level that triggers a new order.' },
]

const FORMULA_CATEGORIES = ['All', ...Array.from(new Set(FORMULA_LIBRARY.map(f => f.category)))]

function FormulaLibrary() {
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState('All')
  const filtered = useMemo(() => FORMULA_LIBRARY.filter(f =>
    (cat === 'All' || f.category === cat) &&
    (search === '' || f.name.toLowerCase().includes(search.toLowerCase()) || f.formula.toLowerCase().includes(search.toLowerCase()) || f.desc.toLowerCase().includes(search.toLowerCase()))
  ), [search, cat])
  return (
    <div>
      <div className={s.filterRow} style={{ flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        <input
          className={s.input}
          style={{ flex: 1, minWidth: 200 }}
          placeholder="Search formulas…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <div className={s.filterRow} style={{ flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
        {FORMULA_CATEGORIES.map(c => (
          <button key={c} className={cat === c ? s.filterBtnActive : s.filterBtn} onClick={() => setCat(c)}>{c}</button>
        ))}
      </div>
      <div className={s.refGrid}>
        {filtered.length === 0
          ? <div className={s.empty}><div className={s.emptyIcon}>🔍</div>No formulas found.</div>
          : filtered.map((f, i) => (
            <div key={i} className={s.refCard}>
              <div className={s.categoryLabel}>{f.category}</div>
              <div className={s.refCardTitle}>{f.name}</div>
              <div className={s.refCardFormula}>{f.formula}</div>
              <div className={s.refCardDesc}>{f.desc}</div>
            </div>
          ))
        }
      </div>
    </div>
  )
}

// ── Full Ratio Calculator ────────────────────────────────────────────────────
const n = v => parseFloat(v) || 0

function RatioCalculator() {
  const [v, setV] = useState({
    currentAssets: '', currentLiabilities: '', inventory: '', cash: '',
    totalAssets: '', totalLiabilities: '', totalEquity: '',
    revenue: '', cogs: '', grossProfit: '', ebit: '', netIncome: '',
    interestExpense: '', taxExpense: '', depreciation: '',
    accountsReceivable: '', accountsPayable: '',
    sharesOutstanding: '', marketPrice: '',
    operatingCashFlow: '',
  })
  const set = k => e => setV(p => ({ ...p, [k]: e.target.value }))

  const r = {}
  // Liquidity
  const ca = n(v.currentAssets), cl = n(v.currentLiabilities)
  r.currentRatio = cl ? (ca / cl).toFixed(2) : '—'
  r.quickRatio   = cl ? ((ca - n(v.inventory)) / cl).toFixed(2) : '—'
  r.cashRatio    = cl ? (n(v.cash) / cl).toFixed(2) : '—'
  // Profitability
  const rev = n(v.revenue), ni = n(v.netIncome), te = n(v.totalEquity), ta = n(v.totalAssets)
  const gp = n(v.grossProfit) || (rev - n(v.cogs))
  const ebit = n(v.ebit)
  r.grossMargin    = rev ? ((gp / rev) * 100).toFixed(1) + '%' : '—'
  r.operatingMargin = rev ? ((ebit / rev) * 100).toFixed(1) + '%' : '—'
  r.netMargin      = rev ? ((ni / rev) * 100).toFixed(1) + '%' : '—'
  r.roe            = te  ? ((ni / te) * 100).toFixed(1) + '%' : '—'
  r.roa            = ta  ? ((ni / ta) * 100).toFixed(1) + '%' : '—'
  const ebitda = ebit + n(v.depreciation)
  r.ebitdaMargin   = rev ? ((ebitda / rev) * 100).toFixed(1) + '%' : '—'
  // Leverage
  const tl = n(v.totalLiabilities)
  r.debtToEquity  = te ? (tl / te).toFixed(2) : '—'
  r.debtToAssets  = ta ? (tl / ta).toFixed(2) : '—'
  const int = n(v.interestExpense)
  r.interestCover = int ? (ebit / int).toFixed(2) + '×' : '—'
  r.equityMultiplier = te ? (ta / te).toFixed(2) : '—'
  // Efficiency
  const ar = n(v.accountsReceivable), ap = n(v.accountsPayable)
  const cogs = n(v.cogs)
  r.assetTurnover = ta ? (rev / ta).toFixed(2) : '—'
  r.inventoryTurnover = n(v.inventory) ? (cogs / n(v.inventory)).toFixed(2) : '—'
  r.dso = rev ? ((ar / rev) * 365).toFixed(0) + ' d' : '—'
  r.dpo = cogs ? ((ap / cogs) * 365).toFixed(0) + ' d' : '—'
  // Market / Valuation
  const eps = n(v.sharesOutstanding) ? ni / n(v.sharesOutstanding) : 0
  const mp = n(v.marketPrice)
  const bvps = n(v.sharesOutstanding) ? te / n(v.sharesOutstanding) : 0
  r.eps  = eps  ? eps.toFixed(3) : '—'
  r.pe   = eps  ? (mp / eps).toFixed(2) : '—'
  r.pb   = bvps ? (mp / bvps).toFixed(2) : '—'
  r.fcf  = n(v.operatingCashFlow) ? (n(v.operatingCashFlow) - n(v.depreciation)).toFixed(0) : '—'

  const INPUT = (key, label) => (
    <div className={s.inputGroup} key={key}>
      <label className={s.inputLabel}>{label}</label>
      <input className={s.input} type="number" placeholder="0" value={v[key]} onChange={set(key)} />
    </div>
  )

  const RESULT = (label, val, bench) => (
    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <span style={{ fontSize: 13, color: 'var(--mist)' }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent, var(--gold))', fontFamily: 'monospace' }}>
        {val}{bench && <span style={{ fontSize: 10, color: 'var(--mist)', marginLeft: 6 }}>{bench}</span>}
      </span>
    </div>
  )

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
      {/* Inputs */}
      <div>
        <h4 style={{ color: 'var(--cream)', marginBottom: 14, fontSize: 14 }}>Financial Data Inputs</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {INPUT('currentAssets','Current Assets')}
          {INPUT('currentLiabilities','Current Liabilities')}
          {INPUT('inventory','Inventory')}
          {INPUT('cash','Cash & Equivalents')}
          {INPUT('totalAssets','Total Assets')}
          {INPUT('totalLiabilities','Total Liabilities')}
          {INPUT('totalEquity','Total Equity')}
          {INPUT('revenue','Revenue')}
          {INPUT('cogs','COGS')}
          {INPUT('grossProfit','Gross Profit (opt.)')}
          {INPUT('ebit','EBIT')}
          {INPUT('netIncome','Net Income')}
          {INPUT('interestExpense','Interest Expense')}
          {INPUT('depreciation','Depreciation & Amort.')}
          {INPUT('accountsReceivable','Accounts Receivable')}
          {INPUT('accountsPayable','Accounts Payable')}
          {INPUT('sharesOutstanding','Shares Outstanding')}
          {INPUT('marketPrice','Market Price/Share')}
          {INPUT('operatingCashFlow','Operating Cash Flow')}
        </div>
      </div>

      {/* Results */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {[
          { title: '💧 Liquidity', rows: [['Current Ratio', r.currentRatio, 'target ≥ 2'], ['Quick Ratio', r.quickRatio, 'target ≥ 1'], ['Cash Ratio', r.cashRatio, 'target ≥ 0.5']] },
          { title: '📈 Profitability', rows: [['Gross Margin', r.grossMargin], ['Operating Margin', r.operatingMargin], ['Net Margin', r.netMargin], ['ROE', r.roe, 'target ≥ 15%'], ['ROA', r.roa, 'target ≥ 5%'], ['EBITDA Margin', r.ebitdaMargin]] },
          { title: '🏦 Leverage', rows: [['Debt/Equity', r.debtToEquity, 'target < 2'], ['Debt/Assets', r.debtToAssets, 'target < 0.5'], ['Interest Cover', r.interestCover, 'target ≥ 3×'], ['Equity Multiplier', r.equityMultiplier]] },
          { title: '⚙️ Efficiency', rows: [['Asset Turnover', r.assetTurnover], ['Inventory Turnover', r.inventoryTurnover], ['DSO (Debtors Days)', r.dso], ['DPO (Creditor Days)', r.dpo]] },
          { title: '📊 Market / Valuation', rows: [['EPS', r.eps], ['P/E Ratio', r.pe], ['P/B Ratio', r.pb], ['Free Cash Flow', r.fcf]] },
        ].map(({ title, rows }) => (
          <div key={title} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '12px 16px', border: '1px solid rgba(255,255,255,0.07)' }}>
            <h5 style={{ color: 'var(--cream)', marginBottom: 8, fontSize: 13 }}>{title}</h5>
            {rows.map(([lbl, val, bench]) => RESULT(lbl, val, bench))}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Statement Builder ────────────────────────────────────────────────────────
function StatementBuilder() {
  const [mode, setMode] = useState('income')
  // Income Statement fields
  const [inc, setInc] = useState({ revenue: '', cogs: '', opex: '', depreciation: '', interest: '', tax: '' })
  // Balance Sheet fields
  const [bs, setBs] = useState({
    cash: '', ar: '', inventory: '', otherCurrentAssets: '',
    ppe: '', intangibles: '', otherNonCurrentAssets: '',
    ap: '', shortTermDebt: '', otherCurrentLiabilities: '',
    longTermDebt: '', otherNonCurrentLiabilities: '',
    shareCapital: '', retainedEarnings: '', otherEquity: '',
  })
  const si = k => e => setInc(p => ({ ...p, [k]: e.target.value }))
  const sb = k => e => setBs(p => ({ ...p, [k]: e.target.value }))

  // Income calcs
  const rev = n(inc.revenue), cogs = n(inc.cogs), opex = n(inc.opex), dep = n(inc.depreciation), inte = n(inc.interest), tax = n(inc.tax)
  const grossProfit = rev - cogs
  const ebit = grossProfit - opex - dep
  const ebt = ebit - inte
  const netIncome = ebt - tax

  // Balance Sheet calcs
  const totalCurrentAssets = n(bs.cash) + n(bs.ar) + n(bs.inventory) + n(bs.otherCurrentAssets)
  const totalNonCurrentAssets = n(bs.ppe) + n(bs.intangibles) + n(bs.otherNonCurrentAssets)
  const totalAssets = totalCurrentAssets + totalNonCurrentAssets
  const totalCurrentLiab = n(bs.ap) + n(bs.shortTermDebt) + n(bs.otherCurrentLiabilities)
  const totalNonCurrentLiab = n(bs.longTermDebt) + n(bs.otherNonCurrentLiabilities)
  const totalLiabilities = totalCurrentLiab + totalNonCurrentLiab
  const totalEquity = n(bs.shareCapital) + n(bs.retainedEarnings) + n(bs.otherEquity)
  const balanced = Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01

  const fmt = v => isNaN(v) ? '—' : v < 0 ? `(${Math.abs(v).toLocaleString()})` : v.toLocaleString()

  const LINE = (label, val, indent = 0, bold = false, borderTop = false) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0',
      paddingLeft: indent * 16, fontWeight: bold ? 700 : 400, fontSize: bold ? 14 : 13,
      color: bold ? 'var(--cream)' : 'var(--mist)', borderTop: borderTop ? '1px solid rgba(255,255,255,0.15)' : 'none' }}>
      <span>{label}</span>
      <span style={{ fontFamily: 'monospace', color: val < 0 ? '#e05c6e' : bold ? 'var(--accent, var(--gold))' : 'var(--mist)' }}>{fmt(val)}</span>
    </div>
  )

  const FIELD = (key, label, handler) => (
    <div className={s.inputGroup} key={key}>
      <label className={s.inputLabel}>{label}</label>
      <input className={s.input} type="number" placeholder="0" value={mode === 'income' ? inc[key] : bs[key]} onChange={handler(key)} />
    </div>
  )

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <button className={mode === 'income' ? s.filterBtnActive : s.filterBtn} onClick={() => setMode('income')}>Income Statement</button>
        <button className={mode === 'balance' ? s.filterBtnActive : s.filterBtn} onClick={() => setMode('balance')}>Balance Sheet</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {mode === 'income' ? (
          <>
            <div>
              <h4 style={{ color: 'var(--cream)', marginBottom: 14, fontSize: 14 }}>Inputs</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {FIELD('revenue','Revenue', si)}
                {FIELD('cogs','Cost of Goods Sold (COGS)', si)}
                {FIELD('opex','Operating Expenses (excl. D&A)', si)}
                {FIELD('depreciation','Depreciation & Amortisation', si)}
                {FIELD('interest','Interest Expense', si)}
                {FIELD('tax','Income Tax', si)}
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: 20, border: '1px solid rgba(255,255,255,0.07)' }}>
              <h4 style={{ color: 'var(--cream)', marginBottom: 16, fontSize: 14, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Income Statement</h4>
              {LINE('Revenue', rev, 0, true)}
              {LINE('Cost of Goods Sold', -cogs, 1)}
              {LINE('Gross Profit', grossProfit, 0, true, true)}
              {LINE('Operating Expenses', -opex, 1)}
              {LINE('Depreciation & Amort.', -dep, 1)}
              {LINE('EBIT', ebit, 0, true, true)}
              {LINE('Interest Expense', -inte, 1)}
              {LINE('EBT', ebt, 0, true, true)}
              {LINE('Income Tax', -tax, 1)}
              <div style={{ borderTop: '2px solid var(--accent, var(--gold))', marginTop: 6, paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 15 }}>
                <span style={{ color: 'var(--cream)' }}>Net Income</span>
                <span style={{ fontFamily: 'monospace', color: netIncome < 0 ? '#e05c6e' : 'var(--accent, var(--gold))' }}>{fmt(netIncome)}</span>
              </div>
            </div>
          </>
        ) : (
          <>
            <div>
              <h4 style={{ color: 'var(--cream)', marginBottom: 14, fontSize: 14 }}>Inputs</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div style={{ gridColumn: '1/-1', color: 'var(--gold)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 4 }}>Assets</div>
                {FIELD('cash', 'Cash & Equivalents', sb)}
                {FIELD('ar', 'Accounts Receivable', sb)}
                {FIELD('inventory', 'Inventory', sb)}
                {FIELD('otherCurrentAssets', 'Other Current Assets', sb)}
                {FIELD('ppe', 'PP&E (net)', sb)}
                {FIELD('intangibles', 'Intangibles & Goodwill', sb)}
                {FIELD('otherNonCurrentAssets', 'Other Non-current Assets', sb)}
                <div style={{ gridColumn: '1/-1', color: 'var(--gold)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 8 }}>Liabilities</div>
                {FIELD('ap', 'Accounts Payable', sb)}
                {FIELD('shortTermDebt', 'Short-term Debt', sb)}
                {FIELD('otherCurrentLiabilities', 'Other Current Liabilities', sb)}
                {FIELD('longTermDebt', 'Long-term Debt', sb)}
                {FIELD('otherNonCurrentLiabilities', 'Other Non-current Liabilities', sb)}
                <div style={{ gridColumn: '1/-1', color: 'var(--gold)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 8 }}>Equity</div>
                {FIELD('shareCapital', 'Share Capital', sb)}
                {FIELD('retainedEarnings', 'Retained Earnings', sb)}
                {FIELD('otherEquity', 'Other Equity', sb)}
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: 20, border: '1px solid rgba(255,255,255,0.07)' }}>
              <h4 style={{ color: 'var(--cream)', marginBottom: 16, fontSize: 14, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Balance Sheet</h4>
              <div style={{ color: 'var(--gold)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Assets</div>
              {LINE('Cash & Equivalents', n(bs.cash), 1)}
              {LINE('Accounts Receivable', n(bs.ar), 1)}
              {LINE('Inventory', n(bs.inventory), 1)}
              {LINE('Other Current Assets', n(bs.otherCurrentAssets), 1)}
              {LINE('Total Current Assets', totalCurrentAssets, 0, true, true)}
              {LINE('PP&E (net)', n(bs.ppe), 1)}
              {LINE('Intangibles & Goodwill', n(bs.intangibles), 1)}
              {LINE('Other Non-current Assets', n(bs.otherNonCurrentAssets), 1)}
              {LINE('Total Non-current Assets', totalNonCurrentAssets, 0, true, true)}
              {LINE('TOTAL ASSETS', totalAssets, 0, true, true)}
              <div style={{ height: 12 }} />
              <div style={{ color: 'var(--gold)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Liabilities & Equity</div>
              {LINE('Accounts Payable', n(bs.ap), 1)}
              {LINE('Short-term Debt', n(bs.shortTermDebt), 1)}
              {LINE('Other Current Liabilities', n(bs.otherCurrentLiabilities), 1)}
              {LINE('Total Current Liabilities', totalCurrentLiab, 0, true, true)}
              {LINE('Long-term Debt', n(bs.longTermDebt), 1)}
              {LINE('Other Non-current Liabilities', n(bs.otherNonCurrentLiabilities), 1)}
              {LINE('Total Non-current Liabilities', totalNonCurrentLiab, 0, true, true)}
              {LINE('TOTAL LIABILITIES', totalLiabilities, 0, true, true)}
              <div style={{ height: 8 }} />
              {LINE('Share Capital', n(bs.shareCapital), 1)}
              {LINE('Retained Earnings', n(bs.retainedEarnings), 1)}
              {LINE('Other Equity', n(bs.otherEquity), 1)}
              {LINE('TOTAL EQUITY', totalEquity, 0, true, true)}
              <div style={{ borderTop: '2px solid var(--accent, var(--gold))', marginTop: 8, paddingTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--cream)' }}>Total L + E</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: 15, color: 'var(--accent, var(--gold))' }}>{fmt(totalLiabilities + totalEquity)}</span>
              </div>
              <div style={{ marginTop: 12, padding: '8px 12px', borderRadius: 6, background: balanced ? 'rgba(80,200,120,0.1)' : 'rgba(224,92,110,0.1)', border: `1px solid ${balanced ? 'rgba(80,200,120,0.4)' : 'rgba(224,92,110,0.4)'}`, fontSize: 13, textAlign: 'center', color: balanced ? '#50c878' : '#e05c6e' }}>
                {balanced ? '✓ Balance Sheet balances' : `✗ Imbalance: ${fmt(Math.abs(totalAssets - (totalLiabilities + totalEquity)))}`}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
const TABS = [
  ['library', '📚 Formula Library'],
  ['ratios', '📊 Ratio Calculator'],
  ['statements', '🏗 Statement Builder'],
]

export default function AccountingFormulasTools() {
  const [tab, setTab] = useState('library')
  return (
    <div>
      <div className={s.tabs}>
        {TABS.map(([id, label]) => (
          <button key={id} className={tab === id ? s.tabActive : s.tab} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>
      <div className={s.panel}>
        {tab === 'library'    && <FormulaLibrary />}
        {tab === 'ratios'     && <RatioCalculator />}
        {tab === 'statements' && <StatementBuilder />}
      </div>
    </div>
  )
}
