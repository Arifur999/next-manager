"use client"

import { revokeAgencyInviteAction } from "@/app/(dashboardLayout)/platform/_agencyAction"
import ConfirmDialog from "@/components/shared/dialog/ConfirmDialog"
import EmptyState from "@/components/shared/state/EmptyState"
import PanelState from "@/components/shared/state/PanelState"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { useActionMutation } from "@/hooks/useActionMutation"
import { queryKeys } from "@/lib/queryKeys"
import { agencyInvitesQuery } from "@/queries/platform.queries"
import type { IAgencyInvite } from "@/types/platform.types"
import { useQuery } from "@tanstack/react-query"
import { format, isPast, parseISO } from "date-fns"
import { Send, Trash2 } from "lucide-react"
import { useState } from "react"

const statusOf = (invite: IAgencyInvite) => {
  if (invite.used_at) return { label: "opened", tone: "secondary" as const }
  if (invite.revoked_at) return { label: "revoked", tone: "outline" as const }
  if (isPast(parseISO(invite.expires_at))) return { label: "expired", tone: "outline" as const }
  return { label: "waiting", tone: "default" as const }
}

// Every agency invite sent, and the one thing to do with a waiting one: revoke it.
const AgencyInviteList = () => {
  const [revoking, setRevoking] = useState<IAgencyInvite | null>(null)

  const invitesList = useQuery(agencyInvitesQuery())

  const invites = invitesList.data?.data ?? []

  const { run: revokeInvite, isPending: isRevoking } = useActionMutation({
    action: revokeAgencyInviteAction,
    successMessage: "Invite revoked — the link stops working immediately",
    invalidateKeys: [queryKeys.agencyInvites.all],
    refresh: false,
  })

  const handleRevoke = async () => {
    if (revoking && (await revokeInvite(revoking.id))) setRevoking(null)
  }

  return (
    <Card className="gap-0 overflow-hidden p-0">
      <CardHeader className="border-b px-5 py-4">
        <CardTitle className="text-base">Invites</CardTitle>
        <p className="text-sm text-muted-foreground">
          Nothing appears on the customers list until an invite is opened.
        </p>
      </CardHeader>

      <PanelState
        query={invitesList}
        errorMessage="The invites did not load."
        isEmpty={invites.length === 0}
        empty={<EmptyState icon={Send}>No agencies invited yet.</EmptyState>}
      >
        <ul className="divide-y">
          {invites.map((invite) => {
            const state = statusOf(invite)

            return (
              <li
                key={invite.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5"
              >
                <div className="min-w-48">
                  <p className="font-medium">{invite.company_name || "unnamed until opened"}</p>
                  <p className="text-xs text-muted-foreground">
                    {invite.email}
                    {invite.plan ? ` · ${invite.plan.name}` : " · no plan"}
                    {invite.trial_days > 0 ? ` · ${invite.trial_days}-day trial` : " · no trial"}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    {invite.used_at
                      ? `opened ${format(parseISO(invite.used_at), "d MMM")}`
                      : `expires ${format(parseISO(invite.expires_at), "d MMM")}`}
                  </span>
                  <Badge variant={state.tone}>{state.label}</Badge>
                  {state.label === "waiting" && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setRevoking(invite)}
                      aria-label={`Revoke the invite to ${invite.email}`}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      </PanelState>

      <ConfirmDialog
        open={Boolean(revoking)}
        onOpenChange={(open) => {
          if (!open) setRevoking(null)
        }}
        title="Revoke this invite?"
        description={
          revoking && (
            <>
              The link sent to <span className="font-medium text-foreground">{revoking.email}</span>{" "}
              stops working immediately. Nothing was created from it, so nothing else changes.
            </>
          )
        }
        variant="destructive"
        confirmLabel="Revoke"
        pendingLabel="Revoking..."
        isPending={isRevoking}
        onConfirm={() => void handleRevoke()}
      />
    </Card>
  )
}

export default AgencyInviteList
