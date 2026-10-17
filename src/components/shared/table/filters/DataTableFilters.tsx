"use client";

import { isDateRange } from "@/lib/table/filterFns";
import type { Table } from "@tanstack/react-table";
import type { DataTableFilterConfig, DataTableFiltersConfig, DataTableFilterValue } from "../dataTable.types";
import DataTableDateRangeFilter from "./DataTableDateRangeFilter";
import DataTableFacetedFilter from "./DataTableFacetedFilter";

const toSelection = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string");
  if (typeof value === "string" && value) return [value];
  return [];
};

// Each filter reads and writes either the caller's values (server-driven, from
// the URL) or the matching column's filter state (in memory, where TanStack's
// faceting also gives a row count per option).
const DataTableFilters = <TData,>({ table, filters }: { table: Table<TData>; filters: DataTableFiltersConfig }) => {
  const { onFilterChange } = filters;

  const getValue = (config: DataTableFilterConfig): unknown =>
    onFilterChange ? filters.values?.[config.id] : table.getColumn(config.id)?.getFilterValue();

  const setValue = (config: DataTableFilterConfig, value: DataTableFilterValue | undefined) => {
    if (onFilterChange) return onFilterChange(config.id, value);
    table.getColumn(config.id)?.setFilterValue(value);
  };

  return (
    <>
      {filters.configs.map((config) => {
        if (config.type === "date-range") {
          const value = getValue(config);
          return (
            <DataTableDateRangeFilter
              key={config.id}
              title={config.label}
              value={isDateRange(value) ? value : undefined}
              onChange={(range) => setValue(config, range)}
            />
          );
        }

        const multiple = config.type === "multi-select";
        return (
          <DataTableFacetedFilter
            key={config.id}
            title={config.label}
            options={config.options}
            multiple={multiple}
            selected={toSelection(getValue(config))}
            facets={onFilterChange ? undefined : table.getColumn(config.id)?.getFacetedUniqueValues()}
            onChange={(values) => {
              // A server-driven single choice is a plain string in the URL; in
              // memory a filter is always a list.
              if (onFilterChange && !multiple) return setValue(config, values[0]);
              setValue(config, values.length > 0 ? values : undefined);
            }}
          />
        );
      })}
    </>
  );
};

export default DataTableFilters;
