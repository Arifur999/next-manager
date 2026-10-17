"use client"

import { updateSettingsAction } from "@/app/(dashboardLayout)/platform/_settingsAction"
import EmailDeliveryCard from "@/components/modules/Platform/EmailDeliveryCard"
import { planOptionLabel } from "@/components/modules/Platform/planLabel"
import { initialProductName, isUnchosenProductName, subjectPreview } from "@/components/modules/Platform/productName"
import RelativeTime from "@/components/shared/RelativeTime"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { site } from "@/data/site"
import { useActionMutation } from "@/hooks/useActionMutation"
import { queryKeys } from "@/lib/queryKeys"
import type { IPlatformSettings } from "@/types/platform.types"
import { platformSettingsFormZodSchema, type IPlatformSettingsFormValues } from "@/zod/platform.validation"
import Link from "next/link"
import { useState } from "react"

/** The sentinel for "leave new sign-ups without a plan"; a Select cannot hold "". */
const NO_PLAN = "__none__"

type SettingsErrors = Partial<Record<keyof IPlatformSettingsFormValues, string>>

const SETTINGS_FIELDS = platformSettingsFormZodSchema.keyof().options

const settingsField = (key: PropertyKey | undefined) => SETTINGS_FIELDS.find((name) => name === key)

// The first message per field, so each error sits under the input it is about.
const errorsOf = (values: IPlatformSettingsFormValues): SettingsErrors => {
  const parsed = platformSettingsFormZodSchema.safeParse(values)
  if (parsed.success) return {}

  const errors: SettingsErrors = {}
  for (const issue of parsed.error.issues) {
    const field = settingsField(issue.path[0])
    if (field && !errors[field]) errors[field] = issue.message
  }
  return errors
}

const trialHint = (provisions: boolean, trialDays: string) => {
  if (!provisions) return "Nothing to time until there is a starting plan."
  if (Number(trialDays) === 0) return "No trial. They start as a paying customer."
  return `They can use everything for ${trialDays} days before the plan has to be paid for.`
}

const FieldError = ({ id, message }: { id: string; message: string | undefined }) =>
  message ? (
    <p id={id} role="alert" className="text-sm text-destructive">
      {message}
    </p>
  ) : null

// Seeded from the saved settings and remounted (by key) only when they change on the server.
const PlatformSettingsForm = ({ settings }: { settings: IPlatformSettings }) => {
  const [values, setValues] = useState<IPlatformSettingsFormValues>({
    product_name: initialProductName(settings.product_name),
    support_email: settings.support_email,
    default_plan_id: settings.default_plan_id ?? "",
    default_trial_days: String(settings.default_trial_days),
  })
  const [errors, setErrors] = useState<SettingsErrors>({})

  const { run: saveSettings, isPending } = useActionMutation({
    action: updateSettingsAction,
    successMessage: "Settings saved",
    invalidateKeys: [queryKeys.platformSettings.all],
    refresh: false,
  })

  // Checked on Save, then on every change once something has been flagged, so errors clear as they are fixed.
  const update = (patch: Partial<IPlatformSettingsFormValues>) => {
    const next = { ...values, ...patch }
    setValues(next)
    if (Object.keys(errors).length > 0) setErrors(errorsOf(next))
  }

  const handleSave = () => {
    const found = errorsOf(values)
    setErrors(found)
    if (Object.keys(found).length === 0) void saveSettings(values)
  }

  const provisions = values.default_plan_id !== ""

  return (
    <form
      className="grid gap-4 lg:grid-cols-2"
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        handleSave()
      }}
    >
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">What customers see</CardTitle>
          <p className="text-sm text-muted-foreground">Used in every email the platform sends.</p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="product-name">Product name in emails</Label>
            <div className="flex flex-wrap items-center gap-2">
              <Input
                id="product-name"
                value={values.product_name}
                maxLength={60}
                className="max-w-sm"
                onChange={(event) => update({ product_name: event.target.value })}
                aria-invalid={Boolean(errors.product_name)}
                aria-describedby={errors.product_name ? "product-name-preview product-name-error" : "product-name-preview"}
              />
              {values.product_name !== site.name && (
                <Button type="button" variant="ghost" size="sm" onClick={() => update({ product_name: site.name })}>
                  Use {site.name}
                </Button>
              )}
            </div>
            <p id="product-name-preview" className="text-xs text-muted-foreground">
              Subject line: <span className="text-foreground">{subjectPreview(values.product_name)}</span>
              {isUnchosenProductName(settings.product_name) && ` (mail says ${settings.product_name} until you save)`}
            </p>
            <FieldError id="product-name-error" message={errors.product_name} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="support-email">Support address (optional)</Label>
            <Input
              id="support-email"
              type="email"
              autoComplete="off"
              value={values.support_email}
              className="max-w-sm"
              onChange={(event) => update({ support_email: event.target.value })}
              aria-invalid={Boolean(errors.support_email)}
              aria-describedby={errors.support_email ? "support-email-error" : undefined}
            />
            <p className="text-xs text-muted-foreground">
              {values.support_email
                ? "Added to the bottom of every email."
                : "Left empty, emails mention no address at all."}
            </p>
            <FieldError id="support-email-error" message={errors.support_email} />
          </div>
        </CardContent>
      </Card>

      <EmailDeliveryCard smtp={settings.smtp} />

      <Card className="lg:col-span-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">New sign-ups</CardTitle>
          <p className="text-sm text-muted-foreground">
            What a company that signs itself up is put on. Companies you add yourself are not affected.
          </p>
        </CardHeader>

        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="default-plan">Starting plan</Label>
            <Select
              value={values.default_plan_id || NO_PLAN}
              onValueChange={(value) => update({ default_plan_id: value === NO_PLAN ? "" : value })}
            >
              <SelectTrigger id="default-plan" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_PLAN}>No plan, set them up by hand</SelectItem>
                {settings.plans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {planOptionLabel(plan)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {provisions
                ? "They are on this plan the moment they sign up."
                : "They get in and show as Not set up on Companies until someone picks their plan."}
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="trial-days">Trial length (days)</Label>
            <Input
              id="trial-days"
              type="number"
              min={0}
              max={365}
              value={values.default_trial_days}
              disabled={!provisions}
              onChange={(event) => update({ default_trial_days: event.target.value })}
              className="w-28"
              aria-invalid={Boolean(errors.default_trial_days)}
              aria-describedby={errors.default_trial_days ? "trial-days-error" : undefined}
            />
            <p className="text-xs text-muted-foreground">{trialHint(provisions, values.default_trial_days)}</p>
            <FieldError id="trial-days-error" message={errors.default_trial_days} />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-3 lg:col-span-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save settings"}
        </Button>
        <span className="text-xs text-muted-foreground">
          Last changed <RelativeTime value={settings.updated_at} />. Every change is recorded in the{" "}
          <Link href="/platform/activity" className="text-primary underline-offset-4 hover:underline">
            activity log
          </Link>
          .
        </span>
      </div>
    </form>
  )
}

export default PlatformSettingsForm
