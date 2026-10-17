import { formatBdt } from "@/lib/currency"
import type { IPayment } from "@/types/billing.types"
import type { IExchange } from "@/types/finance.types"
import type { IDueTransaction, IExpense, IOwnerWithdrawal, ITeamPayout } from "@/types/spending.types"
import { describe, expect, it } from "vitest"
import {
  dueTransactionReversal,
  exchangeReversal,
  expenseReversal,
  payoutReversal,
  paymentReversal,
  withdrawalReversal,
} from "./reversalCopy"

const usdAccount = { id: "a1", name: "PayPal", currency: "USD" as const }
const bdtAccount = { id: "a2", name: "City Bank", currency: "BDT" as const }

const payment: IPayment = {
  id: "p1",
  client_id: "c1",
  project_id: null,
  invoice_id: null,
  date: "2026-10-01",
  amount_usd: 1200,
  reporting_rate: 120,
  amount_bdt_reporting: 144000,
  account_id: "a1",
  reference: "",
  notes: "",
  client: { id: "c1", name: "Acme", company: "" },
  account: usdAccount,
}

describe("paymentReversal", () => {
  it("names the amount and the wallet it leaves", () => {
    expect(paymentReversal(payment)).toBe(
      "This removes the $1,200.00 payment from Acme and takes $1,200.00 back out of PayPal.",
    )
  })

  it("says the invoice it paid is owed again", () => {
    expect(paymentReversal({ ...payment, invoice_id: "i1" })).toContain("goes back to owing that amount")
  })
})

describe("expenseReversal", () => {
  const expense: IExpense = {
    id: "e1",
    date: "2026-10-01",
    category_id: "cat",
    amount_bdt: 5000,
    account_id: "a2",
    project_id: null,
    vendor: "Figma",
    notes: "",
    receipt_url: "",
    category: { id: "cat", name: "Software", type: "general", color: "" },
    account: bdtAccount,
  }

  it("puts the amount back into the account it came from", () => {
    const amount = formatBdt(5000)
    expect(expenseReversal(expense)).toBe(`This removes the ${amount} expense for Figma and puts ${amount} back into City Bank.`)
  })

  it("falls back to the category when there is no vendor", () => {
    expect(expenseReversal({ ...expense, vendor: "" })).toContain("expense for Software")
  })
})

describe("exchangeReversal", () => {
  const exchange: IExchange = {
    id: "x1",
    date: "2026-10-01",
    from_account_id: "a1",
    to_account_id: "a2",
    amount_usd: 500,
    rate: 117.4,
    fee_usd: 0,
    amount_bdt: 58700,
    notes: "",
    from_account: usdAccount,
    to_account: bdtAccount,
  }

  it("moves both halves back and says how to correct a rate", () => {
    const copy = exchangeReversal(exchange)
    expect(copy).toContain("$500.00 goes back into PayPal")
    expect(copy).toContain(`${formatBdt(58700)} comes back out of City Bank`)
    expect(copy).toContain("delete it and record it again")
  })
})

describe("payoutReversal and withdrawalReversal", () => {
  it("names who was paid", () => {
    const payout: ITeamPayout = {
      id: "t1",
      date: "2026-10-01",
      user_id: "u1",
      project_id: null,
      amount_bdt: 20000,
      type: "salary",
      account_id: "a2",
      notes: "",
      user: { id: "u1", full_name: "Rahim", email: "rahim@example.test" },
      account: bdtAccount,
    }
    expect(payoutReversal(payout)).toContain("payout to Rahim and puts")
  })

  it("puts a withdrawal back into its account", () => {
    const withdrawal: IOwnerWithdrawal = {
      id: "w1",
      date: "2026-10-01",
      amount_bdt: 10000,
      type: "personal",
      account_id: "a2",
      notes: "",
      account: bdtAccount,
    }
    expect(withdrawalReversal(withdrawal)).toBe(
      `This removes the ${formatBdt(10000)} withdrawal and puts ${formatBdt(10000)} back into City Bank.`,
    )
  })
})

describe("dueTransactionReversal", () => {
  const transaction: IDueTransaction = {
    id: "d1",
    due_person_id: "dp1",
    date: "2026-10-01",
    direction: "received",
    amount_bdt: 3000,
    account_id: "a2",
    notes: "",
    due_person: { id: "dp1", name: "Karim", phone: "" },
    account: bdtAccount,
  }

  it("takes money received back out of the account", () => {
    expect(dueTransactionReversal(transaction)).toContain("received from Karim and takes it back out of City Bank")
  })

  it("puts money paid out back into the account", () => {
    expect(dueTransactionReversal({ ...transaction, direction: "payment" })).toContain(
      "paid to Karim and puts it back into City Bank",
    )
  })
})
