"use client"

import { useCallback, useMemo, useState, useSyncExternalStore } from "react"
import type { z } from "zod"

const SAME_TAB_EVENT = "app:persistent-state"

const readStorage = (key: string): string | null => {
  try {
    return window.localStorage.getItem(key)
  } catch {
    // Private browsing or blocked storage: behave as if nothing was stored.
    return null
  }
}

const subscribe = (onChange: () => void) => {
  // `storage` covers other tabs; the custom event covers this one.
  window.addEventListener("storage", onChange)
  window.addEventListener(SAME_TAB_EVENT, onChange)
  return () => {
    window.removeEventListener("storage", onChange)
    window.removeEventListener(SAME_TAB_EVENT, onChange)
  }
}

// localStorage-backed state that hydrates cleanly: the server snapshot is null
// (so the default renders on both sides), then useSyncExternalStore switches to
// the stored value. Without a key it is plain in-memory state. Storage is
// outside input (an old shape, a hand edit), so it is parsed with `schema` and
// falls back to the default when it does not fit; pass a module-level schema.
export const usePersistentState = <T,>(key: string | undefined, defaultValue: T, schema: z.ZodType<T>) => {
  const [memoryValue, setMemoryValue] = useState<T>(defaultValue)
  const raw = useSyncExternalStore(
    subscribe,
    () => (key ? readStorage(key) : null),
    () => null,
  )

  const value = useMemo<T>(() => {
    if (raw === null) return memoryValue
    try {
      const stored = schema.safeParse(JSON.parse(raw))
      return stored.success ? stored.data : memoryValue
    } catch {
      return memoryValue
    }
  }, [raw, memoryValue, schema])

  const setValue = useCallback(
    (next: T | ((previous: T) => T)) => {
      const resolved = next instanceof Function ? next(value) : next
      setMemoryValue(resolved)
      if (!key) return
      try {
        window.localStorage.setItem(key, JSON.stringify(resolved))
        window.dispatchEvent(new Event(SAME_TAB_EVENT))
      } catch {
        // Best effort: the in-memory value above still applies.
      }
    },
    [key, value],
  )

  return [value, setValue] as const
}
