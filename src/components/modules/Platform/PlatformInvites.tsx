"use client"

import {
  invitePlatformAdminAction,
  revokePlatformInviteAction,
} from "@/app/(dashboardLayout)/platform/_teamAction"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getPlatformInvites } from "@/services/agencio.services"
import {
  PLATFORM_PERMISSIONS,
  PLATFORM_PERMISSION_INFO,
  type IPlatformInvite,
  type PlatformPermission,
} from "@/types/platform.types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { format, isPast, parseISO } from "date-fns"
import { Check, Copy, MailPlus, Trash2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

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
  const queryClient = useQueryClient()
  const [email, setEmail] = useState("")
  const [permissions, setPermissions] = useState<string[]>([])
  const [freshLink, setFreshLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ["platform-invites"],
    queryFn: () => getPlatformInvites(),
  })

  const invites = (data?.data ?? []) as IPlatformInvite[]

  const { mutate: invite, isPending } = useMutation({
    mutationFn: () =>
      invitePlatformAdminAction({ email: email.trim(), permissions }),
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.message || "Could not create the invite")
        return
      }

      const url = "data" in result ? result.data?.join_url : undefined
      setFreshLink(url ?? null)
      setCopied(false)
      setEmail("")
      setPermissions([])
      void queryClient.invalidateQueries({ queryKey: ["platform-invites"] })
    },
  })

  const { mutate: revoke, isPending: isRevoking } = useMutation({
    mutationFn: (id: string) => revokePlatformInviteAction(id),
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.message || "Could not revoke")
        return
      }
      toast.success("Invite revoked — the link stops working immediately")
      void queryClient.invalidateQueries({ queryKey: ["platform-invites"] })
    },
  })

  const copy = async () => {
    if (!freshLink) return

    try {
      await navigator.clipboard.writeText(freshLink)
      setCopied(true)
    } catch {
      toast.message("Copy it from the box above")
    }
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
            They choose their own password and land waiting for approval. The link works
            once, expires in seven days, and only for the address you enter.
          </p>
        </CardHeader>

        <form
          className="space-y-5 p-5"
          onSubmit={(event) => {
            event.preventDefault()
            if (!email.trim()) return
            invite()
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
              {/* The default here is full access, and saying so beats letting
                  somebody discover it after the fact. */}
              Leave everything unticked and they arrive with full access. Choosing now is
              better than narrowing later — until you do, they can suspend any customer.
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

          <Button type="submit" disabled={isPending || !email.trim()}>
            <MailPlus className="size-4" />
            {isPending ? "Creating..." : "Create link"}
          </Button>
        </form>

        {freshLink && (
          <div className="border-t bg-muted/40 px-5 py-4">
            <p className="text-sm font-medium">Send them this link</p>
            <p className="mt-1 text-xs text-muted-foreground">
              This is the only time it can be read. Lose it and you revoke the invite and
              send another.
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
                        onClick={() => revoke(invite.id)}
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
    </div>
  )
}

export default PlatformInvites
