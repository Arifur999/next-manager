"use client"

import {
  approveMemberAction,
  rejectMemberAction,
} from "@/app/(dashboardLayout)/admin/dashboard/team-management/_inviteAction"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { getAllUsers } from "@/services/user.services"
import type { IUser } from "@/types/user.types"
import { ROLE_LABELS } from "@/zod/user.validation"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { formatDistanceToNow, parseISO } from "date-fns"
import { UserCheck } from "lucide-react"
import { toast } from "sonner"

/**
 * People who joined through an invite and are waiting to be let in.
 *
 * Renders nothing at all when the queue is empty. It sits above the team table
 * and an empty card there would be a permanent piece of furniture teaching
 * everyone to look past that spot — which is the one place something needing
 * action will appear.
 *
 * Approving is what charges a seat, so the refusal an admin may hit here is
 * the plan limit, and the server names the plan in it.
 */

const PendingApprovals = () => {
  const queryClient = useQueryClient()

  const { data } = useQuery({
    queryKey: ["users", "status=pending"],
    queryFn: () => getAllUsers("status=pending"),
  })

  const pending = (data?.data ?? []) as IUser[]

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["users"] })
    void queryClient.invalidateQueries({ queryKey: ["activity"] })
  }

  const { mutate: approve, isPending: isApproving } = useMutation({
    mutationFn: (id: string) => approveMemberAction(id),
    onSuccess: (result) => {
      if (!result.success) {
        // "Starter includes 5 seats and all of them are in use" arrives here.
        toast.error(result.message || "Could not approve")
        return
      }
      toast.success("Approved — they can sign in now")
      refresh()
    },
  })

  const { mutate: reject, isPending: isRejecting } = useMutation({
    mutationFn: (id: string) => rejectMemberAction(id),
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.message || "Could not turn the request down")
        return
      }
      toast.success("Request turned down")
      refresh()
    },
  })

  if (pending.length === 0) return null

  const isBusy = isApproving || isRejecting

  return (
    <Card className="gap-0 overflow-hidden border-primary/40 p-0">
      <CardHeader className="border-b px-5 py-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <UserCheck className="size-4" aria-hidden="true" />
          {pending.length} waiting to join
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          They have an account and a password already, and cannot sign in until you
          approve. Approving uses a seat on your plan.
        </p>
      </CardHeader>

      <ul className="divide-y">
        {pending.map((person) => (
          <li
            key={person.id}
            className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{person.full_name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {person.email} · {ROLE_LABELS[person.role as keyof typeof ROLE_LABELS] ?? person.role}
                {person.created_at
                  ? ` · asked ${formatDistanceToNow(parseISO(person.created_at), { addSuffix: true })}`
                  : ""}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isBusy}
                onClick={() => reject(person.id)}
              >
                Turn down
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={isBusy}
                onClick={() => approve(person.id)}
              >
                Approve
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  )
}

export default PendingApprovals
