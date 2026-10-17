"use client"

import { toDate } from "@/lib/dates"
import { formatDistanceToNow, formatDistanceToNowStrict } from "date-fns"
import { useSyncExternalStore } from "react"

// One minute clock shared by every RelativeTime on the page, so "5 minutes ago"
// moves on without each copy running its own timer.
const subscribeToMinutes = (onMinute: () => void) => {
  const timer = setInterval(onMinute, 60_000)
  return () => clearInterval(timer)
}
const currentMinute = () => Math.floor(Date.now() / 60_000)
const serverMinute = () => 0

type RelativeTimeProps = {
  value: string | Date
  /** "3 minutes ago" rather than "about 3 minutes ago", for tight lists. */
  strict?: boolean
}

// "3 minutes ago". The server renders it a moment before the browser hydrates,
// and across a boundary ("less than a minute" against "1 minute") the two
// disagree. suppressHydrationWarning lets React keep the server's words instead
// of throwing the page away; the minute clock brings them up to date.
const RelativeTime = ({ value, strict = false }: RelativeTimeProps) => {
  useSyncExternalStore(subscribeToMinutes, currentMinute, serverMinute)
  const date = toDate(value)
  const text = strict
    ? formatDistanceToNowStrict(date, { addSuffix: true })
    : formatDistanceToNow(date, { addSuffix: true })

  return (
    <time dateTime={date.toISOString()} suppressHydrationWarning>
      {text}
    </time>
  )
}

export default RelativeTime
