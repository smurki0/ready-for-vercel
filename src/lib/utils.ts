import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { useState, useEffect } from "react"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Safely parse a JSON field that may already be parsed or still a string.
 * The API returns pre-parsed arrays, but we handle both cases.
 */
export function safeJsonParse<T>(value: T | string): T {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value)
    } catch {
      return [] as T
    }
  }
  return value
}

/**
 * Seeded pseudo-random number generator (Lehmer/Park-Miller).
 * Returns a function that produces deterministic values in [0, 1).
 */
export function seededRandom(seed: number): () => number {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

/**
 * Hook that returns true once the component has mounted on the client.
 * Useful for preventing hydration mismatches with client-only rendering.
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    requestAnimationFrame(() => setMounted(true))
  }, [])
  return mounted
}
