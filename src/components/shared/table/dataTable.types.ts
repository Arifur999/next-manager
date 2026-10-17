import type { PaginationMeta } from "@/types/api.types";
import type { ColumnDef, PaginationState, SortingState } from "@tanstack/react-table";
import type { LucideIcon } from "lucide-react";

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
  onDebouncedChange: (value: string) => void;
}

export interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  // Remembers which columns are hidden, per table, in this browser.
  tableId?: string;
  actions?: DataTableActions<TData>;
  toolbarAction?: React.ReactNode;
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
  pagination?: { state: PaginationState; onPaginationChange: (state: PaginationState) => void };
  search?: DataTableSearchConfig;
  meta?: PaginationMeta;
}
