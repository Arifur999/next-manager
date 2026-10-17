import type { ApiResponse } from "@/types/api.types"

/** The page size the activity feeds ask for; the API caps any limit at 200. */
export const FEED_PAGE_SIZE = 50

/**
 * The next page to ask for, or undefined when the last one was the end.
 * Reads the list meta when the API sends it; otherwise a short page ends it.
 */
export const nextPageOf = <TRow>(lastPage: ApiResponse<TRow[]>, lastPageParam: number): number | undefined => {
  const pageCount = lastPage.meta?.totalPages
  if (pageCount !== undefined) return lastPageParam < pageCount ? lastPageParam + 1 : undefined
  return lastPage.data.length >= FEED_PAGE_SIZE ? lastPageParam + 1 : undefined
}
