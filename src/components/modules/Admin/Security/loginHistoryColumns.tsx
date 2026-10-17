import RelativeTime from "@/components/shared/RelativeTime"
import { Badge } from "@/components/ui/badge"
import { toDate } from "@/lib/dates"
import type { ILoginEvent } from "@/types/workspace.types"
import type { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"

const resultLabel = (event: ILoginEvent) => (event.success ? "signed in" : "refused")

const ipAddress = (event: ILoginEvent) => event.ip || "unknown"

export const loginHistoryColumns: ColumnDef<ILoginEvent>[] = [
  {
    id: "when",
    accessorKey: "created_at",
    header: "When",
    cell: ({ row }) => (
      <>
        <p>
          <RelativeTime value={row.original.created_at} />
        </p>
        <p className="text-xs text-muted-foreground">{format(toDate(row.original.created_at), "d MMM, HH:mm")}</p>
      </>
    ),
  },
  {
    id: "who",
    accessorFn: (event) => event.user?.full_name ?? event.email,
    header: "Who",
    enableSorting: false,
    meta: { exportValue: (event) => (event.user ? `${event.user.full_name} (${event.email})` : event.email) },
    cell: ({ row }) => (
      <>
        {/* The name when we know it, the address always. A failure on an
            account that was since removed still has to say which address was tried. */}
        <p>{row.original.user?.full_name ?? row.original.email}</p>
        {row.original.user && <p className="text-xs text-muted-foreground">{row.original.email}</p>}
      </>
    ),
  },
  {
    id: "from",
    accessorKey: "ip",
    header: "From",
    enableSorting: false,
    meta: { exportValue: (event) => (event.user_agent ? `${ipAddress(event)} (${event.user_agent})` : ipAddress(event)) },
    cell: ({ row }) => (
      <>
        <p className="font-mono text-xs">{ipAddress(row.original)}</p>
        {row.original.user_agent && (
          <p className="max-w-64 truncate text-xs text-muted-foreground">{row.original.user_agent}</p>
        )}
      </>
    ),
  },
  {
    id: "result",
    accessorFn: resultLabel,
    header: "Result",
    enableSorting: false,
    cell: ({ row }) => (
      <Badge variant={row.original.success ? "secondary" : "destructive"}>{resultLabel(row.original)}</Badge>
    ),
  },
]
