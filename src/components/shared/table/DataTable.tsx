"use client";

import Loader from "@/components/shared/Loader";
import { pageCountOf } from "@/types/api.types";
import { useSyncExternalStore } from "react";
import DataTableContent from "./DataTableContent";
import DataTablePagination from "./DataTablePagination";
import DataTableToolbar from "./DataTableToolbar";
import type { DataTableProps } from "./dataTable.types";
import { useDataTable } from "./useDataTable";

const subscribeToNothing = () => () => {};

const DataTable = <TData,>(props: DataTableProps<TData>) => {
  const { toolbarAction, emptyMessage, isLoading, isError = false, onRetry, pagination, search, meta } = props;
  const table = useDataTable(props);
  // False for the server render and hydration, true afterwards.
  const hasHydrated = useSyncExternalStore(subscribeToNothing, () => true, () => false);

  // The server render must not include the overlay, or the markup it produces
  // and the markup React expects on the client disagree.
  // A retry in flight is shown on the Retry button, not as an overlay on the error.
  const showLoadingOverlay = Boolean(isLoading) && hasHydrated && !isError;

  return (
    <div className="relative">
      {showLoadingOverlay && (
        // Sits over the rows instead of replacing them, so the table doesn't
        // collapse to a spinner and jump the page around on every refetch.
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Loader size={32} />
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        </div>
      )}

      <DataTableToolbar search={search} toolbarAction={toolbarAction} isLoading={isLoading} />

      <div className="font-condensed rounded-lg border">
        <DataTableContent
          table={table}
          emptyMessage={emptyMessage}
          isError={isError}
          isRetrying={Boolean(isLoading)}
          onRetry={onRetry}
        />

        {pagination && (
          <DataTablePagination
            table={table}
            totalPages={pageCountOf(meta)}
            totalRows={meta?.total}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
};

export default DataTable;
