// RFC 4180 quoting, plus a guard against CSV injection: text starting with
// = + - @ (or a tab or CR) gets a leading ' so a spreadsheet never runs
// user-typed text as a formula. Numbers stay as they are, so -5 is still -5.
export const toCsvCell = (value: unknown): string => {
  if (value === null || value === undefined) return ""
  if (typeof value === "number" || typeof value === "boolean") return String(value)

  let text = value instanceof Date ? value.toISOString() : String(value)
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`
  if (/[",\n\r]/.test(text)) text = `"${text.replace(/"/g, '""')}"`
  return text
}

export const toCsv = (headers: string[], rows: unknown[][]): string =>
  [headers, ...rows].map((row) => row.map(toCsvCell).join(",")).join("\r\n")
