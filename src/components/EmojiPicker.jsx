import React, { useState } from 'react'

const CATEGORIES = {
  '감정': ['😊','😢','😍','😤','😴','🥳','😰','🤩','😌','🥺','😎','🤔'],
  '음식': ['☕','🍜','🍕','🍣','🍰','🧋','🍺','🍱','🥗','🍔','🍦','🍩'],
  '활동': ['🛍️','🎵','📚','🏃','🎨','💼','🏋️','🎮','✈️','🚗','📸','💆'],
  '장소': ['🏠','🏪','🌳','🏖️','🏔️','🎪','💒','🏥','🏫','⛪','🌆','🎭'],
}

export default function EmojiPicker({ onSelect, onClose }) {
  const [tab, setTab] = useState('감정')

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.sheet} onClick={e => e.stopPropagation()}>
        <div style={styles.handle} />
        <p style={styles.title}>이모티콘 선택</p>
        <div style={styles.tabs}>
          {Object.keys(CATEGORIES).map(cat => (
            <button
              key={cat}
              style={{ ...styles.tab, ...(tab === cat ? styles.tabActive : {}) }}
              onClick={() => setTab(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        <div style={styles.grid}>
          {CATEGORIES[tab].map(emoji => (
            <button key={emoji} style={styles.emojiBtn} onClick={() => onSelect(emoji)}>
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(61,43,31,0.25)', zIndex: 1000,
    display: 'flex', alignItems: 'flex-end',
  },
  sheet: {
    width: '100%', background: 'white', borderRadius: '28px 28px 0 0',
    padding: '12px 20px 36px', maxHeight: '60vh',
    borderTop: '3px solid #fde8d8',
  },
  handle: {
    width: 40, height: 4, background: '#fde8d8', borderRadius: 2,
    margin: '0 auto 16px',
  },
  title: {
    fontWeight: 800, fontSize: 16, marginBottom: 14, textAlign: 'center',
    color: '#3d2b1f',
  },
  tabs: { display: 'flex', gap: 6, marginBottom: 16 },
  tab: {
    flex: 1, padding: '7px 0', borderRadius: 20, background: '#fff0f5',
    fontSize: 12, color: '#c9a0b0', fontWeight: 700, border: '2px solid #fde8d8',
  },
  tabActive: { background: '#ff6b9d', color: 'white', border: '2px solid #ff6b9d' },
  grid: {
    display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8,
  },
  emojiBtn: {
    fontSize: 26, background: '#fff9f5', border: '2px solid #fde8d8', borderRadius: 16,
    padding: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'transform 0.1s',
  },
}
