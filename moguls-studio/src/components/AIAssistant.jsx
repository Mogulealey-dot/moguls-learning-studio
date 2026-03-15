import { useState, useEffect, useRef } from 'react'
import { AI_CHIPS } from '../utils'
import styles from './AIAssistant.module.css'

export default function AIAssistant({ user }) {
  const firstName = user?.name?.split(' ')[0] || 'Scholar'
  const initials  = user?.name ? user.name[0].toUpperCase() : '?'

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: `Hello ${firstName}! 👋 I'm your AI Research Assistant. Ask me anything — finance concepts, study tips, definitions, summaries, or anything you're studying. I'm here to help you learn.`,
    },
  ])
  const [input, setInput]   = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const send = async (text) => {
    const q = (text || input).trim()
    if (!q || loading) return
    setInput('')
    const newMessages = [...messages, { role: 'user', text: q }]
    setMessages(newMessages)
    setLoading(true)
    try {
      const history = newMessages.slice(1).map((m) => ({ role: m.role, content: m.text }))
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: `You are a helpful academic research assistant inside "Mogul's Learning Studio", a student's personal study website. The student is studying MBA-level subjects including Advanced Financial Management. Give clear, concise, well-structured answers. Use simple language when explaining concepts. When relevant, use examples. Keep responses focused and educational.`,
          messages: history,
        }),
      })
      const data = await res.json()
      const reply = data.content?.map((c) => c.text || '').join('') || 'Sorry, I could not get a response.'
      setMessages((m) => [...m, { role: 'assistant', text: reply }])
    } catch {
      setMessages((m) => [...m, { role: 'assistant', text: '⚠ Could not connect. Please check your internet connection and try again.' }])
    }
    setLoading(false)
  }

  return (
    <section id="ai" className={`section ${styles.section}`}>
      <div className="section-header">
        <p className="section-eyebrow">✦ Powered by Claude AI</p>
        <h2 className="section-title">AI Research <em>Assistant</em></h2>
        <div className="divider" />
        <p style={{ marginTop: 16, fontSize: 14, color: 'var(--mist)' }}>
          Ask questions about your subjects, get explanations, summaries, and study help — instantly.
        </p>
      </div>

      <div className={styles.container}>
        <div className={styles.chatBox}>
          <div className={styles.messages}>
            {messages.map((m, i) => (
              <div key={i} className={`${styles.msg} ${m.role === 'user' ? styles.userMsg : styles.botMsg}`}>
                <div className={`${styles.avatar} ${m.role === 'assistant' ? styles.botAvatar : styles.userAvatar}`}>
                  {m.role === 'assistant' ? '🤖' : initials}
                </div>
                <div className={styles.bubble} style={{ whiteSpace: 'pre-wrap' }}>{m.text}</div>
              </div>
            ))}
            {loading && (
              <div className={`${styles.msg} ${styles.botMsg}`}>
                <div className={`${styles.avatar} ${styles.botAvatar}`}>🤖</div>
                <div className={styles.bubble}>
                  <div className={styles.thinking}>
                    <div className={styles.dot} /><div className={styles.dot} /><div className={styles.dot} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className={styles.chips}>
            {AI_CHIPS.map((chip, i) => (
              <button key={i} className={styles.chip} onClick={() => send(chip)}>{chip}</button>
            ))}
          </div>

          <div className={styles.inputRow}>
            <textarea
              className={styles.input}
              placeholder="Ask anything about your studies… (Enter to send, Shift+Enter for new line)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
              rows={1}
            />
            <button className={styles.sendBtn} onClick={() => send()} disabled={loading || !input.trim()}>
              {loading ? '…' : '↑'}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
