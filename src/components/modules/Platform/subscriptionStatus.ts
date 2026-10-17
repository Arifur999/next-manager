import type { DataTableFilterConfig } from "@/components/shared/table/dataTable.types"
import { SUBSCRIPTION_STATUSES, type SubscriptionStatus } from "@/types/platform.types"

// One set of words for a company's standing, on every platform screen, filter and export.
export const STATUS_LABEL: Record<SubscriptionStatus, string> = {
  trialing: "On trial",
  active: "Paying",
  past_due: "Past due",
  suspended: "Suspended",
  cancelled: "Cancelled",
}

// past_due is the grace window and still writing, so it reads as a warning.
// Suspended and cancelled are the ones that actually block.
export const STATUS_TONE: Record<SubscriptionStatus, "secondary" | "outline" | "destructive"> = {
  trialing: "outline",
  active: "secondary",
  past_due: "outline",
  suspended: "destructive",
  cancelled: "destructive",
}

// The filter value (and the API's `status`) for a company with no subscription row.
export const NOT_SET_UP = "none"
export const NOT_SET_UP_LABEL = "Not set up"

export const standingLabel = (status: SubscriptionStatus | undefined) =>
  status ? STATUS_LABEL[status] : NOT_SET_UP_LABEL

export const STANDING_FILTER: DataTableFilterConfig = {
  id: "status",
  type: "single-select",
  label: "Standing",
  options: [
    ...SUBSCRIPTION_STATUSES.map((status) => ({ value: status, label: STATUS_LABEL[status] })),
    { value: NOT_SET_UP, label: NOT_SET_UP_LABEL },
  ],
}

export const isLockedOut = (status: SubscriptionStatus | undefined) =>
  status === "suspended" || status === "cancelled"
