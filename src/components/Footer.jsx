import styles from './Footer.module.css'

const scrollTo = (id) => {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth' })
  else window.scrollTo({ top: 0, behavior: 'smooth' })
}

export default function Footer({ onLogout, onBack }) {
  return (
    <footer className={styles.footer}>
      <div className={styles.top}>
        <div className={styles.brand}>
          <h2><em>Mogul's</em> Learning Studio</h2>
          <p>Your personal academic command center. Organize notes, track results, and stay ahead — all in one beautifully designed workspace.</p>
          <div className={styles.social}>
            {['⌥','𝕏','in','✉'].map((icon, i) => (
              <a key={i} className={styles.socialBtn}>{icon}</a>
            ))}
          </div>
        </div>
        <div className={styles.col}>
          <h4>Navigate</h4>
          <ul>
            <li><a onClick={() => scrollTo('home')}>Home</a></li>
            <li><a onClick={() => scrollTo('schedule')}>Schedule & Calendar</a></li>
            <li><a onClick={() => scrollTo('materials')}>Study Materials</a></li>
            <li><a onClick={() => scrollTo('notes')}>My Notes</a></li>
          </ul>
        </div>
        <div className={styles.col}>
          <h4>Resources</h4>
          <ul>
            <li><a onClick={() => scrollTo('materials')}>Lecture Notes</a></li>
            <li><a onClick={() => scrollTo('materials')}>Past Papers</a></li>
            <li><a onClick={() => scrollTo('tools')}>Calculator Tools</a></li>
            <li><a onClick={() => scrollTo('ai')}>AI Assistant</a></li>
          </ul>
        </div>
        <div className={styles.col}>
          <h4>About</h4>
          <ul>
            <li><a onClick={() => onBack?.()}>← All Studios</a></li>
            <li><a onClick={() => scrollTo('grades')}>My Grades</a></li>
            <li><a onClick={() => scrollTo('tasks')}>My Tasks</a></li>
            <li><a onClick={() => onLogout?.()} className={styles.signOutLink}>Sign Out</a></li>
          </ul>
        </div>
      </div>
      <div className={styles.bottom}>
        <span className={styles.copy}>© {new Date().getFullYear()} Mogul's Learning Studio. All rights reserved.</span>
        <span className={styles.tagline}>"Where scholars are forged."</span>
        <span className={styles.badge}>v2.0</span>
      </div>
    </footer>
  )
}
