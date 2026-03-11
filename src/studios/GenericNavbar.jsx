import { useState, useRef, useEffect } from 'react'
import styles from '../components/Navbar.module.css'

export default function GenericNavbar({ user, onLogout, onBack, scrollTo, activeSection, studioName, navLinks }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef()

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const links = navLinks || [['home','Home'],['tasks','Tasks'],['notes','Notes'],['ai','AI ✦']]
  const results = query.trim().length > 0
    ? links.filter(([, label]) => label.toLowerCase().includes(query.toLowerCase()))
    : []

  const go = (id) => { scrollTo(id); setQuery(''); setOpen(false) }

  return (
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
        {links.map(([id, label]) => (
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
        <div className={styles.avatar}>
          {user?.name ? user.name[0].toUpperCase() : '?'}
        </div>
        <span className={styles.userName}>{user?.name}</span>
        <button className={styles.signOut} onClick={onLogout}>Sign Out</button>
      </div>
    </nav>
  )
}
