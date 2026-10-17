"use client"

import { monthlyPrice } from "@/components/modules/Platform/planLabel"
import StandingBadge from "@/components/modules/Platform/StandingBadge"
import SubscriptionEditor from "@/components/modules/Platform/SubscriptionEditor"
import ErrorState from "@/components/shared/state/ErrorState"
import LoadingBlock from "@/components/shared/state/LoadingBlock"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { plansQuery } from "@/queries/platform.queries"
import type { ICompanyRow, SubscriptionStatus } from "@/types/platform.types"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"

export interface ICompanySheetTarget {
  company: ICompanyRow
  // Suspend and Restore arrive with the standing already picked.
  initialStatus?: SubscriptionStatus
}

type CompanySubscriptionSheetProps = {
  target: ICompanySheetTarget | null
  onClose: () => void
}

// One customer's plan and standing, changed beside the list it was opened from.
const CompanySubscriptionSheet = ({ target, onClose }: CompanySubscriptionSheetProps) => {
  const plansList = useQuery({ ...plansQuery(), enabled: target !== null })
  const plans = plansList.data?.data

  // The last company stays rendered while the sheet slides away, instead of an empty panel.
  const [shown, setShown] = useState(target)
  if (target !== null && target !== shown) setShown(target)

  const company = shown?.company
  const subscription = company?.subscription

  return (
    <Sheet
      open={target !== null}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <SheetContent className="w-full sm:max-w-md">
        {company && (
          <>
            <SheetHeader className="border-b">
              <SheetTitle>{company.name}</SheetTitle>
              <SheetDescription>
                {company.admin ? `Sold to ${company.admin.full_name} (${company.admin.email})` : "No admin account"}
                {` · ${company.usage.seats_used} ${company.usage.seats_used === 1 ? "person" : "people"}`}
              </SheetDescription>
              <div className="flex flex-wrap items-center gap-2 pt-1 text-sm">
                <StandingBadge status={subscription?.status} />
                {subscription && (
                  <span className="text-muted-foreground">
                    {subscription.plan.name}, {monthlyPrice(subscription.plan.price_usd)}
                  </span>
                )}
              </div>
            </SheetHeader>

            <div className="p-6">
              {plansList.isError && (
                <ErrorState
                  message="The plans did not load."
                  onRetry={() => void plansList.refetch()}
                  isRetrying={plansList.isFetching}
                />
              )}
              {!plansList.isError && !plans && <LoadingBlock height="h-40" rounded />}
              {plans && (
                <SubscriptionEditor
                  key={company.id}
                  company={company}
                  plans={plans}
                  layout="stacked"
                  initialStatus={shown?.initialStatus}
                  onSaved={onClose}
                />
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

export default CompanySubscriptionSheet
