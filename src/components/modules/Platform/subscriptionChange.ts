import { monthlyPrice } from "@/components/modules/Platform/planLabel"
import { isLockedOut, STATUS_LABEL } from "@/components/modules/Platform/subscriptionStatus"
import type { IPlan, SubscriptionStatus } from "@/types/platform.types"

type PlanTerms = Pick<IPlan, "id" | "name" | "price_usd" | "max_seats" | "max_projects">

export interface ISubscriptionChange {
  company: { name: string; people: number }
  current: { status: SubscriptionStatus; plan: PlanTerms } | null
  next: { status: SubscriptionStatus; plan: PlanTerms }
}

export interface ISubscriptionChangeSummary {
  title: string
  description: string
  confirmLabel: string
  destructive: boolean
}

// Past due still counts: the money is owed. Every other standing pays nothing.
const monthlyCharge = (status: SubscriptionStatus, plan: PlanTerms) =>
  status === "active" || status === "past_due" ? plan.price_usd : 0

const chargeText = (amount: number) => (amount === 0 ? "nothing" : monthlyPrice(amount))

const lostAccess = (people: number) => {
  if (people === 0) return "It loses access now."
  if (people === 1) return "Its 1 person loses access now."
  return `Its ${people} people lose access now.`
}

const regainedAccess = (people: number) => {
  if (people === 1) return "Its 1 person can sign in and work again."
  return `Its ${people} people can sign in and work again.`
}

const limitText = (limit: number | null, noun: string) => (limit === null ? `unlimited ${noun}` : `${limit} ${noun}`)

const headline = ({ company, current, next }: ISubscriptionChange) => {
  const wasLockedOut = isLockedOut(current?.status)

  if (next.status === "suspended" && !wasLockedOut) return { title: `Suspend ${company.name}?`, confirmLabel: "Suspend" }
  if (next.status === "cancelled" && !wasLockedOut) {
    return { title: `Cancel ${company.name}'s subscription?`, confirmLabel: "Cancel subscription" }
  }
  if (wasLockedOut && !isLockedOut(next.status)) return { title: `Restore ${company.name}?`, confirmLabel: "Restore" }
  if (!current) return { title: `Set up ${company.name} on ${next.plan.name}?`, confirmLabel: "Set up" }
  if (current.plan.id !== next.plan.id) return { title: `Move ${company.name} to ${next.plan.name}?`, confirmLabel: "Move" }
  return { title: `Mark ${company.name} as ${STATUS_LABEL[next.status].toLowerCase()}?`, confirmLabel: "Save" }
}

/**
 * What saving a company's plan and standing will do, in the words the confirm
 * step shows: who loses or regains access, and how its monthly charge moves.
 */
export const describeSubscriptionChange = (change: ISubscriptionChange): ISubscriptionChangeSummary => {
  const { company, current, next } = change
  const effects: string[] = []

  const wasLockedOut = isLockedOut(current?.status)
  if (isLockedOut(next.status) && !wasLockedOut) effects.push(lostAccess(company.people))
  if (wasLockedOut && !isLockedOut(next.status)) effects.push(regainedAccess(company.people))

  const before = current ? monthlyCharge(current.status, current.plan) : 0
  const after = monthlyCharge(next.status, next.plan)
  if (before !== after) effects.push(`It goes from paying ${chargeText(before)} to ${chargeText(after)}.`)

  if (current?.plan.id !== next.plan.id) {
    effects.push(
      `Its limits become ${limitText(next.plan.max_seats, "seats")} and ${limitText(next.plan.max_projects, "projects")}.`,
    )
  }

  if (effects.length === 0) effects.push("Nothing about its access or what it pays changes.")

  return {
    ...headline(change),
    description: effects.join(" "),
    destructive: isLockedOut(next.status) && !wasLockedOut,
  }
}
