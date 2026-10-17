"use client"

import RelativeTime from "@/components/shared/RelativeTime"
import CountSection from "@/components/shared/dashboard/CountSection"
import { countFields, queryFields, useCount } from "@/components/shared/dashboard/useCount"
import EmptyState from "@/components/shared/state/EmptyState"
import PanelState from "@/components/shared/state/PanelState"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { useQuery } from "@tanstack/react-query"
import { FolderKanban, ListChecks, Package, UserCheck, UserPlus, Users } from "lucide-react"
import Link from "next/link"
import { clientsListQuery } from "@/queries/crm.queries"
import { projectsListQuery } from "@/queries/project.queries"
import { taskReportQuery } from "@/queries/work.queries"
import { servicesListQuery } from "@/queries/catalog.queries"

/**
 * What a salesperson opens the morning with.
 *
 * Client → Requirement → Service → Handoff, in that order, because that is the
 * order the work happens in. The handoff row is the one that matters most: a
 * project sitting in Planning is one nobody has picked up yet, and it is the
 * salesperson who notices before the client does.
 */
const SalesOverview = () => {
  const clients = useCount(clientsListQuery("limit=1"))
  const active = useCount(clientsListQuery("status=active&limit=1"))
  const inactive = useCount(clientsListQuery("status=inactive&limit=1"))
  const services = useCount(servicesListQuery("limit=1"))

  const planning = useCount(projectsListQuery("status=Planning&limit=1"))
  const activeProjects = useCount(projectsListQuery("status=Active&limit=1"))

  const reportQuery = useQuery(taskReportQuery())
  const reportData = reportQuery.data
  const report = reportData?.data

  // The list, not just the number: "recently added" is a thing to act on, and a
  // count of it would say nothing useful.
  const recentQuery = useQuery(clientsListQuery("limit=5"))
  const recentData = recentQuery.data
  const recent = recentData?.data ?? []

  return (
    <div className="space-y-6">
      <CountSection
        title="Sales overview"
        counts={[
          {
            label: "Total clients",
            ...countFields(clients),
            href: "/admin/dashboard/clients",
            icon: <Users className="size-5" />,
            tone: 1,
          },
          {
            label: "Active clients",
            ...countFields(active),
            href: "/admin/dashboard/clients?status=active",
            icon: <UserCheck className="size-5" />,
            tone: 3,
          },
          {
            label: "Inactive",
            ...countFields(inactive),
            href: "/admin/dashboard/clients?status=inactive",
            hint: "Worth a call",
            icon: <Users className="size-5" />,
            tone: 4,
          },
          {
            label: "Services",
            ...countFields(services),
            href: "/admin/dashboard/services",
            hint: "What there is to sell",
            icon: <Package className="size-5" />,
            tone: 2,
          },
        ]}
      />

      <CountSection
        title="Project handoff"
        counts={[
          {
            label: "Awaiting a PM",
            // Planning means opened and not started. The salesperson who
            // brought it in is the one who notices before the client does.
            ...countFields(planning),
            href: "/admin/dashboard/projects?status=Planning",
            hint: "Opened, not started",
            icon: <FolderKanban className="size-5" />,
            tone: 4,
          },
          {
            label: "Active projects",
            ...countFields(activeProjects),
            href: "/admin/dashboard/projects?status=Active",
            icon: <FolderKanban className="size-5" />,
            tone: 1,
          },
          {
            label: "My tasks",
            ...queryFields(reportQuery, report?.total),
            href: "/dashboard/tasks",
            icon: <ListChecks className="size-5" />,
            tone: 2,
          },
          {
            label: "Overdue",
            ...queryFields(reportQuery, report?.overdue_count),
            href: "/dashboard/tasks?overdue=true",
            icon: <ListChecks className="size-5" />,
            tone: 5,
          },
        ]}
      />

      <Card className="gap-0 overflow-hidden p-0">
        <CardHeader className="border-b px-5 py-4">
          <CardTitle className="text-base">Recently added</CardTitle>
          <p className="text-sm text-muted-foreground">
            The newest clients on the book, whoever brought them in.
          </p>
        </CardHeader>

        <PanelState
          query={recentQuery}
          errorMessage="Recent clients did not load."
          isEmpty={recent.length === 0}
          empty={
            <EmptyState
              icon={UserPlus}
              hint="Clients you add, and leads you win, show up here newest first."
              action={
                <Button asChild variant="outline" size="sm">
                  <Link href="/admin/dashboard/clients">Add a client</Link>
                </Button>
              }
            >
              No clients yet.
            </EmptyState>
          }
        >
          <ul className="divide-y">
            {recent.map((client) => (
              <li key={client.id}>
                <Link
                  href={`/admin/dashboard/clients/${client.id}`}
                  className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-muted/50"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{client.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {client.company || client.email || "—"}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    <RelativeTime value={client.created_at} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </PanelState>
      </Card>
    </div>
  )
}

export default SalesOverview
