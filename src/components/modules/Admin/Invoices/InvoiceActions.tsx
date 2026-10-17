"use client"

import { cancelInvoiceAction } from "@/app/(dashboardLayout)/admin/dashboard/invoices/_action"
import InvoiceFormModal from "@/components/modules/Admin/Invoices/InvoiceFormModal"
import { canTakePayment, isUnpaidInvoice } from "@/components/modules/Admin/Invoices/invoiceStatus"
import RecordPaymentModal from "@/components/modules/Admin/Payments/RecordPaymentModal"
import ConfirmDialog from "@/components/shared/dialog/ConfirmDialog"
import { Button } from "@/components/ui/button"
import { useActionMutation } from "@/hooks/useActionMutation"
import { formatUsd } from "@/lib/currency"
import { queryKeys } from "@/lib/queryKeys"
import type { IInvoice } from "@/types/billing.types"
import { Ban, Pencil, Printer } from "lucide-react"
import { useState } from "react"

type InvoiceActionsProps = {
  invoice: IInvoice
  /** Payments are admin-only on the API, so sales never sees this button. */
  canRecordPayment: boolean
}

// What can be done with an invoice from its page. Edit and Cancel only while
// nothing is paid against it (see isUnpaidInvoice).
const InvoiceActions = ({ invoice, canRecordPayment }: InvoiceActionsProps) => {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isCancelOpen, setIsCancelOpen] = useState(false)
  const isUnpaid = isUnpaidInvoice(invoice)

  const { run: cancelInvoice, isPending: isCancelling } = useActionMutation({
    action: cancelInvoiceAction,
    successMessage: `${invoice.invoice_number} cancelled`,
    invalidateKeys: [queryKeys.invoices.all, queryKeys.clientFinancials.all, queryKeys.dashboard.all],
  })

  const handleCancel = async () => {
    if (await cancelInvoice(invoice.id)) setIsCancelOpen(false)
  }

  return (
    <div className="flex flex-wrap items-center gap-2" data-print="hide">
      {canRecordPayment && canTakePayment(invoice) && <RecordPaymentModal invoice={invoice} />}

      {isUnpaid && (
        <>
          <Button type="button" variant="outline" onClick={() => setIsEditOpen(true)}>
            <Pencil className="size-4" />
            Edit
          </Button>
          <Button type="button" variant="outline" onClick={() => setIsCancelOpen(true)}>
            <Ban className="size-4" />
            Cancel invoice
          </Button>
        </>
      )}

      <Button type="button" variant="outline" onClick={() => window.print()}>
        <Printer className="size-4" />
        Print / save as PDF
      </Button>

      {isUnpaid && (
        <>
          <InvoiceFormModal invoice={invoice} open={isEditOpen} onOpenChange={setIsEditOpen} />
          <ConfirmDialog
            open={isCancelOpen}
            onOpenChange={setIsCancelOpen}
            title={`Cancel ${invoice.invoice_number}?`}
            description={`It stops counting as owed, so ${formatUsd(invoice.total)} comes off what clients owe and it never goes overdue. Nothing has been paid against it, so no money moves. A cancelled invoice stays on record and cannot be reopened; raise a new one if the work is billed after all.`}
            variant="destructive"
            confirmLabel="Cancel invoice"
            pendingLabel="Cancelling..."
            isPending={isCancelling}
            onConfirm={() => void handleCancel()}
          />
        </>
      )}
    </div>
  )
}

export default InvoiceActions
