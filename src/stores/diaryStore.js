import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase, isSupabaseReady } from '../lib/supabase'

const LOCAL_KEY = 'map-diary-entries'

export const useDiaryStore = create(
  persist(
    (set, get) => ({
      entries: [],       // all diary days
      activeDate: null,  // 'YYYY-MM-DD'
      isTracking: false,

      setActiveDate: (date) => set({ activeDate: date }),

      // Return today's entry or create blank
      getToday: () => {
        const today = new Date().toISOString().slice(0, 10)
        return get().entries.find(e => e.date === today) || null
      },

      upsertEntry: (entry) => {
        const entries = get().entries
        const idx = entries.findIndex(e => e.date === entry.date)
        const updated = idx >= 0
          ? entries.map((e, i) => i === idx ? { ...e, ...entry } : e)
          : [...entries, entry]
        set({ entries: updated })
        if (isSupabaseReady()) {
          supabase.from('diary_entries').upsert(entry)
        }
      },

      addPin: (date, pin) => {
        const entries = get().entries
        const existing = entries.find(e => e.date === date) || { date, pins: [], route: [], mood: null, title: '' }
        const updated = { ...existing, pins: [...(existing.pins || []), pin] }
        get().upsertEntry(updated)
      },

      addRoutePoint: (date, latlng) => {
        const entries = get().entries
        const existing = entries.find(e => e.date === date) || { date, pins: [], route: [], mood: null, title: '' }
        const updated = { ...existing, route: [...(existing.route || []), latlng] }
        get().upsertEntry(updated)
      },

      setMood: (date, mood) => {
        const entries = get().entries
        const existing = entries.find(e => e.date === date) || { date, pins: [], route: [], mood: null, title: '' }
        get().upsertEntry({ ...existing, mood })
      },

      setTitle: (date, title) => {
        const entries = get().entries
        const existing = entries.find(e => e.date === date) || { date, pins: [], route: [], mood: null, title: '' }
        get().upsertEntry({ ...existing, title })
      },

      removePin: (date, pinId) => {
        const entries = get().entries
        const existing = entries.find(e => e.date === date)
        if (!existing) return
        const updated = { ...existing, pins: existing.pins.filter(p => p.id !== pinId) }
        get().upsertEntry(updated)
      },

      setTracking: (val) => set({ isTracking: val }),

      loadFromSupabase: async () => {
        if (!isSupabaseReady()) return
        const { data, error } = await supabase.from('diary_entries').select('*').order('date', { ascending: false })
        if (!error && data) set({ entries: data })
      },
    }),
    {
      name: LOCAL_KEY,
      partialize: (state) => ({ entries: state.entries }),
    }
  )
)
