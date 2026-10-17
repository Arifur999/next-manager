"use client"

import type {
  DataTableFilterConfig,
  DataTableFilterValue,
  DataTableProps,
} from "@/components/shared/table/dataTable.types"
import { buildTableQueryString, filterParamKeys, readFilterValues, readPaging, writeFilterValue } from "@/lib/table/urlState"
import type { PaginationState } from "@tanstack/react-table"
import { usePathname, useSearchParams } from "next/navigation"
import { useCallback, useMemo } from "react"

// Declared once per list at module scope (stable), and shared by the page's
// prefetch and the client table so both fetch the same query string.
export interface ServerDataTableConfig {
  // Every query parameter the endpoint accepts besides page and limit.
  queryKeys: readonly string[]
  filters?: DataTableFilterConfig[]
  search?: { placeholder: string; queryKey?: string }
  defaultLimit: number
}

const NO_FILTERS: DataTableFilterConfig[] = []

// The URL is the single source of truth for a server-paged table: page, page
// size, search and filters all live in it, so a view can be reloaded, shared
// and stepped back through. Returns the query string to fetch with and the
// props to spread onto DataTable.
export const useServerDataTable = <TData,>(config: ServerDataTableConfig) => {
  const { filters = NO_FILTERS, search, defaultLimit } = config
  const searchParams = useSearchParams()
  const pathname = usePathname()

  // pushState, not router.push: the URL changes with no navigation and no
  // scroll jump; Next keeps useSearchParams in step, and the query key follows.
  const updateParams = useCallback(
    (update: (params: URLSearchParams) => void, { resetPage = false } = {}) => {
      const params = new URLSearchParams(searchParams.toString())
      update(params)
      if (resetPage) params.delete("page")
      const query = params.toString()
      window.history.pushState(null, "", query ? `${pathname}?${query}` : pathname)
    },
    [pathname, searchParams],
  )

  const { page, limit } = readPaging(searchParams, defaultLimit)
  const paginationState = useMemo<PaginationState>(() => ({ pageIndex: page - 1, pageSize: limit }), [page, limit])

  const onPaginationChange = (next: PaginationState) =>
    updateParams((params) => {
      if (next.pageIndex > 0) params.set("page", String(next.pageIndex + 1))
      else params.delete("page")
      if (next.pageSize !== defaultLimit) params.set("limit", String(next.pageSize))
      else params.delete("limit")
    })

  const searchKey = search?.queryKey ?? "search"
  const searchTerm = searchParams.get(searchKey) ?? ""

  // Every new search or filter starts again from page 1.
  const onSearchChange = (term: string) => {
    if (term === searchTerm) return
    updateParams((params) => (term ? params.set(searchKey, term) : params.delete(searchKey)), { resetPage: true })
  }

  const onFilterChange = (filterId: string, value: DataTableFilterValue | undefined) => {
    const filter = filters.find((item) => item.id === filterId)
    if (filter) updateParams((params) => writeFilterValue(params, filter, value), { resetPage: true })
  }

  const onClearAll = () =>
    updateParams((params) => filters.flatMap(filterParamKeys).forEach((key) => params.delete(key)), { resetPage: true })

  const dataTableProps: Pick<DataTableProps<TData>, "pagination" | "search" | "filters"> = {
    pagination: { state: paginationState, onPaginationChange },
    search: search && { placeholder: search.placeholder, initialValue: searchTerm, onDebouncedChange: onSearchChange },
    filters:
      filters.length > 0
        ? { configs: filters, values: readFilterValues(searchParams, filters), onFilterChange, onClearAll }
        : undefined,
  }

  return { queryString: buildTableQueryString(searchParams, config), dataTableProps }
}
