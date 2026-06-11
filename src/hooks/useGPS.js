import { useEffect, useRef, useState } from 'react'

export function useGPS({ onPoint, enabled }) {
  const [position, setPosition] = useState(null)
  const [error, setError] = useState(null)
  const watchId = useRef(null)
  const lastPoint = useRef(null)
  const MIN_DISTANCE = 10 // meters

  function haversine(a, b) {
    const R = 6371000
    const dLat = (b.lat - a.lat) * Math.PI / 180
    const dLon = (b.lng - a.lng) * Math.PI / 180
    const sin2 = Math.sin(dLat / 2) ** 2 +
      Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLon / 2) ** 2
    return R * 2 * Math.asin(Math.sqrt(sin2))
  }

  useEffect(() => {
    if (!enabled) {
      if (watchId.current) navigator.geolocation.clearWatch(watchId.current)
      watchId.current = null
      return
    }
    if (!navigator.geolocation) {
      setError('GPS를 지원하지 않는 브라우저입니다.')
      return
    }
    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const pt = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setPosition(pt)
        if (!lastPoint.current || haversine(lastPoint.current, pt) >= MIN_DISTANCE) {
          lastPoint.current = pt
          onPoint?.(pt)
        }
      },
      (err) => setError(err.message),
      { enableHighAccuracy: true, maximumAge: 5000 }
    )
    return () => {
      if (watchId.current) navigator.geolocation.clearWatch(watchId.current)
    }
  }, [enabled])

  return { position, error }
}
