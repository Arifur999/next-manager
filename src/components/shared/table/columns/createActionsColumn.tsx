"use client";

import type { ColumnDef } from "@tanstack/react-table";
import DataTableRowActions from "../DataTableRowActions";
import type { DataTableActions } from "../dataTable.types";

export const ACTIONS_COLUMN_ID = "actions";

// DataTable appends this when `actions` is passed; a columns file never
// defines its own actions column.
export const createActionsColumn = <TData,>(actions: DataTableActions<TData>): ColumnDef<TData> => ({
  id: ACTIONS_COLUMN_ID,
  header: "Actions",
  enableSorting: false,
  enableHiding: false,
  cell: ({ row }) => <DataTableRowActions row={row.original} actions={actions} />,
});
