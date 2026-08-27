import { Badge } from "@/components/ui/badge"
import { formatUsd } from "@/lib/currency"
import type { IProject, ProjectStatus } from "@/types/agencio.types"
import { ColumnDef } from "@tanstack/react-table"

// Status carries meaning, so it gets colour rather than the same outline for
// all five: active is the working state, cancelled is a failure, the rest are
// neutral waypoints.
const STATUS_TONE: Record<ProjectStatus, string> = {
  planning: "bg-muted text-muted-foreground",
  active: "bg-chart-3/15 text-chart-3",
  on_hold: "bg-chart-4/15 text-chart-4",
  completed: "bg-chart-1/12 text-chart-1",
  cancelled: "bg-destructive/12 text-destructive",
}

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
          STATUS_TONE[row.original.status]
        }`}
      >
        {row.original.status.replace(/_/g, " ")}
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
