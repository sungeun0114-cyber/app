import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const NAV = [
  { path: '/', icon: '🗺️', label: '오늘' },
  { path: '/history', icon: '📅', label: '기록' },
  { path: '/globe', icon: '🌍', label: '지구' },
]

export default function BottomNav() {
  const nav = useNavigate()
  const loc = useLocation()

  return (
    <nav style={styles.nav}>
      {NAV.map(item => {
        const active = loc.pathname === item.path
        return (
          <button
            key={item.path}
            style={{ ...styles.btn, ...(active ? styles.active : {}) }}
            onClick={() => nav(item.path)}
          >
            <span style={styles.icon}>{item.icon}</span>
            <span style={{ ...styles.label, color: active ? '#d45d3d' : '#81775f' }}>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}

const styles = {
  nav: {
    position: 'fixed', bottom: 0, left: 0, right: 0, height: 68,
    background: '#fffaf0', borderTop: '2px solid #c9b88f',
    display: 'flex', alignItems: 'center',
    boxShadow: '0 -4px 20px rgba(54,72,42,0.12)',
    zIndex: 600,
  },
  btn: {
    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: 3, background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0',
  },
  active: {},
  icon: { fontSize: 24 },
  label: { fontSize: 11, fontWeight: 800 },
}
