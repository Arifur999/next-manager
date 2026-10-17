"use client"

import MoneyRecordDialog from "@/components/modules/Admin/Money/MoneyRecordDialog"
import WithdrawalForm from "@/components/modules/Admin/Withdrawals/WithdrawalForm"
import { Button } from "@/components/ui/button"
import type { IOwnerWithdrawal } from "@/types/spending.types"
import { Plus } from "lucide-react"

type RecordWithdrawalModalProps = {
  /** Present to correct this withdrawal; the table then drives `open`. */
  withdrawal?: IOwnerWithdrawal | null
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const RecordWithdrawalModal = ({ withdrawal, open, onOpenChange }: RecordWithdrawalModalProps) => (
  <MoneyRecordDialog
    title={withdrawal ? "Edit withdrawal" : "Record withdrawal"}
    description={
      withdrawal
        ? "Changing the amount, date or account reverses the old entry and writes a new one, so the balance follows."
        : "Money you take out of the business. Not a business expense — reports keep it out of cost, so profit is not understated by the amount taken."
    }
    trigger={
      open === undefined && (
        <Button type="button" className="ml-auto shrink-0">
          <Plus className="size-4" />
          Record withdrawal
        </Button>
      )
    }
    open={open}
    onOpenChange={onOpenChange}
  >
    {(close) => <WithdrawalForm key={withdrawal?.id ?? "new"} withdrawal={withdrawal} onDone={close} />}
  </MoneyRecordDialog>
)

export default RecordWithdrawalModal
