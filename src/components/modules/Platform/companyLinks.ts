import { NOT_SET_UP } from "@/components/modules/Platform/subscriptionStatus"
import type { SubscriptionStatus } from "@/types/platform.types"

const COMPANIES_PATH = "/platform/customers"

// Links into the companies list, so a number or a name on the dashboard opens the rows behind it.
export const companiesWithStanding = (status: SubscriptionStatus | typeof NOT_SET_UP) =>
  `${COMPANIES_PATH}?status=${status}`

export const companiesMatching = (search: string) => `${COMPANIES_PATH}?search=${encodeURIComponent(search)}`

