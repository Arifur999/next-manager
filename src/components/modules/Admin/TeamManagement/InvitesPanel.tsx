"use client"

import {
  createInviteAction,
  revokeInviteAction,
} from "@/app/(dashboardLayout)/admin/dashboard/team-management/_inviteAction"
import InviteLinkPanel from "@/components/shared/InviteLinkPanel"
import ConfirmDialog from "@/components/shared/dialog/ConfirmDialog"
import EmptyState from "@/components/shared/state/EmptyState"
import PanelState from "@/components/shared/state/PanelState"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useActionMutation } from "@/hooks/useActionMutation"
import type { IInviteMail } from "@/types/common.types"
import type { ITeamInvite } from "@/types/people.types"
import { useQuery } from "@tanstack/react-query"
import { format, isPast, parseISO } from "date-fns"
import { MailPlus, Trash2 } from "lucide-react"
import { useState } from "react"
import { invitesQuery } from "@/queries/people.queries"
import { queryKeys } from "@/lib/queryKeys"

// Inviting operations members only; other roles are added on the Members tab. The
// link can be read just once (only its hash is stored), so it stays until dismissed.

const statusOf = (invite: ITeamInvite) => {
  if (invite.used_at) return { label: "used", tone: "secondary" as const }
  if (invite.revoked_at) return { label: "revoked", tone: "outline" as const }
  if (isPast(parseISO(invite.expires_at))) return { label: "expired", tone: "outline" as const }
  return { label: "waiting", tone: "default" as const }
}

const InvitesPanel = () => {
  const [email, setEmail] = useState("")
  const [freshLink, setFreshLink] = useState<string | null>(null)
  const [mailed, setMailed] = useState<IInviteMail | null>(null)
  const [revoking, setRevoking] = useState<ITeamInvite | null>(null)

  const inviteList = useQuery(invitesQuery())

  const invites = inviteList.data?.data ?? []

  // No toast: the link appearing below the form is the confirmation.
  const { run: createLink, isPending } = useActionMutation({
    action: createInviteAction,
    successMessage: false,
    invalidateKeys: [queryKeys.teamInvites.all],
    refresh: false,
    onSuccess: (result) => {
      if (!result.success) return
      setFreshLink(result.data.join_url)
      setMailed(result.data.email)
      setEmail("")
    },
  })

  const { run: revokeInvite, isPending: isRevoking } = useActionMutation({
    action: revokeInviteAction,
    successMessage: "Invite revoked — the link stops working immediately",
    invalidateKeys: [queryKeys.teamInvites.all],
    refresh: false,
  })

  const confirmRevoke = async () => {
    if (revoking && (await revokeInvite(revoking.id))) setRevoking(null)
  }

  return (
    <div className="space-y-6">
      <Card className="gap-0 p-0">
        <CardHeader className="border-b px-5 py-4">
          <CardTitle className="text-base">Invite an operations member</CardTitle>
          <p className="text-sm text-muted-foreground">
            They choose their own password and land in the approval queue. The link works
            once, expires in seven days, and only for the address you enter.
          </p>
        </CardHeader>

        <form
          className="flex flex-wrap items-end gap-3 px-5 py-4"
          onSubmit={(event) => {
            event.preventDefault()
            if (!email.trim()) return
            void createLink({ email })
          }}
        >
          <div className="min-w-56 flex-1 space-y-1.5">
            <Label htmlFor="invite-email">Their email</Label>
            <Input
              id="invite-email"
              type="email"
              autoComplete="off"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="colleague@example.com"
              disabled={isPending}
            />
          </div>

          <Button type="submit" disabled={isPending || !email.trim()}>
            <MailPlus className="size-4" />
            {isPending ? "Creating..." : "Create link"}
          </Button>
        </form>

        {freshLink && (
          <InviteLinkPanel
            key={freshLink}
            link={freshLink}
            mail={mailed}
            onDone={() => {
              setFreshLink(null)
              setMailed(null)
            }}
          />
        )}
      </Card>

      <Card className="gap-0 overflow-hidden p-0">
        <CardHeader className="border-b px-5 py-4">
          <CardTitle className="text-base">Invites</CardTitle>
          <p className="text-sm text-muted-foreground">
            Revoking one that has not been used stops the link immediately.
          </p>
        </CardHeader>

        <PanelState
          query={inviteList}
          errorMessage="Invites did not load."
          isEmpty={invites.length === 0}
          empty={<EmptyState icon={MailPlus}>No invites sent yet.</EmptyState>}
        >
          <ul className="divide-y">
            {invites.map((invite) => {
              const state = statusOf(invite)
              const live = state.label === "waiting"

              return (
                <li
                  key={invite.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{invite.email}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {invite.used_at
                        ? `joined ${format(parseISO(invite.used_at), "d MMM")}`
                        : `expires ${format(parseISO(invite.expires_at), "d MMM yyyy")}`}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant={state.tone}>{state.label}</Badge>
                    {live && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isRevoking}
                        onClick={() => setRevoking(invite)}
                      >
                        <Trash2 className="size-3.5" />
                        <span className="sr-only">Revoke</span>
                      </Button>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        </PanelState>
      </Card>

      <ConfirmDialog
        open={revoking !== null}
        onOpenChange={(open) => {
          if (!open) setRevoking(null)
        }}
        title="Revoke this invite?"
        description={
          <>
            The link sent to <span className="font-medium text-foreground">{revoking?.email}</span>{" "}
            stops working immediately. You can create a new invite for them afterwards.
          </>
        }
        variant="destructive"
        confirmLabel="Revoke"
        pendingLabel="Revoking..."
        isPending={isRevoking}
        onConfirm={() => void confirmRevoke()}
      />
    </div>
  )
}

export default InvitesPanel
