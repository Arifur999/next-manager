"use client"

import ExchangeForm from "@/components/modules/Admin/Exchange/ExchangeForm"
import MoneyRecordDialog from "@/components/modules/Admin/Money/MoneyRecordDialog"
import { Button } from "@/components/ui/button"
import { ArrowLeftRight } from "lucide-react"

const RecordExchangeModal = () => (
  <MoneyRecordDialog
    title="Record exchange"
    description="Moving USD into BDT. This is the only place BDT comes into existence."
    trigger={
      <Button type="button" className="ml-auto shrink-0">
        <ArrowLeftRight className="size-4" />
        Record exchange
      </Button>
    }
  >
    {(close) => <ExchangeForm onDone={close} />}
  </MoneyRecordDialog>
)

export default RecordExchangeModal
