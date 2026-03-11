import { useState } from 'react'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '../firebase'
import styles from './AuthScreen.module.css'

function friendlyError(code) {
  switch (code) {
    case 'auth/email-already-in-use':   return 'An account with this email already exists. Try signing in.'
    case 'auth/user-not-found':
    case 'auth/invalid-credential':     return 'No account found with this email. Please register first.'
    case 'auth/wrong-password':         return 'Incorrect password. Please try again.'
    case 'auth/invalid-email':          return 'Please enter a valid email address.'
    case 'auth/weak-password':          return 'Password must be at least 6 characters.'
    case 'auth/too-many-requests':      return 'Too many failed attempts. Please try again later.'
    case 'auth/network-request-failed': return 'Network error. Please check your connection and try again.'
    default:                            return 'Something went wrong. Please try again.'
  }
}

export default function AuthScreen() {
  const [tab, setTab]         = useState('signin')
  const [form, setForm]       = useState({ name: '', email: '', password: '' })
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [showReset, setShowReset] = useState(false)
  const [resetEmail, setResetEmail] = useState('')

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const handle = async () => {
    setError(''); setSuccess('')
    const email    = form.email.trim().toLowerCase()
    const password = form.password
    const name     = form.name.trim()

    if (!email || !password) { setError('Please fill in all required fields.'); return }

    setLoading(true)
    try {
      if (tab === 'register') {
        if (!name) { setError('Please enter your full name.'); setLoading(false); return }
        const cred = await createUserWithEmailAndPassword(auth, email, password)
        await updateProfile(cred.user, { displayName: name })
      } else {
        await signInWithEmailAndPassword(auth, email, password)
      }
    } catch (e) {
      setError(friendlyError(e.code))
    }
    setLoading(false)
  }

  const handleReset = async () => {
    const email = resetEmail.trim().toLowerCase()
    if (!email) { setError('Please enter your email address.'); return }
    setLoading(true)
    try {
      await sendPasswordResetEmail(auth, email)
      setSuccess('Password reset email sent! Check your inbox.')
      setShowReset(false)
      setResetEmail('')
    } catch (e) {
      setError(friendlyError(e.code))
    }
    setLoading(false)
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
            onClick={() => { setTab('signin'); setError(''); setSuccess(''); setShowReset(false) }}>Sign In</button>
          <button className={`${styles.tab} ${tab === 'register' ? styles.active : ''}`}
            onClick={() => { setTab('register'); setError(''); setSuccess(''); setShowReset(false) }}>Register</button>
        </div>

        {error   && <div className={styles.error}>⚠ {error}</div>}
        {success && <div className={styles.successMsg}>✓ {success}</div>}

        {showReset ? (
          <>
            <p style={{ fontSize: 13, color: 'var(--mist)', marginBottom: 16 }}>
              Enter your email and we'll send a reset link.
            </p>
            <div className="field-group">
              <label>Email Address</label>
              <input type="email" autoComplete="email" placeholder="you@example.com"
                value={resetEmail} onChange={(e) => setResetEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleReset()} />
            </div>
            <button className="btn-primary" style={{ width: '100%', opacity: loading ? 0.6 : 1 }}
              onClick={handleReset} disabled={loading}>
              {loading ? 'Sending…' : 'Send Reset Email →'}
            </button>
            <p className={styles.hint} style={{ marginTop: 12, cursor: 'pointer', textDecoration: 'underline' }}
              onClick={() => { setShowReset(false); setError('') }}>← Back to Sign In</p>
          </>
        ) : (
          <>
            {tab === 'register' && (
              <div className="field-group">
                <label>Full Name</label>
                <input type="text" autoComplete="name" placeholder="Your full name" value={form.name} onChange={set('name')} onKeyDown={handleKey} />
              </div>
            )}
            <div className="field-group">
              <label>Email Address</label>
              <input type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={set('email')} onKeyDown={handleKey} />
            </div>
            <div className="field-group">
              <label>Password</label>
              <input type="password" autoComplete={tab === 'register' ? 'new-password' : 'current-password'} placeholder="••••••••" value={form.password} onChange={set('password')} onKeyDown={handleKey} />
            </div>

            {tab === 'signin' && (
              <p className={styles.hint} style={{ marginTop: -8, marginBottom: 16, cursor: 'pointer', textDecoration: 'underline' }}
                onClick={() => { setShowReset(true); setError(''); setResetEmail(form.email) }}>
                Forgot password?
              </p>
            )}

            <button className="btn-primary" style={{ width: '100%', opacity: loading ? 0.6 : 1 }} onClick={handle} disabled={loading}>
              {loading ? 'Please wait…' : tab === 'signin' ? 'Sign In →' : 'Create Account →'}
            </button>
            <p className={styles.hint} style={{ marginTop: 12 }}>
              {tab === 'signin' ? 'No account? Switch to Register above.' : 'Already have an account? Switch to Sign In.'}
            </p>
          </>
        )}
        <p className={styles.hint} style={{ marginTop: 8 }}>
          Your data syncs across all your devices automatically.
        </p>
      </div>
    </div>
  )
}
