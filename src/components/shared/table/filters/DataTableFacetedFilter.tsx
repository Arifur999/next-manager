"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Check, PlusCircle } from "lucide-react";
import type { DataTableFilterOption } from "../dataTable.types";

interface DataTableFacetedFilterProps {
  title: string;
  options: DataTableFilterOption[];
  selected: string[];
  onChange: (values: string[]) => void;
  multiple: boolean;
  // Rows per option, known only for in-memory tables.
  facets?: Map<unknown, number>;
}

const DataTableFacetedFilter = ({ title, options, selected, onChange, multiple, facets }: DataTableFacetedFilterProps) => {
  const toggle = (value: string) => {
    const isSelected = selected.includes(value);
    if (!multiple) return onChange(isSelected ? [] : [value]);
    onChange(isSelected ? selected.filter((item) => item !== value) : [...selected, value]);
  };

  const selectedOptions = options.filter((option) => selected.includes(option.value));

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="border-dashed">
          <PlusCircle aria-hidden="true" />
          {title}
          {selected.length > 0 && (
            <>
              <Separator orientation="vertical" className="mx-1 h-4" />
              {selected.length > 2 ? (
                <Badge variant="secondary">{selected.length} selected</Badge>
              ) : (
                selectedOptions.map((option) => (
                  <Badge key={option.value} variant="secondary">
                    {option.label}
                  </Badge>
                ))
              )}
            </>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-60 p-0" align="start">
        <Command>
          <CommandInput placeholder={title} />
          <CommandList>
            <CommandEmpty>No matches.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selected.includes(option.value);
                const count = facets?.get(option.value);
                return (
                  <CommandItem key={option.value} onSelect={() => toggle(option.value)}>
                    <span
                      className={cn(
                        "flex size-4 items-center justify-center border",
                        multiple ? "rounded-sm" : "rounded-full",
                        isSelected ? "border-primary bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible",
                      )}
                    >
                      <Check className="size-3" aria-hidden="true" />
                    </span>
                    <span>{option.label}</span>
                    {isSelected && <span className="sr-only">(selected)</span>}
                    {count !== undefined && <span className="ml-auto font-mono text-xs text-muted-foreground">{count}</span>}
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {selected.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem onSelect={() => onChange([])} className="justify-center text-center">
                    Clear filter
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default DataTableFacetedFilter;
