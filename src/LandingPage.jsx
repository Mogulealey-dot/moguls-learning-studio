import { useState, useEffect } from 'react'
import styles from './LandingPage.module.css'
import ProfilePage from './components/ProfilePage'
import ThemeToggle from './components/ThemeToggle'
import GlobalSearch from './components/GlobalSearch'
import StudyRoom from './components/StudyRoom'
import { useUserData } from './hooks/useUserData'

const STUDIOS = [
  {
    id: 'finance',
    icon: '📊',
    name: 'Finance',
    subtitle: 'MBA Financial Management',
    desc: 'Master corporate finance, TVM, NPV/IRR, grade tracking, and quantitative analysis — all in one command center.',
    color: '#c9a84c',
    tags: ['TVM & NPV/IRR', 'Grade Calculator', 'AI Assistant', 'Pomodoro'],
    status: 'active',
  },
  {
    id: 'mathematics',
    icon: '∑',
    name: 'Mathematics',
    subtitle: 'Pure & Applied Mathematics',
    desc: 'Calculus, linear algebra, statistics, and discrete mathematics — interactive problem solving and concept mastery.',
    color: '#4a9eca',
    tags: ['Calculus', 'Statistics', 'Linear Algebra', 'Proofs'],
    status: 'active',
  },
  {
    id: 'cs',
    icon: '⌨',
    name: 'Computer Science',
    subtitle: 'Programming & Algorithms',
    desc: 'Data structures, algorithm design, and software engineering — a workspace for the digital-age thinker.',
    color: '#6e8efb',
    tags: ['Algorithms', 'Data Structures', 'Code Notes', 'Complexity'],
    status: 'active',
  },
  {
    id: 'philosophy',
    icon: '⚖',
    name: 'Philosophy',
    subtitle: 'Ethics, Logic & Metaphysics',
    desc: 'Explore the great questions. Structured argument mapping, reading notes, and Socratic dialogue with AI.',
    color: '#9b7fd4',
    tags: ['Logic', 'Ethics', 'Critical Thinking', 'Epistemology'],
    status: 'active',
  },
  {
    id: 'sciences',
    icon: '🔬',
    name: 'Natural Sciences',
    subtitle: 'Physics, Chemistry & Biology',
    desc: 'Scientific method, lab reports, and concept mastery — your digital lab notebook, reimagined.',
    color: '#2ecc71',
    tags: ['Physics', 'Chemistry', 'Biology', 'Lab Reports'],
    status: 'active',
  },
  {
    id: 'literature',
    icon: '📖',
    name: 'Literature',
    subtitle: 'Language & Literary Analysis',
    desc: 'Analyse texts, track themes, and develop your voice as a writer and critical reader.',
    color: '#e8a84c',
    tags: ['Analysis', 'Essay Writing', 'Book Notes', 'Rhetoric'],
    status: 'active',
  },
  {
    id: 'history',
    icon: '🌍',
    name: 'History & Politics',
    subtitle: 'Past Events & Global Affairs',
    desc: 'Timeline tools, geopolitical analysis, and structured note-taking for the student of world affairs.',
    color: '#cd6155',
    tags: ['Timelines', 'Essays', 'Research', 'Geopolitics'],
    status: 'active',
  },
  {
    id: 'arts',
    icon: '🎨',
    name: 'Arts & Design',
    subtitle: 'Creative & Visual Studies',
    desc: 'Mood boards, project planning, and portfolio organisation for the creatively inclined mind.',
    color: '#e74c8b',
    tags: ['Portfolio', 'Projects', 'Inspiration', 'Critique'],
    status: 'active',
  },
]

function AddStudioModal({ hidden, onRestore, onClose }) {
  return (
    <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.addModal}>
        <div className={styles.addModalHeader}>
          <h3 className={styles.addModalTitle}>Restore a Studio</h3>
          <button className={styles.addModalClose} onClick={onClose}>✕</button>
        </div>
        <p className={styles.addModalSub}>Select a studio to add back to your dashboard.</p>
        <div className={styles.addModalList}>
          {hidden.map((s) => (
            <div
              key={s.id}
              className={styles.addModalItem}
              style={{ '--accent': s.color }}
              onClick={() => { onRestore(s.id); onClose() }}
            >
              <span className={styles.addModalIcon}>{s.icon}</span>
              <div className={styles.addModalInfo}>
                <div className={styles.addModalName}>{s.name}</div>
                <div className={styles.addModalSub2}>{s.subtitle}</div>
              </div>
              <span className={styles.addModalPlus}>+ Add</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function LandingPage({ user, onLogout, onEnterStudio }) {
  const firstName = user?.name?.split(' ')[0] || 'Scholar'
  const [showProfile, setShowProfile] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [showRoom, setShowRoom] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [hiddenStudios, setHiddenStudios] = useUserData('mls_hidden_studios', [])

  const visibleStudios = STUDIOS.filter((s) => !hiddenStudios.includes(s.id))
  const hiddenList = STUDIOS.filter((s) => hiddenStudios.includes(s.id))

  const hideStudio = (id) => setHiddenStudios((prev) => [...prev, id])
  const restoreStudio = (id) => setHiddenStudios((prev) => prev.filter((hid) => hid !== id))

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

  return (
    <div className={styles.page}>
      {showProfile && <ProfilePage user={user} onClose={() => setShowProfile(false)} onLogout={onLogout} />}
      {showSearch && <GlobalSearch open={showSearch} onClose={() => setShowSearch(false)} />}
      {showRoom && <StudyRoom onClose={() => setShowRoom(false)} />}
      {showAddModal && (
        <AddStudioModal
          hidden={hiddenList}
          onRestore={restoreStudio}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {/* ── Header ── */}
      <header className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.brandMark}>✦</span>
          <span><em>Mogul's</em> Learning Studio</span>
        </div>
        <div className={styles.userArea}>
          <button className={styles.searchBtn} onClick={() => setShowSearch(true)} title="Search notes (⌘K)">
            🔍 <span className={styles.searchBtnLabel}>Search</span>
          </button>
          <button className={styles.roomBtn} onClick={() => setShowRoom(true)} title="Study Rooms">
            👥
          </button>
          <div className={styles.avatar} onClick={() => setShowProfile(true)} title="Edit profile" style={{ cursor: 'pointer' }}>
            {user?.name ? user.name[0].toUpperCase() : '?'}
          </div>
          <span className={styles.userName}>{user?.name}</span>
          <ThemeToggle />
          <button className={styles.profileBtn} onClick={() => setShowProfile(true)}>Profile</button>
          <button className={styles.signOutBtn} onClick={onLogout}>Sign Out</button>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.heroEyebrow}>✦ Welcome back, {firstName}</p>
          <h1 className={styles.heroTitle}>Choose Your<br /><em>Learning Studio</em></h1>
          <p className={styles.heroSub}>
            Each studio is a fully equipped academic workspace — tools, calculators, notes,
            AI assistance, and more — tailored for your subject.
          </p>
        </div>
        <div className={styles.heroDivider} />
      </section>

      {/* ── Studio Grid ── */}
      <section className={styles.gridSection}>
        <div className={styles.grid}>
          {visibleStudios.map((s) => (
            <div
              key={s.id}
              className={`${styles.card} ${s.status === 'active' ? styles.cardActive : styles.cardSoon}`}
              style={{ '--accent': s.color }}
            >
              {/* Remove button */}
              <button
                className={styles.removeBtn}
                onClick={(e) => { e.stopPropagation(); hideStudio(s.id) }}
                title="Remove from dashboard"
              >
                ✕
              </button>

              {s.status === 'soon' && (
                <div className={styles.soonBadge}>Coming Soon</div>
              )}
              {s.status === 'active' && (
                <div className={styles.activeBadge}>Available Now</div>
              )}

              <div className={styles.cardIcon}>{s.icon}</div>
              <h3 className={styles.cardName}>{s.name}</h3>
              <p className={styles.cardSubtitle}>{s.subtitle}</p>
              <p className={styles.cardDesc}>{s.desc}</p>

              <div className={styles.tags}>
                {s.tags.map((t) => (
                  <span key={t} className={styles.tag}>{t}</span>
                ))}
              </div>

              {s.status === 'active' ? (
                <button
                  className={styles.enterBtn}
                  style={{ background: `linear-gradient(135deg, ${s.color}, ${s.color}cc)` }}
                  onClick={() => onEnterStudio(s.id)}
                >
                  Enter Studio →
                </button>
              ) : (
                <div className={styles.notifyBtn}>Notify Me</div>
              )}
            </div>
          ))}

          {/* Add Studio card — only shown when studios are hidden */}
          {hiddenList.length > 0 && (
            <div className={styles.addCard} onClick={() => setShowAddModal(true)}>
              <div className={styles.addCardIcon}>+</div>
              <div className={styles.addCardName}>Add Studio</div>
              <div className={styles.addCardSub}>{hiddenList.length} studio{hiddenList.length !== 1 ? 's' : ''} hidden</div>
            </div>
          )}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <span className={styles.footerCopy}>© {new Date().getFullYear()} Mogul's Learning Studio</span>
        <span className={styles.footerTagline}>"Where scholars are forged."</span>
      </footer>
    </div>
  )
}
