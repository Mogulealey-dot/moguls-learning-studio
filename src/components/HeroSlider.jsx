import { useState, useEffect } from 'react'
import { SLIDES } from '../utils'
import styles from './HeroSlider.module.css'

export default function HeroSlider() {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % SLIDES.length), 5000)
    return () => clearInterval(t)
  }, [])

  const goTo = (i) => setIdx(i)

  return (
    <div className={styles.slider}>
      {SLIDES.map((s, i) => (
        <div key={i} className={`${styles.slide} ${i === idx ? styles.active : ''}`}>
          <img
            className={styles.bg}
            src={s.bg}
            alt={s.title}
            onError={(e) => { e.target.src = SLIDES[0].bg }}
          />
          <div className={styles.overlay} />
          <div className={styles.content}>
            <p className={styles.tag}>✦ {s.tag}</p>
            <h1 className={styles.title} style={{ whiteSpace: 'pre-line' }}>{s.title}</h1>
            <p className={styles.desc}>{s.desc}</p>
          </div>
        </div>
      ))}

      <button className={`${styles.navBtn} ${styles.prev}`} onClick={() => goTo((idx - 1 + SLIDES.length) % SLIDES.length)}>‹</button>
      <button className={`${styles.navBtn} ${styles.next}`} onClick={() => goTo((idx + 1) % SLIDES.length)}>›</button>

      <div className={styles.dots}>
        {SLIDES.map((_, i) => (
          <button key={i} className={`${styles.dot} ${i === idx ? styles.activeDot : ''}`} onClick={() => goTo(i)} />
        ))}
      </div>
    </div>
  )
}
