"use client"

import MoneyRecordDialog from "@/components/modules/Admin/Money/MoneyRecordDialog"
import PaymentForm from "@/components/modules/Admin/Payments/PaymentForm"
import { Button } from "@/components/ui/button"
import type { IInvoice, IPayment } from "@/types/billing.types"
import { Plus } from "lucide-react"

type RecordPaymentModalProps = {
  /** Present to correct this payment; the table then drives `open`. */
  payment?: IPayment | null
  /** Present to pay this invoice, from its page. */
  invoice?: IInvoice | null
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const RecordPaymentModal = ({ payment, invoice, open, onOpenChange }: RecordPaymentModalProps) => (
  <MoneyRecordDialog
    title={payment ? "Edit payment" : "Record payment"}
    description={
      payment
        ? "Changing the amount, date or wallet reverses the old entry and writes a new one, so the balance follows."
        : "Money in from a client, always USD. This credits a USD wallet — BDT only appears when you exchange."
    }
    trigger={
      open === undefined && (
        <Button type="button" className="ml-auto shrink-0">
          <Plus className="size-4" />
          Record payment
        </Button>
      )
    }
    open={open}
    onOpenChange={onOpenChange}
  >
    {/* Keyed on the row, so opening another payment starts from its values. */}
    {(close) => <PaymentForm key={payment?.id ?? "new"} payment={payment} invoice={invoice} onDone={close} />}
  </MoneyRecordDialog>
)

export default RecordPaymentModal
