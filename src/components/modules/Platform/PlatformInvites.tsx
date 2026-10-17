"use client"

import {
  invitePlatformAdminAction,
  revokePlatformInviteAction,
} from "@/app/(dashboardLayout)/platform/_teamAction"
import InviteLinkPanel from "@/components/shared/InviteLinkPanel"
import ConfirmDialog from "@/components/shared/dialog/ConfirmDialog"
import AppField from "@/components/shared/form/AppField"
import EmptyState from "@/components/shared/state/EmptyState"
import PanelState from "@/components/shared/state/PanelState"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  PLATFORM_PERMISSIONS,
  PLATFORM_PERMISSION_INFO,
  type IPlatformInvite,
} from "@/types/platform.types"
import { useActionMutation } from "@/hooks/useActionMutation"
import { platformInviteFormZodSchema, type IPlatformInviteFormValues } from "@/zod/platform.validation"
import { useForm } from "@tanstack/react-form"
import { useQuery } from "@tanstack/react-query"
import { format, isPast, parseISO } from "date-fns"
import { Ban, MailPlus } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { platformInvitesQuery } from "@/queries/platform.queries"
import { queryKeys } from "@/lib/queryKeys"
import type { IInviteMail } from "@/types/common.types"

/**
 * Inviting somebody onto the platform team, with their access chosen up front:
 * an operator who arrives with everything can suspend any customer until they
 * are narrowed. They still land pending, and a link alone creates nobody.
 */

const statusOf = (invite: IPlatformInvite) => {
  if (invite.used_at) return { label: "accepted", tone: "secondary" as const }
  if (invite.revoked_at) return { label: "revoked", tone: "outline" as const }
  if (isPast(parseISO(invite.expires_at))) return { label: "expired", tone: "outline" as const }
  return { label: "waiting", tone: "default" as const }
}

const inviteDefaults: IPlatformInviteFormValues = { email: "", permissions: [] }

// TanStack Form hands back a zod issue or a string, depending on the validator.
const permissionsError = (error: unknown) =>
  typeof error === "object" && error !== null && "message" in error ? String(error.message) : String(error)

const PlatformInvites = () => {
  const [freshLink, setFreshLink] = useState<string | null>(null)
  const [mailed, setMailed] = useState<IInviteMail | null>(null)
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
    successMessage: "Invite revoked. The link no longer works.",
    invalidateKeys: [queryKeys.platformInvites.all],
    refresh: false,
  })

  const handleRevoke = async () => {
    if (revoking && (await revokeInvite(revoking.id))) setRevoking(null)
  }

  const form = useForm({
    defaultValues: inviteDefaults,
    onSubmit: async ({ value, formApi }) => {
      if (await sendInvite(value)) formApi.reset()
    },
  })

  return (
    <div className="space-y-6">
      <Card className="gap-0 p-0">
        <form
          className="space-y-5 p-5"
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            void form.handleSubmit()
          }}
        >
          <form.Field name="email" validators={{ onChange: platformInviteFormZodSchema.shape.email }}>
            {(field) => (
              <AppField
                field={field}
                label="Their email"
                type="email"
                autoComplete="off"
                placeholder="e.g. colleague@example.com"
                description="The link is emailed to them, works once and expires in seven days."
                className="max-w-md"
                disabled={isPending}
              />
            )}
          </form.Field>

          {/* An empty list means full access, so the form refuses to send one. */}
          <form.Field name="permissions" validators={{ onChange: platformInviteFormZodSchema.shape.permissions }}>
            {(field) => (
              <fieldset className="space-y-2">
                <legend className="text-sm font-medium">What they may do</legend>
                <p className="text-xs text-muted-foreground">
                  Pick at least one area. An operator with nothing picked would get full access.
                </p>
                <div className="grid gap-2 pt-1 sm:grid-cols-2">
                  {PLATFORM_PERMISSIONS.map((permission) => {
                    const info = PLATFORM_PERMISSION_INFO[permission]
                    const granted = field.state.value

                    return (
                      <div key={permission} className="flex items-start gap-2.5">
                        <Checkbox
                          id={`invite-${permission}`}
                          className="mt-0.5"
                          checked={granted.includes(permission)}
                          onCheckedChange={(checked) =>
                            field.handleChange(
                              checked === true
                                ? [...granted, permission]
                                : granted.filter((value) => value !== permission),
                            )
                          }
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
                {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                  <p role="alert" className="text-sm text-destructive">
                    {permissionsError(field.state.meta.errors[0])}
                  </p>
                )}
              </fieldset>
            )}
          </form.Field>

          <Button type="submit" disabled={isPending}>
            <MailPlus className="size-4" aria-hidden="true" />
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
          <CardTitle className="text-base">Sent invites</CardTitle>
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
                        <Ban className="size-3.5" aria-hidden="true" />
                        Revoke
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
              stops working now. Nothing was created from it, so nothing else changes.
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
