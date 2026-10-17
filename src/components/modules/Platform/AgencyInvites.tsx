"use client"

import { inviteAgencyAction } from "@/app/(dashboardLayout)/platform/_agencyAction"
import AgencyInviteList from "@/components/modules/Platform/AgencyInviteList"
import InviteLinkPanel from "@/components/modules/Platform/InviteLinkPanel"
import { planOptionLabel } from "@/components/modules/Platform/planLabel"
import AppField from "@/components/shared/form/AppField"
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
import { agencyInviteFormZodSchema, type IAgencyInviteFormValues } from "@/zod/platform.validation"
import { useForm } from "@tanstack/react-form"
import { useQuery } from "@tanstack/react-query"
import { Send } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"
import { plansQuery } from "@/queries/platform.queries"
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

// A Select cannot hold "", which is what the form keeps for "the sign-up default".
const NO_PLAN = "__none__"

const inviteDefaults: IAgencyInviteFormValues = { email: "", company_name: "", plan_id: "", trial_days: "14" }

const AgencyInvites = () => {
  const [freshLink, setFreshLink] = useState<string | null>(null)
  const [mailed, setMailed] = useState<{ delivered: boolean; reason: string | null } | null>(null)

  const { data: planData } = useQuery(plansQuery())

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

      if (mail.delivered) toast.success(result.message)
      else toast.warning(result.message, { description: mail.reason ?? undefined })
    },
  })

  const form = useForm({
    defaultValues: inviteDefaults,
    onSubmit: async ({ value, formApi }) => {
      if (!(await sendInvite(value))) return

      // The plan and trial stay as chosen, for the next agency invited on the same deal.
      formApi.reset(
        { ...inviteDefaults, plan_id: value.plan_id, trial_days: value.trial_days },
        { keepDefaultValues: true },
      )
    },
  })

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
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            void form.handleSubmit()
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <form.Field name="email" validators={{ onChange: agencyInviteFormZodSchema.shape.email }}>
                {(field) => (
                  <AppField
                    field={field}
                    label="Owner's email"
                    type="email"
                    placeholder="owner@theiragency.com"
                    disabled={isPending}
                  />
                )}
              </form.Field>
              <p className="text-xs text-muted-foreground">
                The link is bound to this address and works once.
              </p>
            </div>

            <form.Field
              name="company_name"
              validators={{ onChange: agencyInviteFormZodSchema.shape.company_name }}
            >
              {(field) => (
                <div className="space-y-1.5">
                  <AppField
                    field={field}
                    label="Agency name"
                    placeholder="Leave empty and they name it themselves"
                    disabled={isPending}
                  />
                  <p className="text-xs text-muted-foreground">
                    {field.state.value.trim()
                      ? "Fixed on the way in — this is the agency the deal was agreed with."
                      : "They will type their own agency name when they open it."}
                  </p>
                </div>
              )}
            </form.Field>

            <form.Field name="plan_id">
              {(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor="agency-plan">Plan</Label>
                  <Select
                    value={field.state.value || NO_PLAN}
                    onValueChange={(value) => field.handleChange(value === NO_PLAN ? "" : value)}
                  >
                    <SelectTrigger id="agency-plan" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_PLAN}>Whatever new sign-ups get</SelectItem>
                      {plans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {planOptionLabel(plan)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {plans.some((plan) => plan.id === field.state.value) ? (
                      "They are told this before they choose a password."
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
              )}
            </form.Field>

            <form.Field name="trial_days">
              {(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor="agency-trial">Trial length</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="agency-trial"
                      type="number"
                      min={0}
                      max={365}
                      value={field.state.value}
                      onChange={(event) => field.handleChange(event.target.value)}
                      onBlur={field.handleBlur}
                      disabled={isPending}
                      className="w-28"
                    />
                    <span className="text-sm text-muted-foreground">days</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {Number(field.state.value) === 0
                      ? "No trial — they start paying the day they open it."
                      : `Free for ${field.state.value} days, then the plan is charged.`}
                  </p>
                </div>
              )}
            </form.Field>
          </div>

          <form.Subscribe selector={({ values }) => values.email.trim() !== ""}>
            {(hasEmail) => (
              <Button type="submit" disabled={isPending || !hasEmail}>
                <Send className="size-4" />
                {isPending ? "Sending..." : "Send invite"}
              </Button>
            )}
          </form.Subscribe>
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

      <AgencyInviteList />
    </div>
  )
}

export default AgencyInvites
