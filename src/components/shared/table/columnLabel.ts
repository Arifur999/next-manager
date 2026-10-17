import type { Column } from "@tanstack/react-table";

// Plain-text name of a column for menus: meta.label, else a string header, else the id.
export const getColumnLabel = <TData,>(column: Column<TData, unknown>): string => {
  const header = column.columnDef.header;
  return column.columnDef.meta?.label ?? (typeof header === "string" ? header : column.id);
};
