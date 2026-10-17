"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { CalendarRange } from "lucide-react";
import { useId, useState } from "react";
import type { DateRangeValue } from "../dataTable.types";

interface DataTableDateRangeFilterProps {
  title: string;
  value: DateRangeValue | undefined;
  onChange: (value: DateRangeValue | undefined) => void;
}

const formatDay = (day: string) => format(new Date(`${day}T00:00:00`), "MMM d, yyyy");

const describeRange = ({ from, to }: DateRangeValue) => {
  if (from && to) return `${formatDay(from)} – ${formatDay(to)}`;
  if (from) return `From ${formatDay(from)}`;
  if (to) return `Until ${formatDay(to)}`;
  return "";
};

// Edits a draft and applies it on "Apply", so picking two dates costs one query, not two.
const DataTableDateRangeFilter = ({ title, value, onChange }: DataTableDateRangeFilterProps) => {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DateRangeValue>(value ?? {});
  const isActive = Boolean(value?.from || value?.to);
  const isInvalid = Boolean(draft.from && draft.to && draft.from > draft.to);

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) setDraft(value ?? {});
    setOpen(nextOpen);
  };

  const apply = (next: DateRangeValue | undefined) => {
    onChange(next?.from || next?.to ? next : undefined);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="border-dashed">
          <CalendarRange aria-hidden="true" />
          {title}
          {isActive && value && (
            <>
              <Separator orientation="vertical" className="mx-1 h-4" />
              <Badge variant="secondary">{describeRange(value)}</Badge>
            </>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-64 space-y-3" align="start">
        <div className="space-y-1.5">
          <Label htmlFor={`${id}-from`}>From</Label>
          <Input
            id={`${id}-from`}
            type="date"
            value={draft.from ?? ""}
            max={draft.to}
            onChange={(event) => setDraft((previous) => ({ ...previous, from: event.target.value || undefined }))}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${id}-to`}>To</Label>
          <Input
            id={`${id}-to`}
            type="date"
            value={draft.to ?? ""}
            min={draft.from}
            onChange={(event) => setDraft((previous) => ({ ...previous, to: event.target.value || undefined }))}
          />
        </div>
        {isInvalid && (
          <p role="alert" className="text-xs text-destructive">
            &ldquo;From&rdquo; must be on or before &ldquo;To&rdquo;.
          </p>
        )}
        <div className="flex justify-between gap-2">
          <Button variant="ghost" size="sm" onClick={() => apply(undefined)}>
            Clear
          </Button>
          <Button size="sm" disabled={isInvalid} onClick={() => apply(draft)}>
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default DataTableDateRangeFilter;
