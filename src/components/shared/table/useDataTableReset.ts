"use client";

import { isDateRange } from "@/lib/table/filterFns";
import type { Table } from "@tanstack/react-table";
import type { DataTableFiltersConfig, DataTableSearchConfig } from "./dataTable.types";

const isActiveValue = (value: unknown) => {
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "string") return value !== "";
  return isDateRange(value) && Boolean(value.from || value.to);
};

// One answer to "is anything narrowing this table, and how is it undone?",
// shared by the toolbar's Reset button and the empty state's Clear filters.
export const useDataTableReset = <TData,>(
  table: Table<TData>,
  search: DataTableSearchConfig | undefined,
  filters: DataTableFiltersConfig | undefined,
) => {
  const isServerFiltered = Boolean(filters?.onFilterChange);
  const hasSearch = Boolean(search?.initialValue);
  const hasFilters = isServerFiltered
    ? Object.values(filters?.values ?? {}).some(isActiveValue)
    : table.getState().columnFilters.length > 0;

  const reset = () => {
    if (filters?.onClearAll) return filters.onClearAll();
    table.resetColumnFilters();
    if (hasSearch) search?.onDebouncedChange?.("");
  };

  return { canReset: hasSearch || hasFilters, reset };
};
