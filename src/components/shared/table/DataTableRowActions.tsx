"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import type { DataTableActions } from "./dataTable.types";

interface DataTableRowActionsProps<TData> {
  row: TData;
  actions: DataTableActions<TData>;
}

const DataTableRowActions = <TData,>({ row, actions }: DataTableRowActionsProps<TData>) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        {actions.onView && <DropdownMenuItem onClick={() => actions.onView?.(row)}>View</DropdownMenuItem>}
        {actions.onEdit && <DropdownMenuItem onClick={() => actions.onEdit?.(row)}>Edit</DropdownMenuItem>}
        {actions.onDelete && <DropdownMenuItem onClick={() => actions.onDelete?.(row)}>Delete</DropdownMenuItem>}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DataTableRowActions;
