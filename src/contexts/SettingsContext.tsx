'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface Settings {
  [key: string]: boolean
}

interface SettingsContextValue {
  settings: Settings
  isEnabled: (feature: string) => boolean
  loading: boolean
}

const SettingsContext = createContext<SettingsContextValue>({
  settings: {},
  isEnabled: () => true,
  loading: true,
})

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => {
        setSettings(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const isEnabled = (feature: string) => {
    if (loading) return true
    return settings[feature] !== false
  }

  return (
    <SettingsContext.Provider value={{ settings, isEnabled, loading }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  return useContext(SettingsContext)
}
