import type { ServerDataTableConfig } from "@/hooks/useServerDataTable"

// Shared by the page's prefetch and the board, so both fetch the same query string.
// "kind" is fetched but is not a table filter: the view tabs above the table
// choose it, so an empty Income view says "no income yet" rather than
// "nothing matches the filters", and clearing filters keeps the view.
export const TRANSACTIONS_TABLE: ServerDataTableConfig = {
  paramKeys: ["search", "kind", "from", "to"],
  search: { placeholder: "Search descriptions..." },
  filters: [{ id: "date", type: "date-range", label: "Date" }],
  defaultLimit: 20,
}
