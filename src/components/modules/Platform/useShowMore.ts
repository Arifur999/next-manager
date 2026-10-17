"use client"

import { useState } from "react"

// A long list rendered a page at a time; `reset` goes back to the first page when the list is narrowed.
export const useShowMore = <TRow,>(rows: TRow[], pageSize: number) => {
  const [shown, setShown] = useState(pageSize)

  return {
    visible: rows.slice(0, shown),
    remaining: Math.max(rows.length - shown, 0),
    showMore: () => setShown((current) => current + pageSize),
    reset: () => setShown(pageSize),
  }
}
