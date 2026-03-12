import { useState } from 'react'
import { updateProfile, updateEmail, updatePassword, deleteUser, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth'
import { auth } from '../firebase'
import styles from './ProfilePage.module.css'
import { useAllSessions } from '../hooks/useAllSessions'
import ActivityHeatmap from './ActivityHeatmap'

export default function ProfilePage({ user, onClose, onLogout }) {
  const firebaseUser = auth.currentUser
  const [tab, setTab]         = useState('profile')
  const [name, setName]       = useState(user?.name || '')
  const [email, setEmail]     = useState(user?.email || '')
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw]     = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [reauth, setReauth]   = useState('')
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [showDelete, setShowDelete] = useState(false)

  const allSessions = useAllSessions()

  const clear = () => { setError(''); setSuccess('') }

  const saveProfile = async () => {
    clear()
    if (!name.trim()) { setError('Name cannot be empty.'); return }
    setLoading(true)
    try {
      await updateProfile(firebaseUser, { displayName: name.trim() })
      if (email.trim().toLowerCase() !== firebaseUser.email) {
        await updateEmail(firebaseUser, email.trim().toLowerCase())
      }
      setSuccess('Profile updated successfully.')
    } catch (e) {
      if (e.code === 'auth/requires-recent-login') {
        setError('For security, please sign out and sign back in before changing your email.')
      } else {
        setError(e.message || 'Failed to update profile.')
      }
    }
    setLoading(false)
  }

  const changePassword = async () => {
    clear()
    if (!currentPw) { setError('Please enter your current password.'); return }
    if (newPw.length < 6) { setError('New password must be at least 6 characters.'); return }
    if (newPw !== confirmPw) { setError('New passwords do not match.'); return }
    setLoading(true)
    try {
      const credential = EmailAuthProvider.credential(firebaseUser.email, currentPw)
      await reauthenticateWithCredential(firebaseUser, credential)
      await updatePassword(firebaseUser, newPw)
      setSuccess('Password changed successfully.')
      setCurrentPw(''); setNewPw(''); setConfirmPw('')
    } catch (e) {
      if (e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential') {
        setError('Current password is incorrect.')
      } else {
        setError(e.message || 'Failed to change password.')
      }
    }
    setLoading(false)
  }

  const handleDelete = async () => {
    clear()
    if (!reauth) { setError('Please enter your password to confirm.'); return }
    setLoading(true)
    try {
      const credential = EmailAuthProvider.credential(firebaseUser.email, reauth)
      await reauthenticateWithCredential(firebaseUser, credential)
      await deleteUser(firebaseUser)
      onLogout()
    } catch (e) {
      if (e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential') {
        setError('Incorrect password.')
      } else {
        setError(e.message || 'Failed to delete account.')
      }
    }
    setLoading(false)
  }

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`${styles.modal} ${tab === 'activity' ? styles.modalWide : ''}`}>
        <div className={styles.header}>
          <div className={styles.avatar}>{user?.name ? user.name[0].toUpperCase() : '?'}</div>
          <div>
            <div className={styles.headerName}>{user?.name}</div>
            <div className={styles.headerEmail}>{user?.email}</div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.tabs}>
          {[['profile', 'Profile'], ['activity', 'Activity'], ['password', 'Password'], ['danger', 'Account']].map(([id, label]) => (
            <button key={id} className={`${styles.tab} ${tab === id ? styles.tabActive : ''}`}
              onClick={() => { setTab(id); clear() }}>{label}</button>
          ))}
        </div>

        {error   && <div className={styles.error}>⚠ {error}</div>}
        {success && <div className={styles.success}>✓ {success}</div>}

        {tab === 'profile' && (
          <div className={styles.body}>
            <div className={styles.field}>
              <label>Display Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />
            </div>
            <div className={styles.field}>
              <label>Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            <button className={styles.saveBtn} onClick={saveProfile} disabled={loading}>
              {loading ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        )}

        {tab === 'activity' && (
          <div className={styles.body}>
            <ActivityHeatmap sessions={allSessions} />
          </div>
        )}

        {tab === 'password' && (
          <div className={styles.body}>
            <div className={styles.field}>
              <label>Current Password</label>
              <input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} placeholder="••••••••" />
            </div>
            <div className={styles.field}>
              <label>New Password</label>
              <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="••••••••" />
            </div>
            <div className={styles.field}>
              <label>Confirm New Password</label>
              <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} placeholder="••••••••" />
            </div>
            <button className={styles.saveBtn} onClick={changePassword} disabled={loading}>
              {loading ? 'Updating…' : 'Change Password'}
            </button>
          </div>
        )}

        {tab === 'danger' && (
          <div className={styles.body}>
            {!showDelete ? (
              <>
                <p style={{ fontSize: 13, color: 'var(--mist)', marginBottom: 20 }}>
                  Deleting your account is permanent. All your data will be lost.
                </p>
                <button className={styles.deleteBtn} onClick={() => setShowDelete(true)}>
                  Delete My Account
                </button>
              </>
            ) : (
              <>
                <p style={{ fontSize: 13, color: '#e87f8a', marginBottom: 16 }}>
                  Enter your password to permanently delete your account.
                </p>
                <div className={styles.field}>
                  <label>Password</label>
                  <input type="password" value={reauth} onChange={(e) => setReauth(e.target.value)} placeholder="••••••••" />
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button className={styles.cancelBtn} onClick={() => { setShowDelete(false); setReauth('') }}>Cancel</button>
                  <button className={styles.deleteBtn} onClick={handleDelete} disabled={loading}>
                    {loading ? 'Deleting…' : 'Confirm Delete'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
