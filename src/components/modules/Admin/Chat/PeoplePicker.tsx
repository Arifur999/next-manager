"use client"

import EmptyState from "@/components/shared/state/EmptyState"
import PanelState from "@/components/shared/state/PanelState"
import { usersListQuery } from "@/queries/people.queries"
import { roleTitle } from "@/types/permission.types"
import { useQuery } from "@tanstack/react-query"
import { Users } from "lucide-react"

type PeoplePickerProps = {
  label: string
  selected: string[]
  onToggle: (personId: string) => void
  /** Never offered: yourself, and anybody already in the conversation. */
  excludeIds: string[]
  disabled?: boolean
}

/**
 * Colleagues to talk to. Asks the API for active people only, rather than
 * filtering here: the directory most roles get carries no status, so a filter
 * on it emptied the list. A failed load says so instead of looking empty.
 */
const PeoplePicker = ({ label, selected, onToggle, excludeIds, disabled = false }: PeoplePickerProps) => {
  const peopleQuery = useQuery(usersListQuery("status=active"))
  const people = (peopleQuery.data?.data ?? []).filter((person) => !excludeIds.includes(person.id))

  return (
    <fieldset className="space-y-1.5">
      <legend className="text-sm font-medium">{label}</legend>
      <div className="max-h-56 overflow-y-auto rounded-md border p-1">
        <PanelState
          query={peopleQuery}
          errorMessage="The people list did not load."
          isEmpty={people.length === 0}
          empty={<EmptyState icon={Users}>Nobody else to add yet.</EmptyState>}
        >
          <ul className="space-y-1">
            {people.map((person) => {
              const isPicked = selected.includes(person.id)

              return (
                <li key={person.id}>
                  <button
                    type="button"
                    onClick={() => onToggle(person.id)}
                    aria-pressed={isPicked}
                    disabled={disabled}
                    className={`w-full rounded px-2 py-1.5 text-left text-sm transition-colors ${
                      isPicked ? "bg-primary/10 font-medium" : "hover:bg-muted"
                    }`}
                  >
                    {person.full_name}
                    <span className="ml-2 text-xs text-muted-foreground">{roleTitle(person.role)}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </PanelState>
      </div>
    </fieldset>
  )
}

export default PeoplePicker
