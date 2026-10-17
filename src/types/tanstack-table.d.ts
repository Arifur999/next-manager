import "@tanstack/react-table";
import type { RowData } from "@tanstack/react-table";

// Per-column settings the shared DataTable understands, declared once so every
// columns file gets a type-checked `meta` without casting.
declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- TValue must stay to merge with the library's declaration.
  interface ColumnMeta<TData extends RowData, TValue> {
    // Plain-text name for the View menu when `header` is not a string.
    label?: string;
  }
}
