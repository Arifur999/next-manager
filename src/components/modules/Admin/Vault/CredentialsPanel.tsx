"use client"

import EmptyState from "@/components/shared/state/EmptyState"
import PanelState from "@/components/shared/state/PanelState"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { credentialsListQuery } from "@/queries/workspace.queries"
import { useQuery } from "@tanstack/react-query"
import { KeyRound } from "lucide-react"
import Link from "next/link"

type CredentialsPanelProps = {
  /** `client_id=...` or `project_id=...`. */
  filter: string
  title: string
  emptyMessage: string
  /** Operations reads these on a project but cannot open the Vault page. */
  canOpenVault: boolean
}

/**
 * The credentials stored against one client or project, masked. Revealing is
 * logged against a person, so it belongs on the Vault page, where that
 * consequence is spelled out.
 */
const CredentialsPanel = ({ filter, title, emptyMessage, canOpenVault }: CredentialsPanelProps) => {
  const credentialsQuery = useQuery(credentialsListQuery(filter))
  const credentials = credentialsQuery.data?.data ?? []

  return (
    <Card className="gap-0 overflow-hidden p-0">
      <CardHeader className="flex flex-row items-center justify-between border-b px-5 py-4">
        <CardTitle className="text-base">{title}</CardTitle>
        {canOpenVault && (
          <Link href="/admin/dashboard/vault" className="text-sm text-primary underline-offset-4 hover:underline">
            Open the Vault
          </Link>
        )}
      </CardHeader>

      <PanelState
        query={credentialsQuery}
        errorMessage="The vault entries did not load."
        isEmpty={credentials.length === 0}
        empty={<EmptyState icon={KeyRound}>{emptyMessage}</EmptyState>}
      >
        <ul className="divide-y">
          {credentials.map((credential) => (
            <li key={credential.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{credential.label}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {credential.username || "no username"}
                  {credential.url ? ` · ${credential.url}` : ""}
                </p>
              </div>
              <span className="shrink-0 font-mono text-xs text-muted-foreground">{credential.password}</span>
            </li>
          ))}
        </ul>
      </PanelState>
    </Card>
  )
}

export default CredentialsPanel
