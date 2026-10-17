"use client";

import { pageCountOf } from "@/types/api.types";
import {
  functionalUpdate,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { createActionsColumn } from "./columns/createActionsColumn";
import type { DataTableProps } from "./dataTable.types";

// The TanStack instance behind DataTable. Passing `sorting` or `pagination`
// hands that concern to the caller (server-driven); otherwise it stays in memory.
export const useDataTable = <TData,>({ data, columns, actions, sorting, pagination, meta }: DataTableProps<TData>) => {
  // The actions column is appended here rather than declared per feature, so
  // every table in the app has the same row menu in the same place.
  const tableColumns = actions ? [...columns, createActionsColumn(actions)] : columns;

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table is intentionally used here and React Compiler already skips memoization for this hook.
  return useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualSorting: Boolean(sorting),
    manualPagination: Boolean(pagination),
    pageCount: pagination ? Math.max(pageCountOf(meta) ?? 0, 0) : undefined,
    state: {
      ...(sorting ? { sorting: sorting.state } : {}),
      ...(pagination ? { pagination: pagination.state } : {}),
    },
    // Callers only ever receive a plain value, never TanStack's updater function.
    onSortingChange: sorting ? (updater) => sorting.onSortingChange(functionalUpdate(updater, sorting.state)) : undefined,
    onPaginationChange: pagination
      ? (updater) => pagination.onPaginationChange(functionalUpdate(updater, pagination.state))
      : undefined,
  });
};
