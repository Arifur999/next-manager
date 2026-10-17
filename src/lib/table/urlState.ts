import type { DataTableFilterConfig, DataTableFilterValue, DataTableFilterValues } from "@/components/shared/table/dataTable.types"

// What a page's `searchParams` prop resolves to, and what the browser has.
export type SearchParamsRecord = Record<string, string | string[] | undefined>
// useSearchParams() gives a ReadonlyURLSearchParams, a URLSearchParams subclass.
type ParamsSource = URLSearchParams | SearchParamsRecord

const readAll = (source: ParamsSource, key: string): string[] => {
  if (source instanceof URLSearchParams) return source.getAll(key)
  const value = source[key]
  if (value === undefined) return []
  return Array.isArray(value) ? value : [value]
}

/** The largest page the pager offers. The API itself caps a page at 200 rows. */
export const MAX_PAGE_SIZE = 100

const toPositiveInt = (raw: string | undefined, fallback: number) => {
  const value = Math.floor(Number(raw))
  return Number.isFinite(value) && value > 0 ? value : fallback
}

export const readPaging = (source: ParamsSource, defaultLimit: number) => ({
  page: toPositiveInt(readAll(source, "page")[0], 1),
  limit: Math.min(toPositiveInt(readAll(source, "limit")[0], defaultLimit), MAX_PAGE_SIZE),
})

// The query string a server-paged table fetches with: page and limit first,
// then only the keys the endpoint accepts, in config order. The page's prefetch
// and the browser both build it here, so they land on the same query key.
export const buildTableQueryString = (
  source: ParamsSource,
  config: { queryKeys: readonly string[]; defaultLimit: number },
): string => {
  const { page, limit } = readPaging(source, config.defaultLimit)
  const params = new URLSearchParams({ page: String(page), limit: String(limit) })
  for (const key of config.queryKeys) {
    for (const value of readAll(source, key)) {
      if (value !== "") params.append(key, value)
    }
  }
  return params.toString()
}

const rangeKeys = (config: Extract<DataTableFilterConfig, { type: "date-range" }>) => ({
  fromKey: config.fromKey ?? "from",
  toKey: config.toKey ?? "to",
})

/** The URL parameters a filter owns. */
export const filterParamKeys = (config: DataTableFilterConfig): string[] => {
  if (config.type !== "date-range") return [config.id]
  const { fromKey, toKey } = rangeKeys(config)
  return [fromKey, toKey]
}

// How filters live in the URL, which is also what the API reads:
//   single  ?kind=income
//   multi   ?type=salary&type=bonus
//   range   ?from=2026-01-01&to=2026-01-31
export const readFilterValues = (source: ParamsSource, configs: DataTableFilterConfig[]): DataTableFilterValues => {
  const values: DataTableFilterValues = {}
  for (const config of configs) {
    if (config.type === "single-select") values[config.id] = readAll(source, config.id)[0]
    else if (config.type === "multi-select") values[config.id] = readAll(source, config.id)
    else {
      const { fromKey, toKey } = rangeKeys(config)
      const range = { from: readAll(source, fromKey)[0], to: readAll(source, toKey)[0] }
      values[config.id] = range.from || range.to ? range : undefined
    }
  }
  return values
}

export const writeFilterValue = (
  params: URLSearchParams,
  config: DataTableFilterConfig,
  value: DataTableFilterValue | undefined,
) => {
  for (const key of filterParamKeys(config)) params.delete(key)
  if (value === undefined) return

  if (typeof value === "string") {
    if (value) params.set(config.id, value)
  } else if (Array.isArray(value)) {
    for (const item of value) params.append(config.id, item)
  } else if (config.type === "date-range") {
    const { fromKey, toKey } = rangeKeys(config)
    if (value.from) params.set(fromKey, value.from)
    if (value.to) params.set(toKey, value.to)
  }
}
