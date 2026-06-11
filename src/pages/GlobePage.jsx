import React, { useMemo } from 'react'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import L from 'leaflet'
import { useDiaryStore } from '../stores/diaryStore'

const DAY_COLORS = ['#ff6b9d','#ffd166','#06d6a0','#118ab2','#9b5de5','#ef4444']

function bearing(a, b) {
  const dLon = (b.lng - a.lng) * Math.PI / 180
  const lat1 = a.lat * Math.PI / 180, lat2 = b.lat * Math.PI / 180
  const y = Math.sin(dLon) * Math.cos(lat2)
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon)
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360
}

function haversine(a, b) {
  const R = 6371000
  const dLat = (b.lat - a.lat) * Math.PI / 180
  const dLon = (b.lng - a.lng) * Math.PI / 180
  const sin2 = Math.sin(dLat/2)**2 + Math.cos(a.lat*Math.PI/180)*Math.cos(b.lat*Math.PI/180)*Math.sin(dLon/2)**2
  return R * 2 * Math.asin(Math.sqrt(sin2))
}

export default function GlobePage() {
  const { entries } = useDiaryStore()
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date))

  const totalDays = entries.length
  const totalPins = useMemo(() => entries.reduce((s, e) => s + (e.pins?.length || 0), 0), [entries])
  const totalKm = useMemo(() => {
    let d = 0
    entries.forEach(e => {
      const r = e.route || []
      for (let i = 1; i < r.length; i++) d += haversine(r[i-1], r[i])
    })
    return Math.round(d / 100) / 10
  }, [entries])

  const allMarkers = useMemo(() => {
    const out = []
    sorted.forEach((entry, idx) => {
      const color = DAY_COLORS[idx % DAY_COLORS.length]
      const route = entry.route || []
      const STEP = 3
      for (let i = STEP; i < route.length; i += STEP) {
        const angle = bearing(route[i-1], route[i])
        out.push({ type: 'foot', latlng: [route[i].lat, route[i].lng], angle, color, date: entry.date })
      }
      if (route.length > 0) {
        out.push({ type: 'start', latlng: [route[0].lat, route[0].lng], color, date: entry.date })
        if (route.length > 1)
          out.push({ type: 'end', latlng: [route[route.length-1].lat, route[route.length-1].lng], color, date: entry.date })
      }
      ;(entry.pins || []).forEach(pin => {
        out.push({ type: 'pin', latlng: [pin.lat, pin.lng], emoji: pin.emoji, color, date: entry.date })
      })
    })
    return out
  }, [sorted])

  function makeIcon(m) {
    if (m.type === 'foot') {
      return L.divIcon({
        className: '',
        html: `<div style="font-size:13px;transform:rotate(${m.angle}deg);opacity:0.7;filter:drop-shadow(0 1px 2px rgba(0,0,0,.15))"  >🐾</div>`,
        iconSize: [18, 18], iconAnchor: [9, 9],
      })
    }
    if (m.type === 'pin') {
      return L.divIcon({
        className: '',
        html: `<div style="
          background:white;border-radius:10px;
          width:34px;height:38px;
          display:flex;flex-direction:column;align-items:center;justify-content:center;
          box-shadow:0 3px 0 rgba(0,0,0,.12),0 6px 14px rgba(0,0,0,.10);
          position:relative;overflow:visible;
        ">
          <div style="position:absolute;top:0;left:0;right:0;height:4px;border-radius:10px 10px 0 0;background:${m.color}"></div>
          <div style="font-size:17px;margin-top:3px">${m.emoji}</div>
          <div style="position:absolute;bottom:-5px;left:50%;transform:translateX(-50%);
            width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:6px solid white;
            filter:drop-shadow(0 2px 1px rgba(0,0,0,.10))"></div>
        </div>`,
        iconSize: [34, 44], iconAnchor: [17, 44],
      })
    }
    if (m.type === 'start') {
      return L.divIcon({
        className: '',
        html: `<div style="font-size:18px;background:white;border-radius:10px;padding:3px 5px;box-shadow:0 3px 0 rgba(0,0,0,.12);border-top:4px solid ${m.color}">🏠</div>`,
        iconSize: [34, 36], iconAnchor: [17, 36],
      })
    }
    return L.divIcon({
      className: '',
      html: `<div style="font-size:18px;background:white;border-radius:10px;padding:3px 5px;box-shadow:0 3px 0 rgba(0,0,0,.12);border-top:4px solid ${m.color}">⭐</div>`,
      iconSize: [34, 36], iconAnchor: [17, 36],
    })
  }

  if (entries.length === 0) {
    return (
      <div style={styles.empty}>
        <p style={{ fontSize: 72 }}>🌍</p>
        <p style={styles.emptyText}>기록이 쌓이면<br />나만의 지구가 완성돼요!</p>
        <p style={styles.emptySubtext}>오늘부터 하루하루 기록해 보세요</p>
      </div>
    )
  }

  const center = allMarkers.length ? allMarkers[0].latlng : [37.5665, 126.9780]

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.title}>🌍 나의 지구</h1>
        <div style={styles.stats}>
          {[{num: totalDays, label: '일'},{num: totalPins, label: '핀'},{num: totalKm, label: 'km'}].map((s, i) => (
            <React.Fragment key={s.label}>
              {i > 0 && <div style={styles.divider} />}
              <div style={styles.stat}>
                <span style={styles.statNum}>{s.num}</span>
                <span style={styles.statLabel}>{s.label}</span>
              </div>
            </React.Fragment>
          ))}
        </div>
      </header>

      <div style={styles.mapWrap}>
        <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
            subdomains="abcd" maxZoom={19}
          />
          <TileLayer
            attribution=""
            url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png"
            subdomains="abcd" maxZoom={19} opacity={0.55}
          />
          {allMarkers.map((m, i) => (
            <Marker key={i} position={m.latlng} icon={makeIcon(m)} />
          ))}
        </MapContainer>
      </div>

      <div style={styles.legend}>
        <p style={styles.legendTitle}>날짜별 경로</p>
        <div style={styles.legendScroll}>
          {sorted.map((entry, i) => (
            <div key={entry.date} style={styles.legendItem}>
              <div style={{ ...styles.legendDot, background: DAY_COLORS[i % DAY_COLORS.length] }} />
              <span style={styles.legendDate}>{formatShort(entry.date)}</span>
              {entry.mood && <span style={{ fontSize: 14 }}>{entry.mood}</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function formatShort(dateStr) {
  return new Date(dateStr).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
}

const styles = {
  page: { display: 'flex', flexDirection: 'column', height: '100vh', background: '#fffbf5' },
  header: {
    padding: '14px 18px 12px', background: 'white',
    borderBottom: '2px solid #fde8d8',
    boxShadow: '0 2px 14px rgba(255,107,157,0.07)',
  },
  title: { fontSize: 22, fontWeight: 900, color: '#3d2b1f', marginBottom: 10 },
  stats: { display: 'flex', alignItems: 'center' },
  stat: { display: 'flex', alignItems: 'baseline', gap: 2, paddingRight: 14 },
  statNum: { fontSize: 24, fontWeight: 900, color: '#ff6b9d' },
  statLabel: { fontSize: 12, color: '#c9a0b0', fontWeight: 800 },
  divider: { width: 1, height: 20, background: '#fde8d8', marginRight: 14 },
  mapWrap: { flex: 1, position: 'relative', overflow: 'hidden' },
  legend: {
    background: 'white', padding: '12px 18px 80px',
    borderTop: '2px solid #fde8d8',
  },
  legendTitle: { fontSize: 12, color: '#c9a0b0', fontWeight: 800, marginBottom: 10 },
  legendScroll: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  legendItem: {
    display: 'flex', alignItems: 'center', gap: 6,
    background: '#fff9f5', border: '1.5px solid #fde8d8',
    borderRadius: 20, padding: '4px 10px',
  },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendDate: { fontSize: 12, color: '#3d2b1f', fontWeight: 800 },
  empty: {
    height: '100vh', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: 14,
    background: '#fffbf5', paddingBottom: 80,
  },
  emptyText: { fontSize: 18, fontWeight: 900, color: '#3d2b1f', textAlign: 'center', lineHeight: 1.6 },
  emptySubtext: { fontSize: 13, color: '#c9a0b0', fontWeight: 700 },
}
