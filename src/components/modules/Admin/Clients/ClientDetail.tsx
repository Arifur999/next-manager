"use client"

import StatTile from "@/components/shared/StatTile"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import ClientLinksPanel from "@/components/modules/Admin/Clients/ClientLinksPanel"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatBdt, formatUsd } from "@/lib/currency"
import {
  getClient,
  getClientFinancials,
  getCredentials,
  getInvoices,
  getPayments,
} from "@/services/agencio.services"
import type {
  IClient,
  IClientFinancials,
  ICredential,
  IInvoice,
  IPayment,
  IProject,
} from "@/types/agencio.types"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { ArrowDownLeft, FileText, FolderKanban, TrendingUp } from "lucide-react"
import Link from "next/link"

const ClientDetail = ({ clientId }: { clientId: string }) => {
  const { data: clientData, isLoading } = useQuery({
    queryKey: ["client", clientId],
    queryFn: () => getClient(clientId),
  })

  const { data: financeData } = useQuery({
    queryKey: ["client-financials", clientId],
    queryFn: () => getClientFinancials(clientId),
  })

  // Payments and invoices still come back unfiltered - those two endpoints
  // filter by search text rather than client id - so they are narrowed here.
  // The vault, which now takes a client_id, is asked for directly.
  const { data: paymentsData } = useQuery({
    queryKey: ["payments", ""],
    queryFn: () => getPayments(),
  })
  const { data: invoicesData } = useQuery({
    queryKey: ["invoices", ""],
    queryFn: () => getInvoices(),
  })
  const { data: credentialsData } = useQuery({
    queryKey: ["credentials", `client_id=${clientId}`],
    queryFn: () => getCredentials(`client_id=${clientId}`),
  })

  const client = clientData?.data as (IClient & { projects?: IProject[] }) | undefined
  const finance = financeData?.data as IClientFinancials | undefined

  const payments = ((paymentsData?.data ?? []) as IPayment[]).filter(
    (payment) => payment.client_id === clientId,
  )
  const invoices = ((invoicesData?.data ?? []) as IInvoice[]).filter(
    (invoice) => invoice.client_id === clientId,
  )
  const credentials = (credentialsData?.data ?? []) as ICredential[]

  if (isLoading && !client) {
    return <Card className="h-64 animate-pulse bg-muted/40" />
  }

  if (!client) return null

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

      {finance && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatTile
            label="Lifetime value"
            value={formatUsd(finance.lifetime_value_usd)}
            secondary={`${formatBdt(finance.lifetime_value_bdt_reporting)} at recorded rates`}
            // Money in the bank, not money hoped for — the server counts
            // received, never invoiced.
            hint={`${finance.payment_count} payment${finance.payment_count === 1 ? "" : "s"} received`}
            icon={<TrendingUp className="size-5" />}
            tone={1}
          />
          <StatTile
            label="Invoiced"
            value={formatUsd(finance.total_invoiced_usd)}
            hint="Excludes drafts and cancelled invoices"
            icon={<FileText className="size-5" />}
            tone={2}
          />
          <StatTile
            label="Outstanding"
            value={formatUsd(finance.outstanding_usd)}
            hint="Floored at zero — an overpayment is a credit, not a negative debt"
            icon={<ArrowDownLeft className="size-5" />}
            tone={4}
          />
          <StatTile
            label="Projects"
            value={String(finance.project_count)}
            hint={`Client since ${format(new Date(finance.client_since), "MMM yyyy")}`}
            icon={<FolderKanban className="size-5" />}
            tone={3}
          />
        </div>
      )}

      <Tabs defaultValue="projects">
        <TabsList>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="links">Links</TabsTrigger>
          <TabsTrigger value="vault">Vault</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="mt-4">
          <Card className="gap-0 overflow-hidden p-0">
            {(client.projects ?? []).length === 0 ? (
              <p className="px-5 py-12 text-center text-sm text-muted-foreground">
                No projects for this client yet.
              </p>
            ) : (
              <ul className="divide-y">
                {(client.projects ?? []).map((project) => (
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
                          {project.status.replace(/_/g, " ")}
                        </Badge>
                        <span className="text-sm tabular-nums">
                          {formatUsd(project.contract_value_usd)}
                        </span>
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

        <TabsContent value="payments" className="mt-4">
          <Card className="gap-0 overflow-hidden p-0">
            {payments.length === 0 ? (
              <p className="px-5 py-12 text-center text-sm text-muted-foreground">
                Nothing received from this client yet.
              </p>
            ) : (
              <ul className="divide-y">
                {payments.map((payment) => (
                  <li
                    key={payment.id}
                    className="flex items-center justify-between gap-3 px-5 py-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm tabular-nums">{formatUsd(payment.amount_usd)}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {format(new Date(payment.date), "MMM dd, yyyy")}
                        {payment.reference ? ` · ${payment.reference}` : ""}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                      {formatBdt(payment.amount_bdt_reporting)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="mt-4">
          <Card className="gap-0 overflow-hidden p-0">
            {invoices.length === 0 ? (
              <p className="px-5 py-12 text-center text-sm text-muted-foreground">
                No invoices raised for this client yet.
              </p>
            ) : (
              <ul className="divide-y">
                {invoices.map((invoice) => (
                  <li key={invoice.id}>
                    <Link
                      href={`/admin/dashboard/invoices/${invoice.id}`}
                      className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-muted/50"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{invoice.invoice_number}</p>
                        <p className="text-xs text-muted-foreground">
                          due {format(new Date(invoice.due_date), "MMM dd, yyyy")}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <Badge
                          variant="outline"
                          className={`capitalize ${invoice.is_overdue ? "border-destructive text-destructive" : ""}`}
                        >
                          {(invoice.is_overdue ? "overdue" : invoice.status).replace(/_/g, " ")}
                        </Badge>
                        <span className="text-sm tabular-nums">{formatUsd(invoice.total)}</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="vault" className="mt-4">
          <Card className="gap-0 overflow-hidden p-0">
            {credentials.length === 0 ? (
              <p className="px-5 py-12 text-center text-sm text-muted-foreground">
                Nothing stored against this client yet.
              </p>
            ) : (
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
            )}
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
