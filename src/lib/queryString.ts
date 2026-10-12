export type QueryRecord = Record<string, string | number | null | undefined>

// One encoder for server prefetch and browser query, so both build the same
// key byte for byte. Empty values are dropped; key order follows the record.
export const buildQueryString = (record: QueryRecord): string => {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(record)) {
    if (value === undefined || value === null || value === "") continue
    params.append(key, String(value))
  }
  return params.toString()
}

// A query string turned into the params object axios wants.
export const toParams = (queryString?: string) =>
  queryString ? Object.fromEntries(new URLSearchParams(queryString)) : undefined

// A URL value accepted only when it is one of the allowed literals.
export const pickAllowed = <T extends string>(
  value: string | string[] | null | undefined,
  allowed: readonly T[],
): T | undefined => allowed.find((option) => option === value)
