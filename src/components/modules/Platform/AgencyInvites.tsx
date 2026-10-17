"use client"

import {
  inviteAgencyAction,
  revokeAgencyInviteAction,
} from "@/app/(dashboardLayout)/platform/_agencyAction"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useActionMutation } from "@/hooks/useActionMutation"
import type { IAgencyInvite } from "@/types/platform.types"
import { useQuery } from "@tanstack/react-query"
import { format, isPast, parseISO } from "date-fns"
import { Check, Copy, Send, Trash2, TriangleAlert } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"
import { agencyInvitesQuery, plansQuery } from "@/queries/platform.queries"
import { queryKeys } from "@/lib/queryKeys"

/**
 * Bringing an agency on.
 *
 * The whole job of this console. You send a link; the owner sets their own
 * password, names their agency and lands owning it. Everything after that
 * happens inside their workspace — they add their own sales people, project
 * managers and operations team, and none of those accounts come through here.
 *
 * Nothing is created until they accept, so an invite that goes nowhere leaves
 * nothing behind on the customers list.
 */

const NO_PLAN = "__none__"

const statusOf = (invite: IAgencyInvite) => {
  if (invite.used_at) return { label: "opened", tone: "secondary" as const }
  if (invite.revoked_at) return { label: "revoked", tone: "outline" as const }
  if (isPast(parseISO(invite.expires_at))) return { label: "expired", tone: "outline" as const }
  return { label: "waiting", tone: "default" as const }
}

const AgencyInvites = () => {
  const [email, setEmail] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [planId, setPlanId] = useState(NO_PLAN)
  const [trialDays, setTrialDays] = useState("14")
  const [freshLink, setFreshLink] = useState<string | null>(null)
  const [mailed, setMailed] = useState<{ delivered: boolean; reason: string | null } | null>(null)
  const [copied, setCopied] = useState(false)

  const { data, isLoading } = useQuery(agencyInvitesQuery())

  const { data: planData } = useQuery(plansQuery())

  const invites = data?.data ?? []
  const plans = ((planData?.data ?? [])).filter((plan) => plan.is_active)

  const { run: sendInvite, isPending } = useActionMutation({
    action: inviteAgencyAction,
    // The server phrases its message against what happened to the email.
    successMessage: false,
    invalidateKeys: [queryKeys.agencyInvites.all],
    refresh: false,
    onSuccess: (result) => {
      if (!result.success) return

      const mail = result.data.email
      setFreshLink(result.data.join_url)
      setMailed(mail)
      setCopied(false)

      if (mail.delivered) toast.success(result.message)
      else toast.warning(result.message, { description: mail.reason ?? undefined })
    },
  })

  const { run: revokeInvite } = useActionMutation({
    action: revokeAgencyInviteAction,
    successMessage: "Invite revoked — the link stops working immediately",
    invalidateKeys: [queryKeys.agencyInvites.all],
    refresh: false,
  })

  const handleInvite = async () => {
    const sent = await sendInvite({
      email,
      company_name: companyName,
      plan_id: planId === NO_PLAN ? "" : planId,
      trial_days: trialDays,
    })
    if (!sent) return

    setEmail("")
    setCompanyName("")
  }

  const copy = async () => {
    if (!freshLink) return

    try {
      await navigator.clipboard.writeText(freshLink)
      setCopied(true)
    } catch {
      toast.message("Copy it from the box above")
    }
  }

  const chosenPlan = plans.find((plan) => plan.id === planId)

  return (
    <div className="space-y-6">
      <Card className="gap-0 p-0">
        <CardHeader className="border-b px-5 py-4">
          <CardTitle className="text-base">Invite an agency</CardTitle>
          <p className="text-sm text-muted-foreground">
            They set their own password and land owning their workspace. From there they
            add their own sales people, project managers and operations team — none of
            those accounts come through here.
          </p>
        </CardHeader>

        <form
          className="space-y-5 p-5"
          onSubmit={(event) => {
            event.preventDefault()
            if (!email.trim()) return
            void handleInvite()
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="agency-email">Owner&apos;s email</Label>
              <Input
                id="agency-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="owner@theiragency.com"
                disabled={isPending}
              />
              <p className="text-xs text-muted-foreground">
                The link is bound to this address and works once.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="agency-name">Agency name</Label>
              <Input
                id="agency-name"
                value={companyName}
                onChange={(event) => setCompanyName(event.target.value)}
                placeholder="Leave empty and they name it themselves"
                disabled={isPending}
              />
              <p className="text-xs text-muted-foreground">
                {companyName.trim()
                  ? "Fixed on the way in — this is the agency the deal was agreed with."
                  : "They will type their own agency name when they open it."}
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="agency-plan">Plan</Label>
              <Select value={planId} onValueChange={setPlanId}>
                <SelectTrigger id="agency-plan" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_PLAN}>Whatever new sign-ups get</SelectItem>
                  {plans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name} — ${plan.price_usd}/mo
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {chosenPlan ? (
                  `They are told this before they choose a password.`
                ) : (
                  <>
                    Falls back to the default on{" "}
                    <Link
                      href="/platform/settings"
                      className="text-primary underline-offset-4 hover:underline"
                    >
                      settings
                    </Link>
                    . With none set they arrive unprovisioned.
                  </>
                )}
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="agency-trial">Trial length</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="agency-trial"
                  type="number"
                  min={0}
                  max={365}
                  value={trialDays}
                  onChange={(event) => setTrialDays(event.target.value)}
                  disabled={isPending}
                  className="w-28"
                />
                <span className="text-sm text-muted-foreground">days</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {Number(trialDays) === 0
                  ? "No trial — they start paying the day they open it."
                  : `Free for ${trialDays} days, then the plan is charged.`}
              </p>
            </div>
          </div>

          <Button type="submit" disabled={isPending || !email.trim()}>
            <Send className="size-4" />
            {isPending ? "Sending..." : "Send invite"}
          </Button>
        </form>

        {freshLink && (
          <div className="border-t bg-muted/40 px-5 py-4">
            {/* Shown either way. Mail gets filtered, and an unverified sending
                domain reaches nobody but your own address — hiding the link on
                a reported success strands you on a spam folder you cannot see. */}
            <p className="flex items-center gap-2 text-sm font-medium">
              {mailed?.delivered ? (
                <>
                  <Check className="size-4" aria-hidden="true" />
                  Emailed to them
                </>
              ) : (
                <>
                  <TriangleAlert className="size-4" aria-hidden="true" />
                  Not emailed — send them this link yourself
                </>
              )}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {mailed?.delivered
                ? "Keep a copy in case it lands in their spam. This is the only time it can be read."
                : (mailed?.reason ??
                  "This is the only time the link can be read. Lose it and you revoke the invite and send another.")}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Input readOnly value={freshLink} className="min-w-64 flex-1 font-mono text-xs" />
              <Button type="button" variant="outline" onClick={copy}>
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setFreshLink(null)
                  setMailed(null)
                }}
              >
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
            Nothing appears on the customers list until an invite is opened.
          </p>
        </CardHeader>

        {isLoading && invites.length === 0 ? (
          <div className="h-24 animate-pulse bg-muted/40" />
        ) : invites.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-muted-foreground">
            No agencies invited yet.
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
                        onClick={() => void revokeInvite(invite.id)}
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
        )}
      </Card>
    </div>
  )
}

export default AgencyInvites
