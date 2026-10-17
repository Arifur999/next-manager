"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Column } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, EyeOff, X } from "lucide-react";

interface DataTableColumnHeaderProps<TData, TValue> {
  column: Column<TData, TValue>;
  title: string;
}

const SortIcon = ({ direction }: { direction: false | "asc" | "desc" }) => {
  if (direction === "asc") return <ArrowUp className="size-4" aria-hidden="true" />;
  if (direction === "desc") return <ArrowDown className="size-4" aria-hidden="true" />;
  return <ArrowUpDown className="size-4 opacity-50" aria-hidden="true" />;
};

// Every plain-string `header` renders through this, so a columns file writes
// `header: "Amount"` and gets sorting and hiding from one menu.
const DataTableColumnHeader = <TData, TValue>({ column, title }: DataTableColumnHeaderProps<TData, TValue>) => {
  const canSort = column.getCanSort();
  const canHide = column.getCanHide();

  if (!canSort && !canHide) return <span>{title}</span>;

  const sorted = column.getIsSorted();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="-ml-2 h-8 gap-1 px-2 font-semibold data-[state=open]:bg-muted"
          aria-label={`${title} column options`}
        >
          {title}
          {canSort && <SortIcon direction={sorted} />}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start">
        {canSort && (
          <>
            <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
              <ArrowUp aria-hidden="true" /> Ascending
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
              <ArrowDown aria-hidden="true" /> Descending
            </DropdownMenuItem>
            {sorted && (
              <DropdownMenuItem onClick={() => column.clearSorting()}>
                <X aria-hidden="true" /> Clear sort
              </DropdownMenuItem>
            )}
          </>
        )}
        {canSort && canHide && <DropdownMenuSeparator />}
        {canHide && (
          <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
            <EyeOff aria-hidden="true" /> Hide column
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DataTableColumnHeader;
