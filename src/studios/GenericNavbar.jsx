import { useState, useRef, useEffect } from 'react'
import styles from '../components/Navbar.module.css'
import ProfilePage from '../components/ProfilePage'
import ThemeToggle from '../components/ThemeToggle'
import GlobalSearch from '../components/GlobalSearch'
import StudyRoom from '../components/StudyRoom'

export default function GenericNavbar({ user, onLogout, onBack, scrollTo, activeSection, studioName, navLinks, navBadges = {} }) {
  const [showProfile, setShowProfile] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [showRoom, setShowRoom] = useState(false)
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef()

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setShowSearch(true)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  const links = navLinks || [['home','Home'],['tasks','Tasks'],['notes','Notes'],['ai','AI ✦']]
  const results = query.trim().length > 0
    ? links.filter(([, label]) => label.toLowerCase().includes(query.toLowerCase()))
    : []

  const go = (id) => { scrollTo(id); setQuery(''); setOpen(false) }

  return (
    <>
    {showProfile && <ProfilePage user={user} onClose={() => setShowProfile(false)} onLogout={onLogout} />}
    {showSearch && <GlobalSearch open={showSearch} onClose={() => setShowSearch(false)} />}
    {showRoom && <StudyRoom onClose={() => setShowRoom(false)} />}
    <nav className={styles.navbar}>
      <div className={styles.left}>
        {onBack && (
          <button className={styles.backBtn} onClick={onBack} title="Back to all studios">
            ‹ Studios
          </button>
        )}
        <div className={styles.brand}>
          <em>{studioName}</em> Studio
        </div>
      </div>

      <ul className={styles.links}>
        {links.map(([id, label]) => {
          const count = navBadges[id]
          const badgeType = id === 'tasks' ? styles.badgeTasks : styles.badge
          return (
            <li key={id}>
              <a
                className={activeSection === id ? styles.active : ''}
                onClick={() => scrollTo(id)}
              >
                {label}
                {count > 0 && <span className={badgeType}>{count}</span>}
              </a>
            </li>
          )
        })}
      </ul>

      <div className={styles.searchWrap} ref={ref}>
        <span className={styles.searchIcon}>🔍</span>
        <input
          className={styles.searchInput}
          placeholder="Search sections…"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setOpen(false)
            if (e.key === 'Enter' && results.length > 0) go(results[0][0])
          }}
        />
        {open && query.trim().length > 0 && (
          <div className={styles.dropdown}>
            {results.length === 0
              ? <div className={styles.noResults}>No results for "{query}"</div>
              : results.map(([id, label], i) => (
                <div key={i} className={styles.resultItem} onClick={() => go(id)}>
                  <div className={styles.resultLabel}>{label}</div>
                </div>
              ))
            }
          </div>
        )}
      </div>

      <div className={styles.userArea}>
        <button className={styles.roomBtn} onClick={() => setShowRoom(true)} title="Study Room">
          👥
        </button>
        <div className={styles.avatar} onClick={() => setShowProfile(true)} style={{ cursor: 'pointer' }} title="Edit profile">
          {user?.name ? user.name[0].toUpperCase() : '?'}
        </div>
        <span className={styles.userName}>{user?.name}</span>
        <ThemeToggle />
        <button className={styles.signOut} onClick={() => setShowProfile(true)}>Profile</button>
        <button className={styles.signOut} onClick={onLogout}>Sign Out</button>
      </div>
    </nav>
    </>
  )
}
