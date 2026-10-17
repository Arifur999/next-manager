"use client";

import { Button } from "@/components/ui/button";
import { downloadCsv } from "@/lib/download";
import { toCsv } from "@/lib/table/csv";
import type { Column, Table } from "@tanstack/react-table";
import { format } from "date-fns";
import { Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { getColumnLabel } from "./columnLabel";
import { ACTIONS_COLUMN_ID } from "./columns/createActionsColumn";

interface DataTableExportButtonProps<TData> {
  table: Table<TData>;
  fileName: string;
  // Present on server-paged tables, which hold only one page.
  fetchRows?: () => Promise<TData[]>;
}

const exportValueOf = <TData,>(column: Column<TData, unknown>, row: TData, index: number) => {
  const exportValue = column.columnDef.meta?.exportValue;
  return exportValue ? exportValue(row) : column.accessorFn?.(row, index);
};

// Exports the visible columns, in their on-screen order, for every row: the
// rows held in memory (filtered and sorted), or every matching row fetched
// for a server-paged table.
const DataTableExportButton = <TData,>({ table, fileName, fetchRows }: DataTableExportButtonProps<TData>) => {
  const [isExporting, setIsExporting] = useState(false);

  const loadRows = async () => {
    if (!fetchRows) return table.getPrePaginationRowModel().rows.map((row) => row.original);
    setIsExporting(true);
    try {
      return await fetchRows();
    } finally {
      setIsExporting(false);
    }
  };

  const handleExport = async () => {
    const columns = table.getVisibleLeafColumns().filter((column) => column.id !== ACTIONS_COLUMN_ID);
    let rows: TData[];
    try {
      rows = await loadRows();
    } catch {
      toast.error("The export did not download. Try again.");
      return;
    }

    const headers = columns.map((column) => getColumnLabel(column));
    const body = rows.map((row, index) => columns.map((column) => exportValueOf(column, row, index)));
    downloadCsv(toCsv(headers, body), `${fileName}-${format(new Date(), "yyyy-MM-dd")}`);
  };

  return (
    <Button
      variant="outline"
      onClick={() => void handleExport()}
      disabled={isExporting}
      title="Download every row in this view as a CSV file"
    >
      <Download aria-hidden="true" />
      {isExporting ? "Exporting..." : "Export"}
    </Button>
  );
};

export default DataTableExportButton;
