"use client"

import DueTransactionForm from "@/components/modules/Admin/DuePayments/DueTransactionForm"
import MoneyRecordDialog from "@/components/modules/Admin/Money/MoneyRecordDialog"
import { Button } from "@/components/ui/button"
import type { IDuePerson } from "@/types/spending.types"
import { Plus } from "lucide-react"

const RecordTransactionModal = ({ people }: { people: IDuePerson[] }) => (
  <MoneyRecordDialog
    title="Record transaction"
    description="From the agency's point of view: received is money in, payment is money out."
    trigger={
      <Button type="button" className="shrink-0">
        <Plus className="size-4" />
        Record transaction
      </Button>
    }
  >
    {(close) => <DueTransactionForm people={people} onDone={close} />}
  </MoneyRecordDialog>
)

export default RecordTransactionModal
