"use client"

import { setSubscriptionAction } from "@/app/(dashboardLayout)/platform/_action"
import { planOptionLabel } from "@/components/modules/Platform/planLabel"
import { describeSubscriptionChange } from "@/components/modules/Platform/subscriptionChange"
import { STATUS_LABEL } from "@/components/modules/Platform/subscriptionStatus"
import ConfirmDialog from "@/components/shared/dialog/ConfirmDialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useActionMutation } from "@/hooks/useActionMutation"
import { queryKeys } from "@/lib/queryKeys"
import { cn } from "@/lib/utils"
import { SUBSCRIPTION_STATUSES, type ICompanyRow, type IPlan, type SubscriptionStatus } from "@/types/platform.types"
import { subscriptionFormZodSchema, type ISubscriptionFormValues } from "@/zod/platform.validation"
import { useState } from "react"

// A company's plan and standing move what it pays, so the dashboard and the report refetch too.
const SUBSCRIPTION_KEYS = [
  queryKeys.platformCompanies.all,
  queryKeys.platformOverview.all,
  queryKeys.platformFinance.all,
  queryKeys.platformTrend.all,
]

type SubscriptionEditorProps = {
  company: ICompanyRow
  plans: IPlan[]
  // Inline sits in a table row; stacked fills a sheet, with labels.
  layout?: "inline" | "stacked"
  // Suspend and Restore open the editor with the standing already picked.
  initialStatus?: SubscriptionStatus
  onSaved?: () => void
}

// One company's plan and standing, saved together after a confirm step that
// names the effect. A company with no subscription starts with nothing picked.
const SubscriptionEditor = ({ company, plans, layout = "inline", initialStatus, onSaved }: SubscriptionEditorProps) => {
  // The companies list sends the plan whole, so its id is read from it.
  const savedPlanId = company.subscription?.plan.id ?? ""
  const savedStatus = company.subscription?.status ?? ""

  const [planId, setPlanId] = useState(savedPlanId)
  const [status, setStatus] = useState<SubscriptionStatus | "">(initialStatus ?? savedStatus)
  const [error, setError] = useState<string | null>(null)
  // Kept after the dialog closes, so its text does not blank out while it animates away.
  const [confirming, setConfirming] = useState<ISubscriptionFormValues | null>(null)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  const { run: saveSubscription, isPending } = useActionMutation({
    action: (values: ISubscriptionFormValues) => setSubscriptionAction(company.id, values),
    successMessage: `${company.name} updated`,
    invalidateKeys: SUBSCRIPTION_KEYS,
    refresh: false,
  })

  const isDirty = planId !== savedPlanId || status !== savedStatus
  const pickedPlan = plans.find((plan) => plan.id === confirming?.plan_id)

  const handleSave = () => {
    const parsed = subscriptionFormZodSchema.safeParse({ plan_id: planId, status })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Choose a plan and a standing")
      return
    }
    setError(null)
    setConfirming(parsed.data)
    setIsConfirmOpen(true)
  }

  const handleConfirm = async () => {
    if (!confirming || !(await saveSubscription(confirming))) return
    setIsConfirmOpen(false)
    onSaved?.()
  }

  const summary =
    confirming && pickedPlan
      ? describeSubscriptionChange({
          company: { name: company.name, people: company.usage.seats_used },
          current: company.subscription && { status: company.subscription.status, plan: company.subscription.plan },
          next: { status: confirming.status, plan: pickedPlan },
        })
      : null

  const isStacked = layout === "stacked"
  const planFieldId = `${company.id}-plan`
  const statusFieldId = `${company.id}-standing`

  return (
    <div className={cn(isStacked ? "space-y-4" : "flex flex-wrap items-center justify-end gap-2")}>
      <div className={cn(isStacked && "space-y-1.5")}>
        {isStacked && <Label htmlFor={planFieldId}>Plan</Label>}
        <Select value={planId} onValueChange={setPlanId}>
          <SelectTrigger
            id={isStacked ? planFieldId : undefined}
            className={cn(isStacked ? "w-full" : "w-36")}
            aria-label={isStacked ? undefined : `Plan for ${company.name}`}
          >
            <SelectValue placeholder="Choose a plan" />
          </SelectTrigger>
          <SelectContent>
            {plans.map((plan) => (
              <SelectItem key={plan.id} value={plan.id}>
                {isStacked ? planOptionLabel(plan) : plan.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className={cn(isStacked && "space-y-1.5")}>
        {isStacked && <Label htmlFor={statusFieldId}>Standing</Label>}
        <Select
          value={status}
          onValueChange={(next) => {
            const picked = SUBSCRIPTION_STATUSES.find((option) => option === next)
            if (picked) setStatus(picked)
          }}
        >
          <SelectTrigger
            id={isStacked ? statusFieldId : undefined}
            className={cn(isStacked ? "w-full" : "w-32")}
            aria-label={isStacked ? undefined : `Standing for ${company.name}`}
          >
            <SelectValue placeholder="Choose" />
          </SelectTrigger>
          <SelectContent>
            {SUBSCRIPTION_STATUSES.map((option) => (
              <SelectItem key={option} value={option}>
                {STATUS_LABEL[option]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Held in place while hidden, so a row does not jump when it appears. */}
      <Button
        type="button"
        size="sm"
        className={cn(!isDirty && "invisible")}
        disabled={isPending}
        onClick={handleSave}
      >
        Save
      </Button>

      {error && (
        <p role="alert" className="w-full text-xs text-destructive">
          {error}
        </p>
      )}

      <ConfirmDialog
        open={isConfirmOpen && summary !== null}
        onOpenChange={setIsConfirmOpen}
        title={summary?.title ?? ""}
        description={summary?.description}
        variant={summary?.destructive ? "destructive" : "default"}
        confirmLabel={summary?.confirmLabel}
        pendingLabel="Saving..."
        isPending={isPending}
        onConfirm={() => void handleConfirm()}
      />
    </div>
  )
}

export default SubscriptionEditor
