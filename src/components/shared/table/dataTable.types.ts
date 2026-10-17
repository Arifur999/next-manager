import type { DateRangeValue } from "@/lib/table/filterFns";
import type { FilterOption } from "@/lib/table/filterOptions";
import type { PaginationMeta } from "@/types/api.types";
import type { ColumnDef, PaginationState, SortingState } from "@tanstack/react-table";
import type { LucideIcon } from "lucide-react";

export type { DateRangeValue };

export interface DataTableRowAction<TData> {
  label: string;
  icon?: LucideIcon;
  onClick: (row: TData) => void;
  destructive?: boolean;
  hidden?: (row: TData) => boolean;
}

// A handler that is undefined does not render its menu item.
export interface DataTableActions<TData> {
  onView?: (row: TData) => void;
  onEdit?: (row: TData) => void;
  onDelete?: (row: TData) => void;
  extra?: DataTableRowAction<TData>[];
}

export interface DataTableSearchConfig {
  initialValue?: string;
  placeholder?: string;
  debounceMs?: number;
  // Present: the caller searches (on the server). Absent: the table searches
  // the rows it holds.
  onDebouncedChange?: (value: string) => void;
}

export type { FilterOption as DataTableFilterOption } from "@/lib/table/filterOptions";

// In memory, `id` is the column the filter reads. Server-driven, it is the URL
// parameter (a date range uses `from` and `to` unless told otherwise).
export type DataTableFilterConfig =
  | { id: string; type: "single-select"; label: string; options: FilterOption[] }
  | { id: string; type: "multi-select"; label: string; options: FilterOption[] }
  | { id: string; type: "date-range"; label: string; fromKey?: string; toKey?: string };

export type DataTableFilterValue = string | string[] | DateRangeValue;
export type DataTableFilterValues = Record<string, DataTableFilterValue | undefined>;

export interface DataTableFiltersConfig {
  configs: DataTableFilterConfig[];
  // Present: the caller drives the filters (from the URL). Absent: the table
  // filters its rows in memory.
  values?: DataTableFilterValues;
  onFilterChange?: (filterId: string, value: DataTableFilterValue | undefined) => void;
  // Clears the caller's search as well as its filters, in one step.
  onClearAll?: () => void;
}

export interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  // Remembers which columns are hidden, per table, in this browser.
  tableId?: string;
  actions?: DataTableActions<TData>;
  toolbarAction?: React.ReactNode;
  // Shows an Export button; the downloaded file is named after it.
  exportFileName?: string;
  emptyMessage?: string;
  // First load (skeleton rows) vs background refetch (a progress bar, rows stay).
  // toTableQueryProps(query) fills these four from a useQuery result.
  isLoading?: boolean;
  isFetching?: boolean;
  /** The list request failed: show the error and Retry instead of the empty message. */
  isError?: boolean;
  onRetry?: () => void;
  // Presence of these two switches the table into server-driven mode.
  sorting?: { state: SortingState; onSortingChange: (state: SortingState) => void };
  // `replace` corrects the page without adding a history entry.
  pagination?: {
    state: PaginationState;
    onPaginationChange: (state: PaginationState, options?: { replace?: boolean }) => void;
  };
  search?: DataTableSearchConfig;
  filters?: DataTableFiltersConfig;
  meta?: PaginationMeta;
}
