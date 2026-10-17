"use client"

import MonthGrid from "@/components/shared/calendar/MonthGrid"
import ErrorState from "@/components/shared/state/ErrorState"
import LoadingBlock from "@/components/shared/state/LoadingBlock"
import { Card } from "@/components/ui/card"
import type { ILeaveRequest } from "@/types/people.types"
import { useQuery } from "@tanstack/react-query"
import { eachDayOfInterval, parseISO } from "date-fns"
import { leaveRequestsListQuery } from "@/queries/people.queries"

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
  const requestList = useQuery(leaveRequestsListQuery())

  const requests = (requestList.data?.data ?? []).filter(
    (request) => request.status === "approved"
  )

  const days: Day[] = requests.flatMap((request) =>
    eachDayOfInterval({
      start: parseISO(request.from_date),
      end: parseISO(request.to_date),
    }).map((date) => ({ request, date }))
  )

  // Without this, a failed or unfinished load drew "Nobody is away this month."
  if (requestList.isError && !requestList.data) {
    return (
      <Card>
        <ErrorState
          message="The leave calendar did not load."
          onRetry={() => void requestList.refetch()}
          isRetrying={requestList.isFetching}
        />
      </Card>
    )
  }
  if (requestList.isLoading) return <LoadingBlock height="h-96" rounded />

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
