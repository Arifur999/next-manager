"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Table } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight } from "lucide-react";

type DataTablePaginationProps<TData> = {
  table: Table<TData>;
  totalPages?: number;
  totalRows?: number;
  isLoading?: boolean;
};

const PAGE_SIZES = [10, 20, 50, 100];

const DataTablePagination = <TData,>({
  table,
  totalPages,
  totalRows,
  isLoading,
}: DataTablePaginationProps<TData>) => {
  const { pageIndex, pageSize } = table.getState().pagination;
  const lastPage = totalPages ?? table.getPageCount();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3">
      <p className="text-sm text-muted-foreground">
        {typeof totalRows === "number" ? `${totalRows} total` : null}
      </p>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Rows</span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger className="h-8 w-[72px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZES.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <span className="text-sm text-muted-foreground">
          Page {pageIndex + 1} of {Math.max(lastPage, 1)}
        </span>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => table.previousPage()}
            disabled={isLoading || pageIndex === 0}
          >
            <span className="sr-only">Previous page</span>
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => table.nextPage()}
            disabled={isLoading || pageIndex + 1 >= lastPage}
          >
            <span className="sr-only">Next page</span>
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DataTablePagination;
