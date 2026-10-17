"use client"

import { site } from "@/data/site"
import {
  invitePlatformAdminAction,
  revokePlatformInviteAction,
} from "@/app/(dashboardLayout)/platform/_teamAction"
import InviteLinkPanel from "@/components/modules/Platform/InviteLinkPanel"
import ConfirmDialog from "@/components/shared/dialog/ConfirmDialog"
import EmptyState from "@/components/shared/state/EmptyState"
import PanelState from "@/components/shared/state/PanelState"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import {
  PLATFORM_PERMISSIONS,
  PLATFORM_PERMISSION_INFO,
  type IPlatformInvite,
  type PlatformPermission,
} from "@/types/platform.types"
import { useActionMutation } from "@/hooks/useActionMutation"
import { useQuery } from "@tanstack/react-query"
import { format, isPast, parseISO } from "date-fns"
import { MailPlus, Trash2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { platformInvitesQuery } from "@/queries/platform.queries"
import { queryKeys } from "@/lib/queryKeys"

/**
 * Inviting somebody onto the platform team.
 *
 * The access they start with is chosen here rather than granted afterwards.
 * An operator who arrives with everything and is narrowed later has, for
 * however long that takes, been able to suspend any customer you have.
 *
 * They still land pending and need approving. The link alone does not create
 * an operator — which matters more here than anywhere else in the product.
 */

const statusOf = (invite: IPlatformInvite) => {
  if (invite.used_at) return { label: "accepted", tone: "secondary" as const }
  if (invite.revoked_at) return { label: "revoked", tone: "outline" as const }
  if (isPast(parseISO(invite.expires_at))) return { label: "expired", tone: "outline" as const }
  return { label: "waiting", tone: "default" as const }
}

const PlatformInvites = () => {
  const [email, setEmail] = useState("")
  const [permissions, setPermissions] = useState<string[]>([])
  const [freshLink, setFreshLink] = useState<string | null>(null)
  const [mailed, setMailed] = useState<{ delivered: boolean; reason: string | null } | null>(null)
  const [revoking, setRevoking] = useState<IPlatformInvite | null>(null)

  const invitesList = useQuery(platformInvitesQuery())

  const invites = invitesList.data?.data ?? []

  const { run: sendInvite, isPending } = useActionMutation({
    action: invitePlatformAdminAction,
    // The server phrases its message against what happened to the email.
    successMessage: false,
    invalidateKeys: [queryKeys.platformInvites.all],
    refresh: false,
    onSuccess: (result) => {
      if (!result.success) return

      const mail = result.data.email
      setFreshLink(result.data.join_url)
      setMailed(mail)

      if (mail.delivered) toast.success(result.message)
      else toast.warning(result.message, { description: mail.reason ?? undefined })
    },
  })

  const { run: revokeInvite, isPending: isRevoking } = useActionMutation({
    action: revokePlatformInviteAction,
    successMessage: "Invite revoked — the link stops working immediately",
    invalidateKeys: [queryKeys.platformInvites.all],
    refresh: false,
  })

  const handleRevoke = async () => {
    if (revoking && (await revokeInvite(revoking.id))) setRevoking(null)
  }

  const handleInvite = async () => {
    if (!(await sendInvite({ email, permissions }))) return

    setEmail("")
    setPermissions([])
  }

  const toggle = (permission: PlatformPermission, on: boolean) =>
    setPermissions((current) =>
      on ? [...current, permission] : current.filter((value) => value !== permission),
    )

  return (
    <div className="space-y-6">
      <Card className="gap-0 p-0">
        <CardHeader className="border-b px-5 py-4">
          <CardTitle className="text-base">Invite an operator</CardTitle>
          <p className="text-sm text-muted-foreground">
            Somebody who runs {site.name} with you, not the admin of a customer’s agency,
            who is created together with their company on the{" "}
            <Link href="/platform/customers" className="text-primary underline-offset-4 hover:underline">
              customers screen
            </Link>
            . They choose their own password and land waiting for approval; the link is
            emailed to them, works once, and expires in seven days.
          </p>
        </CardHeader>

        <form
          className="space-y-5 p-5"
          onSubmit={(event) => {
            event.preventDefault()
            if (!email.trim() || permissions.length === 0) return
            void handleInvite()
          }}
        >
          <div className="max-w-md space-y-1.5">
            <Label htmlFor="operator-email">Their email</Label>
            <Input
              id="operator-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="colleague@example.com"
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label>What they may do</Label>
            <p className="text-xs text-muted-foreground">
              {/* This used to grant everything when nothing was ticked, which is
                  what an untouched form looks like. Now at least one is required
                  and the server refuses the rest. */}
              Pick at least one. Choosing now is better than narrowing later — until you
              do, an operator can suspend any customer you have.
            </p>

            <div className="grid gap-2 pt-1 sm:grid-cols-2">
              {PLATFORM_PERMISSIONS.map((permission) => {
                const info = PLATFORM_PERMISSION_INFO[permission]

                return (
                  <div key={permission} className="flex items-start gap-2.5">
                    <Checkbox
                      id={`invite-${permission}`}
                      className="mt-0.5"
                      checked={permissions.includes(permission)}
                      onCheckedChange={(checked) => toggle(permission, checked === true)}
                      disabled={isPending}
                    />
                    <Label htmlFor={`invite-${permission}`} className="font-normal">
                      {info.label}
                      <span className="block text-xs text-muted-foreground">{info.area}</span>
                    </Label>
                  </div>
                )
              })}
            </div>
          </div>

          <Button type="submit" disabled={isPending || !email.trim() || permissions.length === 0}>
            <MailPlus className="size-4" />
            {isPending ? "Sending..." : "Send invite"}
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
        </CardHeader>

        <PanelState
          query={invitesList}
          errorMessage="The invites did not load."
          isEmpty={invites.length === 0}
          empty={<EmptyState icon={MailPlus}>No invites sent yet.</EmptyState>}
        >
          <ul className="divide-y">
            {invites.map((invite) => {
              const state = statusOf(invite)

              return (
                <li
                  key={invite.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{invite.email}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {invite.permissions.length === 0
                        ? "full access"
                        : `${invite.permissions.length} areas`}
                      {" · "}
                      {invite.used_at
                        ? `accepted ${format(parseISO(invite.used_at), "d MMM")}`
                        : `expires ${format(parseISO(invite.expires_at), "d MMM yyyy")}`}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant={state.tone}>{state.label}</Badge>
                    {state.label === "waiting" && (
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
    </div>
  )
}

export default PlatformInvites
