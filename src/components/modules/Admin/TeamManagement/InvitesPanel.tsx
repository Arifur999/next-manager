"use client"

import {
  createInviteAction,
  revokeInviteAction,
} from "@/app/(dashboardLayout)/admin/dashboard/team-management/_inviteAction"
import ConfirmDialog from "@/components/shared/dialog/ConfirmDialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useActionMutation } from "@/hooks/useActionMutation"
import type { ITeamInvite } from "@/types/people.types"
import { useQuery } from "@tanstack/react-query"
import { format, isPast, parseISO } from "date-fns"
import { Check, Copy, MailPlus, Trash2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { invitesQuery } from "@/queries/people.queries"
import { queryKeys } from "@/lib/queryKeys"

/**
 * Inviting operations members.
 *
 * Every invite is for `operations`, so there is no role picker. Sales and
 * project managers are created directly on the Members tab — handing out that
 * authority is a decision an admin makes deliberately rather than something
 * emailed to whoever opens a link first.
 *
 * The link is shown exactly once, on the response that creates it. Nothing can
 * read it back afterwards because only its hash is stored, so this screen
 * keeps it on screen until dismissed rather than tucking it into a toast that
 * vanishes in four seconds.
 */

const statusOf = (invite: ITeamInvite) => {
  if (invite.used_at) return { label: "used", tone: "secondary" as const }
  if (invite.revoked_at) return { label: "revoked", tone: "outline" as const }
  if (isPast(parseISO(invite.expires_at))) return { label: "expired", tone: "outline" as const }
  return { label: "waiting", tone: "default" as const }
}

const InvitesPanel = () => {
  const [email, setEmail] = useState("")
  const [freshLink, setFreshLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [revoking, setRevoking] = useState<ITeamInvite | null>(null)

  const { data, isLoading } = useQuery(invitesQuery())

  const invites = data?.data ?? []

  // No toast: the link appearing below the form is the confirmation.
  const { run: createLink, isPending } = useActionMutation({
    action: createInviteAction,
    successMessage: false,
    invalidateKeys: [queryKeys.teamInvites.all],
    refresh: false,
    onSuccess: (result) => {
      if (!result.success) return
      setFreshLink(result.data.join_url)
      setCopied(false)
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

  const copy = async () => {
    if (!freshLink) return

    try {
      await navigator.clipboard.writeText(freshLink)
      setCopied(true)
    } catch {
      // Clipboard access is refused in plenty of ordinary situations. The link
      // is on screen and selectable, so this is a missing convenience rather
      // than a failure worth an error toast.
      toast.message("Copy it from the box above")
    }
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
          <div className="border-t bg-muted/40 px-5 py-4">
            <p className="text-sm font-medium">Send them this link</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {/* The honest warning: it genuinely cannot be recovered. */}
              This is the only time it can be read. If you lose it, revoke the invite and
              create another.
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Input readOnly value={freshLink} className="min-w-64 flex-1 font-mono text-xs" />
              <Button type="button" variant="outline" onClick={copy}>
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setFreshLink(null)}>
                Done
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Card className="gap-0 overflow-hidden p-0">
        <CardHeader className="border-b px-5 py-4">
          <CardTitle className="text-base">Invites</CardTitle>
          <p className="text-sm text-muted-foreground">
            Revoking one that has not been used stops the link immediately.
          </p>
        </CardHeader>

        {isLoading && invites.length === 0 ? (
          <div className="h-24 animate-pulse bg-muted/40" />
        ) : invites.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-muted-foreground">
            No invites sent yet.
          </p>
        ) : (
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
        )}
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
