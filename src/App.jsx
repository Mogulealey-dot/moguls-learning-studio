import { useState, useEffect } from 'react'
import { QUOTES } from './utils'
import { useUserData } from './hooks/useUserData'

import Navbar              from './components/Navbar'
import HeroSlider          from './components/HeroSlider'
import Clocks              from './components/Clocks'
import Calendar            from './components/Calendar'
import UploadCard          from './components/UploadCard'
import NotesApp            from './components/NotesApp'
import AIAssistant         from './components/AIAssistant'
import Footer              from './components/Footer'
import TaskTracker         from './components/TaskTracker'
import PomodoroTimer       from './components/PomodoroTimer'
import GradeCalculator     from './components/GradeCalculator'
import FinancialCalculator from './components/FinancialCalculator'

function QuoteTicker() {
  const [qi, setQi] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setQi((i) => (i + 1) % QUOTES.length), 7000)
    return () => clearInterval(t)
  }, [])
  return (
    <div style={{ background:'linear-gradient(135deg,var(--emerald) 0%,#0f4a32 100%)', padding:'20px 60px', display:'flex', alignItems:'center', gap:24, overflow:'hidden' }}>
      <span style={{ fontSize:10, letterSpacing:'0.3em', textTransform:'uppercase', color:'rgba(245,240,232,0.6)', whiteSpace:'nowrap', borderRight:'1px solid rgba(245,240,232,0.2)', paddingRight:24 }}>Daily Wisdom</span>
      <span style={{ fontFamily:"'Playfair Display',serif", fontSize:16, fontStyle:'italic', color:'rgba(245,240,232,0.9)' }}>"{QUOTES[qi]}"</span>
    </div>
  )
}

function StatsRow() {
  const [notes]    = useUserData('mls_notes',            [])
  const [uploads]  = useUserData('mls_notes_upload',     [])
  const [papers]   = useUserData('mls_papers_upload',    [])
  const [tasks]    = useUserData('mls_tasks',            [])
  const [pomodoro] = useUserData('mls_pomodoro_sessions', [])
  const noteCount   = notes.length
  const uploadCount = uploads.length
  const paperCount  = papers.length
  const taskCount   = tasks.filter(t => !t.done).length
  const sessions    = pomodoro.filter(s => s.date === new Date().toLocaleDateString()).length
  const stats = [
    { n:noteCount,   label:'Personal Notes',    color:'var(--gold)' },
    { n:uploadCount, label:'Files Uploaded',    color:'var(--gold)' },
    { n:paperCount,  label:'Exam Papers',       color:'var(--gold)' },
    { n:taskCount,   label:'Pending Tasks',     color: taskCount > 0 ? 'var(--crimson)' : 'var(--emerald-light)' },
    { n:sessions,    label:'Sessions Today 🍅', color:'var(--emerald-light)' },
  ]
  return (
    <div style={{ padding:'48px 60px 0', display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:16 }}>
      {stats.map((s,i) => (
        <div key={i} style={{ background:'rgba(245,240,232,0.03)', border:'1px solid rgba(201,168,76,0.15)', borderRadius:4, padding:'22px 20px', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:0, left:0, width:3, height:'100%', background:s.color }} />
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:38, fontWeight:900, color:s.color, lineHeight:1, marginBottom:8 }}>{s.n}</div>
          <div style={{ fontSize:12, color:'var(--mist)', letterSpacing:'0.05em' }}>{s.label}</div>
        </div>
      ))}
    </div>
  )
}

function MaterialsSection() {
  return (
    <section id="materials" className="section">
      <div className="section-header">
        <p className="section-eyebrow">✦ Your Library</p>
        <h2 className="section-title">Study <em>Materials</em></h2>
        <div className="divider" />
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:24 }}>
        <UploadCard icon="📚" title="Class Notes"     desc="Upload lecture notes, PDFs, and study guides for all your subjects." storageKey="mls_notes_upload" />
        <UploadCard icon="📝" title="Exam Past Papers" desc="Store past exam papers and sample questions to practice from."       storageKey="mls_papers_upload" />
        <UploadCard icon="🏆" title="Class Results"   desc="Keep track of grade reports, transcripts, and assignment scores."     storageKey="mls_results_upload" />
      </div>
    </section>
  )
}

// Finance Studio — user, onLogout, and onBack are provided by Root
export default function App({ user, onLogout, onBack }) {
  const [activeSection, setActiveSection] = useState('home')

  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior:'smooth' })
    setActiveSection(id)
  }

  return (
    <>
      <Navbar user={user} onLogout={onLogout} onBack={onBack} scrollTo={scrollTo} activeSection={activeSection} />
      <div id="home"><HeroSlider /></div>
      <QuoteTicker />
      <StatsRow />
      <Clocks />
      <Calendar />
      <TaskTracker />
      <PomodoroTimer />
      <GradeCalculator />
      <FinancialCalculator />
      <MaterialsSection />
      <NotesApp />
      <AIAssistant user={user} />
      <Footer />
    </>
  )
}
