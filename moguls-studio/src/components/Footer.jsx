import styles from './Footer.module.css'

export default function Footer() {
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
            <li><a>Home</a></li>
            <li><a>Clock & Calendar</a></li>
            <li><a>Study Materials</a></li>
            <li><a>My Notes</a></li>
          </ul>
        </div>
        <div className={styles.col}>
          <h4>Resources</h4>
          <ul>
            <li><a>Lecture Notes</a></li>
            <li><a>Past Papers</a></li>
            <li><a>Financial Calculator</a></li>
            <li><a>AI Assistant</a></li>
          </ul>
        </div>
        <div className={styles.col}>
          <h4>About</h4>
          <ul>
            <li><a>My Profile</a></li>
            <li><a>Settings</a></li>
            <li><a>Help & FAQ</a></li>
            <li><a>Sign Out</a></li>
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
