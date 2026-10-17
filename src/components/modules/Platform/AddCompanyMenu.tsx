"use client"

import CreateCompanyModal from "@/components/modules/Platform/CreateCompanyModal"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, KeyRound, Plus, Send } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

// The two ways a company arrives. The invite link comes first because the owner
// sets their own password; a typed password has to be handed over by somebody.
const AddCompanyMenu = () => {
  const [isCreating, setIsCreating] = useState(false)

  return (
    <>
      {/* Not modal: a modal menu handing focus to a dialog can leave the page unclickable. */}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button type="button">
            <Plus className="size-4" aria-hidden="true" />
            Add a company
            <ChevronDown className="size-4" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuItem asChild>
            <Link href="/platform/invite-agency">
              <Send aria-hidden="true" />
              Send invite link (recommended)
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setIsCreating(true)}>
            <KeyRound aria-hidden="true" />
            Create with a starting password
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateCompanyModal open={isCreating} onOpenChange={setIsCreating} />
    </>
  )
}

export default AddCompanyMenu
