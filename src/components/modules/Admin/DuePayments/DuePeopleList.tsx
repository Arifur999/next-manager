"use client"

import { deleteDuePersonAction } from "@/app/(dashboardLayout)/admin/dashboard/due-payments/_action"
import DuePersonModal from "@/components/modules/Admin/DuePayments/DuePersonModal"
import DeleteMoneyRecordDialog from "@/components/modules/Admin/Money/DeleteMoneyRecordDialog"
import EmptyState from "@/components/shared/state/EmptyState"
import PanelState from "@/components/shared/state/PanelState"
import DataTableRowActions from "@/components/shared/table/DataTableRowActions"
import { useRowActionModalState } from "@/hooks/useRowActionModalState"
import { formatBdt } from "@/lib/currency"
import { queryKeys } from "@/lib/queryKeys"
import type { IDuePerson } from "@/types/spending.types"
import type { UseQueryResult } from "@tanstack/react-query"
import { Scale } from "lucide-react"

// Which way a balance points, in words: a signed number alone makes every
// reader work the convention out again.
const balanceDirection = (balanceBdt: number) => {
  if (balanceBdt === 0) return "settled"
  if (balanceBdt < 0) return "they owe you"
  return "you owe them"
}

type DuePeopleListProps = {
  query: UseQueryResult<unknown>
  people: IDuePerson[]
}

// Balance per person, with their details correctable and a person removable
// while nothing has been recorded against them.
const DuePeopleList = ({ query, people }: DuePeopleListProps) => {
  const {
    editingItem,
    deletingItem,
    isEditModalOpen,
    isDeleteDialogOpen,
    onEditOpenChange,
    onDeleteOpenChange,
    tableActions,
  } = useRowActionModalState<IDuePerson>({ enableView: false })

  return (
    <>
      <PanelState
        query={query}
        errorMessage="Balances did not load."
        isEmpty={people.length === 0}
        empty={
          <EmptyState icon={Scale} hint="Add someone the agency lends to or borrows from.">
            Nobody added yet.
          </EmptyState>
        }
      >
        <ul className="divide-y">
          {people.map((person) => (
            <li key={person.id} className="flex items-center justify-between gap-3 py-3.5 pr-3 pl-5">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{person.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {formatBdt(person.total_received_bdt)} in · {formatBdt(person.total_payment_bdt)} out
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <div className="text-right">
                  <p className="text-sm font-medium tabular-nums">{formatBdt(Math.abs(person.balance_bdt))}</p>
                  <p className="text-xs text-muted-foreground">{balanceDirection(person.balance_bdt)}</p>
                </div>
                <DataTableRowActions row={person} actions={tableActions} />
              </div>
            </li>
          ))}
        </ul>
      </PanelState>

      <DuePersonModal person={editingItem} open={isEditModalOpen} onOpenChange={onEditOpenChange} />

      <DeleteMoneyRecordDialog
        open={isDeleteDialogOpen}
        onOpenChange={onDeleteOpenChange}
        recordId={deletingItem?.id}
        title="Remove this person?"
        description={`This removes ${deletingItem?.name ?? "them"} from the list. No money moves. Someone with recorded transactions cannot be removed, because those transactions moved real money through your accounts.`}
        action={deleteDuePersonAction}
        successMessage="Person removed"
        invalidateKeys={[queryKeys.duePeople.all]}
      />
    </>
  )
}

export default DuePeopleList
