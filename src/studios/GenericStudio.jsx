import { useState, useEffect } from 'react'
import { QUOTES } from '../utils'
import { useUserData } from '../hooks/useUserData'

import GenericNavbar        from './GenericNavbar'
import TaskTracker          from '../components/TaskTracker'
import PomodoroTimer        from '../components/PomodoroTimer'
import GradeCalculator      from '../components/GradeCalculator'
import NotesApp             from '../components/NotesApp'
import AIAssistant          from '../components/AIAssistant'
import UploadCard           from '../components/UploadCard'
import Footer               from '../components/Footer'
import Flashcards           from '../components/Flashcards'
import QuizGenerator        from '../components/QuizGenerator'
import ExamCountdown        from '../components/ExamCountdown'
import SyllabusTracker      from '../components/SyllabusTracker'
import StudySchedule        from '../components/StudySchedule'
import GradeTrends          from '../components/GradeTrends'
import ReadingList          from '../components/ReadingList'
import MindMap              from '../components/MindMap'
import CitationGenerator    from '../components/CitationGenerator'
import AttendanceTracker    from '../components/AttendanceTracker'

import gs from './GenericStudio.module.css'

function QuoteTicker() {
  const [qi, setQi] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setQi((i) => (i + 1) % QUOTES.length), 7000)
    return () => clearInterval(t)
  }, [])
  return (
    <div className={gs.quoteTicker}>
      <span className={gs.quoteLabel}>Daily Wisdom</span>
      <span className={gs.quoteText}>"{QUOTES[qi]}"</span>
    </div>
  )
}

function StatsRow({ prefix }) {
  const [notes]    = useUserData(`${prefix}_notes`, [])
  const [uploads]  = useUserData(`${prefix}_upload_notes`, [])
  const [tasks]    = useUserData(`${prefix}_tasks`, [])
  const [pomodoro] = useUserData(`${prefix}_pomodoro`, [])
  const noteCount = notes.length
  const uploadCount = uploads.length
  const taskCount = tasks.filter((t) => !t.done).length
  const sessions  = pomodoro.filter((s) => s.date === new Date().toLocaleDateString()).length
  const stats = [
    { n: noteCount,   label: 'Notes',            color: 'var(--accent, var(--gold))' },
    { n: uploadCount, label: 'Files',             color: 'var(--accent, var(--gold))' },
    { n: taskCount,   label: 'Pending Tasks',     color: taskCount > 0 ? 'var(--crimson)' : 'var(--emerald-light)' },
    { n: sessions,    label: 'Sessions Today 🍅', color: 'var(--emerald-light)' },
  ]
  return (
    <div className={gs.statsRow}>
      {stats.map((stat, i) => (
        <div key={i} className={gs.statCard}>
          <div className={gs.statNum} style={{ color: stat.color }}>{stat.n}</div>
          <div className={gs.statLabel}>{stat.label}</div>
        </div>
      ))}
    </div>
  )
}

function MaterialsSection({ prefix, studioName }) {
  return (
    <section id="materials" className="section">
      <div className="section-header">
        <p className="section-eyebrow">✦ Your Library</p>
        <h2 className="section-title">Study <em>Materials</em></h2>
        <div className="divider" />
      </div>
      <div className={gs.materialsGrid}>
        <UploadCard icon="📚" title="Class Notes"      desc={`Upload lecture notes, PDFs, and study guides for ${studioName}.`}  storageKey={`${prefix}_upload_notes`} />
        <UploadCard icon="📝" title="Past Papers"      desc="Store past exam papers and practice questions to review from."        storageKey={`${prefix}_upload_papers`} />
        <UploadCard icon="🏆" title="Results & Grades" desc="Keep track of grade reports, transcripts, and assignment scores."      storageKey={`${prefix}_upload_results`} />
      </div>
    </section>
  )
}

export default function GenericStudio({ config, user, onLogout, onBack }) {
  const [activeSection, setActiveSection]   = useState('home')
  const [pomodoroRunning, setPomodoroRunning] = useState(false)
  const { ToolsComponent, storagePrefix, name, color, icon, heroTitle, heroSub, subjects, navLinks, aiSystemPrompt } = config
  const [contextNotes]         = useUserData(`${storagePrefix}_notes`, [])
  const [contextTasks]         = useUserData(`${storagePrefix}_tasks`, [])
  const [contextPomodoro]      = useUserData(`${storagePrefix}_pomodoro`, [])
  const [contextUploads]       = useUserData(`${storagePrefix}_upload_notes`, [])
  const [contextUploadPapers]  = useUserData(`${storagePrefix}_upload_papers`, [])
  const [contextUploadResults] = useUserData(`${storagePrefix}_upload_results`, [])

  const totalFiles = contextUploads.length + contextUploadPapers.length + contextUploadResults.length
  const todaySessions = contextPomodoro.filter((s) => s.date === new Date().toLocaleDateString()).length

  const navBadges = {
    tasks:     contextTasks.filter((t) => !t.done).length,
    notes:     contextNotes.length,
    pomodoro:  pomodoroRunning ? '▶' : (todaySessions || 0),
    materials: totalFiles,
  }

  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
    setActiveSection(id)
  }

  return (
    <div style={{ '--accent': color }}>
      <GenericNavbar
        user={user}
        onLogout={onLogout}
        onBack={onBack}
        scrollTo={scrollTo}
        activeSection={activeSection}
        studioName={name}
        navLinks={navLinks}
        navBadges={navBadges}
      />

      {/* ── Hero ── */}
      <div id="home" className={gs.hero}>
        <div className={gs.heroBg} />
        <div className={gs.heroInner}>
          <p className={gs.heroEyebrow}>
            <span className={gs.heroIcon}>{icon}</span> {config.subtitle}
          </p>
          <h1 className={gs.heroTitle}>
            {heroTitle[0]}<br /><em>{heroTitle[1]}</em>
          </h1>
          <p className={gs.heroSub}>{heroSub}</p>
          <div className={gs.heroDivider} />
        </div>
      </div>

      <QuoteTicker />
      <StatsRow prefix={storagePrefix} />

      {/* ── Studio Tools ── */}
      <section id="tools" className="section">
        <div className="section-header">
          <p className="section-eyebrow">✦ Your Toolkit</p>
          <h2 className="section-title">{name} <em>Tools</em></h2>
          <div className="divider" />
        </div>
        <ToolsComponent storageKey={storagePrefix} />
      </section>

      <TaskTracker
        storageKey={`${storagePrefix}_tasks`}
        subjects={subjects}
      />

      <PomodoroTimer storageKey={`${storagePrefix}_pomodoro`} onRunningChange={setPomodoroRunning} />

      <GradeCalculator defaultSubjects={subjects.slice(0, 2)} storageKey={`${storagePrefix}_grades`} />

      <MaterialsSection prefix={storagePrefix} studioName={name} />

      <NotesApp storageKey={`${storagePrefix}_notes`} />

      <Flashcards storageKey={`${storagePrefix}`} />
      <QuizGenerator storageKey={`${storagePrefix}`} />
      <ExamCountdown storageKey={`${storagePrefix}`} />
      <SyllabusTracker storageKey={`${storagePrefix}`} />
      <StudySchedule storageKey={`${storagePrefix}`} />
      <GradeTrends storageKey={`${storagePrefix}`} />
      <ReadingList storageKey={`${storagePrefix}`} />
      <MindMap storageKey={`${storagePrefix}`} />
      <CitationGenerator storageKey={`${storagePrefix}`} />
      <AttendanceTracker storageKey={`${storagePrefix}`} />

      <AIAssistant user={user} systemPrompt={aiSystemPrompt} contextNotes={contextNotes} contextTasks={contextTasks} />

      <Footer />
    </div>
  )
}
