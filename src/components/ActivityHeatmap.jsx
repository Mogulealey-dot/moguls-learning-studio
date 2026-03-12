import styles from './ActivityHeatmap.module.css'

function calcStreak(counts) {
  let streak = 0
  const today = new Date()
  for (let i = 0; i <= 365; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    if (counts[d.toLocaleDateString()]) streak++
    else if (i > 0) break
  }
  return streak
}

export default function ActivityHeatmap({ sessions }) {
  const today = new Date()

  // Build last 364 days grouped into 52 weeks
  const days = []
  for (let i = 363; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    days.push(d)
  }

  const counts = {}
  for (const s of sessions) {
    counts[s.date] = (counts[s.date] || 0) + 1
  }

  // Group into columns of 7
  const weeks = []
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7))

  // Month labels: track which week each month first appears
  const monthLabels = []
  let lastMonth = -1
  weeks.forEach((week, wi) => {
    const m = week[0].getMonth()
    if (m !== lastMonth) {
      monthLabels.push({ wi, label: week[0].toLocaleString('default', { month: 'short' }) })
      lastMonth = m
    } else {
      monthLabels.push(null)
    }
  })

  const cellColor = (count) => {
    if (!count) return undefined
    if (count === 1) return 'rgba(201,168,76,0.35)'
    if (count === 2) return 'rgba(201,168,76,0.6)'
    if (count === 3) return 'rgba(201,168,76,0.85)'
    return 'rgba(201,168,76,1)'
  }

  const totalSessions = sessions.length
  const activeDays    = Object.keys(counts).length
  const totalMins     = sessions.reduce((a, s) => a + (s.duration || 0), 0)
  const streak        = calcStreak(counts)

  return (
    <div className={styles.wrap}>
      <div className={styles.summary}>
        <div className={styles.summaryItem}><span className={styles.summaryNum}>{totalSessions}</span><span className={styles.summaryLbl}>Total Sessions</span></div>
        <div className={styles.summaryItem}><span className={styles.summaryNum}>{activeDays}</span><span className={styles.summaryLbl}>Active Days</span></div>
        <div className={styles.summaryItem}><span className={styles.summaryNum}>{Math.round(totalMins / 60 * 10) / 10}h</span><span className={styles.summaryLbl}>Total Hours</span></div>
        <div className={styles.summaryItem}><span className={styles.summaryNum} style={{ color: streak > 0 ? '#e8a84c' : undefined }}>{streak}{streak > 0 ? ' 🔥' : ''}</span><span className={styles.summaryLbl}>Day Streak</span></div>
      </div>

      <div className={styles.gridWrap}>
        {/* Month row */}
        <div className={styles.monthRow}>
          {weeks.map((_, wi) => (
            <div key={wi} className={styles.monthCell}>
              {monthLabels[wi]?.label || ''}
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div className={styles.grid}>
          {weeks.map((week, wi) => (
            <div key={wi} className={styles.week}>
              {week.map((day, di) => {
                const key   = day.toLocaleDateString()
                const count = counts[key] || 0
                const isToday = key === today.toLocaleDateString()
                return (
                  <div
                    key={di}
                    className={`${styles.cell} ${isToday ? styles.cellToday : ''}`}
                    style={{ background: cellColor(count) }}
                    title={`${key}: ${count} session${count !== 1 ? 's' : ''}`}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.legend}>
        <span className={styles.legendLabel}>Less</span>
        <div className={styles.cell} />
        <div className={styles.cell} style={{ background: 'rgba(201,168,76,0.35)' }} />
        <div className={styles.cell} style={{ background: 'rgba(201,168,76,0.6)' }} />
        <div className={styles.cell} style={{ background: 'rgba(201,168,76,0.85)' }} />
        <div className={styles.cell} style={{ background: 'rgba(201,168,76,1)' }} />
        <span className={styles.legendLabel}>More</span>
      </div>
    </div>
  )
}
