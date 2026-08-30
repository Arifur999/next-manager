import { Badge } from "@/components/ui/badge"
import { formatUsd } from "@/lib/currency"
import { STATUS_TONE } from "@/components/shared/status/statusTone"
import type { IProject } from "@/types/agencio.types"
import { ColumnDef } from "@tanstack/react-table"

// Status carries meaning, so it gets colour rather than the same outline for
// all five: active is the working state, cancelled is a failure, the rest are
// neutral waypoints.

export const projectsColumns: ColumnDef<IProject>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: "Project",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate font-medium">{row.original.name}</p>
        <p className="truncate text-xs text-muted-foreground">{row.original.code}</p>
      </div>
    ),
  },
  {
    id: "client",
    header: "Client",
    enableSorting: false,
    cell: ({ row }) => (
      <span className="text-sm">{row.original.client?.name ?? "N/A"}</span>
    ),
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <span
        className={`rounded-md px-2 py-0.5 text-xs font-medium capitalize ${
          STATUS_TONE[row.original.status.category]
        }`}
      >
        {row.original.status.name}
      </span>
    ),
  },
  {
    id: "contract_value_usd",
    accessorKey: "contract_value_usd",
    header: "Contract value",
    cell: ({ row }) => (
      <span className="font-medium tabular-nums">{formatUsd(row.original.contract_value_usd)}</span>
    ),
  },
  {
    id: "tasks",
    header: "Work",
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5">
        <Badge variant="outline" className="text-xs">
          {row.original._count?.tasks ?? 0} tasks
        </Badge>
        <Badge variant="outline" className="text-xs">
          {row.original._count?.members ?? 0} on team
        </Badge>
      </div>
    ),
  },
]
