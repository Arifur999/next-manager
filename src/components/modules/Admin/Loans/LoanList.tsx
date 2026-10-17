"use client"

import LoanCard from "@/components/modules/Admin/Loans/LoanCard"
import EmptyState from "@/components/shared/state/EmptyState"
import LoadingBlock from "@/components/shared/state/LoadingBlock"
import { Card } from "@/components/ui/card"
import type { IAccount, ILoan, ILoanInstalment } from "@/types/finance.types"
import { Landmark } from "lucide-react"

const LoanList = ({
  loans,
  isLoading,
  accounts,
  onPay,
  onReverse,
  onClose,
  onDelete,
}: {
  loans: ILoan[]
  isLoading: boolean
  accounts: IAccount[]
  onPay: (instalmentId: string, accountId: string) => void
  onReverse: (instalment: ILoanInstalment) => void
  onClose: (loan: ILoan) => void
  onDelete: (loan: ILoan) => void
}) => {
  if (isLoading && loans.length === 0) {
    return (
      <Card>
        <LoadingBlock rounded />
      </Card>
    )
  }

  if (loans.length === 0) {
    return (
      <Card>
        <EmptyState icon={Landmark}>Nothing borrowed.</EmptyState>
      </Card>
    )
  }

  return (
    <>
      {loans.map((loan) => (
        <LoanCard
          key={loan.id}
          loan={loan}
          accounts={accounts}
          onPay={onPay}
          onReverse={onReverse}
          onClose={() => onClose(loan)}
          onDelete={() => onDelete(loan)}
        />
      ))}
    </>
  )
}

export default LoanList
