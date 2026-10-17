import type { ServerDataTableConfig } from "@/hooks/useServerDataTable"

// Shared by the page's prefetch and the table, so both fetch the same query
// string. `status` is a workflow status NAME, which is what the sidebar's
// static links can carry (ids differ per agency); `mine` is "My Projects".
export const PROJECTS_TABLE: ServerDataTableConfig = {
  paramKeys: ["search", "status", "mine"],
  search: { placeholder: "Search name, code or client..." },
  defaultLimit: 20,
}
