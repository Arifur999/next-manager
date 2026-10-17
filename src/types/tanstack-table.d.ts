import "@tanstack/react-table";
import type { DataTableActions } from "@/components/shared/table/dataTable.types";
import type { RowData } from "@tanstack/react-table";

// Per-column and per-table settings the shared DataTable understands, declared
// once so columns files and cells get type-checked `meta` without casting.
declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- TValue must stay to merge with the library's declaration.
  interface ColumnMeta<TData extends RowData, TValue> {
    // Plain-text name for the View menu and the CSV header when `header` is not a string.
    label?: string;
    // What the CSV export writes for this column; defaults to the accessor value.
    exportValue?: (row: TData) => string | number | boolean | null | undefined;
  }

  interface TableMeta<TData extends RowData> {
    // Read by the actions column's cell, so new handlers re-render the row
    // menu instead of remounting it.
    rowActions?: DataTableActions<TData>;
  }
}
