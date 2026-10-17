"use client";

import ErrorState from "@/components/shared/state/ErrorState";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { flexRender, type Header, type Table as TanStackTable } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import DataTableSkeleton from "./DataTableSkeleton";

interface DataTableContentProps<TData> {
  table: TanStackTable<TData>;
  emptyMessage?: string;
  isLoading: boolean;
  isError: boolean;
  isRetrying: boolean;
  onRetry?: () => void;
}

const SortIcon = ({ direction }: { direction: false | "asc" | "desc" }) => {
  if (direction === "asc") return <ArrowUp className="ml-1 h-4 w-4" />;
  if (direction === "desc") return <ArrowDown className="ml-1 h-4 w-4" />;
  return <ArrowUpDown className="ml-1 h-4 w-4 opacity-50" />;
};

const renderHeader = <TData,>(header: Header<TData, unknown>) => {
  const content = flexRender(header.column.columnDef.header, header.getContext());
  if (!header.column.getCanSort()) return content;

  return (
    <Button
      variant="ghost"
      className="h-auto cursor-pointer p-0 font-semibold hover:bg-transparent hover:text-inherit focus-visible:ring-0"
      onClick={header.column.getToggleSortingHandler()}
    >
      {content}
      <SortIcon direction={header.column.getIsSorted()} />
    </Button>
  );
};

const DataTableContent = <TData,>({
  table,
  emptyMessage,
  isLoading,
  isError,
  isRetrying,
  onRetry,
}: DataTableContentProps<TData>) => {
  const rows = table.getRowModel().rows;
  const columnCount = table.getVisibleLeafColumns().length;

  const renderBody = () => {
    if (isLoading) return <DataTableSkeleton columnCount={columnCount} />;

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
          <TableCell colSpan={columnCount} className="h-24 text-center">
            {emptyMessage || "No data available."}
          </TableCell>
        </TableRow>
      );
    }

    return rows.map((row) => (
      <TableRow key={row.id}>
        {row.getVisibleCells().map((cell) => (
          <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
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
              <TableHead key={header.id}>{header.isPlaceholder ? null : renderHeader(header)}</TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>

      <TableBody>{renderBody()}</TableBody>
    </Table>
  );
};

export default DataTableContent;
