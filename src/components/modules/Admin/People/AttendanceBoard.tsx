"use client"

import { clockAction } from "@/app/(dashboardLayout)/dashboard/attendance/_action"
import RecordAttendanceCard from "@/components/modules/Admin/People/RecordAttendanceCard"
import { attendanceColumns } from "@/components/modules/Admin/People/attendanceColumns"
import DataTable from "@/components/shared/table/DataTable"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { useActionMutation } from "@/hooks/useActionMutation"
import { toTableQueryProps } from "@/lib/table/queryProps"
import { useQuery } from "@tanstack/react-query"
import { format, parseISO } from "date-fns"
import { LogIn, LogOut } from "lucide-react"
import { attendanceQuery } from "@/queries/people.queries"
import { queryKeys } from "@/lib/queryKeys"
import { todayIsoDate } from "@/lib/dates"

// Who was here, which is not the hours logged against a task: that is the
// timesheet. `canRecord` comes from the page, as `canDecide` does on the leave board.

const AttendanceBoard = ({ canRecord = false }: { canRecord?: boolean }) => {
  const attendanceList = useQuery(attendanceQuery())

  const days = attendanceList.data?.data ?? []

  // No successMessage: the server says which happened. Guessing here is how the
  // button ends up claiming the opposite of what was stored.
  const { run: clock, isPending } = useActionMutation({
    action: clockAction,
    invalidateKeys: [queryKeys.attendance.all],
    refresh: false,
  })

  const today = todayIsoDate()
  const mineToday = days.find((day) => format(parseISO(day.date), "yyyy-MM-dd") === today)
  const stillIn = Boolean(mineToday?.check_in && !mineToday?.check_out)

  const table = (
    <Card className="gap-0 overflow-hidden p-0">
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 border-b px-5 py-4">
        <div>
          <CardTitle className="text-base">Attendance</CardTitle>
          <p className="text-sm text-muted-foreground">
            Who was here, and for how long. Hours against a task are on the timesheet —
            these are different questions and stay separate.
          </p>
        </div>

        <Button onClick={() => void clock(undefined)} disabled={isPending} variant={stillIn ? "outline" : "default"}>
          {stillIn ? <LogOut className="size-4" /> : <LogIn className="size-4" />}
          {stillIn ? "Check out" : "Check in"}
        </Button>
      </CardHeader>

      <div className="p-4">
        <DataTable
          data={days}
          columns={attendanceColumns}
          tableId="attendance"
          exportFileName="attendance"
          search={{ placeholder: "Search by name..." }}
          {...toTableQueryProps(attendanceList)}
          emptyMessage="Nothing recorded yet."
        />
      </div>
    </Card>
  )

  if (!canRecord) return table

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
      {table}
      <RecordAttendanceCard />
    </div>
  )
}

export default AttendanceBoard
