import type { ServerDataTableConfig } from "@/hooks/useServerDataTable"

// Shared by the page's prefetch and the table, so both fetch the same query string.
// `status` is also what the sidebar's All / Active / Inactive / Archived links set.
export const CLIENTS_TABLE: ServerDataTableConfig = {
  queryKeys: ["search", "status"],
  search: { placeholder: "Search name, company or email..." },
  filters: [
    {
      id: "status",
      type: "single-select",
      label: "Status",
      options: [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
        { label: "Archived", value: "archived" },
      ],
    },
  ],
  defaultLimit: 20,
}
