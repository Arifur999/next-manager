"use client"

import {
  approveMemberAction,
  rejectMemberAction,
} from "@/app/(dashboardLayout)/admin/dashboard/team-management/_inviteAction"
import ConfirmDialog from "@/components/shared/dialog/ConfirmDialog"
import ErrorState from "@/components/shared/state/ErrorState"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { useActionMutation } from "@/hooks/useActionMutation"
import type { IUser } from "@/types/user.types"
import { ROLE_LABELS, isAssignableRole } from "@/zod/user.validation"
import { useQuery } from "@tanstack/react-query"
import { formatDistanceToNow, parseISO } from "date-fns"
import { UserCheck } from "lucide-react"
import { useState } from "react"
import { usersListQuery } from "@/queries/people.queries"
import { queryKeys } from "@/lib/queryKeys"

// Each decision changes the member list and lands in the activity feed.
const DECISION_KEYS = [queryKeys.users.all, queryKeys.activity.all]

// People who joined through an invite, waiting to be let in. Renders nothing when
// nobody waits, so the spot above the team table only appears when it needs action.

const PendingApprovals = () => {
  const [rejecting, setRejecting] = useState<IUser | null>(null)

  const pendingList = useQuery(usersListQuery("status=pending"))

  const pending = pendingList.data?.data ?? []

  // A full plan is refused as "Starter includes 5 seats and all of them are in use".
  const { run: approve, isPending: isApproving } = useActionMutation({
    action: approveMemberAction,
    successMessage: "Approved — they can sign in now",
    invalidateKeys: DECISION_KEYS,
    refresh: false,
  })

  const { run: reject, isPending: isRejecting } = useActionMutation({
    action: rejectMemberAction,
    successMessage: "Request turned down",
    invalidateKeys: DECISION_KEYS,
    refresh: false,
  })

  const confirmReject = async () => {
    if (rejecting && (await reject(rejecting.id))) setRejecting(null)
  }

  // A failed load must not look like an empty queue: somebody may be waiting.
  if (pendingList.isError && pending.length === 0) {
    return (
      <Card className="gap-0 overflow-hidden p-0">
        <ErrorState
          message="Join requests did not load."
          onRetry={() => void pendingList.refetch()}
          isRetrying={pendingList.isFetching}
        />
      </Card>
    )
  }

  if (pending.length === 0) return null

  const isBusy = isApproving || isRejecting

  return (
    <>
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
                  {person.email} · {isAssignableRole(person.role) ? ROLE_LABELS[person.role] : person.role}
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
                  onClick={() => setRejecting(person)}
                >
                  Turn down
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={isBusy}
                  onClick={() => void approve(person.id)}
                >
                  Approve
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <ConfirmDialog
        open={rejecting !== null}
        onOpenChange={(open) => {
          if (!open) setRejecting(null)
        }}
        title="Turn down this request?"
        description={
          <>
            <span className="font-medium text-foreground">{rejecting?.full_name}</span> will not be
            able to sign in, and the request is recorded as turned down.
          </>
        }
        variant="destructive"
        confirmLabel="Turn down"
        pendingLabel="Turning down..."
        isPending={isRejecting}
        onConfirm={() => void confirmReject()}
      />
    </>
  )
}

export default PendingApprovals
