"use client"

import InvoiceForm from "@/components/modules/Admin/Invoices/InvoiceForm"
import MoneyRecordDialog from "@/components/modules/Admin/Money/MoneyRecordDialog"
import { Button } from "@/components/ui/button"
import type { IInvoice } from "@/types/billing.types"
import { Plus } from "lucide-react"

type InvoiceFormModalProps = {
  /** Present to correct this invoice; the caller then drives `open`. */
  invoice?: IInvoice | null
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

// Creating an invoice, or correcting one before anything is paid against it.
const InvoiceFormModal = ({ invoice, open, onOpenChange }: InvoiceFormModalProps) => (
  <MoneyRecordDialog
    title={invoice ? `Edit ${invoice.invoice_number}` : "New invoice"}
    description={
      invoice
        ? "The total is worked out again from the lines. The number stays as it is."
        : "Billed in USD. The number is generated for you, and the total comes from the lines."
    }
    trigger={
      open === undefined && (
        <Button type="button" className="ml-auto shrink-0">
          <Plus className="size-4" />
          New invoice
        </Button>
      )
    }
    open={open}
    onOpenChange={onOpenChange}
    size="wide"
  >
    {(close) => <InvoiceForm key={invoice?.id ?? "new"} invoice={invoice} onDone={close} />}
  </MoneyRecordDialog>
)

export default InvoiceFormModal
