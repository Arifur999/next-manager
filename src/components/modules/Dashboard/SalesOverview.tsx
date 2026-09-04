"use client"

import CountSection from "@/components/shared/dashboard/CountSection"
import { useCount } from "@/components/shared/dashboard/useCount"
import EmptyState from "@/components/shared/state/EmptyState"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { getClients, getProjects, getServices, getTaskReport } from "@/services/agencio.services"
import type { IClient, ITaskReport } from "@/types/agencio.types"
import { useQuery } from "@tanstack/react-query"
import { formatDistanceToNow, parseISO } from "date-fns"
import { FolderKanban, ListChecks, Package, UserCheck, UserPlus, Users } from "lucide-react"
import Link from "next/link"

/**
 * What a salesperson opens the morning with.
 *
 * Client → Requirement → Service → Handoff, in that order, because that is the
 * order the work happens in. The handoff row is the one that matters most: a
 * project sitting in Planning is one nobody has picked up yet, and it is the
 * salesperson who notices before the client does.
 */
const SalesOverview = () => {
  const clients = useCount(["clients", "count"], () => getClients("limit=1"))
  const active = useCount(["clients", "count", "active"], () =>
    getClients("status=active&limit=1")
  )
  const inactive = useCount(["clients", "count", "inactive"], () =>
    getClients("status=inactive&limit=1")
  )
  const services = useCount(["services", "count"], () => getServices("limit=1"))

  const planning = useCount(["projects", "count", "planning"], () =>
    getProjects("status=Planning&limit=1")
  )
  const activeProjects = useCount(["projects", "count", "active"], () =>
    getProjects("status=Active&limit=1")
  )

  const { data: reportData } = useQuery({
    queryKey: ["task-report"],
    queryFn: () => getTaskReport(),
  })
  const report = reportData?.data as ITaskReport | undefined

  // The list, not just the number: "recently added" is a thing to act on, and a
  // count of it would say nothing useful.
  const { data: recentData } = useQuery({
    queryKey: ["clients", "recent"],
    queryFn: () => getClients("limit=5"),
  })
  const recent = (recentData?.data ?? []) as IClient[]

  return (
    <div className="space-y-6">
      <CountSection
        title="Sales overview"
        counts={[
          {
            label: "Total clients",
            value: clients,
            href: "/admin/dashboard/clients",
            icon: <Users className="size-5" />,
            tone: 1,
          },
          {
            label: "Active clients",
            value: active,
            href: "/admin/dashboard/clients?status=active",
            icon: <UserCheck className="size-5" />,
            tone: 3,
          },
          {
            label: "Inactive",
            value: inactive,
            href: "/admin/dashboard/clients?status=inactive",
            hint: "Worth a call",
            icon: <Users className="size-5" />,
            tone: 4,
          },
          {
            label: "Services",
            value: services,
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
            value: planning,
            href: "/admin/dashboard/projects?status=Planning",
            hint: "Opened, not started",
            icon: <FolderKanban className="size-5" />,
            tone: 4,
          },
          {
            label: "Active projects",
            value: activeProjects,
            href: "/admin/dashboard/projects?status=Active",
            icon: <FolderKanban className="size-5" />,
            tone: 1,
          },
          {
            label: "My tasks",
            value: report?.total,
            href: "/dashboard/tasks",
            icon: <ListChecks className="size-5" />,
            tone: 2,
          },
          {
            label: "Overdue",
            value: report?.overdue_count,
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

        {recent.length === 0 ? (
          <EmptyState icon={UserPlus}>No clients yet.</EmptyState>
        ) : (
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
                    {formatDistanceToNow(parseISO(client.created_at), { addSuffix: true })}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}

export default SalesOverview
