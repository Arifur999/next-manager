export type ColumnPriority = "low"

// A low-priority column steps aside below md, so a phone shows the columns
// that say which row is which instead of scrolling sideways to find them.
// Display only: the column stays in the View menu and in the CSV export.
export const columnPriorityClass = (priority: ColumnPriority | undefined): string | undefined =>
  priority === "low" ? "hidden md:table-cell" : undefined
