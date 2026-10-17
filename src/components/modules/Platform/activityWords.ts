import { PLATFORM_PERMISSION_INFO, PLATFORM_PERMISSIONS } from "@/types/platform.types"

const ACTION_LABEL: Record<string, string> = {
  created: "Created",
  updated: "Changed",
  deleted: "Removed",
  status_changed: "Status changed",
  invited: "Invited",
  sent: "Sent",
}

// A known action in words; an unknown one still reads as words, not as a code.
export const actionLabel = (action: string) => {
  const known = ACTION_LABEL[action]
  if (known) return known
  const words = action.replace(/[_.]+/g, " ").trim()
  return words.charAt(0).toUpperCase() + words.slice(1)
}

// The server writes permission codes into access summaries; the feed shows the names the access editor uses.
export const readableSummary = (summary: string) =>
  PLATFORM_PERMISSIONS.reduce(
    (text, permission) => text.replaceAll(permission, PLATFORM_PERMISSION_INFO[permission].label.toLowerCase()),
    summary,
  )
