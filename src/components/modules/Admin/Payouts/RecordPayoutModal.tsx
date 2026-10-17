"use client"

import MoneyRecordDialog from "@/components/modules/Admin/Money/MoneyRecordDialog"
import PayoutForm from "@/components/modules/Admin/Payouts/PayoutForm"
import { Button } from "@/components/ui/button"
import type { ITeamPayout } from "@/types/spending.types"
import { Plus } from "lucide-react"

type RecordPayoutModalProps = {
  /** Present to correct this payout; the table then drives `open`. */
  payout?: ITeamPayout | null
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const RecordPayoutModal = ({ payout, open, onOpenChange }: RecordPayoutModalProps) => (
  <MoneyRecordDialog
    title={payout ? "Edit payout" : "Record payout"}
    description={
      payout
        ? "Changing the amount, date or account reverses the old entry and writes a new one, so the balance follows."
        : "What the agency pays its own people, in BDT."
    }
    trigger={
      open === undefined && (
        <Button type="button" className="ml-auto shrink-0">
          <Plus className="size-4" />
          Record payout
        </Button>
      )
    }
    open={open}
    onOpenChange={onOpenChange}
  >
    {(close) => <PayoutForm key={payout?.id ?? "new"} payout={payout} onDone={close} />}
  </MoneyRecordDialog>
)

export default RecordPayoutModal
