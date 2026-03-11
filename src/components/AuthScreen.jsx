import { useState } from 'react'
import { LS } from '../utils'
import styles from './AuthScreen.module.css'

export default function AuthScreen({ onLogin }) {
  const [tab, setTab] = useState('signin')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const handle = () => {
    setError('')

    // Normalize — email trimmed + lowercased, name trimmed, password kept as-is
    const email    = form.email.trim().toLowerCase()
    const name     = form.name.trim()
    const password = form.password

    if (!email || !password) { setError('Please fill in all fields.'); return }
    if (!email.includes('@') || !email.includes('.')) { setError('Please enter a valid email address.'); return }

    // Load users safely — handles corrupted / missing storage
    let users = {}
    try { users = LS.get('mls_users', {}) || {} } catch { users = {} }

    if (tab === 'register') {
      if (!name) { setError('Full name is required.'); return }
      if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
      if (users[email]) { setError('An account with this email already exists. Try signing in.'); return }
      users[email] = { name, password }
      LS.set('mls_users', users)
      onLogin({ name, email })
    } else {
      const user = users[email]
      if (!user) { setError('No account found with this email. Please register first.'); return }
      if (user.password !== password) { setError('Incorrect password. Please try again.'); return }
      onLogin({ name: user.name, email })
    }
  }

  const handleKey = (e) => { if (e.key === 'Enter') handle() }

  return (
    <div className={styles.screen}>
      <div className={styles.bg} />
      <div className={styles.lines} />
      <div className={styles.card}>
        <p className={styles.logo}>✦ Mogul's Learning Studio</p>
        <h1 className={styles.title}>Your <em>Academic</em><br />Command Center</h1>
        <p className={styles.sub}>Sign in to continue your journey</p>

        <div className={styles.tabs}>
          <button className={`${styles.tab} ${tab === 'signin' ? styles.active : ''}`}
            onClick={() => { setTab('signin'); setError('') }}>Sign In</button>
          <button className={`${styles.tab} ${tab === 'register' ? styles.active : ''}`}
            onClick={() => { setTab('register'); setError('') }}>Register</button>
        </div>

        {error && <div className={styles.error}>⚠ {error}</div>}

        {tab === 'register' && (
          <div className="field-group">
            <label>Full Name</label>
            <input type="text" placeholder="Your name" value={form.name} onChange={set('name')} onKeyDown={handleKey} />
          </div>
        )}
        <div className="field-group">
          <label>Email Address</label>
          <input type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} onKeyDown={handleKey} autoComplete="email" />
        </div>
        <div className="field-group">
          <label>Password</label>
          <input type="password" placeholder="••••••••" value={form.password} onChange={set('password')} onKeyDown={handleKey} autoComplete={tab === 'register' ? 'new-password' : 'current-password'} />
        </div>

        <button className="btn-primary" style={{ width: '100%' }} onClick={handle}>
          {tab === 'signin' ? 'Sign In →' : 'Create Account →'}
        </button>
        <p className={styles.hint}>
          {tab === 'signin' ? 'No account? Switch to Register above.' : 'Already have an account? Switch to Sign In.'}
        </p>
        <p className={styles.hint} style={{ marginTop: 8 }}>
          Register with any email & password (6+ chars) to get started.
        </p>
      </div>
    </div>
  )
}
