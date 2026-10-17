"use client"

import { revokeAgencyInviteAction } from "@/app/(dashboardLayout)/platform/_agencyAction"
import {
  AGENCY_INVITE_STATE_LABEL,
  AGENCY_INVITE_STATES,
  agencyInviteState,
  type AgencyInviteState,
} from "@/components/modules/Platform/agencyInviteState"
import ShowMoreButton from "@/components/modules/Platform/ShowMoreButton"
import { useShowMore } from "@/components/modules/Platform/useShowMore"
import ConfirmDialog from "@/components/shared/dialog/ConfirmDialog"
import EmptyState from "@/components/shared/state/EmptyState"
import PanelState from "@/components/shared/state/PanelState"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useActionMutation } from "@/hooks/useActionMutation"
import { queryKeys } from "@/lib/queryKeys"
import { agencyInvitesQuery } from "@/queries/platform.queries"
import type { IAgencyInvite } from "@/types/platform.types"
import { useQuery } from "@tanstack/react-query"
import { format, parseISO } from "date-fns"
import { Ban, Send } from "lucide-react"
import { useState } from "react"

const PAGE_SIZE = 10
const ALL = "all"

const STATE_TONE: Record<AgencyInviteState, "default" | "secondary" | "outline"> = {
  waiting: "default",
  opened: "secondary",
  expired: "outline",
  revoked: "outline",
}

// The name on the invite, else a note on who names it.
const inviteTitle = (invite: IAgencyInvite) => {
  if (invite.company_name) return invite.company_name
  if (invite.used_at) return "Named by the owner"
  return "Named by the owner when they open it"
}

const InviteRow = ({ invite, onRevoke }: { invite: IAgencyInvite; onRevoke: (invite: IAgencyInvite) => void }) => {
  const state = agencyInviteState(invite)

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
      <div className="min-w-48">
        <p className="font-medium">{inviteTitle(invite)}</p>
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
        <Badge variant={STATE_TONE[state]}>{AGENCY_INVITE_STATE_LABEL[state]}</Badge>
        {state === "waiting" && (
          <Button type="button" size="sm" variant="outline" onClick={() => onRevoke(invite)}>
            <Ban className="size-3.5" aria-hidden="true" />
            Revoke
          </Button>
        )}
      </div>
    </li>
  )
}

// Every agency invite sent, narrowed by state, and the one thing to do with a waiting one: revoke it.
const AgencyInviteList = () => {
  const [revoking, setRevoking] = useState<IAgencyInvite | null>(null)
  const [stateFilter, setStateFilter] = useState<AgencyInviteState | typeof ALL>(ALL)

  const invitesList = useQuery(agencyInvitesQuery())
  const invites = invitesList.data?.data ?? []
  const matching = stateFilter === ALL ? invites : invites.filter((invite) => agencyInviteState(invite) === stateFilter)
  const { visible, remaining, showMore, reset } = useShowMore(matching, PAGE_SIZE)
  const waiting = invites.filter((invite) => agencyInviteState(invite) === "waiting").length

  const { run: revokeInvite, isPending: isRevoking } = useActionMutation({
    action: revokeAgencyInviteAction,
    successMessage: "Invite revoked. The link no longer works.",
    invalidateKeys: [queryKeys.agencyInvites.all],
    refresh: false,
  })

  const handleRevoke = async () => {
    if (revoking && (await revokeInvite(revoking.id))) setRevoking(null)
  }

  return (
    <Card className="gap-0 overflow-hidden p-0">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
        <div>
          <CardTitle className="text-base">Sent invites</CardTitle>
          {/* Holds its height while the list loads, so nothing below it jumps. */}
          <p className="min-h-5 text-sm text-muted-foreground">
            {invitesList.data && `${invites.length} sent · ${waiting} waiting to be opened`}
          </p>
        </div>

        <Select
          value={stateFilter}
          onValueChange={(value) => {
            setStateFilter(AGENCY_INVITE_STATES.find((state) => state === value) ?? ALL)
            reset()
          }}
        >
          <SelectTrigger className="w-40" aria-label="Show invites that are">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All invites</SelectItem>
            {AGENCY_INVITE_STATES.map((state) => (
              <SelectItem key={state} value={state}>
                {AGENCY_INVITE_STATE_LABEL[state]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>

      <PanelState
        query={invitesList}
        errorMessage="The invites did not load."
        isEmpty={matching.length === 0}
        empty={
          <EmptyState icon={Send}>
            {invites.length === 0 ? "No agencies invited yet." : "No invites in that state."}
          </EmptyState>
        }
      >
        <ul className="divide-y">
          {visible.map((invite) => (
            <InviteRow key={invite.id} invite={invite} onRevoke={setRevoking} />
          ))}
        </ul>
        <ShowMoreButton remaining={remaining} onClick={showMore} />
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
              The link sent to <span className="font-medium text-foreground">{revoking.email}</span> stops working
              now. Nothing was created from it, so nothing else changes.
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
