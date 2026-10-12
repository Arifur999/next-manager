// Stored URLs become live links only when they are http(s). Anything else
// (data:, javascript:, ftp:, free text) is shown as text instead.
export const toSafeExternalUrl = (raw: string | null | undefined): string | null => {
  if (!raw) return null
  try {
    const url = new URL(raw)
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : null
  } catch {
    return null
  }
}
