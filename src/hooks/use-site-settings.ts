'use client'

import { useState, useCallback, useSyncExternalStore } from 'react'

interface SiteSettings {
  [key: string]: string
}

let cachedSettings: SiteSettings | null = null
let fetchPromise: Promise<SiteSettings> | null = null
let listeners: Set<() => void> = new Set()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function emitChange() {
  listeners.forEach((l) => l())
}

function getSnapshot(): SiteSettings | null {
  return cachedSettings
}

function getServerSnapshot(): SiteSettings | null {
  return null
}

async function fetchAndCacheSettings(): Promise<SiteSettings> {
  if (cachedSettings) return cachedSettings
  if (fetchPromise) return fetchPromise

  fetchPromise = fetch('/api/settings')
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        cachedSettings = data.data
        emitChange()
        return data.data
      }
      return {}
    })
    .catch(() => ({}))
    .finally(() => {
      fetchPromise = null
    })

  return fetchPromise
}

export function invalidateSettingsCache() {
  cachedSettings = null
  fetchPromise = null
  emitChange()
}

export function useSiteSettings() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const [loading, setLoading] = useState(!cachedSettings)

  const loadSettings = useCallback(async () => {
    setLoading(true)
    await fetchAndCacheSettings()
    setLoading(false)
  }, [])

  // Trigger fetch on mount if not cached
  const getSetting = useCallback((key: string, defaultValue: string = '') => {
    return snapshot?.[key] ?? defaultValue
  }, [snapshot])

  const getBoolSetting = useCallback((key: string, defaultValue: boolean = true) => {
    const val = snapshot?.[key]
    if (val === undefined || val === '') return defaultValue
    return val === 'true'
  }, [snapshot])

  const getIntSetting = useCallback((key: string, defaultValue: number = 0) => {
    const val = snapshot?.[key]
    if (val === undefined || val === '') return defaultValue
    return parseInt(val) || defaultValue
  }, [snapshot])

  const refetch = useCallback(async () => {
    cachedSettings = null
    fetchPromise = null
    setLoading(true)
    await fetchAndCacheSettings()
    setLoading(false)
  }, [])

  // Auto-fetch if no cached data
  if (!cachedSettings && !fetchPromise) {
    fetchAndCacheSettings().then(() => setLoading(false))
  }

  return { settings: snapshot || {}, loading, getSetting, getBoolSetting, getIntSetting, refetch, loadSettings }
}
