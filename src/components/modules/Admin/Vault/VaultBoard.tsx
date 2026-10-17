"use client"

import CredentialCard from "@/components/modules/Admin/Vault/CredentialCard"
import CredentialFormModal from "@/components/modules/Admin/Vault/CredentialFormModal"
import ErrorState from "@/components/shared/state/ErrorState"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useQuery } from "@tanstack/react-query"
import { Search, ShieldCheck } from "lucide-react"
import { useEffect, useState } from "react"
import { credentialsListQuery } from "@/queries/workspace.queries"

// The page reads the role: everybody here may edit (the API still checks the
// vault edit square), and only the admin may delete or read the access log.
const VaultBoard = ({ isAdmin }: { isAdmin: boolean }) => {
  const [term, setTerm] = useState("")
  const [search, setSearch] = useState("")

  // Debounced by hand rather than through DataTableSearch: this is a card grid,
  // not a table.
  useEffect(() => {
    const timer = setTimeout(() => setSearch(term), 350)
    return () => clearTimeout(timer)
  }, [term])

  const credentialsList = useQuery(
    credentialsListQuery(search ? `search=${encodeURIComponent(search)}` : undefined),
  )

  const credentials = credentialsList.data?.data ?? []

  const renderCredentials = () => {
    if (credentialsList.isError) {
      return (
        <ErrorState
          className="rounded-xl border border-dashed"
          message="The vault did not load."
          onRetry={() => void credentialsList.refetch()}
          isRetrying={credentialsList.isFetching}
        />
      )
    }

    if (credentialsList.isLoading) {
      return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="h-48 animate-pulse bg-muted/40" />
          ))}
        </div>
      )
    }

    if (credentials.length === 0) {
      return (
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
      )
    }

    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {credentials.map((credential) => (
          <CredentialCard
            key={credential.id}
            credential={credential}
            canEdit
            canDelete={isAdmin}
            canSeeLog={isAdmin}
          />
        ))}
      </div>
    )
  }

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

        <CredentialFormModal />
      </div>

      {renderCredentials()}
    </div>
  )
}

export default VaultBoard
