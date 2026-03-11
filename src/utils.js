// Simple localStorage helpers
export const LS = {
  get: (key, defaultVal) => {
    try {
      const v = localStorage.getItem(key)
      return v ? JSON.parse(v) : defaultVal
    } catch {
      return defaultVal
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {}
  },
}

export const QUOTES = [
  'The more that you read, the more things you will know. — Dr. Seuss',
  'Education is the most powerful weapon you can use to change the world. — Nelson Mandela',
  'An investment in knowledge pays the best interest. — Benjamin Franklin',
  'Live as if you were to die tomorrow. Learn as if you were to live forever. — Gandhi',
  'The beautiful thing about learning is that no one can take it away from you. — B.B. King',
  'Knowledge is power. — Francis Bacon',
  'Success is the sum of small efforts, repeated day in and day out. — Robert Collier',
]

export const SLIDES = [
  {
    tag: 'Knowledge Awaits',
    title: 'The Grand\nLibrary',
    desc: 'Curate your academic journey. Every great scholar starts with a single note.',
    bg: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1600&q=80',
  },
  {
    tag: 'Study Smart',
    title: 'Master Your\nSubjects',
    desc: 'Organize lecture notes, past papers, and results — all in one place.',
    bg: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1600&q=80',
  },
  {
    tag: 'Stay Focused',
    title: 'Build Your\nLegacy',
    desc: 'Consistency and discipline transform students into moguls.',
    bg: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1600&q=80',
  },
]

export const SITE_SECTIONS = [
  { id: 'home',       label: 'Home / Hero',           icon: '🏠', sub: 'Top of page' },
  { id: 'clocks',     label: 'Time & Schedule',       icon: '🕐', sub: 'Digital & analog clocks' },
  { id: 'calendar',   label: 'Academic Calendar',     icon: '📅', sub: 'Monthly calendar view' },
  { id: 'tasks',      label: 'Assignment Tracker',    icon: '📋', sub: 'Track due dates & priorities' },
  { id: 'pomodoro',   label: 'Study Timer',           icon: '🍅', sub: 'Pomodoro focus sessions' },
  { id: 'grades',     label: 'Grade Calculator',      icon: '🎓', sub: 'Calculate subject grades & GPA' },
  { id: 'calculator', label: 'Financial Calculator',  icon: '📊', sub: 'NPV, IRR, TVM, PV tables' },
  { id: 'materials',  label: 'Class Notes',           icon: '📚', sub: 'Study materials upload' },
  { id: 'materials',  label: 'Exam Past Papers',      icon: '📝', sub: 'Past exam papers' },
  { id: 'materials',  label: 'Class Results',         icon: '🏆', sub: 'Results & grades' },
  { id: 'notes',      label: 'My Notepad',            icon: '📓', sub: 'Personal notes editor' },
  { id: 'ai',         label: 'AI Research Assistant', icon: '🤖', sub: 'Ask questions, get answers' },
]

export const AI_CHIPS = [
  'Explain compound interest',
  'What is capital budgeting?',
  'Summarize time value of money',
  'What is financial leverage?',
  'How do I study more effectively?',
  'Explain NPV vs IRR',
]
