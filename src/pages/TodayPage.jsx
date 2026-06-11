import React, { useState } from 'react'
import MapView from '../components/MapView'
import { useDiaryStore } from '../stores/diaryStore'

const MOODS = ['😊','😢','🥳','😌','😤','🤩','😴','😰']

export default function TodayPage() {
  const today = new Date().toISOString().slice(0, 10)
  const [mode, setMode] = useState('view')
  const { entries, setMood, setTitle } = useDiaryStore()
  const entry = entries.find(e => e.date === today) || { date: today, pins: [], route: [], mood: null, title: '' }
  const [showMoodPicker, setShowMoodPicker] = useState(false)
  const [editingTitle, setEditingTitle] = useState(false)

  const dateStr = new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={{ flex: 1 }}>
          <div style={styles.dateBadge}>{dateStr}</div>
          {editingTitle ? (
            <input
              autoFocus
              style={styles.titleInput}
              value={entry.title || ''}
              placeholder="오늘 하루 제목..."
              onChange={e => setTitle(today, e.target.value)}
              onBlur={() => setEditingTitle(false)}
            />
          ) : (
            <p style={styles.title} onClick={() => setEditingTitle(true)}>
              {entry.title || '오늘 하루를 기록해요 ✏️'}
            </p>
          )}
        </div>
        <button style={styles.moodBtn} onClick={() => setShowMoodPicker(!showMoodPicker)}>
          <span style={{ fontSize: 28 }}>{entry.mood || '🙂'}</span>
        </button>
      </header>

      {showMoodPicker && (
        <div style={styles.moodPicker}>
          <p style={styles.moodLabel}>오늘 기분은?</p>
          <div style={styles.moodGrid}>
            {MOODS.map(m => (
              <button key={m} style={styles.moodOption} onClick={() => { setMood(today, m); setShowMoodPicker(false) }}>
                {m}
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={styles.modeBar}>
        <button
          style={{ ...styles.modeBtn, ...(mode === 'view' ? styles.modeBtnActive : {}) }}
          onClick={() => setMode('view')}
        >
          보기
        </button>
        <button
          style={{ ...styles.modeBtn, ...(mode === 'pin' ? styles.modeBtnActive : {}) }}
          onClick={() => setMode('pin')}
        >
          장소 추가
        </button>
      </div>

      {mode === 'pin' && (
        <div style={styles.pinHint}>지도를 탭하면 집 모양 장소가 생겨요. 집을 눌러 별점과 메모를 남겨보세요.</div>
      )}

      <div style={styles.mapWrap}>
        <MapView date={today} mode={mode} routeColor="#4f6f3a" />
      </div>

      <div style={styles.statsBar}>
        <div style={styles.statChip}>
          <span style={styles.statIcon}>📌</span>
          <span style={styles.statText}>{entry.pins?.length || 0}곳 기록</span>
        </div>
        <div style={styles.statChip}>
          <span style={styles.statIcon}>🐾</span>
          <span style={styles.statText}>{entry.route?.length || 0}개 포인트</span>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: { display: 'flex', flexDirection: 'column', height: '100vh', background: '#f4edda' },
  header: {
    padding: '14px 18px 12px',
    background: '#fffaf0',
    borderBottom: '2px solid #c9b88f',
    display: 'flex', alignItems: 'center', gap: 12,
    boxShadow: '0 2px 14px rgba(54,72,42,0.09)',
  },
  dateBadge: {
    display: 'inline-block',
    background: '#d45d3d', color: 'white',
    fontSize: 11, fontWeight: 900,
    borderRadius: 20, padding: '3px 10px',
    marginBottom: 5, letterSpacing: '0.02em',
  },
  title: {
    fontSize: 15, fontWeight: 800, color: '#3d2b1f',
    cursor: 'pointer', lineHeight: 1.3,
  },
  titleInput: {
    fontSize: 15, fontWeight: 800, color: '#3d2b1f',
    border: 'none', borderBottom: '2.5px solid #ff6b9d',
    background: 'none', padding: '2px 0', width: '200px',
    fontFamily: 'inherit',
  },
  moodBtn: {
    background: '#eef1d8',
    border: '2.5px solid #9bad75',
    borderRadius: 18,
    width: 52, height: 52,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', flexShrink: 0,
    boxShadow: '0 3px 0 #9bad75',
  },
  moodPicker: {
    background: 'white', padding: '14px 18px 16px',
    borderBottom: '2px solid #fde8d8',
  },
  moodLabel: {
    fontSize: 12, fontWeight: 900, color: '#c9a0b0', marginBottom: 10,
  },
  moodGrid: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  moodOption: {
    fontSize: 28, background: '#fff9f5',
    border: '2px solid #fde8d8', borderRadius: 16,
    padding: '6px 10px', cursor: 'pointer',
    boxShadow: '0 2px 0 #fde8d8',
  },
  modeBar: {
    display: 'flex', gap: 8, padding: '8px 14px',
    background: '#fffaf0', borderBottom: '2px solid #c9b88f',
  },
  modeBtn: {
    flex: 1, padding: '9px 0', borderRadius: 22,
    fontSize: 13, fontWeight: 800, cursor: 'pointer',
    background: '#f5eedc', color: '#7d765f',
    border: '2px solid #d8c9a6',
    boxShadow: '0 2px 0 #d8c9a6',
    fontFamily: 'inherit',
  },
  modeBtnActive: {
    background: '#d45d3d', color: 'white',
    border: '2px solid #d45d3d',
    boxShadow: '0 3px 0 #98412d',
  },
  pinHint: {
    background: '#eef1d8', color: '#4f6f3a',
    fontSize: 12, fontWeight: 800,
    padding: '7px 18px', textAlign: 'center',
    borderBottom: '1px solid #b8c68e',
  },
  mapWrap: { flex: 1, position: 'relative', overflow: 'hidden' },
  statsBar: {
    background: '#fffaf0', padding: '10px 18px 74px',
    display: 'flex', gap: 10, borderTop: '2px solid #c9b88f',
  },
  statChip: {
    display: 'flex', alignItems: 'center', gap: 5,
    background: '#fff9f5', border: '1.5px solid #fde8d8',
    borderRadius: 20, padding: '4px 12px',
  },
  statIcon: { fontSize: 14 },
  statText: { fontSize: 12, fontWeight: 800, color: '#c9a0b0' },
}
