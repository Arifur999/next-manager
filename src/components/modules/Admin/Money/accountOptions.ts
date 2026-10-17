import type { SelectOption } from "@/components/shared/form/EntitySelect"
import { formatMoney } from "@/lib/currency"
import type { Currency } from "@/types/common.types"
import type { IAccount } from "@/types/finance.types"

// A refused read (a role without the accounts permission) reaches the browser
// without its status, so it cannot be told from an outage: one message covers both.
export const ACCOUNTS_UNAVAILABLE = "Accounts did not load. If this keeps happening, ask an admin for access to accounts."

/**
 * The wallets a money form can use: one currency, active ones only, plus the
 * account the record being edited already uses, which may have been
 * deactivated since and must still show as chosen.
 */
export const pickAccountOptions = (
  accounts: IAccount[],
  currency: Currency,
  currentId?: string,
): SelectOption[] =>
  accounts
    .filter((account) => account.currency === currency && (account.is_active || account.id === currentId))
    .map((account) => ({ value: account.id, label: account.name, hint: formatMoney(account.balance, currency) }))
