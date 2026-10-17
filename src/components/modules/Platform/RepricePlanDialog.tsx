"use client"

import { monthlyPrice } from "@/components/modules/Platform/planLabel"
import ConfirmDialog from "@/components/shared/dialog/ConfirmDialog"
import { companiesListQuery } from "@/queries/platform.queries"
import type { IPlan } from "@/types/platform.types"
import { useQuery } from "@tanstack/react-query"

type RepricePlanDialogProps = {
  plan: IPlan
  newPrice: number
  open: boolean
  onOpenChange: (open: boolean) => void
  isPending: boolean
  onConfirm: () => void
}

const companiesText = (count: number) => `${count} ${count === 1 ? "company" : "companies"}`

// A tier's price is what every company on it pays, so the confirm step says how many that is.
const RepricePlanDialog = ({ plan, newPrice, open, onOpenChange, isPending, onConfirm }: RepricePlanDialogProps) => {
  // Every company, read only while the dialog is open: the plans list carries no count of its own.
  const companiesList = useQuery({ ...companiesListQuery(), enabled: open })
  const onPlan = companiesList.data?.data.filter((company) => company.subscription?.plan_id === plan.id).length

  const change = `${plan.name} to ${monthlyPrice(newPrice)}`
  const title = onPlan === undefined ? `Change ${change}?` : `Change ${change} for ${companiesText(onPlan)}?`

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={
        <>
          It is {monthlyPrice(plan.price_usd)} today. Every company on {plan.name} is charged the new price from
          now on, and monthly revenue moves with it.
          {companiesList.isPending && " Counting the companies on it..."}
          {companiesList.isError && " The companies on it could not be counted."}
        </>
      }
      confirmLabel="Change price"
      pendingLabel="Saving..."
      isPending={isPending}
      onConfirm={onConfirm}
    />
  )
}

export default RepricePlanDialog
