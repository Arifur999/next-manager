"use client"

import { useQuery, type QueryKey, type UseQueryOptions } from "@tanstack/react-query"

export interface ICountResult {
  /** Undefined while loading: a dash or a skeleton, never a zero that was not measured. */
  value: number | undefined
  isError: boolean
  retry: () => void
}

/**
 * How many rows a list endpoint would return, without fetching them.
 *
 * Every list reports `meta.total` for the whole filtered set, so asking for ONE
 * row gives the true count for the cost of one. The count comes from the SAME
 * endpoint, with the same filter, as the page the tile links to, so the tile
 * and the list cannot disagree.
 */
export const useCount = <TData extends { meta?: { total?: number } }, TKey extends QueryKey>(
  options: UseQueryOptions<TData, Error, TData, TKey>
): ICountResult => {
  const { data, isError, refetch } = useQuery(options)
  return { value: data?.meta?.total, isError, retry: () => void refetch() }
}

/** Spreads a count into a CountSection entry: value plus its error state. */
export const countFields = (count: ICountResult) => ({
  value: count.value,
  isError: count.isError,
  onRetry: count.retry,
})

/** The same fields for a figure read out of any query (a report, a dashboard). */
export const queryFields = <TValue>(
  query: { isError: boolean; refetch: () => unknown },
  value: TValue,
) => ({
  value,
  isError: query.isError,
  onRetry: () => void query.refetch(),
})
