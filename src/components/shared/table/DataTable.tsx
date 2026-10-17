"use client";

import { pageCountOf } from "@/types/api.types";
import DataTableContent from "./DataTableContent";
import DataTablePagination from "./DataTablePagination";
import DataTableToolbar from "./DataTableToolbar";
import type { DataTableProps } from "./dataTable.types";
import { useDataTable } from "./useDataTable";

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

  return (
    <div>
      <DataTableToolbar search={search} toolbarAction={toolbarAction} isLoading={isLoading} />

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

        {pagination && (
          <DataTablePagination
            table={table}
            totalPages={pageCountOf(meta)}
            totalRows={meta?.total}
            isLoading={isFetching}
          />
        )}
      </div>
    </div>
  );
};

export default DataTable;
