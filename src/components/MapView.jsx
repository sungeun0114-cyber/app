import React, { useState } from 'react'
import { useDiaryStore } from '../stores/diaryStore'
import PinDetailSheet from './PinDetailSheet'

const MAP_BG = '/storybook-village-map-v2.png'

const LANDMARKS = [
  { id: 'hill-house', name: '바다 언덕집', x: 47, y: 29 },
  { id: 'forest-hall', name: '숲속 회관', x: 75, y: 38 },
  { id: 'blue-house', name: '강가 파란집', x: 42, y: 48 },
  { id: 'yellow-house', name: '노란 지붕집', x: 67, y: 46 },
  { id: 'garden-cafe', name: '정원 카페', x: 78, y: 59 },
  { id: 'farm-house', name: '밭 옆 작은집', x: 17, y: 66 },
  { id: 'blue-cabin', name: '파란 숲집', x: 84, y: 72 },
  { id: 'rice-house', name: '논길집', x: 18, y: 79 },
  { id: 'river-house', name: '강변 하얀집', x: 61, y: 77 },
  { id: 'village-school', name: '마을 학교', x: 82, y: 88 },
  { id: 'lower-cabin', name: '아랫마을 집', x: 19, y: 91 },
]

export default function MapView({ date, mode }) {
  const { addPin, removePin, upsertEntry, entries } = useDiaryStore()
  const entry = entries.find(e => e.date === date) || { date, pins: [], route: [], mood: null, title: '' }
  const [selectedPin, setSelectedPin] = useState(null)

  const today = new Date().toISOString().slice(0, 10)
  const isToday = date === today

  function handleMapClick(event) {
    if (mode !== 'pin' || !isToday) return

    const rect = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100
    const newPin = {
      id: Date.now().toString(),
      emoji: '🏠',
      iconType: 'house',
      mapVersion: 2,
      placeName: '',
      rating: 0,
      x: clamp(x, 4, 96),
      y: clamp(y, 6, 94),
      note: '',
      createdAt: new Date().toISOString(),
    }

    addPin(date, newPin)
    setSelectedPin(newPin)
  }

  function openLandmark(event, landmark) {
    event.stopPropagation()
    const current = useDiaryStore.getState().entries.find(e => e.date === date) || entry
    const existing = (current.pins || []).find(pin => pin.landmarkId === landmark.id)

    if (existing) {
      setSelectedPin(existing)
      return
    }

    if (!isToday) return

    const newPin = {
      id: `${landmark.id}-${Date.now()}`,
      landmarkId: landmark.id,
      emoji: '🏠',
      iconType: 'landmark',
      placeName: landmark.name,
      rating: 0,
      x: landmark.x,
      y: landmark.y,
      note: '',
      createdAt: new Date().toISOString(),
    }
    addPin(date, newPin)
    setSelectedPin(newPin)
  }

  function handleSavePin(updated) {
    const current = useDiaryStore.getState().entries.find(e => e.date === date) || entry
    const hasPin = (current.pins || []).some(p => p.id === updated.id)
    const pins = hasPin
      ? current.pins.map(p => p.id === updated.id ? updated : p)
      : [...(current.pins || []), updated]
    upsertEntry({ ...current, pins })
  }

  return (
    <div className="storybook-map-shell">
      <div className="storybook-map" onClick={handleMapClick}>
        <img className="storybook-map-image" src={MAP_BG} alt="" draggable="false" />
        <div className="storybook-map-grain" />

        {LANDMARKS.map(landmark => {
          const pin = (entry.pins || []).find(item => item.landmarkId === landmark.id)
          return (
            <button
              key={landmark.id}
              className={`map-landmark ${pin ? 'is-recorded' : ''}`}
              style={{ left: `${landmark.x}%`, top: `${landmark.y}%` }}
              onClick={(event) => openLandmark(event, landmark)}
              aria-label={`${pin?.placeName || landmark.name} 일기 열기`}
            >
              <span className="map-landmark-ring" />
              <span className="map-landmark-label">{pin?.placeName || landmark.name}</span>
              {pin?.rating > 0 && <span className="map-landmark-rating">{'★'.repeat(pin.rating)}</span>}
            </button>
          )
        })}

        {(entry.pins || [])
          .filter(pin => pin.mapVersion === 2 && !pin.landmarkId && Number.isFinite(pin.x) && Number.isFinite(pin.y))
          .map((pin, index) => {
          const point = getPinPoint(pin, index)
          return (
            <button
              key={pin.id}
              className="paper-place-button"
              style={{ left: `${point.x}%`, top: `${point.y}%` }}
              onClick={(event) => {
                event.stopPropagation()
                setSelectedPin(pin)
              }}
              aria-label={`${pin.placeName || '오늘의 장소'} 열기`}
            >
              <PlaceMarker pin={pin} />
            </button>
          )
        })}

        {mode === 'pin' && isToday && (
          <div className="map-tap-target">+</div>
        )}
      </div>

      {selectedPin && (
        <PinDetailSheet
          pin={selectedPin}
          onClose={() => setSelectedPin(null)}
          onDelete={(id) => { removePin(date, id); setSelectedPin(null) }}
          onSave={handleSavePin}
        />
      )}
    </div>
  )
}

function PlaceMarker({ pin }) {
  const rating = Number(pin.rating || 0)
  const label = pin.placeName ? pin.placeName.slice(0, 8) : '오늘의 장소'

  return (
    <span className="paper-place-marker">
      <span className="paper-house">
        <span className="paper-house-roof" />
        <span className="paper-house-body">
          <span className="paper-house-window" />
          <span className="paper-house-door" />
        </span>
      </span>
      <span className="paper-place-label">{label}</span>
      {rating > 0 && <span className="paper-place-stars">{'★'.repeat(rating)}</span>}
    </span>
  )
}

function getPinPoint(pin, index) {
  if (Number.isFinite(pin.x) && Number.isFinite(pin.y)) {
    return { x: pin.x, y: pin.y }
  }

  const fallback = [
    { x: 50, y: 60 },
    { x: 36, y: 36 },
    { x: 70, y: 28 },
    { x: 24, y: 72 },
    { x: 76, y: 70 },
  ]
  return fallback[index % fallback.length]
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}
