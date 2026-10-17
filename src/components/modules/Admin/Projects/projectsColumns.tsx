import StatusBadge from "@/components/shared/status/StatusBadge"
import { Badge } from "@/components/ui/badge"
import { formatUsd } from "@/lib/currency"
import { plural } from "@/lib/text"
import type { IProject } from "@/types/project.types"
import { ColumnDef } from "@tanstack/react-table"

const CONTRACT_VALUE = "contract_value_usd"

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
    meta: { exportValue: (project) => project.client?.name },
    enableSorting: false,
    cell: ({ row }) => (
      <span className="text-sm">{row.original.client?.name ?? "N/A"}</span>
    ),
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    meta: { exportValue: (project) => project.status.name },
    // Coloured by what the status means, so a renamed column keeps its look.
    cell: ({ row }) => <StatusBadge category={row.original.status.category} label={row.original.status.name} />,
  },
  {
    id: CONTRACT_VALUE,
    accessorKey: CONTRACT_VALUE,
    header: "Contract value",
    cell: ({ row }) => {
      const value = row.original.contract_value_usd
      return value === undefined ? null : <span className="font-medium tabular-nums">{formatUsd(value)}</span>
    },
  },
  {
    id: "tasks",
    header: "Work",
    meta: { exportValue: (project) => project._count?.tasks ?? 0 },
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5">
        <Badge variant="outline" className="text-xs">
          {plural(row.original._count?.tasks ?? 0, "task")}
        </Badge>
        <Badge variant="outline" className="text-xs">
          {row.original._count?.members ?? 0} on team
        </Badge>
      </div>
    ),
  },
]

const projectsColumnsWithoutMoney = projectsColumns.filter((column) => column.id !== CONTRACT_VALUE)

/**
 * The columns for the rows the API sent. It leaves the contract value out for
 * operations, so the table leaves the column out too, rather than showing
 * a column of blanks or "$0" that reads as a deal worth nothing.
 */
export const projectsColumnsFor = (projects: IProject[]): ColumnDef<IProject>[] =>
  projects.some((project) => project.contract_value_usd !== undefined) ? projectsColumns : projectsColumnsWithoutMoney
