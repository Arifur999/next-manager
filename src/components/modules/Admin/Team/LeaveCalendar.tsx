"use client"

import MonthGrid from "@/components/shared/calendar/MonthGrid"
import { getLeaveRequests } from "@/services/agencio.services"
import type { ILeaveRequest } from "@/types/agencio.types"
import { useQuery } from "@tanstack/react-query"
import { eachDayOfInterval, parseISO } from "date-fns"

/**
 * Who is away, and when.
 *
 * The same grid the task calendar uses — one calendar, two callers, so a month
 * looks the same wherever it is drawn.
 *
 * APPROVED leave only. A request still waiting is not an absence yet, and
 * planning around one that gets turned down is worse than not seeing it: the
 * work would have been given away for nothing.
 *
 * A request spanning several days is expanded into one entry per day, because
 * the question this screen answers is "is she here on Thursday" — a single
 * marker on the first day would leave Thursday looking free.
 */

type Day = { request: ILeaveRequest; date: Date }

const LeaveCalendar = () => {
  const { data } = useQuery({
    queryKey: ["leave-requests"],
    queryFn: () => getLeaveRequests(),
  })

  const requests = ((data?.data ?? []) as ILeaveRequest[]).filter(
    (request) => request.status === "approved"
  )

  const days: Day[] = requests.flatMap((request) =>
    eachDayOfInterval({
      start: parseISO(request.from_date),
      end: parseISO(request.to_date),
    }).map((date) => ({ request, date }))
  )

  return (
    <MonthGrid
      items={days}
      dateOf={(day) => day.date}
      emptyLabel="Nobody is away this month."
      renderItem={(day) => (
        <div
          title={`${day.request.user.full_name} · ${day.request.leave_type.name}`}
          className="truncate rounded bg-chart-4/15 px-1.5 py-0.5 text-[11px] text-chart-4"
        >
          {day.request.user.full_name}
        </div>
      )}
    />
  )
}

export default LeaveCalendar
