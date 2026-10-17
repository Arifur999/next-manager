import type { IAccount } from "@/types/finance.types"
import { describe, expect, it } from "vitest"
import { pickAccountOptions } from "./accountOptions"

const account = (overrides: Partial<IAccount>): IAccount => ({
  id: "a",
  name: "Wallet",
  type: "bank",
  currency: "BDT",
  opening_balance: 0,
  balance: 0,
  is_active: true,
  notes: "",
  created_at: "2026-10-01T00:00:00.000Z",
  ...overrides,
})

describe("pickAccountOptions", () => {
  const accounts = [
    account({ id: "usd", name: "PayPal", currency: "USD", balance: 1200 }),
    account({ id: "bdt", name: "City Bank" }),
    account({ id: "old", name: "Old cash", is_active: false }),
  ]

  it("offers only active accounts in the form's currency", () => {
    expect(pickAccountOptions(accounts, "USD")).toEqual([{ value: "usd", label: "PayPal", hint: "$1,200.00" }])
    expect(pickAccountOptions(accounts, "BDT").map((option) => option.value)).toEqual(["bdt"])
  })

  it("keeps a deactivated account the edited record already uses", () => {
    expect(pickAccountOptions(accounts, "BDT", "old").map((option) => option.value)).toEqual(["bdt", "old"])
  })
})
