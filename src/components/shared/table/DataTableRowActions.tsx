"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import type { DataTableActions } from "./dataTable.types";

interface DataTableRowActionsProps<TData> {
  row: TData;
  actions: DataTableActions<TData>;
}

// Order: View, Edit, extra actions, then everything destructive (extra
// destructive actions, then Delete) behind a separator.
const DataTableRowActions = <TData,>({ row, actions }: DataTableRowActionsProps<TData>) => {
  const visibleExtras = (actions.extra ?? []).filter((action) => !action.hidden?.(row));
  const safeExtras = visibleExtras.filter((action) => !action.destructive);
  const destructiveExtras = visibleExtras.filter((action) => action.destructive);
  const hasSafeItems = Boolean(actions.onView || actions.onEdit || safeExtras.length > 0);
  const hasDestructiveItems = Boolean(actions.onDelete || destructiveExtras.length > 0);

  if (!hasSafeItems && !hasDestructiveItems) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="data-[state=open]:bg-muted" aria-label="Open row actions">
          <MoreHorizontal aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48">
        {actions.onView && (
          <DropdownMenuItem onClick={() => actions.onView?.(row)}>
            <Eye aria-hidden="true" /> View
          </DropdownMenuItem>
        )}
        {actions.onEdit && (
          <DropdownMenuItem onClick={() => actions.onEdit?.(row)}>
            <Pencil aria-hidden="true" /> Edit
          </DropdownMenuItem>
        )}
        {safeExtras.map(({ label, icon: Icon, onClick }) => (
          <DropdownMenuItem key={label} onClick={() => onClick(row)}>
            {Icon && <Icon aria-hidden="true" />} {label}
          </DropdownMenuItem>
        ))}

        {hasSafeItems && hasDestructiveItems && <DropdownMenuSeparator />}

        {destructiveExtras.map(({ label, icon: Icon, onClick }) => (
          <DropdownMenuItem key={label} variant="destructive" onClick={() => onClick(row)}>
            {Icon && <Icon aria-hidden="true" />} {label}
          </DropdownMenuItem>
        ))}
        {actions.onDelete && (
          <DropdownMenuItem variant="destructive" onClick={() => actions.onDelete?.(row)}>
            <Trash2 aria-hidden="true" /> Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DataTableRowActions;
