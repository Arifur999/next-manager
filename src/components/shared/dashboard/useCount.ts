"use client"

import { useQuery } from "@tanstack/react-query"

/**
 * How many rows a list endpoint would return, without fetching them.
 *
 * Every list here already reports `meta.total` for the whole filtered set, not
 * the page — so asking for ONE row gives the true count for the cost of one.
 * Counting by fetching everything would pull a thousand clients across the wire
 * to render the number 1000.
 *
 * The important property is not the saving, though: it is that the count comes
 * from the SAME endpoint, with the same filter, as the page the tile links to.
 * A dashboard that counted its own way is a dashboard that can disagree with
 * the list underneath it, and the person reading it has no way to tell which is
 * lying.
 *
 * Undefined while loading, and undefined stays undefined — the tile shows a
 * dash rather than a zero, because zero is an answer and showing it before one
 * is known says the business is empty when it is merely slow.
 */
export const useCount = (
  key: readonly unknown[],
  fetcher: () => Promise<{ meta?: { total?: number } }>
): number | undefined => {
  const { data } = useQuery({ queryKey: key, queryFn: fetcher })
  return data?.meta?.total
}
