"use client";

import DataTableContent from "./DataTableContent";
import DataTablePagination from "./DataTablePagination";
import DataTableToolbar from "./DataTableToolbar";
import { useDataTableReset } from "./useDataTableReset";
import type { DataTableProps } from "./dataTable.types";
import { DEFAULT_PAGE_SIZE, useDataTable } from "./useDataTable";

const DataTable = <TData,>(props: DataTableProps<TData>) => {
  const {
    toolbarAction,
    exportFileName,
    emptyMessage,
    isLoading = false,
    isFetching = false,
    isError = false,
    onRetry,
    pagination,
    search,
    filters,
    meta,
  } = props;
  const table = useDataTable(props);
  const isRefreshing = isFetching && !isLoading;

  const totalRows = pagination ? (meta?.total ?? 0) : table.getPrePaginationRowModel().rows.length;
  // Lists that fit on one page at the smallest size never show the pager.
  const showPagination = !isLoading && !isError && totalRows > DEFAULT_PAGE_SIZE;

  const { onDebouncedChange: searchOnServer } = search ?? {};
  // Searching the rows in memory needs no callback; a caller's search starts
  // again from page 1 (server-driven tables reset the page themselves).
  const activeSearch = search && {
    ...search,
    initialValue: searchOnServer ? search.initialValue : String(table.getState().globalFilter ?? ""),
    onDebouncedChange: (value: string) => {
      if (!searchOnServer) return table.setGlobalFilter(value);
      if (!pagination) table.setPageIndex(0);
      searchOnServer(value);
    },
  };
  const { canReset, reset } = useDataTableReset(table, activeSearch, filters);

  return (
    <div>
      <DataTableToolbar
        table={table}
        search={activeSearch}
        filters={filters}
        canReset={canReset}
        onReset={reset}
        toolbarAction={toolbarAction}
        exportFileName={exportFileName}
      />

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
          canReset={canReset}
          onReset={reset}
        />

        {showPagination && (
          <DataTablePagination table={table} totalRows={totalRows} />
        )}
      </div>
    </div>
  );
};

export default DataTable;
