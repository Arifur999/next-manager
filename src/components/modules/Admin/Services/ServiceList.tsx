"use client"

import Link from "next/link"

import EmptyState from "@/components/shared/state/EmptyState"
import LoadingBlock from "@/components/shared/state/LoadingBlock"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { formatUsd } from "@/lib/currency"
import type { IService } from "@/types/agencio.types"
import { Package, Power, Trash2 } from "lucide-react"

/**
 * Everything on the catalogue.
 *
 * Each row says what is riding on it, because that is what decides whether it
 * can be deleted — and seeing "on 4 invoices" beforehand is better than finding
 * out by being refused.
 */
const ServiceList = ({
  services,
  isLoading,
  onEditable = true,
  onEdit,
  onToggle,
  onDelete,
}: {
  services: IService[]
  isLoading: boolean
  /** Whether the row actions appear. False for anybody the API refuses. */
  onEditable?: boolean
  onEdit: (service: IService) => void
  onToggle: (service: IService) => void
  onDelete: (service: IService) => void
}) => (
  <Card className="gap-0 overflow-hidden p-0">
    <CardHeader className="border-b px-5 py-4">
      <CardTitle className="text-base">Services</CardTitle>
      <p className="text-sm text-muted-foreground">
        Picked from when raising an invoice or opening a project.
      </p>
    </CardHeader>

    {isLoading && services.length === 0 ? (
      <LoadingBlock />
    ) : services.length === 0 ? (
      <EmptyState icon={Package} hint="Add one on the left and it appears in every invoice.">
        Nothing on the catalogue yet.
      </EmptyState>
    ) : (
      <ul className="divide-y">
        {services.map((service) => {
          const used =
            (service._count?.invoice_items ?? 0) +
            (service._count?.projects ?? 0) +
            (service._count?.template_items ?? 0)

          return (
            <li
              key={service.id}
              className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5"
            >
              <div className="min-w-48 flex-1">
                <p className="flex items-center gap-2 font-medium">
                  <Link
                    href={`/admin/dashboard/services/${service.id}`}
                    className="hover:underline"
                  >
                    {service.name}
                  </Link>
                  {service.category && (
                    <Badge variant="secondary">{service.category.name}</Badge>
                  )}
                  {!service.is_active && <Badge variant="outline">not sold</Badge>}
                </p>
                <p className="text-xs text-muted-foreground">
                  {service.default_price_usd > 0
                    ? formatUsd(service.default_price_usd)
                    : "priced each time"}
                  {service.description ? ` · ${service.description}` : ""}
                  {used > 0 ? ` · on ${used} ${used === 1 ? "thing" : "things"}` : ""}
                </p>
              </div>

              {onEditable && (
              <div className="flex items-center gap-1">
                <Button size="sm" variant="outline" onClick={() => onEdit(service)}>
                  Edit
                </Button>

                {/* Beside delete, because it is what the server tells you to do
                    the moment anything has been billed against it. */}
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => onToggle(service)}
                  aria-label={
                    service.is_active ? `Stop selling ${service.name}` : `Sell ${service.name} again`
                  }
                  title={service.is_active ? "Stop selling" : "Sell again"}
                >
                  <Power className="size-4" />
                </Button>

                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => onDelete(service)}
                  aria-label={`Delete ${service.name}`}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
              )}
            </li>
          )
        })}
      </ul>
    )}
  </Card>
)

export default ServiceList
