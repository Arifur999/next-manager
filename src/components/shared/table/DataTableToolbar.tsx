"use client";

import DataTableSearch from "./DataTableSearch";
import type { DataTableSearchConfig } from "./dataTable.types";

interface DataTableToolbarProps {
  search?: DataTableSearchConfig;
  toolbarAction?: React.ReactNode;
  isLoading?: boolean;
}

const DataTableToolbar = ({ search, toolbarAction, isLoading }: DataTableToolbarProps) => {
  if (!search && !toolbarAction) return null;

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

      {toolbarAction && <div className="ml-auto shrink-0">{toolbarAction}</div>}
    </div>
  );
};

export default DataTableToolbar;
