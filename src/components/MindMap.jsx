import { useState, useRef, useCallback } from 'react'
import { useUserData } from '../hooks/useUserData'
import styles from './MindMap.module.css'

const NODE_COLORS = ['#4a9eca','#e8a84c','#2a9b6e','#e74c8b','#9b7fd4','#cd6155','#27ae60']
const CW = 900, CH = 500

function Canvas({ map, onUpdate, onBack }) {
  const [editingNode, setEditingNode] = useState(null) // node id
  const [editLabel, setEditLabel] = useState('')
  const [editColor, setEditColor] = useState(NODE_COLORS[0])
  const [editorPos, setEditorPos] = useState({ x: 0, y: 0 })
  const dragging = useRef(null) // { id, ox, oy }
  const svgRef = useRef()

  const nodes = map.nodes || []

  const saveNodes = useCallback((newNodes) => {
    onUpdate({ ...map, nodes: newNodes })
  }, [map, onUpdate])

  const handleCanvasClick = (e) => {
    if (editingNode !== null) return
    const rect = svgRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const parentId = nodes.length === 0 ? null : (nodes[0]?.id ?? null)
    const newNode = {
      id: Date.now(),
      label: 'New Node',
      x: Math.round(x),
      y: Math.round(y),
      parentId: dragging.current ? null : parentId,
      color: NODE_COLORS[nodes.length % NODE_COLORS.length],
    }
    saveNodes([...nodes, newNode])
  }

  const openEditor = (e, node) => {
    e.stopPropagation()
    const rect = svgRef.current.getBoundingClientRect()
    setEditingNode(node.id)
    setEditLabel(node.label)
    setEditColor(node.color || NODE_COLORS[0])
    const ex = Math.min(node.x + 20, CW - 220)
    const ey = Math.min(node.y + 20, CH - 180)
    setEditorPos({ x: ex, y: ey })
  }

  const saveEdit = () => {
    saveNodes(nodes.map((n) => n.id === editingNode ? { ...n, label: editLabel, color: editColor } : n))
    setEditingNode(null)
  }

  const deleteNode = () => {
    saveNodes(nodes.filter((n) => n.id !== editingNode && n.parentId !== editingNode))
    setEditingNode(null)
  }

  const onMouseDown = (e, id) => {
    e.stopPropagation()
    const node = nodes.find((n) => n.id === id)
    dragging.current = { id, ox: e.clientX - node.x, oy: e.clientY - node.y }
  }

  const onMouseMove = (e) => {
    if (!dragging.current) return
    const rect = svgRef.current.getBoundingClientRect()
    const x = Math.max(30, Math.min(CW - 30, e.clientX - rect.left))
    const y = Math.max(20, Math.min(CH - 20, e.clientY - rect.top))
    saveNodes(nodes.map((n) => n.id === dragging.current.id ? { ...n, x, y } : n))
  }

  const onMouseUp = () => { dragging.current = null }

  return (
    <div>
      <div className={styles.canvasHeader}>
        <div>
          <strong style={{ color: 'var(--cream)' }}>{map.title}</strong>
          <span style={{ marginLeft: 12, fontSize: 12, color: 'var(--mist)' }}>{map.subject}</span>
        </div>
        <div className={styles.canvasBtnRow}>
          <span className={styles.canvasHint}>Click canvas to add node · drag to move · click node to edit</span>
          <button className={styles.canvasMiniBtn} onClick={() => saveNodes([])}>Clear All</button>
          <button className={styles.backBtn} onClick={onBack}>← Back</button>
        </div>
      </div>

      <div className={styles.canvasWrap} style={{ position: 'relative' }}>
        <svg
          ref={svgRef}
          className={styles.canvas}
          width={CW}
          height={CH}
          onClick={handleCanvasClick}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        >
          {/* Lines */}
          {nodes.map((node) => {
            if (!node.parentId) return null
            const parent = nodes.find((n) => n.id === node.parentId)
            if (!parent) return null
            return (
              <line
                key={`line-${node.id}`}
                x1={parent.x} y1={parent.y}
                x2={node.x} y2={node.y}
                stroke="rgba(201,168,76,0.3)"
                strokeWidth={1.5}
              />
            )
          })}

          {/* Nodes */}
          {nodes.map((node) => {
            const isRoot = !node.parentId
            const r = isRoot ? 36 : 28
            const color = node.color || NODE_COLORS[0]
            return (
              <g
                key={node.id}
                style={{ cursor: 'pointer' }}
                onMouseDown={(e) => onMouseDown(e, node.id)}
                onClick={(e) => openEditor(e, node)}
              >
                <circle cx={node.x} cy={node.y} r={r} fill={color} fillOpacity={0.85} stroke={color} strokeWidth={2} />
                <text
                  x={node.x} y={node.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#fff"
                  fontSize={isRoot ? 12 : 10}
                  fontFamily="DM Sans, sans-serif"
                  fontWeight={isRoot ? 700 : 400}
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {node.label.length > 12 ? node.label.slice(0, 12) + '…' : node.label}
                </text>
              </g>
            )
          })}
        </svg>

        {/* Node editor */}
        {editingNode !== null && (
          <div className={styles.nodeEditor} style={{ left: editorPos.x, top: editorPos.y }}>
            <div className={styles.nodeEditorTitle}>Edit Node</div>
            <input
              className={styles.nodeEditorInput}
              value={editLabel}
              onChange={(e) => setEditLabel(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
              autoFocus
            />
            <div className={styles.colorRow}>
              {NODE_COLORS.map((c) => (
                <div
                  key={c}
                  className={`${styles.colorDot} ${editColor === c ? styles.colorDotActive : ''}`}
                  style={{ background: c }}
                  onClick={() => setEditColor(c)}
                />
              ))}
            </div>
            <div className={styles.nodeEditorActions}>
              <button className={styles.nodeEditorSave} onClick={saveEdit}>Save</button>
              <button className={styles.nodeEditorDelete} onClick={deleteNode}>Delete</button>
              <button className={styles.nodeEditorCancel} onClick={() => setEditingNode(null)}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function MindMap({ storageKey }) {
  const key = `${storageKey}_mindmaps`
  const [maps, setMaps] = useUserData(key, [])
  const [activeMap, setActiveMap] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', subject: '' })

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const createMap = () => {
    if (!form.title.trim()) return
    const newMap = { id: Date.now(), title: form.title.trim(), subject: form.subject.trim(), nodes: [], createdAt: new Date().toISOString() }
    const updated = [...maps, newMap]
    setMaps(updated)
    setForm({ title: '', subject: '' }); setShowForm(false)
    setActiveMap(newMap)
  }

  const deleteMap = (id) => {
    setMaps(maps.filter((m) => m.id !== id))
    if (activeMap?.id === id) setActiveMap(null)
  }

  const updateMap = (updated) => {
    const newMaps = maps.map((m) => m.id === updated.id ? updated : m)
    setMaps(newMaps)
    setActiveMap(updated)
  }

  if (activeMap) {
    const liveMap = maps.find((m) => m.id === activeMap.id) || activeMap
    return (
      <section id="mindmap" className="section">
        <div className="section-header">
          <p className="section-eyebrow">✦ Visualise Ideas</p>
          <h2 className="section-title">Mind <em>Map</em></h2>
          <div className="divider" />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
          <button className={styles.deleteMapBtn} onClick={() => deleteMap(liveMap.id)}>Delete Map</button>
        </div>
        <Canvas map={liveMap} onUpdate={updateMap} onBack={() => setActiveMap(null)} />
      </section>
    )
  }

  return (
    <section id="mindmap" className="section">
      <div className="section-header">
        <p className="section-eyebrow">✦ Visualise Ideas</p>
        <h2 className="section-title">Mind <em>Map</em></h2>
        <div className="divider" />
      </div>

      <div className={styles.controls}>
        <span style={{ fontSize: 14, color: 'var(--mist)' }}>{maps.length} mind map{maps.length !== 1 ? 's' : ''}</span>
        <button className={styles.addBtn} onClick={() => setShowForm((v) => !v)}>
          {showForm ? '✕ Cancel' : '+ New Mind Map'}
        </button>
      </div>

      {showForm && (
        <div className={styles.newMapForm}>
          <div className="field-group" style={{ flex: 1 }}>
            <label>Map Title</label>
            <input type="text" placeholder="e.g. Photosynthesis" value={form.title} onChange={set('title')} />
          </div>
          <div className="field-group" style={{ flex: 1 }}>
            <label>Subject (optional)</label>
            <input type="text" placeholder="e.g. Biology" value={form.subject} onChange={set('subject')} />
          </div>
          <div className={styles.formActions} style={{ alignSelf: 'flex-end' }}>
            <button className="btn-primary" onClick={createMap}>Create →</button>
            <button className={styles.cancelBtn} onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {maps.length === 0 ? (
        <div className={styles.empty}>
          <span style={{ fontSize: 40 }}>🧠</span>
          <p>No mind maps yet. Create your first one above!</p>
        </div>
      ) : (
        <div className={styles.mapList}>
          {maps.map((m) => (
            <div key={m.id} className={styles.mapCard} onClick={() => setActiveMap(m)}>
              <div className={styles.mapTitle}>{m.title}</div>
              <div className={styles.mapMeta}>{m.subject && `${m.subject} · `}{m.nodes?.length || 0} node{m.nodes?.length !== 1 ? 's' : ''}</div>
              <button className={styles.mapCardDelete} onClick={(e) => { e.stopPropagation(); deleteMap(m.id) }}>✕</button>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
