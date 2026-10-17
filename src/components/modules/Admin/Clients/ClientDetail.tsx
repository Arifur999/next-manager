"use client"

import ClientFinanceTiles from "@/components/modules/Admin/Clients/ClientFinanceTiles"
import ClientHeaderActions, { type ClientAbilities } from "@/components/modules/Admin/Clients/ClientHeaderActions"
import ClientInvoicesPanel from "@/components/modules/Admin/Clients/ClientInvoicesPanel"
import ClientLinksPanel from "@/components/modules/Admin/Clients/ClientLinksPanel"
import ClientPaymentsPanel from "@/components/modules/Admin/Clients/ClientPaymentsPanel"
import CredentialsPanel from "@/components/modules/Admin/Vault/CredentialsPanel"
import PageHeader from "@/components/shared/PageHeader"
import EmptyState from "@/components/shared/state/EmptyState"
import ErrorState from "@/components/shared/state/ErrorState"
import LoadingBlock from "@/components/shared/state/LoadingBlock"
import NotFoundState from "@/components/shared/state/NotFoundState"
import StatusBadge from "@/components/shared/status/StatusBadge"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatUsd } from "@/lib/currency"
import { sentenceCase } from "@/lib/text"
import { clientDetailQuery, clientFinancialsQuery } from "@/queries/crm.queries"
import { useQuery } from "@tanstack/react-query"
import { FolderKanban } from "lucide-react"
import Link from "next/link"

const CLIENTS_HREF = "/admin/dashboard/clients"

type ClientDetailProps = ClientAbilities & {
  clientId: string
  canSeeMoney?: boolean
  /** Admin, sales and project managers keep a client's links and open the Vault. */
  canManageLinks?: boolean
  canOpenVault?: boolean
}

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
  canManageLinks = false,
  canOpenVault = false,
  canEdit,
  canAddProject,
  canRaiseInvoice,
}: ClientDetailProps) => {
  const clientQuery = useQuery(clientDetailQuery(clientId))
  const { data: financeData } = useQuery({ ...clientFinancialsQuery(clientId), enabled: canSeeMoney })

  const client = clientQuery.data?.data
  const finance = financeData?.data

  // Null is the API saying there is no such client here: nothing to retry.
  if (clientQuery.data === null) {
    return <NotFoundState homeHref={CLIENTS_HREF} homeLabel="Back to clients" />
  }

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
      <PageHeader
        title={client.name}
        breadcrumb={[{ label: "Clients", href: CLIENTS_HREF }]}
        actions={
          <ClientHeaderActions
            client={client}
            canEdit={canEdit}
            canAddProject={canAddProject}
            canRaiseInvoice={canRaiseInvoice}
          />
        }
      >
        {[sentenceCase(client.status), client.company, client.email, client.country].filter(Boolean).join(" · ")}
      </PageHeader>

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
              <EmptyState icon={FolderKanban}>No projects for this client yet.</EmptyState>
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
                        <StatusBadge category={project.status.category} label={project.status.name} />
                        {canSeeMoney && project.contract_value_usd !== undefined && (
                          <span className="text-sm tabular-nums">{formatUsd(project.contract_value_usd)}</span>
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
          <ClientLinksPanel clientId={clientId} canManage={canManageLinks} />
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
          <CredentialsPanel
            filter={`client_id=${clientId}`}
            title="Credentials for this client"
            emptyMessage="Nothing stored against this client yet."
            canOpenVault={canOpenVault}
          />
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
