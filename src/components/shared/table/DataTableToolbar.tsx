"use client";

import { Button } from "@/components/ui/button";
import type { Table } from "@tanstack/react-table";
import { X } from "lucide-react";
import DataTableExportButton from "./DataTableExportButton";
import DataTableSearch from "./DataTableSearch";
import DataTableViewOptions from "./DataTableViewOptions";
import type { DataTableFiltersConfig, DataTableSearchConfig } from "./dataTable.types";
import DataTableFilters from "./filters/DataTableFilters";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  search?: DataTableSearchConfig;
  filters?: DataTableFiltersConfig;
  toolbarAction?: React.ReactNode;
  exportFileName?: string;
  exportRows?: () => Promise<TData[]>;
  canReset: boolean;
  onReset: () => void;
}

const DataTableToolbar = <TData,>({
  table,
  searchInputRef,
  search,
  filters,
  toolbarAction,
  exportFileName,
  exportRows,
  canReset,
  onReset,
}: DataTableToolbarProps<TData>) => {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {search && (
          <DataTableSearch
            inputRef={searchInputRef}
            value={search.initialValue ?? ""}
            placeholder={search.placeholder}
            debounceMs={search.debounceMs}
            onDebouncedChange={(value) => search.onDebouncedChange?.(value)}
          />
        )}

        {filters && <DataTableFilters table={table} filters={filters} />}

        {canReset && (
          <Button variant="ghost" onClick={onReset}>
            Reset
            <X aria-hidden="true" />
          </Button>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {exportFileName && <DataTableExportButton table={table} fileName={exportFileName} fetchRows={exportRows} />}
        <DataTableViewOptions table={table} />
        {toolbarAction}
      </div>
    </div>
  );
};

export default DataTableToolbar;
