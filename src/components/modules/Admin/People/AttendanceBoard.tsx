"use client"

import { clockAction } from "@/app/(dashboardLayout)/dashboard/attendance/_action"
import EmptyState from "@/components/shared/state/EmptyState"
import LoadingBlock from "@/components/shared/state/LoadingBlock"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { getAttendance } from "@/services/agencio.services"
import type { IAttendance } from "@/types/agencio.types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { format, parseISO } from "date-fns"
import { CalendarCheck, LogIn, LogOut } from "lucide-react"
import { toast } from "sonner"

/**
 * Who was here.
 *
 * Being present is not the same as logging hours — somebody can be in all day
 * and log nothing against a task. This screen answers the first question only,
 * and the timesheet answers the second.
 *
 * A row with no check-out is somebody still in, not a gap in the data, and it
 * says so rather than showing a blank.
 */

const hoursBetween = (from: string | null, to: string | null) => {
  if (!from || !to) return null
  const minutes = (parseISO(to).getTime() - parseISO(from).getTime()) / 60000
  return minutes > 0 ? (minutes / 60).toFixed(1) : null
}

const AttendanceBoard = () => {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ["attendance"],
    queryFn: () => getAttendance(),
  })

  const rows = (data?.data ?? []) as IAttendance[]

  const { mutate: clock, isPending } = useMutation({
    mutationFn: () => clockAction(),
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.message || "Could not record that")
        return
      }
      // The server says which happened — asking the client to guess is how the
      // button ends up claiming the opposite of what was stored.
      toast.success(result.message)
      void queryClient.invalidateQueries({ queryKey: ["attendance"] })
    },
  })

  const today = format(new Date(), "yyyy-MM-dd")
  const mineToday = rows.find((row) => format(parseISO(row.date), "yyyy-MM-dd") === today)
  const stillIn = Boolean(mineToday?.check_in && !mineToday?.check_out)

  return (
    <Card className="gap-0 overflow-hidden p-0">
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 border-b px-5 py-4">
        <div>
          <CardTitle className="text-base">Attendance</CardTitle>
          <p className="text-sm text-muted-foreground">
            Who was here, and for how long. Hours against a task are on the timesheet —
            these are different questions and stay separate.
          </p>
        </div>

        <Button onClick={() => clock()} disabled={isPending} variant={stillIn ? "outline" : "default"}>
          {stillIn ? <LogOut className="size-4" /> : <LogIn className="size-4" />}
          {stillIn ? "Check out" : "Check in"}
        </Button>
      </CardHeader>

      {isLoading && rows.length === 0 ? (
        <LoadingBlock />
      ) : rows.length === 0 ? (
        <EmptyState icon={CalendarCheck}>Nothing recorded yet.</EmptyState>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[42rem] text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="px-5 py-2.5 font-medium">Date</th>
                <th className="px-5 py-2.5 font-medium">Who</th>
                <th className="px-5 py-2.5 font-medium">In</th>
                <th className="px-5 py-2.5 font-medium">Out</th>
                <th className="px-5 py-2.5 text-right font-medium">Hours</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((row) => {
                const hours = hoursBetween(row.check_in, row.check_out)

                return (
                  <tr key={row.id}>
                    <td className="whitespace-nowrap px-5 py-3">
                      {format(parseISO(row.date), "d MMM yyyy")}
                    </td>
                    <td className="px-5 py-3">
                      {row.user.full_name}
                      {/* "They clocked in" and "somebody wrote it down" are
                          different claims, so the second one is labelled. */}
                      {row.source === "admin" && (
                        <Badge variant="outline" className="ml-2 text-[10px]">
                          recorded for them
                        </Badge>
                      )}
                    </td>
                    <td className="px-5 py-3 tabular-nums">
                      {row.check_in ? format(parseISO(row.check_in), "HH:mm") : "—"}
                    </td>
                    <td className="px-5 py-3">
                      {row.check_out ? (
                        <span className="tabular-nums">
                          {format(parseISO(row.check_out), "HH:mm")}
                        </span>
                      ) : row.check_in ? (
                        <span className="text-muted-foreground">still in</span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums">{hours ?? "—"}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}

export default AttendanceBoard
