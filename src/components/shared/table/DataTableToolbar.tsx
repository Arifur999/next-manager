"use client";

import type { Table } from "@tanstack/react-table";
import DataTableSearch from "./DataTableSearch";
import DataTableViewOptions from "./DataTableViewOptions";
import type { DataTableSearchConfig } from "./dataTable.types";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  search?: DataTableSearchConfig;
  toolbarAction?: React.ReactNode;
  isLoading?: boolean;
}

const DataTableToolbar = <TData,>({ table, search, toolbarAction, isLoading }: DataTableToolbarProps<TData>) => {
  return (
    <div className="mb-4 flex flex-wrap items-start gap-3">
      {search && (
        <DataTableSearch
          key={search.initialValue ?? ""}
          initialValue={search.initialValue}
          placeholder={search.placeholder}
          debounceMs={search.debounceMs}
          onDebouncedChange={search.onDebouncedChange}
          isLoading={isLoading}
        />
      )}

      <div className="ml-auto flex shrink-0 items-center gap-2">
        <DataTableViewOptions table={table} />
        {toolbarAction}
      </div>
    </div>
  );
};

export default DataTableToolbar;
