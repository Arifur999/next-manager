"use client"

import { reorderPlansAction } from "@/app/(dashboardLayout)/platform/_action"
import NewPlanForm from "@/components/modules/Platform/NewPlanForm"
import { featureChoices } from "@/components/modules/Platform/planFeatures"
import { planMoves, sortPlans } from "@/components/modules/Platform/planOrder"
import PlanRow from "@/components/modules/Platform/PlanRow"
import EmptyState from "@/components/shared/state/EmptyState"
import PanelState from "@/components/shared/state/PanelState"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { useActionMutation } from "@/hooks/useActionMutation"
import { queryKeys } from "@/lib/queryKeys"
import { plansQuery } from "@/queries/platform.queries"
import { useQuery } from "@tanstack/react-query"
import { Layers } from "lucide-react"

/**
 * The tiers a company can be sold, and what the public pricing page shows.
 *
 * Limits live on the plan, so raising what Starter includes lifts every company
 * on Starter at once. A company that negotiated something different gets its
 * own plan rather than an override that would drift from the tier it claims.
 * Empty means unlimited, never zero: the server refuses a plan nobody can use.
 */
const PlansBoard = () => {
  const plansList = useQuery(plansQuery())

  const plans = sortPlans(plansList.data?.data ?? [])
  const features = featureChoices(plans)

  const { run: reorderPlans, isPending: isMoving } = useActionMutation({
    action: reorderPlansAction,
    // The rows moving say it.
    successMessage: false,
    invalidateKeys: [queryKeys.platformPlans.all],
    refresh: false,
  })

  const movePlan = (planId: string, direction: "up" | "down") => {
    const moves = planMoves(plans, planId, direction)
    if (moves.length > 0) void reorderPlans(moves)
  }

  return (
    <div className="space-y-6">
      <NewPlanForm />

      <Card className="gap-0 overflow-hidden p-0">
        <CardHeader className="border-b px-5 py-4">
          <CardTitle className="text-base">Plans</CardTitle>
          <p className="text-sm text-muted-foreground">
            In the order the pricing page lists them. Leave a limit empty for unlimited.
          </p>
        </CardHeader>

        <PanelState
          query={plansList}
          errorMessage="The plans did not load."
          isEmpty={plans.length === 0}
          empty={
            <EmptyState icon={Layers} hint="Create the first one above, then put companies on it.">
              No plans yet.
            </EmptyState>
          }
        >
          <ul className="divide-y">
            {plans.map((plan, index) => (
              <PlanRow
                key={plan.id}
                plan={plan}
                features={features}
                canMoveUp={index > 0}
                canMoveDown={index < plans.length - 1}
                isMoving={isMoving}
                onMove={(direction) => movePlan(plan.id, direction)}
              />
            ))}
          </ul>
        </PanelState>
      </Card>
    </div>
  )
}

export default PlansBoard
