import { canRoleReach, type UserRole } from "@/lib/authUtils"
import { formatDay, isCalendarDay } from "@/lib/dates"

type NotificationRef = { entity_type: string; entity_id: string | null }

// Where each kind of notification is dealt with. Operations work their tasks
// from their own area; everybody else from the admin area.
const pathFor = ({ entity_type, entity_id }: NotificationRef, role: UserRole): string | null => {
  switch (entity_type) {
    case "task":
      if (!entity_id) return null
      return role === "operations" ? `/dashboard/tasks?task=${entity_id}` : `/admin/dashboard/tasks?task=${entity_id}`
    case "invoice":
      return entity_id ? `/admin/dashboard/invoices/${entity_id}` : "/admin/dashboard/invoices"
    case "leave_request":
      return "/dashboard/leave"
    case "time_entry":
      return "/admin/dashboard/time-approvals"
    case "payment":
      return "/admin/dashboard/payments"
    case "user":
      return "/admin/dashboard/team-management"
    default:
      return null
  }
}

/**
 * The page a notification opens, or null when it has none (a platform notice)
 * or the reader's role could not open it, so the bell never links to a 403.
 */
export const notificationHref = (notification: NotificationRef, role: UserRole): string | null => {
  const path = pathFor(notification, role)
  if (!path) return null
  return canRoleReach(path.split("?")[0], role) ? path : null
}

// Bodies carry raw days ("Due 2026-10-17"); written the app's way they read "Due 17 Oct 2026".
export const formatDaysInText = (text: string): string =>
  text.replace(/\b\d{4}-\d{2}-\d{2}\b/g, (day) => (isCalendarDay(day) ? formatDay(day) : day))
