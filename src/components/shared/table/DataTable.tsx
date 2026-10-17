"use client";

import { pageCountOf } from "@/types/api.types";
import DataTableContent from "./DataTableContent";
import DataTablePagination from "./DataTablePagination";
import DataTableToolbar from "./DataTableToolbar";
import type { DataTableProps } from "./dataTable.types";
import { DEFAULT_PAGE_SIZE, useDataTable } from "./useDataTable";

const DataTable = <TData,>(props: DataTableProps<TData>) => {
  const {
    toolbarAction,
    emptyMessage,
    isLoading = false,
    isFetching = false,
    isError = false,
    onRetry,
    pagination,
    search,
    meta,
  } = props;
  const table = useDataTable(props);
  const isRefreshing = isFetching && !isLoading;

  const totalRows = pagination ? (meta?.total ?? 0) : table.getPrePaginationRowModel().rows.length;
  const totalPages = pagination ? pageCountOf(meta) : table.getPageCount();
  // Lists that fit on one page at the smallest size never show the pager.
  const showPagination = !isLoading && !isError && totalRows > DEFAULT_PAGE_SIZE;

  // A new search starts again from page 1. Server-driven tables reset the page themselves.
  const searchFromFirstPage = search && {
    ...search,
    onDebouncedChange: (value: string) => {
      if (!pagination) table.setPageIndex(0);
      search.onDebouncedChange(value);
    },
  };

  return (
    <div>
      <DataTableToolbar search={searchFromFirstPage} toolbarAction={toolbarAction} isLoading={isLoading} />

      <div className="font-condensed relative overflow-hidden rounded-lg border">
        {/* Rows stay on screen during a refetch; only this bar says it is running. */}
        {isRefreshing && !isError && (
          <div className="absolute inset-x-0 top-0 z-10 h-0.5 animate-pulse bg-primary" role="progressbar" aria-label="Refreshing" />
        )}

        <DataTableContent
          table={table}
          emptyMessage={emptyMessage}
          isLoading={isLoading}
          isError={isError}
          isRetrying={isFetching}
          onRetry={onRetry}
        />

        {showPagination && (
          <DataTablePagination table={table} totalPages={totalPages} totalRows={totalRows} isLoading={isFetching} />
        )}
      </div>
    </div>
  );
};

export default DataTable;
