import { useState } from 'react'
import styles from './Calendar.module.css'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

export default function Calendar() {
  const now = new Date()
  const [year, setYear]   = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())

  const prev = () => { if (month === 0) { setMonth(11); setYear((y) => y - 1) } else setMonth((m) => m - 1) }
  const next = () => { if (month === 11) { setMonth(0); setYear((y) => y + 1) } else setMonth((m) => m + 1) }

  const firstDay = new Date(year, month, 1).getDay()
  const lastDate = new Date(year, month + 1, 0).getDate()
  const prevLast = new Date(year, month, 0).getDate()
  const todayStr = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`

  const cells = []
  for (let i = firstDay - 1; i >= 0; i--) cells.push({ day: prevLast - i, type: 'prev' })
  for (let d = 1; d <= lastDate; d++) cells.push({ day: d, type: 'current' })
  while (cells.length % 7 !== 0) cells.push({ day: cells.length - lastDate - firstDay + 2, type: 'next' })

  return (
    <section id="calendar" className="section" style={{ background: 'rgba(245,240,232,0.02)' }}>
      <div className="section-header">
        <p className="section-eyebrow">✦ Plan Your Month</p>
        <h2 className="section-title">Academic <em>Calendar</em></h2>
        <div className="divider" />
      </div>
      <div className={styles.card}>
        <div className={styles.header}>
          <button className={styles.navBtn} onClick={prev}>‹</button>
          <div className={styles.monthYear}>{MONTHS[month]} {year}</div>
          <button className={styles.navBtn} onClick={next}>›</button>
        </div>
        <div className={styles.todayBadge}>
          Today — {MONTHS[now.getMonth()]} {now.getDate()}, {now.getFullYear()}
        </div>
        <div className={styles.weekdays}>
          {['Su','Mo','Tu','We','Th','Fr','Sa'].map((d) => <div key={d}>{d}</div>)}
        </div>
        <div className={styles.days}>
          {cells.map((c, i) => {
            const isToday = c.type === 'current' && `${year}-${month}-${c.day}` === todayStr
            return (
              <div
                key={i}
                className={`${styles.day} ${isToday ? styles.today : ''} ${c.type !== 'current' ? styles.other : ''}`}
              >
                {c.day}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
