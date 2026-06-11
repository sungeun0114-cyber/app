import React, { useState } from 'react'

export default function PinDetailSheet({ pin, onClose, onDelete, onSave }) {
  const [placeName, setPlaceName] = useState(pin.placeName || '')
  const [rating, setRating] = useState(Number(pin.rating || 0))
  const [note, setNote] = useState(pin.note || '')
  const savedAt = new Date(pin.createdAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.sheet} onClick={e => e.stopPropagation()}>
        <div style={styles.handle} />
        <div style={styles.header}>
          <div style={styles.houseIcon}>
            <span style={styles.roof} />
            <span style={styles.houseBody}>
              <span style={styles.window} />
              <span style={styles.door} />
            </span>
          </div>
          <div>
            <p style={styles.time}>오늘 다녀온 곳</p>
            <p style={styles.coords}>{savedAt} 기록</p>
          </div>
          <button aria-label="삭제" style={styles.deleteBtn} onClick={() => onDelete(pin.id)}>×</button>
        </div>

        <label style={styles.label}>
          장소 이름
          <input
            style={styles.input}
            placeholder="예: 연남동 작은 카페"
            value={placeName}
            onChange={e => setPlaceName(e.target.value)}
          />
        </label>

        <div style={styles.ratingWrap}>
          <p style={styles.labelText}>별점</p>
          <div style={styles.stars}>
            {[1, 2, 3, 4, 5].map(score => (
              <button
                key={score}
                type="button"
                aria-label={`${score}점`}
                style={{ ...styles.starBtn, color: score <= rating ? '#d8892f' : '#d8c4a4' }}
                onClick={() => setRating(score)}
              >
                ★
              </button>
            ))}
          </div>
          <p style={styles.ratingText}>{rating > 0 ? `${rating}점` : '별점을 골라주세요'}</p>
        </div>

        <label style={styles.label}>
          메모
          <textarea
            style={styles.textarea}
            placeholder="무엇을 봤고, 어떤 기분이었나요?"
            value={note}
            onChange={e => setNote(e.target.value)}
            rows={4}
          />
        </label>

        <button
          style={styles.saveBtn}
          onClick={() => {
            onSave({ ...pin, placeName: placeName.trim(), rating, note })
            onClose()
          }}
        >
          장소 일기 저장
        </button>
      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(38,47,35,0.28)', zIndex: 900,
    display: 'flex', alignItems: 'flex-end',
  },
  sheet: {
    width: '100%', background: '#fffdf4', borderRadius: '24px 24px 0 0',
    padding: '12px 18px 34px',
    borderTop: '3px solid #d9d1b7',
    boxShadow: '0 -18px 50px rgba(38,47,35,0.18)',
  },
  handle: {
    width: 42, height: 4, background: '#d9d1b7', borderRadius: 2,
    margin: '0 auto 16px',
  },
  header: {
    display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18,
  },
  houseIcon: {
    position: 'relative', width: 54, height: 48, flexShrink: 0,
  },
  roof: {
    position: 'absolute', left: 4, top: 0,
    width: 46, height: 24, background: '#d65b3f',
    clipPath: 'polygon(50% 0, 100% 100%, 0 100%)',
    boxShadow: 'inset 0 -2px 0 rgba(55,42,30,0.16)',
  },
  houseBody: {
    position: 'absolute', left: 8, bottom: 0,
    width: 38, height: 30, background: '#f8f4e6',
    border: '2px solid #463b2d',
    display: 'block',
  },
  window: {
    position: 'absolute', left: 6, top: 7,
    width: 9, height: 8, background: '#9fc8d5',
  },
  door: {
    position: 'absolute', right: 7, bottom: 0,
    width: 9, height: 15, background: '#6f4a2f',
  },
  time: { fontWeight: 900, fontSize: 17, color: '#2f3929' },
  coords: { fontSize: 12, color: '#8d7f62', fontWeight: 700, marginTop: 2 },
  deleteBtn: {
    marginLeft: 'auto', fontSize: 26, background: '#efe8d5', border: '2px solid #d9d1b7',
    borderRadius: 12, width: 38, height: 38, cursor: 'pointer',
    color: '#6c5941', lineHeight: 1,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  label: {
    display: 'block', fontSize: 12, fontWeight: 900, color: '#536347',
    marginBottom: 14,
  },
  labelText: {
    fontSize: 12, fontWeight: 900, color: '#536347', marginBottom: 6,
  },
  input: {
    width: '100%', border: '2px solid #d9d1b7', borderRadius: 8,
    padding: '12px 13px', fontSize: 15, color: '#2f3929',
    background: '#fbf6e8', marginTop: 7, fontWeight: 800,
  },
  ratingWrap: {
    background: '#f3ead5', border: '2px solid #d9d1b7',
    borderRadius: 8, padding: '12px 12px 10px', marginBottom: 14,
  },
  stars: {
    display: 'flex', gap: 4, alignItems: 'center',
  },
  starBtn: {
    width: 38, height: 36, borderRadius: 8,
    background: '#fffdf4', border: '1px solid #d9d1b7',
    fontSize: 25, lineHeight: 1, cursor: 'pointer',
  },
  ratingText: {
    fontSize: 12, color: '#8d7f62', fontWeight: 800, marginTop: 6,
  },
  textarea: {
    width: '100%', border: '2px solid #d9d1b7', borderRadius: 8,
    padding: '12px 13px', fontSize: 14, color: '#2f3929', resize: 'none',
    background: '#fbf6e8', marginTop: 7, lineHeight: 1.55,
  },
  saveBtn: {
    width: '100%', background: '#4f6f3a', color: 'white', border: 'none',
    borderRadius: 8, padding: '14px 0', fontSize: 16, fontWeight: 900,
    boxShadow: '0 4px 0 #344926',
  },
}
