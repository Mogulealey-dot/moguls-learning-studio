import { useState, useRef, useEffect } from 'react'
import { SITE_SECTIONS } from '../utils'
import styles from './Navbar.module.css'

function NavSearch({ scrollTo }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef()

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const results = query.trim().length > 0
    ? SITE_SECTIONS.filter((s) =>
        s.label.toLowerCase().includes(query.toLowerCase()) ||
        s.sub.toLowerCase().includes(query.toLowerCase())
      )
    : []

  const go = (id) => { scrollTo(id); setQuery(''); setOpen(false) }

  return (
    <div className={styles.searchWrap} ref={ref}>
      <span className={styles.searchIcon}>🔍</span>
      <input
        className={styles.searchInput}
        placeholder="Search the studio…"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setOpen(false)
          if (e.key === 'Enter' && results.length > 0) go(results[0].id)
        }}
      />
      {open && query.trim().length > 0 && (
        <div className={styles.dropdown}>
          {results.length === 0
            ? <div className={styles.noResults}>No results for "{query}"</div>
            : results.map((r, i) => (
              <div key={i} className={styles.resultItem} onClick={() => go(r.id)}>
                <span className={styles.resultIcon}>{r.icon}</span>
                <div>
                  <div className={styles.resultLabel}>{r.label}</div>
                  <div className={styles.resultSub}>{r.sub}</div>
                </div>
              </div>
            ))
          }
        </div>
      )}
    </div>
  )
}

const NAV_LINKS = [
  ['home',       'Home'],
  ['tasks',      '✅ Tasks'],
  ['pomodoro',   '🍅 Timer'],
  ['grades',     '🎓 Grades'],
  ['calculator', '🧮 Calc'],
  ['materials',  '📚 Files'],
  ['notes',      '📓 Notes'],
  ['ai',         'AI ✦'],
]

export default function Navbar({ user, onLogout, onBack, scrollTo, activeSection }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const go = (id) => { scrollTo(id); setMenuOpen(false) }

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.left}>
          {onBack && (
            <button className={styles.backBtn} onClick={onBack} title="Back to all studios">
              ‹ Studios
            </button>
          )}
          <div className={styles.brand}>
            <em>Finance</em> Studio
          </div>
        </div>

        <ul className={styles.links}>
          {NAV_LINKS.map(([id, label]) => (
            <li key={id}>
              <a
                className={activeSection === id ? styles.active : ''}
                onClick={() => scrollTo(id)}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>

        <NavSearch scrollTo={scrollTo} />

        <div className={styles.userArea}>
          <div className={styles.avatar}>
            {user?.name ? user.name[0].toUpperCase() : '?'}
          </div>
          <span className={styles.userName}>{user?.name}</span>
          <button className={styles.signOut} onClick={onLogout}>Sign Out</button>
          <button className={styles.hamburger} onClick={() => setMenuOpen((v) => !v)} aria-label="Menu">
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className={styles.mobileMenu}>
          {NAV_LINKS.map(([id, label]) => (
            <div
              key={id}
              className={`${styles.mobileLink} ${activeSection === id ? styles.mobileLinkActive : ''}`}
              onClick={() => go(id)}
            >
              {label}
            </div>
          ))}
        </div>
      )}
    </>
  )
}
