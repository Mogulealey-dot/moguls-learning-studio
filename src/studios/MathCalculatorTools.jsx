import { useState, useMemo } from 'react'
import s from './StudioTools.module.css'
import c from './CalcTools.module.css'

/* ── Scientific Calculator ── */
function ScientificCalc() {
  const [display, setDisplay] = useState('0')
  const [expr, setExpr] = useState('')
  const [memory, setMemory] = useState(0)
  const [isRad, setIsRad] = useState(true)
  const [newNum, setNewNum] = useState(true)
  const [pendingOp, setPendingOp] = useState(null)
  const [pendingVal, setPendingVal] = useState(null)

  const toAngle = (x) => isRad ? x : x * Math.PI / 180

  const press = (val) => {
    if (!isNaN(val) || val === '.') {
      if (newNum) {
        setDisplay(val === '.' ? '0.' : String(val))
        setNewNum(false)
      } else {
        if (val === '.' && display.includes('.')) return
        setDisplay(display === '0' && val !== '.' ? String(val) : display + String(val))
      }
      return
    }

    const cur = parseFloat(display)

    if (val === 'AC') { setDisplay('0'); setExpr(''); setNewNum(true); setPendingOp(null); setPendingVal(null); return }
    if (val === '⌫') { const next = display.length > 1 ? display.slice(0, -1) : '0'; setDisplay(next); return }
    if (val === '±') { setDisplay(String(-cur)); return }
    if (val === '%') { setDisplay(String(cur / 100)); setNewNum(true); return }
    if (val === 'MC') { setMemory(0); return }
    if (val === 'MR') { setDisplay(String(memory)); setNewNum(true); return }
    if (val === 'M+') { setMemory(m => m + cur); setNewNum(true); return }
    if (val === 'M−') { setMemory(m => m - cur); setNewNum(true); return }
    if (val === 'π') { setDisplay(String(Math.PI)); setNewNum(true); return }
    if (val === 'e') { setDisplay(String(Math.E)); setNewNum(true); return }

    const unary = {
      'sin': (x) => Math.sin(toAngle(x)),
      'cos': (x) => Math.cos(toAngle(x)),
      'tan': (x) => Math.tan(toAngle(x)),
      'sin⁻¹': (x) => isRad ? Math.asin(x) : Math.asin(x) * 180 / Math.PI,
      'cos⁻¹': (x) => isRad ? Math.acos(x) : Math.acos(x) * 180 / Math.PI,
      'tan⁻¹': (x) => isRad ? Math.atan(x) : Math.atan(x) * 180 / Math.PI,
      'ln': (x) => Math.log(x),
      'log': (x) => Math.log10(x),
      '√': (x) => Math.sqrt(x),
      '∛': (x) => Math.cbrt(x),
      'x²': (x) => x * x,
      'x³': (x) => x * x * x,
      '1/x': (x) => 1 / x,
      'eˣ': (x) => Math.exp(x),
      '10ˣ': (x) => Math.pow(10, x),
      'n!': (x) => { let f = 1; for (let i = 2; i <= Math.round(x); i++) f *= i; return f },
      '|x|': (x) => Math.abs(x),
    }

    if (unary[val]) {
      const res = unary[val](cur)
      setDisplay(String(parseFloat(res.toFixed(10))))
      setExpr(`${val}(${display})`)
      setNewNum(true)
      return
    }

    const binary = ['+', '−', '×', '÷', 'xʸ', 'ʸ√x']
    if (binary.includes(val)) {
      if (pendingOp && !newNum) {
        // chain operation: compute first
        const res = compute(pendingVal, cur, pendingOp)
        setDisplay(String(parseFloat(res.toFixed(10))))
        setExpr(`${res} ${val}`)
        setPendingVal(res)
      } else {
        setExpr(`${display} ${val}`)
        setPendingVal(cur)
      }
      setPendingOp(val)
      setNewNum(true)
      return
    }

    if (val === '=') {
      if (pendingOp === null) return
      const res = compute(pendingVal, cur, pendingOp)
      setExpr(`${pendingVal} ${pendingOp} ${cur} =`)
      setDisplay(String(parseFloat(res.toFixed(10))))
      setNewNum(true)
      setPendingOp(null)
      setPendingVal(null)
      return
    }
  }

  const compute = (a, b, op) => {
    if (op === '+') return a + b
    if (op === '−') return a - b
    if (op === '×') return a * b
    if (op === '÷') return b !== 0 ? a / b : NaN
    if (op === 'xʸ') return Math.pow(a, b)
    if (op === 'ʸ√x') return Math.pow(a, 1 / b)
    return b
  }

  const fnRow = ['sin','cos','tan','sin⁻¹','cos⁻¹','tan⁻¹','ln','log','n!','|x|']
  const fnRow2 = ['√','∛','x²','x³','1/x','eˣ','10ˣ','π','e','⌫']
  const memRow = ['MC','MR','M+','M−','%']
  const numRows = [
    ['7','8','9','÷','xʸ'],
    ['4','5','6','×','ʸ√x'],
    ['1','2','3','−',''],
    ['0','','.', '+',''],
  ]

  const btnCls = (v) => {
    if (!v) return null
    if (v === '=') return `${c.btn} ${c.btnEq}`
    if (v === 'AC') return `${c.btn} ${c.btnAC}`
    if (['+','−','×','÷','xʸ','ʸ√x'].includes(v)) return `${c.btn} ${c.btnOp}`
    if ([...fnRow, ...fnRow2].includes(v)) return `${c.btn} ${c.btnFn}`
    if (memRow.includes(v)) return `${c.btn} ${c.btnMem}`
    if (v === '0' && numRows[3][0] === '0') return `${c.btn} ${c.btnZero}`
    return c.btn
  }

  return (
    <div className={c.calcWrap}>
      <div className={c.display}>
        <div className={c.expression}>{expr || ' '}</div>
        <div className={c.mainDisplay}>{display}</div>
        {memory !== 0 && <div className={c.memIndicator}>M: {memory}</div>}
      </div>
      <div className={c.modeRow}>
        <button className={`${c.modeBtn} ${isRad ? c.modeBtnActive : ''}`} onClick={() => setIsRad(true)}>RAD</button>
        <button className={`${c.modeBtn} ${!isRad ? c.modeBtnActive : ''}`} onClick={() => setIsRad(false)}>DEG</button>
      </div>
      <div className={c.grid}>
        {memRow.map(v => <button key={v} className={`${c.btn} ${c.btnMem}`} onClick={() => press(v)}>{v}</button>)}
        {fnRow.map(v => <button key={v} className={`${c.btn} ${c.btnFn}`} onClick={() => press(v)}>{v}</button>)}
        {fnRow2.map(v => <button key={v} className={`${c.btn} ${c.btnFn}`} onClick={() => press(v)}>{v}</button>)}
        <button className={`${c.btn} ${c.btnAC}`} onClick={() => press('AC')}>AC</button>
        <button className={`${c.btn} ${c.btnOp}`} onClick={() => press('±')}>±</button>
        <button className={`${c.btn} ${c.btnMem}`} onClick={() => press('%')}>%</button>
        <button className={`${c.btn} ${c.btnOp}`} onClick={() => press('÷')}>÷</button>
        <button className={`${c.btn} ${c.btnOp}`} onClick={() => press('xʸ')}>xʸ</button>
        {['7','8','9'].map(v => <button key={v} className={c.btn} onClick={() => press(v)}>{v}</button>)}
        <button className={`${c.btn} ${c.btnOp}`} onClick={() => press('×')}>×</button>
        <button className={`${c.btn} ${c.btnOp}`} onClick={() => press('ʸ√x')}>ʸ√x</button>
        {['4','5','6'].map(v => <button key={v} className={c.btn} onClick={() => press(v)}>{v}</button>)}
        <button className={`${c.btn} ${c.btnOp}`} onClick={() => press('−')}>−</button>
        <button className={`${c.btn} ${c.btnEq}`} style={{ gridRow: 'span 2' }} onClick={() => press('=')}>=</button>
        {['1','2','3'].map(v => <button key={v} className={c.btn} onClick={() => press(v)}>{v}</button>)}
        <button className={`${c.btn} ${c.btnOp}`} onClick={() => press('+')}>+</button>
        <button className={`${c.btn} ${c.btnZero}`} onClick={() => press('0')}>0</button>
        <button className={c.btn} onClick={() => press('.')}>.</button>
      </div>
    </div>
  )
}

/* ── Equation Solver ── */
function EquationSolver() {
  const [type, setType] = useState('quadratic')
  const [vals, setVals] = useState({})
  const set = (k) => (e) => setVals(v => ({ ...v, [k]: e.target.value }))
  const n = (k) => parseFloat(vals[k]) || 0

  let result = null
  let steps = []

  if (type === 'quadratic') {
    const [a, b, co] = [n('a'), n('b'), n('c')]
    const disc = b * b - 4 * a * co
    steps = [`Discriminant: b² − 4ac = ${b}² − 4(${a})(${co}) = ${disc}`]
    if (a !== 0) {
      if (disc > 0) {
        const x1 = (-b + Math.sqrt(disc)) / (2 * a)
        const x2 = (-b - Math.sqrt(disc)) / (2 * a)
        result = `x₁ = ${x1.toFixed(6)},   x₂ = ${x2.toFixed(6)}`
        steps.push(`Two real roots (discriminant > 0)`)
      } else if (disc === 0) {
        result = `x = ${(-b / (2 * a)).toFixed(6)}  (repeated root)`
        steps.push(`One repeated root (discriminant = 0)`)
      } else {
        const real = (-b / (2 * a)).toFixed(6)
        const imag = (Math.sqrt(-disc) / (2 * a)).toFixed(6)
        result = `x = ${real} ± ${imag}i`
        steps.push(`Complex conjugate roots (discriminant < 0)`)
      }
    }
  } else if (type === 'simultaneous') {
    const [a1, b1, c1, a2, b2, c2] = [n('a1'), n('b1'), n('c1'), n('a2'), n('b2'), n('c2')]
    const det = a1 * b2 - a2 * b1
    steps = [`Determinant: (${a1})(${b2}) − (${a2})(${b1}) = ${det}`]
    if (det !== 0) {
      const x = (c1 * b2 - c2 * b1) / det
      const y = (a1 * c2 - a2 * c1) / det
      result = `x = ${x.toFixed(6)},   y = ${y.toFixed(6)}`
      steps.push(`Unique solution (det ≠ 0)`)
    } else {
      result = 'No unique solution — lines are parallel or identical'
    }
  } else if (type === 'cubic') {
    // Numerical Newton-Raphson for ax³+bx²+cx+d=0
    const [a, b, co, d] = [n('a'), n('b'), n('c3'), n('d')]
    const f = (x) => a * x ** 3 + b * x ** 2 + co * x + d
    const fp = (x) => 3 * a * x ** 2 + 2 * b * x + co
    let x = 1, iters = 0
    while (Math.abs(f(x)) > 1e-10 && iters < 1000) { x = x - f(x) / fp(x); iters++ }
    if (Math.abs(f(x)) < 1e-6) {
      result = `x₁ ≈ ${x.toFixed(6)} (Newton-Raphson)`
      steps = [`f(x) = ${a}x³ + ${b}x² + ${co}x + ${d}`, `Converged after ${iters} iterations`]
    } else {
      result = 'No real root found near x = 1. Try a different starting estimate.'
    }
  }

  const configs = {
    quadratic: { label: 'ax² + bx + c = 0', fields: [['a','a'],['b','b'],['c','c (constant)']] },
    simultaneous: { label: 'a₁x + b₁y = c₁  AND  a₂x + b₂y = c₂', fields: [['a1','a₁'],['b1','b₁'],['c1','c₁'],['a2','a₂'],['b2','b₂'],['c2','c₂']] },
    cubic: { label: 'ax³ + bx² + cx + d = 0', fields: [['a','a'],['b','b'],['c3','c'],['d','d']] },
  }

  return (
    <div>
      <div className={s.filterRow}>
        {Object.entries(configs).map(([id, cfg]) => (
          <button key={id} className={`${s.filterBtn} ${type === id ? s.filterBtnActive : ''}`} onClick={() => { setType(id); setVals({}) }}>{cfg.label}</button>
        ))}
      </div>
      <div className={s.addForm}>
        <div className={s.formGrid}>
          {configs[type].fields.map(([k, label]) => (
            <div key={k} className={s.inputGroup}>
              <label className={s.inputLabel}>{label}</label>
              <input className={s.input} type="number" placeholder="0" value={vals[k] || ''} onChange={set(k)} />
            </div>
          ))}
        </div>
      </div>
      {result && (
        <div className={s.converterResult}>
          <div className={s.resultLabel}>Solution</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent,var(--gold))', fontFamily: 'DM Mono, monospace', marginBottom: 8 }}>{result}</div>
          {steps.map((st, i) => <div key={i} style={{ fontSize: 12, color: 'var(--mist)', marginTop: 4 }}>{st}</div>)}
        </div>
      )}
    </div>
  )
}

/* ── Sequences ── */
function Sequences() {
  const [type, setType] = useState('ap')
  const [a, setA] = useState('')
  const [d, setD] = useState('')
  const [r, setR] = useState('')
  const [n, setN] = useState('10')

  const a_ = parseFloat(a) || 0
  const d_ = parseFloat(d) || 0
  const r_ = parseFloat(r) || 1
  const n_ = Math.min(Math.max(parseInt(n) || 10, 1), 25)

  const seq = useMemo(() => Array.from({ length: n_ }, (_, i) => {
    if (type === 'ap') return a_ + i * d_
    if (type === 'gp') return a_ * Math.pow(r_, i)
    if (type === 'fib') { let [fa, fb] = [1, 1]; for (let j = 0; j < i; j++) [fa, fb] = [fb, fa + fb]; return fa }
    return 0
  }), [type, a_, d_, r_, n_])

  const sum = seq.reduce((s, v) => s + v, 0)
  const nthTerm = seq[n_ - 1]

  const apFormula = d_ >= 0 ? `Tₙ = ${a_} + (n−1)×${d_}` : `Tₙ = ${a_} − (n−1)×${Math.abs(d_)}`
  const gpFormula = `Tₙ = ${a_} × ${r_}^(n−1)`
  const sumAP = `Sₙ = n/2 × (2×${a_} + (n−1)×${d_})`
  const sumGP = Math.abs(r_) !== 1 ? `Sₙ = ${a_}(1 − ${r_}ⁿ) / (1 − ${r_})` : `Sₙ = n × ${a_}`

  return (
    <div>
      <div className={s.filterRow}>
        {[['ap','Arithmetic Progression'],['gp','Geometric Progression'],['fib','Fibonacci']].map(([id, label]) => (
          <button key={id} className={`${s.filterBtn} ${type === id ? s.filterBtnActive : ''}`} onClick={() => setType(id)}>{label}</button>
        ))}
      </div>
      <div className={s.addForm}>
        <div className={s.formGrid}>
          {type !== 'fib' && <div className={s.inputGroup}><label className={s.inputLabel}>First Term (a₁)</label><input className={s.input} type="number" placeholder="1" value={a} onChange={e => setA(e.target.value)} /></div>}
          {type === 'ap' && <div className={s.inputGroup}><label className={s.inputLabel}>Common Difference (d)</label><input className={s.input} type="number" placeholder="2" value={d} onChange={e => setD(e.target.value)} /></div>}
          {type === 'gp' && <div className={s.inputGroup}><label className={s.inputLabel}>Common Ratio (r)</label><input className={s.input} type="number" placeholder="2" value={r} onChange={e => setR(e.target.value)} /></div>}
          <div className={s.inputGroup}><label className={s.inputLabel}>Number of Terms (max 25)</label><input className={s.input} type="number" placeholder="10" value={n} onChange={e => setN(e.target.value)} /></div>
        </div>
        {type === 'ap' && <div className={s.categoryLabel} style={{ marginTop: 8 }}>{apFormula} &nbsp;|&nbsp; {sumAP}</div>}
        {type === 'gp' && <div className={s.categoryLabel} style={{ marginTop: 8 }}>{gpFormula} &nbsp;|&nbsp; {sumGP}</div>}
      </div>
      <div style={{ background: 'rgba(245,240,232,0.03)', border: '1px solid rgba(245,240,232,0.08)', borderRadius: 4, padding: '16px 20px', marginBottom: 16 }}>
        <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--mist)', marginBottom: 8 }}>Sequence</div>
        <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 13, color: 'var(--accent,var(--gold))', lineHeight: 1.8, wordBreak: 'break-all' }}>
          {seq.map((v, i) => `${parseFloat(v.toFixed(6))}${i < seq.length - 1 ? ', ' : ''}`)}
        </div>
      </div>
      <div className={s.refGrid}>
        <div className={s.refCard}><div className={s.refCardTitle}>Sum (Sₙ)</div><div style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent,var(--gold))', marginTop: 8 }}>{parseFloat(sum.toFixed(6))}</div></div>
        <div className={s.refCard}><div className={s.refCardTitle}>T{n_} (nth term)</div><div style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent,var(--gold))', marginTop: 8 }}>{parseFloat((nthTerm ?? 0).toFixed(6))}</div></div>
        {type === 'gp' && Math.abs(r_) < 1 && <div className={s.refCard}><div className={s.refCardTitle}>Sum to Infinity (S∞)</div><div style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent,var(--gold))', marginTop: 8 }}>{parseFloat((a_ / (1 - r_)).toFixed(6))}</div><div className={s.refCardDesc}>a / (1−r), valid since |r| &lt; 1</div></div>}
      </div>
    </div>
  )
}

export default function MathCalculatorTools() {
  const [tab, setTab] = useState('calculator')
  const TABS = [['calculator','🧮 Scientific Calculator'],['solver','🔢 Equation Solver'],['sequences','📊 Sequences']]
  return (
    <div>
      <div className={s.tabs}>
        {TABS.map(([id, label]) => (
          <button key={id} className={`${s.tab} ${tab === id ? s.tabActive : ''}`} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>
      <div className={s.panel}>
        {tab === 'calculator' && <ScientificCalc />}
        {tab === 'solver' && <EquationSolver />}
        {tab === 'sequences' && <Sequences />}
      </div>
    </div>
  )
}
