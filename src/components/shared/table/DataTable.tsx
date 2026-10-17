"use client";

import { pageCountOf } from "@/types/api.types";
import { useEffect, useRef } from "react";
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
    exportRows,
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
  const isPastFirstPage = table.getState().pagination.pageIndex > 0;
  // Lists that fit on one page at the smallest size never show the pager,
  // unless a later page is open and the way back must stay visible.
  const showPagination = !isLoading && !isError && (totalRows > DEFAULT_PAGE_SIZE || isPastFirstPage);

  // A server page that stopped existing (its last row was deleted) moves to the
  // last real page, replacing the URL so Back never lands on the empty page.
  const serverPageCount = pagination && meta ? Math.max(pageCountOf(meta) ?? 1, 1) : undefined;
  useEffect(() => {
    if (!pagination || serverPageCount === undefined || isFetching) return;
    if (pagination.state.pageIndex < serverPageCount) return;
    pagination.onPaginationChange({ ...pagination.state, pageIndex: serverPageCount - 1 }, { replace: true });
  }, [pagination, serverPageCount, isFetching]);

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
  // Reset and Clear filters vanish once used, so focus moves to the search box
  // instead of falling back to the page.
  const searchInputRef = useRef<HTMLInputElement>(null);
  const resetAndFocusSearch = () => {
    reset();
    searchInputRef.current?.focus();
  };

  return (
    <div>
      <DataTableToolbar
        table={table}
        searchInputRef={searchInputRef}
        search={activeSearch}
        filters={filters}
        canReset={canReset}
        onReset={resetAndFocusSearch}
        toolbarAction={toolbarAction}
        exportFileName={exportFileName}
        exportRows={exportRows}
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
          onReset={resetAndFocusSearch}
        />

        {showPagination && (
          <DataTablePagination table={table} totalRows={totalRows} />
        )}
      </div>
    </div>
  );
};

export default DataTable;
