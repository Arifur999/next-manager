import { STANDING_FILTER } from "@/components/modules/Platform/subscriptionStatus"
import type { ServerDataTableConfig } from "@/hooks/useServerDataTable"

// Shared by each page's prefetch and its board, so both fetch the same query string.
// The API's search also matches a company's admins, which the rows do not carry.
export const COMPANIES_TABLE: ServerDataTableConfig = {
  paramKeys: ["search", "status"],
  search: { placeholder: "Company, email or the person you sold to" },
  filters: [STANDING_FILTER],
  defaultLimit: 20,
}

// Paying companies is the same list held to one standing, so it has no standing filter.
export const PAYING_COMPANIES_TABLE: ServerDataTableConfig = {
  paramKeys: ["search"],
  search: COMPANIES_TABLE.search,
  defaultLimit: 20,
}

export const onlyPaying = (queryString: string) => [queryString, "status=active"].filter(Boolean).join("&")
