import DateCell from "@/components/shared/cell/DateCell"
import { Badge } from "@/components/ui/badge"
import { toDate } from "@/lib/dates"
import type { IAttendance } from "@/types/people.types"
import type { ColumnDef } from "@tanstack/react-table"
import { format, parseISO } from "date-fns"

const hoursBetween = (from: string | null, to: string | null) => {
  if (!from || !to) return null
  const minutes = (parseISO(to).getTime() - parseISO(from).getTime()) / 60000
  return minutes > 0 ? (minutes / 60).toFixed(1) : null
}

// The CSV gets the clock time the cell shows, not the stored instant.
const clockTime = (instant: string | null) => (instant ? format(parseISO(instant), "HH:mm") : "")

const CheckOutCell = ({ day }: { day: IAttendance }) => {
  if (day.check_out) {
    return (
      <span className="tabular-nums">
        <DateCell date={day.check_out} formatString="HH:mm" />
      </span>
    )
  }
  if (day.check_in) return <span className="text-muted-foreground">still in</span>
  return "—"
}

export const attendanceColumns: ColumnDef<IAttendance>[] = [
  {
    id: "date",
    accessorKey: "date",
    header: "Date",
    meta: { exportValue: (day) => format(toDate(day.date), "yyyy-MM-dd") },
    cell: ({ row }) => <DateCell date={row.original.date} formatString="d MMM yyyy" />,
  },
  {
    id: "who",
    accessorFn: (day) => day.user.full_name,
    header: "Who",
    meta: {
      exportValue: (day) => (day.source === "admin" ? `${day.user.full_name} (recorded for them)` : day.user.full_name),
    },
    cell: ({ row }) => (
      <>
        {row.original.user.full_name}
        {/* "They clocked in" and "somebody wrote it down" are different
            claims, so the second one is labelled. */}
        {row.original.source === "admin" && (
          <Badge variant="outline" className="ml-2 text-[10px]">
            recorded for them
          </Badge>
        )}
      </>
    ),
  },
  {
    id: "check_in",
    accessorKey: "check_in",
    header: "In",
    enableSorting: false,
    meta: { exportValue: (day) => clockTime(day.check_in) },
    cell: ({ row }) => (
      <span className="tabular-nums">
        {row.original.check_in ? <DateCell date={row.original.check_in} formatString="HH:mm" /> : "—"}
      </span>
    ),
  },
  {
    id: "check_out",
    accessorKey: "check_out",
    header: "Out",
    enableSorting: false,
    meta: { exportValue: (day) => clockTime(day.check_out) },
    cell: ({ row }) => <CheckOutCell day={row.original} />,
  },
  {
    id: "hours",
    accessorFn: (day) => hoursBetween(day.check_in, day.check_out),
    header: "Hours",
    enableSorting: false,
    cell: ({ row }) => (
      <span className="tabular-nums">{hoursBetween(row.original.check_in, row.original.check_out) ?? "—"}</span>
    ),
  },
]
