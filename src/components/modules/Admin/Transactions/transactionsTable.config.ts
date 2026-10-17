import type { ServerDataTableConfig } from "@/hooks/useServerDataTable"

// Shared by the page's prefetch and the board, so both fetch the same query string.
export const TRANSACTIONS_TABLE: ServerDataTableConfig = {
  queryKeys: ["search", "kind", "from", "to"],
  search: { placeholder: "Search descriptions..." },
  filters: [
    {
      id: "kind",
      type: "single-select",
      label: "Kind",
      options: [
        { label: "Income", value: "income" },
        { label: "Expenses", value: "expense" },
        { label: "Transfers", value: "transfer" },
      ],
    },
    { id: "date", type: "date-range", label: "Date" },
  ],
  defaultLimit: 20,
}
