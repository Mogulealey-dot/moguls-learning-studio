import { useState, useEffect } from 'react'
import styles from './Clocks.module.css'

export function DigitalClock() {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const h = time.getHours()
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  const pad = (n) => String(n).padStart(2, '0')
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

  return (
    <div className={styles.digitalCard}>
      <p className={styles.cardLabel}>Local Time</p>
      <div className={styles.display}>
        <div className={styles.segment}>
          <span className={styles.number}>{pad(h12)}</span>
          <span className={styles.unit}>Hours</span>
        </div>
        <div className={styles.colon}>:</div>
        <div className={styles.segment}>
          <span className={styles.number}>{pad(time.getMinutes())}</span>
          <span className={styles.unit}>Minutes</span>
        </div>
        <div className={styles.colon}>:</div>
        <div className={styles.segment}>
          <span className={styles.number}>{pad(time.getSeconds())}</span>
          <span className={styles.unit}>Seconds</span>
        </div>
      </div>
      <span className={styles.ampm}>{ampm}</span>
      <p className={styles.dateLine}>
        {days[time.getDay()]}, {months[time.getMonth()]} {time.getDate()}, {time.getFullYear()}
      </p>
    </div>
  )
}

export function AnalogClock() {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const sec = time.getSeconds()
  const min = time.getMinutes()
  const hr  = time.getHours() % 12
  const secDeg = sec * 6
  const minDeg = min * 6 + sec * 0.1
  const hrDeg  = hr * 30 + min * 0.5

  const nums = [12,1,2,3,4,5,6,7,8,9,10,11]

  return (
    <div className={styles.analogCard}>
      <p className={styles.cardLabel}>Analog Clock</p>
      <div className={styles.face}>
        {nums.map((n, i) => {
          const angle = (i * 30 - 90) * (Math.PI / 180)
          const r = 88
          const x = 110 + r * Math.cos(angle)
          const y = 110 + r * Math.sin(angle)
          return (
            <div key={n} className={styles.num} style={{ left: x, top: y, transform: 'translate(-50%,-50%)' }}>
              {n}
            </div>
          )
        })}
        {Array.from({ length: 60 }, (_, i) => {
          const major = i % 5 === 0
          return (
            <div key={i} className={styles.tick} style={{
              width: major ? '2px' : '1px',
              height: major ? '10px' : '6px',
              background: major ? 'rgba(201,168,76,0.5)' : 'rgba(201,168,76,0.2)',
              left: '50%', top: '4px',
              transformOrigin: 'bottom center',
              transform: `translateX(-50%) rotate(${i * 6}deg)`,
              position: 'absolute',
            }} />
          )
        })}
        <div className={styles.hands}>
          <div className={`${styles.hand} ${styles.hourHand}`} style={{ transform: `rotate(${hrDeg}deg)` }} />
          <div className={`${styles.hand} ${styles.minuteHand}`} style={{ transform: `rotate(${minDeg}deg)` }} />
          <div className={`${styles.hand} ${styles.secondHand}`} style={{ transform: `rotate(${secDeg}deg)` }} />
          <div className={styles.center} />
        </div>
      </div>
    </div>
  )
}

export default function Clocks() {
  return (
    <section id="clocks" className={`${styles.section}`}>
      <div className="section-header">
        <p className="section-eyebrow">✦ Always on Time</p>
        <h2 className="section-title">Time & <em>Schedule</em></h2>
        <div className="divider" />
      </div>
      <div className={styles.grid}>
        <DigitalClock />
        <AnalogClock />
      </div>
    </section>
  )
}
