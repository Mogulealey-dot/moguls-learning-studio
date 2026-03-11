import styles from './LandingPage.module.css'

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
    status: 'soon',
  },
  {
    id: 'cs',
    icon: '⌨',
    name: 'Computer Science',
    subtitle: 'Programming & Algorithms',
    desc: 'Data structures, algorithm design, and software engineering — a workspace for the digital-age thinker.',
    color: '#6e8efb',
    tags: ['Algorithms', 'Data Structures', 'Code Notes', 'Complexity'],
    status: 'soon',
  },
  {
    id: 'philosophy',
    icon: '⚖',
    name: 'Philosophy',
    subtitle: 'Ethics, Logic & Metaphysics',
    desc: 'Explore the great questions. Structured argument mapping, reading notes, and Socratic dialogue with AI.',
    color: '#9b7fd4',
    tags: ['Logic', 'Ethics', 'Critical Thinking', 'Epistemology'],
    status: 'soon',
  },
  {
    id: 'sciences',
    icon: '🔬',
    name: 'Natural Sciences',
    subtitle: 'Physics, Chemistry & Biology',
    desc: 'Scientific method, lab reports, and concept mastery — your digital lab notebook, reimagined.',
    color: '#2ecc71',
    tags: ['Physics', 'Chemistry', 'Biology', 'Lab Reports'],
    status: 'soon',
  },
  {
    id: 'literature',
    icon: '📖',
    name: 'Literature',
    subtitle: 'Language & Literary Analysis',
    desc: 'Analyse texts, track themes, and develop your voice as a writer and critical reader.',
    color: '#e8a84c',
    tags: ['Analysis', 'Essay Writing', 'Book Notes', 'Rhetoric'],
    status: 'soon',
  },
  {
    id: 'history',
    icon: '🌍',
    name: 'History & Politics',
    subtitle: 'Past Events & Global Affairs',
    desc: 'Timeline tools, geopolitical analysis, and structured note-taking for the student of world affairs.',
    color: '#cd6155',
    tags: ['Timelines', 'Essays', 'Research', 'Geopolitics'],
    status: 'soon',
  },
  {
    id: 'arts',
    icon: '🎨',
    name: 'Arts & Design',
    subtitle: 'Creative & Visual Studies',
    desc: 'Mood boards, project planning, and portfolio organisation for the creatively inclined mind.',
    color: '#e74c8b',
    tags: ['Portfolio', 'Projects', 'Inspiration', 'Critique'],
    status: 'soon',
  },
]

export default function LandingPage({ user, onLogout, onEnterStudio }) {
  const firstName = user?.name?.split(' ')[0] || 'Scholar'

  return (
    <div className={styles.page}>
      {/* ── Header ── */}
      <header className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.brandMark}>✦</span>
          <span><em>Mogul's</em> Learning Studio</span>
        </div>
        <div className={styles.userArea}>
          <div className={styles.avatar}>{user?.name ? user.name[0].toUpperCase() : '?'}</div>
          <span className={styles.userName}>{user?.name}</span>
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
          {STUDIOS.map((s) => (
            <div
              key={s.id}
              className={`${styles.card} ${s.status === 'active' ? styles.cardActive : styles.cardSoon}`}
              style={{ '--accent': s.color }}
            >
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
