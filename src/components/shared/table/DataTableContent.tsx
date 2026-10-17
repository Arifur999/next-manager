"use client";

import ErrorState from "@/components/shared/state/ErrorState";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { columnPriorityClass } from "@/lib/table/columnPriority";
import { flexRender, type Column, type Header, type Table as TanStackTable } from "@tanstack/react-table";
import type { ReactNode } from "react";
import DataTableColumnHeader from "./DataTableColumnHeader";
import DataTableEmpty from "./DataTableEmpty";
import DataTableSkeleton from "./DataTableSkeleton";

interface DataTableContentProps<TData> {
  table: TanStackTable<TData>;
  emptyMessage?: string;
  emptyAction?: ReactNode;
  isLoading: boolean;
  isError: boolean;
  isRetrying: boolean;
  onRetry?: () => void;
  canReset: boolean;
  onReset: () => void;
}

// A plain-string header gets the sort and hide menu; a custom one renders as written.
const renderHeader = <TData,>(header: Header<TData, unknown>) => {
  const content = header.column.columnDef.header;
  if (typeof content === "string") return <DataTableColumnHeader column={header.column} title={content} />;
  return flexRender(content, header.getContext());
};

const priorityClassOf = <TData,>(column: Column<TData, unknown>) =>
  columnPriorityClass(column.columnDef.meta?.priority);

const DataTableContent = <TData,>({
  table,
  emptyMessage,
  emptyAction,
  isLoading,
  isError,
  isRetrying,
  onRetry,
  canReset,
  onReset,
}: DataTableContentProps<TData>) => {
  const rows = table.getRowModel().rows;
  const visibleColumns = table.getVisibleLeafColumns();
  const columnCount = visibleColumns.length;

  const renderBody = () => {
    if (isLoading) return <DataTableSkeleton cellClassNames={visibleColumns.map(priorityClassOf)} />;

    if (isError) {
      return (
        <TableRow>
          <TableCell colSpan={columnCount} className="p-0">
            <ErrorState onRetry={onRetry} isRetrying={isRetrying} />
          </TableCell>
        </TableRow>
      );
    }

    if (rows.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={columnCount} className="p-0">
            <DataTableEmpty
              message={emptyMessage || "No data available."}
              action={emptyAction}
              canReset={canReset}
              onReset={onReset}
            />
          </TableCell>
        </TableRow>
      );
    }

    return rows.map((row) => (
      <TableRow key={row.id}>
        {row.getVisibleCells().map((cell) => (
          <TableCell key={cell.id} className={priorityClassOf(cell.column)}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        ))}
      </TableRow>
    ));
  };

  return (
    <Table aria-busy={isLoading || isRetrying}>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id} className={priorityClassOf(header.column)}>
                {header.isPlaceholder ? null : renderHeader(header)}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>

      <TableBody>{renderBody()}</TableBody>
    </Table>
  );
};

export default DataTableContent;
