"use client"

import ClientFinanceTiles from "@/components/modules/Admin/Clients/ClientFinanceTiles"
import ClientInvoicesPanel from "@/components/modules/Admin/Clients/ClientInvoicesPanel"
import ClientPaymentsPanel from "@/components/modules/Admin/Clients/ClientPaymentsPanel"
import EmptyState from "@/components/shared/state/EmptyState"
import ErrorState from "@/components/shared/state/ErrorState"
import LoadingBlock from "@/components/shared/state/LoadingBlock"
import PanelState from "@/components/shared/state/PanelState"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import ClientLinksPanel from "@/components/modules/Admin/Clients/ClientLinksPanel"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatUsd } from "@/lib/currency"
import { useQuery } from "@tanstack/react-query"
import { KeyRound } from "lucide-react"
import Link from "next/link"
import { clientDetailQuery, clientFinancialsQuery } from "@/queries/crm.queries"
import { credentialsListQuery } from "@/queries/workspace.queries"

/**
 * One client, and how much of them somebody may see.
 *
 * `canSeeMoney` is decided by the page from the role it rendered for, the same
 * way LeaveBoard is told whether to offer Approve. When it is false the money
 * is not hidden with CSS — it is NOT FETCHED. The endpoints behind these panels
 * are admin-only and would refuse a salesperson anyway, so asking would produce
 * a broken panel and a 403 in the log for a question the page already knew the
 * answer to.
 */
const ClientDetail = ({
  clientId,
  canSeeMoney = false,
}: {
  clientId: string
  canSeeMoney?: boolean
}) => {
  const clientQuery = useQuery(clientDetailQuery(clientId))

  const { data: financeData } = useQuery({ ...clientFinancialsQuery(clientId), enabled: canSeeMoney })

  const credentialsQuery = useQuery(credentialsListQuery(`client_id=${clientId}`))

  const client = clientQuery.data?.data
  const finance = financeData?.data

  const credentials = credentialsQuery.data?.data ?? []

  // A failed refresh keeps the client it already has on screen; only a page
  // with nothing to show says it did not load.
  if (!client && clientQuery.isError) {
    return (
      <Card>
        <ErrorState
          message="This client did not load."
          onRetry={() => void clientQuery.refetch()}
          isRetrying={clientQuery.isFetching}
        />
      </Card>
    )
  }

  if (!client) {
    return (
      <Card className="overflow-hidden p-0">
        <LoadingBlock height="h-64" />
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{client.name}</h1>
            <Badge variant="outline" className="capitalize">
              {client.status}
            </Badge>
          </div>
          <p className="mt-1 truncate text-sm text-muted-foreground">
            {[client.company, client.email, client.country].filter(Boolean).join(" · ") || "—"}
          </p>
        </div>
      </div>

      {/* Undefined for anybody who may not see it, because the query never
          ran — not because a flag is checked in two places. */}
      {canSeeMoney && finance && <ClientFinanceTiles finance={finance} />}

      <Tabs defaultValue="projects">
        <TabsList>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          {canSeeMoney && <TabsTrigger value="payments">Payments</TabsTrigger>}
          {canSeeMoney && <TabsTrigger value="invoices">Invoices</TabsTrigger>}
          <TabsTrigger value="links">Links</TabsTrigger>
          <TabsTrigger value="vault">Vault</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="mt-4">
          <Card className="gap-0 overflow-hidden p-0">
            {client.projects.length === 0 ? (
              <p className="px-5 py-12 text-center text-sm text-muted-foreground">
                No projects for this client yet.
              </p>
            ) : (
              <ul className="divide-y">
                {client.projects.map((project) => (
                  <li key={project.id}>
                    <Link
                      href={`/admin/dashboard/projects/${project.id}`}
                      className="flex items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-muted/50"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{project.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{project.code}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <Badge variant="outline" className="capitalize">
                          {project.status.name}
                        </Badge>
                        {canSeeMoney && (
                          <span className="text-sm tabular-nums">
                            {formatUsd(project.contract_value_usd)}
                          </span>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="links" className="mt-4">
          <ClientLinksPanel clientId={clientId} />
        </TabsContent>

        {/* Rendered for money roles only: both panels fetch admin-only lists,
            which anybody else would be refused. */}
        {canSeeMoney && (
        <>
        <TabsContent value="payments" className="mt-4">
          <ClientPaymentsPanel clientId={clientId} />
        </TabsContent>

        <TabsContent value="invoices" className="mt-4">
          <ClientInvoicesPanel clientId={clientId} />
        </TabsContent>
        </>
        )}

        <TabsContent value="vault" className="mt-4">
          <Card className="gap-0 overflow-hidden p-0">
            <PanelState
              query={credentialsQuery}
              errorMessage="The vault entries did not load."
              isEmpty={credentials.length === 0}
              empty={<EmptyState icon={KeyRound}>Nothing stored against this client yet.</EmptyState>}
            >
              <ul className="divide-y">
                {credentials.map((credential) => (
                  <li
                    key={credential.id}
                    className="flex items-center justify-between gap-3 px-5 py-3.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{credential.label}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {credential.username || "no username"}
                        {credential.url ? ` · ${credential.url}` : ""}
                      </p>
                    </div>

                    {/* Masked here on purpose. Revealing is logged against a
                        person, so it belongs on the Vault screen where that
                        consequence is spelled out. */}
                    <span className="shrink-0 font-mono text-xs text-muted-foreground">
                      {credential.password}
                    </span>
                  </li>
                ))}
              </ul>
            </PanelState>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="mt-4">
          <Card className="p-5">
            <p className="whitespace-pre-wrap text-sm">
              {client.notes || <span className="text-muted-foreground">No notes.</span>}
            </p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ClientDetail
