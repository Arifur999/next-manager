"use client"

import ExpenseForm from "@/components/modules/Admin/Expenses/ExpenseForm"
import MoneyRecordDialog from "@/components/modules/Admin/Money/MoneyRecordDialog"
import { Button } from "@/components/ui/button"
import type { IExpense } from "@/types/spending.types"
import { Plus } from "lucide-react"

type RecordExpenseModalProps = {
  /** Present to correct this expense; the table then drives `open`. */
  expense?: IExpense | null
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const RecordExpenseModal = ({ expense, open, onOpenChange }: RecordExpenseModalProps) => (
  <MoneyRecordDialog
    title={expense ? "Edit expense" : "Record expense"}
    description={
      expense
        ? "Changing the amount, date or account reverses the old entry and writes a new one, so the balance follows."
        : "Money out, always BDT."
    }
    trigger={
      open === undefined && (
        <Button type="button" className="ml-auto shrink-0">
          <Plus className="size-4" />
          Record expense
        </Button>
      )
    }
    open={open}
    onOpenChange={onOpenChange}
  >
    {(close) => <ExpenseForm key={expense?.id ?? "new"} expense={expense} onDone={close} />}
  </MoneyRecordDialog>
)

export default RecordExpenseModal
