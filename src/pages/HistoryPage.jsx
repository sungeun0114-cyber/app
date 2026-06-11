import React, { useState } from 'react'
import { useDiaryStore } from '../stores/diaryStore'
import MapView from '../components/MapView'

const DAY_COLORS = ['#ff6b9d','#ffd166','#06d6a0','#118ab2','#9b5de5','#ef4444']

export default function HistoryPage() {
  const { entries } = useDiaryStore()
  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date))
  const [selected, setSelected] = useState(null)

  if (selected) {
    const entry = entries.find(e => e.date === selected)
    const colorIdx = sorted.findIndex(e => e.date === selected)
    const color = DAY_COLORS[colorIdx % DAY_COLORS.length]
    return (
      <div style={styles.page}>
        <header style={{ ...styles.header, borderBottom: `3px solid ${color}20` }}>
          <button style={styles.backBtn} onClick={() => setSelected(null)}>←</button>
          <div style={{ flex: 1 }}>
            <div style={{ ...styles.dateBadge, background: color }}>{formatDate(selected)}</div>
            <p style={styles.entryTitle}>{entry?.title || '제목 없음'}</p>
          </div>
          <span style={styles.mood}>{entry?.mood || '🙂'}</span>
        </header>
        <div style={styles.mapWrap}>
          <MapView date={selected} mode="view" routeColor={color} />
        </div>
        <div style={styles.pinsSection}>
          <p style={styles.sectionTitle}>기록된 장소 ({entry?.pins?.length || 0})</p>
          {(entry?.pins || []).length === 0 && (
            <p style={styles.emptyPins}>핀이 없어요. 다음엔 스티커를 남겨보세요!</p>
          )}
          {(entry?.pins || []).map(pin => (
            <div key={pin.id} style={styles.pinRow}>
              <span style={styles.pinEmoji}>{pin.iconType === 'house' ? '⌂' : pin.emoji}</span>
              <div>
                <p style={styles.pinPlace}>{pin.placeName || '이름 없는 장소'}</p>
                <p style={styles.pinRating}>{pin.rating ? '★'.repeat(pin.rating) : '별점 없음'}</p>
                <p style={styles.pinNote}>{pin.note || '메모 없음'}</p>
                <p style={styles.pinTime}>{new Date(pin.createdAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={styles.page}>
      <header style={styles.listHeader}>
        <h1 style={styles.listTitle}>📅 지난 기록</h1>
        <p style={styles.listSub}>{sorted.length}일의 추억</p>
      </header>
      {sorted.length === 0 ? (
        <div style={styles.empty}>
          <p style={styles.emptyIcon}>🗺️</p>
          <p style={styles.emptyText}>아직 기록이 없어요.<br />오늘 하루를 기록해 보세요!</p>
        </div>
      ) : (
        <div style={styles.list}>
          {sorted.map((entry, idx) => {
            const color = DAY_COLORS[idx % DAY_COLORS.length]
            return (
              <div key={entry.date} style={styles.card} onClick={() => setSelected(entry.date)}>
                <div style={{ ...styles.cardAccent, background: color }} />
                <div style={styles.cardBody}>
                  <div style={styles.cardTop}>
                    <span style={{ ...styles.cardMood }}>{entry.mood || '🙂'}</span>
                    <div style={styles.cardMeta}>
                      <div style={{ ...styles.cardDateBadge, background: color }}>{formatShort(entry.date)}</div>
                    </div>
                    <div style={styles.cardPins}>
                      {(entry.pins || []).slice(0, 5).map(p => (
                        <span key={p.id} style={styles.cardPinEmoji}>{p.emoji}</span>
                      ))}
                    </div>
                  </div>
                  <p style={styles.cardTitle}>{entry.title || '제목 없음'}</p>
                  <p style={styles.cardStats}>
                    {entry.pins?.length || 0}곳 기록 · {entry.route?.length || 0}포인트
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })
}
function formatShort(dateStr) {
  return new Date(dateStr).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
}

const styles = {
  page: { display: 'flex', flexDirection: 'column', height: '100vh', background: '#fffbf5', overflow: 'hidden' },
  header: {
    padding: '14px 18px', background: 'white',
    borderBottom: '2px solid #fde8d8',
    display: 'flex', alignItems: 'center', gap: 12,
    boxShadow: '0 2px 14px rgba(255,107,157,0.07)',
  },
  backBtn: {
    fontSize: 20, background: '#fff0f5', border: '2px solid #fde8d8',
    borderRadius: 12, width: 38, height: 38, cursor: 'pointer',
    color: '#ff6b9d', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  dateBadge: {
    display: 'inline-block', color: 'white',
    fontSize: 11, fontWeight: 900,
    borderRadius: 20, padding: '3px 10px', marginBottom: 4,
  },
  entryTitle: { fontSize: 15, fontWeight: 800, color: '#3d2b1f' },
  mood: { fontSize: 32 },
  mapWrap: { height: '45vh', position: 'relative', overflow: 'hidden' },
  pinsSection: { flex: 1, overflow: 'auto', padding: '16px 18px 80px' },
  sectionTitle: { fontSize: 14, fontWeight: 900, color: '#3d2b1f', marginBottom: 12 },
  emptyPins: { fontSize: 13, color: '#c9a0b0', fontWeight: 700, textAlign: 'center', padding: '20px 0' },
  pinRow: {
    display: 'flex', gap: 12, alignItems: 'flex-start',
    background: 'white', borderRadius: 16, padding: '12px 14px', marginBottom: 10,
    boxShadow: '0 2px 0 #fde8d8, 0 4px 12px rgba(0,0,0,0.05)',
    border: '1.5px solid #fde8d8',
  },
  pinEmoji: { fontSize: 30, color: '#4f6f3a', width: 34, textAlign: 'center', fontWeight: 900 },
  pinPlace: { fontSize: 15, color: '#3d2b1f', fontWeight: 900 },
  pinRating: { fontSize: 12, color: '#d8892f', fontWeight: 900, marginTop: 2, letterSpacing: 0 },
  pinNote: { fontSize: 14, color: '#3d2b1f', fontWeight: 700, marginTop: 4, lineHeight: 1.4 },
  pinTime: { fontSize: 12, color: '#c9a0b0', marginTop: 2, fontWeight: 700 },
  listHeader: {
    padding: '18px 18px 12px', background: 'white',
    borderBottom: '2px solid #fde8d8',
  },
  listTitle: { fontSize: 22, fontWeight: 900, color: '#3d2b1f' },
  listSub: { fontSize: 12, color: '#c9a0b0', fontWeight: 700, marginTop: 2 },
  list: { flex: 1, overflow: 'auto', padding: '14px 14px 80px' },
  card: {
    background: 'white', borderRadius: 20, marginBottom: 12, cursor: 'pointer',
    boxShadow: '0 3px 0 #fde8d8, 0 6px 20px rgba(0,0,0,0.06)',
    border: '1.5px solid #fde8d8',
    display: 'flex', overflow: 'hidden',
  },
  cardAccent: { width: 6, flexShrink: 0 },
  cardBody: { flex: 1, padding: '14px 14px 12px' },
  cardTop: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 },
  cardMood: { fontSize: 28 },
  cardMeta: { flex: 1 },
  cardDateBadge: {
    display: 'inline-block', color: 'white',
    fontSize: 11, fontWeight: 900, borderRadius: 20, padding: '2px 8px',
  },
  cardPins: { display: 'flex', gap: 2 },
  cardPinEmoji: { fontSize: 18 },
  cardTitle: { fontSize: 15, fontWeight: 800, color: '#3d2b1f', marginBottom: 4 },
  cardStats: { fontSize: 12, color: '#c9a0b0', fontWeight: 700 },
  empty: {
    flex: 1, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: 14, paddingBottom: 80,
  },
  emptyIcon: { fontSize: 64 },
  emptyText: { fontSize: 16, color: '#c9a0b0', textAlign: 'center', lineHeight: 1.7, fontWeight: 700 },
}
