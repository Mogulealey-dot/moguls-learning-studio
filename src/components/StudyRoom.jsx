import { useState, useEffect, useRef } from 'react'
import { db, auth } from '../firebase'
import { doc, setDoc, updateDoc, arrayUnion, onSnapshot, getDoc } from 'firebase/firestore'
import styles from './StudyRoom.module.css'

function genCode() {
  return Math.random().toString(36).toUpperCase().slice(2, 8)
}

export default function StudyRoom({ onClose }) {
  const [screen, setScreen] = useState('lobby')
  const [roomCode, setRoomCode] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [roomData, setRoomData] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef()

  const user = auth.currentUser
  const userId = user?.uid
  const userName = user?.displayName || 'Scholar'

  useEffect(() => {
    if (screen === 'room' && roomCode) {
      const unsub = onSnapshot(doc(db, 'studyRooms', roomCode), (snap) => {
        if (snap.exists()) setRoomData(snap.data())
      })
      return unsub
    }
  }, [screen, roomCode])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [roomData?.messages])

  const createRoom = async () => {
    setLoading(true)
    const code = genCode()
    await setDoc(doc(db, 'studyRooms', code), {
      code,
      createdBy: userId,
      createdAt: new Date().toISOString(),
      members: [{ uid: userId, name: userName }],
      messages: [],
    })
    setRoomCode(code)
    setScreen('room')
    setLoading(false)
  }

  const joinRoom = async () => {
    const code = joinCode.trim().toUpperCase()
    if (!code) { setError('Enter a room code'); return }
    setLoading(true)
    const snap = await getDoc(doc(db, 'studyRooms', code))
    if (!snap.exists()) { setError('Room not found. Check the code and try again.'); setLoading(false); return }
    const data = snap.data()
    const alreadyIn = data.members.some((m) => m.uid === userId)
    if (!alreadyIn) {
      await updateDoc(doc(db, 'studyRooms', code), {
        members: arrayUnion({ uid: userId, name: userName }),
      })
    }
    setRoomCode(code)
    setScreen('room')
    setError('')
    setLoading(false)
  }

  const sendMessage = async () => {
    if (!message.trim()) return
    const msg = {
      id: Date.now().toString(),
      uid: userId,
      name: userName,
      text: message.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    await updateDoc(doc(db, 'studyRooms', roomCode), {
      messages: arrayUnion(msg),
    })
    setMessage('')
  }

  const leaveRoom = () => {
    setScreen('lobby')
    setRoomCode('')
    setRoomData(null)
    setJoinCode('')
  }

  if (screen === 'lobby') {
    return (
      <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h3 className={styles.panelTitle}>Study Rooms</h3>
            <button className={styles.closeBtn} onClick={onClose}>✕</button>
          </div>
          <div className={styles.lobby}>
            <p className={styles.lobbyDesc}>
              Create a room or join one with a code to study in real-time with classmates.
            </p>
            <button className={styles.createBtn} onClick={createRoom} disabled={loading}>
              {loading ? 'Creating…' : '+ Create New Room'}
            </button>
            <div className={styles.orDivider}>or join existing</div>
            <div className={styles.joinRow}>
              <input
                className={styles.joinInput}
                placeholder="Enter code…"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && joinRoom()}
                maxLength={6}
              />
              <button className={styles.joinBtn} onClick={joinRoom} disabled={loading}>
                {loading ? '…' : 'Join →'}
              </button>
            </div>
            {error && <p className={styles.error}>{error}</p>}
          </div>
        </div>
      </div>
    )
  }

  const messages = roomData?.messages || []
  const members = roomData?.members || []

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <h3 className={styles.panelTitle}>Study Room</h3>
            <span className={styles.roomCode}>
              Code: <strong>{roomCode}</strong>
              <button
                className={styles.copyBtn}
                onClick={() => navigator.clipboard.writeText(roomCode)}
                title="Copy code"
              >
                Copy
              </button>
            </span>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.leaveBtn} onClick={leaveRoom}>Leave</button>
            <button className={styles.closeBtn} onClick={onClose}>✕</button>
          </div>
        </div>

        <div className={styles.members}>
          {members.map((m) => (
            <span key={m.uid} className={styles.member} title={m.name}>
              {m.name[0]?.toUpperCase()}
            </span>
          ))}
          <span className={styles.memberCount}>
            {members.length} {members.length === 1 ? 'member' : 'members'} online
          </span>
        </div>

        <div className={styles.chat}>
          {messages.length === 0 && (
            <div className={styles.chatEmpty}>No messages yet. Say hello to your study group!</div>
          )}
          {messages.map((m) => (
            <div key={m.id} className={`${styles.msg} ${m.uid === userId ? styles.myMsg : ''}`}>
              <div className={styles.msgMeta}>
                <span className={styles.msgName}>{m.uid === userId ? 'You' : m.name}</span>
                <span className={styles.msgTime}>{m.time}</span>
              </div>
              <div className={styles.msgText}>{m.text}</div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className={styles.inputRow}>
          <input
            className={styles.msgInput}
            placeholder="Type a message… (Enter to send)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button className={styles.sendBtn} onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  )
}
