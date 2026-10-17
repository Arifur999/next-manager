"use client"

import { useCallback, useEffect, useMemo, useRef } from "react"

// { run, cancel }: `run` calls the latest callback once calls stop for
// `delayMs`; `cancel` drops a pending call (a cleared search box applies its
// empty value at once instead).
export const useDebouncedCallback = <TArgs extends unknown[]>(callback: (...args: TArgs) => void, delayMs: number) => {
  const callbackRef = useRef(callback)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Always call the newest callback without restarting the timer.
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  const cancel = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = null
  }, [])

  const run = useCallback(
    (...args: TArgs) => {
      cancel()
      timerRef.current = setTimeout(() => {
        timerRef.current = null
        callbackRef.current(...args)
      }, delayMs)
    },
    [cancel, delayMs],
  )

  // Never fire into an unmounted component.
  useEffect(() => cancel, [cancel])

  return useMemo(() => ({ run, cancel }), [run, cancel])
}
