"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";

type DataTableSearchProps = {
  initialValue?: string;
  placeholder?: string;
  debounceMs?: number;
  onDebouncedChange: (value: string) => void;
  isLoading?: boolean;
};

const DataTableSearch = ({
  initialValue = "",
  placeholder = "Search...",
  debounceMs = 400,
  onDebouncedChange,
}: DataTableSearchProps) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    // Skip the first run: firing on mount would re-request the list the page
    // has already loaded, and reset paging on every navigation.
    if (value === initialValue) return;

    const timer = setTimeout(() => onDebouncedChange(value), debounceMs);
    return () => clearTimeout(timer);
  }, [value, initialValue, debounceMs, onDebouncedChange]);

  return (
    <div className="relative w-full max-w-sm">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        className="pl-9"
      />
    </div>
  );
};

export default DataTableSearch;
