import { describe, expect, it } from "vitest"
import { canTakePayment, isUnpaidInvoice, shownInvoiceStatus } from "./invoiceStatus"

describe("shownInvoiceStatus", () => {
  it("shows overdue over the stored status", () => {
    expect(shownInvoiceStatus({ status: "sent", is_overdue: true })).toBe("overdue")
    expect(shownInvoiceStatus({ status: "partially_paid", is_overdue: false })).toBe("partially_paid")
  })
})

describe("isUnpaidInvoice", () => {
  it("allows editing and cancelling a sent invoice with nothing paid", () => {
    expect(isUnpaidInvoice({ status: "sent", paid_usd: 0 })).toBe(true)
    expect(isUnpaidInvoice({ status: "draft", paid_usd: undefined })).toBe(true)
  })

  it("refuses once money is against it, or it is closed", () => {
    expect(isUnpaidInvoice({ status: "partially_paid", paid_usd: 100 })).toBe(false)
    expect(isUnpaidInvoice({ status: "paid", paid_usd: 300 })).toBe(false)
    expect(isUnpaidInvoice({ status: "cancelled", paid_usd: 0 })).toBe(false)
  })
})

describe("canTakePayment", () => {
  it("takes payments until the invoice is paid or cancelled", () => {
    expect(canTakePayment({ status: "partially_paid", paid_usd: 100 })).toBe(true)
    expect(canTakePayment({ status: "paid", paid_usd: 300 })).toBe(false)
    expect(canTakePayment({ status: "cancelled", paid_usd: 0 })).toBe(false)
  })
})
