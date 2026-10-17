"use client"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { IShareholderFormValues } from "@/zod/finance.validation"
import { useState } from "react"

const ShareholderFormCard = ({
  onSubmit,
  isPending,
}: {
  // Resolves true once the shareholder is saved.
  onSubmit: (values: IShareholderFormValues) => Promise<boolean>
  isPending: boolean
}) => {
  const [name, setName] = useState("")
  const [pct, setPct] = useState("")

  const handleAdd = async () => {
    if (await onSubmit({ name, share_pct: pct })) {
      setName("")
      setPct("")
    }
  }

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Add a shareholder</CardTitle>
      </CardHeader>

      <form
        className="space-y-4 px-6 pb-6"
        onSubmit={(event) => {
          event.preventDefault()
          if (!name.trim()) return
          void handleAdd()
        }}
      >
        <div className="space-y-1.5">
          <Label htmlFor="shareholder-name">Name</Label>
          <Input
            id="shareholder-name"
            value={name}
            maxLength={120}
            onChange={(event) => setName(event.target.value)}
            disabled={isPending}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="shareholder-pct">Share (%)</Label>
          <Input
            id="shareholder-pct"
            type="number"
            min={0}
            max={100}
            step="0.01"
            value={pct}
            placeholder="0"
            onChange={(event) => setPct(event.target.value)}
            disabled={isPending}
          />
          <p className="text-xs text-muted-foreground">
            Everybody still active has to add up to 100% or less. Retiring somebody
            frees their share for whoever takes it on.
          </p>
        </div>

        <Button type="submit" disabled={isPending || !name.trim()} className="w-full">
          Add
        </Button>
      </form>
    </Card>
  )
}

export default ShareholderFormCard
