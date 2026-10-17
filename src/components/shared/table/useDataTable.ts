"use client";

import { usePersistentState } from "@/hooks/usePersistentState";
import { createSmartColumnFilterFn } from "@/lib/table/filterFns";
import {
  functionalUpdate,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
  type PaginationState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { z } from "zod";
import { createActionsColumn } from "./columns/createActionsColumn";
import type { DataTableProps } from "./dataTable.types";

export const DEFAULT_PAGE_SIZE = 10;

const ALL_COLUMNS_VISIBLE: VisibilityState = {};
const columnVisibilitySchema = z.record(z.string(), z.boolean());

// The TanStack instance behind DataTable. Passing `sorting` or `pagination`
// hands that concern to the caller (server-driven); otherwise it stays in memory.
export const useDataTable = <TData,>({
  data,
  columns,
  tableId,
  actions,
  sorting,
  pagination,
  filters,
  meta,
}: DataTableProps<TData>) => {
  const [localSorting, setLocalSorting] = useState<SortingState>([]);
  const [localPagination, setLocalPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: DEFAULT_PAGE_SIZE });
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnVisibility, setColumnVisibility] = usePersistentState(
    tableId ? `data-table:${tableId}:columns` : undefined,
    ALL_COLUMNS_VISIBLE,
    columnVisibilitySchema,
  );

  // The actions column is appended here rather than declared per feature, so
  // every table has the same row menu in the same place. It is built once: a
  // new column object per render would remount every row menu and close it.
  const actionsColumn = useMemo(() => createActionsColumn<TData>(), []);
  const hasActions = Boolean(actions);
  const tableColumns = useMemo(
    () => (hasActions ? [...columns, actionsColumn] : columns),
    [columns, hasActions, actionsColumn],
  );
  const defaultColumn = useMemo(() => ({ filterFn: createSmartColumnFilterFn<TData>() }), []);

  // Narrowing the rows always starts again from page 1.
  const resetToFirstPage = () =>
    setLocalPagination((current) => (current.pageIndex === 0 ? current : { ...current, pageIndex: 0 }));

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table is intentionally used here and React Compiler already skips memoization for this hook.
  const table = useReactTable({
    data,
    columns: tableColumns,
    meta: { rowActions: actions },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getPaginationRowModel: getPaginationRowModel(),
    defaultColumn,
    // Sorting one page of a server-paged list would only mislead, so such a
    // table sorts only when the server sorts for it.
    enableSorting: !pagination || Boolean(sorting),
    manualSorting: Boolean(sorting),
    manualFiltering: Boolean(filters?.onFilterChange),
    manualPagination: Boolean(pagination),
    // Off: TanStack schedules that reset during render, which under StrictMode
    // can fire before the table has mounted. The clamp below covers shrinking data.
    autoResetPageIndex: false,
    pageCount: pagination ? Math.max(meta?.totalPages ?? 0, 0) : undefined,
    state: {
      sorting: sorting?.state ?? localSorting,
      pagination: pagination?.state ?? localPagination,
      columnFilters,
      globalFilter,
      columnVisibility,
    },
    // Never pass a handler as undefined: TanStack spreads options over its own
    // defaults, so an undefined handler replaces its state updater and the
    // feature silently stops working.
    onSortingChange: (updater) =>
      sorting ? sorting.onSortingChange(functionalUpdate(updater, sorting.state)) : setLocalSorting(updater),
    onPaginationChange: (updater) =>
      pagination
        ? pagination.onPaginationChange(functionalUpdate(updater, pagination.state))
        : setLocalPagination(updater),
    onColumnFiltersChange: (updater) => {
      setColumnFilters(updater);
      resetToFirstPage();
    },
    // TanStack passes undefined when it resets the filter.
    onGlobalFilterChange: (value: string | undefined) => {
      setGlobalFilter(value ?? "");
      resetToFirstPage();
    },
    globalFilterFn: "includesString",
    onColumnVisibilityChange: setColumnVisibility,
  });

  // When the rows shrink (a delete, a narrower search), do not stay parked on
  // a page that no longer exists. Adjusting state during render is React's
  // pattern for this; it re-renders before painting.
  const lastPageIndex = Math.max(table.getPageCount() - 1, 0);
  if (!pagination && localPagination.pageIndex > lastPageIndex) {
    setLocalPagination({ ...localPagination, pageIndex: lastPageIndex });
  }

  return table;
};
