"use client"

import AddCredentialModal from "@/components/modules/Admin/Vault/AddCredentialModal"
import CredentialCard from "@/components/modules/Admin/Vault/CredentialCard"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { getCredentials } from "@/services/agencio.services"
import type { ICredential } from "@/types/agencio.types"
import { useQuery } from "@tanstack/react-query"
import { Search, ShieldCheck } from "lucide-react"
import { useEffect, useState } from "react"

const VaultBoard = () => {
  const [term, setTerm] = useState("")
  const [search, setSearch] = useState("")

  // Debounced by hand rather than through DataTableSearch: this is a card grid,
  // not a table.
  useEffect(() => {
    const timer = setTimeout(() => setSearch(term), 350)
    return () => clearTimeout(timer)
  }, [term])

  const { data, isLoading } = useQuery({
    queryKey: ["credentials", search],
    queryFn: () => getCredentials(search ? `search=${encodeURIComponent(search)}` : undefined),
  })

  const credentials = (data?.data ?? []) as ICredential[]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Search by label, URL, username or client..."
            className="pl-9"
          />
        </div>

        <AddCredentialModal />
      </div>

      {isLoading && credentials.length === 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="h-48 animate-pulse bg-muted/40" />
          ))}
        </div>
      ) : credentials.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 px-6 py-16 text-center">
          <ShieldCheck className="size-8 text-muted-foreground" aria-hidden="true" />
          <p className="text-sm font-medium">
            {search ? "Nothing matches that search." : "No credentials stored yet."}
          </p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Passwords are encrypted before they are saved. Searching works on the label, URL and
            username — never on the secret itself.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {credentials.map((credential) => (
            <CredentialCard key={credential.id} credential={credential} />
          ))}
        </div>
      )}
    </div>
  )
}

export default VaultBoard
