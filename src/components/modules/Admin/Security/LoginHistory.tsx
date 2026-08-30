"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { getLoginEvents } from "@/services/agencio.services"
import type { ILoginEvent } from "@/types/agencio.types"
import { useQuery } from "@tanstack/react-query"
import { format, formatDistanceToNow, parseISO } from "date-fns"
import { ShieldAlert, ShieldCheck } from "lucide-react"
import { useState } from "react"

/**
 * Who tried to sign in, and whether it worked.
 *
 * Only this agency's own attempts. An attempt at an address with no account
 * belongs to no company and is not here — which is a property of how the row is
 * written rather than something this screen filters out.
 *
 * The failure count is deliberately not affected by the filter chips. It is the
 * number somebody opens this page to notice, and narrowing the list must not be
 * able to hide it.
 */

const ALL = "__all__"

const FILTERS = [
  { value: ALL, label: "Everything" },
  { value: "false", label: "Failed only" },
  { value: "true", label: "Successful only" },
]

const LoginHistory = () => {
  const [filter, setFilter] = useState(ALL)

  const query = filter === ALL ? "" : `success=${filter}`

  const { data, isLoading } = useQuery({
    queryKey: ["login-events", query],
    queryFn: () => getLoginEvents(query || undefined),
  })

  const events = (data?.data ?? []) as ILoginEvent[]
  const failedLately = data?.meta?.failed_last_24h ?? 0
  const retention = data?.meta?.retention_days ?? 90

  return (
    <div className="space-y-4">
      <Card className="gap-0 overflow-hidden p-0">
        <CardHeader className="space-y-3 border-b px-5 py-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="text-base">Sign-in attempts</CardTitle>
              <p className="text-sm text-muted-foreground">
                {failedLately === 0 ? (
                  "Nothing failed in the last day."
                ) : (
                  <>
                    {/* Icon and words, never colour alone. */}
                    <ShieldAlert className="mr-1 inline size-4" aria-hidden="true" />
                    <span className="text-foreground">
                      {failedLately} failed attempt{failedLately === 1 ? "" : "s"} in the last
                      day
                    </span>
                    {" — counted across everything, not just what is filtered below."}
                  </>
                )}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {FILTERS.map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  size="sm"
                  variant={option.value === filter ? "default" : "outline"}
                  onClick={() => setFilter(option.value)}
                  aria-pressed={option.value === filter}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>

        {isLoading && events.length === 0 ? (
          <div className="h-40 animate-pulse bg-muted/40" />
        ) : events.length === 0 ? (
          <p className="flex flex-col items-center gap-2 px-6 py-12 text-center text-sm text-muted-foreground">
            <ShieldCheck className="size-7" aria-hidden="true" />
            {filter === ALL ? "Nothing recorded yet." : "Nothing matches that."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[46rem] text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="px-5 py-2.5 font-medium">When</th>
                  <th className="px-5 py-2.5 font-medium">Who</th>
                  <th className="px-5 py-2.5 font-medium">From</th>
                  <th className="px-5 py-2.5 font-medium">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {events.map((event) => (
                  <tr key={event.id}>
                    <td className="whitespace-nowrap px-5 py-3">
                      <p>{formatDistanceToNow(parseISO(event.created_at), { addSuffix: true })}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(parseISO(event.created_at), "d MMM, HH:mm")}
                      </p>
                    </td>

                    <td className="px-5 py-3">
                      {/* The name when we know it, the address always. A failure
                          on an account that was since removed still has to say
                          which address was tried. */}
                      <p>{event.user?.full_name ?? event.email}</p>
                      {event.user && (
                        <p className="text-xs text-muted-foreground">{event.email}</p>
                      )}
                    </td>

                    <td className="px-5 py-3">
                      <p className="font-mono text-xs">{event.ip || "unknown"}</p>
                      {event.user_agent && (
                        <p className="max-w-64 truncate text-xs text-muted-foreground">
                          {event.user_agent}
                        </p>
                      )}
                    </td>

                    <td className="px-5 py-3">
                      <Badge variant={event.success ? "secondary" : "destructive"}>
                        {event.success ? "signed in" : "refused"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="border-t px-5 py-3 text-xs text-muted-foreground">
          {/* Said plainly rather than buried: this page stores addresses. */}
          Sign-in times and IP addresses are kept for {retention} days, then deleted. The
          password that was tried is never recorded, successful or not.
        </div>
      </Card>
    </div>
  )
}

export default LoginHistory
