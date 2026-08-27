import DateCell from "@/components/shared/cell/DateCell"
import StatusBadgeCell from "@/components/shared/cell/StatusBadgeCell"
import type { IClient } from "@/types/agencio.types"
import { ColumnDef } from "@tanstack/react-table"

export const clientsColumns: ColumnDef<IClient>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: "Client",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate font-medium">{row.original.name}</p>
        {row.original.company && (
          <p className="truncate text-xs text-muted-foreground">{row.original.company}</p>
        )}
      </div>
    ),
  },
  {
    id: "email",
    accessorKey: "email",
    header: "Contact",
    enableSorting: false,
    cell: ({ row }) => (
      <div className="min-w-0 text-sm">
        <p className="truncate">{row.original.email || "N/A"}</p>
        {row.original.phone && (
          <p className="truncate text-xs text-muted-foreground">{row.original.phone}</p>
        )}
      </div>
    ),
  },
  {
    id: "country",
    accessorKey: "country",
    header: "Country",
    enableSorting: false,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{row.original.country || "N/A"}</span>
    ),
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadgeCell status={row.original.status} />,
  },
  {
    id: "created_at",
    accessorKey: "created_at",
    header: "Client since",
    cell: ({ row }) => <DateCell date={row.original.created_at} formatString="MMM dd, yyyy" />,
  },
]
