import type { IInvoice, InvoiceStatus } from "@/types/billing.types"
import type { StatusCategory } from "@/types/common.types"

// What each invoice status means, so it takes the shared status look: owed is
// in progress, paid is done, overdue needs a look, cancelled is out.
export const INVOICE_STATUS_CATEGORY: Record<InvoiceStatus, StatusCategory> = {
  draft: "open",
  sent: "active",
  partially_paid: "active",
  paid: "done",
  overdue: "blocked",
  cancelled: "cancelled",
}

// is_overdue is derived from today's date on the server, so it can be true
// while status still reads "sent"; the derived state is the honest one.
export const shownInvoiceStatus = (invoice: Pick<IInvoice, "status" | "is_overdue">): InvoiceStatus =>
  invoice.is_overdue ? "overdue" : invoice.status

type InvoiceMoneyState = Pick<IInvoice, "status" | "paid_usd">

const isClosed = (invoice: InvoiceMoneyState) => invoice.status === "paid" || invoice.status === "cancelled"

/**
 * Edit and cancel only while nothing has been paid: once money is against an
 * invoice, changing its lines or calling it off would leave that payment
 * pointing at a document that no longer says what was paid for.
 */
export const isUnpaidInvoice = (invoice: InvoiceMoneyState): boolean =>
  !isClosed(invoice) && (invoice.paid_usd ?? 0) === 0

/** A payment can be recorded against anything still owed. */
export const canTakePayment = (invoice: InvoiceMoneyState): boolean => !isClosed(invoice)
