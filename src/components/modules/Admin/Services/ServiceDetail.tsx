"use client"

import EmptyState from "@/components/shared/state/EmptyState"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { formatUsd } from "@/lib/currency"
import { getService } from "@/services/agencio.services"
import type { IServiceDetail } from "@/types/agencio.types"
import { useQuery } from "@tanstack/react-query"
import { FolderKanban, Users } from "lucide-react"
import Link from "next/link"

/**
 * One service, and where it is actually being sold.
 *
 * The catalogue row on its own answers nothing somebody opens this for. The
 * question is who bought it and what it is running on — so the clients and the
 * projects are the page, and the price is a line in the header.
 *
 * What the service has EARNED is deliberately absent. Which clients bought it
 * is a sales fact; what it brought in is an income one, and that belongs on the
 * admin's revenue-by-service report.
 */
const ServiceDetail = ({ serviceId }: { serviceId: string }) => {
  const { data, isLoading } = useQuery({
    queryKey: ["service", serviceId],
    queryFn: () => getService(serviceId),
  })

  const service = data?.data as IServiceDetail | undefined

  if (isLoading && !service) return <Card className="h-64 animate-pulse bg-muted/40" />
  if (!service) return null

  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">{service.name}</h1>
          {service.category && <Badge variant="outline">{service.category.name}</Badge>}
          {!service.is_active && <Badge variant="secondary">not sold</Badge>}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {formatUsd(service.default_price_usd)} by default
          {service.description ? ` · ${service.description}` : ""}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="gap-0 overflow-hidden p-0">
          <CardHeader className="border-b px-5 py-4">
            <CardTitle className="text-base">Who bought it</CardTitle>
            <p className="text-sm text-muted-foreground">
              {/* Each client once, however many projects they run on it. */}
              {service.clients.length}{" "}
              {service.clients.length === 1 ? "client" : "clients"}
            </p>
          </CardHeader>

          {service.clients.length === 0 ? (
            <EmptyState icon={Users}>Nobody has bought this yet.</EmptyState>
          ) : (
            <ul className="divide-y">
              {service.clients.map((client) => (
                <li key={client.id}>
                  <Link
                    href={`/admin/dashboard/clients/${client.id}`}
                    className="block px-5 py-3 transition-colors hover:bg-muted/50"
                  >
                    <p className="text-sm font-medium">{client.name}</p>
                    {client.company && (
                      <p className="text-xs text-muted-foreground">{client.company}</p>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="gap-0 overflow-hidden p-0">
          <CardHeader className="border-b px-5 py-4">
            <CardTitle className="text-base">Where it is running</CardTitle>
            <p className="text-sm text-muted-foreground">
              {service.projects.length}{" "}
              {service.projects.length === 1 ? "project" : "projects"}
            </p>
          </CardHeader>

          {service.projects.length === 0 ? (
            <EmptyState icon={FolderKanban}>Not on any project yet.</EmptyState>
          ) : (
            <ul className="divide-y">
              {service.projects.map((project) => (
                <li key={project.id}>
                  <Link
                    href={`/admin/dashboard/projects/${project.id}`}
                    className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{project.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {project.code}
                        {project.client ? ` · ${project.client.name}` : ""}
                      </p>
                    </div>
                    {project.status && (
                      <Badge variant="outline" className="shrink-0 capitalize">
                        {project.status.name}
                      </Badge>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}

export default ServiceDetail
