"use client";

import type { ColumnDef } from "@tanstack/react-table";
import DataTableRowActions from "../DataTableRowActions";

export const ACTIONS_COLUMN_ID = "actions";

// DataTable appends this when `actions` is passed; a columns file never
// defines its own actions column. The handlers come from the table's meta, so
// the column itself never changes and an open row menu survives a re-render.
export const createActionsColumn = <TData,>(): ColumnDef<TData> => ({
  id: ACTIONS_COLUMN_ID,
  header: "Actions",
  enableSorting: false,
  enableHiding: false,
  cell: ({ row, table }) => {
    const actions = table.options.meta?.rowActions;
    return actions ? <DataTableRowActions row={row.original} actions={actions} /> : null;
  },
});
