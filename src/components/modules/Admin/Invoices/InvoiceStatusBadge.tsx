import { INVOICE_STATUS_CATEGORY, shownInvoiceStatus } from "@/components/modules/Admin/Invoices/invoiceStatus"
import StatusBadge from "@/components/shared/status/StatusBadge"
import type { IInvoice } from "@/types/billing.types"

const InvoiceStatusBadge = ({ invoice }: { invoice: Pick<IInvoice, "status" | "is_overdue"> }) => {
  const status = shownInvoiceStatus(invoice)
  return <StatusBadge category={INVOICE_STATUS_CATEGORY[status]} label={status} />
}

export default InvoiceStatusBadge
