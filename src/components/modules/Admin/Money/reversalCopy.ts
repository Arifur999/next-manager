import { formatBdt, formatUsd } from "@/lib/currency"
import type { IPayment } from "@/types/billing.types"
import type { IExchange } from "@/types/finance.types"
import type { IDueTransaction, IExpense, IOwnerWithdrawal, ITeamPayout } from "@/types/spending.types"

// What deleting a money record does to the balances, in the words the
// confirmation shows. The API never erases a ledger row: it writes the
// opposite entry, so each sentence names the account and the amount that move.

const accountName = (account: { name: string } | undefined) => account?.name ?? "its account"

export const paymentReversal = (payment: IPayment): string => {
  const amount = formatUsd(payment.amount_usd)
  const client = payment.client?.name ?? "the client"
  const invoiceNote = payment.invoice_id ? " The invoice it paid goes back to owing that amount." : ""
  return `This removes the ${amount} payment from ${client} and takes ${amount} back out of ${accountName(payment.account)}.${invoiceNote}`
}

export const expenseReversal = (expense: IExpense): string => {
  const amount = formatBdt(expense.amount_bdt)
  const what = expense.vendor || expense.category?.name || "this"
  return `This removes the ${amount} expense for ${what} and puts ${amount} back into ${accountName(expense.account)}.`
}

export const exchangeReversal = (exchange: IExchange): string =>
  `This removes the exchange: ${formatUsd(exchange.amount_usd)} goes back into ${accountName(exchange.from_account)} ` +
  `and ${formatBdt(exchange.amount_bdt)} comes back out of ${accountName(exchange.to_account)}. ` +
  "An exchange cannot be edited, so to fix a rate, delete it and record it again."

export const payoutReversal = (payout: ITeamPayout): string => {
  const amount = formatBdt(payout.amount_bdt)
  const member = payout.user?.full_name ?? "this team member"
  return `This removes the ${amount} payout to ${member} and puts ${amount} back into ${accountName(payout.account)}.`
}

export const withdrawalReversal = (withdrawal: IOwnerWithdrawal): string => {
  const amount = formatBdt(withdrawal.amount_bdt)
  return `This removes the ${amount} withdrawal and puts ${amount} back into ${accountName(withdrawal.account)}.`
}

export const dueTransactionReversal = (transaction: IDueTransaction): string => {
  const amount = formatBdt(transaction.amount_bdt)
  const person = transaction.due_person?.name ?? "this person"
  const account = accountName(transaction.account)
  // Received money came in, so undoing it takes it back out; a payment the other way round.
  const movement =
    transaction.direction === "received"
      ? `the ${amount} received from ${person} and takes it back out of ${account}`
      : `the ${amount} paid to ${person} and puts it back into ${account}`
  return `This removes ${movement}. Their balance moves back by the same amount.`
}
