"use client";

import { Button } from "@/components/ui/button";
import { downloadCsv } from "@/lib/download";
import { toCsv } from "@/lib/table/csv";
import type { Table } from "@tanstack/react-table";
import { format } from "date-fns";
import { Download } from "lucide-react";
import { getColumnLabel } from "./columnLabel";
import { ACTIONS_COLUMN_ID } from "./columns/createActionsColumn";

// Exports every row the table currently holds (all filtered rows in memory,
// or the current page of a server-paged table) using the visible columns in
// their on-screen order.
const DataTableExportButton = <TData,>({ table, fileName }: { table: Table<TData>; fileName: string }) => {
  const handleExport = () => {
    const columns = table.getVisibleLeafColumns().filter((column) => column.id !== ACTIONS_COLUMN_ID);
    const headers = columns.map((column) => getColumnLabel(column));
    const rows = table.getPrePaginationRowModel().rows.map((row) =>
      columns.map((column) => {
        const exportValue = column.columnDef.meta?.exportValue;
        return exportValue ? exportValue(row.original) : row.getValue(column.id);
      }),
    );

    downloadCsv(toCsv(headers, rows), `${fileName}-${format(new Date(), "yyyy-MM-dd")}`);
  };

  return (
    <Button variant="outline" onClick={handleExport} title="Download the rows shown as a CSV file">
      <Download aria-hidden="true" />
      Export
    </Button>
  );
};

export default DataTableExportButton;
