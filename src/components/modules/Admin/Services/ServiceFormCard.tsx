"use client"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { IServiceCategory } from "@/types/agencio.types"
import { Plus, X } from "lucide-react"

/**
 * Adding or editing one thing the agency sells.
 *
 * The price says out loud that it is a starting point. Somebody who thinks this
 * is "the price" will eventually change it and expect old invoices to follow,
 * and they do not — every line keeps its own copy from the moment it is
 * written.
 */

export const NO_CATEGORY = "__none__"

export interface ServiceDraft {
  name: string
  description: string
  category_id: string
  default_price_usd: string
}

export const emptyService: ServiceDraft = {
  name: "",
  description: "",
  category_id: NO_CATEGORY,
  default_price_usd: "",
}

const ServiceFormCard = ({
  draft,
  categories,
  editing,
  isPending,
  onChange,
  onSubmit,
  onCancel,
}: {
  draft: ServiceDraft
  categories: IServiceCategory[]
  editing: boolean
  isPending: boolean
  onChange: (draft: ServiceDraft) => void
  onSubmit: () => void
  onCancel: () => void
}) => (
  <Card className="h-fit">
    <CardHeader className="pb-3">
      <CardTitle className="text-base">{editing ? "Edit service" : "New service"}</CardTitle>
    </CardHeader>

    <form
      className="space-y-4 px-6 pb-6"
      onSubmit={(event) => {
        event.preventDefault()
        if (!draft.name.trim()) return
        onSubmit()
      }}
    >
      <div className="space-y-1.5">
        <Label htmlFor="service-name">Name</Label>
        <Input
          id="service-name"
          value={draft.name}
          maxLength={80}
          onChange={(event) => onChange({ ...draft, name: event.target.value })}
          placeholder="Logo design"
          disabled={isPending}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="service-description">What it includes</Label>
        <Input
          id="service-description"
          value={draft.description}
          maxLength={300}
          onChange={(event) => onChange({ ...draft, description: event.target.value })}
          placeholder="Optional"
          disabled={isPending}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="service-category">Category</Label>
        <Select
          value={draft.category_id}
          onValueChange={(value) => onChange({ ...draft, category_id: value })}
          disabled={isPending}
        >
          <SelectTrigger id="service-category" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NO_CATEGORY}>Ungrouped</SelectItem>
            {categories
              .filter((category) => category.is_active)
              .map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="service-price">Usual price</Label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">$</span>
          <Input
            id="service-price"
            type="number"
            min={0}
            step="0.01"
            value={draft.default_price_usd}
            onChange={(event) => onChange({ ...draft, default_price_usd: event.target.value })}
            placeholder="0.00"
            disabled={isPending}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {/* Said here rather than discovered later: this fills the invoice line
              in, and the line keeps its own copy from then on. */}
          A starting point. Every invoice keeps the price it was written with, so
          changing this never alters one already sent. Leave it empty to type the
          number each time.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={isPending || !draft.name.trim()} className="flex-1">
          <Plus className="size-4" />
          {editing ? "Save changes" : "Add"}
        </Button>
        {editing && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onCancel}
            aria-label="Stop editing"
          >
            <X className="size-4" />
          </Button>
        )}
      </div>
    </form>
  </Card>
)

export default ServiceFormCard
