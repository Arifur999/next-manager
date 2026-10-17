"use client"

import { updatePlanAction } from "@/app/(dashboardLayout)/platform/_action"
import { isPlanDraftChanged, isRepriced, planDraftOf, typedPrice } from "@/components/modules/Platform/planDraft"
import { featureList, type IFeatureChoice } from "@/components/modules/Platform/planFeatures"
import RepricePlanDialog from "@/components/modules/Platform/RepricePlanDialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useActionMutation } from "@/hooks/useActionMutation"
import { queryKeys } from "@/lib/queryKeys"
import { cn } from "@/lib/utils"
import type { IPlan } from "@/types/platform.types"
import { planRowFormZodSchema, type IPlanRowFormValues } from "@/zod/platform.validation"
import { ArrowDown, ArrowUp } from "lucide-react"
import { useState } from "react"

// Company rows show their plan's limits and the dashboard its revenue, so both refetch too.
const PLAN_KEYS = [
  queryKeys.platformPlans.all,
  queryKeys.platformCompanies.all,
  queryKeys.platformOverview.all,
  queryKeys.platformFinance.all,
  queryKeys.platformTrend.all,
]

const limitLabel = (value: number | null, noun: string) => (value === null ? `unlimited ${noun}` : `${value} ${noun}`)

type PlanRowProps = {
  plan: IPlan
  features: IFeatureChoice[]
  canMoveUp: boolean
  canMoveDown: boolean
  isMoving: boolean
  onMove: (direction: "up" | "down") => void
}

// One tier: price, limits, whether the pricing page shows it, and what it lists.
const PlanRow = ({ plan, features, canMoveUp, canMoveDown, isMoving, onMove }: PlanRowProps) => {
  const [draft, setDraft] = useState(() => planDraftOf(plan))
  const [error, setError] = useState<string | null>(null)
  const [isRepricing, setIsRepricing] = useState(false)

  const { run: savePlan, isPending } = useActionMutation({
    action: (values: IPlanRowFormValues) => updatePlanAction(plan.id, values),
    successMessage: `${plan.name} updated`,
    invalidateKeys: PLAN_KEYS,
    refresh: false,
  })

  const isChanged = isPlanDraftChanged(plan, draft)
  const edit = (patch: Partial<IPlanRowFormValues>) => setDraft((current) => ({ ...current, ...patch }))
  const toggleFeature = (slug: string, on: boolean) =>
    edit({ features: on ? [...draft.features, slug] : draft.features.filter((value) => value !== slug) })

  const save = async () => {
    if (await savePlan(draft)) setIsRepricing(false)
  }

  const handleSave = () => {
    const parsed = planRowFormZodSchema.safeParse(draft)
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the price and limits")
      return
    }
    setError(null)
    if (isRepriced(plan, draft)) setIsRepricing(true)
    else void save()
  }

  const fieldId = (name: string) => `plan-${plan.id}-${name}`

  return (
    <li className="space-y-3 px-5 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium">
            {plan.name}
            <span className="ml-2 font-mono text-xs font-normal text-muted-foreground">{plan.code}</span>
            {!plan.is_active && (
              <Badge variant="outline" className="ml-2 text-[10px]">
                retired
              </Badge>
            )}
          </p>
          <p className="text-xs text-muted-foreground">
            {limitLabel(plan.max_seats, "seats")} · {limitLabel(plan.max_projects, "projects")}
            {plan.features.length > 0 && ` · ${featureList(plan.features)}`}
            {plan.is_public ? " · on the pricing page" : " · not on the pricing page"}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={!canMoveUp || isMoving}
            onClick={() => onMove("up")}
            aria-label={`Move ${plan.name} up`}
          >
            <ArrowUp aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={!canMoveDown || isMoving}
            onClick={() => onMove("down")}
            aria-label={`Move ${plan.name} down`}
          >
            <ArrowDown aria-hidden="true" />
          </Button>
        </div>
      </div>

      {/* Labels sit above their inputs at every width, so a phone still says which box is which. */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <Label htmlFor={fieldId("price")} className="text-xs text-muted-foreground">
            $/mo
          </Label>
          <Input
            id={fieldId("price")}
            type="number"
            step="any"
            min={0}
            value={draft.price_usd}
            onChange={(event) => edit({ price_usd: event.target.value })}
            className="w-24 tabular-nums"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={fieldId("seats")} className="text-xs text-muted-foreground">
            Seats
          </Label>
          <Input
            id={fieldId("seats")}
            type="number"
            min={1}
            value={draft.max_seats}
            onChange={(event) => edit({ max_seats: event.target.value })}
            placeholder="∞"
            className="w-20 tabular-nums"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={fieldId("projects")} className="text-xs text-muted-foreground">
            Projects
          </Label>
          <Input
            id={fieldId("projects")}
            type="number"
            min={1}
            value={draft.max_projects}
            onChange={(event) => edit({ max_projects: event.target.value })}
            placeholder="∞"
            className="w-20 tabular-nums"
          />
        </div>
        <div className="flex h-9 items-center gap-2">
          <Checkbox
            id={fieldId("public")}
            checked={draft.is_public}
            onCheckedChange={(checked) => edit({ is_public: checked === true })}
          />
          <Label htmlFor={fieldId("public")} className="font-normal">
            Shown on pricing page
          </Label>
        </div>

        {/* Held in place while hidden, so the row does not jump when it appears. */}
        <div className={cn("ml-auto flex items-center gap-2", !isChanged && "invisible")}>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isPending}
            onClick={() => {
              setDraft(planDraftOf(plan))
              setError(null)
            }}
          >
            Discard
          </Button>
          <Button type="button" size="sm" disabled={isPending} onClick={handleSave}>
            {isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <fieldset className="flex flex-wrap gap-x-5 gap-y-2">
        <legend className="mb-1.5 text-xs text-muted-foreground">Features it lists</legend>
        {features.map((feature) => (
          <div key={feature.slug} className="flex items-center gap-2">
            <Checkbox
              id={fieldId(`feature-${feature.slug}`)}
              checked={draft.features.includes(feature.slug)}
              onCheckedChange={(checked) => toggleFeature(feature.slug, checked === true)}
            />
            <Label htmlFor={fieldId(`feature-${feature.slug}`)} className="font-normal">
              {feature.label}
            </Label>
          </div>
        ))}
      </fieldset>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <RepricePlanDialog
        plan={plan}
        newPrice={typedPrice(draft.price_usd)}
        open={isRepricing}
        onOpenChange={setIsRepricing}
        isPending={isPending}
        onConfirm={() => void save()}
      />
    </li>
  )
}

export default PlanRow
